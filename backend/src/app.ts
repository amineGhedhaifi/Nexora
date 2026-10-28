import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "node:path";
import { errorHandler } from "./middleware/error-handler.js";
import compression from "compression";

import authRoutes from "./modules/auth/auth.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import contactRoutes from "./modules/contact/contact.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import customerRoutes from "./modules/customers/customer.routes.js";
import profileRoutes from "./modules/profile/profile.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(
  "/uploads/products",
  express.static(path.resolve(process.cwd(), "backend", "uploads", "products")),
);

app.use(express.json());
app.use(cookieParser());
app.use(compression());

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
app.use("/api/customers", customerRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);

// Serve the built React frontend in production.
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.resolve(process.cwd(), "frontend", "dist");

  app.use(express.static(frontendDistPath));

  // Let React Router handle frontend routes.
  app.get("/{*path}", (_req, res, next) => {
    res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

app.use(errorHandler);

export default app;
