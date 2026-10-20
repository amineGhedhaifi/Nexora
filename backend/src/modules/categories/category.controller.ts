import type { Request, Response, NextFunction } from "express";
import { getAllCategories } from "./category.service.js";

export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const categories = await getAllCategories();

    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
}
