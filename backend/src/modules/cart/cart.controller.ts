import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/app-error.js";

import {
  addCartItemSchema,
  cartItemParamsSchema,
  updateCartItemSchema,
} from "./cart.schema.js";

import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "./cart.service.js";

export async function getUserCart(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      throw new AppError(401, "Authentication required.");
    }

    const cart = await getCart(userId);

    res.status(200).json({ cart });
  } catch (error) {
    next(error);
  }
}

export async function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      throw new AppError(401, "Authentication required.");
    }

    const data = addCartItemSchema.parse(req.body);
    const item = await addCartItem(userId, data);

    res.status(201).json({
      message: "Item added to cart successfully.",
      item,
    });
  } catch (error) {
    next(error);
  }
}

export async function editItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      throw new AppError(401, "Authentication required.");
    }

    const { productId } = cartItemParamsSchema.parse(req.params);
    const data = updateCartItemSchema.parse(req.body);

    const item = await updateCartItem(userId, productId, data);

    res.status(200).json({
      message: "Cart item updated successfully.",
      item,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      throw new AppError(401, "Authentication required.");
    }

    const { productId } = cartItemParamsSchema.parse(req.params);

    await removeCartItem(userId, productId);

    res.status(200).json({
      message: "Item removed from cart successfully.",
    });
  } catch (error) {
    next(error);
  }
}

export async function emptyCart(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      throw new AppError(401, "Authentication required.");
    }

    await clearCart(userId);

    res.status(200).json({
      message: "Cart cleared successfully.",
    });
  } catch (error) {
    next(error);
  }
}
