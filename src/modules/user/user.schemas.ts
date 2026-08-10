import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const userProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  bio: z.string().nullable(),
  website: z.string().nullable(),
  contact: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
});

const getProfileResponseSchema = z.object({
  user: userProfileSchema,
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  bio: z.string().max(2000).optional(),
  website: z.string().url().optional().or(z.literal("")),
  contact: z.string().max(200).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

const updateProfileResponseSchema = z.object({
  user: userProfileSchema,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const { schemas: userSchemas, $ref } = buildJsonSchemas(
  {
    userProfileSchema,
    getProfileResponseSchema,
    updateProfileSchema,
    updateProfileResponseSchema,
  },
  { $id: "UserSchemas" },
);
