/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `RefreshSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RefreshSession" DROP COLUMN "expiresAt";
