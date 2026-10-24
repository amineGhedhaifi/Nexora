import type { Request, Response, NextFunction } from "express";
import { updateProfileSchema, changePasswordSchema } from "./profile.schema.js";
import { updateProfile, changePassword } from "./profile.service.js";

export async function updateProfileController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const data = updateProfileSchema.parse(req.body);
    const userId = req.auth?.userId;

    const profile = await updateProfile(userId, data);

    res.status(200).json({
      status: "success",
      data: {
        message: "Profile updated successfully.",
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function changePasswordController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = changePasswordSchema.parse(req.body);

    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const result = await changePassword(userId, data);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
