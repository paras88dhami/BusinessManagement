import { BusinessNotesRepository } from "@/feature/appSettings/notes/data/repository/notes.repository";
import {
  SaveBusinessNotePayload,
  SaveBusinessNoteResult,
  BusinessNotesValidationError,
} from "@/feature/appSettings/notes/types/notes.types";
import { SaveBusinessNoteUseCase } from "./saveBusinessNote.useCase";

export const createSaveBusinessNoteUseCase = (
  repository: BusinessNotesRepository,
): SaveBusinessNoteUseCase => ({
  async execute(payload: SaveBusinessNotePayload): Promise<SaveBusinessNoteResult> {
    if (!payload.accountRemoteId.trim()) {
      return {
        success: false,
        error: BusinessNotesValidationError("Notes require an active account."),
      };
    }

    return repository.saveBusinessNote({
      accountRemoteId: payload.accountRemoteId,
      noteContent: payload.noteContent,
    });
  },
});
