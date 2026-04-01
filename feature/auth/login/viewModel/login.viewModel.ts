import { Control } from "react-hook-form";
import {
  LoginFormInput,
  LoginPhoneCountryCode,
  LoginState,
} from "../types/login.types";
import { SignUpPhoneCountryOption } from "@/feature/auth/signUp/types/signUp.types";

export interface LoginViewModel {
  state: LoginState;
  control: Control<LoginFormInput>;
  selectedPhoneCountryCode: LoginPhoneCountryCode;
  selectedPhoneDialCode: string;
  phoneNumberMaxLength: number;
  phoneCountryOptions: readonly SignUpPhoneCountryOption[];
  onChangeSelectedPhoneCountry: (countryCode: LoginPhoneCountryCode) => void;
  isPasswordVisible: boolean;
  clearSubmitError: () => void;
  togglePasswordVisibility: () => void;
  submit: () => Promise<void>;
}

export type UseLoginViewModelOptions = {
  onSuccess?: () => void;
};
