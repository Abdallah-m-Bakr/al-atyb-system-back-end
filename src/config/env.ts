import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { z } from "zod";

const runtimeEnv = process.env.NODE_ENV === "production" ? "production" : "local";
const envFileName = `.env.${runtimeEnv}`;
const envFilePath = path.resolve(process.cwd(), envFileName);

if (fs.existsSync(envFilePath)) {
  config({ path: envFilePath });
} else {
  config();
  console.warn(`[env] ${envFileName} was not found. Falling back to default dotenv resolution.`);
}

const envSchema = z
  .object({
    NODE_ENV: z.string().optional(),
    PORT: z.coerce.number().default(4000),
    MONGODB_URI: z.string().min(1),
    CORS_ORIGIN: z.string().min(1),
    JWT_SECRET: z.string().min(16).optional(),
    ACCESS_TOKEN_SECRET: z.string().min(16).optional(),
    REFRESH_TOKEN_SECRET: z.string().min(16).optional(),
    ACCESS_TOKEN_TTL: z.string().default("15m"),
    REFRESH_TOKEN_TTL: z.string().default("30d")
  })
  .superRefine((data, ctx) => {
    const hasJwtSecret = !!data.JWT_SECRET;
    const hasSplitSecrets = !!data.ACCESS_TOKEN_SECRET && !!data.REFRESH_TOKEN_SECRET;

    if (!hasJwtSecret && !hasSplitSecrets) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Set JWT_SECRET or both ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET in your env file."
      });
    }
  });

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  ACCESS_TOKEN_SECRET: parsedEnv.ACCESS_TOKEN_SECRET ?? parsedEnv.JWT_SECRET!,
  REFRESH_TOKEN_SECRET: parsedEnv.REFRESH_TOKEN_SECRET ?? parsedEnv.JWT_SECRET!
};
