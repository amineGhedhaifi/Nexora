import { Router } from "express";
import { addOrder } from "./order.controller.js";
import { optionalAuthenticate } from "../../middleware/optional-authenticate.js";

const router = Router();

router.post("/", optionalAuthenticate, addOrder);

export default router;
