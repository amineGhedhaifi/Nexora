import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function generateAccessToken(userId, role) {
    return jwt.sign({ role }, env.JWT_SECRET, {
        subject: userId,
        expiresIn: env.JWT_EXPIRES_IN,
    });
}
export function generateRefreshToken() {
    return crypto.randomBytes(32).toString("hex");
}
export function hashRefreshToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}
