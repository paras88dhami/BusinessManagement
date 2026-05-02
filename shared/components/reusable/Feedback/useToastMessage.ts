import React from "react";
import Toast from "react-native-toast-message";

export type ToastMessageType = "success" | "error" | "info";

type UseToastMessageParams = {
  message: string | null | undefined;
  type: ToastMessageType;
  enabled?: boolean;
};

export function useToastMessage({
  message,
  type,
  enabled = true,
}: UseToastMessageParams): void {
  const lastToastSignatureRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!enabled || !message) {
      return;
    }

    const toastSignature = `${type}:${message}`;
    if (lastToastSignatureRef.current === toastSignature) {
      return;
    }

    lastToastSignatureRef.current = toastSignature;

    Toast.show({
      type,
      text1: message,
    });
  }, [enabled, message, type]);

  React.useEffect(() => {
    if (message) {
      return;
    }

    lastToastSignatureRef.current = null;
  }, [message]);
}
