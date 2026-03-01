import { env } from "./env";

const LOCALHOST_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

const configuredOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) return true;
  if (configuredOrigins.includes(origin)) return true;
  return LOCALHOST_ORIGIN_REGEX.test(origin);
};

