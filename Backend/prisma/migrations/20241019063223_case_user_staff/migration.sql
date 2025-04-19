/*
  Warnings:

  - Added the required column `staff_id` to the `Case` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "staff_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
