import {
  ContactResult,
  SaveContactPayload,
} from "@/feature/contacts/types/contact.types";

export interface SaveContactUseCase {
  execute(payload: SaveContactPayload): Promise<ContactResult>;
}
