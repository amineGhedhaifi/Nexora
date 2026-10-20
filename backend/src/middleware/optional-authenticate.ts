import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const optionalAuthenticate: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  // No token: continue as a guest.
  if (!authHeader) {
    return next();
  }

  // A supplied token must use the Bearer scheme.
  if (!authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      !payload.sub ||
      (payload.role !== "CLIENT" && payload.role !== "ADMIN")
    ) {
      return next();
    }

    req.auth = {
      userId: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    // Invalid or expired token: treat the request as a guest.
    // This preserves guest checkout even if an old token is present.
    next();
  }
};
