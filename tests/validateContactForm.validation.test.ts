import { validateContactForm } from "@/feature/contacts/validation/validateContactForm";
import { describe, expect, it } from "vitest";

describe("validateContactForm", () => {
  it("returns inline errors for missing required fields", () => {
    const result = validateContactForm({
      fullName: "",
      phoneNumber: "",
      openingBalance: "",
    });

    expect(result).toEqual({
      fullName: "Full name is required.",
      phoneNumber: "Phone number is required.",
    });
  });

  it("returns inline error for invalid opening balance", () => {
    const result = validateContactForm({
      fullName: "Kapil Dhami",
      phoneNumber: "9800000000",
      openingBalance: "abc",
    });

    expect(result).toEqual({
      openingBalance:
        "Opening balance is invalid. Use a positive amount for receive or a negative amount for pay.",
    });
  });

  it("accepts blank, positive, and negative opening balance inputs", () => {
    expect(
      validateContactForm({
        fullName: "Kapil Dhami",
        phoneNumber: "9800000000",
        openingBalance: "",
      }),
    ).toEqual({});

    expect(
      validateContactForm({
        fullName: "Kapil Dhami",
        phoneNumber: "9800000000",
        openingBalance: "500",
      }),
    ).toEqual({});

    expect(
      validateContactForm({
        fullName: "Kapil Dhami",
        phoneNumber: "9800000000",
        openingBalance: "-500",
      }),
    ).toEqual({});
  });
});
