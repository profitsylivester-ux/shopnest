-- CreateTable
CREATE TABLE "StoreSlugHistory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storeId" TEXT NOT NULL,

    CONSTRAINT "StoreSlugHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreSlugHistory_slug_key" ON "StoreSlugHistory"("slug");

-- CreateIndex
CREATE INDEX "StoreSlugHistory_storeId_idx" ON "StoreSlugHistory"("storeId");

-- AddForeignKey
ALTER TABLE "StoreSlugHistory" ADD CONSTRAINT "StoreSlugHistory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
