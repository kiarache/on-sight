/*
  Warnings:

  - You are about to drop the column `address` on the `Partner` table. All the data in the column will be lost.
  - You are about to drop the column `contact` on the `Partner` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `lat` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `sites` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `SystemSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Partner" DROP COLUMN "address",
DROP COLUMN "contact";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "address",
DROP COLUMN "description",
DROP COLUMN "endDate",
DROP COLUMN "lat",
DROP COLUMN "lng",
DROP COLUMN "progress",
DROP COLUMN "sites",
DROP COLUMN "startDate",
ADD COLUMN     "location" TEXT,
ADD COLUMN     "partnerCompany" TEXT,
ALTER COLUMN "lastUpdated" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "SystemSettings";
