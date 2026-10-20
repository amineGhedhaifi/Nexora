import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export const authenticate: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError(401, "Authentication required"));
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof payload === "string" ||
      !payload.sub ||
      (payload.role !== "CLIENT" && payload.role !== "ADMIN")
    ) {
      return next(new AppError(401, "Invalid access token"));
    }

    req.auth = {
      userId: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    next(new AppError(401, "Invalid or expired access token"));
  }
};
