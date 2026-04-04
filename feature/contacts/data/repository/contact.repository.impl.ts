import {
  ContactDatabaseError,
  ContactNotFoundError,
  ContactOperationResult,
  ContactResult,
  ContactsResult,
  ContactUnknownError,
  ContactValidationError,
  SaveContactPayload,
} from "@/feature/contacts/types/contact.types";
import { ContactDatasource } from "@/feature/contacts/data/dataSource/contact.datasource";
import { mapContactModelToEntity } from "./mapper/contact.mapper";
import { ContactRepository } from "./contact.repository";

const mapDatasourceError = (error: Error) => {
  const normalizedMessage = error.message.trim().toLowerCase();

  if (normalizedMessage.includes("not found")) {
    return ContactNotFoundError;
  }

  if (
    normalizedMessage.includes("required") ||
    normalizedMessage.includes("invalid")
  ) {
    return ContactValidationError(error.message);
  }

  if (normalizedMessage.includes("database")) {
    return ContactDatabaseError;
  }

  return {
    ...ContactUnknownError,
    message: error.message || ContactUnknownError.message,
  };
};

export const createContactRepository = (
  datasource: ContactDatasource,
): ContactRepository => ({
  async getContactsByAccountRemoteId(accountRemoteId: string): Promise<ContactsResult> {
    const result = await datasource.getContactsByAccountRemoteId(accountRemoteId);
    if (!result.success) {
      return { success: false, error: mapDatasourceError(result.error) };
    }

    return {
      success: true,
      value: result.value.map(mapContactModelToEntity),
    };
  },

  async getContactByRemoteId(remoteId: string): Promise<ContactResult> {
    const result = await datasource.getContactByRemoteId(remoteId);
    if (!result.success) {
      return { success: false, error: mapDatasourceError(result.error) };
    }

    return {
      success: true,
      value: mapContactModelToEntity(result.value),
    };
  },

  async saveContact(payload: SaveContactPayload): Promise<ContactResult> {
    const result = await datasource.saveContact(payload);
    if (!result.success) {
      return { success: false, error: mapDatasourceError(result.error) };
    }

    return {
      success: true,
      value: mapContactModelToEntity(result.value),
    };
  },

  async archiveContactByRemoteId(
    remoteId: string,
  ): Promise<ContactOperationResult> {
    const result = await datasource.archiveContactByRemoteId(remoteId);
    if (!result.success) {
      return { success: false, error: mapDatasourceError(result.error) };
    }

    return result;
  },
});
