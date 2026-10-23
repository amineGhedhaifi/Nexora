import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "node:path";
import { errorHandler } from "./middleware/error-handler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import contactRoutes from "./modules/contact/contact.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
const app = express();
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use("/uploads/products", express.static(path.resolve(process.cwd(), "uploads", "products")));
app.use(express.json());
app.use(cookieParser());
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Nexora API is running",
    });
});
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(errorHandler);
export default app;
