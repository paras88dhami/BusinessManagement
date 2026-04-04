import { BusinessNotesRepository } from "@/feature/appSettings/notes/data/repository/notes.repository";
import {
  BusinessNoteResult,
  BusinessNotesValidationError,
} from "@/feature/appSettings/notes/types/notes.types";
import { GetBusinessNoteUseCase } from "./getBusinessNote.useCase";

export const createGetBusinessNoteUseCase = (
  repository: BusinessNotesRepository,
): GetBusinessNoteUseCase => ({
  async execute(accountRemoteId: string): Promise<BusinessNoteResult> {
    if (!accountRemoteId.trim()) {
      return {
        success: false,
        error: BusinessNotesValidationError("Notes require an active account."),
      };
    }

    return repository.getBusinessNoteByAccountRemoteId(accountRemoteId);
  },
});
