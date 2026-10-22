import type { Request, Response, NextFunction } from "express";
import {
  getAllCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./category.service.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.schema.js";
import { string } from "zod";

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

export async function getAdminCategoriesController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const categories = await getAdminCategories();

    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
}

export async function createCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await createCategory(data);

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = updateCategorySchema.parse(req.body);
    const category = await updateCategory(req.params.id.toLocaleString(), data);

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await deleteCategory(req.params.id.toString());

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
