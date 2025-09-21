-- DropForeignKey
ALTER TABLE "death_records" DROP CONSTRAINT "death_records_declarerId_fkey";

-- DropForeignKey
ALTER TABLE "marriage_records" DROP CONSTRAINT "marriage_records_witness1Id_fkey";

-- DropForeignKey
ALTER TABLE "marriage_records" DROP CONSTRAINT "marriage_records_witness2Id_fkey";

-- DropForeignKey
ALTER TABLE "marriage_records" DROP CONSTRAINT "marriage_records_witness3Id_fkey";

-- AddForeignKey
ALTER TABLE "marriage_records" ADD CONSTRAINT "marriage_records_witness1Id_fkey" FOREIGN KEY ("witness1Id") REFERENCES "citizens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marriage_records" ADD CONSTRAINT "marriage_records_witness2Id_fkey" FOREIGN KEY ("witness2Id") REFERENCES "citizens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marriage_records" ADD CONSTRAINT "marriage_records_witness3Id_fkey" FOREIGN KEY ("witness3Id") REFERENCES "citizens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "death_records" ADD CONSTRAINT "death_records_declarerId_fkey" FOREIGN KEY ("declarerId") REFERENCES "citizens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
