import pytest
from rest_framework.test import APIClient

from accounts.constants import Roles
from accounts.models import Role
from products.models import ProductStatus
from tests.factories.business import BusinessFactory
from tests.factories.product import ProductFactory
from tests.factories.user import UserFactory, get_role


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture(autouse=True)
def seed_roles(db):
    for code, name in Roles.CHOICES:
        Role.objects.get_or_create(code=code, defaults={"name": name})


@pytest.fixture
def auth_tokens(api_client):
    def _tokens_for(user, password="Passw0rd!"):
        response = api_client.post(
            "/api/login/",
            {"email": user.email, "password": password},
            format="json",
        )
        assert response.status_code == 200
        return response.json()

    return _tokens_for


@pytest.mark.django_db
def test_admin_can_create_business_owner(api_client, auth_tokens):
    admin = UserFactory(role=get_role(Roles.ADMIN), business=None)
    tokens = auth_tokens(admin)

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    response = api_client.post(
        "/api/create-business-owner/",
        {
            "business_name": "Acme Corp",
            "owner_email": "owner@acme.com",
            "owner_password": "Passw0rd!",
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.json()["role"] == Roles.BUSINESS_OWNER


@pytest.mark.django_db
def test_non_admin_cannot_create_business_owner(api_client, auth_tokens):
    owner = UserFactory(role=get_role(Roles.BUSINESS_OWNER))
    tokens = auth_tokens(owner)

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    response = api_client.post(
        "/api/create-business-owner/",
        {
            "business_name": "Nope Inc",
            "owner_email": "blocked@nope.com",
            "owner_password": "Passw0rd!",
        },
        format="json",
    )
    assert response.status_code == 403


@pytest.mark.django_db
def test_owner_can_create_editor_and_approver_only(api_client, auth_tokens):
    owner = UserFactory(role=get_role(Roles.BUSINESS_OWNER))
    tokens = auth_tokens(owner)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

    create_editor = api_client.post(
        "/api/users/",
        {"email": "editor@biz.com", "password": "Passw0rd!", "role": Roles.EDITOR},
        format="json",
    )
    assert create_editor.status_code == 201

    create_viewer = api_client.post(
        "/api/users/",
        {"email": "viewer@biz.com", "password": "Passw0rd!", "role": Roles.VIEWER},
        format="json",
    )
    assert create_viewer.status_code == 403


@pytest.mark.django_db
def test_editor_cannot_approve_product(api_client, auth_tokens):
    editor = UserFactory(role=get_role(Roles.EDITOR))
    product = ProductFactory(business=editor.business, created_by=editor, status=ProductStatus.PENDING_APPROVAL)

    tokens = auth_tokens(editor)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

    response = api_client.post(f"/api/products/{product.id}/approve/", {}, format="json")
    assert response.status_code == 403


@pytest.mark.django_db
def test_approver_cannot_edit_product(api_client, auth_tokens):
    editor = UserFactory(role=get_role(Roles.EDITOR))
    approver = UserFactory(role=get_role(Roles.APPROVER), business=editor.business)
    product = ProductFactory(business=editor.business, created_by=editor)

    tokens = auth_tokens(approver)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

    response = api_client.patch(
        f"/api/products/{product.id}/",
        {"name": "Changed"},
        format="json",
    )
    assert response.status_code == 403


@pytest.mark.django_db
def test_cross_business_access_returns_404(api_client, auth_tokens):
    owner_a = UserFactory(role=get_role(Roles.BUSINESS_OWNER))
    owner_b = UserFactory(role=get_role(Roles.BUSINESS_OWNER))
    product_b = ProductFactory(business=owner_b.business, created_by=owner_b)

    tokens = auth_tokens(owner_a)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

    response = api_client.get(f"/api/products/{product_b.id}/")
    assert response.status_code == 404


@pytest.mark.django_db
def test_public_endpoint_shows_only_approved(api_client):
    business = BusinessFactory()
    editor = UserFactory(role=get_role(Roles.EDITOR), business=business)
    ProductFactory(business=business, created_by=editor, status=ProductStatus.APPROVED)
    ProductFactory(business=business, created_by=editor, status=ProductStatus.DRAFT)

    response = api_client.get("/api/public/products/")
    assert response.status_code == 200
    results = response.json()["results"]
    assert len(results) == 1


@pytest.mark.django_db
def test_statistics_endpoints(api_client, auth_tokens):
    admin = UserFactory(role=get_role(Roles.ADMIN), business=None)
    owner = UserFactory(role=get_role(Roles.BUSINESS_OWNER))
    ProductFactory(business=owner.business, created_by=owner, status=ProductStatus.PENDING_APPROVAL)
    ProductFactory(business=owner.business, created_by=owner, status=ProductStatus.APPROVED)

    admin_tokens = auth_tokens(admin)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {admin_tokens['access']}")
    admin_stats = api_client.get("/api/admin/statistics/")
    assert admin_stats.status_code == 200
    assert "total_businesses" in admin_stats.json()

    owner_tokens = auth_tokens(owner)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {owner_tokens['access']}")
    owner_stats = api_client.get("/api/business/statistics/")
    assert owner_stats.status_code == 200
    assert owner_stats.json()["pending_approvals"] == 1
