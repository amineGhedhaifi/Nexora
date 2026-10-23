import type { Request, Response, NextFunction } from "express";
import { customerQuerySchema } from "./customer.schema.js";
import { getAdminCustomers } from "./customer.service.js";

export async function getAdminCustomersController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Validate and transform query parameters.
    const query = customerQuerySchema.parse(req.query);

    // Retrieve customers and their order statistics.
    const result = await getAdminCustomers(query);

    // Return the result.
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
