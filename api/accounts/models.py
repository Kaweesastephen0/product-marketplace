from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

from accounts.constants import Roles


class Role(models.Model):
    code = models.CharField(max_length=32, unique=True, choices=Roles.CHOICES)
    name = models.CharField(max_length=64)
    description = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["code"]

    # Returns the human-readable role name in admin and logs.
    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    use_in_migrations = True

    # Converts role input (Role object/string/None) into a persisted Role instance.
    def _resolve_role(self, role):
        
        # Fetches an existing role by code or creates it with a default display name.
        def _get_or_seed(code):
            display = dict(Roles.CHOICES).get(code, code)
            role_obj, _ = Role.objects.get_or_create(code=code, defaults={"name": display})
            return role_obj

        if isinstance(role, Role):
            return role
        if isinstance(role, str):
            return _get_or_seed(role)
        return _get_or_seed(Roles.VIEWER)

    # Creates and saves a user with normalized email, resolved role, and hashed password.
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("The Email must be set")

        role_value = extra_fields.pop("role", None)
        role = self._resolve_role(role_value)
        email = self.normalize_email(email)
        user = self.model(email=email, username=email, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    # Creates a regular user with viewer role and non-staff flags by default.
    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("role", Roles.VIEWER)
        return self._create_user(email, password, **extra_fields)

    # Creates an admin superuser and validates required staff/superuser flags.
    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", Roles.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    email = models.EmailField(unique=True)
    business = models.ForeignKey(
        "businesses.Business",
        on_delete=models.PROTECT,
        related_name="users",
        null=True,
        blank=True,
    )
    role = models.ForeignKey(Role, on_delete=models.PROTECT, related_name="users")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        ordering = ["email"]

    @property
    # Returns the role code string for the related role, or None when unset.
    def role_code(self):
        return self.role.code if self.role_id else None

    # Returns True for superusers or when the user's role code matches the provided code.
    def has_role(self, role_code):
        return self.is_superuser or self.role_code == role_code

    # Returns the user's email for string representation.
    def __str__(self):
        return self.email


class AuditLog(models.Model):
    action = models.CharField(max_length=64, db_index=True)
    actor = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    business = models.ForeignKey(
        "businesses.Business",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    target_type = models.CharField(max_length=64)
    target_id = models.CharField(max_length=64)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["business", "action"]),
            models.Index(fields=["target_type", "target_id"]),
        ]

    # Returns a compact action/target label for audit log rows.
    def __str__(self):
        return f"{self.action} ({self.target_type}:{self.target_id})"
