export const USER_MANAGEMENT_PERMISSION_ALIAS_MAP: Readonly<
  Record<string, readonly string[]>
> = {
  "products.view": ["pos.view"],
  "products.manage": ["pos.checkout"],
  "inventory.view": ["pos.view"],
  "inventory.manage": ["pos.checkout"],
};

export const hasAccountPermissionWithAliases = (
  grantedPermissionCodes: readonly string[],
  requiredPermissionCode: string,
): boolean => {
  if (grantedPermissionCodes.includes(requiredPermissionCode)) {
    return true;
  }

  const aliasPermissionCodes =
    USER_MANAGEMENT_PERMISSION_ALIAS_MAP[requiredPermissionCode] ?? [];

  return aliasPermissionCodes.some((permissionCode) =>
    grantedPermissionCodes.includes(permissionCode),
  );
};
