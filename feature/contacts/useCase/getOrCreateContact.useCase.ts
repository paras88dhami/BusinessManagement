import { AccountTypeValue } from "@/feature/auth/accountSelection/types/accountSelection.types";
import {
    ContactBalanceDirectionValue,
    ContactResult,
    ContactTypeValue,
} from "@/feature/contacts/types/contact.types";

export type GetOrCreateContactPayload = {
  accountRemoteId: string;
  accountType: AccountTypeValue;
  contactType: ContactTypeValue;
  fullName: string;
  ownerUserRemoteId: string;
  phoneNumber?: string | null;
  emailAddress?: string | null;
  address?: string | null;
  taxId?: string | null;
  openingBalanceAmount?: number;
  openingBalanceDirection?: ContactBalanceDirectionValue | null;
  notes?: string | null;
  isArchived?: boolean;
};

export interface GetOrCreateContactUseCase {
  execute(payload: GetOrCreateContactPayload): Promise<ContactResult>;
}
