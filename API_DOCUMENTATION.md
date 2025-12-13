# Analytics & Payouts APIs Documentation

## Overview

This document describes the new Analytics and Payouts APIs added to the Influencer CRM system. These APIs enable:

1. **Performance Metrics Tracking**: Record and aggregate campaign/influencer performance data
2. **Financial Management**: Manage payouts, payment status, and document linkage
3. **Dashboard Support**: Provide aggregated data for analytics dashboards

## Architecture

### New Tables

#### PerformanceMetric

Records various performance metrics (reach, engagement, ROI, etc.) for campaigns and influencers.

```sql
CREATE TABLE performance_metrics (
  id VARCHAR(255) PRIMARY KEY,
  metricType VARCHAR(50) NOT NULL,
  value NUMERIC(15,4) NOT NULL,
  influencerId VARCHAR(255),
  campaignId VARCHAR(255),
  storeId VARCHAR(255),
  instagramProfileUrl VARCHAR(255),
  instagramFollowers INT,
  instagramEngagementRate NUMERIC(5,2),
  instagramLinkData JSON,
  metadata JSON,
  recordedAt TIMESTAMP,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (influencerId) REFERENCES influencers(id),
  FOREIGN KEY (campaignId) REFERENCES campaigns(id),
  FOREIGN KEY (storeId) REFERENCES stores(id)
);
```

#### Payout

Manages influencer commissions and campaign payments with comprehensive audit trails.

```sql
CREATE TABLE payouts (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(10),
  status VARCHAR(50),
  influencerId VARCHAR(255),
  campaignId VARCHAR(255),
  invoiceId VARCHAR(255),
  poId VARCHAR(255),
  requestedAt TIMESTAMP,
  approvedAt TIMESTAMP,
  processedAt TIMESTAMP,
  paidAt TIMESTAMP,
  failedAt TIMESTAMP,
  statusHistory JSON,
  notes TEXT,
  metadata JSON,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (influencerId) REFERENCES influencers(id),
  FOREIGN KEY (campaignId) REFERENCES campaigns(id)
);
```

#### DocumentLink

Enables linking of documents (Invoice ↔ PO ↔ Payout) for complete financial traceability.

```sql
CREATE TABLE document_links (
  id VARCHAR(255) PRIMARY KEY,
  primaryDocumentId VARCHAR(255),
  primaryDocumentType VARCHAR(50),
  linkedDocumentId VARCHAR(255),
  linkedDocumentType VARCHAR(50),
  relationship VARCHAR(100),
  notes TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  UNIQUE(primaryDocumentId, linkedDocumentId)
);
```

### New Modules

1. **Analytics Module** (`backend/src/analytics/`)
   - Services: `AnalyticsService`
   - Controllers: `AnalyticsController`
   - DTOs: Performance metric creation, filtering, and aggregation

2. **Payouts Module** (`backend/src/payouts/`)
   - Services: `PayoutsService`
   - Controllers: `PayoutsController`
   - DTOs: Payout management and document linking

## API Endpoints

### Analytics Endpoints

#### Performance Metrics

**POST** `/analytics/metrics`
Record a new performance metric

```json
{
  "metricType": "REACH",
  "value": 5000,
  "influencerId": "inf-123",
  "campaignId": "camp-456",
  "instagramFollowers": 10000,
  "instagramEngagementRate": 3.5,
  "metadata": {}
}
```

**GET** `/analytics/metrics`
List metrics with filtering

```
Query: ?page=1&limit=10&metricType=REACH&dateFrom=2024-01-01&dateTo=2024-12-31
```

**GET** `/analytics/metrics/:id`
Get metric details

**DELETE** `/analytics/metrics/:id`
Delete a metric

#### Aggregated Analytics

**GET** `/analytics/aggregated`
Get aggregated metrics for a location and date range

```
Query: ?storeId=store-123&dateFrom=2024-01-01&dateTo=2024-12-31
OR
Query: ?firmId=firm-123&dateFrom=2024-01-01&dateTo=2024-12-31
OR
Query: ?campaignId=camp-456&dateFrom=2024-01-01&dateTo=2024-12-31
OR
Query: ?influencerId=inf-789&dateFrom=2024-01-01&dateTo=2024-12-31
```

Response:

```json
{
  "totalReach": 50000,
  "totalEngagement": 2500,
  "totalROI": 150,
  "totalFollowers": 100000,
  "totalLikes": 25000,
  "totalComments": 5000,
  "totalShares": 1000,
  "totalConversions": 500,
  "instagramLinkClicks": 2000,
  "metricCount": 45,
  "byType": {
    "REACH": 50000,
    "ENGAGEMENT": 2500
  },
  "period": {
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-12-31T23:59:59Z"
  }
}
```

**GET** `/analytics/store/:storeId/aggregated`
Get aggregated metrics for a specific store

**GET** `/analytics/firm/:firmId/aggregated`
Get aggregated metrics for a firm (all stores)

#### Influencer Performance

**GET** `/analytics/influencer/:influencerId/score`
Calculate weighted performance score

Response:

```json
{
  "influencerId": "inf-123",
  "performanceScore": 75.5
}
```

**GET** `/analytics/influencer/:influencerId/instagram`
Get Instagram insights from Apify

Response:

```json
{
  "influencerId": "inf-123",
  "hasData": true,
  "profileUrl": "https://instagram.com/username",
  "followers": 50000,
  "engagementRate": 3.5,
  "linkData": {},
  "metrics": [
    {
      "recordedAt": "2024-01-15T10:30:00Z",
      "followers": 50000,
      "engagementRate": 3.5,
      "linkClicks": 150
    }
  ]
}
```

#### Campaign Budget

**GET** `/analytics/campaign/:campaignId/budget-utilization`
Calculate budget utilization metrics

Response:

```json
{
  "campaignId": "camp-456",
  "budget": 10000,
  "spent": 7500,
  "allocated": 9000,
  "available": 2500,
  "utilizationRate": 75,
  "allocationRate": 90,
  "influencerCount": 5
}
```

### Payouts Endpoints

#### Payout Management

**POST** `/payouts`
Create a new payout

```json
{
  "type": "INFLUENCER_COMMISSION",
  "amount": 500,
  "currency": "USD",
  "influencerId": "inf-123",
  "campaignId": "camp-456",
  "notes": "Monthly commission for January"
}
```

**GET** `/payouts`
List payouts with filtering

```
Query: ?status=PENDING&type=INFLUENCER_COMMISSION&page=1&limit=10
```

**GET** `/payouts/:id`
Get payout details

**PUT** `/payouts/:id`
Update payout

```json
{
  "amount": 550,
  "notes": "Adjusted commission"
}
```

**PUT** `/payouts/:id/status`
Update payment status

```json
{
  "status": "APPROVED",
  "notes": "Approved by accounting"
}
```

**DELETE** `/payouts/:id`
Delete a payout

#### Payment Timeline & Audit

**GET** `/payouts/:id/timeline`
Get payment processing timeline

Response:

```json
{
  "payoutId": "payout-123",
  "amount": 500,
  "type": "INFLUENCER_COMMISSION",
  "status": "PAID",
  "timeline": {
    "requested": "2024-01-01T10:00:00Z",
    "approved": "2024-01-02T14:00:00Z",
    "processing": "2024-01-03T09:00:00Z",
    "paid": "2024-01-05T16:30:00Z",
    "failed": null
  },
  "history": [
    {
      "status": "PENDING",
      "timestamp": "2024-01-01T10:00:00Z",
      "notes": "Payout created"
    },
    {
      "status": "APPROVED",
      "timestamp": "2024-01-02T14:00:00Z",
      "notes": "Approved by accounting"
    }
  ]
}
```

**GET** `/payouts/:id/audit-trail`
Get complete audit trail with all status changes

#### Payouts by Entity

**GET** `/payouts/by-influencer/:influencerId`
Get all payouts for an influencer with summary stats

Response:

```json
{
  "influencerId": "inf-123",
  "stats": {
    "totalPayouts": 12,
    "totalAmount": 6000,
    "byStatus": {
      "PENDING": 2,
      "APPROVED": 3,
      "PAID": 7
    },
    "byType": {
      "INFLUENCER_COMMISSION": 10,
      "REFUND": 2
    }
  },
  "payouts": [...]
}
```

**GET** `/payouts/by-campaign/:campaignId`
Get all payouts for a campaign

Response:

```json
{
  "campaign": {
    "id": "camp-456",
    "name": "Summer Campaign 2024",
    "budget": 50000
  },
  "stats": {
    "campaignId": "camp-456",
    "campaignName": "Summer Campaign 2024",
    "totalPayouts": 5,
    "totalAmount": 25000,
    "budgetUtilization": 50,
    "byStatus": {
      "PENDING": 1,
      "PAID": 4
    }
  },
  "payouts": [...]
}
```

#### Document Linkage

**POST** `/payouts/link-documents`
Link documents (Invoice ↔ PO ↔ Payout)

```json
{
  "primaryDocumentId": "po-789",
  "primaryDocumentType": "PO",
  "linkedDocumentId": "inv-456",
  "linkedDocumentType": "INVOICE",
  "relationship": "invoice_for_po",
  "notes": "Invoice for PO #789"
}
```

**GET** `/payouts/document-links/:documentId`
Get all documents linked to a specific document

**DELETE** `/payouts/document-links/:linkId`
Remove a document link

## Testing

Unit tests are included for both modules:

### Run Analytics Tests

```bash
cd backend
pnpm test -- src/analytics/analytics.service.spec.ts
```

### Run Payouts Tests

```bash
cd backend
pnpm test -- src/payouts/payouts.service.spec.ts
```

## Database Migration

The database migration `20251213061836_add_analytics_and_payouts` creates all necessary tables:

- `performance_metrics` table with indexes on metricType, recordedAt, influencerId, campaignId, storeId
- `payouts` table with indexes on status, type, influencerId, campaignId, requestedAt
- `document_links` table with unique constraint and indexes

## Enums

### MetricType

- REACH
- ENGAGEMENT
- ROI
- FOLLOWERS
- LIKES
- COMMENTS
- SHARES
- CONVERSIONS
- INSTAGRAM_LINK_CLICKS

### PaymentStatus

- PENDING
- APPROVED
- PROCESSING
- PAID
- FAILED
- CANCELLED

### PayoutType

- INFLUENCER_COMMISSION
- CAMPAIGN_PAYMENT
- REFUND

## Dashboard Integration

These APIs power the following dashboard widgets:

1. **Store Performance Tabs**: Use `/analytics/store/:storeId/aggregated` for store-specific metrics
2. **Comparison Charts**: Use `/analytics/aggregated` with different stores/firms for comparison
3. **ROI Analysis**: Use aggregated ROI metric and campaign budget utilization
4. **Influencer Rankings**: Use `/analytics/influencer/:id/score` for performance scoring
5. **Payment Status**: Use `/payouts/by-campaign/:campaignId` for payment overview
6. **Budget Tracking**: Use `/analytics/campaign/:campaignId/budget-utilization` for budget monitoring

## Integration with Apify

Instagram data sourced from Apify can be stored and retrieved via:

- `instagramProfileUrl`: Profile URL from Apify
- `instagramFollowers`: Follower count from Apify
- `instagramEngagementRate`: Engagement rate percentage
- `instagramLinkData`: JSON object containing link click data from Apify

This data is stored in the `PerformanceMetric.instagramLinkData` field and retrieved via the `/analytics/influencer/:id/instagram` endpoint.

## Error Handling

All endpoints follow standard REST conventions:

- **200 OK**: Successful retrieval
- **201 Created**: Successful creation
- **400 Bad Request**: Invalid input or parameters
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

Errors include descriptive messages for debugging.

## Authentication

All endpoints require Bearer token authentication via the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

## Performance Considerations

Indexes are created on frequently queried fields:

- `performance_metrics.metricType`
- `performance_metrics.recordedAt`
- `performance_metrics.influencerId`
- `performance_metrics.campaignId`
- `performance_metrics.storeId`
- `payouts.status`
- `payouts.type`
- `payouts.influencerId`
- `payouts.campaignId`
- `payouts.requestedAt`
- `document_links.primaryDocumentId`
- `document_links.linkedDocumentId`
