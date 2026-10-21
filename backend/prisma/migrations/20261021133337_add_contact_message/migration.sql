-- CreateEnum
CREATE TYPE "ContactTopic" AS ENUM ('GENERAL_INQUIRY', 'PRODUCT_QUESTION', 'ORDER_SUPPORT', 'SHIPPING_DELIVERY', 'RETURNS_REFUNDS', 'TECHNICAL_ISSUE', 'OTHER');

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "topic" "ContactTopic" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");
