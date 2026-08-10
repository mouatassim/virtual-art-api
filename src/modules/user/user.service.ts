import { prisma } from "../../utils/prisma";
import { NotFoundError } from "../../utils/errors";
import type { UpdateProfileInput } from "./user.schemas";

function mapUserRow(row: {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  website: string | null;
  contact: string | null;
  avatarUrl: string | null;
  createdAt: Date;
}) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    bio: row.bio,
    website: row.website,
    contact: row.contact,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getProfile(userId: string) {
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
      createdAt: true,
    },
  });
  if (!user) throw new NotFoundError("User not found.");
  return { user: mapUserRow(user) };
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.bio !== undefined && { bio: input.bio || null }),
      ...(input.website !== undefined && { website: input.website || null }),
      ...(input.contact !== undefined && { contact: input.contact || null }),
      ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl || null }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      bio: true,
      website: true,
      contact: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
  return { user: mapUserRow(user) };
}
