import { AccountType } from "@/feature/auth/accountSelection/types/accountSelection.types";
import {
    GetOrCreateBusinessContactPayload,
    GetOrCreateBusinessContactUseCase,
} from "@/feature/contacts/useCase/getOrCreateBusinessContact.useCase";
import { GetOrCreateContactUseCase } from "@/feature/contacts/useCase/getOrCreateContact.useCase";

export const createGetOrCreateBusinessContactUseCase = (
  getOrCreateContactUseCase: GetOrCreateContactUseCase,
): GetOrCreateBusinessContactUseCase => ({
  execute(payload: GetOrCreateBusinessContactPayload) {
    return getOrCreateContactUseCase.execute({
      accountRemoteId: payload.accountRemoteId,
      accountType: AccountType.Business,
      contactType: payload.contactType,
      fullName: payload.fullName,
      ownerUserRemoteId: payload.ownerUserRemoteId,
      phoneNumber: payload.phoneNumber ?? null,
      emailAddress: null,
      address: payload.address ?? null,
      taxId: null,
      openingBalanceAmount: 0,
      openingBalanceDirection: null,
      notes: payload.notes ?? null,
      isArchived: false,
    });
  },
});
