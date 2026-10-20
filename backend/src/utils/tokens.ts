import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function generateAccessToken(userId: string, role: string) {
  return jwt.sign({ role }, env.JWT_SECRET, {
    subject: userId,
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function generateRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashRefreshToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
