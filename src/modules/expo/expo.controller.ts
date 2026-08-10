import type { FastifyRequest, FastifyReply } from "fastify";
import {
  listExpos,
  getExpo,
  createExpo,
  updateExpo,
  deleteExpo,
} from "./expo.service";
import type { CreateExpoInput, UpdateExpoInput } from "./expo.schemas";

export async function listExposHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const result = await listExpos(request.user.userId);
  return reply.code(200).send(result);
}

export async function getExpoHandler(
  request: FastifyRequest<{ Params: { expoId: string } }>,
  reply: FastifyReply,
) {
  const userId = request.user?.userId;
  const result = await getExpo(request.params.expoId, userId);
  return reply.code(200).send(result);
}

export async function createExpoHandler(
  request: FastifyRequest<{ Body: CreateExpoInput }>,
  reply: FastifyReply,
) {
  const result = await createExpo(request.user.userId, request.body);
  return reply.code(201).send(result);
}

export async function updateExpoHandler(
  request: FastifyRequest<{ Params: { expoId: string }; Body: UpdateExpoInput }>,
  reply: FastifyReply,
) {
  const result = await updateExpo(
    request.params.expoId,
    request.user.userId,
    request.body,
  );
  return reply.code(200).send(result);
}

export async function deleteExpoHandler(
  request: FastifyRequest<{ Params: { expoId: string } }>,
  reply: FastifyReply,
) {
  const result = await deleteExpo(request.params.expoId, request.user.userId);
  return reply.code(200).send(result);
}
