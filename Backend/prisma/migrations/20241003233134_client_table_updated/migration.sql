/*
  Warnings:

  - You are about to drop the column `closedAt` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `openedAt` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Case_access` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Case_access` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Client` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Case_access` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Case" DROP COLUMN "closedAt",
DROP COLUMN "createdAt",
DROP COLUMN "openedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "closed_at" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "start_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Case_access" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
