import {
  SaveBusinessNotePayload,
  SaveBusinessNoteResult,
} from "@/feature/appSettings/notes/types/notes.types";

export interface SaveBusinessNoteUseCase {
  execute(payload: SaveBusinessNotePayload): Promise<SaveBusinessNoteResult>;
}
