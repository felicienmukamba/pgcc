/*
  Warnings:

  - You are about to drop the `face_descriptors` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "face_descriptors" DROP CONSTRAINT "face_descriptors_citizenId_fkey";

-- DropTable
DROP TABLE "face_descriptors";

-- CreateTable
CREATE TABLE "FaceDescriptor" (
    "id" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "descriptor" DOUBLE PRECISION[],
    "confidence" DOUBLE PRECISION,

    CONSTRAINT "FaceDescriptor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FaceDescriptor" ADD CONSTRAINT "FaceDescriptor_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "citizens"("id") ON DELETE CASCADE ON UPDATE CASCADE;
