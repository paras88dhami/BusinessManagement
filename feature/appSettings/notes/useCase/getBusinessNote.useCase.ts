import { BusinessNoteResult } from "@/feature/appSettings/notes/types/notes.types";

export interface GetBusinessNoteUseCase {
  execute(accountRemoteId: string): Promise<BusinessNoteResult>;
}
