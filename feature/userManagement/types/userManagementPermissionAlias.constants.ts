export const USER_MANAGEMENT_PERMISSION_ALIAS_MAP: Readonly<
  Record<string, readonly string[]>
> = {
  "products.view": ["pos.view"],
  "products.manage": ["pos.checkout"],
  "inventory.view": ["pos.view"],
  "inventory.manage": ["pos.checkout"],
  "money_accounts.view": ["ledger.view", "pos.view"],
  "money_accounts.manage": ["ledger.manage", "pos.checkout"],
  "contacts.view": ["products.view", "pos.view"],
  "contacts.manage": ["products.manage", "pos.checkout"],
  "billing.view": ["pos.view", "ledger.view"],
  "billing.manage": ["pos.checkout", "ledger.manage"],
  "tax_calculator.view": ["ledger.view"],
  "notes.view": ["ledger.view"],
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
