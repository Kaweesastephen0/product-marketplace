from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.constants import OWNER_MANAGED_ROLES, Roles
from businesses.models import Business

User = get_user_model()


class UserReadSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source="role.code", read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "role", "is_active", "date_joined", "business_id")
        read_only_fields = fields


class BusinessOwnerCreateSerializer(serializers.Serializer):
    business_name = serializers.CharField(max_length=255)
    owner_email = serializers.EmailField()
    owner_password = serializers.CharField(write_only=True, min_length=8)


class OwnerUserCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=Roles.CHOICES)
    business_id = serializers.IntegerField(required=False)


class OwnerUserUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=[(role, role) for role in sorted(OWNER_MANAGED_ROLES)], required=False)
    is_active = serializers.BooleanField(required=False)


class AdminUserUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=Roles.CHOICES, required=False)
    is_active = serializers.BooleanField(required=False)


class ViewerRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    business_id = serializers.IntegerField()

    def validate_business_id(self, value):
        if not Business.objects.filter(id=value).exists():
            raise serializers.ValidationError("Business does not exist.")
        return value
