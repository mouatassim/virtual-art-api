import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const benchResponseSchema = z.object({
  id: z.string(),
  positionX: z.number(),
  positionZ: z.number(),
  rotation: z.number().nullable(),
  length: z.number().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const createBenchSchema = z.object({
  positionX: z.number(),
  positionZ: z.number(),
  rotation: z.number().optional(),
  length: z.number().positive().optional(),
});

const createBenchResponseSchema = z.object({
  bench: benchResponseSchema,
});

const updateBenchSchema = createBenchSchema.partial();

const updateBenchResponseSchema = z.object({
  bench: benchResponseSchema,
});

const listBenchesResponseSchema = z.object({
  benches: z.array(benchResponseSchema),
  total: z.number(),
});

export type CreateBenchInput = z.infer<typeof createBenchSchema>;
export type UpdateBenchInput = z.infer<typeof updateBenchSchema>;

export const { schemas: benchSchemas, $ref } = buildJsonSchemas(
  {
    createBenchSchema,
    createBenchResponseSchema,
    updateBenchSchema,
    updateBenchResponseSchema,
    listBenchesResponseSchema,
  },
  { $id: "BenchSchemas" },
);
