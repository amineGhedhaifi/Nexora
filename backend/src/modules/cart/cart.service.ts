import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import type { AddCartItemInput, UpdateCartItemInput } from "./cart.schema.js";

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getCart(userId: string) {
  const cart = await getOrCreateCart(userId);

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          stock: true,
          imageUrl: true,
          isActive: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const totalAmount = items.reduce(
    (total, item) => total + Number(item.product.price) * item.quantity,
    0,
  );

  return {
    id: cart.id,
    items,
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    totalAmount: totalAmount.toFixed(2),
  };
}

export async function addCartItem(userId: string, data: AddCartItemInput) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: {
        id: data.productId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    if (!product) {
      throw new AppError(404, "Product not found or unavailable.");
    }

    const cart = await tx.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const existingItem = await tx.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
    });

    const newQuantity = (existingItem?.quantity ?? 0) + data.quantity;

    if (newQuantity > product.stock) {
      throw new AppError(
        400,
        `Only ${product.stock} unit(s) of "${product.name}" are currently available.`,
      );
    }

    return tx.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
      update: {
        quantity: newQuantity,
      },
      create: {
        cartId: cart.id,
        productId: product.id,
        quantity: data.quantity,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            stock: true,
            imageUrl: true,
          },
        },
      },
    });
  });
}

export async function updateCartItem(
  userId: string,
  productId: string,
  data: UpdateCartItemInput,
) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new AppError(404, "Cart not found.");
  }

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: {
        id: productId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    if (!product) {
      throw new AppError(404, "Product not found or unavailable.");
    }

    if (data.quantity > product.stock) {
      throw new AppError(
        400,
        `Only ${product.stock} unit(s) of "${product.name}" are currently available.`,
      );
    }

    const result = await tx.cartItem.updateMany({
      where: {
        cartId: cart.id,
        productId,
      },
      data: {
        quantity: data.quantity,
      },
    });

    if (result.count === 0) {
      throw new AppError(404, "Cart item not found.");
    }

    return tx.cartItem.findUniqueOrThrow({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            stock: true,
            imageUrl: true,
          },
        },
      },
    });
  });
}

export async function removeCartItem(userId: string, productId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new AppError(404, "Cart not found.");
  }

  const result = await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  if (result.count === 0) {
    throw new AppError(404, "Cart item not found.");
  }
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    return;
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });
}
