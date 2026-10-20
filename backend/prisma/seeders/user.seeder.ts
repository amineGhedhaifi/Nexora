import argon2 from "argon2";
import type { PrismaClient } from "../../src/generated/prisma/client.js";

export async function seedUsers(prisma: PrismaClient) {
  const adminPasswordHash = await argon2.hash("Admin123456!");
  const clientPasswordHash = await argon2.hash("Client123456!");

  await prisma.user.upsert({
    where: { email: "admin@nexora.com" },
    update: {
      name: "Nexora Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
    create: {
      name: "Nexora Admin",
      email: "admin@nexora.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "client@nexora.com" },
    update: {
      name: "Nexora Client",
      passwordHash: clientPasswordHash,
      role: "CLIENT",
    },
    create: {
      name: "Nexora Client",
      email: "client@nexora.com",
      passwordHash: clientPasswordHash,
      role: "CLIENT",
    },
  });

  console.log("Admin and client accounts seeded successfully.");
}
