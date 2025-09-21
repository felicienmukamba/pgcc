/*
  Warnings:

  - You are about to drop the column `createdAt` on the `face_descriptors` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `face_descriptors` table. All the data in the column will be lost.
  - The `descriptor` column on the `face_descriptors` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[citizenId]` on the table `face_descriptors` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "face_descriptors" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "descriptor",
ADD COLUMN     "descriptor" DOUBLE PRECISION[],
ALTER COLUMN "confidence" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "face_descriptors_citizenId_key" ON "face_descriptors"("citizenId");
