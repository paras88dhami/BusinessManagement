import { tableSchema } from "@nozbe/watermelondb";

export const authCredentialsTable = tableSchema({
  name: "auth_credentials",
  columns: [
    { name: "remote_id", type: "string", isIndexed: true },
    { name: "user_remote_id", type: "string", isIndexed: true },
    { name: "login_id", type: "string", isIndexed: true }, // email or phone
    { name: "credential_type", type: "string", isIndexed: true }, // password | pin
    { name: "password_hash", type: "string" },
    { name: "password_salt", type: "string" },
    { name: "hint", type: "string", isOptional: true },
    { name: "last_login_at", type: "number", isOptional: true },
    { name: "is_active", type: "boolean" },

    { name: "sync_status", type: "string", isIndexed: true },
    { name: "last_synced_at", type: "number", isOptional: true },
    { name: "deleted_at", type: "number", isOptional: true },

    { name: "created_at", type: "number" },
    { name: "updated_at", type: "number" },
  ],
});