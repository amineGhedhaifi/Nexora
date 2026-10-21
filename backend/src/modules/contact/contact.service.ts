import { prisma } from "../../lib/prisma.js";
import type { CreateContactMessageInput } from "./contact.schema.js";

export async function createContactMessage(data: CreateContactMessageInput) {
  return prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      topic: data.topic,
      message: data.message,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });
}
