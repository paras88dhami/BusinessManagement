import {
  createDatabaseFieldEncryptionService,
  isDatabaseFieldEncryptedValue,
} from "@/shared/utils/security/databaseFieldEncryption.service";
import { AuthUserDatasource } from "../dataSource/authUser.datasource";
import { AuthUserModel } from "../dataSource/db/authUser.model";
import {
  AuthOperationResult,
  AuthSessionDatabaseError,
  AuthSessionError,
  AuthSessionUnknownError,
  AuthUserNotFoundError,
  AuthUserResult,
  AuthUsersResult,
  SaveAuthUserPayload,
} from "../../types/authSession.types";
import { AuthUserRepository } from "./authUser.repository";
import { mapAuthUserModelToDomain } from "./mapper/authUser.mapper";

const databaseFieldEncryptionService = createDatabaseFieldEncryptionService();

const encryptIfNeeded = async (value: string): Promise<string> => {
  if (isDatabaseFieldEncryptedValue(value)) {
    return value;
  }

  return databaseFieldEncryptionService.encrypt(value);
};

const encryptNullableIfNeeded = async (
  value: string | null,
): Promise<string | null> => {
  if (value === null || isDatabaseFieldEncryptedValue(value)) {
    return value;
  }

  return databaseFieldEncryptionService.encrypt(value);
};

const buildEncryptedAuthUserPayload = async (
  payload: SaveAuthUserPayload,
): Promise<SaveAuthUserPayload> => {
  return {
    ...payload,
    fullName: await encryptIfNeeded(payload.fullName),
    email: await encryptNullableIfNeeded(payload.email),
    phone: await encryptNullableIfNeeded(payload.phone),
    authProvider: await encryptNullableIfNeeded(payload.authProvider),
    profileImageUrl: await encryptNullableIfNeeded(payload.profileImageUrl),
    preferredLanguage: await encryptNullableIfNeeded(payload.preferredLanguage),
  };
};

const shouldMigrateAuthUserModel = (model: AuthUserModel): boolean => {
  if (!isDatabaseFieldEncryptedValue(model.fullName)) {
    return true;
  }

  const nullableFields = [
    model.email,
    model.phone,
    model.authProvider,
    model.profileImageUrl,
    model.preferredLanguage,
  ];

  return nullableFields.some(
    (fieldValue) =>
      fieldValue !== null && !isDatabaseFieldEncryptedValue(fieldValue),
  );
};

const migrateAuthUserModelIfNeeded = async (
  localDatasource: AuthUserDatasource,
  model: AuthUserModel,
): Promise<void> => {
  if (!shouldMigrateAuthUserModel(model)) {
    return;
  }

  const encryptedPayload = await buildEncryptedAuthUserPayload({
    remoteId: model.remoteId,
    fullName: model.fullName,
    email: model.email,
    phone: model.phone,
    authProvider: model.authProvider,
    profileImageUrl: model.profileImageUrl,
    preferredLanguage: model.preferredLanguage,
    isEmailVerified: model.isEmailVerified,
    isPhoneVerified: model.isPhoneVerified,
  });

  const migrationResult = await localDatasource.saveAuthUser(encryptedPayload);

  if (!migrationResult.success) {
    throw migrationResult.error;
  }
};

const mapAuthUserModel = async (
  localDatasource: AuthUserDatasource,
  model: Parameters<typeof mapAuthUserModelToDomain>[0],
): Promise<AuthUserResult> => {
  try {
    const mappedAuthUser = await mapAuthUserModelToDomain(model);

    await migrateAuthUserModelIfNeeded(localDatasource, model).catch(() => undefined);

    return {
      success: true,
      value: mappedAuthUser,
    };
  } catch (error) {
    return {
      success: false,
      error: mapAuthUserError(error),
    };
  }
};

export const createAuthUserRepository = (
  localDatasource: AuthUserDatasource,
): AuthUserRepository => ({
  async saveAuthUser(payload: SaveAuthUserPayload): Promise<AuthUserResult> {
    try {
      const encryptedPayload = await buildEncryptedAuthUserPayload(payload);
      const result = await localDatasource.saveAuthUser(encryptedPayload);

      if (result.success) {
        return mapAuthUserModel(localDatasource, result.value);
      }

      return {
        success: false,
        error: mapAuthUserError(result.error),
      };
    } catch (error) {
      return {
        success: false,
        error: mapAuthUserError(error),
      };
    }
  },

  async getAuthUserByRemoteId(remoteId: string): Promise<AuthUserResult> {
    const result = await localDatasource.getAuthUserByRemoteId(remoteId.trim());

    if (result.success) {
      return mapAuthUserModel(localDatasource, result.value);
    }

    return {
      success: false,
      error: mapAuthUserError(result.error),
    };
  },

  async getAllAuthUsers(): Promise<AuthUsersResult> {
    const result = await localDatasource.getAllAuthUsers();

    if (result.success) {
      try {
        const mappedUsers = await Promise.all(
          result.value.map((model) => mapAuthUserModelToDomain(model)),
        );

        await Promise.all(
          result.value.map((model) =>
            migrateAuthUserModelIfNeeded(localDatasource, model).catch(
              () => undefined,
            ),
          ),
        );

        return {
          success: true,
          value: mappedUsers,
        };
      } catch (error) {
        return {
          success: false,
          error: mapAuthUserError(error),
        };
      }
    }

    return {
      success: false,
      error: mapAuthUserError(result.error),
    };
  },

  async deleteAuthUserByRemoteId(
    remoteId: string,
  ): Promise<AuthOperationResult> {
    const result = await localDatasource.deleteAuthUserByRemoteId(remoteId.trim());

    if (result.success) {
      return { success: true, value: result.value };
    }

    return {
      success: false,
      error: mapAuthUserError(result.error),
    };
  },

  async clearAllAuthUsers(): Promise<AuthOperationResult> {
    const result = await localDatasource.clearAllAuthUsers();

    if (result.success) {
      return { success: true, value: result.value };
    }

    return {
      success: false,
      error: mapAuthUserError(result.error),
    };
  },
});

const mapAuthUserError = (error: Error | unknown): AuthSessionError => {
  if (!(error instanceof Error)) {
    return AuthSessionUnknownError;
  }

  const message = error.message.toLowerCase();

  if (message.includes("auth user not found")) {
    return AuthUserNotFoundError;
  }

  const isDatabaseError =
    message.includes("table") ||
    message.includes("schema") ||
    message.includes("database") ||
    message.includes("adapter") ||
    message.includes("timeout");

  if (isDatabaseError) {
    return {
      ...AuthSessionDatabaseError,
      message: error.message,
    };
  }

  return {
    ...AuthSessionUnknownError,
    message: error.message,
  };
};
