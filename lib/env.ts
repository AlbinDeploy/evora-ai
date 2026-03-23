import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  GEMINI_API_KEYS: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  APP_URL: z.string().url(),
  MAX_UPLOAD_SIZE_MB: z.string().optional().default('4'),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  GEMINI_API_KEYS: process.env.GEMINI_API_KEYS,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  APP_URL: process.env.APP_URL,
  MAX_UPLOAD_SIZE_MB: process.env.MAX_UPLOAD_SIZE_MB,
});

export const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
