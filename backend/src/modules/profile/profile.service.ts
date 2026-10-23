import argon2 from "argon2";
import { prisma } from "../../lib/prisma.js";
import type {
  UpdateProfileInput,
  ChangePasswordInput,
} from "./profile.schema.js";
import { AppError } from "../../utils/app-error.js";

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  try {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.email !== undefined
          ? { email: data.email.toLowerCase() }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new AppError(409, "This email address is already in use.");
    }

    throw error;
  }
}

export async function changePassword(
  userId: string,
  data: ChangePasswordInput,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  const isCurrentPasswordValid = await argon2.verify(
    user.passwordHash,
    data.currentPassword,
  );

  if (!isCurrentPasswordValid) {
    throw new AppError(400, "Current password is incorrect.");
  }

  const newPasswordHash = await argon2.hash(data.newPassword);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    await tx.refreshSession.deleteMany({
      where: { userId },
    });
  });

  return {
    message:
      "Password changed successfully. Please sign in again on your devices.",
  };
}
