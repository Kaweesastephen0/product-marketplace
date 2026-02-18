from rest_framework import serializers

from businesses.models import Business


class BusinessListSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True, allow_null=True)
    total_users = serializers.IntegerField(read_only=True)
    total_products = serializers.IntegerField(read_only=True)

    class Meta:
        model = Business
        fields = ("id", "name", "owner_email", "total_users", "total_products")
        read_only_fields = fields


class BusinessUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = ("name",)
