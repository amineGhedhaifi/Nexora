import { Router } from "express";
import {
  getNotificationsController,
  getUnreadNotificationsCountController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from "./notification.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", getNotificationsController);
router.get("/unread-count", getUnreadNotificationsCountController);
router.patch("/read-all", markAllNotificationsAsReadController);
router.patch("/:id/read", markNotificationAsReadController);

export default router;
