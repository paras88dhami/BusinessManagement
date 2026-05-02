import { ContactHistoryError } from "@/shared/readModel/contactHistory/types/contactHistory.error.types";
import { ContactHistoryQuery } from "@/shared/readModel/contactHistory/types/contactHistory.query.types";
import { ContactHistoryReadModel } from "@/shared/readModel/contactHistory/types/contactHistory.readModel.types";
import { Result } from "@/shared/types/result.types";

export interface GetContactHistoryReadModelUseCase {
  execute(
    query: ContactHistoryQuery,
  ): Promise<Result<ContactHistoryReadModel, ContactHistoryError>>;
}

