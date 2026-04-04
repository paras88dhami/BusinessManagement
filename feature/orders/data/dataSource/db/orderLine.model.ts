import { Model } from "@nozbe/watermelondb";
import { date, field, readonly } from "@nozbe/watermelondb/decorators";

export class OrderLineModel extends Model {
  static table = "order_lines";

  @field("remote_id") remoteId!: string;
  @field("order_remote_id") orderRemoteId!: string;
  @field("product_remote_id") productRemoteId!: string;
  @field("quantity") quantity!: number;
  @field("line_order") lineOrder!: number;
  @field("sync_status") recordSyncStatus!: string;
  @field("last_synced_at") lastSyncedAt!: number | null;
  @field("deleted_at") deletedAt!: number | null;

  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}
