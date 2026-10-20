import { prisma } from "../../lib/prisma.js";
export async function getAllCategories() {
    return prisma.category.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}
