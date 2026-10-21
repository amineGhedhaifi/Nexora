import { prisma } from "../../lib/prisma.js";
export async function createContactMessage(data) {
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
