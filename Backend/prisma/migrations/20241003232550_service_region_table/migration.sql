/*
  Warnings:

  - Added the required column `service_id` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Region" AS ENUM ('WINDSOR', 'LEAMINGTON', 'HARROW', 'AMHERSTBURG', 'TILBURY', 'CHATHAM');

-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "service_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "region" "Region" NOT NULL;

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initial_contact_days" INTEGER NOT NULL,
    "intake_interview_days" INTEGER NOT NULL,
    "action_plan_weeks" INTEGER NOT NULL,
    "monthly_contact" BOOLEAN NOT NULL,
    "monthly_reports" BOOLEAN NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
