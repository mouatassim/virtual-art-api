import type { FastifyInstance } from "fastify";
import {
  listBenchesHandler,
  createBenchHandler,
  updateBenchHandler,
  deleteBenchHandler,
} from "./bench.controller";
import { $ref } from "./bench.schemas";

export default async function benchRoutes(app: FastifyInstance) {
  app.get("/", {
    schema: {
      tags: ["Benches"],
      summary: "List all benches in an expo",
      response: { 200: $ref("listBenchesResponseSchema") },
    },
    handler: listBenchesHandler,
  });

  app.post("/", {
    schema: {
      tags: ["Benches"],
      summary: "Add a bench to an expo (owner only)",
      body: $ref("createBenchSchema"),
      response: { 201: $ref("createBenchResponseSchema") },
    },
    preHandler: [app.authenticate],
    handler: createBenchHandler,
  });

  app.patch("/:benchId", {
    schema: {
      tags: ["Benches"],
      summary: "Update a bench (owner only)",
      body: $ref("updateBenchSchema"),
      response: { 200: $ref("updateBenchResponseSchema") },
    },
    preHandler: [app.authenticate],
    handler: updateBenchHandler,
  });

  app.delete("/:benchId", {
    schema: {
      tags: ["Benches"],
      summary: "Delete a bench (owner only)",
    },
    preHandler: [app.authenticate],
    handler: deleteBenchHandler,
  });
}
