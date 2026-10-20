import { Router } from "express";

import {
  addProduct,
  editProduct,
  getProduct,
  listProducts,
  removeProduct,
} from "./product.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { uploadProductImage } from "../../middleware/upload-product-image.js";

const router = Router();

// Public routes
router.get("/", listProducts);
router.get("/:slug", getProduct);

// Admin-only routes
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  uploadProductImage,
  addProduct,
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  uploadProductImage,
  editProduct,
);
router.delete("/:id", authenticate, authorize("ADMIN"), removeProduct);

export default router;
