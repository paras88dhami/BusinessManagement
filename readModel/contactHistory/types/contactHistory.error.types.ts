export const ContactHistoryErrorType = {
  DatabaseError: "DATABASE_ERROR",
  ValidationError: "VALIDATION_ERROR",
  ContactNotFound: "CONTACT_NOT_FOUND",
  UnknownError: "UNKNOWN_ERROR",
} as const;

export type ContactHistoryError = {
  type: (typeof ContactHistoryErrorType)[keyof typeof ContactHistoryErrorType];
  message: string;
};

export const ContactHistoryDatabaseError: ContactHistoryError = {
  type: ContactHistoryErrorType.DatabaseError,
  message: "Unable to load contact history right now. Please try again.",
};

export const ContactHistoryValidationError = (
  message: string,
): ContactHistoryError => ({
  type: ContactHistoryErrorType.ValidationError,
  message,
});

export const ContactHistoryNotFoundError: ContactHistoryError = {
  type: ContactHistoryErrorType.ContactNotFound,
  message: "The requested contact could not be found.",
};

export const ContactHistoryUnknownError: ContactHistoryError = {
  type: ContactHistoryErrorType.UnknownError,
  message: "An unexpected contact history error occurred.",
};
