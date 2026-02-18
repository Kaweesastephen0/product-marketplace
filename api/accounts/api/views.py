from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.api.permissions import IsAdminOrBusinessOwner, IsSystemAdmin
from accounts.api.serializers import (
    AdminUserUpdateSerializer,
    BusinessOwnerCreateSerializer,
    CustomTokenObtainPairSerializer,
    OwnerUserCreateSerializer,
    OwnerUserUpdateSerializer,
    SelfProfileUpdateSerializer,
    UserReadSerializer,
    ViewerRegistrationSerializer,
)
from accounts.constants import Roles
from accounts.services import UserService
from businesses.models import Business

User = get_user_model()


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response({"detail": "Invalid refresh token."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_205_RESET_CONTENT)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "id": request.user.id,
                "email": request.user.email,
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
                "role": request.user.role_code,
                "is_active": request.user.is_active,
                "business_id": request.user.business_id,
                "business_name": request.user.business.name if request.user.business_id else None,
                "date_joined": request.user.date_joined,
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        serializer = SelfProfileUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        user = request.user

        update_fields = []
        if "first_name" in validated:
            user.first_name = validated.get("first_name", "")
            update_fields.append("first_name")
        if "last_name" in validated:
            user.last_name = validated.get("last_name", "")
            update_fields.append("last_name")

        new_password = validated.get("new_password")
        if new_password:
            current_password = validated.get("current_password")
            if not user.check_password(current_password):
                return Response(
                    {"current_password": ["Current password is incorrect."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.set_password(new_password)
            update_fields.append("password")

        if update_fields:
            user.save(update_fields=update_fields)

        return Response(
            {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role_code,
                "is_active": user.is_active,
                "business_id": user.business_id,
                "business_name": user.business.name if user.business_id else None,
                "date_joined": user.date_joined,
            },
            status=status.HTTP_200_OK,
        )


class CreateBusinessOwnerAPIView(generics.GenericAPIView):
    permission_classes = [IsSystemAdmin]
    serializer_class = BusinessOwnerCreateSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        owner = UserService.create_business_owner(actor=request.user, **serializer.validated_data)
        output = UserReadSerializer(owner)
        return Response(output.data, status=status.HTTP_201_CREATED)


class BusinessUsersAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrBusinessOwner]

    def get_queryset(self, request):
        if request.user.has_role(Roles.ADMIN):
            return User.objects.select_related("business", "role").all()
        return User.objects.filter(business_id=request.user.business_id).select_related("business", "role")

    def post(self, request):
        serializer = OwnerUserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = UserService.create_business_user(actor=request.user, **serializer.validated_data)
        return Response(UserReadSerializer(user).data, status=status.HTTP_201_CREATED)

    def get(self, request):
        users = self.get_queryset(request).only(
            "id",
            "email",
            "is_active",
            "date_joined",
            "business_id",
            "role__code",
        )
        return Response(UserReadSerializer(users, many=True).data, status=status.HTTP_200_OK)


class BusinessUserDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrBusinessOwner]

    def get_queryset(self, request):
        if request.user.has_role(Roles.ADMIN):
            return User.objects.select_related("business", "role").all()
        return User.objects.filter(business_id=request.user.business_id).select_related("business", "role")

    def patch(self, request, pk):
        target = get_object_or_404(self.get_queryset(request), pk=pk)

        serializer_class = AdminUserUpdateSerializer if request.user.has_role(Roles.ADMIN) else OwnerUserUpdateSerializer
        serializer = serializer_class(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = UserService.update_business_user(
            actor=request.user,
            user=target,
            **serializer.validated_data,
        )
        return Response(UserReadSerializer(updated).data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        target = get_object_or_404(self.get_queryset(request), pk=pk)
        UserService.delete_business_user(actor=request.user, user=target)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ViewerRegistrationAPIView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = ViewerRegistrationSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        business = Business.objects.get(id=serializer.validated_data["business_id"])
        user = UserService.self_register_viewer(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
            business=business,
        )
        return Response(UserReadSerializer(user).data, status=status.HTTP_201_CREATED)
