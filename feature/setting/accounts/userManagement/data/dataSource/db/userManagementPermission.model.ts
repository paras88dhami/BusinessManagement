import { Model } from "@nozbe/watermelondb";
import { date, field, readonly } from "@nozbe/watermelondb/decorators";

export class UserManagementPermissionModel extends Model {
  static table = "user_management_permissions";

  @field("code") code!: string;
  @field("module") module!: string;
  @field("label") label!: string;
  @field("description") description!: string;

  @readonly
  @date("created_at")
  createdAt!: Date;

  @readonly
  @date("updated_at")
  updatedAt!: Date;
}
