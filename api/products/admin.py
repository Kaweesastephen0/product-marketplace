from django.contrib import admin

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "business", "status", "price", "created_by", "created_at")
    list_filter = ("status", "business")
    search_fields = ("name", "business__name", "created_by__email")
    list_select_related = ("business", "created_by")
