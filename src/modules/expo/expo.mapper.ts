import type { Expo } from "../../generated/prisma";

export function mapExpoRow(row: Expo) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    room: {
      width: row.roomWidth,
      depth: row.roomDepth,
      height: row.roomHeight,
      partition:
        row.partitionLength !== null &&
        row.partitionThickness !== null &&
        row.partitionHeight !== null
          ? {
              length: row.partitionLength,
              thickness: row.partitionThickness,
              height: row.partitionHeight,
            }
          : null,
      wallColor: row.wallColor,
      floorColor: row.floorColor,
      ceilingColor: row.ceilingColor,
      floorGloss: row.floorGloss,
    },
    spawn: {
      position: [row.spawnX, row.spawnZ] as [number, number],
      heading: row.spawnHeading,
    },
    eyeHeight: row.eyeHeight,
    tourDwell: row.tourDwell,
    frameDefaults: {
      color: row.frameColor,
      width: row.frameWidth,
      depth: row.frameDepth,
      mat: row.frameMat,
      metalness: row.frameMetalness,
      roughness: row.frameRoughness,
    },
    isPublished: row.isPublished,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
