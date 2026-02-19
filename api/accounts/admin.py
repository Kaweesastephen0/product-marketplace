from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import AuditLog, Role, User


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    # Shows role identity fields in the admin list page and supports role search.
    list_display = ("id", "code", "name")
    search_fields = ("code", "name")


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    # Displays core user account fields and tenant assignment in Django admin.
    list_display = ("id", "email", "business", "role", "is_staff", "is_active")

    # Provides quick filters for role and staff/superuser/account state.
    list_filter = ("role", "is_staff", "is_superuser", "is_active")

    # Enables admin search by user email.
    search_fields = ("email",)

    # Sorts users alphabetically by email.
    ordering = ("email",)

    # Controls sections and fields shown when editing an existing user record.
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Business", {"fields": ("business", "role")}),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    # Controls fields shown when creating a new user from Django admin.
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "business", "role", "password1", "password2"),
            },
        ),
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):

    # Lists audit log metadata and related actor/business details in admin.
    list_display = ("id", "action", "actor", "business", "target_type", "target_id", "created_at")
   
    # Allows filtering logs by action type and business scope.
    list_filter = ("action", "business")
   
    # Enables searching logs by target info and actor email.
    search_fields = ("target_type", "target_id", "actor__email")
   
    # Fetches related actor and business in one query for better admin performance.
    list_select_related = ("actor", "business")
