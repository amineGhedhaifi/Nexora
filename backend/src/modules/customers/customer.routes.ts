import { Router } from "express";
import { getAdminCustomersController } from "./customer.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.get(
  "/admin",
  authenticate,
  authorize("ADMIN"),
  getAdminCustomersController,
);

export default router;
