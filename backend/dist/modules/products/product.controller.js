import { AppError } from "../../utils/app-error.js";
import { createProductSchema, productParamsSchema, productQuerySchema, productSlugParamsSchema, updateProductSchema, adminProductQuerySchema, } from "./product.schemas.js";
import { createProduct, deleteProduct, getProductBySlug, getProducts, updateProduct, } from "./product.service.js";
import { processProductImage } from "../../middleware/upload-product-image.js";
import { deleteProductImage } from "../../utils/product-image.js";
export async function listProducts(req, res, next) {
    try {
        const query = productQuerySchema.parse(req.query);
        const result = await getProducts(query.category, query.page, query.limit);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}
export async function listAdminProducts(req, res, next) {
    try {
        const query = adminProductQuerySchema.parse(req.query);
        const result = await getProducts(query.category, query.page, query.limit, true);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}
export async function getProduct(req, res, next) {
    try {
        const { slug } = productSlugParamsSchema.parse(req.params);
        const product = await getProductBySlug(slug);
        res.status(200).json({ product });
    }
    catch (error) {
        next(error);
    }
}
export async function addProduct(req, res, next) {
    let imageUrl;
    try {
        if (!req.file) {
            throw new AppError(400, "A product image is required.");
        }
        const data = createProductSchema.parse({
            ...req.body,
            price: Number(req.body.price),
            stock: req.body.stock === undefined ? undefined : Number(req.body.stock),
            isActive: req.body.isActive === undefined
                ? undefined
                : req.body.isActive === "true",
        });
        imageUrl = await processProductImage(req.file.buffer);
        const product = await createProduct({
            ...data,
            imageUrl,
        });
        res.status(201).json({
            message: "Product created successfully.",
            product,
        });
    }
    catch (error) {
        if (imageUrl) {
            await deleteProductImage(imageUrl).catch(console.error);
        }
        next(error);
    }
}
export async function editProduct(req, res, next) {
    let newImageUrl;
    try {
        const { id } = productParamsSchema.parse(req.params);
        const data = updateProductSchema.parse({
            ...req.body,
            ...(req.body.price !== undefined && {
                price: Number(req.body.price),
            }),
            ...(req.body.stock !== undefined && {
                stock: Number(req.body.stock),
            }),
            ...(req.body.isActive !== undefined && {
                isActive: req.body.isActive === "true",
            }),
        });
        let updateData = data;
        if (req.file) {
            newImageUrl = await processProductImage(req.file.buffer);
            updateData = {
                ...data,
                imageUrl: newImageUrl,
            };
        }
        const result = await updateProduct(id, updateData);
        if (newImageUrl) {
            await deleteProductImage(result.oldImageUrl).catch(console.error);
        }
        res.status(200).json({
            message: "Product updated successfully.",
            product: result.product,
        });
    }
    catch (error) {
        if (newImageUrl) {
            await deleteProductImage(newImageUrl).catch(console.error);
        }
        next(error);
    }
}
export async function removeProduct(req, res, next) {
    try {
        const { id } = productParamsSchema.parse(req.params);
        const imageUrl = await deleteProduct(id);
        await deleteProductImage(imageUrl).catch((error) => {
            console.error("Failed to delete product image:", error);
        });
        res.status(200).json({
            message: "Product deleted successfully.",
        });
    }
    catch (error) {
        next(error);
    }
}
