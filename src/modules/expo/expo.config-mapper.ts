import type { Expo, Artwork, Bench, User } from "../../generated/prisma";

function wallIdToFrontend(wall: string): string {
  const map: Record<string, string> = {
    NORTH: "north",
    SOUTH: "south",
    EAST: "east",
    WEST: "west",
    CENTER_NORTH: "center-north",
    CENTER_SOUTH: "center-south",
  };
  return map[wall] ?? wall.toLowerCase();
}

function proceduralStyleToFrontend(style: string): string {
  const map: Record<string, string> = {
    COLOR_FIELD: "color-field",
    BAUHAUS: "bauhaus",
    FLOW: "flow",
    ORBITS: "orbits",
    HORIZON: "horizon",
    GRID: "grid",
    STRATA: "strata",
  };
  return map[style] ?? style.toLowerCase().replace(/_/g, "-");
}

function mapArtworkToConfig(row: Artwork): object {
  if (row.type === "SCULPTURE") {
    return {
      id: row.id,
      type: "sculpture",
      title: row.title,
      artist: row.artist,
      year: row.year ?? undefined,
      medium: row.medium ?? undefined,
      dimensions: row.dimensions ?? undefined,
      description: row.description ?? undefined,
      price: row.price ?? undefined,
      link: row.link ?? undefined,
      position: [row.positionX ?? 0, row.positionZ ?? 0],
      model: row.modelUrl ?? undefined,
      shape: row.shape?.toLowerCase(),
      scale: row.scale ?? undefined,
      material: row.materialColor
        ? {
            color: row.materialColor,
            metalness: row.materialMetalness ?? 0,
            roughness: row.materialRoughness ?? 1,
          }
        : undefined,
      plinth: row.plinthWidth
        ? {
            width: row.plinthWidth,
            height: row.plinthHeight ?? 1,
          }
        : undefined,
    };
  }

  const hasFrameOverride =
    row.frameColorOverride !== null ||
    row.frameWidthOverride !== null ||
    row.frameDepthOverride !== null ||
    row.frameMatOverride !== null ||
    row.frameMetalnessOverride !== null ||
    row.frameRoughnessOverride !== null;

  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    year: row.year ?? undefined,
    medium: row.medium ?? undefined,
    dimensions: row.dimensions ?? undefined,
    description: row.description ?? undefined,
    price: row.price ?? undefined,
    link: row.link ?? undefined,
    wall: wallIdToFrontend(row.wall ?? "NORTH"),
    offset: row.offset ?? 0,
    centerY: row.centerY ?? undefined,
    width: row.width ?? 1,
    height: row.height ?? 1,
    image: row.imageUrl ?? undefined,
    procedural: row.proceduralStyle
      ? {
          style: proceduralStyleToFrontend(row.proceduralStyle),
          seed: row.proceduralSeed ?? 1,
          palette:
            row.proceduralPalette.length > 0
              ? row.proceduralPalette
              : undefined,
        }
      : undefined,
    frame: hasFrameOverride
      ? {
          color: row.frameColorOverride ?? undefined,
          width: row.frameWidthOverride ?? undefined,
          depth: row.frameDepthOverride ?? undefined,
          mat: row.frameMatOverride ?? undefined,
          metalness: row.frameMetalnessOverride ?? undefined,
          roughness: row.frameRoughnessOverride ?? undefined,
        }
      : undefined,
  };
}

function mapBenchToConfig(row: Bench): object {
  return {
    position: [row.positionX, row.positionZ],
    rotation: row.rotation ?? undefined,
    length: row.length ?? undefined,
  };
}

export function mapExpoToConfig(
  expo: Expo,
  user: User,
  artworks: Artwork[],
  benches: Bench[],
): object {
  return {
    title: expo.title,
    subtitle: expo.subtitle ?? "",
    artist: {
      name:
        [user.firstName, user.lastName].filter(Boolean).join(" ") || "Artist",
      bio: user.bio ?? "",
      website: user.website ?? undefined,
      contact: user.contact ?? undefined,
    },
    room: {
      width: expo.roomWidth,
      depth: expo.roomDepth,
      height: expo.roomHeight,
      partition:
        expo.partitionLength !== null
          ? {
              length: expo.partitionLength,
              thickness: expo.partitionThickness!,
              height: expo.partitionHeight!,
            }
          : null,
      wallColor: expo.wallColor,
      floorColor: expo.floorColor,
      ceilingColor: expo.ceilingColor,
      floorGloss: expo.floorGloss,
    },
    spawn: {
      position: [expo.spawnX, expo.spawnZ],
      heading: expo.spawnHeading,
    },
    eyeHeight: expo.eyeHeight,
    tourDwell: expo.tourDwell,
    frameDefaults: {
      color: expo.frameColor,
      width: expo.frameWidth,
      depth: expo.frameDepth,
      mat: expo.frameMat,
      metalness: expo.frameMetalness,
      roughness: expo.frameRoughness,
    },
    artworks: artworks.map(mapArtworkToConfig),
    benches: benches.map(mapBenchToConfig),
  };
}
