import type { FastifyInstance } from "fastify";
import {
  listArtworksHandler,
  getArtworkHandler,
  createArtworkHandler,
  updateArtworkHandler,
  deleteArtworkHandler,
} from "./artwork.controller";
import { $ref } from "./artwork.schemas";

export default async function artworkRoutes(app: FastifyInstance) {
  // GET /api/expos/:expoId/artworks
  app.get("/", {
    schema: {
      tags: ["Artworks"],
      summary: "List all artworks in an expo",
      response: { 200: $ref("listArtworksResponseSchema") },
    },
    handler: listArtworksHandler,
  });

  // GET /api/expos/:expoId/artworks/:artworkId
  app.get("/:artworkId", {
    schema: {
      tags: ["Artworks"],
      summary: "Get a single artwork",
    },
    handler: getArtworkHandler,
  });

  // POST /api/expos/:expoId/artworks
  app.post("/", {
    schema: {
      tags: ["Artworks"],
      summary: "Add an artwork to an expo (owner only)",
      body: $ref("createArtworkSchema"),
      response: { 201: $ref("createArtworkResponseSchema") },
    },
    preHandler: [app.authenticate],
    handler: createArtworkHandler,
  });

  // PATCH /api/expos/:expoId/artworks/:artworkId
  app.patch("/:artworkId", {
    schema: {
      tags: ["Artworks"],
      summary: "Update an artwork (owner only)",
      body: $ref("updateArtworkSchema"),
      response: { 200: $ref("updateArtworkResponseSchema") },
    },
    preHandler: [app.authenticate],
    handler: updateArtworkHandler,
  });

  // DELETE /api/expos/:expoId/artworks/:artworkId
  app.delete("/:artworkId", {
    schema: {
      tags: ["Artworks"],
      summary: "Delete an artwork (owner only)",
    },
    preHandler: [app.authenticate],
    handler: deleteArtworkHandler,
  });
}
