import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
const productSelect = {
    id: true,
    name: true,
    slug: true,
    description: true,
    price: true,
    stock: true,
    imageUrl: true,
    isActive: true,
    categoryId: true,
    createdAt: true,
    updatedAt: true,
    category: {
        select: {
            id: true,
            name: true,
            slug: true,
        },
    },
};
export async function getProducts(categorySlug, page, limit, includeInactive = false) {
    const where = {
        ...(includeInactive ? {} : { isActive: true }),
        ...(categorySlug
            ? {
                category: {
                    slug: categorySlug,
                },
            }
            : {}),
    };
    const [products, total] = await prisma.$transaction([
        prisma.product.findMany({
            where,
            select: productSelect,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.product.count({ where }),
    ]);
    return {
        products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
export async function getProductBySlug(slug) {
    const product = await prisma.product.findFirst({
        where: {
            slug,
            isActive: true,
        },
        select: productSelect,
    });
    if (!product) {
        throw new AppError(404, "Product not found.");
    }
    return product;
}
export async function createProduct(data) {
    const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
        select: { id: true },
    });
    if (!category) {
        throw new AppError(400, "The specified category does not exist.");
    }
    return prisma.product.create({
        data: {
            ...data,
            price: data.price,
        },
        select: productSelect,
    });
}
export async function updateProduct(id, data) {
    const existingProduct = await prisma.product.findUnique({
        where: { id },
        select: {
            id: true,
            imageUrl: true,
        },
    });
    if (!existingProduct) {
        throw new AppError(404, "Product not found.");
    }
    if (data.categoryId) {
        const category = await prisma.category.findUnique({
            where: { id: data.categoryId },
            select: { id: true },
        });
        if (!category) {
            throw new AppError(400, "The specified category does not exist.");
        }
    }
    const product = await prisma.product.update({
        where: { id },
        data,
        select: productSelect,
    });
    return {
        product,
        oldImageUrl: existingProduct.imageUrl,
    };
}
export async function deleteProduct(id) {
    const existingProduct = await prisma.product.findUnique({
        where: { id },
        select: {
            id: true,
            imageUrl: true,
        },
    });
    if (!existingProduct) {
        throw new AppError(404, "Product not found.");
    }
    await prisma.product.delete({
        where: { id },
    });
    return existingProduct.imageUrl;
}
