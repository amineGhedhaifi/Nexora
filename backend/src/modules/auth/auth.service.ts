import argon2 from "argon2";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import type { RegisterInput } from "./auth.schemas.js";
import type { LoginInput } from "./auth.schemas.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../../utils/tokens.js";

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError(409, "An account with this email already exists");
  }

  const passwordHash = await argon2.hash(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isPasswordValid = await argon2.verify(
    user.passwordHash,
    input.password,
  );

  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);

  await prisma.refreshSession.create({
    data: {
      tokenHash,
      userId: user.id,
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function logoutUser(refreshToken: string | undefined) {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashRefreshToken(refreshToken);

  await prisma.refreshSession.deleteMany({
    where: { tokenHash },
  });
}

export async function refreshUser(refreshToken: string | undefined) {
  if (!refreshToken) {
    throw new AppError(401, "Refresh token is required");
  }

  const tokenHash = hashRefreshToken(refreshToken);

  const session = await prisma.refreshSession.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) {
    throw new AppError(401, "Invalid refresh token");
  }

  // Generate a new pair of tokens.
  const accessToken = generateAccessToken(session.user.id, session.user.role);

  const newRefreshToken = generateRefreshToken();
  const newTokenHash = hashRefreshToken(newRefreshToken);

  // Extend the refresh session by another 7 days.
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Rotate the refresh token stored in the database.
  const rotation = await prisma.refreshSession.updateMany({
    where: {
      id: session.id,
      tokenHash,
    },
    data: {
      tokenHash: newTokenHash,
    },
  });

  if (rotation.count === 0) {
    throw new AppError(401, "Refresh token is no longer valid");
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    },
    accessToken,
    refreshToken: newRefreshToken,
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
}
