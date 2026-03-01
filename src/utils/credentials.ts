import crypto from "crypto";

const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#%*";

export const randomPassword = (length = 12): string => {
  const bytes = crypto.randomBytes(length);
  let out = "";

  for (let i = 0; i < length; i += 1) {
    out += charset[bytes[i] % charset.length];
  }

  return out;
};

export const randomSessionId = (): string => {
  return crypto.randomUUID();
};
