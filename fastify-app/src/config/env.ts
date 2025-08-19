import { config as load } from "dotenv";
import { z } from "zod";
load();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3002),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string(),
  SUPABASE_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_JWT_SECRET: z.string(),
  // Optional CORS configuration
  FRONTEND_URLS: z.string().optional(),
});

export const env = envSchema.parse(process.env);
export const isDev = env.NODE_ENV === "development";
