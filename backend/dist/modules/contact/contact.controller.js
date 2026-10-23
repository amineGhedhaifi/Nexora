import { ContactTopic } from "../../generated/prisma/enums.js";
import { createContactMessageSchema, adminContactMessagesQuerySchema, updateContactMessageStatusSchema, } from "./contact.schema.js";
import { createContactMessage, getAllContactMessages, getAdminContactMessages, updateContactMessageStatus, } from "./contact.service.js";
export async function submitContactMessage(req, res, next) {
    try {
        const data = createContactMessageSchema.parse(req.body);
        const contactMessage = await createContactMessage(data);
        res.status(201).json({
            message: "Your message has been sent successfully.",
            contactMessage,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getContactTopics(_req, res, next) {
    try {
        const labelMap = {
            GENERAL_INQUIRY: "General Inquiry",
            PRODUCT_QUESTION: "Product Question",
            ORDER_SUPPORT: "Order Support",
            SHIPPING_DELIVERY: "Shipping & Delivery",
            RETURNS_REFUNDS: "Returns & Refunds",
            TECHNICAL_ISSUE: "Technical Issue",
            OTHER: "Other",
        };
        const topics = Object.values(ContactTopic).map((value) => ({
            value,
            label: labelMap[value] ??
                value
                    .split("_")
                    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                    .join(" "),
        }));
        res.json(topics);
    }
    catch (error) {
        next(error);
    }
}
export async function getAllContactMessagesController(_req, res, next) {
    try {
        const contactMessages = await getAllContactMessages();
        res.status(200).json({
            contactMessages,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getAdminContactMessagesController(req, res, next) {
    try {
        const query = adminContactMessagesQuerySchema.parse(req.query);
        const result = await getAdminContactMessages(query);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}
export async function updateContactMessageStatusController(req, res, next) {
    try {
        const { status } = updateContactMessageStatusSchema.parse(req.body);
        const { id } = req.params;
        const contactMessage = await updateContactMessageStatus(id.toString(), {
            status,
        });
        res.status(200).json({
            message: "Contact message status updated successfully.",
            contactMessage,
        });
    }
    catch (error) {
        next(error);
    }
}
