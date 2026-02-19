from django.contrib import admin
from django.db.models import Count

from .models import Business


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner", "user_count", "product_count", "created_at")
    search_fields = ("name", "owner__email")
    list_select_related = ("owner",)

    # Loads owner relation and annotates user/product counts for list display columns.
    def get_queryset(self, request):
        return super().get_queryset(request).select_related("owner").annotate(
            user_count=Count("users", distinct=True),
            product_count=Count("products", distinct=True),
        )

    # Returns pre-annotated user count value for current business row.
    def user_count(self, obj):
        return obj.user_count

    # Returns pre-annotated product count value for current business row.
    def product_count(self, obj):
        return obj.product_count
