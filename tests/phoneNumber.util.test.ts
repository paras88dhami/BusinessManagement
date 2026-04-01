import { describe, expect, it } from "vitest";
import {
  buildPhoneLoginIdCandidates,
  normalizeE164PhoneNumber,
} from "@/shared/utils/auth/phoneNumber.util";

describe("phoneNumber.util", () => {
  it("normalizes valid strict E.164 values", () => {
    expect(normalizeE164PhoneNumber(" +977-9812345678 ")).toBe(
      "+9779812345678",
    );
  });

  it("rejects non-E.164 values", () => {
    expect(normalizeE164PhoneNumber("9812345678")).toBe("");
    expect(normalizeE164PhoneNumber("+0123456789")).toBe("");
  });

  it("does not guess multi-country login IDs", () => {
    expect(buildPhoneLoginIdCandidates("+919876543210")).toEqual([
      "+919876543210",
    ]);
    expect(buildPhoneLoginIdCandidates("9876543210")).toEqual([]);
  });
});
