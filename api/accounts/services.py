from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError

from accounts.constants import OWNER_MANAGED_ROLES, Roles
from accounts.models import AuditLog, Role
from businesses.models import Business

User = get_user_model()


class AuditService:
    @staticmethod
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
    def create_business_owner(*, actor, business_name, owner_email, owner_password):
        if not actor.has_role(Roles.ADMIN):
            raise PermissionDenied("Only admins can create business owners.")

        business = Business.objects.create(name=business_name)
        owner = User.objects.create_user(
            email=owner_email,
            password=owner_password,
            role=Roles.BUSINESS_OWNER,
            business=business,
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
    def create_business_user(*, actor, email, password, role, business_id=None):
        if role == Roles.BUSINESS_OWNER and not actor.has_role(Roles.ADMIN):
            raise PermissionDenied("Only admins can create business owners.")

        if actor.has_role(Roles.BUSINESS_OWNER):
            if role not in OWNER_MANAGED_ROLES:
                raise PermissionDenied("Business owners can only create editor/approver users.")
            business = actor.business
        elif actor.has_role(Roles.ADMIN):
            if role == Roles.BUSINESS_OWNER:
                raise ValidationError("Use create-business-owner endpoint for owner accounts.")
            if role == Roles.ADMIN:
                business = None
            elif business_id:
                business = Business.objects.filter(id=business_id).first()
            else:
                business = actor.business
        else:
            raise PermissionDenied("You do not have permission to create users.")

        if role != Roles.ADMIN and not business:
            raise ValidationError("Business is required.")

        user = User.objects.create_user(
            email=email,
            password=password,
            role=role,
            business=business,
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
    def update_business_user(*, actor, user, role=None, is_active=None):
        if actor.has_role(Roles.BUSINESS_OWNER):
            if user.business_id != actor.business_id:
                raise PermissionDenied("Cross-business updates are blocked.")
            if role and role not in OWNER_MANAGED_ROLES:
                raise PermissionDenied("Business owners can only assign editor/approver roles.")
        elif not actor.has_role(Roles.ADMIN):
            raise PermissionDenied("You do not have permission to update users.")

        update_fields = []
        if role is not None:
            user.role = Role.objects.get(code=role)
            update_fields.append("role")
        if is_active is not None:
            user.is_active = is_active
            update_fields.append("is_active")

        if update_fields:
            if user.role_code != Roles.ADMIN and user.business_id is None:
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
    def self_register_viewer(*, email, password, business):
        user = User.objects.create_user(
            email=email,
            password=password,
            role=Roles.VIEWER,
            business=business,
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
