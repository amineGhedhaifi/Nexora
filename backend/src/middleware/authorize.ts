import type { RequestHandler } from "express";
import type { UserRole } from "../generated/prisma/client.js";
import { AppError } from "../utils/app-error.js";

export function authorize(...allowedRoles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) {
      return next(new AppError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return next(
        new AppError(403, "You do not have permission to perform this action"),
      );
    }

    next();
  };
}
