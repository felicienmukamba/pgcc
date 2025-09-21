-- DropForeignKey
ALTER TABLE "birth_records" DROP CONSTRAINT "birth_records_declarerId_fkey";

-- AlterTable
ALTER TABLE "birth_records" ADD COLUMN     "observations" TEXT;

-- AddForeignKey
ALTER TABLE "birth_records" ADD CONSTRAINT "birth_records_declarerId_fkey" FOREIGN KEY ("declarerId") REFERENCES "citizens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
