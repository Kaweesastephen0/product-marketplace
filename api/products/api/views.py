from django.core.cache import cache
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from accounts.constants import Roles
from products.api.filters import ProductFilter
from products.api.permissions import IsProductActionAllowed
from products.api.serializers import ProductListSerializer, ProductWriteSerializer, PublicProductSerializer
from products.models import Product, ProductStatus
from products.services import ProductService


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsProductActionAllowed]
    filterset_class = ProductFilter
    search_fields = ["name", "description"]
    ordering_fields = ["created_at", "updated_at", "price"]
    ordering = ["-created_at"]

    # Returns product queryset scoped by tenant and role-specific visibility rules.
    def get_queryset(self):
        queryset = Product.objects.select_related("created_by", "business")
        user = self.request.user

        if not user.has_role(Roles.ADMIN):
            queryset = queryset.filter(business_id=user.business_id)
            if user.role_code == Roles.EDITOR:
                queryset = queryset.filter(created_by_id=user.id)
            if user.role_code == Roles.VIEWER:
                queryset = queryset.filter(status=ProductStatus.APPROVED)

        return queryset

    # Selects write serializer for mutating actions and read serializer otherwise.
    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return ProductWriteSerializer
        return ProductListSerializer

    # Converts path param to int and fetches scoped product or raises 404 for invalid/cross-tenant IDs.
    def _get_scoped_product(self, pk):
        try:
            product_id = int(pk)
        except (TypeError, ValueError):
            raise Http404
        return get_object_or_404(self.get_queryset(), pk=product_id)

    # Validates create payload, creates product through service layer, and returns read serializer data.
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = ProductService.create_product(user=request.user, validated_data=serializer.validated_data)
        return Response(ProductListSerializer(product, context={"request": request}).data, status=status.HTTP_201_CREATED)

    # Applies partial product updates through service layer and returns updated product payload.
    def partial_update(self, request, *args, **kwargs):
        product = self._get_scoped_product(kwargs["pk"])
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = ProductService.update_product(
            user=request.user,
            product=product,
            validated_data=serializer.validated_data,
        )
        return Response(ProductListSerializer(updated, context={"request": request}).data, status=status.HTTP_200_OK)

    # Replaces updatable product fields through service layer and returns updated product payload.
    def update(self, request, *args, **kwargs):
        product = self._get_scoped_product(kwargs["pk"])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated = ProductService.update_product(
            user=request.user,
            product=product,
            validated_data=serializer.validated_data,
        )
        return Response(ProductListSerializer(updated, context={"request": request}).data, status=status.HTTP_200_OK)

    # Deletes the scoped product via service layer.
    def destroy(self, request, *args, **kwargs):
        product = self._get_scoped_product(kwargs["pk"])
        ProductService.delete_product(user=request.user, product=product)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="approve")
    # Approves the scoped product and returns the resulting product state.
    def approve(self, request, pk=None):
        product = self._get_scoped_product(pk)
        product = ProductService.approve_product(user=request.user, product=product)
        return Response(ProductListSerializer(product, context={"request": request}).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="reject")
    # Rejects the scoped product with request reason and returns updated product state.
    def reject(self, request, pk=None):
        product = self._get_scoped_product(pk)
        product = ProductService.reject_product(
            user=request.user,
            product=product,
            reason=request.data.get("reason"),
        )
        return Response(ProductListSerializer(product, context={"request": request}).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="submit")
    # Submits a draft/rejected product for approval and returns updated status.
    def submit_for_approval(self, request, pk=None):
        product = self._get_scoped_product(pk)
        product = ProductService.submit_for_approval(user=request.user, product=product)
        return Response(ProductListSerializer(product, context={"request": request}).data, status=status.HTTP_200_OK)


class PublicProductViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = PublicProductSerializer

    # Returns approved products ordered by update time, using cached ID list for faster public reads.
    def get_queryset(self):
        cached_ids = cache.get("public_product_ids")
        if cached_ids is None:
            cached_ids = list(
                Product.objects.filter(status=ProductStatus.APPROVED)
                .order_by("-updated_at")
                .values_list("id", flat=True)
            )
            cache.set("public_product_ids", cached_ids, timeout=60)

        return (
            Product.objects.filter(id__in=cached_ids, status=ProductStatus.APPROVED)
            .select_related("business")
            .only("id", "name", "description", "price", "updated_at", "image", "image_url", "business__name")
            .order_by("-updated_at")
        )
