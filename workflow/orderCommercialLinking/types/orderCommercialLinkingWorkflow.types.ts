import { Contact } from "@/feature/contacts/types/contact.types";
import { Order, OrderError } from "@/feature/orders/types/order.types";
import { Result } from "@/shared/types/result.types";

export type OrderCommercialLinkingWorkflowInput = {
  orderRemoteId: string;
};

export type OrderCommercialLinkingWorkflowValue = {
  order: Order;
  contact: Contact;
  billingDocumentRemoteId: string;
  ledgerDueEntryRemoteId: string;
};

export type OrderCommercialLinkingWorkflowResult = Result<
  OrderCommercialLinkingWorkflowValue,
  OrderError
>;
