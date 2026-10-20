import { AppError } from "../utils/app-error.js";
export const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: "error",
            message: err.message,
        });
        return;
    }
    console.error(err);
    res.status(500).json({
        status: "error",
        message: "Internal server error",
    });
};
