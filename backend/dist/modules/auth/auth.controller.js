import { loginSchema, registerSchema } from "./auth.schemas.js";
import { loginUser, logoutUser, registerUser, refreshUser, getCurrentUser, } from "./auth.service.js";
import { AppError } from "../../utils/app-error.js";
import { env } from "../../config/env.js";
export const register = async (req, res, next) => {
    try {
        const result = registerSchema.safeParse(req.body);
        if (!result.success) {
            throw new AppError(400, "Invalid registration data");
        }
        const user = await registerUser(result.data);
        res.status(201).json({
            status: "success",
            data: { user },
        });
    }
    catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            throw new AppError(400, "Invalid login data");
        }
        const { user, accessToken, refreshToken } = await loginUser(result.data);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/api/auth",
            maxAge: 400 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            status: "success",
            data: {
                user,
                accessToken,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        await logoutUser(refreshToken);
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/api/auth",
        });
        res.status(200).json({
            status: "success",
            message: "Logged out successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
export const refresh = async (req, res, next) => {
    try {
        const { user, accessToken, refreshToken } = await refreshUser(req.cookies.refreshToken);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/api/auth",
            maxAge: 400 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            status: "success",
            data: { user, accessToken },
        });
    }
    catch (error) {
        next(error);
    }
};
export const getMe = async (req, res, next) => {
    try {
        if (!req.auth) {
            throw new AppError(401, "Authentication required");
        }
        const user = await getCurrentUser(req.auth.userId);
        res.status(200).json({
            status: "success",
            data: { user },
        });
    }
    catch (error) {
        next(error);
    }
};
