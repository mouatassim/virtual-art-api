import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

const artworkTypeSchema = z.enum(["PAINTING", "SCULPTURE"]);

const wallIdSchema = z.enum([
  "NORTH",
  "SOUTH",
  "EAST",
  "WEST",
  "CENTER_NORTH",
  "CENTER_SOUTH",
]);

const proceduralStyleSchema = z.enum([
  "COLOR_FIELD",
  "BAUHAUS",
  "FLOW",
  "ORBITS",
  "HORIZON",
  "GRID",
  "STRATA",
]);

const sculptureShapeSchema = z.enum(["KNOT", "MONOLITH", "SPHERES"]);

// ─── Shared sub-schemas ───────────────────────────────────────────────────────

const frameOverridesSchema = z.object({
  color: z.string().optional(),
  width: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  mat: z.number().min(0).optional(),
  metalness: z.number().min(0).max(1).optional(),
  roughness: z.number().min(0).max(1).optional(),
});

// ─── Artwork response ─────────────────────────────────────────────────────────

const artworkResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  type: artworkTypeSchema,
  title: z.string(),
  artist: z.string(),
  year: z.string().nullable(),
  medium: z.string().nullable(),
  dimensions: z.string().nullable(),
  description: z.string().nullable(),
  price: z.string().nullable(),
  link: z.string().nullable(),

  // Painting
  wall: wallIdSchema.nullable(),
  offset: z.number().nullable(),
  centerY: z.number().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  imageUrl: z.string().nullable(),

  proceduralStyle: proceduralStyleSchema.nullable(),
  proceduralSeed: z.number().nullable(),
  proceduralPalette: z.array(z.string()),

  frameOverrides: frameOverridesSchema.nullable(),

  // Sculpture
  positionX: z.number().nullable(),
  positionZ: z.number().nullable(),
  modelUrl: z.string().nullable(),
  shape: sculptureShapeSchema.nullable(),
  scale: z.number().nullable(),
  materialColor: z.string().nullable(),
  materialMetalness: z.number().nullable(),
  materialRoughness: z.number().nullable(),
  plinthWidth: z.number().nullable(),
  plinthHeight: z.number().nullable(),

  sortOrder: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ─── Create artwork ───────────────────────────────────────────────────────────

const createArtworkSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  type: artworkTypeSchema.default("PAINTING"),
  title: z.string().min(1).max(200),
  artist: z.string().min(1).max(200),
  year: z.string().max(20).optional(),
  medium: z.string().max(200).optional(),
  dimensions: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  price: z.string().max(200).optional(),
  link: z.string().url().optional(),

  // Painting placement
  wall: wallIdSchema.optional(),
  offset: z.number().optional(),
  centerY: z.number().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  imageUrl: z.string().optional(),

  // Procedural
  proceduralStyle: proceduralStyleSchema.optional(),
  proceduralSeed: z.number().int().optional(),
  proceduralPalette: z.array(z.string()).optional(),

  // Frame overrides
  frameOverrides: frameOverridesSchema.optional(),

  // Sculpture
  positionX: z.number().optional(),
  positionZ: z.number().optional(),
  modelUrl: z.string().optional(),
  shape: sculptureShapeSchema.optional(),
  scale: z.number().positive().optional(),
  materialColor: z.string().optional(),
  materialMetalness: z.number().min(0).max(1).optional(),
  materialRoughness: z.number().min(0).max(1).optional(),
  plinthWidth: z.number().positive().optional(),
  plinthHeight: z.number().positive().optional(),

  sortOrder: z.number().int().min(0).optional(),
});

const createArtworkResponseSchema = z.object({
  artwork: artworkResponseSchema,
});

// ─── Update artwork ───────────────────────────────────────────────────────────

const updateArtworkSchema = createArtworkSchema.omit({ slug: true }).partial();

const updateArtworkResponseSchema = z.object({
  artwork: artworkResponseSchema,
});

// ─── List artworks ────────────────────────────────────────────────────────────

const listArtworksResponseSchema = z.object({
  artworks: z.array(artworkResponseSchema),
  total: z.number(),
});

// ─── Type exports ─────────────────────────────────────────────────────────────

export type CreateArtworkInput = z.infer<typeof createArtworkSchema>;
export type UpdateArtworkInput = z.infer<typeof updateArtworkSchema>;

export const { schemas: artworkSchemas, $ref } = buildJsonSchemas(
  {
    createArtworkSchema,
    createArtworkResponseSchema,
    updateArtworkSchema,
    updateArtworkResponseSchema,
    listArtworksResponseSchema,
  },
  { target: "jsonSchema7", $id: "ArtworkSchemas" },
);
