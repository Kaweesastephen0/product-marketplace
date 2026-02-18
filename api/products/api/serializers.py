from rest_framework import serializers

from businesses.models import Business
from products.models import Product


class ProductListSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)
    business_id = serializers.IntegerField(read_only=True)
    image_file_url = serializers.SerializerMethodField()
    display_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "description",
            "price",
            "image_url",
            "image_file_url",
            "display_image_url",
            "status",
            "rejection_reason",
            "business_id",
            "created_by_email",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_image_file_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        if request is None:
            return obj.image.url
        return request.build_absolute_uri(obj.image.url)

    def get_display_image_url(self, obj):
        return self.get_image_file_url(obj) or obj.image_url or None


class ProductWriteSerializer(serializers.ModelSerializer):
    business = serializers.PrimaryKeyRelatedField(
        queryset=Business.objects.all(),
        required=False,
        write_only=True,
    )
    image = serializers.FileField(required=False, allow_null=True)
    image_url = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = Product
        fields = ("name", "description", "price", "business", "image", "image_url")

    def validate(self, attrs):
        if attrs.get("image") is not None and attrs.get("image_url"):
            raise serializers.ValidationError("Provide either an image upload or an image URL, not both.")
        return attrs

class PublicProductSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source="business.name", read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ("id", "name", "description", "price", "business_name", "image_url", "updated_at")
        read_only_fields = fields

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request is None:
                return obj.image.url
            return request.build_absolute_uri(obj.image.url)
        return obj.image_url or None
