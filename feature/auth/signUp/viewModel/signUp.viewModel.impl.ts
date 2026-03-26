import { Status } from "@/shared/types/status.types";
import { useCallback, useState } from "react";
import { SignUpState } from "../types/signUp.types";
import { SignUpWithEmailUseCase } from "../useCase/signUpWithEmail.useCase";
import { SignUpViewModel, UseSignUpViewModelOptions } from "./signUp.viewModel";

export const useSignUpViewModel = (
  useCase: SignUpWithEmailUseCase,
  options?: UseSignUpViewModelOptions,
): SignUpViewModel => {
  const [state, setState] = useState<SignUpState>({ status: Status.Idle });
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const resetError = useCallback(() => {
    setState((previousState) =>
      previousState.status === Status.Failure
        ? { status: Status.Idle }
        : previousState,
    );
  }, []);

  const changeFullName = useCallback(
    (value: string) => {
      if (state.status === Status.Loading) {
        return;
      }

      setFullName(value);
      resetError();
    },
    [resetError, state.status],
  );

  const changeEmail = useCallback(
    (value: string) => {
      if (state.status === Status.Loading) {
        return;
      }

      setEmail(value);
      resetError();
    },
    [resetError, state.status],
  );

  const changePhoneNumber = useCallback(
    (value: string) => {
      if (state.status === Status.Loading) {
        return;
      }

      setPhoneNumber(value);
      resetError();
    },
    [resetError, state.status],
  );

  const changePassword = useCallback(
    (value: string) => {
      if (state.status === Status.Loading) {
        return;
      }

      setPassword(value);
      resetError();
    },
    [resetError, state.status],
  );

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((previousValue) => !previousValue);
  }, []);

  const submit = useCallback(async () => {
    if (state.status === Status.Loading) {
      return;
    }

    setState({ status: Status.Loading });

    try {
      const result = await useCase.signUp({
        fullName,
        email,
        phoneNumber,
        password,
      });

      if (result.success) {
        setState({ status: Status.Success });

        if (options?.onSuccess) {
          options.onSuccess();
        }

        return;
      }

      setState({
        status: Status.Failure,
        error: result.error.message,
      });
    } catch (error) {
      setState({
        status: Status.Failure,
        error: error instanceof Error ? error.message : "Unexpected error",
      });
    }
  }, [email, fullName, options, password, phoneNumber, state.status, useCase]);

  return {
    state,
    fullName,
    email,
    phoneNumber,
    password,
    isPasswordVisible,
    changeFullName,
    changeEmail,
    changePhoneNumber,
    changePassword,
    togglePasswordVisibility,
    submit,
  };
};

export default useSignUpViewModel;
