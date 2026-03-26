import { Model } from "@nozbe/watermelondb";
import { field, readonly, date } from "@nozbe/watermelondb/decorators";

export class AuthCredentialModel extends Model {
  static table = "auth_credentials";

  @field("remote_id") remoteId!: string;
  @field("user_remote_id") userRemoteId!: string;
  @field("login_id") loginId!: string;
  @field("credential_type") credentialType!: "password" | "pin";
  @field("password_hash") passwordHash!: string;
  @field("password_salt") passwordSalt!: string;
  @field("hint") hint!: string | null;
  @field("last_login_at") lastLoginAt!: number | null;
  @field("is_active") isActive!: boolean;

  @field("sync_status") recordSyncStatus!: "pending" | "synced" | "failed";
  @field("last_synced_at") lastSyncedAt!: number | null;
  @field("deleted_at") deletedAt!: number | null;

  @readonly
  @date("created_at")
  createdAt!: Date;

  @readonly
  @date("updated_at")
  updatedAt!: Date;
}
