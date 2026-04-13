import {
    ContactResult,
    ContactTypeValue,
} from "@/feature/contacts/types/contact.types";

export type GetOrCreateBusinessContactPayload = {
  accountRemoteId: string;
  contactType: ContactTypeValue;
  fullName: string;
  ownerUserRemoteId: string;
  phoneNumber?: string | null;
  address?: string | null;
  notes?: string | null;
};

export interface GetOrCreateBusinessContactUseCase {
  execute(payload: GetOrCreateBusinessContactPayload): Promise<ContactResult>;
}
