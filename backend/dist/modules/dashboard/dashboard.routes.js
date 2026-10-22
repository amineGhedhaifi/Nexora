import { Router } from "express";
import { getDashboard } from "./dashboard.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
const router = Router();
router.get("/", authenticate, authorize("ADMIN"), getDashboard);
export default router;
