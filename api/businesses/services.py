from django.contrib.auth import get_user_model
from django.db.models import Count

from accounts.constants import Roles
from businesses.models import Business
from products.models import Product, ProductStatus

User = get_user_model()


class StatisticsService:
    @staticmethod
    # Calculates global admin metrics across businesses, users, and product approval states.
    def admin_statistics():
        total_businesses = Business.objects.count()
        total_users = User.objects.count()
        total_products = Product.objects.count()
        approved_products = Product.objects.filter(status=ProductStatus.APPROVED).count()
        pending_products = Product.objects.filter(status=ProductStatus.PENDING_APPROVAL).count()

        ratio = 0
        if pending_products:
            ratio = approved_products / pending_products

        return {
            "total_businesses": total_businesses,
            "total_users": total_users,
            "total_products": total_products,
            "approved_products": approved_products,
            "pending_products": pending_products,
            "approved_pending_ratio": ratio,
        }

    @staticmethod
    # Calculates dashboard metrics scoped to the requesting user's business.
    def business_statistics(*, user):
        business_id = user.business_id
        if user.has_role(Roles.ADMIN):
            raise ValueError("Use admin statistics endpoint for system admins.")

        users_agg = User.objects.filter(business_id=business_id).aggregate(total=Count("id"))
        products = Product.objects.filter(business_id=business_id)

        return {
            "total_business_users": users_agg["total"],
            "total_products": products.count(),
            "pending_approvals": products.filter(status=ProductStatus.PENDING_APPROVAL).count(),
            "approved_products": products.filter(status=ProductStatus.APPROVED).count(),
            "rejected_products": products.filter(status=ProductStatus.REJECTED).count(),
        }
