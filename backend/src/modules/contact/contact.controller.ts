import type { Request, Response, NextFunction } from "express";
import { ContactTopic } from "../../generated/prisma/enums.js";
import { createContactMessageSchema } from "./contact.schema.js";
import { createContactMessage } from "./contact.service.js";

export async function submitContactMessage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = createContactMessageSchema.parse(req.body);

    const contactMessage = await createContactMessage(data);

    res.status(201).json({
      message: "Your message has been sent successfully.",
      contactMessage,
    });
  } catch (error) {
    next(error);
  }
}

export async function getContactTopics(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const labelMap: Record<string, string> = {
      GENERAL_INQUIRY: "General Inquiry",
      PRODUCT_QUESTION: "Product Question",
      ORDER_SUPPORT: "Order Support",
      SHIPPING_DELIVERY: "Shipping & Delivery",
      RETURNS_REFUNDS: "Returns & Refunds",
      TECHNICAL_ISSUE: "Technical Issue",
      OTHER: "Other",
    };

    const topics = Object.values(ContactTopic).map((value: string) => ({
      value,
      label: labelMap[value] ?? value
        .split("_")
        .map((word: string) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" "),
    }));

    res.json(topics);
  } catch (error) {
    next(error);
  }
}
