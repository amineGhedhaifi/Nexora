import { prisma } from "../../lib/prisma.js";
export async function getAdminCustomers(query) {
    const { page, limit, search, role } = query;
    // Build the filters for registered users.
    const where = {
        ...(role ? { role } : {}),
        ...(search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ],
            }
            : {}),
    };
    const skip = (page - 1) * limit;
    // Retrieve the current page and total number of matching users.
    const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
        }),
        prisma.user.count({ where }),
    ]);
    // Avoid an additional order query if there are no users on this page.
    const userIds = users.map((user) => user.id);
    const orderStats = userIds.length > 0
        ? await prisma.order.groupBy({
            by: ["userId"],
            where: {
                userId: { in: userIds },
                status: { not: "CANCELLED" },
            },
            _count: {
                _all: true,
            },
            _sum: {
                totalAmount: true,
            },
        })
        : [];
    // Index the order statistics by user ID for efficient lookup.
    const statsByUserId = new Map(orderStats
        .filter((stats) => stats.userId !== null)
        .map((stats) => [
        stats.userId,
        {
            totalOrders: stats._count._all,
            totalSpent: Number(stats._sum.totalAmount ?? 0),
        },
    ]));
    // Combine user details with their order statistics.
    const customers = users.map((user) => {
        const stats = statsByUserId.get(user.id);
        return {
            ...user,
            totalOrders: stats?.totalOrders ?? 0,
            totalSpent: stats?.totalSpent ?? 0,
        };
    });
    return {
        customers,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
