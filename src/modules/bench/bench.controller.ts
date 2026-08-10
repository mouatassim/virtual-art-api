import type { FastifyRequest, FastifyReply } from "fastify";
import {
  listBenches,
  createBench,
  updateBench,
  deleteBench,
} from "./bench.service";
import type { CreateBenchInput, UpdateBenchInput } from "./bench.schemas";

export async function listBenchesHandler(
  request: FastifyRequest<{ Params: { expoId: string } }>,
  reply: FastifyReply,
) {
  const result = await listBenches(request.params.expoId);
  return reply.code(200).send(result);
}

export async function createBenchHandler(
  request: FastifyRequest<{ Params: { expoId: string }; Body: CreateBenchInput }>,
  reply: FastifyReply,
) {
  const result = await createBench(
    request.params.expoId,
    request.user.userId,
    request.body,
  );
  return reply.code(201).send(result);
}

export async function updateBenchHandler(
  request: FastifyRequest<{
    Params: { expoId: string; benchId: string };
    Body: UpdateBenchInput;
  }>,
  reply: FastifyReply,
) {
  const result = await updateBench(
    request.params.expoId,
    request.params.benchId,
    request.user.userId,
    request.body,
  );
  return reply.code(200).send(result);
}

export async function deleteBenchHandler(
  request: FastifyRequest<{ Params: { expoId: string; benchId: string } }>,
  reply: FastifyReply,
) {
  const result = await deleteBench(
    request.params.expoId,
    request.params.benchId,
    request.user.userId,
  );
  return reply.code(200).send(result);
}
