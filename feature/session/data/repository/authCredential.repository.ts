import {
  AuthCredentialResult,
  AuthOperationResult,
  CredentialTypeValue,
  SaveAuthCredentialPayload,
} from "../../types/authSession.types";

export interface AuthCredentialRepository {
  saveAuthCredential(
    payload: SaveAuthCredentialPayload,
  ): Promise<AuthCredentialResult>;
  getActiveAuthCredentialByLoginId(
    loginId: string,
    credentialType: CredentialTypeValue,
  ): Promise<AuthCredentialResult>;
  getAuthCredentialByUserRemoteId(
    userRemoteId: string,
  ): Promise<AuthCredentialResult>;
  recordFailedLoginAttemptByRemoteId(
    remoteId: string,
    failedAttemptCount: number,
    lockoutUntil: number | null,
    lastFailedLoginAt: number,
  ): Promise<AuthCredentialResult>;
  markLoginSuccessByRemoteId(
    remoteId: string,
    lastLoginAt: number,
  ): Promise<AuthOperationResult>;
  updateLastLoginAtByRemoteId(
    remoteId: string,
    lastLoginAt: number,
  ): Promise<AuthOperationResult>;
  deactivateAuthCredentialByRemoteId(
    remoteId: string,
  ): Promise<AuthOperationResult>;
  deleteAuthCredentialByRemoteId(remoteId: string): Promise<AuthOperationResult>;
}
