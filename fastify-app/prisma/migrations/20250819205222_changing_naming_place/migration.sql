/*
  Warnings:

  - You are about to drop the column `email` on the `barbershops` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `barbershops` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "barbershop_staff" ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "barbershops" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "bio",
DROP COLUMN "displayName",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "phone";
