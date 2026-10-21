import { Router } from "express";
import { submitContactMessage, getContactTopics } from "./contact.controller.js";
const router = Router();
router.get("/topics", getContactTopics);
router.post("/", submitContactMessage);
export default router;
