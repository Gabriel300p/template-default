/*
  Warnings:

  - You are about to drop the column `mfa_code` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mfa_expires` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "mfa_code",
DROP COLUMN "mfa_expires",
ADD COLUMN     "mfa_last_verified" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "mfa_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" VARCHAR(8) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_duration_days" INTEGER NOT NULL DEFAULT 14,
    "code_expiry_minutes" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "mfa_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mfa_sessions_user_id_idx" ON "mfa_sessions"("user_id");

-- CreateIndex
CREATE INDEX "mfa_sessions_expires_at_idx" ON "mfa_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "mfa_sessions_used_at_idx" ON "mfa_sessions"("used_at");

-- AddForeignKey
ALTER TABLE "mfa_sessions" ADD CONSTRAINT "mfa_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
