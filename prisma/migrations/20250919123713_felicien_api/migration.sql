/*
  Warnings:

  - The primary key for the `_MedicationToPrescription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_MedicationToPrescription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_MedicationToPrescription" DROP CONSTRAINT "_MedicationToPrescription_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_MedicationToPrescription_AB_unique" ON "_MedicationToPrescription"("A", "B");
