from django.conf import settings
from django.db import models


class ProductStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PENDING_APPROVAL = "pending_approval", "Pending Approval"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    image = models.FileField(upload_to="products/images/", blank=True, null=True)
    image_url = models.URLField(blank=True)
    status = models.CharField(
        max_length=32,
        choices=ProductStatus.choices,
        default=ProductStatus.DRAFT,
        db_index=True,
    )
    rejection_reason = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="products_created",
    )
    business = models.ForeignKey(
        "businesses.Business",
        on_delete=models.CASCADE,
        related_name="products",
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["business", "status"]),
            models.Index(fields=["status"]),
        ]

    # Returns product name for admin lists and string casting.
    def __str__(self) -> str:
        return self.name
