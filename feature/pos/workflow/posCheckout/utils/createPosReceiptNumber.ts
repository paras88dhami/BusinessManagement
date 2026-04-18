export const createPosReceiptNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const randomSuffix = globalThis.crypto?.randomUUID?.()
    ? globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 4).toUpperCase()
    : Math.floor(Math.random() * 0xffff)
        .toString(16)
        .padStart(4, "0")
        .toUpperCase();

  return `RCPT-${timestamp}-${randomSuffix}`;
};
