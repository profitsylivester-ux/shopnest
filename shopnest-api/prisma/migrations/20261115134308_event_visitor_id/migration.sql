-- AlterTable
ALTER TABLE "StoreEvent" ADD COLUMN     "visitorId" TEXT;

-- CreateIndex
CREATE INDEX "StoreEvent_storeId_type_visitorId_idx" ON "StoreEvent"("storeId", "type", "visitorId");
