class Roles:
    ADMIN = "admin"
    BUSINESS_OWNER = "business_owner"
    EDITOR = "editor"
    APPROVER = "approver"
    VIEWER = "viewer"

    CHOICES = [
        (ADMIN, "Admin"),
        (BUSINESS_OWNER, "Business Owner"),
        (EDITOR, "Editor"),
        (APPROVER, "Approver"),
        (VIEWER, "Viewer"),
    ]


OWNER_MANAGED_ROLES = {Roles.EDITOR, Roles.APPROVER}
PRODUCT_EDIT_ROLES = {Roles.ADMIN, Roles.BUSINESS_OWNER, Roles.EDITOR}
PRODUCT_APPROVE_ROLES = {Roles.ADMIN, Roles.APPROVER}
