# Product Marketplace

Monorepo with:
- `client/`: Next.js frontend (App Router + React Query)
- `api/`: Django REST API backend

This README focuses on **what each source file/folder does**.
It excludes generated/vendor files (`node_modules`, `.next`, `.venv`, `__pycache__`, local DB/cache files).

## Root Files
- `README.md`: Project guide and file map.
- `LICENSE`: License text.
- `.gitignore`: Git ignore rules.
- `.gitattributes`: Git attributes.

## Frontend (`client/`)

### Frontend Config
- `client/package.json`: Frontend scripts and dependencies.
- `client/package-lock.json`: Locked npm dependency tree.
- `client/next.config.mjs`: Next.js config (including remote image hosts).
- `client/jsconfig.json`: Path alias config (`@/*`).
- `client/postcss.config.mjs`: PostCSS setup.
- `client/tailwind.config.js`: Tailwind theme/content config.
- `client/proxy.js`: Local proxy helper script.
- `client/.env.example`: Example frontend environment variables.
- `client/.env.local`: Local frontend env values.

### App Router Pages
- `client/app/layout.js`: Root HTML layout and metadata; wraps app with providers.
- `client/app/globals.css`: Global styles.
- `client/app/page.js`: Public landing/products page.
- `client/app/loading.js`: Global loading UI.
- `client/app/error.js`: Global error boundary UI.
- `client/app/dashboard/page.js`: Main dashboard shell (header/sidebar/panels/logout/profile).
- `client/app/dashboard/loading.js`: Dashboard loading UI.
- `client/app/dashboard/error.js`: Dashboard error boundary UI.

### Next API Routes (frontend server-to-backend proxy layer)
- `client/app/api/auth/login/route.js`: Login proxy; sets auth cookies.
- `client/app/api/auth/logout/route.js`: Logout proxy; clears auth cookies.
- `client/app/api/auth/me/route.js`: Authenticated profile proxy.
- `client/app/api/register/route.js`: Public viewer registration proxy.
- `client/app/api/public/products/route.js`: Public products proxy.
- `client/app/api/products/route.js`: Product list/create proxy.
- `client/app/api/products/[id]/route.js`: Product update/delete proxy.
- `client/app/api/products/[id]/submit/route.js`: Submit-for-approval proxy.
- `client/app/api/products/[id]/approve/route.js`: Approve product proxy.
- `client/app/api/products/[id]/reject/route.js`: Reject product proxy.
- `client/app/api/users/route.js`: User list/create proxy.
- `client/app/api/users/[id]/route.js`: User update/delete proxy.
- `client/app/api/business/statistics/route.js`: Business stats proxy.
- `client/app/api/admin/statistics/route.js`: Admin stats proxy.
- `client/app/api/admin/audit-logs/route.js`: Audit log list/clear proxy.
- `client/app/api/admin/audit-logs/[id]/route.js`: Single audit log delete proxy.
- `client/app/api/businesses/route.js`: Business list proxy.
- `client/app/api/businesses/[id]/route.js`: Business update/delete proxy.
- `client/app/api/create-business-owner/route.js`: Create business owner proxy.

### UI Components
- `client/components/providers.js`: Registers Query/Auth/Notify providers.

#### Auth
- `client/components/auth/AuthModalButtons.js`: Header auth actions + login/register/profile modals.

#### Dashboard Panels
- `client/components/dashboard/AdminPanel.js`: Admin dashboard (stats, business management).
- `client/components/dashboard/OwnerPanel.js`: Business owner dashboard.
- `client/components/dashboard/EditorPanel.js`: Editor dashboard.
- `client/components/dashboard/ApproverPanel.js`: Approver dashboard.
- `client/components/dashboard/ApprovalPanel.js`: Product approval workflow table/actions.
- `client/components/dashboard/ProductManagerPanel.js`: Product CRUD table/form/modals.
- `client/components/dashboard/UserManagementPanel.js`: User CRUD/suspend/activate UI.
- `client/components/dashboard/MetricCards.js`: Reusable dashboard metric card grid.
- `client/components/dashboard/AuditLogsPanel.js`: Admin audit log listing/actions.

#### Layout
- `client/components/layout/AppHeader.js`: Top bar and actions.
- `client/components/layout/HoverSidebar.js`: Role-aware sidebar navigation.
- `client/components/layout/AppFooter.js`: Footer.

#### Product Hooks
- `client/components/products/useProductsQuery.js`: React Query products list hook.
- `client/components/products/useProductMutations.js`: Product mutation hooks.

#### Shared UI
- `client/components/ui/Modal.js`: Generic modal.
- `client/components/ui/ConfirmDialog.js`: Confirmation dialog.
- `client/components/ui/IconInput.js`: Input with optional icon/password toggle.
- `client/components/ui/TablePagination.js`: Table pagination controls.

### Frontend Hooks
- `client/hooks/useAuth.js`: Auth context, session state, and auth helpers.
- `client/hooks/useNotify.js`: Notification/toast context and API.

### Frontend Libraries
- `client/lib/query-client.js`: React Query client defaults.
- `client/lib/axios.js`: Axios instance for frontend API calls.
- `client/lib/auth-cookies.js`: Cookie names/options.
- `client/lib/backend-server.js`: Server-side proxy/auth-refresh helpers.
- `client/lib/dashboard-refresh.js`: Central dashboard query invalidation helper.

### Frontend Service Layer
- `client/lib/services/auth.service.js`: Auth API client methods.
- `client/lib/services/products.service.js`: Product API client methods.
- `client/lib/services/business.service.js`: Business/user management API methods.
- `client/lib/services/admin.service.js`: Admin API methods (stats/businesses/audit logs).
- `client/lib/services/public-products.service.js`: Public products fetch helper.

### Frontend Type/Config Maps
- `client/types/auth.js`: Permission map by role.
- `client/types/navigation.js`: Sidebar/menu definitions by role.

### Frontend Public Assets
- `client/public/marketplace-logo.svg`: Marketplace logo image.

## Backend (`api/`)

### Backend Runtime/Config
- `api/manage.py`: Django CLI entry point.
- `api/requirements.txt`: Python dependencies.
- `api/pytest.ini`: Pytest config.
- `api/.env`: Local backend env variables.
- `api/config/settings.py`: Django settings (DB/auth/REST/CORS/cache/media).
- `api/config/urls.py`: URL routing for auth, users, businesses, products, docs.
- `api/config/asgi.py`: ASGI app entry point.
- `api/config/wsgi.py`: WSGI app entry point.
- `api/config/__init__.py`: Package marker.

### Accounts Domain (`api/accounts/`)
- `api/accounts/models.py`: Custom `User`, `Role`, and `AuditLog` models.
- `api/accounts/constants.py`: Role constants and role sets.
- `api/accounts/services.py`: Account/user business logic and audit logging.
- `api/accounts/admin.py`: Django admin configuration for accounts models.
- `api/accounts/apps.py`: Django app config.
- `api/accounts/tests.py`: App-level test module.
- `api/accounts/views.py`: Placeholder/default Django app view module.
- `api/accounts/__init__.py`: Package marker.

#### Accounts API Layer
- `api/accounts/api/permissions.py`: DRF permission classes for account/admin access.
- `api/accounts/api/serializers.py`: Request/response serializers for auth/users/audit.
- `api/accounts/api/views.py`: Auth endpoints, viewer register, users CRUD, audit endpoints.
- `api/accounts/api/__init__.py`: Package marker.

#### Accounts Migrations
- `api/accounts/migrations/0001_initial.py`: Initial accounts schema.
- `api/accounts/migrations/0002_role_auditlog_user_role_fk.py`: Role/AuditLog schema updates.
- `api/accounts/migrations/0003_rename_accounts_au_busines_50b2d2_idx_accounts_au_busines_704f12_idx_and_more.py`: Index/name adjustments.
- `api/accounts/migrations/__init__.py`: Migrations package marker.

### Businesses Domain (`api/businesses/`)
- `api/businesses/models.py`: Business model.
- `api/businesses/services.py`: Business statistics/service logic.
- `api/businesses/admin.py`: Business admin configuration.
- `api/businesses/apps.py`: Django app config.
- `api/businesses/tests.py`: App-level tests module.
- `api/businesses/views.py`: Placeholder/default Django app view module.
- `api/businesses/__init__.py`: Package marker.

#### Businesses API Layer
- `api/businesses/api/serializers.py`: Business API serializers.
- `api/businesses/api/views.py`: Admin/business statistics and business CRUD endpoints.
- `api/businesses/api/__init__.py`: Package marker.

#### Businesses Migrations
- `api/businesses/migrations/0001_initial.py`: Initial businesses schema.
- `api/businesses/migrations/0002_business_owner.py`: Adds owner relationship.
- `api/businesses/migrations/__init__.py`: Migrations package marker.

### Products Domain (`api/products/`)
- `api/products/models.py`: Product model and status workflow fields.
- `api/products/services.py`: Product lifecycle logic (create/update/submit/approve/reject/delete).
- `api/products/admin.py`: Product admin configuration.
- `api/products/apps.py`: Django app config.
- `api/products/__init__.py`: Package marker.

#### Products API Layer
- `api/products/api/filters.py`: Product filtering definitions.
- `api/products/api/permissions.py`: Product action permissions by role.
- `api/products/api/serializers.py`: Product read/write/public serializers.
- `api/products/api/views.py`: Product viewsets (internal and public).
- `api/products/api/__init__.py`: Package marker.

#### Products Migrations
- `api/products/migrations/0001_initial.py`: Initial products schema.
- `api/products/migrations/0002_rename_products_pro_busines_8e96b8_idx_products_pr_busines_585b98_idx_and_more.py`: Index/name adjustments.
- `api/products/migrations/0003_product_image_product_image_url.py`: Image and image URL fields.
- `api/products/migrations/0004_product_rejection_reason_alter_product_status.py`: Rejection reason and status updates.
- `api/products/migrations/__init__.py`: Migrations package marker.

### Backend Tests (`api/tests/`)
- `api/tests/test_api.py`: API integration/behavior tests.
- `api/tests/factories/user.py`: User test factory.
- `api/tests/factories/business.py`: Business test factory.
- `api/tests/factories/product.py`: Product test factory.
- `api/tests/factories/__init__.py`: Factories package marker.
- `api/tests/__init__.py`: Tests package marker.

## Quick Run

### Backend
1. `cd api`
2. `python3 -m venv .venv && source .venv/bin/activate`
3. `pip install -r requirements.txt`
4. `python manage.py migrate`
5. `python manage.py runserver`

### Frontend
1. `cd client`
2. `npm install`
3. `npm run dev`

## Notes
- Frontend talks to backend through Next route handlers in `client/app/api/**`.
- Auth uses HTTP-only cookies and refresh-token fallback in `client/lib/backend-server.js`.
- Dashboard data refresh behavior is centralized in `client/lib/dashboard-refresh.js`.
