import { Router } from "express";

import {
  addItem,
  editItem,
  emptyCart,
  getUserCart,
  removeItem,
} from "./cart.controller.js";

import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", getUserCart);
router.post("/items", addItem);
router.patch("/items/:productId", editItem);
router.delete("/items/:productId", removeItem);
router.delete("/", emptyCart);

export default router;
