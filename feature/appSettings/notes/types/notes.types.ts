import { Result } from "@/shared/types/result.types";

export type BusinessNote = {
  accountRemoteId: string;
  noteContent: string;
  createdAt: number;
  updatedAt: number;
};

export type SaveBusinessNotePayload = {
  accountRemoteId: string;
  noteContent: string;
};

export const BusinessNotesErrorType = {
  ValidationError: "VALIDATION_ERROR",
  DataSourceError: "DATASOURCE_ERROR",
  UnknownError: "UNKNOWN_ERROR",
} as const;

export type BusinessNotesError = {
  type: (typeof BusinessNotesErrorType)[keyof typeof BusinessNotesErrorType];
  message: string;
};

export const BusinessNotesValidationError = (
  message: string,
): BusinessNotesError => ({
  type: BusinessNotesErrorType.ValidationError,
  message,
});

export const BusinessNotesDatasourceError: BusinessNotesError = {
  type: BusinessNotesErrorType.DataSourceError,
  message: "Unable to load notes right now. Please try again.",
};

export const BusinessNotesUnknownError: BusinessNotesError = {
  type: BusinessNotesErrorType.UnknownError,
  message: "An unexpected notes error occurred.",
};

export type BusinessNoteResult = Result<BusinessNote | null, BusinessNotesError>;
export type SaveBusinessNoteResult = Result<BusinessNote, BusinessNotesError>;
