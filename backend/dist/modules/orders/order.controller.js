import { createOrderSchema } from "./order.schema.js";
import { createOrder } from "./order.service.js";
export async function addOrder(req, res, next) {
    try {
        const data = createOrderSchema.parse(req.body);
        // The authenticated user's ID will be supplied by the auth middleware.
        // Guest checkout requests have no authenticated user.
        const userId = req.auth?.userId;
        const order = await createOrder(data, userId);
        res.status(201).json({
            message: "Order placed successfully.",
            order,
        });
    }
    catch (error) {
        next(error);
    }
}
