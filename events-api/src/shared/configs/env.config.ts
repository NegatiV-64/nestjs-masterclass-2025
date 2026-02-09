import { z } from "zod";

export const envConfigSchema = z.object({
  APP_PORT: z.coerce.number().int().positive(),
  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number().int().positive(),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  AUTH_JWT_SECRET: z.string().min(1),
  AUTH_JWT_EXPIRES_IN: z.string().min(1),
});

export type EnvConfig = z.infer<typeof envConfigSchema>;

export function validateEnv(config: unknown): EnvConfig {
  const parsed = envConfigSchema.safeParse(config);
  if (!parsed.success) {
    const errorMessages = parsed.error.issues.map((issue) => {
      return {
        field: issue.path.join("."),
        message: issue.message,
      };
    });

    throw new Error(
      `Invalid environment configuration:\n${errorMessages.map((err) => `- ${err.field}: ${err.message}`).join("\n")}`,
    );
  }

  return parsed.data;
}
