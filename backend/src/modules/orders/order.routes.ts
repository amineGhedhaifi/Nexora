import { Router } from "express";
import { addOrder, getOrder, getMyOrderHistory } from "./order.controller.js";
import { optionalAuthenticate } from "../../middleware/optional-authenticate.js";

const router = Router();

// Create an order for authenticated customers or guests.
router.post("/", optionalAuthenticate, addOrder);

// Retrieve the authenticated customer's order history.
router.get("/", optionalAuthenticate, getMyOrderHistory);

// Retrieve an individual order using authentication or a guest tracking token.
router.get("/:id", optionalAuthenticate, getOrder);

export default router;
