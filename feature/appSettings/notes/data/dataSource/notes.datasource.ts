import { Result } from "@/shared/types/result.types";
import { BusinessNoteModel } from "./db/businessNote.model";

export interface BusinessNotesDatasource {
  getBusinessNoteByAccountRemoteId(
    accountRemoteId: string,
  ): Promise<Result<BusinessNoteModel | null>>;
  saveBusinessNoteByAccountRemoteId(params: {
    accountRemoteId: string;
    noteContent: string;
  }): Promise<Result<BusinessNoteModel>>;
}
