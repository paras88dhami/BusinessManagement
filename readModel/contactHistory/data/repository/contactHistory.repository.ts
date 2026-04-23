import { ContactHistoryError } from "@/readModel/contactHistory/types/contactHistory.error.types";
import { ContactHistoryQuery } from "@/readModel/contactHistory/types/contactHistory.query.types";
import { ContactHistoryReadModel } from "@/readModel/contactHistory/types/contactHistory.readModel.types";
import { Result } from "@/shared/types/result.types";

export interface ContactHistoryRepository {
  getContactHistoryReadModel(
    query: ContactHistoryQuery,
  ): Promise<Result<ContactHistoryReadModel, ContactHistoryError>>;
}
