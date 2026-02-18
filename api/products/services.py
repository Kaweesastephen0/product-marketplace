from django.core.cache import cache
from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError

from accounts.constants import PRODUCT_APPROVE_ROLES, PRODUCT_EDIT_ROLES, Roles
from accounts.services import AuditService
from products.models import ProductStatus


class ProductService:
    @staticmethod
    def _invalidate_public_product_cache():
        cache.delete("public_product_ids")

    @staticmethod
    @transaction.atomic
    def create_product(*, user, validated_data):
        if user.role_code not in PRODUCT_EDIT_ROLES and not user.is_superuser:
            raise PermissionDenied("You do not have permission to create products.")
        if not user.business_id and not user.has_role(Roles.ADMIN):
            raise ValidationError("User must belong to a business.")

        requested_business = validated_data.pop("business", None)
        business = user.business
        if user.has_role(Roles.ADMIN) and requested_business is not None:
            business = requested_business
        if business is None:
            raise ValidationError("Business must be provided.")

        if validated_data.get("image") is not None:
            validated_data["image_url"] = ""

        product = business.products.create(
            created_by=user,
            status=ProductStatus.DRAFT,
            rejection_reason="",
            **validated_data,
        )
        ProductService._invalidate_public_product_cache()
        AuditService.log(
            action="product_created",
            actor=user,
            business=product.business,
            target_type="product",
            target_id=product.id,
            metadata={"status": product.status},
        )
        return product

    @staticmethod
    @transaction.atomic
    def update_product(*, user, product, validated_data):
        if user.role_code not in PRODUCT_EDIT_ROLES and not user.is_superuser:
            raise PermissionDenied("You do not have permission to edit products.")
        if user.role_code == Roles.EDITOR and product.status == ProductStatus.PENDING_APPROVAL:
            raise ValidationError("Pending approval products cannot be edited by editors.")

        if validated_data.get("image") is not None:
            validated_data["image_url"] = ""
        elif validated_data.get("image_url"):
            validated_data["image"] = None

        requested_business = validated_data.pop("business", None)
        if requested_business is not None and not user.has_role(Roles.ADMIN):
            raise PermissionDenied("Only admins can re-assign product business.")
        if requested_business is not None and user.has_role(Roles.ADMIN):
            product.business = requested_business

        for field, value in validated_data.items():
            setattr(product, field, value)

        if product.status == ProductStatus.APPROVED:
            product.status = ProductStatus.PENDING_APPROVAL
        if product.status in {ProductStatus.DRAFT, ProductStatus.PENDING_APPROVAL}:
            product.rejection_reason = ""

        product.save()
        ProductService._invalidate_public_product_cache()
        AuditService.log(
            action="product_updated",
            actor=user,
            business=product.business,
            target_type="product",
            target_id=product.id,
            metadata={"status": product.status},
        )
        return product

    @staticmethod
    @transaction.atomic
    def submit_for_approval(*, user, product):
        if user.role_code not in PRODUCT_EDIT_ROLES and not user.is_superuser:
            raise PermissionDenied("You do not have permission to submit products.")

        if product.status not in {ProductStatus.DRAFT, ProductStatus.REJECTED}:
            raise ValidationError("Only draft or rejected products can be submitted for approval.")

        product.status = ProductStatus.PENDING_APPROVAL
        product.rejection_reason = ""
        product.save(update_fields=["status", "rejection_reason", "updated_at"])
        ProductService._invalidate_public_product_cache()
        AuditService.log(
            action="product_submitted",
            actor=user,
            business=product.business,
            target_type="product",
            target_id=product.id,
            metadata={"status": product.status},
        )
        return product

    @staticmethod
    @transaction.atomic
    def approve_product(*, user, product):
        if user.role_code not in PRODUCT_APPROVE_ROLES and not user.is_superuser:
            raise PermissionDenied("Only approver/admin role can approve products.")
        if product.status != ProductStatus.PENDING_APPROVAL:
            raise ValidationError("Only pending products can be approved.")

        product.status = ProductStatus.APPROVED
        product.save(update_fields=["status", "updated_at"])
        ProductService._invalidate_public_product_cache()
        AuditService.log(
            action="product_approved",
            actor=user,
            business=product.business,
            target_type="product",
            target_id=product.id,
            metadata={"status": product.status},
        )
        return product

    @staticmethod
    @transaction.atomic
    def reject_product(*, user, product, reason):
        if user.role_code not in PRODUCT_APPROVE_ROLES and not user.is_superuser:
            raise PermissionDenied("Only approver/admin role can reject products.")
        if product.status != ProductStatus.PENDING_APPROVAL:
            raise ValidationError("Only pending products can be rejected.")
        if not reason or not str(reason).strip():
            raise ValidationError("Rejection reason is required.")

        product.status = ProductStatus.REJECTED
        product.rejection_reason = str(reason).strip()
        product.save(update_fields=["status", "rejection_reason", "updated_at"])
        ProductService._invalidate_public_product_cache()
        AuditService.log(
            action="product_rejected",
            actor=user,
            business=product.business,
            target_type="product",
            target_id=product.id,
            metadata={"status": product.status, "reason": product.rejection_reason},
        )
        return product

    @staticmethod
    @transaction.atomic
    def delete_product(*, user, product):
        if not user.has_role(Roles.ADMIN):
            raise PermissionDenied("Only admin role can delete products.")
        AuditService.log(
            action="product_deleted",
            actor=user,
            business=product.business,
            target_type="product",
            target_id=product.id,
            metadata={"status": product.status},
        )
        product.delete()
        ProductService._invalidate_public_product_cache()
