-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" BYTEA,
    "passwordSalt" BYTEA,
    "accessFailedCount" INTEGER,
    "isLocked" BOOLEAN NOT NULL,
    "isLockedUntil" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
