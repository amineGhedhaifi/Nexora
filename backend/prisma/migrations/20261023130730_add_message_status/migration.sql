-- CreateEnum
CREATE TYPE "ContactMessageStatus" AS ENUM ('UNREAD', 'READ', 'RESOLVED');

-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "status" "ContactMessageStatus" NOT NULL DEFAULT 'UNREAD';

-- CreateIndex
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");
