# Entity-Relationship Diagram & Data Model

## Overview

This document describes the database schema for the Influencer CRM system. The schema is designed to manage influencer campaigns, user authentication, financial documents, and analytics.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      USER MANAGEMENT LAYER                          │
├─────────────────────────────────────────────────────────────────────┤
│
│  ┌──────────────┐         ┌────────────┐         ┌──────────────┐
│  │    User      │◄────────┤   Role     │────────►│ Permission   │
│  ├──────────────┤         ├────────────┤         ├──────────────┤
│  │ id (PK)      │         │ id (PK)    │         │ id (PK)      │
│  │ email        │         │ name       │         │ name         │
│  │ name         │         │ description│         │ description  │
│  │ password     │         └────────────┘         └──────────────┘
│  │ firmId (FK)  │              ▲
│  └──────────────┘              │
│         ▲                      │
│         │            ┌─────────┴──────────┐
│         │            │  role_permission   │
│         │            │  junction table    │
│         │            └────────────────────┘
│
│  ┌──────────────┐
│  │    Firm      │
│  ├──────────────┤
│  │ id (PK)      │
│  │ name         │
│  │ email        │
│  │ phone        │
│  │ address      │
│  │ city         │
│  │ state        │
│  │ zipCode      │
│  │ country      │
│  └──────────────┘
│         │
│         │ 1:N
│         ▼
│  ┌──────────────┐
│  │    Store     │
│  ├──────────────┤
│  │ id (PK)      │
│  │ name         │
│  │ email        │
│  │ phone        │
│  │ address      │
│  │ firmId (FK)  │
│  └──────────────┘
│         │              ▲───────────────┐
│         │              │               │
│         │ 1:N          │ 1:N           │ 1:N
│         ▼              │               │
│  ┌──────────────┐      │  ┌───────────────┐  ┌────────────────┐
│  │   Campaign   │      │  │ SendStore     │  │ ReturnStore    │
│  └──────────────┘      │  │ (relation)    │  │ (relation)     │
│         │               │  └───────────────┘  └────────────────┘
│    ┌────┴─────┬──────────────────┐
│    │           │                  │
│  1:N         1:N                 1:N
│    │           │                  │
│    ▼           ▼                  ▼
│  ┌──────────────────────┐  ┌────────────────┐
│  │ CampaignProduct      │  │  Influencer    │
│  ├──────────────────────┤  │  CampaignLink  │
│  │ id (PK)              │  ├────────────────┤
│  │ quantity             │  │ id (PK)        │
│  │ discount             │  │ rate           │
│  │ campaignId (FK)      │  │ status         │
│  │ productId (FK)       │  │ deliverables   │
│  └──────────────────────┘  │ influencerId   │
│          │                 │ (FK)           │
│      1:N │                 │ campaignId     │
│          ▼                 │ (FK)           │
│  ┌──────────────┐         └────────────────┘
│  │   Product    │                │
│  ├──────────────┤            1:N │
│  │ id (PK)      │                ▼
│  │ name         │         ┌──────────────┐
│  │ sku          │         │ Influencer   │
│  │ description  │         ├──────────────┤
│  │ price        │         │ id (PK)      │
│  └──────────────┘         │ name         │
│                           │ email        │
│                           │ phone        │
│                           │ bio          │
│                           │ followers    │
│                           │ status       │
│                           │ platform     │
│                           │ profileUrl   │
│                           └──────────────┘
│                                    │
│                                    │ 1:N
│                                    ▼
│                           ┌──────────────────┐
│                           │ CourierShipment  │
│                           ├──────────────────┤
│                           │ id (PK)          │
│                           │ trackingNumber   │
│                           │ courierName      │
│                           │ courierCompany   │
│                           │ sendStoreId (FK) │
│                           │ returnStoreId(FK)│
│                           │ influencerId(FK) │
│                           │ campaignId (FK)  │
│                           │ sentDate         │
│                           │ receivedDate     │
│                           │ returnedDate     │
│                           │ status           │
│                           │ statusTimeline   │
│                           └──────────────────┘
│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    CAMPAIGN MANAGEMENT LAYER                        │
├─────────────────────────────────────────────────────────────────────┤
│
│  ┌──────────────┐
│  │  Campaign    │
│  ├──────────────┤
│  │ id (PK)      │
│  │ name         │
│  │ description  │
│  │ status       │
│  │ budget       │
│  │ startDate    │
│  │ endDate      │
│  │ storeId (FK) │
│  └──────────────┘
│         │
│    ┌────┴─────┬──────────────────┐
│    │           │                  │
│  1:N         1:N                 1:N
│    │           │                  │
│    ▼           ▼                  ▼
│  ┌──────────────────────┐  ┌────────────────┐
│  │ CampaignProduct      │  │  Influencer    │
│  ├──────────────────────┤  │  CampaignLink  │
│  │ id (PK)              │  ├────────────────┤
│  │ quantity             │  │ id (PK)        │
│  │ discount             │  │ rate           │
│  │ campaignId (FK)      │  │ status         │
│  │ productId (FK)       │  │ deliverables   │
│  └──────────────────────┘  │ influencerId   │
│          │                 │ (FK)           │
│          │                 │ campaignId     │
│      1:N │                 │ (FK)           │
│          ▼                 └────────────────┘
│  ┌──────────────┐                │
│  │   Product    │            1:N │
│  ├──────────────┤                ▼
│  │ id (PK)      │         ┌──────────────┐
│  │ name         │         │ Influencer   │
│  │ sku          │         ├──────────────┤
│  │ description  │         │ id (PK)      │
│  │ price        │         │ name         │
│  └──────────────┘         │ email        │
│                           │ phone        │
│                           │ bio          │
│                           │ followers    │
│                           │ status       │
│                           │ platform     │
│                           │ profileUrl   │
│                           └──────────────┘
│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  FINANCIAL & OPERATIONS LAYER                       │
├─────────────────────────────────────────────────────────────────────┤
│
│  ┌──────────────────────┐
│  │ FinancialDocument    │
│  ├──────────────────────┤
│  │ id (PK)              │
│  │ type (PO/INV/FORM)   │
│  │ documentNumber       │
│  │ amount               │
│  │ status               │
│  │ issueDate            │
│  │ dueDate              │
│  │ paidDate             │
│  │ description          │
│  │ metadata             │
│  │ filePath             │
│  │ campaignId (FK)      │
│  └──────────────────────┘
│         ▲
│         │ 1:N
│         │
│  ┌──────┴───────────────┐
│  │    Campaign          │
│  │  (from above)        │
│  └──────────────────────┘
│
│  ┌──────────────────────┐
│  │   ApifyRunLog        │
│  ├──────────────────────┤
│  │ id (PK)              │
│  │ runId (unique)       │
│  │ taskId               │
│  │ status               │
│  │ startedAt            │
│  │ finishedAt           │
│  │ statusMessage        │
│  │ resultsCount         │
│  │ metadata             │
│  └──────────────────────┘
│
│  ┌──────────────────────┐
│  │ AnalyticsSnapshot    │
│  ├──────────────────────┤
│  │ id (PK)              │
│  │ timestamp            │
│  │ totalCampaigns       │
│  │ activeCampaigns      │
│  │ totalBudget          │
│  │ totalInfluencers     │
│  │ coldInfluencers      │
│  │ activeInfluencers    │
│  │ finalInfluencers     │
│  │ totalRevenue         │
│  │ totalExpenses        │
│  │ metadata             │
│  └──────────────────────┘
│
└─────────────────────────────────────────────────────────────────────┘
```

## Table Descriptions

### User Management

#### **users**

Stores user account information for system access.

- **id**: Unique identifier (CUID)
- **email**: User email (unique)
- **name**: User full name
- **password**: Hashed password
- **firmId**: Reference to firm (nullable, for multi-tenancy)
- **roles**: Many-to-many relationship with roles
- **Indices**: firmId

#### **roles**

Defines role definitions for role-based access control (RBAC).

- **id**: Unique identifier (CUID)
- **name**: Role name (unique)
- **description**: Role description
- **permissions**: Many-to-many relationship with permissions

#### **permissions**

Defines granular permissions that can be assigned to roles.

- **id**: Unique identifier (CUID)
- **name**: Permission name (unique)
- **description**: Permission description

### Organization & Stores

#### **firms**

Represents organizations/companies using the system.

- **id**: Unique identifier (CUID)
- **name**: Firm name
- **email**: Firm email (unique)
- **phone**: Contact phone
- **address**: Street address
- **city**: City
- **state**: State/Province
- **zipCode**: Postal code
- **country**: Country

#### **stores**

Represents individual stores within a firm.

- **id**: Unique identifier (CUID)
- **name**: Store name
- **email**: Store email (unique)
- **phone**: Store phone
- **address**: Street address
- **firmId**: Reference to parent firm (FK)
- **Indices**: firmId
- **On Delete**: CASCADE

### Influencers & Campaigns

#### **influencers**

Stores influencer profile information with status tracking.

- **id**: Unique identifier (CUID)
- **name**: Influencer name
- **email**: Email address (unique)
- **phone**: Contact phone
- **bio**: Biography/description
- **followers**: Follower count
- **status**: Status enum (COLD, ACTIVE, FINAL)
- **platform**: Social media platform (Instagram, TikTok, YouTube, etc.)
- **profileUrl**: Link to social media profile
- **Indices**: status

#### **campaigns**

Represents marketing campaigns run by stores.

- **id**: Unique identifier (CUID)
- **name**: Campaign name
- **description**: Campaign description
- **status**: Campaign status (DRAFT, ACTIVE, COMPLETED, CANCELLED)
- **type**: Campaign type enum (NEW: REELS, POSTS, STORIES, MIXED)
- **budget**: Campaign budget amount
- **budgetSpent**: Amount of budget spent (NEW)
- **budgetAllocated**: Budget allocated for campaign (NEW)
- **startDate**: Campaign start date
- **endDate**: Campaign end date
- **deliverableDeadline**: Deadline for deliverable submission (NEW)
- **brief**: Campaign brief/requirements (NEW)
- **reelsRequired**: Number of reels required (NEW)
- **postsRequired**: Number of posts required (NEW)
- **storiesRequired**: Number of stories required (NEW)
- **storeId**: Reference to store (FK)
- **Indices**: storeId, status, type (NEW)
- **On Delete**: CASCADE

#### **products**

Product catalog items available for campaigns.

- **id**: Unique identifier (CUID)
- **name**: Product name
- **sku**: Stock keeping unit (unique)
- **asCode**: Alternative unique code for products (NEW)
- **description**: Product description
- **category**: Product category enum (NEW: ELECTRONICS, FASHION, BEAUTY, LIFESTYLE, FITNESS, HOME, FOOD, OTHER)
- **stock**: Available stock quantity (NEW)
- **price**: Product price (decimal with 2 decimal places)
- **imageUrls**: Array of image URLs stored as JSON (NEW)
- **metadata**: Additional product metadata as JSON (NEW)

#### **campaign_products**

Junction table linking campaigns to products with quantities and discounts.

- **id**: Unique identifier (CUID)
- **campaignId**: Reference to campaign (FK)
- **productId**: Reference to product (FK)
- **quantity**: Number of units
- **plannedQty**: Planned quantity for future reference (NEW)
- **discount**: Discount percentage (nullable)
- **notes**: Additional notes for campaign-product relationship (NEW)
- **dueDate**: Due date for product delivery (NEW)
- **Unique Constraint**: (campaignId, productId)
- **Indices**: campaignId, productId
- **On Delete**: CASCADE

#### **influencer_campaign_links**

Associates influencers with campaigns, tracking collaboration status.

- **id**: Unique identifier (CUID)
- **influencerId**: Reference to influencer (FK)
- **campaignId**: Reference to campaign (FK)
- **rate**: Compensation/collaboration rate
- **status**: Link status (PENDING, ACCEPTED, REJECTED, COMPLETED)
- **deliverables**: Description of deliverables
- **deliverableType**: Type of deliverable (NEW: e.g., "reel", "post", "story")
- **expectedDate**: Expected delivery date for deliverables (NEW)
- **notes**: Additional notes for the collaboration (NEW)
- **Unique Constraint**: (influencerId, campaignId)
- **Indices**: influencerId, campaignId, status
- **On Delete**: CASCADE

### Financial Documents

#### **financial_documents**

Tracks financial documents related to campaigns (PO, Invoice, Forms).

- **id**: Unique identifier (CUID)
- **type**: Document type enum (PO, INVOICE, FORM)
- **documentNumber**: Document number (unique)
- **amount**: Document amount
- **status**: Status (PENDING, APPROVED, PAID, REJECTED)
- **issueDate**: Date issued
- **dueDate**: Payment/action due date
- **paidDate**: Date paid (nullable)
- **description**: Document description
- **metadata**: JSON field for additional metadata
- **filePath**: Path to stored file
- **campaignId**: Reference to campaign (FK)
- **Indices**: campaignId, type, status
- **On Delete**: CASCADE

#### **invoice_images** (NEW)

Stores invoice images with OCR processing data and extracted information.

- **id**: Unique identifier (CUID)
- **imagePath**: Path to stored invoice image file
- **ocrData**: JSON field containing OCR extracted text/data
- **extractedTotal**: Total amount extracted from OCR processing
- **status**: Processing status enum (PENDING, PROCESSING, PROCESSED, FAILED)
- **campaignId**: Reference to campaign (FK, nullable)
- **productId**: Reference to product (FK, nullable)
- **Indices**: campaignId, productId, status
- **On Delete**: CASCADE (campaign), SET NULL (product)

#### **courier_shipments** (NEW)

Tracks courier shipments for product deliveries to influencers.

- **id**: Unique identifier (CUID)
- **trackingNumber**: Courier tracking number (unique)
- **courierName**: Short courier name (e.g., UPS, FedEx, DHL)
- **courierCompany**: Full courier company name
- **sendStoreId**: Reference to store sending the shipment (FK, nullable)
- **returnStoreId**: Reference to store receiving returned items (FK, nullable)
- **influencerId**: Reference to influencer receiving shipment (FK, nullable)
- **campaignId**: Reference to campaign (FK, nullable)
- **sentDate**: Date shipment was sent (nullable)
- **receivedDate**: Date shipment was received (nullable)
- **returnedDate**: Date items were returned (nullable)
- **status**: Courier status enum (PENDING, SENT, IN_TRANSIT, DELIVERED, RETURNED, FAILED)
- **statusTimeline**: JSON object tracking status changes over time
- **Indices**: campaignId, influencerId, sendStoreId, returnStoreId, status

### Operations & Analytics

#### **apify_run_logs**

Tracks execution logs from Apify web scraping tasks.

- **id**: Unique identifier (CUID)
- **runId**: Apify run ID (unique)
- **taskId**: Apify task ID
- **status**: Run status (CREATED, READY, RUNNING, SUCCEEDED, FAILED, TIMED_OUT, ABORTED)
- **startedAt**: Execution start time
- **finishedAt**: Execution end time
- **statusMessage**: Status message
- **resultsCount**: Number of results extracted
- **metadata**: JSON for additional data
- **Indices**: taskId, status

#### **analytics_snapshots**

Periodic snapshots of key performance metrics.

- **id**: Unique identifier (CUID)
- **timestamp**: Snapshot timestamp
- **totalCampaigns**: Total number of campaigns
- **activeCampaigns**: Number of active campaigns
- **totalBudget**: Total campaign budget
- **totalInfluencers**: Total number of influencers
- **coldInfluencers**: Count of COLD status influencers
- **activeInfluencers**: Count of ACTIVE status influencers
- **finalInfluencers**: Count of FINAL status influencers
- **totalRevenue**: Total revenue
- **totalExpenses**: Total expenses
- **metadata**: JSON for additional data
- **Indices**: timestamp

## Key Relationships

### One-to-Many Relationships

- Firm → Store (1:N) - A firm has many stores
- Firm → User (1:N) - A firm has many users
- Store → Campaign (1:N) - A store runs many campaigns
- Campaign → CampaignProduct (1:N) - A campaign has many products
- Campaign → FinancialDocument (1:N) - A campaign has many financial documents
- Campaign → InfluencerCampaignLink (1:N) - A campaign links to many influencers
- Influencer → InfluencerCampaignLink (1:N) - An influencer participates in many campaigns
- Product → CampaignProduct (1:N) - A product appears in many campaigns

### Many-to-Many Relationships

- User ↔ Role (M:N) - Users have multiple roles, roles have multiple users
- Role ↔ Permission (M:N) - Roles have multiple permissions, permissions can be assigned to multiple roles
- Campaign ↔ Influencer (M:N via InfluencerCampaignLink)
- Campaign ↔ Product (M:N via CampaignProduct)

## Indices

The schema includes strategic indices for query performance:

- **User**: firmId
- **Store**: firmId
- **Campaign**: storeId, status
- **InfluencerCampaignLink**: influencerId, campaignId, status
- **CampaignProduct**: campaignId, productId
- **Influencer**: status
- **FinancialDocument**: campaignId, type, status
- **ApifyRunLog**: taskId, status
- **AnalyticsSnapshot**: timestamp

## Data Integrity

- **Cascade Deletes**: Store deletes cascade to campaigns; campaign deletes cascade to related products, financial documents, influencer links, invoice images, and courier shipments
- **Unique Constraints**: Email fields (users, influencers, firms, stores), product SKU, product asCode (NEW), role/permission names, document number, Apify runId, courier trackingNumber (NEW)
- **Composite Unique Constraints**: (campaignId, productId) and (influencerId, campaignId)

## Enums

### InfluencerStatus

- **COLD**: Newly contacted influencer
- **ACTIVE**: Engaged influencer in active campaigns
- **FINAL**: Influencer selected for final collaboration

### CampaignType (NEW)

- **REELS**: Campaign focused on reel content
- **POSTS**: Campaign focused on post content
- **STORIES**: Campaign focused on stories content
- **MIXED**: Campaign with mixed content types

### ProductCategory (NEW)

- **ELECTRONICS**: Electronic products
- **FASHION**: Fashion and clothing items
- **BEAUTY**: Beauty and cosmetics products
- **LIFESTYLE**: Lifestyle products
- **FITNESS**: Fitness and wellness products
- **HOME**: Home and living products
- **FOOD**: Food and beverage products
- **OTHER**: Miscellaneous products

### CourierStatus (NEW)

- **PENDING**: Shipment pending processing
- **SENT**: Shipment has been sent
- **IN_TRANSIT**: Shipment is in transit
- **DELIVERED**: Shipment has been delivered
- **RETURNED**: Shipment has been returned
- **FAILED**: Shipment delivery failed

### InvoiceImageStatus (NEW)

- **PENDING**: Image pending OCR processing
- **PROCESSING**: Image currently being processed
- **PROCESSED**: OCR processing completed successfully
- **FAILED**: OCR processing failed

### FinancialDocumentType

- **PO**: Purchase Order
- **INVOICE**: Invoice document
- **FORM**: Form submission

## Future Enhancements

- Content delivery metrics tracking
- Performance benchmarks per influencer
- Campaign analytics and reporting
- Multi-currency support
- Workflow/approval processes
- Audience demographics and engagement metrics
