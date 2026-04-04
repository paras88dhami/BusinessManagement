import {
  BusinessNoteResult,
  SaveBusinessNotePayload,
  SaveBusinessNoteResult,
} from "@/feature/appSettings/notes/types/notes.types";

export interface BusinessNotesRepository {
  getBusinessNoteByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<BusinessNoteResult>;
  saveBusinessNote(payload: SaveBusinessNotePayload): Promise<SaveBusinessNoteResult>;
}
