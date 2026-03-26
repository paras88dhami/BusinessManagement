import { VerifiedLocalCredential } from "@/feature/session/types/authSession.types";
import { Result } from "@/shared/types/result.types";
import { Status } from "@/shared/types/status.types";

export const SignUpErrorType = {
  ValidationError: "VALIDATION_ERROR",
  EmailAlreadyInUse: "EMAIL_ALREADY_IN_USE",
  DatabaseError: "DATABASE_ERROR",
  UnknownError: "UNKNOWN_ERROR",
} as const;

export type SignUpError = {
  type: (typeof SignUpErrorType)[keyof typeof SignUpErrorType];
  message: string;
};

export const ValidationError = (message: string): SignUpError => ({
  type: SignUpErrorType.ValidationError,
  message,
});

export const EmailAlreadyInUseError: SignUpError = {
  type: SignUpErrorType.EmailAlreadyInUse,
  message: "An account with this email already exists.",
};

export const DatabaseError: SignUpError = {
  type: SignUpErrorType.DatabaseError,
  message: "Unable to process your request right now. Please try again.",
};

export const UnknownError: SignUpError = {
  type: SignUpErrorType.UnknownError,
  message: "An unexpected error occurred.",
};

export type SignUpInput = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

export type SignUpResult = Result<VerifiedLocalCredential, SignUpError>;

export type SignUpState =
  | { status: typeof Status.Idle }
  | { status: typeof Status.Loading }
  | { status: typeof Status.Success }
  | { status: typeof Status.Failure; error: string };
