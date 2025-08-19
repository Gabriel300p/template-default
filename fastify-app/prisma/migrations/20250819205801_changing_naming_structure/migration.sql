/*
  Warnings:

  - You are about to drop the column `barbershopId` on the `barbershop_staff` table. All the data in the column will be lost.
  - You are about to drop the column `commissionRate` on the `barbershop_staff` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `barbershop_staff` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `barbershop_staff` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `barbershop_staff` table. All the data in the column will be lost.
  - You are about to drop the column `hireDate` on the `barbershop_staff` table. All the data in the column will be lost.
  - You are about to drop the column `internalNotes` on the `barbershop_staff` table. All the data in the column will be lost.
  - You are about to drop the column `invitedAt` on the `barbershop_staff` table. All the data in the column will be lost.
  - You are about to drop the column `isAvailable` on the `barbershop_staff` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `barbershop_staff` table. All the data in the column will be lost.
  - You are about to drop the column `roleInShop` on the `barbershop_staff` table. All the data in the column will be lost.
  - You are about to drop the column `terminatedDate` on the `barbershop_staff` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `barbershop_staff` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `barbershop_staff` table. All the data in the column will be lost.
  - You are about to drop the column `appointmentLink` on the `barbershops` table. All the data in the column will be lost.
  - You are about to drop the column `coverUrl` on the `barbershops` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `barbershops` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `barbershops` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `barbershops` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `barbershops` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `barbershops` table. All the data in the column will be lost.
  - You are about to drop the column `ownerUserId` on the `barbershops` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `barbershops` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isSuspended` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastLogin` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mustResetPassword` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[barbershop_id,user_id]` on the table `barbershop_staff` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `barbershop_id` to the `barbershop_staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `barbershop_staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_in_shop` to the `barbershop_staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `barbershop_staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `barbershop_staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `barbershops` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_user_id` to the `barbershops` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `barbershops` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "barbershop_staff" DROP CONSTRAINT "barbershop_staff_barbershopId_fkey";

-- DropForeignKey
ALTER TABLE "barbershop_staff" DROP CONSTRAINT "barbershop_staff_userId_fkey";

-- DropForeignKey
ALTER TABLE "barbershops" DROP CONSTRAINT "barbershops_ownerUserId_fkey";

-- DropIndex
DROP INDEX "barbershop_staff_barbershopId_userId_key";

-- DropIndex
DROP INDEX "barbershop_staff_createdAt_idx";

-- DropIndex
DROP INDEX "barbershop_staff_userId_idx";

-- DropIndex
DROP INDEX "barbershops_createdAt_idx";

-- DropIndex
DROP INDEX "barbershops_ownerUserId_idx";

-- DropIndex
DROP INDEX "users_createdAt_idx";

-- AlterTable
ALTER TABLE "barbershop_staff" DROP COLUMN "barbershopId",
DROP COLUMN "commissionRate",
DROP COLUMN "createdAt",
DROP COLUMN "displayName",
DROP COLUMN "firstName",
DROP COLUMN "hireDate",
DROP COLUMN "internalNotes",
DROP COLUMN "invitedAt",
DROP COLUMN "isAvailable",
DROP COLUMN "lastName",
DROP COLUMN "roleInShop",
DROP COLUMN "terminatedDate",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "barbershop_id" TEXT NOT NULL,
ADD COLUMN     "commission_rate" DECIMAL(5,2),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "display_name" TEXT,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "hire_date" TIMESTAMP(3),
ADD COLUMN     "internal_notes" TEXT,
ADD COLUMN     "invited_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "role_in_shop" "UserRole" NOT NULL,
ADD COLUMN     "terminated_date" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "barbershops" DROP COLUMN "appointmentLink",
DROP COLUMN "coverUrl",
DROP COLUMN "createdAt",
DROP COLUMN "displayName",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "logoUrl",
DROP COLUMN "ownerUserId",
DROP COLUMN "updatedAt",
ADD COLUMN     "appointment_link" TEXT,
ADD COLUMN     "cover_url" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "display_name" TEXT,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "owner_user_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatarUrl",
DROP COLUMN "createdAt",
DROP COLUMN "emailVerified",
DROP COLUMN "isSuspended",
DROP COLUMN "lastLogin",
DROP COLUMN "mustResetPassword",
DROP COLUMN "updatedAt",
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email_verified" TIMESTAMP(3),
ADD COLUMN     "is_suspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_login" TIMESTAMP(3),
ADD COLUMN     "must_reset_password" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "barbershop_staff_user_id_idx" ON "barbershop_staff"("user_id");

-- CreateIndex
CREATE INDEX "barbershop_staff_created_at_idx" ON "barbershop_staff"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "barbershop_staff_barbershop_id_user_id_key" ON "barbershop_staff"("barbershop_id", "user_id");

-- CreateIndex
CREATE INDEX "barbershops_owner_user_id_idx" ON "barbershops"("owner_user_id");

-- CreateIndex
CREATE INDEX "barbershops_created_at_idx" ON "barbershops"("created_at");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- AddForeignKey
ALTER TABLE "barbershops" ADD CONSTRAINT "barbershops_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbershop_staff" ADD CONSTRAINT "barbershop_staff_barbershop_id_fkey" FOREIGN KEY ("barbershop_id") REFERENCES "barbershops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbershop_staff" ADD CONSTRAINT "barbershop_staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
