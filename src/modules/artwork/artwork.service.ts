import { prisma } from "../../utils/prisma";
import { ConflictError, NotFoundError } from "../../utils/errors";
import { assertExpoOwnership } from "../expo/expo.service";
import type { CreateArtworkInput, UpdateArtworkInput } from "./artwork.schemas";
import { mapArtworkRow } from "./artwork.mapper";

// ─── List artworks ────────────────────────────────────────────────────────────

export async function listArtworks(expoId: string) {
  const artworks = await prisma.artwork.findMany({
    where: { expoId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return { artworks: artworks.map(mapArtworkRow), total: artworks.length };
}

// ─── Get a single artwork ─────────────────────────────────────────────────────

export async function getArtwork(expoId: string, artworkId: string) {
  const artwork = await prisma.artwork.findFirst({
    where: { id: artworkId, expoId },
  });
  if (!artwork) throw new NotFoundError("Artwork not found.");
  return { artwork: mapArtworkRow(artwork) };
}

// ─── Create artwork ───────────────────────────────────────────────────────────

export async function createArtwork(
  expoId: string,
  userId: string,
  input: CreateArtworkInput,
) {
  await assertExpoOwnership(expoId, userId);

  const existing = await prisma.artwork.findUnique({
    where: { expoId_slug: { expoId, slug: input.slug } },
    select: { id: true },
  });
  if (existing) throw new ConflictError(`Slug "${input.slug}" is already in use in this expo.`);

  const { frameOverrides, ...rest } = input;

  const artwork = await prisma.artwork.create({
    data: {
      expoId,
      slug: rest.slug,
      type: rest.type ?? "PAINTING",
      title: rest.title,
      artist: rest.artist,
      year: rest.year ?? null,
      medium: rest.medium ?? null,
      dimensions: rest.dimensions ?? null,
      description: rest.description ?? null,
      price: rest.price ?? null,
      link: rest.link ?? null,

      wall: rest.wall ?? null,
      offset: rest.offset ?? null,
      centerY: rest.centerY ?? null,
      width: rest.width ?? null,
      height: rest.height ?? null,
      imageUrl: rest.imageUrl ?? null,

      proceduralStyle: rest.proceduralStyle ?? null,
      proceduralSeed: rest.proceduralSeed ?? null,
      proceduralPalette: rest.proceduralPalette ?? [],

      frameColorOverride: frameOverrides?.color ?? null,
      frameWidthOverride: frameOverrides?.width ?? null,
      frameDepthOverride: frameOverrides?.depth ?? null,
      frameMatOverride: frameOverrides?.mat ?? null,
      frameMetalnessOverride: frameOverrides?.metalness ?? null,
      frameRoughnessOverride: frameOverrides?.roughness ?? null,

      positionX: rest.positionX ?? null,
      positionZ: rest.positionZ ?? null,
      modelUrl: rest.modelUrl ?? null,
      shape: rest.shape ?? null,
      scale: rest.scale ?? null,
      materialColor: rest.materialColor ?? null,
      materialMetalness: rest.materialMetalness ?? null,
      materialRoughness: rest.materialRoughness ?? null,
      plinthWidth: rest.plinthWidth ?? null,
      plinthHeight: rest.plinthHeight ?? null,

      sortOrder: rest.sortOrder ?? 0,
    },
  });

  return { artwork: mapArtworkRow(artwork) };
}

// ─── Update artwork ───────────────────────────────────────────────────────────

export async function updateArtwork(
  expoId: string,
  artworkId: string,
  userId: string,
  input: UpdateArtworkInput,
) {
  await assertExpoOwnership(expoId, userId);

  const existing = await prisma.artwork.findFirst({
    where: { id: artworkId, expoId },
    select: { id: true },
  });
  if (!existing) throw new NotFoundError("Artwork not found.");

  const { frameOverrides, ...rest } = input;

  const artwork = await prisma.artwork.update({
    where: { id: artworkId },
    data: {
      ...(rest.type !== undefined && { type: rest.type }),
      ...(rest.title !== undefined && { title: rest.title }),
      ...(rest.artist !== undefined && { artist: rest.artist }),
      ...(rest.year !== undefined && { year: rest.year }),
      ...(rest.medium !== undefined && { medium: rest.medium }),
      ...(rest.dimensions !== undefined && { dimensions: rest.dimensions }),
      ...(rest.description !== undefined && { description: rest.description }),
      ...(rest.price !== undefined && { price: rest.price }),
      ...(rest.link !== undefined && { link: rest.link }),

      ...(rest.wall !== undefined && { wall: rest.wall }),
      ...(rest.offset !== undefined && { offset: rest.offset }),
      ...(rest.centerY !== undefined && { centerY: rest.centerY }),
      ...(rest.width !== undefined && { width: rest.width }),
      ...(rest.height !== undefined && { height: rest.height }),
      ...(rest.imageUrl !== undefined && { imageUrl: rest.imageUrl }),

      ...(rest.proceduralStyle !== undefined && { proceduralStyle: rest.proceduralStyle }),
      ...(rest.proceduralSeed !== undefined && { proceduralSeed: rest.proceduralSeed }),
      ...(rest.proceduralPalette !== undefined && { proceduralPalette: rest.proceduralPalette }),

      ...(frameOverrides !== undefined && {
        frameColorOverride: frameOverrides?.color ?? null,
        frameWidthOverride: frameOverrides?.width ?? null,
        frameDepthOverride: frameOverrides?.depth ?? null,
        frameMatOverride: frameOverrides?.mat ?? null,
        frameMetalnessOverride: frameOverrides?.metalness ?? null,
        frameRoughnessOverride: frameOverrides?.roughness ?? null,
      }),

      ...(rest.positionX !== undefined && { positionX: rest.positionX }),
      ...(rest.positionZ !== undefined && { positionZ: rest.positionZ }),
      ...(rest.modelUrl !== undefined && { modelUrl: rest.modelUrl }),
      ...(rest.shape !== undefined && { shape: rest.shape }),
      ...(rest.scale !== undefined && { scale: rest.scale }),
      ...(rest.materialColor !== undefined && { materialColor: rest.materialColor }),
      ...(rest.materialMetalness !== undefined && { materialMetalness: rest.materialMetalness }),
      ...(rest.materialRoughness !== undefined && { materialRoughness: rest.materialRoughness }),
      ...(rest.plinthWidth !== undefined && { plinthWidth: rest.plinthWidth }),
      ...(rest.plinthHeight !== undefined && { plinthHeight: rest.plinthHeight }),

      ...(rest.sortOrder !== undefined && { sortOrder: rest.sortOrder }),
    },
  });

  return { artwork: mapArtworkRow(artwork) };
}

// ─── Delete artwork ───────────────────────────────────────────────────────────

export async function deleteArtwork(
  expoId: string,
  artworkId: string,
  userId: string,
) {
  await assertExpoOwnership(expoId, userId);

  const existing = await prisma.artwork.findFirst({
    where: { id: artworkId, expoId },
    select: { id: true },
  });
  if (!existing) throw new NotFoundError("Artwork not found.");

  await prisma.artwork.delete({ where: { id: artworkId } });
  return { message: "Artwork deleted successfully." };
}
