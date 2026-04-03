export type UserManagementPermissionSeed = {
  code: string;
  module: string;
  label: string;
  description: string;
};

export const USER_MANAGEMENT_PERMISSION_SEED: readonly UserManagementPermissionSeed[] =
  [
    {
      code: "profile.view",
      module: "Profile",
      label: "View Profile",
      description: "Access profile details and account switch options.",
    },
    {
      code: "profile.edit",
      module: "Profile",
      label: "Edit Profile",
      description: "Update personal and business profile information.",
    },
    {
      code: "ledger.view",
      module: "Ledger",
      label: "View Ledger",
      description: "Open ledger overview and balances.",
    },
    {
      code: "ledger.manage",
      module: "Ledger",
      label: "Manage Ledger",
      description: "Create and update ledger records.",
    },
    {
      code: "pos.view",
      module: "POS",
      label: "View POS",
      description: "Open point-of-sale dashboard.",
    },
    {
      code: "pos.checkout",
      module: "POS",
      label: "Perform Checkout",
      description: "Create and complete POS sales.",
    },
    {
      code: "products.view",
      module: "Products",
      label: "View Products",
      description: "Access business product and service catalog.",
    },
    {
      code: "products.manage",
      module: "Products",
      label: "Manage Products",
      description: "Create, update, and delete products and services.",
    },
    {
      code: "inventory.view",
      module: "Inventory",
      label: "View Inventory",
      description: "Open inventory levels and movement history.",
    },
    {
      code: "inventory.manage",
      module: "Inventory",
      label: "Manage Inventory",
      description: "Record stock-in and stock-adjustment movements.",
    },
    {
      code: "emi.view",
      module: "EMI & Loans",
      label: "View EMI & Loans",
      description: "Access EMI and loan tracking screens.",
    },
    {
      code: "emi.manage",
      module: "EMI & Loans",
      label: "Manage EMI & Loans",
      description: "Create and update installment records.",
    },
    {
      code: "transactions.view",
      module: "Transactions",
      label: "View Transactions",
      description: "Access personal transaction history.",
    },
    {
      code: "transactions.manage",
      module: "Transactions",
      label: "Manage Transactions",
      description: "Create and edit personal transactions.",
    },
    {
      code: "budget.view",
      module: "Budget",
      label: "View Budget",
      description: "Open budget planning and summaries.",
    },
    {
      code: "budget.manage",
      module: "Budget",
      label: "Manage Budget",
      description: "Create and update budget plans.",
    },
    {
      code: "user_management.view",
      module: "User Management",
      label: "View User Management",
      description: "Open user management workspace.",
    },
    {
      code: "user_management.manage_roles",
      module: "User Management",
      label: "Manage Roles",
      description: "Create and update custom roles.",
    },
    {
      code: "user_management.assign_role",
      module: "User Management",
      label: "Assign Roles",
      description: "Assign roles to account users.",
    },
    {
      code: "user_management.manage_staff",
      module: "User Management",
      label: "Manage Staff",
      description: "Create, update, deactivate, and reactivate workspace staff.",
    },
  ] as const;

export const USER_MANAGEMENT_OWNER_ROLE_NAME = "Owner";
