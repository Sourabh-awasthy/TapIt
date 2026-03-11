import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('4000'),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('24h'),
  FRONTEND_ORIGIN: z.string().default('http://localhost:3000'),
  HARDWARE_API_KEY: z.string().optional(),
  ENGAGEMENT_WINDOW_DAYS: z.string().default('30'),
  ENGAGEMENT_MAX_TAPS_PER_LOCATION: z.string().default('60'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
