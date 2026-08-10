import type { FastifyRequest, FastifyReply } from "fastify";
import {
  listArtworks,
  getArtwork,
  createArtwork,
  updateArtwork,
  deleteArtwork,
} from "./artwork.service";
import type { CreateArtworkInput, UpdateArtworkInput } from "./artwork.schemas";

export async function listArtworksHandler(
  request: FastifyRequest<{ Params: { expoId: string } }>,
  reply: FastifyReply,
) {
  const result = await listArtworks(request.params.expoId);
  return reply.code(200).send(result);
}

export async function getArtworkHandler(
  request: FastifyRequest<{ Params: { expoId: string; artworkId: string } }>,
  reply: FastifyReply,
) {
  const result = await getArtwork(request.params.expoId, request.params.artworkId);
  return reply.code(200).send(result);
}

export async function createArtworkHandler(
  request: FastifyRequest<{ Params: { expoId: string }; Body: CreateArtworkInput }>,
  reply: FastifyReply,
) {
  const result = await createArtwork(
    request.params.expoId,
    request.user.userId,
    request.body,
  );
  return reply.code(201).send(result);
}

export async function updateArtworkHandler(
  request: FastifyRequest<{
    Params: { expoId: string; artworkId: string };
    Body: UpdateArtworkInput;
  }>,
  reply: FastifyReply,
) {
  const result = await updateArtwork(
    request.params.expoId,
    request.params.artworkId,
    request.user.userId,
    request.body,
  );
  return reply.code(200).send(result);
}

export async function deleteArtworkHandler(
  request: FastifyRequest<{ Params: { expoId: string; artworkId: string } }>,
  reply: FastifyReply,
) {
  const result = await deleteArtwork(
    request.params.expoId,
    request.params.artworkId,
    request.user.userId,
  );
  return reply.code(200).send(result);
}
