import { prisma } from "../../utils/prisma";
import { ForbiddenError, NotFoundError } from "../../utils/errors";
import type { CreateExpoInput, UpdateExpoInput } from "./expo.schemas";
import { mapExpoRow } from "./expo.mapper";

// ─── List user's expos ─────────────────────────────────────────────────────────

export async function listExpos(userId: string) {
  const expos = await prisma.expo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return { expos: expos.map(mapExpoRow), total: expos.length };
}

// ─── Get a single expo ─────────────────────────────────────────────────────────

export async function getExpo(expoId: string, userId?: string) {
  const expo = await prisma.expo.findUnique({ where: { id: expoId } });

  if (!expo) throw new NotFoundError("Expo not found.");

  // Unpublished expos are only visible to their owner
  if (!expo.isPublished && expo.userId !== userId) {
    throw new NotFoundError("Expo not found.");
  }

  return { expo: mapExpoRow(expo) };
}

// ─── Create expo ───────────────────────────────────────────────────────────────

export async function createExpo(userId: string, input: CreateExpoInput) {
  const { room, spawn, frameDefaults, ...rest } = input;

  const expo = await prisma.expo.create({
    data: {
      userId,
      title: rest.title,
      subtitle: rest.subtitle ?? null,
      eyeHeight: rest.eyeHeight ?? 1.62,
      tourDwell: rest.tourDwell ?? 9,
      isPublished: rest.isPublished ?? false,

      roomWidth: room?.width ?? 24,
      roomDepth: room?.depth ?? 16,
      roomHeight: room?.height ?? 4.4,
      partitionLength: room?.partition?.length ?? null,
      partitionThickness: room?.partition?.thickness ?? null,
      partitionHeight: room?.partition?.height ?? null,
      wallColor: room?.wallColor ?? "#f1eee8",
      floorColor: room?.floorColor ?? "#8f8a83",
      ceilingColor: room?.ceilingColor ?? "#e9e6e0",
      floorGloss: room?.floorGloss ?? 0.55,

      spawnX: spawn?.position?.[0] ?? 0,
      spawnZ: spawn?.position?.[1] ?? 6.4,
      spawnHeading: spawn?.heading ?? 0,

      frameColor: frameDefaults?.color ?? "#1b1a19",
      frameWidth: frameDefaults?.width ?? 0.045,
      frameDepth: frameDefaults?.depth ?? 0.05,
      frameMat: frameDefaults?.mat ?? 0.08,
      frameMetalness: frameDefaults?.metalness ?? 0.1,
      frameRoughness: frameDefaults?.roughness ?? 0.55,
    },
  });

  return { expo: mapExpoRow(expo) };
}

// ─── Update expo ───────────────────────────────────────────────────────────────

export async function updateExpo(
  expoId: string,
  userId: string,
  input: UpdateExpoInput,
) {
  await assertExpoOwnership(expoId, userId);

  const { room, spawn, frameDefaults, ...rest } = input;

  const expo = await prisma.expo.update({
    where: { id: expoId },
    data: {
      ...(rest.title !== undefined && { title: rest.title }),
      ...(rest.subtitle !== undefined && { subtitle: rest.subtitle }),
      ...(rest.eyeHeight !== undefined && { eyeHeight: rest.eyeHeight }),
      ...(rest.tourDwell !== undefined && { tourDwell: rest.tourDwell }),
      ...(rest.isPublished !== undefined && { isPublished: rest.isPublished }),

      ...(room && {
        ...(room.width !== undefined && { roomWidth: room.width }),
        ...(room.depth !== undefined && { roomDepth: room.depth }),
        ...(room.height !== undefined && { roomHeight: room.height }),
        ...(room.partition !== undefined && {
          partitionLength: room.partition?.length ?? null,
          partitionThickness: room.partition?.thickness ?? null,
          partitionHeight: room.partition?.height ?? null,
        }),
        ...(room.wallColor !== undefined && { wallColor: room.wallColor }),
        ...(room.floorColor !== undefined && { floorColor: room.floorColor }),
        ...(room.ceilingColor !== undefined && { ceilingColor: room.ceilingColor }),
        ...(room.floorGloss !== undefined && { floorGloss: room.floorGloss }),
      }),

      ...(spawn && {
        ...(spawn.position !== undefined && {
          spawnX: spawn.position[0],
          spawnZ: spawn.position[1],
        }),
        ...(spawn.heading !== undefined && { spawnHeading: spawn.heading }),
      }),

      ...(frameDefaults && {
        ...(frameDefaults.color !== undefined && { frameColor: frameDefaults.color }),
        ...(frameDefaults.width !== undefined && { frameWidth: frameDefaults.width }),
        ...(frameDefaults.depth !== undefined && { frameDepth: frameDefaults.depth }),
        ...(frameDefaults.mat !== undefined && { frameMat: frameDefaults.mat }),
        ...(frameDefaults.metalness !== undefined && { frameMetalness: frameDefaults.metalness }),
        ...(frameDefaults.roughness !== undefined && { frameRoughness: frameDefaults.roughness }),
      }),
    },
  });

  return { expo: mapExpoRow(expo) };
}

// ─── Delete expo ───────────────────────────────────────────────────────────────

export async function deleteExpo(expoId: string, userId: string) {
  await assertExpoOwnership(expoId, userId);
  await prisma.expo.delete({ where: { id: expoId } });
  return { message: "Expo deleted successfully." };
}

// ─── Ownership guard ───────────────────────────────────────────────────────────

export async function assertExpoOwnership(expoId: string, userId: string) {
  const expo = await prisma.expo.findUnique({
    where: { id: expoId },
    select: { id: true, userId: true },
  });
  if (!expo) throw new NotFoundError("Expo not found.");
  if (expo.userId !== userId) throw new ForbiddenError("Access denied.");
  return expo;
}
