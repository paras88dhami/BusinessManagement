import { tableSchema } from "@nozbe/watermelondb";

export const orderLinesTable = tableSchema({
  name: "order_lines",
  columns: [
    { name: "remote_id", type: "string", isIndexed: true },
    { name: "order_remote_id", type: "string", isIndexed: true },
    { name: "product_remote_id", type: "string", isIndexed: true },
    { name: "quantity", type: "number" },
    { name: "line_order", type: "number", isIndexed: true },
    { name: "sync_status", type: "string", isIndexed: true },
    { name: "last_synced_at", type: "number", isOptional: true },
    { name: "deleted_at", type: "number", isOptional: true },
    { name: "created_at", type: "number" },
    { name: "updated_at", type: "number" },
  ],
});
