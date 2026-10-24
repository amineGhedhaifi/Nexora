import type { Request, Response, NextFunction } from "express";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./notification.service.js";
import { notificationIdSchema } from "./notification.schema.js";

export async function getNotificationsController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const notifications = await getNotifications();

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUnreadNotificationsCountController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const count = await getUnreadNotificationsCount();

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsReadController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const validation = notificationIdSchema.safeParse(req.params);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
        errors: validation.error.issues,
      });
      return;
    }

    const notification = await markNotificationAsRead(validation.data.id);

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsAsReadController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await markAllNotificationsAsRead();

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      data: {
        updatedCount: result.count,
      },
    });
  } catch (error) {
    next(error);
  }
}
