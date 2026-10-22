// src/modules/dashboard/service.ts
import { OrderStatus, UserRole } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
export const getDashboardStats = async () => {
    const [revenue, totalOrders, totalProducts, totalCustomers] = await Promise.all([
        prisma.order.aggregate({
            where: {
                status: {
                    not: OrderStatus.CANCELLED,
                },
            },
            _sum: {
                totalAmount: true,
            },
        }),
        prisma.order.count(),
        prisma.product.count({
            where: {
                isActive: true,
            },
        }),
        prisma.user.count({
            where: {
                role: UserRole.CLIENT,
            },
        }),
    ]);
    return {
        revenue: revenue._sum.totalAmount?.toString() ?? "0.00",
        totalOrders,
        totalProducts,
        totalCustomers,
    };
};
export const getBestSellingProducts = async () => {
    const products = await prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
            order: {
                status: {
                    not: OrderStatus.CANCELLED,
                },
            },
        },
        _sum: {
            quantity: true,
        },
        orderBy: {
            _sum: {
                quantity: "desc",
            },
        },
        take: 5,
    });
    const productIds = products.map((item) => item.productId);
    const productDetails = await prisma.product.findMany({
        where: {
            id: {
                in: productIds,
            },
        },
        select: {
            id: true,
            name: true,
            imageUrl: true,
            price: true,
        },
    });
    const productMap = new Map(productDetails.map((product) => [product.id, product]));
    return products.flatMap((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
            return [];
        }
        return [
            {
                id: product.id,
                name: product.name,
                imageUrl: product.imageUrl,
                price: product.price.toString(),
                unitsSold: item._sum.quantity ?? 0,
            },
        ];
    });
};
export const getRevenueOverview = async () => {
    const now = new Date();
    // Start at midnight on the first day of the month,
    // 11 months ago, giving us 12 calendar months.
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const orders = await prisma.order.findMany({
        where: {
            status: {
                not: OrderStatus.CANCELLED,
            },
            createdAt: {
                gte: startDate,
                lte: now,
            },
        },
        select: {
            totalAmount: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
    // Initialize every month, including months with no revenue.
    const monthlyRevenue = new Map();
    for (let i = 0; i < 12; i++) {
        const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyRevenue.set(key, 0);
    }
    // Accumulate revenue for each month.
    for (const order of orders) {
        const date = order.createdAt;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const currentRevenue = monthlyRevenue.get(key);
        if (currentRevenue !== undefined) {
            monthlyRevenue.set(key, currentRevenue + Number(order.totalAmount));
        }
    }
    return Array.from(monthlyRevenue, ([month, revenue]) => ({
        month,
        revenue: Number(revenue.toFixed(2)),
    }));
};
export const getRecentOrders = async () => {
    const orders = await prisma.order.findMany({
        take: 8,
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            customerName: true,
            totalAmount: true,
            status: true,
            createdAt: true,
        },
    });
    return orders.map((order) => ({
        ...order,
        totalAmount: order.totalAmount.toString(),
    }));
};
