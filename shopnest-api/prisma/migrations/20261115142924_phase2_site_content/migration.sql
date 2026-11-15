-- CreateEnum
CREATE TYPE "MenuLocation" AS ENUM ('NAVBAR', 'FOOTER');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameSw" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelSw" TEXT,
    "href" TEXT NOT NULL,
    "location" "MenuLocation" NOT NULL DEFAULT 'NAVBAR',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SitePage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleSw" TEXT,
    "bodyEn" TEXT NOT NULL,
    "bodySw" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SitePage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_nameEn_key" ON "Category"("nameEn");

-- CreateIndex
CREATE INDEX "MenuItem_location_sortOrder_idx" ON "MenuItem"("location", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SitePage_slug_key" ON "SitePage"("slug");

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed: today's 18 product categories (so nothing changes until the admin edits them)
INSERT INTO "Category" ("id", "nameEn", "nameSw", "sortOrder", "isActive", "updatedAt") VALUES
  (gen_random_uuid()::text, 'Electronics', 'Vifaa vya Kielektroniki', 1, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Phones & Tablets', 'Simu na Tableti', 2, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Computers', 'Kompyuta', 3, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Fashion', 'Mitindo', 4, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Shoes', 'Viatu', 5, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Bags & Accessories', 'Mikoba na Vifaa', 6, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Beauty & Health', 'Urembo na Afya', 7, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Home & Furniture', 'Nyumba na Samani', 8, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Appliances', 'Vifaa vya Nyumbani', 9, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Vehicles', 'Magari', 10, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Auto Parts', 'Vipuri vya Magari', 11, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Property', 'Mali Isiyohamishika', 12, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Food & Drinks', 'Chakula na Vinywaji', 13, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Books & Stationery', 'Vitabu na Vifaa vya Ofisi', 14, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Sports & Fitness', 'Michezo na Mazoezi', 15, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Baby & Kids', 'Watoto na Wachanga', 16, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Agriculture', 'Kilimo', 17, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Services', 'Huduma', 18, true, CURRENT_TIMESTAMP);
