/*
  Warnings:

  - A unique constraint covering the columns `[asCode]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('ELECTRONICS', 'FASHION', 'BEAUTY', 'LIFESTYLE', 'FITNESS', 'HOME', 'FOOD', 'OTHER');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('REELS', 'POSTS', 'STORIES', 'MIXED');

-- CreateEnum
CREATE TYPE "CourierStatus" AS ENUM ('PENDING', 'SENT', 'IN_TRANSIT', 'DELIVERED', 'RETURNED', 'FAILED');

-- CreateEnum
CREATE TYPE "InvoiceImageStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

-- AlterTable
ALTER TABLE "campaign_products" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "plannedQty" INTEGER;

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "brief" TEXT,
ADD COLUMN     "budgetAllocated" DECIMAL(12,2),
ADD COLUMN     "budgetSpent" DECIMAL(12,2) DEFAULT 0,
ADD COLUMN     "deliverableDeadline" TIMESTAMP(3),
ADD COLUMN     "postsRequired" INTEGER DEFAULT 0,
ADD COLUMN     "reelsRequired" INTEGER DEFAULT 0,
ADD COLUMN     "storiesRequired" INTEGER DEFAULT 0,
ADD COLUMN     "type" "CampaignType" NOT NULL DEFAULT 'MIXED';

-- AlterTable
ALTER TABLE "influencer_campaign_links" ADD COLUMN     "deliverableType" TEXT,
ADD COLUMN     "expectedDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "asCode" TEXT,
ADD COLUMN     "category" "ProductCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "imageUrls" JSONB,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "invoice_images" (
    "id" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "ocrData" JSONB,
    "extractedTotal" DECIMAL(10,2),
    "status" "InvoiceImageStatus" NOT NULL DEFAULT 'PENDING',
    "campaignId" TEXT,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_shipments" (
    "id" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "courierName" TEXT NOT NULL,
    "courierCompany" TEXT NOT NULL,
    "sendStoreId" TEXT,
    "returnStoreId" TEXT,
    "influencerId" TEXT,
    "campaignId" TEXT,
    "sentDate" TIMESTAMP(3),
    "receivedDate" TIMESTAMP(3),
    "returnedDate" TIMESTAMP(3),
    "status" "CourierStatus" NOT NULL DEFAULT 'PENDING',
    "statusTimeline" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_shipments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invoice_images_campaignId_idx" ON "invoice_images"("campaignId");

-- CreateIndex
CREATE INDEX "invoice_images_productId_idx" ON "invoice_images"("productId");

-- CreateIndex
CREATE INDEX "invoice_images_status_idx" ON "invoice_images"("status");

-- CreateIndex
CREATE UNIQUE INDEX "courier_shipments_trackingNumber_key" ON "courier_shipments"("trackingNumber");

-- CreateIndex
CREATE INDEX "courier_shipments_campaignId_idx" ON "courier_shipments"("campaignId");

-- CreateIndex
CREATE INDEX "courier_shipments_influencerId_idx" ON "courier_shipments"("influencerId");

-- CreateIndex
CREATE INDEX "courier_shipments_sendStoreId_idx" ON "courier_shipments"("sendStoreId");

-- CreateIndex
CREATE INDEX "courier_shipments_returnStoreId_idx" ON "courier_shipments"("returnStoreId");

-- CreateIndex
CREATE INDEX "courier_shipments_status_idx" ON "courier_shipments"("status");

-- CreateIndex
CREATE INDEX "campaigns_type_idx" ON "campaigns"("type");

-- CreateIndex
CREATE UNIQUE INDEX "products_asCode_key" ON "products"("asCode");

-- AddForeignKey
ALTER TABLE "invoice_images" ADD CONSTRAINT "invoice_images_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_images" ADD CONSTRAINT "invoice_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_shipments" ADD CONSTRAINT "courier_shipments_sendStoreId_fkey" FOREIGN KEY ("sendStoreId") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_shipments" ADD CONSTRAINT "courier_shipments_returnStoreId_fkey" FOREIGN KEY ("returnStoreId") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_shipments" ADD CONSTRAINT "courier_shipments_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "influencers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_shipments" ADD CONSTRAINT "courier_shipments_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
