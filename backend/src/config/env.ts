import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default(5000),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET (Supabase JWT Secret) is required and must be at least 8 characters long"),
  NVIDIA_API_KEY: z.string().optional(),
  NVIDIA_API_URL: z.string().url().default("https://integrate.api.nvidia.com/v1"),
  NVIDIA_MODEL: z.string().default("meta/llama-3.1-70b-instruct"),
  ENCRYPTION_KEY: z.string().min(32, "ENCRYPTION_KEY must be at least 32 characters long").default("fallback_encryption_key_32_chars_long_for_dev_only"),
});

const rawEnv = {
  ...process.env,
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY || process.env.NVIDIA_KEY,
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

