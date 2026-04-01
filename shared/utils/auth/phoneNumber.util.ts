export const normalizePhoneNumber = (value: string): string => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  const digits = trimmedValue.replace(/\D/g, "");
  const hasLeadingPlus = trimmedValue.startsWith("+");

  return hasLeadingPlus ? `+${digits}` : digits;
};

const STRICT_E164_REGEX = /^\+[1-9]\d{7,14}$/;

export const normalizeE164PhoneNumber = (value: string): string => {
  const normalizedPhoneNumber = normalizePhoneNumber(value);

  return STRICT_E164_REGEX.test(normalizedPhoneNumber)
    ? normalizedPhoneNumber
    : "";
};

export const isStrictE164PhoneNumber = (value: string): boolean =>
  normalizeE164PhoneNumber(value).length > 0;

export const buildPhoneLoginIdCandidates = (value: string): string[] => {
  const normalizedPhoneNumber = normalizeE164PhoneNumber(value);

  if (!normalizedPhoneNumber) {
    return [];
  }

  const candidates = new Set<string>([normalizedPhoneNumber]);

  if (
    normalizedPhoneNumber.startsWith("+977") &&
    normalizedPhoneNumber.length === 14
  ) {
    candidates.add(normalizedPhoneNumber.slice(4));
  }

  if (
    normalizedPhoneNumber.startsWith("+91") &&
    normalizedPhoneNumber.length === 13
  ) {
    candidates.add(normalizedPhoneNumber.slice(3));
  }

  return Array.from(candidates);
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
