import {
  ContactBalanceDirection,
  ContactType,
  ContactTypeValue,
  SaveContactPayload,
} from "@/feature/contacts/types/contact.types";
import { normalizePhoneForIdentity } from "@/feature/contacts/shared/contactPhoneIdentity.shared";
import { RecordSyncStatus } from "@/feature/session/types/authSession.types";
import {
  AccountType,
  AccountTypeValue,
} from "@/feature/auth/accountSelection/types/accountSelection.types";
import { Result } from "@/shared/types/result.types";
import { Database, Q } from "@nozbe/watermelondb";
import { ContactDatasource } from "./contact.datasource";
import { ContactModel } from "./db/contact.model";

const CONTACTS_TABLE = "contacts";

type MutableRawTimestamps = {
  _raw: Record<"created_at" | "updated_at", number>;
};

const normalizeRequired = (value: string): string => value.trim();
const normalizeOptional = (value: string | null): string | null => {
  if (value === null) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const setCreatedAndUpdatedAt = (record: unknown, now: number): void => {
  (record as MutableRawTimestamps)._raw.created_at = now;
  (record as MutableRawTimestamps)._raw.updated_at = now;
};

const setUpdatedAt = (record: unknown, now: number): void => {
  (record as MutableRawTimestamps)._raw.updated_at = now;
};

const updateSyncStatusOnMutation = (record: ContactModel): void => {
  if (
    !record.recordSyncStatus ||
    record.recordSyncStatus === RecordSyncStatus.Synced
  ) {
    record.recordSyncStatus = RecordSyncStatus.PendingUpdate;
  }
};

const isValidAccountType = (value: string): value is AccountTypeValue => {
  return value === AccountType.Personal || value === AccountType.Business;
};

const isValidContactType = (value: string): value is ContactTypeValue => {
  return Object.values(ContactType).includes(value as ContactTypeValue);
};

const findByRemoteId = async (
  database: Database,
  remoteId: string,
): Promise<ContactModel | null> => {
  const collection = database.get<ContactModel>(CONTACTS_TABLE);
  const matching = await collection.query(Q.where("remote_id", remoteId)).fetch();
  return matching[0] ?? null;
};

const findDuplicateActiveContactByIdentityPhone = async (
  database: Database,
  params: {
    accountRemoteId: string;
    contactType: ContactTypeValue;
    normalizedPhoneNumber: string | null;
    excludeRemoteId: string;
  },
): Promise<ContactModel | null> => {
  if (!params.normalizedPhoneNumber) {
    return null;
  }

  const collection = database.get<ContactModel>(CONTACTS_TABLE);
  const matches = await collection
    .query(
      Q.where("account_remote_id", params.accountRemoteId),
      Q.where("contact_type", params.contactType),
      Q.where("normalized_phone_number", params.normalizedPhoneNumber),
      Q.where("deleted_at", Q.eq(null)),
    )
    .fetch();

  return (
    matches.find((contact) => contact.remoteId !== params.excludeRemoteId) ?? null
  );
};

export const createLocalContactDatasource = (
  database: Database,
): ContactDatasource => ({
  async saveContact(payload: SaveContactPayload): Promise<Result<ContactModel>> {
    try {
      const normalizedRemoteId = normalizeRequired(payload.remoteId);
      const normalizedOwnerUserRemoteId = normalizeRequired(
        payload.ownerUserRemoteId,
      );
      const normalizedAccountRemoteId = normalizeRequired(payload.accountRemoteId);
      const normalizedFullName = normalizeRequired(payload.fullName);
      const normalizedPhoneNumber = normalizeOptional(payload.phoneNumber);
      const normalizedEmailAddress = normalizeOptional(payload.emailAddress);
      const normalizedAddress = normalizeOptional(payload.address);
      const normalizedTaxId = normalizeOptional(payload.taxId);
      const normalizedNotes = normalizeOptional(payload.notes);

      if (!normalizedRemoteId) throw new Error("Contact remote id is required");
      if (!normalizedOwnerUserRemoteId) {
        throw new Error("Owner user remote id is required");
      }
      if (!normalizedAccountRemoteId) {
        throw new Error("Account remote id is required");
      }
      if (!normalizedFullName) throw new Error("Full name is required");
      if (!isValidAccountType(payload.accountType)) {
        throw new Error("Account type is required");
      }
      if (!isValidContactType(payload.contactType)) {
        throw new Error("Contact type is required");
      }
      if (!(payload.openingBalanceAmount >= 0)) {
        throw new Error("Opening balance is invalid");
      }
      if (
        payload.openingBalanceAmount > 0 &&
        payload.openingBalanceDirection !== ContactBalanceDirection.Receive &&
        payload.openingBalanceDirection !== ContactBalanceDirection.Pay
      ) {
        throw new Error("Opening balance direction is required");
      }
      if (
        payload.openingBalanceAmount === 0 &&
        payload.openingBalanceDirection !== null
      ) {
        throw new Error("Zero opening balance cannot have a direction");
      }

      const normalizedPhoneIdentity = normalizePhoneForIdentity(
        normalizedPhoneNumber,
      );

      const duplicateIdentityPhoneContact =
        await findDuplicateActiveContactByIdentityPhone(database, {
          accountRemoteId: normalizedAccountRemoteId,
          contactType: payload.contactType,
          normalizedPhoneNumber: normalizedPhoneIdentity,
          excludeRemoteId: normalizedRemoteId,
        });

      if (duplicateIdentityPhoneContact) {
        throw new Error(
          "A contact with this phone number already exists for this contact type in this account.",
        );
      }

      const existingContact = await findByRemoteId(database, normalizedRemoteId);
      if (existingContact) {
        await database.write(async () => {
          await existingContact.update((record) => {
            record.ownerUserRemoteId = normalizedOwnerUserRemoteId;
            record.accountRemoteId = normalizedAccountRemoteId;
            record.accountType = payload.accountType;
            record.contactType = payload.contactType;
            record.fullName = normalizedFullName;
            record.phoneNumber = normalizedPhoneNumber;
            record.normalizedPhoneNumber = normalizedPhoneIdentity;
            record.emailAddress = normalizedEmailAddress;
            record.address = normalizedAddress;
            record.taxId = normalizedTaxId;
            record.openingBalanceAmount = payload.openingBalanceAmount;
            record.openingBalanceDirection = payload.openingBalanceDirection;
            record.notes = normalizedNotes;
            record.isArchived = payload.isArchived;
            updateSyncStatusOnMutation(record);
            setUpdatedAt(record, Date.now());
          });
        });
        return { success: true, value: existingContact };
      }

      const collection = database.get<ContactModel>(CONTACTS_TABLE);
      let created!: ContactModel;
      await database.write(async () => {
        created = await collection.create((record) => {
          const now = Date.now();
          record.remoteId = normalizedRemoteId;
          record.ownerUserRemoteId = normalizedOwnerUserRemoteId;
          record.accountRemoteId = normalizedAccountRemoteId;
          record.accountType = payload.accountType;
          record.contactType = payload.contactType;
          record.fullName = normalizedFullName;
          record.phoneNumber = normalizedPhoneNumber;
          record.normalizedPhoneNumber = normalizedPhoneIdentity;
          record.emailAddress = normalizedEmailAddress;
          record.address = normalizedAddress;
          record.taxId = normalizedTaxId;
          record.openingBalanceAmount = payload.openingBalanceAmount;
          record.openingBalanceDirection = payload.openingBalanceDirection;
          record.notes = normalizedNotes;
          record.isArchived = payload.isArchived;
          record.recordSyncStatus = RecordSyncStatus.PendingCreate;
          record.lastSyncedAt = null;
          record.deletedAt = null;
          setCreatedAndUpdatedAt(record, now);
        });
      });

      return { success: true, value: created };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async getContactsByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<Result<ContactModel[]>> {
    try {
      const normalizedAccountRemoteId = normalizeRequired(accountRemoteId);
      if (!normalizedAccountRemoteId) {
        throw new Error("Account remote id is required");
      }

      const collection = database.get<ContactModel>(CONTACTS_TABLE);
      const contacts = await collection
        .query(
          Q.where("account_remote_id", normalizedAccountRemoteId),
          Q.where("deleted_at", Q.eq(null)),
          Q.where("is_archived", false),
          Q.sortBy("updated_at", Q.desc),
        )
        .fetch();

      return { success: true, value: contacts };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async getContactByRemoteId(remoteId: string): Promise<Result<ContactModel>> {
    try {
      const normalizedRemoteId = normalizeRequired(remoteId);
      if (!normalizedRemoteId) throw new Error("Contact remote id is required");

      const existingContact = await findByRemoteId(database, normalizedRemoteId);
      if (!existingContact || existingContact.deletedAt !== null) {
        throw new Error("Contact not found");
      }

      return { success: true, value: existingContact };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  async archiveContactByRemoteId(remoteId: string): Promise<Result<boolean>> {
    try {
      const normalizedRemoteId = normalizeRequired(remoteId);
      if (!normalizedRemoteId) throw new Error("Contact remote id is required");

      const existingContact = await findByRemoteId(database, normalizedRemoteId);
      if (!existingContact) throw new Error("Contact not found");

      await database.write(async () => {
        await existingContact.update((record) => {
          record.isArchived = true;
          record.deletedAt = Date.now();
          record.recordSyncStatus = RecordSyncStatus.PendingDelete;
          setUpdatedAt(record, Date.now());
        });
      });

      return { success: true, value: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },
});
