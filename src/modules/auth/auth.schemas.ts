import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

// ─── Register ─────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

const registerResponseSchema = z.object({
  message: z.string(),
  activationToken: z.string().optional(),
});

// ─── Activate ─────────────────────────────────────────────────────────────────

const activateSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

const userPublicSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  bio: z.string().nullable(),
  website: z.string().nullable(),
  contact: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});

const activateResponseSchema = z.object({
  user: userPublicSchema,
  message: z.string(),
});

// ─── Request activation token ─────────────────────────────────────────────────

const requestActivationSchema = z.object({
  email: z.string().email(),
});

const requestActivationResponseSchema = z.object({
  message: z.string(),
  activationToken: z.string().optional(),
});

// ─── Login ────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const loginResponseSchema = z.object({
  user: userPublicSchema,
});

// ─── Logout ───────────────────────────────────────────────────────────────────

const logoutResponseSchema = z.object({
  message: z.string(),
});

// ─── Me ───────────────────────────────────────────────────────────────────────

const meResponseSchema = z.object({
  user: userPublicSchema,
});

// ─── Type exports ─────────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type ActivateInput = z.infer<typeof activateSchema>;
export type RequestActivationInput = z.infer<typeof requestActivationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const { schemas: authSchemas, $ref } = buildJsonSchemas(
  {
    registerSchema,
    registerResponseSchema,
    activateSchema,
    activateResponseSchema,
    requestActivationSchema,
    requestActivationResponseSchema,
    loginSchema,
    loginResponseSchema,
    logoutResponseSchema,
    meResponseSchema,
  },
  { $id: "AuthSchemas" },
);
