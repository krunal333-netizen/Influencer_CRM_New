# Analytics Module

The Analytics module provides endpoints for recording and aggregating performance metrics for campaigns and influencers.

## Features

- **Performance Metrics Recording**: Record reach, engagement, ROI, followers, likes, comments, shares, conversions, and Instagram link click data
- **Metric Aggregation**: Aggregate metrics by store, firm, influencer, or campaign across date ranges
- **Performance Scoring**: Compute weighted performance scores for influencers
- **Budget Utilization**: Calculate budget utilization rates for campaigns
- **Instagram Integration**: Store and retrieve Apify-sourced Instagram data

## Endpoints

### Record Performance Metrics

- **POST** `/analytics/metrics` - Record a new performance metric
  - Request body: `CreatePerformanceMetricDto`
  - Returns: Created metric with relationships

### List Performance Metrics

- **GET** `/analytics/metrics` - List all metrics with filtering
  - Query params: `metricType`, `influencerId`, `campaignId`, `storeId`, `dateFrom`, `dateTo`, `page`, `limit`
  - Returns: Paginated metrics

### Get Metric Details

- **GET** `/analytics/metrics/:id` - Get a specific metric
  - Returns: Metric details

### Delete Metric

- **DELETE** `/analytics/metrics/:id` - Delete a metric

### Aggregated Analytics

- **GET** `/analytics/aggregated` - Get aggregated metrics for a location and date range
  - Query params: `storeId` OR `firmId` (required), `dateFrom`, `dateTo`, `period`
  - Returns: Aggregated metrics with period

- **GET** `/analytics/store/:storeId/aggregated` - Get aggregated metrics for a store
  - Query params: `dateFrom`, `dateTo`

- **GET** `/analytics/firm/:firmId/aggregated` - Get aggregated metrics for a firm
  - Query params: `dateFrom`, `dateTo`

### Influencer Performance

- **GET** `/analytics/influencer/:influencerId/score` - Get weighted performance score
  - Returns: `{influencerId, performanceScore}`

- **GET** `/analytics/influencer/:influencerId/instagram` - Get Instagram insights from Apify
  - Returns: Profile data, followers, engagement rate, and historical metrics

### Budget Utilization

- **GET** `/analytics/campaign/:campaignId/budget-utilization` - Get budget utilization metrics
  - Returns: Budget, spent, allocated, utilization rate

## Data Models

### PerformanceMetric

```prisma
model PerformanceMetric {
  id                      String
  metricType              MetricType  (REACH, ENGAGEMENT, ROI, FOLLOWERS, LIKES, COMMENTS, SHARES, CONVERSIONS, INSTAGRAM_LINK_CLICKS)
  value                   Decimal     (15, 4)
  influencer              Influencer? (optional)
  campaign                Campaign?   (optional)
  store                   Store?      (optional)
  instagramProfileUrl     String?
  instagramFollowers      Int?
  instagramEngagementRate Decimal?    (5, 2)
  instagramLinkData       Json?       (Apify-sourced data)
  metadata                Json?
  recordedAt              DateTime    (when metric was recorded)
  createdAt               DateTime
  updatedAt               DateTime
}
```

## Aggregation Logic

### Metric Aggregation

- **REACH**: Sum of all reach values
- **ENGAGEMENT**: Sum of all engagement values
- **ROI**: Sum of all ROI values
- **FOLLOWERS**: Sum of all follower count increases
- **LIKES**: Sum of all likes
- **COMMENTS**: Sum of all comments
- **SHARES**: Sum of all shares
- **CONVERSIONS**: Sum of all conversions
- **INSTAGRAM_LINK_CLICKS**: Sum of all Instagram link clicks

### Performance Score (Influencer)

Weighted calculation using the following weights:

- REACH: 20%
- ENGAGEMENT: 30%
- FOLLOWERS: 15%
- CONVERSIONS: 35%
- ROI: 25%

Score is normalized to 0-100 range.

### Budget Utilization

```
utilizationRate = (spent / budget) * 100
allocationRate = (allocated / budget) * 100
available = max(0, budget - spent)
```
