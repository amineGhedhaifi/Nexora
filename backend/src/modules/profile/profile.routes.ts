import { Router } from "express";
import {
  updateProfileController,
  changePasswordController,
} from "./profile.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

// Update the authenticated user's profile.
router.patch("/me", authenticate, updateProfileController);

// Change the authenticated user's password.
router.patch("/me/password", authenticate, changePasswordController);

export default router;
