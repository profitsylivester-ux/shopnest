-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "announcement" TEXT,
ADD COLUMN     "deliveryReturns" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "isPaused" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "openingHours" TEXT,
ADD COLUMN     "tiktokUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "details" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
