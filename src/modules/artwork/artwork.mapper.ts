import type { Artwork } from "../../generated/prisma";

export function mapArtworkRow(row: Artwork) {
  const hasFrameOverride =
    row.frameColorOverride !== null ||
    row.frameWidthOverride !== null ||
    row.frameDepthOverride !== null ||
    row.frameMatOverride !== null ||
    row.frameMetalnessOverride !== null ||
    row.frameRoughnessOverride !== null;

  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    title: row.title,
    artist: row.artist,
    year: row.year,
    medium: row.medium,
    dimensions: row.dimensions,
    description: row.description,
    price: row.price,
    link: row.link,

    wall: row.wall,
    offset: row.offset,
    centerY: row.centerY,
    width: row.width,
    height: row.height,
    imageUrl: row.imageUrl,

    proceduralStyle: row.proceduralStyle,
    proceduralSeed: row.proceduralSeed,
    proceduralPalette: row.proceduralPalette,

    frameOverrides: hasFrameOverride
      ? {
          color: row.frameColorOverride ?? undefined,
          width: row.frameWidthOverride ?? undefined,
          depth: row.frameDepthOverride ?? undefined,
          mat: row.frameMatOverride ?? undefined,
          metalness: row.frameMetalnessOverride ?? undefined,
          roughness: row.frameRoughnessOverride ?? undefined,
        }
      : null,

    positionX: row.positionX,
    positionZ: row.positionZ,
    modelUrl: row.modelUrl,
    shape: row.shape,
    scale: row.scale,
    materialColor: row.materialColor,
    materialMetalness: row.materialMetalness,
    materialRoughness: row.materialRoughness,
    plinthWidth: row.plinthWidth,
    plinthHeight: row.plinthHeight,

    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
