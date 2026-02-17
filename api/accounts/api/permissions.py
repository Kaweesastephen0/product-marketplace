from rest_framework.permissions import BasePermission

from accounts.constants import Roles


class IsSystemAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.has_role(Roles.ADMIN))


class IsBusinessOwner(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.has_role(Roles.BUSINESS_OWNER))


class IsAdminOrBusinessOwner(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.has_role(Roles.ADMIN) or user.has_role(Roles.BUSINESS_OWNER))
        )


class IsBusinessScopedObject(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.has_role(Roles.ADMIN):
            return True
        return obj.business_id == user.business_id
