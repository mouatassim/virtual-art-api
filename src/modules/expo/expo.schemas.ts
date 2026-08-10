import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

// ─── Sub-schemas ───────────────────────────────────────────────────────────────

const partitionSchema = z
  .object({
    length: z.number().positive(),
    thickness: z.number().positive(),
    height: z.number().positive(),
  })
  .nullable();

const roomSchema = z.object({
  width: z.number().positive().default(24),
  depth: z.number().positive().default(16),
  height: z.number().positive().default(4.4),
  partition: partitionSchema.optional(),
  wallColor: z.string().default("#f1eee8"),
  floorColor: z.string().default("#8f8a83"),
  ceilingColor: z.string().default("#e9e6e0"),
  floorGloss: z.number().min(0).max(1).default(0.55),
});

const spawnSchema = z.object({
  position: z.tuple([z.number(), z.number()]).default([0, 6.4]),
  heading: z.number().default(0),
});

const frameDefaultsSchema = z.object({
  color: z.string().default("#1b1a19"),
  width: z.number().positive().default(0.045),
  depth: z.number().positive().default(0.05),
  mat: z.number().min(0).default(0.08),
  metalness: z.number().min(0).max(1).default(0.1),
  roughness: z.number().min(0).max(1).default(0.55),
});

// ─── Expo response shape ───────────────────────────────────────────────────────

const expoResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  room: roomSchema,
  spawn: spawnSchema,
  eyeHeight: z.number(),
  tourDwell: z.number(),
  frameDefaults: frameDefaultsSchema,
  isPublished: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ─── Create expo ───────────────────────────────────────────────────────────────

const createExpoSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  room: roomSchema.optional(),
  spawn: spawnSchema.optional(),
  eyeHeight: z.number().positive().optional(),
  tourDwell: z.number().int().positive().optional(),
  frameDefaults: frameDefaultsSchema.partial().optional(),
  isPublished: z.boolean().optional(),
});

const createExpoResponseSchema = z.object({
  expo: expoResponseSchema,
});

// ─── Update expo ───────────────────────────────────────────────────────────────

const updateExpoSchema = createExpoSchema.partial();

const updateExpoResponseSchema = z.object({
  expo: expoResponseSchema,
});

// ─── List expos ────────────────────────────────────────────────────────────────

const listExposResponseSchema = z.object({
  expos: z.array(expoResponseSchema),
  total: z.number(),
});

// ─── Get expo (public) ────────────────────────────────────────────────────────

const getExpoResponseSchema = z.object({
  expo: expoResponseSchema,
});

// ─── Type exports ─────────────────────────────────────────────────────────────

export type CreateExpoInput = z.infer<typeof createExpoSchema>;
export type UpdateExpoInput = z.infer<typeof updateExpoSchema>;

export const { schemas: expoSchemas, $ref } = buildJsonSchemas(
  {
    createExpoSchema,
    createExpoResponseSchema,
    updateExpoSchema,
    updateExpoResponseSchema,
    listExposResponseSchema,
    getExpoResponseSchema,
  },
  { $id: "ExpoSchemas" },
);
