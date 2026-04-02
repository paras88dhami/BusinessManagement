import {
  createDatabaseFieldEncryptionService,
  isDatabaseFieldEncryptedValue,
} from "@/shared/utils/security/databaseFieldEncryption.service";
import {
  AuthCredentialNotFoundError,
  AuthCredentialResult,
  AuthOperationResult,
  AuthSessionDatabaseError,
  AuthSessionError,
  AuthSessionUnknownError,
  CredentialTypeValue,
  SaveAuthCredentialPayload,
} from "../../types/authSession.types";
import { AuthCredentialDatasource } from "../dataSource/authCredential.datasource";
import { AuthCredentialModel } from "../dataSource/db/authCredential.model";
import { AuthCredentialRepository } from "./authCredential.repository";
import { mapAuthCredentialModelToDomain } from "./mapper/authCredential.mapper";

const databaseFieldEncryptionService = createDatabaseFieldEncryptionService();

const normalizeLoginId = (loginId: string): string => loginId.trim();

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

const buildEncryptedCredentialPayload = async (
  payload: SaveAuthCredentialPayload,
): Promise<SaveAuthCredentialPayload> => {
  return {
    ...payload,
    loginId: normalizeLoginId(payload.loginId),
    passwordHash: await encryptIfNeeded(payload.passwordHash),
    passwordSalt: await encryptIfNeeded(payload.passwordSalt),
    hint: await encryptNullableIfNeeded(payload.hint),
  };
};

const shouldMigrateCredentialModel = (model: AuthCredentialModel): boolean => {
  if (!isDatabaseFieldEncryptedValue(model.passwordHash)) {
    return true;
  }

  if (!isDatabaseFieldEncryptedValue(model.passwordSalt)) {
    return true;
  }

  if (model.hint !== null && !isDatabaseFieldEncryptedValue(model.hint)) {
    return true;
  }

  return false;
};

const migrateCredentialModelIfNeeded = async (
  localDatasource: AuthCredentialDatasource,
  model: AuthCredentialModel,
): Promise<void> => {
  if (!shouldMigrateCredentialModel(model)) {
    return;
  }

  const encryptedPayload = await buildEncryptedCredentialPayload({
    remoteId: model.remoteId,
    userRemoteId: model.userRemoteId,
    loginId: model.loginId,
    credentialType: model.credentialType,
    passwordHash: model.passwordHash,
    passwordSalt: model.passwordSalt,
    hint: model.hint,
    isActive: model.isActive,
  });

  const migrationResult = await localDatasource.saveAuthCredential(
    encryptedPayload,
  );

  if (!migrationResult.success) {
    throw migrationResult.error;
  }
};

const mapCredentialModel = async (
  localDatasource: AuthCredentialDatasource,
  model: Parameters<typeof mapAuthCredentialModelToDomain>[0],
): Promise<AuthCredentialResult> => {
  try {
    const mappedCredential = await mapAuthCredentialModelToDomain(model);

    await migrateCredentialModelIfNeeded(localDatasource, model).catch((error) => {
      console.error(
        "Failed to migrate auth credential encryption state.",
        error,
      );
    });

    return {
      success: true,
      value: mappedCredential,
    };
  } catch (error) {
    return {
      success: false,
      error: mapAuthCredentialError(error),
    };
  }
};

export const createAuthCredentialRepository = (
  localDatasource: AuthCredentialDatasource,
): AuthCredentialRepository => ({
  async saveAuthCredential(
    payload: SaveAuthCredentialPayload,
  ): Promise<AuthCredentialResult> {
    try {
      const encryptedPayload = await buildEncryptedCredentialPayload(payload);
      const result = await localDatasource.saveAuthCredential(encryptedPayload);

      if (result.success) {
        return mapCredentialModel(localDatasource, result.value);
      }

      return {
        success: false,
        error: mapAuthCredentialError(result.error),
      };
    } catch (error) {
      return {
        success: false,
        error: mapAuthCredentialError(error),
      };
    }
  },

  async getActiveAuthCredentialByLoginId(
    loginId: string,
    credentialType: CredentialTypeValue,
  ): Promise<AuthCredentialResult> {
    const result = await localDatasource.getActiveAuthCredentialByLoginId(
      normalizeLoginId(loginId),
      credentialType,
    );

    if (result.success) {
      return mapCredentialModel(localDatasource, result.value);
    }

    return {
      success: false,
      error: mapAuthCredentialError(result.error),
    };
  },

  async getAuthCredentialByLoginId(
    loginId: string,
    credentialType: CredentialTypeValue,
  ): Promise<AuthCredentialResult> {
    const result = await localDatasource.getAuthCredentialByLoginId(
      normalizeLoginId(loginId),
      credentialType,
    );

    if (result.success) {
      return mapCredentialModel(localDatasource, result.value);
    }

    return {
      success: false,
      error: mapAuthCredentialError(result.error),
    };
  },

  async getAuthCredentialByUserRemoteId(
    userRemoteId: string,
  ): Promise<AuthCredentialResult> {
    const result = await localDatasource.getAuthCredentialByUserRemoteId(
      userRemoteId.trim(),
    );

    if (result.success) {
      return mapCredentialModel(localDatasource, result.value);
    }

    return {
      success: false,
      error: mapAuthCredentialError(result.error),
    };
  },

  async recordFailedLoginAttemptByRemoteId(
    remoteId: string,
    failedAttemptCount: number,
    lockoutUntil: number | null,
    lastFailedLoginAt: number,
  ): Promise<AuthCredentialResult> {
    const result = await localDatasource.recordFailedLoginAttemptByRemoteId(
      remoteId.trim(),
      failedAttemptCount,
      lockoutUntil,
      lastFailedLoginAt,
    );

    if (result.success) {
      return mapCredentialModel(localDatasource, result.value);
    }

    return {
      success: false,
      error: mapAuthCredentialError(result.error),
    };
  },

  async markLoginSuccessByRemoteId(
    remoteId: string,
    lastLoginAt: number,
  ): Promise<AuthOperationResult> {
    const result = await localDatasource.markLoginSuccessByRemoteId(
      remoteId.trim(),
      lastLoginAt,
    );

    if (result.success) {
      return { success: true, value: result.value };
    }

    return {
      success: false,
      error: mapAuthCredentialError(result.error),
    };
  },

  async updateLastLoginAtByRemoteId(
    remoteId: string,
    lastLoginAt: number,
  ): Promise<AuthOperationResult> {
    const result = await localDatasource.updateLastLoginAtByRemoteId(
      remoteId.trim(),
      lastLoginAt,
    );

    if (result.success) {
      return { success: true, value: result.value };
    }

    return {
      success: false,
      error: mapAuthCredentialError(result.error),
    };
  },

  async deactivateAuthCredentialByRemoteId(
    remoteId: string,
  ): Promise<AuthOperationResult> {
    const result = await localDatasource.deactivateAuthCredentialByRemoteId(
      remoteId.trim(),
    );

    if (result.success) {
      return { success: true, value: result.value };
    }

    return {
      success: false,
      error: mapAuthCredentialError(result.error),
    };
  },

  async deleteAuthCredentialByRemoteId(
    remoteId: string,
  ): Promise<AuthOperationResult> {
    const result = await localDatasource.deleteAuthCredentialByRemoteId(
      remoteId.trim(),
    );

    if (result.success) {
      return { success: true, value: result.value };
    }

    return {
      success: false,
      error: mapAuthCredentialError(result.error),
    };
  },
});

const mapAuthCredentialError = (error: Error | unknown): AuthSessionError => {
  if (!(error instanceof Error)) {
    return AuthSessionUnknownError;
  }

  const message = error.message.toLowerCase();

  if (
    message.includes("auth credential not found") ||
    message.includes("active auth credential not found")
  ) {
    return AuthCredentialNotFoundError;
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
