/*
  Warnings:

  - A unique constraint covering the columns `[name,brand]` on the table `Dictionary` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Dictionary_name_key";

-- AlterTable
ALTER TABLE "Dictionary" ADD COLUMN     "brand" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "metadata" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "metadata" JSONB DEFAULT '{}';

-- CreateIndex
CREATE UNIQUE INDEX "Dictionary_name_brand_key" ON "Dictionary"("name", "brand");
