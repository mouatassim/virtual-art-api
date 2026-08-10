import type { FastifyInstance } from "fastify";
import {
  listExposHandler,
  getExpoHandler,
  createExpoHandler,
  updateExpoHandler,
  deleteExpoHandler,
} from "./expo.controller";
import { $ref } from "./expo.schemas";

export default async function expoRoutes(app: FastifyInstance) {
  // GET /api/expos — list authenticated user's expos
  app.get("/", {
    schema: {
      tags: ["Expos"],
      summary: "List all expos owned by the authenticated user",
      response: { 200: $ref("listExposResponseSchema") },
    },
    preHandler: [app.authenticate],
    handler: listExposHandler,
  });

  // GET /api/expos/:expoId — get a single expo (public if published)
  app.get("/:expoId", {
    schema: {
      tags: ["Expos"],
      summary: "Get an expo by ID (public if published, owner-only if draft)",
      response: { 200: $ref("getExpoResponseSchema") },
    },
    handler: getExpoHandler,
  });

  // POST /api/expos — create a new expo
  app.post("/", {
    schema: {
      tags: ["Expos"],
      summary: "Create a new expo",
      body: $ref("createExpoSchema"),
      response: { 201: $ref("createExpoResponseSchema") },
    },
    preHandler: [app.authenticate],
    handler: createExpoHandler,
  });

  // PATCH /api/expos/:expoId — update an expo
  app.patch("/:expoId", {
    schema: {
      tags: ["Expos"],
      summary: "Update an expo (owner only)",
      body: $ref("updateExpoSchema"),
      response: { 200: $ref("updateExpoResponseSchema") },
    },
    preHandler: [app.authenticate],
    handler: updateExpoHandler,
  });

  // DELETE /api/expos/:expoId — delete an expo
  app.delete("/:expoId", {
    schema: {
      tags: ["Expos"],
      summary: "Delete an expo (owner only)",
    },
    preHandler: [app.authenticate],
    handler: deleteExpoHandler,
  });
}
