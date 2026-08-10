import { randomBytes } from "crypto";
import { prisma } from "../../utils/prisma";
import { hashPassword, verifyPassword } from "../../utils/hash";
import {
  sendRegistrationEmail,
  checkResendRateLimit,
} from "../../utils/mailer";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../utils/errors";
import type { RegisterInput, ActivateInput, LoginInput } from "./auth.schemas";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerUser(input: RegisterInput) {
  const { email, firstName, lastName } = input;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isActive: true },
  });

  if (existing) {
    if (existing.isActive) {
      throw new ConflictError(
        "An account with this email already exists. Please log in.",
      );
    }
    // Resend activation for inactive account
    checkResendRateLimit(email);
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    await prisma.user.update({
      where: { id: existing.id },
      data: { activationToken: token, activationTokenExpiresAt: expiresAt },
    });
    await sendRegistrationEmail(email, token);
    return {
      message:
        "Registration successful. Please check your email to activate your account.",
      ...(process.env.NODE_ENV !== "production" && { activationToken: token }),
    };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      hashedPassword: "",
      isActive: false,
      activationToken: token,
      activationTokenExpiresAt: expiresAt,
    },
  });

  await sendRegistrationEmail(email, token);

  return {
    message:
      "Registration successful. Please check your email to activate your account.",
    ...(process.env.NODE_ENV !== "production" && { activationToken: token }),
  };
}

// ─── Activate ─────────────────────────────────────────────────────────────────

export async function activateAccount(input: ActivateInput) {
  const { token, password } = input;

  const user = await prisma.user.findUnique({
    where: { activationToken: token },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      bio: true,
      website: true,
      contact: true,
      avatarUrl: true,
      isActive: true,
      activationTokenExpiresAt: true,
    },
  });

  if (!user) throw new NotFoundError("Invalid or expired activation token.");
  if (user.isActive) throw new ConflictError("This account is already active.");

  if (
    !user.activationTokenExpiresAt ||
    user.activationTokenExpiresAt < new Date()
  ) {
    throw new UnauthorizedError(
      "Activation token has expired. Please request a new one.",
    );
  }

  const { hash, salt } = hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      hashedPassword: `${salt}:${hash}`,
      isActive: true,
      activationToken: null,
      activationTokenExpiresAt: null,
    },
  });

  const { isActive: _a, activationTokenExpiresAt: _b, ...userPublic } = user;
  return { user: userPublic, message: "Account activated successfully." };
}

// ─── Request new activation token ─────────────────────────────────────────────

export async function requestActivationToken(email: string) {
  checkResendRateLimit(email);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isActive: true },
  });

  if (!user) throw new NotFoundError(`No account found for "${email}".`);
  if (user.isActive)
    throw new ConflictError(
      "This account is already active. Please log in instead.",
    );

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: { activationToken: token, activationTokenExpiresAt: expiresAt },
  });

  await sendRegistrationEmail(email, token);

  return {
    message: "Activation instructions have been sent to your email.",
    ...(process.env.NODE_ENV !== "production" && { activationToken: token }),
  };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginUser(input: LoginInput) {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      bio: true,
      website: true,
      contact: true,
      avatarUrl: true,
      isActive: true,
      hashedPassword: true,
    },
  });

  if (!user) throw new UnauthorizedError("Invalid email or password.");

  if (!user.isActive) {
    throw new UnauthorizedError(
      "Your account is not yet activated. Please check your email for the activation link.",
    );
  }

  const colonIdx = user.hashedPassword.indexOf(":");
  const storedSalt = user.hashedPassword.slice(0, colonIdx);
  const storedHash = user.hashedPassword.slice(colonIdx + 1);

  if (
    !verifyPassword({
      candidatePassword: password,
      salt: storedSalt,
      hash: storedHash,
    })
  ) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const { hashedPassword: _pw, isActive: _a, ...userPublic } = user;
  return { user: userPublic };
}

// ─── Get current user ─────────────────────────────────────────────────────────

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      bio: true,
      website: true,
      contact: true,
      avatarUrl: true,
    },
  });

  if (!user) throw new NotFoundError("User not found.");
  return { user };
}
