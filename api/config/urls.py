from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.api.views import (
    AdminAuditLogClearAPIView,
    AdminAuditLogDetailAPIView,
    AdminAuditLogListAPIView,
    BusinessUserDetailAPIView,
    BusinessUsersAPIView,
    CustomTokenObtainPairView,
    CreateBusinessOwnerAPIView,
    LogoutAPIView,
    MeAPIView,
    ViewerRegistrationAPIView,
)
from businesses.api.views import AdminStatisticsAPIView, BusinessDetailAPIView, BusinessListAPIView, BusinessStatisticsAPIView
from products.api.views import ProductViewSet, PublicProductViewSet

router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="product")
router.register(r"public/products", PublicProductViewSet, basename="public-product")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/docs/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("api/login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("api/auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/logout/", LogoutAPIView.as_view(), name="token_logout"),
    path("api/auth/me/", MeAPIView.as_view(), name="auth_me"),
    path("api/register/", ViewerRegistrationAPIView.as_view(), name="viewer_register"),
    path("api/create-business-owner/", CreateBusinessOwnerAPIView.as_view(), name="create_business_owner"),
    path("api/admin/statistics/", AdminStatisticsAPIView.as_view(), name="admin_statistics"),
    path("api/admin/audit-logs/", AdminAuditLogListAPIView.as_view(), name="admin_audit_logs"),
    path("api/admin/audit-logs/clear/", AdminAuditLogClearAPIView.as_view(), name="admin_audit_logs_clear"),
    path("api/admin/audit-logs/<int:pk>/", AdminAuditLogDetailAPIView.as_view(), name="admin_audit_log_detail"),
    path("api/business/statistics/", BusinessStatisticsAPIView.as_view(), name="business_statistics"),
    path("api/businesses/", BusinessListAPIView.as_view(), name="business_list"),
    path("api/businesses/<int:pk>/", BusinessDetailAPIView.as_view(), name="business_detail"),
    path("api/users/", BusinessUsersAPIView.as_view(), name="business_users"),
    path("api/users/<int:pk>/", BusinessUserDetailAPIView.as_view(), name="business_user_detail"),
    path("api/business/users/", BusinessUsersAPIView.as_view(), name="business_users_legacy"),
    path("api/business/users/<int:pk>/", BusinessUserDetailAPIView.as_view(), name="business_user_detail_legacy"),
    path("api/", include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
