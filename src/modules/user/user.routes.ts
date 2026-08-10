import type { FastifyInstance } from "fastify";
import { getProfileHandler, updateProfileHandler } from "./user.controller";
import { $ref } from "./user.schemas";

export default async function userRoutes(app: FastifyInstance) {
  app.get("/me", {
    schema: {
      tags: ["Users"],
      summary: "Get the authenticated user's profile",
      response: { 200: $ref("getProfileResponseSchema") },
    },
    preHandler: [app.authenticate],
    handler: getProfileHandler,
  });

  app.patch("/me", {
    schema: {
      tags: ["Users"],
      summary: "Update the authenticated user's profile",
      body: $ref("updateProfileSchema"),
      response: { 200: $ref("updateProfileResponseSchema") },
    },
    preHandler: [app.authenticate],
    handler: updateProfileHandler,
  });
}
