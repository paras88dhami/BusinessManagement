export type AuthEntryMode = "login" | "signup";

export interface AuthEntryModeViewModel {
  mode: AuthEntryMode;
  isLoginMode: boolean;
  switchToLogin: () => void;
  switchToSignUp: () => void;
  toggleMode: () => void;
}
