from django.db.models import Count
from django.db.models.deletion import ProtectedError
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.api.permissions import IsBusinessOwner, IsSystemAdmin
from businesses.api.serializers import BusinessListSerializer, BusinessUpdateSerializer
from businesses.models import Business
from businesses.services import StatisticsService


class AdminStatisticsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def get(self, request):
        payload = StatisticsService.admin_statistics()
        return Response(payload, status=status.HTTP_200_OK)


class BusinessStatisticsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessOwner]

    def get(self, request):
        payload = StatisticsService.business_statistics(user=request.user)
        return Response(payload, status=status.HTTP_200_OK)


class BusinessListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]
    serializer_class = BusinessListSerializer
    queryset = (
        Business.objects.select_related("owner")
        .annotate(total_users=Count("users", distinct=True), total_products=Count("products", distinct=True))
        .order_by("name")
    )


class BusinessDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def patch(self, request, pk):
        business = Business.objects.filter(pk=pk).first()
        if not business:
            return Response({"detail": "Business not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = BusinessUpdateSerializer(business, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        output = (
            Business.objects.select_related("owner")
            .annotate(total_users=Count("users", distinct=True), total_products=Count("products", distinct=True))
            .filter(pk=business.pk)
            .first()
        )
        return Response(BusinessListSerializer(output).data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        business = Business.objects.filter(pk=pk).first()
        if not business:
            return Response({"detail": "Business not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            business.delete()
        except ProtectedError:
            return Response(
                {"detail": "Cannot delete business with linked users. Remove or reassign users first."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)
