import { getAllCategories } from "./category.service.js";
export async function getCategories(_req, res, next) {
    try {
        const categories = await getAllCategories();
        res.status(200).json({ categories });
    }
    catch (error) {
        next(error);
    }
}
