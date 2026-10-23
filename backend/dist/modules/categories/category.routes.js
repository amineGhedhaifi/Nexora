import { Router } from "express";
import { getCategories, getAdminCategoriesController, createCategoryController, updateCategoryController, deleteCategoryController, } from "./category.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
const router = Router();
// Public routes
router.get("/", getCategories);
// Admin routes
router.get("/admin", authenticate, authorize("ADMIN"), getAdminCategoriesController);
router.post("/", authenticate, authorize("ADMIN"), createCategoryController);
router.patch("/:id", authenticate, authorize("ADMIN"), updateCategoryController);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteCategoryController);
export default router;
