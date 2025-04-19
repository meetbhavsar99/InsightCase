/*
  Warnings:

  - You are about to drop the column `user_id` on the `Task` table. All the data in the column will be lost.
  - Added the required column `staff_id` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_user_id_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "user_id",
ADD COLUMN     "staff_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
