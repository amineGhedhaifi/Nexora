import { Router } from "express";
import { submitContactMessage, getContactTopics, getAdminContactMessagesController, updateContactMessageStatusController, } from "./contact.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
const router = Router();
// Public routes
router.get("/topics", getContactTopics);
router.post("/", submitContactMessage);
// Admin routes
router.get("/admin", authenticate, authorize("ADMIN"), getAdminContactMessagesController);
router.patch("/admin/:id/status", authenticate, authorize("ADMIN"), updateContactMessageStatusController);
export default router;
