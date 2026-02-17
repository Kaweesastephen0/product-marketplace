from rest_framework import serializers

from businesses.models import Business
from products.models import Product


class ProductListSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)
    business_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "description",
            "price",
            "status",
            "business_id",
            "created_by_email",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class ProductWriteSerializer(serializers.ModelSerializer):
    business = serializers.PrimaryKeyRelatedField(
        queryset=Business.objects.all(),
        required=False,
        write_only=True,
    )

    class Meta:
        model = Product
        fields = ("name", "description", "price", "business")

class PublicProductSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source="business.name", read_only=True)

    class Meta:
        model = Product
        fields = ("id", "name", "description", "price", "business_name", "updated_at")
        read_only_fields = fields
