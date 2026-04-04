import { ContactModel } from "./contact.model";
import { contactsTable } from "./contact.schema";

export const contactDbConfig = {
  models: [ContactModel],
  tables: [contactsTable],
};
