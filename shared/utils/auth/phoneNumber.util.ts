export const normalizePhoneNumber = (value: string): string => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  const digits = trimmedValue.replace(/\D/g, "");
  const hasLeadingPlus = trimmedValue.startsWith("+");

  return hasLeadingPlus ? `+${digits}` : digits;
};

export const buildPhoneLoginIdCandidates = (value: string): string[] => {
  const normalizedPhoneNumber = normalizePhoneNumber(value);

  if (!normalizedPhoneNumber) {
    return [value];
  }

  if (normalizedPhoneNumber.startsWith("+")) {
    const digitsOnly = normalizedPhoneNumber.slice(1);

    if (!digitsOnly) {
      return [normalizedPhoneNumber];
    }

    return [normalizedPhoneNumber, digitsOnly];
  }

  const loginIdCandidates = new Set<string>([normalizedPhoneNumber]);
  loginIdCandidates.add(`+977${normalizedPhoneNumber}`);
  loginIdCandidates.add(`+91${normalizedPhoneNumber}`);

  return Array.from(loginIdCandidates);
};

export const composePhoneNumberWithDialCode = (
  phoneNumber: string,
  dialCode: string,
): string => {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

  if (!normalizedPhoneNumber) {
    return "";
  }

  if (normalizedPhoneNumber.startsWith("+")) {
    return normalizedPhoneNumber;
  }

  const normalizedDialCode = normalizePhoneNumber(dialCode);

  if (!normalizedDialCode.startsWith("+")) {
    return normalizedPhoneNumber;
  }

  const dialCodeDigits = normalizedDialCode.slice(1);

  if (normalizedPhoneNumber.startsWith(dialCodeDigits)) {
    return `+${normalizedPhoneNumber}`;
  }

  return `${normalizedDialCode}${normalizedPhoneNumber}`;
};
