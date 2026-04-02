import { tableSchema } from "@nozbe/watermelondb";

export const userManagementPermissionsTable = tableSchema({
  name: "user_management_permissions",
  columns: [
    { name: "code", type: "string", isIndexed: true },
    { name: "module", type: "string", isIndexed: true },
    { name: "label", type: "string" },
    { name: "description", type: "string" },
    { name: "created_at", type: "number" },
    { name: "updated_at", type: "number" },
  ],
});
