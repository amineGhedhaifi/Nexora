import { PrismaClient } from "../../src/generated/prisma/client.js";

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices and accessories.",
  },
  {
    name: "Clothing",
    slug: "clothing",
    description: "Clothing and fashion accessories.",
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Products for your home and kitchen.",
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    description: "Sports equipment and outdoor essentials.",
  },
  {
    name: "Books",
    slug: "books",
    description: "Books and reading materials.",
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    description: "Beauty and personal care products.",
  },
  {
    name: "Toys & Games",
    slug: "toys-games",
    description: "Toys, games, and entertainment.",
  },
];

export async function seedCategories(prisma: PrismaClient) {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
      },
      create: category,
    });
  }

  console.log("Categories seeded successfully.");
}
