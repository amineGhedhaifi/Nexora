import { prisma } from "../../lib/prisma.js";
export async function createContactMessage(data) {
    return prisma.$transaction(async (tx) => {
        const contactMessage = await tx.contactMessage.create({
            data: {
                name: data.name,
                email: data.email,
                topic: data.topic,
                message: data.message,
            },
            select: {
                id: true,
                name: true,
                email: true,
                topic: true,
                message: true,
                status: true,
                createdAt: true,
            },
        });
        await tx.notification.create({
            data: {
                type: "NEW_MESSAGE",
                message: `New contact message from ${contactMessage.name}.`,
            },
        });
        return contactMessage;
    });
}
export async function getAllContactMessages() {
    return prisma.contactMessage.findMany({
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            name: true,
            email: true,
            topic: true,
            message: true,
            status: true,
            createdAt: true,
        },
    });
}
export async function getAdminContactMessages(query) {
    const { page, limit, search, status, topic } = query;
    const where = {
        ...(status ? { status } : {}),
        ...(topic ? { topic } : {}),
        ...(search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                    { message: { contains: search, mode: "insensitive" } },
                ],
            }
            : {}),
    };
    const [contactMessages, total] = await prisma.$transaction([
        prisma.contactMessage.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                topic: true,
                message: true,
                status: true,
                createdAt: true,
            },
        }),
        prisma.contactMessage.count({ where }),
    ]);
    return {
        contactMessages,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
export async function updateContactMessageStatus(id, data) {
    return prisma.contactMessage.update({
        where: { id },
        data: {
            status: data.status,
        },
        select: {
            id: true,
            name: true,
            email: true,
            topic: true,
            message: true,
            status: true,
            createdAt: true,
        },
    });
}
