import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import type {
  CreateOrderInput,
  OrderQueryInput,
  AdminOrderQueryInput,
  UpdateOrderStatusInput,
  CancelOrderInput,
} from "./order.schema.js";
import { randomBytes } from "node:crypto";

export async function createOrder(data: CreateOrderInput, userId?: string) {
  // Combine duplicate product IDs into a single item.
  const quantities = new Map<string, number>();

  for (const item of data.items) {
    const quantity = quantities.get(item.productId) ?? 0;
    quantities.set(item.productId, quantity + item.quantity);
  }

  const items = Array.from(quantities, ([productId, quantity]) => ({
    productId,
    quantity,
  }));

  // Validate aggregated quantities after combining duplicate products.
  for (const item of items) {
    if (item.quantity > 100) {
      throw new AppError(
        400,
        "The total quantity for a product cannot exceed 100.",
      );
    }
  }

  const trackingToken = userId ? null : randomBytes(32).toString("hex");

  return prisma.$transaction(async (tx) => {
    // Fetch active products from the database.
    const products = await tx.product.findMany({
      where: {
        id: { in: items.map((item) => item.productId) },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
      },
    });

    if (products.length !== items.length) {
      throw new AppError(400, "One or more products are unavailable.");
    }

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    let totalAmountCents = 0;

    // Validate stock and calculate the total using integer cents.
    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId)!;

      if (product.stock < item.quantity) {
        throw new AppError(400, `Insufficient stock for "${product.name}".`);
      }

      const priceStr = String(product.price);
      const [dollars, cents = "0"] = priceStr.split(".");
      const unitPriceCents =
        Number(dollars) * 100 + Number(cents.padEnd(2, "0").slice(0, 2));

      totalAmountCents += unitPriceCents * item.quantity;

      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });

    // Decrement stock conditionally to reduce the risk of overselling.
    for (const item of items) {
      const result = await tx.product.updateMany({
        where: {
          id: item.productId,
          isActive: true,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      if (result.count !== 1) {
        throw new AppError(
          409,
          "Product availability changed. Please review your cart and try again.",
        );
      }
    }

    // Create the order and its items in the same transaction.
    const order = await tx.order.create({
      data: {
        userId: userId ?? null,
        trackingToken,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress,
        totalAmount: (totalAmountCents / 100).toFixed(2),
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    // Create the notification in the same transaction.
    await tx.notification.create({
      data: {
        type: "NEW_ORDER",
        message: `New order received from ${order.customerName}.`,
      },
    });

    return order;
  });
}

export async function getOrderById(
  orderId: string,
  userId?: string,
  trackingToken?: string,
) {
  const where = userId
    ? { id: orderId, userId }
    : { id: orderId, trackingToken: trackingToken ?? "" };

  const order = await prisma.order.findFirst({
    where,
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError(404, "Order not found.");
  }

  return order;
}

export async function getMyOrders(userId: string, query: OrderQueryInput) {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    }),
    prisma.order.count({
      where: { userId },
    }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAdminOrders(query: AdminOrderQueryInput) {
  const { page, limit, status, search } = query;
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { customerName: { contains: search, mode: "insensitive" as const } },
        { customerPhone: { contains: search } },
        { id: { contains: search } },
      ],
    }),
  };

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        status: true,
        totalAmount: true,
        customerName: true,
        customerPhone: true,
        shippingAddress: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { items: true },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAdminOrderById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError(404, "Order not found.");
  }

  return order;
}

export async function getOrdersByUserId(
  userId: string,
  query: AdminOrderQueryInput,
) {
  const { page, limit, status, search } = query;
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(status && { status }),
    ...(search && {
      OR: [
        { customerName: { contains: search, mode: "insensitive" as const } },
        { customerPhone: { contains: search } },
        { id: { contains: search } },
      ],
    }),
  };

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        status: true,
        totalAmount: true,
        customerName: true,
        customerPhone: true,
        shippingAddress: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { items: true },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateOrderStatus(
  orderId: string,
  data: UpdateOrderStatusInput,
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          select: {
            productId: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      throw new AppError(404, "Order not found.");
    }

    const nextStatus = data.status;

    if (order.status === nextStatus) {
      return order;
    }

    const allowedTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (!allowedTransitions[order.status]?.includes(nextStatus)) {
      throw new AppError(
        409,
        `Cannot change order status from ${order.status} to ${nextStatus}.`,
      );
    }

    if (nextStatus === "CANCELLED") {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
          },
        });
      }
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  });
}

export async function cancelOrder(
  orderId: string,
  userId?: string,
  trackingToken?: string,
) {
  const where = userId
    ? { id: orderId, userId }
    : { id: orderId, trackingToken: trackingToken ?? "" };

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where,
      include: {
        items: {
          select: {
            productId: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      throw new AppError(404, "Order not found.");
    }

    const allowedStatuses = ["PENDING", "CONFIRMED"];
    if (!allowedStatuses.includes(order.status)) {
      throw new AppError(
        409,
        `Cannot cancel order with status ${order.status}. Only pending or confirmed orders can be cancelled.`,
      );
    }

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity },
        },
      });
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  });
}
