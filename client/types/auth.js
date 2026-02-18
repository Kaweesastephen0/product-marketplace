export const ROLE_PERMISSIONS = {
  admin: ["create_product", "edit_product", "approve_product", "delete_product"],
  business_owner: ["create_product", "edit_product", "manage_users"],
  editor: ["create_product", "edit_product"],
  approver: ["approve_product"],
  viewer: [],
};

// Performs has permission operations.
export function hasPermission(role, permission) {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}
