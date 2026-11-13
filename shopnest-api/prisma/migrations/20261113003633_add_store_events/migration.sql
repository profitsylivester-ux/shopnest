-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SHOP_VIEW', 'PRODUCT_VIEW', 'WHATSAPP_CLICK');

-- CreateTable
CREATE TABLE "StoreEvent" (
    "id" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storeId" TEXT NOT NULL,
    "productId" TEXT,

    CONSTRAINT "StoreEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreEvent_storeId_createdAt_idx" ON "StoreEvent"("storeId", "createdAt");

-- CreateIndex
CREATE INDEX "StoreEvent_productId_idx" ON "StoreEvent"("productId");

-- AddForeignKey
ALTER TABLE "StoreEvent" ADD CONSTRAINT "StoreEvent_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreEvent" ADD CONSTRAINT "StoreEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
