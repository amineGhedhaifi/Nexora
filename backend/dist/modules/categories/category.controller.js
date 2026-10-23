import { getAllCategories, getAdminCategories, createCategory, updateCategory, deleteCategory, } from "./category.service.js";
import { createCategorySchema, updateCategorySchema, } from "./category.schema.js";
export async function getCategories(_req, res, next) {
    try {
        const categories = await getAllCategories();
        res.status(200).json({ categories });
    }
    catch (error) {
        next(error);
    }
}
export async function getAdminCategoriesController(_req, res, next) {
    try {
        const categories = await getAdminCategories();
        res.status(200).json({ categories });
    }
    catch (error) {
        next(error);
    }
}
export async function createCategoryController(req, res, next) {
    try {
        const data = createCategorySchema.parse(req.body);
        const category = await createCategory(data);
        res.status(201).json({
            message: "Category created successfully",
            category,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function updateCategoryController(req, res, next) {
    try {
        const data = updateCategorySchema.parse(req.body);
        const category = await updateCategory(req.params.id.toLocaleString(), data);
        res.status(200).json({
            message: "Category updated successfully",
            category,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function deleteCategoryController(req, res, next) {
    try {
        await deleteCategory(req.params.id.toString());
        res.status(200).json({
            message: "Category deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
}
