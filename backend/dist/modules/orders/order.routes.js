import { Router } from "express";
import { addOrder, getOrder } from "./order.controller.js";
import { optionalAuthenticate } from "../../middleware/optional-authenticate.js";
const router = Router();
// Create an order: authenticated customers and guests.
router.post("/", optionalAuthenticate, addOrder);
// Retrieve an order: authenticated customers or guests with a tracking token.
router.get("/:id", optionalAuthenticate, getOrder);
export default router;
