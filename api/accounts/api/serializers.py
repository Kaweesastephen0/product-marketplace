from django.contrib.auth import get_user_model
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from accounts.constants import OWNER_MANAGED_ROLES, Roles
from accounts.models import AuditLog
from businesses.models import Business

User = get_user_model()


class UserReadSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source="role.code", read_only=True)
    business_name = serializers.CharField(source="business.name", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "date_joined",
            "business_id",
            "business_name",
        )
        read_only_fields = fields


class AuditLogReadSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source="actor.email", read_only=True)
    business_name = serializers.CharField(source="business.name", read_only=True)

    class Meta:
        model = AuditLog
        fields = (
            "id",
            "action",
            "actor_email",
            "business_id",
            "business_name",
            "target_type",
            "target_id",
            "metadata",
            "created_at",
        )
        read_only_fields = fields


class BusinessOwnerCreateSerializer(serializers.Serializer):
    business_name = serializers.CharField(max_length=255)
    owner_email = serializers.EmailField()
    owner_password = serializers.CharField(write_only=True, min_length=8)
    owner_first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    owner_last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)


class OwnerUserCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    role = serializers.ChoiceField(choices=Roles.CHOICES)
    business_id = serializers.IntegerField(required=False)


class OwnerUserUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=[(role, role) for role in sorted(OWNER_MANAGED_ROLES)], required=False)
    is_active = serializers.BooleanField(required=False)


class AdminUserUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    role = serializers.ChoiceField(choices=Roles.CHOICES, required=False)
    is_active = serializers.BooleanField(required=False)
    business_id = serializers.IntegerField(required=False, allow_null=True)


class SelfProfileUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    current_password = serializers.CharField(required=False, write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(required=False, write_only=True, min_length=8, trim_whitespace=False)
    confirm_new_password = serializers.CharField(required=False, write_only=True, trim_whitespace=False)

    # Validates password-change inputs and enforces current/new/confirm dependency rules.
    def validate(self, attrs):
        has_new_password = "new_password" in attrs and attrs.get("new_password")
        has_current_password = "current_password" in attrs and attrs.get("current_password")
        has_confirm_password = "confirm_new_password" in attrs and attrs.get("confirm_new_password")

        if has_new_password and not has_current_password:
            raise serializers.ValidationError({"current_password": "Current password is required."})

        if has_current_password and not has_new_password:
            raise serializers.ValidationError({"new_password": "New password is required."})

        if has_new_password and not has_confirm_password:
            raise serializers.ValidationError({"confirm_new_password": "Please confirm your new password."})

        if has_new_password and attrs["new_password"] != attrs["confirm_new_password"]:
            raise serializers.ValidationError({"confirm_new_password": "New passwords do not match."})

        return attrs


class ViewerRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    business_id = serializers.IntegerField(required=False, allow_null=True)

    # Verifies that provided business_id exists when a viewer chooses a business.
    def validate_business_id(self, value):
        if value is None:
            return value
        if not Business.objects.filter(id=value).exists():
            raise serializers.ValidationError("Business does not exist.")
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Blocks login for suspended users even when the password is correct.
    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            user = User.objects.filter(email__iexact=email).first()
            if user and not user.is_active and user.check_password(password):
                raise AuthenticationFailed("Account suspended")

        return super().validate(attrs)
