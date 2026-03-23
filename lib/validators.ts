import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(40),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const forgotSchema = z.object({
  email: z.string().email(),
});

export const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(72),
});
