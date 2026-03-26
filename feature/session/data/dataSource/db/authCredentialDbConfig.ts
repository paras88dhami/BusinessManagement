import { AuthCredentialModel } from "./authCredential.model";
import { authCredentialsTable } from "./authCredential.schema";

export const authCredentialDbConfig = {
  models: [AuthCredentialModel],
  tables: [authCredentialsTable],
};