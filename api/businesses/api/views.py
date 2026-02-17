from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.api.permissions import IsBusinessOwner, IsSystemAdmin
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
