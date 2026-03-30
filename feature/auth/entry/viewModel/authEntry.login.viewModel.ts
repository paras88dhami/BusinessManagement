import { Control } from "react-hook-form";
import {
  LoginFormInput,
  LoginPhoneCountryCode,
} from "@/feature/auth/login/types/login.types";
import { SignUpPhoneCountryOption } from "@/feature/auth/signUp/types/signUp.types";

export interface AuthEntryLoginViewModel {
  control: Control<LoginFormInput>;
  selectedPhoneCountryCode: LoginPhoneCountryCode;
  selectedPhoneDialCode: string;
  phoneNumberMaxLength: number;
  phoneCountryOptions: readonly SignUpPhoneCountryOption[];
  onChangeSelectedPhoneCountry: (countryCode: LoginPhoneCountryCode) => void;
  clearSubmitError: () => void;
  isPasswordVisible: boolean;
  togglePasswordVisibility: () => void;
  isSubmitting: boolean;
  submitError?: string;
  submit: () => Promise<void>;
}
