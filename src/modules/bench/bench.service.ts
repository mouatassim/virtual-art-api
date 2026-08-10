import { prisma } from "../../utils/prisma";
import { NotFoundError } from "../../utils/errors";
import { assertExpoOwnership } from "../expo/expo.service";
import type { CreateBenchInput, UpdateBenchInput } from "./bench.schemas";

function mapBenchRow(row: {
  id: string;
  positionX: number;
  positionZ: number;
  rotation: number | null;
  length: number | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    positionX: row.positionX,
    positionZ: row.positionZ,
    rotation: row.rotation,
    length: row.length,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listBenches(expoId: string) {
  const benches = await prisma.bench.findMany({
    where: { expoId },
    orderBy: { createdAt: "asc" },
  });
  return { benches: benches.map(mapBenchRow), total: benches.length };
}

export async function createBench(
  expoId: string,
  userId: string,
  input: CreateBenchInput,
) {
  await assertExpoOwnership(expoId, userId);

  const bench = await prisma.bench.create({
    data: {
      expoId,
      positionX: input.positionX,
      positionZ: input.positionZ,
      rotation: input.rotation ?? null,
      length: input.length ?? null,
    },
  });

  return { bench: mapBenchRow(bench) };
}

export async function updateBench(
  expoId: string,
  benchId: string,
  userId: string,
  input: UpdateBenchInput,
) {
  await assertExpoOwnership(expoId, userId);

  const existing = await prisma.bench.findFirst({
    where: { id: benchId, expoId },
    select: { id: true },
  });
  if (!existing) throw new NotFoundError("Bench not found.");

  const bench = await prisma.bench.update({
    where: { id: benchId },
    data: {
      ...(input.positionX !== undefined && { positionX: input.positionX }),
      ...(input.positionZ !== undefined && { positionZ: input.positionZ }),
      ...(input.rotation !== undefined && { rotation: input.rotation }),
      ...(input.length !== undefined && { length: input.length }),
    },
  });

  return { bench: mapBenchRow(bench) };
}

export async function deleteBench(
  expoId: string,
  benchId: string,
  userId: string,
) {
  await assertExpoOwnership(expoId, userId);

  const existing = await prisma.bench.findFirst({
    where: { id: benchId, expoId },
    select: { id: true },
  });
  if (!existing) throw new NotFoundError("Bench not found.");

  await prisma.bench.delete({ where: { id: benchId } });
  return { message: "Bench deleted successfully." };
}
