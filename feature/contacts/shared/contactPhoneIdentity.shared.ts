export const normalizePhoneForIdentity = (
  value: string | null | undefined,
): string | null => {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return null;
  }

  const hasLeadingPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/\D/g, "");

  if (!digitsOnly) {
    return null;
  }

  return hasLeadingPlus ? `+${digitsOnly}` : digitsOnly;
};
