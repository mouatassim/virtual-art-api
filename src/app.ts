import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import fastifyJwt from "fastify-jwt";

import { authSchemas } from "./modules/auth/auth.schemas";
import { expoSchemas } from "./modules/expo/expo.schemas";
import { artworkSchemas } from "./modules/artwork/artwork.schemas";
import { benchSchemas } from "./modules/bench/bench.schemas";
import { userSchemas } from "./modules/user/user.schemas";

import authRoutes from "./modules/auth/auth.routes";
import expoRoutes from "./modules/expo/expo.routes";
import artworkRoutes from "./modules/artwork/artwork.routes";
import benchRoutes from "./modules/bench/bench.routes";
import userRoutes from "./modules/user/user.routes";

import { getCookie } from "./utils/cookies";
import { assertMailerConfigured } from "./utils/mailer";

declare module "fastify" {
  interface FastifyRequest {
    jwt: {
      sign: (payload: object, options?: { expiresIn?: string | number }) => string;
      verify: (token: string) => Promise<unknown>;
    };
    user: {
      userId: string;
      email: string;
    };
  }
  interface FastifyInstance {
    jwt: {
      sign(payload: object, options?: { expiresIn?: string | number }): string;
      verify<T = unknown>(token: string): T;
    };
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }
}

function buildServer() {
  assertMailerConfigured();

  const app = Fastify({ logger: true });

  app.register(multipart);

  app.register(cors, {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://virtual-art.motalei.com",
      "https://www.virtual-art.motalei.com",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  });

  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "change_me_in_production",
    sign: { expiresIn: "1d" },
  });

  app.decorateRequest("jwt", null);
  app.addHook("onRequest", async (request) => {
    request.jwt = {
      sign: (payload, options) => app.jwt.sign(payload, options),
      verify: (token) => app.jwt.verify(token),
    };
  });

  app.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const token = getCookie(request.headers.cookie, "access_token");
        if (!token) throw new Error("No token");
        request.user = (await request.jwt.verify(token)) as typeof request.user;
      } catch {
        reply.code(401).send({
          statusCode: 401,
          error: "Unauthorized",
          message: "Invalid or expired token",
        });
      }
    },
  );

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.name,
        message: error.message,
      });
    }

    if (error.validation) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Validation Error",
        message: "Invalid request data",
        details: error.validation,
      });
    }

    if (error.code?.startsWith("P")) {
      if (error.code === "P2002") {
        return reply.status(409).send({
          statusCode: 409,
          error: "Conflict",
          message: "Resource already exists",
        });
      }
      if (error.code === "P2025") {
        return reply.status(404).send({
          statusCode: 404,
          error: "Not Found",
          message: "Resource not found",
        });
      }
      return reply.status(400).send({
        statusCode: 400,
        error: "Database Error",
        message: "Database operation failed",
      });
    }

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Invalid or expired token",
      });
    }

    return reply.status(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  });

  app.get("/healthcheck", async () => ({ status: "OK" }));

  // Register schemas
  for (const schema of [
    ...authSchemas,
    ...expoSchemas,
    ...artworkSchemas,
    ...benchSchemas,
    ...userSchemas,
  ]) {
    app.addSchema(schema);
  }

  // Swagger
  app.register(swagger, {
    openapi: {
      info: {
        title: "Virtual Art API",
        version: "1.0.0",
        description: "Backend API for the Virtual Art exhibition platform",
      },
      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "access_token",
          },
        },
      },
    },
  });

  app.register(swaggerUI, {
    routePrefix: "/docs",
    staticCSP: true,
  });

  // Routes
  app.register(authRoutes, { prefix: "/api/auth" });
  app.register(expoRoutes, { prefix: "/api/expos" });
  app.register(artworkRoutes, { prefix: "/api/expos/:expoId/artworks" });
  app.register(benchRoutes, { prefix: "/api/expos/:expoId/benches" });
  app.register(userRoutes, { prefix: "/api/users" });

  return app;
}

export default buildServer;
