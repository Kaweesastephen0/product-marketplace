from rest_framework.permissions import BasePermission

from accounts.constants import Roles
from products.models import ProductStatus


class IsProductActionAllowed(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False

        if user.has_role(Roles.ADMIN):
            return True

        action = getattr(view, "action", None)

        if action in {"list", "retrieve"}:
            return user.role_code in {
                Roles.BUSINESS_OWNER,
                Roles.EDITOR,
                Roles.APPROVER,
                Roles.VIEWER,
            }
        if action in {"create", "update", "partial_update", "submit_for_approval"}:
            return user.role_code in {Roles.BUSINESS_OWNER, Roles.EDITOR}
        if action in {"approve", "reject"}:
            return user.role_code == Roles.APPROVER
        if action == "destroy":
            return False
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.has_role(Roles.ADMIN):
            return True
        if obj.business_id != user.business_id:
            return False
        if user.role_code == Roles.VIEWER:
            return obj.status == ProductStatus.APPROVED
        return True
