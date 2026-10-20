import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client.js";
import { env } from "../../src/config/env.js";

import { seedUsers } from "./user.seeder.js";
import { seedCategories } from "./category.seeder.js";
import { seedProducts } from "./product.seeder.js";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await seedUsers(prisma);
  await seedCategories(prisma);
  await seedProducts(prisma);

  console.log("Database seeding completed successfully.");
}

main()
  .catch((error) => {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
