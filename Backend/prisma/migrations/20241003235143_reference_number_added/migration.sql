/*
  Warnings:

  - Added the required column `reference_number` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "reference_number" INTEGER NOT NULL;
