import { Router } from "express";
import { addOrder, getOrder, getMyOrderHistory, getAdminOrdersController, getAdminOrderByIdController, updateOrderStatusController, cancelOrderController, } from "./order.controller.js";
import { optionalAuthenticate } from "../../middleware/optional-authenticate.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
const router = Router();
// Admin routes — register before /:id.
router.get("/admin", authenticate, authorize("ADMIN"), getAdminOrdersController);
router.get("/admin/:id", authenticate, authorize("ADMIN"), getAdminOrderByIdController);
router.patch("/admin/:id/status", authenticate, authorize("ADMIN"), updateOrderStatusController);
// Customer and guest routes.
router.post("/", optionalAuthenticate, addOrder);
router.get("/", optionalAuthenticate, getMyOrderHistory);
router.get("/:id", optionalAuthenticate, getOrder);
// Customer cancel order
router.patch("/:id/cancel", optionalAuthenticate, cancelOrderController);
export default router;
