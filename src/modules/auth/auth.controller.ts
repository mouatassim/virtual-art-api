import type { FastifyReply, FastifyRequest } from "fastify";
import { clearCookie, setCookie } from "../../utils/cookies";
import type {
  RegisterInput,
  ActivateInput,
  RequestActivationInput,
  LoginInput,
} from "./auth.schemas";
import {
  registerUser,
  activateAccount,
  requestActivationToken,
  loginUser,
  getCurrentUser,
} from "./auth.service";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24,
};

export async function registerHandler(
  request: FastifyRequest<{ Body: RegisterInput }>,
  reply: FastifyReply,
) {
  const result = await registerUser(request.body);
  return reply.code(201).send(result);
}

export async function activateHandler(
  request: FastifyRequest<{ Body: ActivateInput }>,
  reply: FastifyReply,
) {
  const result = await activateAccount(request.body);

  const accessToken = request.jwt.sign({
    userId: result.user.id,
    email: result.user.email,
  });
  setCookie(reply, "access_token", accessToken, COOKIE_OPTIONS);

  return reply.code(200).send(result);
}

export async function requestActivationHandler(
  request: FastifyRequest<{ Body: RequestActivationInput }>,
  reply: FastifyReply,
) {
  const result = await requestActivationToken(request.body.email);
  return reply.code(200).send(result);
}

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply,
) {
  const result = await loginUser(request.body);

  const accessToken = request.jwt.sign({
    userId: result.user.id,
    email: result.user.email,
  });
  setCookie(reply, "access_token", accessToken, COOKIE_OPTIONS);

  return reply.code(200).send(result);
}

export async function logoutHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  clearCookie(reply, "access_token", { path: "/" });
  return reply.code(200).send({ message: "Successfully logged out." });
}

export async function meHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const result = await getCurrentUser(request.user.userId);
  return reply.code(200).send(result);
}
