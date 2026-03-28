import { AuthEntryLanguageViewModel } from "./authEntry.language.viewModel";
import { AuthEntryLoginViewModel } from "./authEntry.login.viewModel";
import { AuthEntryModeViewModel } from "./authEntry.mode.viewModel";
import { AuthEntrySignUpViewModel } from "./authEntry.signUp.viewModel";

export interface AuthEntryViewModel {
  language: AuthEntryLanguageViewModel;
  mode: AuthEntryModeViewModel;
  login: AuthEntryLoginViewModel;
  signUp: AuthEntrySignUpViewModel;
  onForgotPasswordPress?: () => void;
}
