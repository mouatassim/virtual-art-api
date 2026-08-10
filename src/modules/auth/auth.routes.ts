import type { FastifyInstance } from "fastify";
import {
  registerHandler,
  activateHandler,
  requestActivationHandler,
  loginHandler,
  logoutHandler,
  meHandler,
} from "./auth.controller";
import { $ref } from "./auth.schemas";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/register", {
    schema: {
      tags: ["Auth"],
      summary: "Register a new artist account",
      body: $ref("registerSchema"),
      response: { 201: $ref("registerResponseSchema") },
    },
    handler: registerHandler,
  });

  app.post("/activate", {
    schema: {
      tags: ["Auth"],
      summary: "Activate account with token and set password",
      body: $ref("activateSchema"),
      response: { 200: $ref("activateResponseSchema") },
    },
    handler: activateHandler,
  });

  app.post("/request-activation", {
    schema: {
      tags: ["Auth"],
      summary: "Request a new activation email",
      body: $ref("requestActivationSchema"),
      response: { 200: $ref("requestActivationResponseSchema") },
    },
    handler: requestActivationHandler,
  });

  app.post("/login", {
    schema: {
      tags: ["Auth"],
      summary: "Login — sets an httpOnly cookie with the JWT",
      body: $ref("loginSchema"),
      response: { 200: $ref("loginResponseSchema") },
    },
    handler: loginHandler,
  });

  app.post("/logout", {
    schema: {
      tags: ["Auth"],
      summary: "Logout — clears the access_token cookie",
      response: { 200: $ref("logoutResponseSchema") },
    },
    handler: logoutHandler,
  });

  app.get("/me", {
    schema: {
      tags: ["Auth"],
      summary: "Get the currently authenticated user",
      response: { 200: $ref("meResponseSchema") },
    },
    preHandler: [app.authenticate],
    handler: meHandler,
  });
}
