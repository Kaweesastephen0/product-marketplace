from rest_framework.permissions import BasePermission

from accounts.constants import Roles


class IsSystemAdmin(BasePermission):
    # Allows access only to authenticated users with admin role.
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.has_role(Roles.ADMIN))


class IsBusinessOwner(BasePermission):
    # Allows access only to authenticated users with business_owner role.
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.has_role(Roles.BUSINESS_OWNER))


class IsAdminOrBusinessOwner(BasePermission):
    # Allows access only to authenticated admins and business owners.
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.has_role(Roles.ADMIN) or user.has_role(Roles.BUSINESS_OWNER))
        )


class IsBusinessScopedObject(BasePermission):
    # Allows admins for any object, otherwise restricts object access to matching business.
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.has_role(Roles.ADMIN):
            return True
        return obj.business_id == user.business_id
