import { Control } from "react-hook-form";
import { LoginInput } from "@/feature/auth/login/types/login.types";
import { SignUpInput } from "@/feature/auth/signUp/types/signUp.types";

interface AuthEntryLoginViewModel {
  control: Control<LoginInput>;
  clearSubmitError: () => void;
  isPasswordVisible: boolean;
  togglePasswordVisibility: () => void;
  isSubmitting: boolean;
  submitError?: string;
  submit: () => Promise<void>;
}

interface AuthEntrySignUpViewModel {
  control: Control<SignUpInput>;
  clearSubmitError: () => void;
  isPasswordVisible: boolean;
  togglePasswordVisibility: () => void;
  isSubmitting: boolean;
  submitError?: string;
  submit: () => Promise<void>;
}

export interface AuthEntryViewModel {
  login: AuthEntryLoginViewModel;
  signUp: AuthEntrySignUpViewModel;
  onForgotPasswordPress?: () => void;
}
