import { Model } from "@nozbe/watermelondb";
import { date, field, readonly } from "@nozbe/watermelondb/decorators";

export class BusinessNoteModel extends Model {
  static table = "business_notes";

  @field("account_remote_id") accountRemoteId!: string;
  @field("note_content") noteContent!: string | null;

  @readonly
  @date("created_at")
  createdAt!: Date;

  @readonly
  @date("updated_at")
  updatedAt!: Date;
}
