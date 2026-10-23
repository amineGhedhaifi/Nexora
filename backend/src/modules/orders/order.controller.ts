import type { Request, Response, NextFunction } from "express";
import {
  createOrderSchema,
  orderIdSchema,
  orderQuerySchema,
  adminOrderQuerySchema,
  updateOrderStatusSchema,
} from "./order.schema.js";

import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
} from "./order.service.js";
import { AppError } from "../../utils/app-error.js";

export async function addOrder(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = createOrderSchema.parse(req.body);

    // The authenticated user's ID will be supplied by the auth middleware.
    // Guest checkout requests have no authenticated user.
    const userId = req.auth?.userId;

    const order = await createOrder(data, userId);

    res.status(201).json({
      message: "Order placed successfully.",
      order,
      ...(order.trackingToken && {
        trackingToken: order.trackingToken,
      }),
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrder(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = orderIdSchema.parse(req.params);
    const userId = req.auth?.userId;

    const trackingToken =
      typeof req.query.trackingToken === "string"
        ? req.query.trackingToken
        : undefined;

    if (!userId && !trackingToken) {
      throw new AppError(
        401,
        "Authentication or a tracking token is required.",
      );
    }

    const order = await getOrderById(id, userId, trackingToken);

    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrderHistory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      throw new AppError(401, "Authentication is required.");
    }

    const query = orderQuerySchema.parse(req.query);
    const result = await getMyOrders(userId, query);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAdminOrdersController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = adminOrderQuerySchema.parse(req.query);
    const result = await getAdminOrders(query);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAdminOrderByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = orderIdSchema.parse(req.params);
    const order = await getAdminOrderById(id);

    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatusController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = orderIdSchema.parse(req.params);
    const data = updateOrderStatusSchema.parse(req.body);

    const order = await updateOrderStatus(id, data);

    res.status(200).json({
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    next(error);
  }
}
