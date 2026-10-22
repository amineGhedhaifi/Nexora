import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.schema.js";

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Public: list all categories
export async function getAllCategories() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

// Admin: list all categories
export async function getAdminCategories() {
  return prisma.category.findMany({
    select: {
      ...categorySelect,
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

// Admin: create a category
export async function createCategory(data: CreateCategoryInput) {
  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
    },
    select: categorySelect,
  });
}

// Admin: update a category
export async function updateCategory(id: string, data: UpdateCategoryInput) {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
    },
    select: categorySelect,
  });
}

// Admin: delete a category
export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  if (category._count.products > 0) {
    throw new AppError(
      409,
      "Cannot delete a category that still contains products",
    );
  }

  await prisma.category.delete({
    where: { id },
  });
}
