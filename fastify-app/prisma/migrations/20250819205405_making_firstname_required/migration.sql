/*
  Warnings:

  - Made the column `firstName` on table `barbershop_staff` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firstName` on table `barbershops` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "barbershop_staff" ALTER COLUMN "firstName" SET NOT NULL;

-- AlterTable
ALTER TABLE "barbershops" ALTER COLUMN "firstName" SET NOT NULL;
