import { ContactHistoryRepository } from "@/shared/readModel/contactHistory/data/repository/contactHistory.repository";
import { ContactHistoryError } from "@/shared/readModel/contactHistory/types/contactHistory.error.types";
import { ContactHistoryValidationError } from "@/shared/readModel/contactHistory/types/contactHistory.error.types";
import { ContactHistoryQuery } from "@/shared/readModel/contactHistory/types/contactHistory.query.types";
import { ContactHistoryReadModel } from "@/shared/readModel/contactHistory/types/contactHistory.readModel.types";
import { Result } from "@/shared/types/result.types";
import { GetContactHistoryReadModelUseCase } from "./getContactHistoryReadModel.useCase";

class GetContactHistoryReadModelUseCaseImpl
  implements GetContactHistoryReadModelUseCase
{
  constructor(private readonly repository: ContactHistoryRepository) {}

  async execute(
    query: ContactHistoryQuery,
  ): Promise<Result<ContactHistoryReadModel, ContactHistoryError>> {
    const normalizedAccountRemoteId = query.accountRemoteId.trim();
    const normalizedContactRemoteId = query.contactRemoteId.trim();

    if (!normalizedAccountRemoteId) {
      return {
        success: false,
        error: ContactHistoryValidationError(
          "An active account is required to load contact history.",
        ),
      };
    }

    if (!normalizedContactRemoteId) {
      return {
        success: false,
        error: ContactHistoryValidationError(
          "A contact id is required to load contact history.",
        ),
      };
    }

    return this.repository.getContactHistoryReadModel({
      ...query,
      accountRemoteId: normalizedAccountRemoteId,
      contactRemoteId: normalizedContactRemoteId,
      timelineLimit: query.timelineLimit ?? 50,
    });
  }
}

export const createGetContactHistoryReadModelUseCase = (
  repository: ContactHistoryRepository,
): GetContactHistoryReadModelUseCase =>
  new GetContactHistoryReadModelUseCaseImpl(repository);

