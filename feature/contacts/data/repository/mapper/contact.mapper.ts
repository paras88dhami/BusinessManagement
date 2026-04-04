import { Contact } from "@/feature/contacts/types/contact.types";
import { ContactModel } from "@/feature/contacts/data/dataSource/db/contact.model";

export const mapContactModelToEntity = (model: ContactModel): Contact => ({
  remoteId: model.remoteId,
  ownerUserRemoteId: model.ownerUserRemoteId,
  accountRemoteId: model.accountRemoteId,
  accountType: model.accountType,
  contactType: model.contactType,
  fullName: model.fullName,
  phoneNumber: model.phoneNumber,
  emailAddress: model.emailAddress,
  address: model.address,
  taxId: model.taxId,
  openingBalanceAmount: model.openingBalanceAmount,
  openingBalanceDirection: model.openingBalanceDirection,
  notes: model.notes,
  isArchived: model.isArchived,
  createdAt: model.createdAt.getTime(),
  updatedAt: model.updatedAt.getTime(),
});
