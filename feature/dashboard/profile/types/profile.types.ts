import { AccountTypeValue } from "@/feature/setting/accounts/accountSelection/types/accountSelection.types";

export type ProfileAccountOption = {
  remoteId: string;
  displayName: string;
  accountType: AccountTypeValue;
  cityOrLocation: string | null;
  isDefault: boolean;
};
