# Product Marketplace

Full-stack role-based product marketplace built with:
## Backend: 
    Django + Django REST Framework
## Frontend: 
    Next.js  + MUI + Tailwind

## What Was Implemented

### Backend
 1. Custom user model with role-based access control.
 2. Roles: `admin`, `business_owner`, `editor`, `approver`, `viewer`.
 3. Strict multi-tenant business scoping for users and products.
 4. JWT auth with SimpleJWT (`login`, `refresh`, `logout`) and session auth for Django admin.
 5. Product workflow with status rules:
   `draft` -> `pending_approval` -> `approved` or `rejected`
 6. Public products endpoint that returns approved products only.
 7. Admin and business statistics endpoints.
 8. Audit logging model and admin audit-log API endpoints.
 9. DRF permissions for view-level and object-level authorization.
 10. Filtering, search, ordering, pagination on API list endpoints.
 11. Swagger/OpenAPI docs via `drf-spectacular`.

### Frontend
1. Next.js App Router structure with API route handlers as secure backend proxies.
2. Cookie-based auth flow (HTTP-only cookies managed by server-side route handlers).
3. Role-based dashboard rendering and role-based actions.
4. Product CRUD, submit, approve, reject workflows.
5. Business user management (create/update/delete) and admin business owner creation flow.
6. Admin audit logs panel and statistics panels.
7. Public approved-products page.
8. React Query for data fetching/caching/mutations.
9. Global notification/toast provider and loading/error UI states.
10. Responsive dashboard with header, sidebar, and footer.

## Tech Decisions And Assumptions

1. JWT is used for API authentication; frontend does not store tokens in `localStorage`.
2. Next.js route handlers proxy requests to Django to centralize token refresh and cookie handling.
3. Backend is the source of permissions; frontend only adapts UI.
4. Business is the primary tenant boundary for non-admin users.
5. Public product listing is cached at backend level (short-lived cache for approved IDs).

## How to setup and run the project.

### 1 Backend Setup (Django)

```bash
cd api
# create a virtual Environment
python3 -m venv .venv

# activate the environment
source .venv/bin/activate # For linux
.venv/scripts/activate #for windows

# install dependencies
pip install -r requirements.txt

# Export the enviroment variable after creating your mysql database
export DB_NAME=
export DB_USER=
export DB_PASSWORD= 
export DB_HOST=
export DB_PORT=
```


## Run migrations and the backend server.

```bash
python manage.py makemigrations
python manage.py migrate

# Create an admin account
python manage.py createsuperuser

# Run the backend server
python manage.py runserver
```

Backend default URL: `http://127.0.0.1:8000`

### 2. Frontend Setup (Next.js)

```bash
cd client

# Install frontend dependencies
npm install

# Create a client/.env.local file for client valiables

NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# Run frontend:

npm run dev
```

Frontend default URL: `http://localhost:3000`


Open:
. Frontend app: `http://localhost:3000`
. API schema: `http://127.0.0.1:8000/api/schema/`
. Swagger: `http://127.0.0.1:8000/api/docs/swagger/`
. ReDoc: `http://127.0.0.1:8000/api/docs/redoc/`



## Known Limitations

1. MySQL must be running if MySQL env vars are set; otherwise startup/migrations will fail.

