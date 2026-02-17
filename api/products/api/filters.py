import django_filters

from products.models import Product


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    business_id = django_filters.NumberFilter(field_name="business_id")

    class Meta:
        model = Product
        fields = ["status", "business_id", "min_price", "max_price"]
