-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'BARBERSHOP_OWNER', 'BARBER', 'CLIENT', 'PENDING');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "BarbershopStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING_VERIFICATION');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PENDING',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "mustResetPassword" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT,
    "lastName" TEXT,
    "displayName" TEXT,
    "phone" TEXT,
    "cpf" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "emailVerified" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barbershops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "links" TEXT[],
    "appointmentLink" TEXT,
    "status" "BarbershopStatus" NOT NULL DEFAULT 'ACTIVE',
    "ownerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barbershops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barbershop_staff" (
    "id" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleInShop" "UserRole" NOT NULL,
    "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE',
    "invitedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "hireDate" TIMESTAMP(3),
    "terminatedDate" TIMESTAMP(3),
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "commissionRate" DECIMAL(5,2),
    "salary" DECIMAL(10,2),
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barbershop_staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_cpf_idx" ON "users"("cpf");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "barbershops_ownerUserId_idx" ON "barbershops"("ownerUserId");

-- CreateIndex
CREATE INDEX "barbershops_status_idx" ON "barbershops"("status");

-- CreateIndex
CREATE INDEX "barbershops_createdAt_idx" ON "barbershops"("createdAt");

-- CreateIndex
CREATE INDEX "barbershop_staff_userId_idx" ON "barbershop_staff"("userId");

-- CreateIndex
CREATE INDEX "barbershop_staff_status_idx" ON "barbershop_staff"("status");

-- CreateIndex
CREATE INDEX "barbershop_staff_createdAt_idx" ON "barbershop_staff"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "barbershop_staff_barbershopId_userId_key" ON "barbershop_staff"("barbershopId", "userId");

-- AddForeignKey
ALTER TABLE "barbershops" ADD CONSTRAINT "barbershops_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbershop_staff" ADD CONSTRAINT "barbershop_staff_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "barbershops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbershop_staff" ADD CONSTRAINT "barbershop_staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
