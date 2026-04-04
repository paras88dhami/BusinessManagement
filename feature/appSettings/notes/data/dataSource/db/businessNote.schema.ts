import { tableSchema } from "@nozbe/watermelondb";

export const businessNotesTable = tableSchema({
  name: "business_notes",
  columns: [
    { name: "account_remote_id", type: "string", isIndexed: true },
    { name: "note_content", type: "string", isOptional: true },
    { name: "created_at", type: "number" },
    { name: "updated_at", type: "number" },
  ],
});
