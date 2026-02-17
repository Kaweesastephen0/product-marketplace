# Product Marketplace Backend (Django + DRF)

This repository now contains a production-style backend foundation for a multi-tenant product marketplace.

## What Was Implemented

- Custom `User` model with business ownership and role field.
- Role-based access control (RBAC): `Admin`, `Editor`, `Approver`, `Viewer`.
- Multi-tenant data isolation: users can only access their own business data.
- Product approval workflow: `draft -> pending_approval -> approved`.
- Public product API that only returns approved products.
- JWT authentication (Simple JWT) + session auth support for Django admin.
- Service-layer pattern (business logic in `services.py`, not serializers/views).
- DRF best practices: routers, viewsets, filtering, pagination, query optimization.
- API schema/docs using drf-spectacular.
- Pytest + Factory Boy test setup.

## Package Stack

Core backend packages are declared in `api/requirements.txt`:

- `Django==4.2.11`: web framework and ORM.
- `djangorestframework==3.15.1`: REST API framework.
- `djangorestframework-simplejwt==5.3.1`: JWT auth endpoints and token handling.
- `django-filter==24.2`: filtering support in list APIs.
- `drf-spectacular==0.27.2`: OpenAPI schema + Swagger/Redoc docs.
- `pytest==8.2.2`: test runner.
- `pytest-django==4.8.0`: Django integration for pytest.
- `factory-boy==3.3.0`: test data factories.

## API Endpoints

### Authentication

- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `POST /api/auth/logout/`

### Products (Internal)

- `GET /api/products/`
- `POST /api/products/`
- `GET /api/products/{id}/`
- `PUT /api/products/{id}/`
- `PATCH /api/products/{id}/`
- `DELETE /api/products/{id}/`
- `POST /api/products/{id}/submit/`
- `POST /api/products/{id}/approve/`

### Public Products

- `GET /api/public/products/` (approved products only)

### Business User Management

- `GET /api/business/users/`
- `POST /api/business/users/`
- `PATCH /api/business/users/{id}/`

### API Documentation

- `GET /api/schema/`
- `GET /api/docs/swagger/`
- `GET /api/docs/redoc/`

## Architecture and File-by-File Guide

### Root

- `README.md`: this implementation guide.

### `api/config/` (project configuration)

- `api/config/settings.py`: Django settings, DRF config, JWT config, pagination/filter defaults, schema config, cache config, `AUTH_USER_MODEL`.
- `api/config/urls.py`: router registration, auth endpoints, docs endpoints, admin route.
- `api/config/asgi.py`: ASGI app entrypoint.
- `api/config/wsgi.py`: WSGI app entrypoint.
- `api/config/__init__.py`: package marker.

### `api/accounts/` (users and auth domain)

- `api/accounts/models.py`: custom `User`, `UserRole` enum, custom manager, non-superuser business constraint.
- `api/accounts/services.py`: user business logic (`create_user`, `update_user`) with RBAC checks.
- `api/accounts/admin.py`: admin customization for custom user model.
- `api/accounts/apps.py`: app config.
- `api/accounts/api/permissions.py`: `IsBusinessAdmin` permission class.
- `api/accounts/api/serializers.py`: serializers for business user read/create/update.
- `api/accounts/api/views.py`: logout endpoint (`RefreshToken` blacklist).
- `api/accounts/migrations/0001_initial.py`: initial schema for custom user.
- `api/accounts/migrations/__init__.py`: migrations package marker.
- `api/accounts/tests.py`: default Django test stub (not used by pytest suite).
- `api/accounts/views.py`: default scaffold view stub (currently unused).
- `api/accounts/__init__.py`: package marker.

### `api/businesses/` (tenant/business domain)

- `api/businesses/models.py`: `Business` model (`name`, `owner`, timestamps).
- `api/businesses/admin.py`: business admin listing/search.
- `api/businesses/apps.py`: app config.
- `api/businesses/api/views.py`: business user management viewset.
- `api/businesses/migrations/0001_initial.py`: initial `Business` model migration.
- `api/businesses/migrations/0002_business_owner.py`: adds owner FK to business.
- `api/businesses/migrations/__init__.py`: migrations package marker.
- `api/businesses/tests.py`: default Django test stub (not used by pytest suite).
- `api/businesses/views.py`: default scaffold view stub (currently unused).
- `api/businesses/__init__.py`: package marker.

### `api/products/` (product + approval workflow)

- `api/products/models.py`: `Product` model, status enum, indexes (`status`, `business`, combined index).
- `api/products/services.py`: product business logic (create/update/submit/approve/delete + public cache invalidation).
- `api/products/admin.py`: product admin listing/filtering.
- `api/products/apps.py`: app config.
- `api/products/api/filters.py`: `django-filter` filter set for product list.
- `api/products/api/permissions.py`: internal product action permissions + object-level business checks.
- `api/products/api/serializers.py`: internal/public serializers and write serializer.
- `api/products/api/views.py`: internal product viewset + public approved-products viewset.
- `api/products/migrations/0001_initial.py`: initial product schema migration.
- `api/products/migrations/0002_rename_products_pro_busines_8e96b8_idx_products_pr_busines_585b98_idx_and_more.py`: index rename migration generated by Django.
- `api/products/migrations/__init__.py`: migrations package marker.
- `api/products/__init__.py`: package marker.

### `api/tests/` (pytest-based automated tests)

- `api/tests/test_api.py`: API integration tests for JWT, RBAC, approvals, tenant isolation, business user management.
- `api/tests/factories/business.py`: `BusinessFactory`.
- `api/tests/factories/user.py`: `UserFactory`.
- `api/tests/factories/product.py`: `ProductFactory`.
- `api/tests/factories/__init__.py`: factories package marker.
- `api/tests/__init__.py`: tests package marker.

### `api/` project-level backend files

- `api/manage.py`: Django management command entrypoint.
- `api/requirements.txt`: backend dependencies.
- `api/pytest.ini`: pytest configuration for Django settings and test discovery.

## Security and Isolation Rules Enforced

- Users belong to exactly one business (except superuser compatibility).
- Querysets are tenant-scoped by `request.user.business_id`.
- Cross-business object access returns `404` through scoped lookups.
- Unauthorized actions return `403` via permission classes/services.
- Product status cannot be directly manipulated through write serializer.
- Approval action is restricted to `Approver` (or superuser).

## Performance Patterns Applied

- `select_related` and `only` used to reduce N+1 and over-fetching.
- Status/business indexing on products for list and public-query performance.
- DRF pagination configured globally.
- `DjangoFilterBackend` + ordering/search support.
- Lightweight caching of approved public product IDs with invalidation on product changes.

## Local Run and Test

From `api/`:

1. `python3 -m venv .venv`
2. `source .venv/bin/activate`
3. `pip install -r requirements.txt`
4. `python manage.py migrate`
5. `python manage.py runserver`

Run tests:

1. `pytest`

## Frontend (Next.js) Implementation

The frontend was redesigned to a production-style structure using App Router, React Query, Tailwind CSS, secure cookie auth flow, and role-aware UI controls.

### Architecture

Implemented folders:

- `client/app`: pages, layouts, loading/error boundaries, route handlers.
- `client/components`: reusable UI and access-control components.
- `client/features`: feature modules for auth/products.
- `client/lib`: shared infrastructure (query client, API helpers, backend proxy logic).
- `client/hooks`: app-level hooks and providers.
- `client/services`: API access layer used by features/hooks.
- `client/types`: role/permission mappings.

### Security Model

- JWT is **not** stored in `localStorage`.
- Next.js route handlers store tokens in HTTP-only cookies:
  - `pm_access_token`
  - `pm_refresh_token`
- Browser calls only same-origin Next APIs (`/api/...`), and Next proxies to Django.
- Expired access tokens are refreshed server-side using refresh cookie.
- Dashboard route protection:
  - `client/middleware.js` blocks unauthenticated access to `/dashboard`.

### Frontend Features Delivered

- Authentication:
  - `/login` with loading/error states and zod validation.
  - Logout action clears cookies and auth cache.
  - Protected dashboard route with redirect behavior.
- Internal product management (`/dashboard`):
  - Paginated product list.
  - Create/edit via modal form.
  - Submit for approval.
  - Approve (role-based).
  - Delete with confirmation.
  - Status badges for `draft`, `pending_approval`, `approved`.
- Public listing (`/`):
  - Server Component fetch for SEO-friendly initial render.
  - Pagination controls.
  - Approved products only.
- Role-aware UI:
  - Central permission matrix.
  - Reusable `<Can permission=\"...\">` wrapper.
  - Buttons hidden/disabled by role capability.
- UX quality:
  - Loading states and route-level boundaries.
  - Toast success/error messages.
  - Responsive layout with collapsible sidebar on mobile.

### Frontend Packages

Main runtime packages:

- `next@14.2.5`
- `react@18.3.1`
- `react-dom@18.3.1`
- `@tanstack/react-query@5.51.1`
- `react-hook-form@7.52.1`
- `zod@3.23.8`
- `@hookform/resolvers@3.9.0`
- `clsx@2.1.1`

Styling/build packages:

- `tailwindcss@3.4.7`
- `postcss@8.4.39`
- `autoprefixer@10.4.19`

### Key Frontend Files

- `client/app/page.js`: server-rendered public products page.
- `client/app/login/page.js`: login page.
- `client/app/dashboard/page.js`: client dashboard with dynamic product section import.
- `client/app/providers.js`: global providers (React Query, Auth, Toast).
- `client/app/error.js`: global error boundary.
- `client/app/loading.js`: global loading skeleton.
- `client/app/dashboard/error.js`: dashboard-level error boundary.
- `client/app/dashboard/loading.js`: dashboard loading state.
- `client/app/api/auth/login/route.js`: backend login proxy + HTTP-only cookie set.
- `client/app/api/auth/logout/route.js`: backend logout proxy + cookie cleanup.
- `client/app/api/auth/me/route.js`: authenticated profile proxy with refresh fallback.
- `client/app/api/products/route.js`: authenticated products list/create proxy.
- `client/app/api/products/[id]/route.js`: authenticated product update/delete proxy.
- `client/app/api/products/[id]/approve/route.js`: approve action proxy.
- `client/app/api/products/[id]/submit/route.js`: submit-for-approval action proxy.
- `client/app/api/public/products/route.js`: public products proxy.
- `client/features/auth/components/LoginForm.js`: validated login form.
- `client/features/products/components/ProductTableSection.js`: paginated table + role-aware actions.
- `client/features/products/components/ProductFormModal.js`: create/edit modal.
- `client/features/products/hooks/useProductsQuery.js`: React Query product list hook.
- `client/features/products/hooks/useProductMutations.js`: create/update/approve/submit/delete hooks.
- `client/components/Can.js`: role-based conditional rendering wrapper.
- `client/components/ui/Sidebar.js`: responsive collapsible sidebar.
- `client/hooks/useAuth.js`: auth context backed by React Query `/me`.
- `client/hooks/useToast.js`: toast state/actions.
- `client/lib/backend-server.js`: secure proxy + token refresh logic.
- `client/types/auth.js`: role permission matrix.

### Frontend Run Commands

From `client/`:

1. `cp .env.example .env.local`
2. `npm install`
3. `npm run dev`
