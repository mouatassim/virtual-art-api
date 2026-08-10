import type { FastifyRequest, FastifyReply } from "fastify";
import { getProfile, updateProfile } from "./user.service";
import type { UpdateProfileInput } from "./user.schemas";

export async function getProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const result = await getProfile(request.user.userId);
  return reply.code(200).send(result);
}

export async function updateProfileHandler(
  request: FastifyRequest<{ Body: UpdateProfileInput }>,
  reply: FastifyReply,
) {
  const result = await updateProfile(request.user.userId, request.body);
  return reply.code(200).send(result);
}
