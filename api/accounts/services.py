from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError

from accounts.constants import OWNER_MANAGED_ROLES, Roles
from accounts.models import AuditLog, Role
from businesses.models import Business

User = get_user_model()
_UNSET = object()


class AuditService:
    @staticmethod
    # Persists an audit trail entry with actor, target, business scope, and metadata.
    def log(*, action, actor=None, business=None, target_type, target_id, metadata=None):
        AuditLog.objects.create(
            action=action,
            actor=actor,
            business=business,
            target_type=target_type,
            target_id=str(target_id),
            metadata=metadata or {},
        )


class UserService:
    @staticmethod
    @transaction.atomic
    # Creates a business and its owner user, then links owner to business and records audit log.
    def create_business_owner(
        *,
        actor,
        business_name,
        owner_email,
        owner_password,
        owner_first_name="",
        owner_last_name="",
    ):
        if not actor.has_role(Roles.ADMIN):
            raise PermissionDenied("Only admins can create business owners.")

        business = Business.objects.create(name=business_name)
        owner = User.objects.create_user(
            email=owner_email,
            password=owner_password,
            role=Roles.BUSINESS_OWNER,
            business=business,
            first_name=owner_first_name,
            last_name=owner_last_name,
        )
        business.owner = owner
        business.save(update_fields=["owner"])

        AuditService.log(
            action="business_owner_created",
            actor=actor,
            business=business,
            target_type="user",
            target_id=owner.id,
            metadata={"business_id": business.id, "role": Roles.BUSINESS_OWNER},
        )
        return owner

    @staticmethod
    @transaction.atomic
    # Creates a user with role/business rules based on whether actor is admin or business owner.
    def create_business_user(*, actor, email, password, role, business_id=None, first_name="", last_name=""):
        if role == Roles.BUSINESS_OWNER and not actor.has_role(Roles.ADMIN):
            raise PermissionDenied("Only admins can create business owners.")

        if actor.has_role(Roles.ADMIN):
            if role == Roles.BUSINESS_OWNER:
                raise ValidationError("Use create-business-owner endpoint for owner accounts.")
            if role == Roles.ADMIN:
                business = None
            elif business_id:
                business = Business.objects.filter(id=business_id).first()
            else:
                business = actor.business
        elif actor.has_role(Roles.BUSINESS_OWNER):
            if role not in OWNER_MANAGED_ROLES:
                raise PermissionDenied("Business owners can only create editor/approver users.")
            business = actor.business
        else:
            raise PermissionDenied("You do not have permission to create users.")

        if role not in {Roles.ADMIN, Roles.VIEWER} and not business:
            raise ValidationError("Business is required.")

        user = User.objects.create_user(
            email=email,
            password=password,
            role=role,
            business=business,
            first_name=first_name,
            last_name=last_name,
        )

        AuditService.log(
            action="user_created",
            actor=actor,
            business=business,
            target_type="user",
            target_id=user.id,
            metadata={"role": role},
        )
        return user

    @staticmethod
    @transaction.atomic
    # Updates user identity, role, status, and business fields with role-based edit constraints.
    def update_business_user(
        *,
        actor,
        user,
        email=_UNSET,
        role=None,
        is_active=None,
        first_name=_UNSET,
        last_name=_UNSET,
        business_id=_UNSET,
    ):
        if actor.has_role(Roles.ADMIN):
            pass
        elif actor.has_role(Roles.BUSINESS_OWNER):
            if user.business_id != actor.business_id:
                raise PermissionDenied("Cross-business updates are blocked.")
            if role and role not in OWNER_MANAGED_ROLES:
                raise PermissionDenied("Business owners can only assign editor/approver roles.")
        else:
            raise PermissionDenied("You do not have permission to update users.")

        update_fields = []
        if email is not _UNSET:
            normalized_email = User.objects.normalize_email(email)
            if User.objects.exclude(id=user.id).filter(email__iexact=normalized_email).exists():
                raise ValidationError("A user with that email already exists.")
            user.email = normalized_email
            user.username = normalized_email
            update_fields.extend(["email", "username"])
        if role is not None:
            user.role = Role.objects.get(code=role)
            update_fields.append("role")
        if is_active is not None:
            user.is_active = is_active
            update_fields.append("is_active")
        if first_name is not _UNSET:
            user.first_name = first_name
            update_fields.append("first_name")
        if last_name is not _UNSET:
            user.last_name = last_name
            update_fields.append("last_name")
        if actor.has_role(Roles.ADMIN) and business_id is not _UNSET:
            if business_id is None:
                user.business = None
            else:
                business = Business.objects.filter(id=business_id).first()
                if not business:
                    raise ValidationError("Business does not exist.")
                user.business = business
            update_fields.append("business")

        if user.role_code == Roles.ADMIN and user.business_id is not None:
            user.business = None
            if "business" not in update_fields:
                update_fields.append("business")

        if update_fields:
            if user.role_code not in {Roles.ADMIN, Roles.VIEWER} and user.business_id is None:
                raise ValidationError("Non-admin users must belong to a business.")
            user.save(update_fields=update_fields)
            AuditService.log(
                action="user_updated",
                actor=actor,
                business=user.business,
                target_type="user",
                target_id=user.id,
                metadata={"updated_fields": update_fields},
            )
        return user

    @staticmethod
    @transaction.atomic
    # Deletes a user after enforcing actor permissions and emits an audit log entry.
    def delete_business_user(*, actor, user):
        if actor.has_role(Roles.ADMIN):
            if user.role_code == Roles.ADMIN:
                raise ValidationError("Admin users cannot be deleted.")
        elif actor.has_role(Roles.BUSINESS_OWNER):
            if user.business_id != actor.business_id:
                raise PermissionDenied("Cross-business deletes are blocked.")
            if user.role_code not in OWNER_MANAGED_ROLES:
                raise PermissionDenied("Business owners can only delete editor/approver users.")
        else:
            raise PermissionDenied("You do not have permission to delete users.")

        user_id = user.id
        user_role = user.role_code
        user_business = user.business
        user.delete()

        AuditService.log(
            action="user_deleted",
            actor=actor,
            business=user_business,
            target_type="user",
            target_id=user_id,
            metadata={"role": user_role},
        )

    @staticmethod
    @transaction.atomic
    # Registers a viewer account (optionally linked to a business) and writes an audit event.
    def self_register_viewer(*, email, password, first_name="", last_name="", business=None):
        user = User.objects.create_user(
            email=email,
            password=password,
            role=Roles.VIEWER,
            business=business,
            first_name=first_name,
            last_name=last_name,
        )
        AuditService.log(
            action="viewer_registered",
            actor=user,
            business=business,
            target_type="user",
            target_id=user.id,
            metadata={"role": Roles.VIEWER},
        )
        return user
