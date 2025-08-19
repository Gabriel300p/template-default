/*
  Warnings:

  - You are about to alter the column `cpf` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(14)`.
  - A unique constraint covering the columns `[passport]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "display_name" TEXT,
ADD COLUMN     "is_foreigner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mfa_code" VARCHAR(8),
ADD COLUMN     "mfa_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mfa_expires" TIMESTAMP(3),
ADD COLUMN     "passport" VARCHAR(20),
ADD COLUMN     "phone" VARCHAR(20),
ALTER COLUMN "cpf" SET DATA TYPE VARCHAR(14);

-- CreateIndex
CREATE UNIQUE INDEX "users_passport_key" ON "users"("passport");

-- CreateIndex
CREATE INDEX "users_passport_idx" ON "users"("passport");
