import { createPosReceiptNumber } from "@/feature/pos/workflow/posCheckout/utils/createPosReceiptNumber";
import { describe, expect, it } from "vitest";

describe("createPosReceiptNumber", () => {
  it("produces the correct RCPT prefix", () => {
    const receiptNumber = createPosReceiptNumber();
    expect(receiptNumber.startsWith("RCPT-")).toBe(true);
  });

  it("produces format RCPT-{6digits}-{4chars}", () => {
    const receiptNumber = createPosReceiptNumber();
    expect(receiptNumber).toMatch(/^RCPT-\d{6}-[0-9A-F]{4}$/);
  });

  it("produces unique values on rapid sequential calls", () => {
    const numbers = new Set(
      Array.from({ length: 500 }, () => createPosReceiptNumber()),
    );
    expect(numbers.size).toBe(500);
  });

  it("never returns an empty or malformed string", () => {
    for (let i = 0; i < 100; i += 1) {
      const receiptNumber = createPosReceiptNumber();
      expect(receiptNumber.length).toBeGreaterThan(0);
      expect(receiptNumber).toContain("RCPT-");
    }
  });
});
