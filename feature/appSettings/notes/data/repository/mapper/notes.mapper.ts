import { BusinessNote } from "@/feature/appSettings/notes/types/notes.types";
import { BusinessNoteModel } from "@/feature/appSettings/notes/data/dataSource/db/businessNote.model";

export const mapBusinessNoteModelToEntity = (
  model: BusinessNoteModel,
): BusinessNote => ({
  accountRemoteId: model.accountRemoteId,
  noteContent: model.noteContent ?? "",
  createdAt: model.createdAt.getTime(),
  updatedAt: model.updatedAt.getTime(),
});
