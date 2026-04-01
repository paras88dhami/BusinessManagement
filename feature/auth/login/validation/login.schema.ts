import { z } from "zod";
import { normalizeE164PhoneNumber } from "@/shared/utils/auth/phoneNumber.util";
import {
  getInvalidSignUpPhoneMessageForCountry,
  isValidSignUpPhoneForCountry,
  sanitizeSignUpPhoneDigits,
} from "@/feature/auth/signUp/utils/signUpPhoneNumber.util";

const phoneCountryCodeSchema = z.enum(["NP", "IN"]);

const loginPhoneNumberSchema = z
  .string()
  .refine((value) => value.trim().length > 0, {
    message: "Phone number is required.",
  })
  .refine((value) => normalizeE164PhoneNumber(value).length > 0, {
    message: "Please enter a valid phone number in E.164 format.",
  });

const passwordSchema = z.string().refine((value) => value.trim().length > 0, {
  message: "Password is required.",
});

export const loginFormSchema = z.object({
  phoneCountryCode: phoneCountryCodeSchema,
  phoneNumber: z.string(),
  password: passwordSchema,
}).superRefine((value, context) => {
  const phoneDigits = sanitizeSignUpPhoneDigits(value.phoneNumber);

  if (phoneDigits.length === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Phone number is required.",
      path: ["phoneNumber"],
    });
    return;
  }

  if (!isValidSignUpPhoneForCountry(phoneDigits, value.phoneCountryCode)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: getInvalidSignUpPhoneMessageForCountry(value.phoneCountryCode),
      path: ["phoneNumber"],
    });
  }
});

export const loginInputSchema = z.object({
  phoneNumber: loginPhoneNumberSchema.transform(normalizeE164PhoneNumber),
  password: passwordSchema.transform((value) => value.trim()),
});
