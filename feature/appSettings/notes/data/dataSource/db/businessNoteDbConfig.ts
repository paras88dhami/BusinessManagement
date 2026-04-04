import { BusinessNoteModel } from "./businessNote.model";
import { businessNotesTable } from "./businessNote.schema";

export const businessNotesDbConfig = {
  models: [BusinessNoteModel],
  tables: [businessNotesTable],
};
