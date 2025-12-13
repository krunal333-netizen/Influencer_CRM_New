-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('REACH', 'ENGAGEMENT', 'ROI', 'FOLLOWERS', 'LIKES', 'COMMENTS', 'SHARES', 'CONVERSIONS', 'INSTAGRAM_LINK_CLICKS');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayoutType" AS ENUM ('INFLUENCER_COMMISSION', 'CAMPAIGN_PAYMENT', 'REFUND');

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL,
    "metricType" "MetricType" NOT NULL,
    "value" DECIMAL(15,4) NOT NULL,
    "influencerId" TEXT,
    "campaignId" TEXT,
    "storeId" TEXT,
    "instagramProfileUrl" TEXT,
    "instagramFollowers" INTEGER,
    "instagramEngagementRate" DECIMAL(5,2),
    "instagramLinkData" JSONB,
    "metadata" JSONB,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "type" "PayoutType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "influencerId" TEXT,
    "campaignId" TEXT,
    "invoiceId" TEXT,
    "poId" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "statusHistory" JSONB,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_links" (
    "id" TEXT NOT NULL,
    "primaryDocumentId" TEXT NOT NULL,
    "primaryDocumentType" TEXT NOT NULL,
    "linkedDocumentId" TEXT NOT NULL,
    "linkedDocumentType" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "performance_metrics_influencerId_idx" ON "performance_metrics"("influencerId");

-- CreateIndex
CREATE INDEX "performance_metrics_campaignId_idx" ON "performance_metrics"("campaignId");

-- CreateIndex
CREATE INDEX "performance_metrics_storeId_idx" ON "performance_metrics"("storeId");

-- CreateIndex
CREATE INDEX "performance_metrics_metricType_idx" ON "performance_metrics"("metricType");

-- CreateIndex
CREATE INDEX "performance_metrics_recordedAt_idx" ON "performance_metrics"("recordedAt");

-- CreateIndex
CREATE INDEX "payouts_influencerId_idx" ON "payouts"("influencerId");

-- CreateIndex
CREATE INDEX "payouts_campaignId_idx" ON "payouts"("campaignId");

-- CreateIndex
CREATE INDEX "payouts_status_idx" ON "payouts"("status");

-- CreateIndex
CREATE INDEX "payouts_type_idx" ON "payouts"("type");

-- CreateIndex
CREATE INDEX "payouts_requestedAt_idx" ON "payouts"("requestedAt");

-- CreateIndex
CREATE INDEX "document_links_primaryDocumentId_idx" ON "document_links"("primaryDocumentId");

-- CreateIndex
CREATE INDEX "document_links_linkedDocumentId_idx" ON "document_links"("linkedDocumentId");

-- CreateIndex
CREATE INDEX "document_links_primaryDocumentType_idx" ON "document_links"("primaryDocumentType");

-- CreateIndex
CREATE INDEX "document_links_linkedDocumentType_idx" ON "document_links"("linkedDocumentType");

-- CreateIndex
CREATE UNIQUE INDEX "document_links_primaryDocumentId_linkedDocumentId_key" ON "document_links"("primaryDocumentId", "linkedDocumentId");

-- AddForeignKey
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "influencers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "influencers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
