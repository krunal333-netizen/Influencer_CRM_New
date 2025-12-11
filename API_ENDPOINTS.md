# API Endpoints Implementation

## Summary

This document describes the REST API endpoints that have been implemented to connect the frontend dashboard with the backend database.

## Implemented Modules

The following NestJS modules have been added to provide CRUD operations for core entities:

### 1. Influencers Module (`/influencers`)

**Location**: `backend/src/influencers/`

**Endpoints**:

- `GET /influencers` - List all influencers with campaign links
- `GET /influencers/:id` - Get a specific influencer with related data
- `POST /influencers` - Create a new influencer
- `PUT /influencers/:id` - Update an existing influencer
- `DELETE /influencers/:id` - Delete an influencer

**Request Body** (POST/PUT):

```json
{
  "name": "string (required)",
  "email": "string (required, email format)",
  "phone": "string (optional)",
  "bio": "string (optional)",
  "followers": "number (optional, >= 0)",
  "status": "COLD | ACTIVE | FINAL (optional)",
  "platform": "string (optional)",
  "profileUrl": "string (optional, URL format)"
}
```

### 2. Campaigns Module (`/campaigns`)

**Location**: `backend/src/campaigns/`

**Endpoints**:

- `GET /campaigns` - List all campaigns with pagination and filtering
- `GET /campaigns/:id` - Get a specific campaign with full details
- `POST /campaigns` - Create a new campaign
- `PUT /campaigns/:id` - Update an existing campaign
- `PATCH /campaigns/:id/status` - Update campaign status
- `DELETE /campaigns/:id` - Delete a campaign
- `GET /campaigns/:id/products` - Get all products linked to a campaign
- `POST /campaigns/:id/products` - Link a product to a campaign
- `DELETE /campaigns/:id/products/:productId` - Unlink a product from a campaign
- `GET /campaigns/:id/influencers` - Get all influencers assigned to a campaign
- `POST /campaigns/:id/influencers` - Assign an influencer to a campaign
- `DELETE /campaigns/:id/influencers/:influencerId` - Unassign an influencer from a campaign

**Request Body** (POST/PUT):

```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "status": "string (optional, default: DRAFT)",
  "type": "REELS | POSTS | STORIES | MIXED (optional)",
  "budget": "number (optional)",
  "budgetSpent": "number (optional)",
  "budgetAllocated": "number (optional)",
  "startDate": "ISO date string (optional)",
  "endDate": "ISO date string (optional)",
  "deliverableDeadline": "ISO date string (optional)",
  "brief": "string (optional)",
  "reelsRequired": "number (optional, >= 0)",
  "postsRequired": "number (optional, >= 0)",
  "storiesRequired": "number (optional, >= 0)",
  "storeId": "string (required, CUID)"
}
```

**Query Parameters** (GET /campaigns):

```
page: number (optional, default: 1, min: 1)
limit: number (optional, default: 10, min: 1, max: 100)
status: string (optional, filter by status)
type: REELS | POSTS | STORIES | MIXED (optional, filter by type)
storeId: string (optional, filter by store ID)
startDateFrom: ISO date string (optional)
startDateTo: ISO date string (optional)
endDateFrom: ISO date string (optional)
endDateTo: ISO date string (optional)
search: string (optional, searches name and description)
```

**Product Link Request Body** (POST /campaigns/:id/products):

```json
{
  "productId": "string (required, CUID)",
  "quantity": "number (required, >= 1)",
  "plannedQty": "number (optional, >= 0)",
  "discount": "number (optional)",
  "notes": "string (optional)",
  "dueDate": "ISO date string (optional)"
}
```

**Influencer Assignment Request Body** (POST /campaigns/:id/influencers):

```json
{
  "influencerId": "string (required, CUID)",
  "rate": "number (required)",
  "status": "string (optional, default: PENDING)",
  "deliverables": "string (optional)",
  "deliverableType": "string (optional)",
  "expectedDate": "ISO date string (optional)",
  "notes": "string (optional)"
}
```

### 3. Products Module (`/products`)

**Location**: `backend/src/products/`

**Endpoints**:

- `GET /products` - List all products with pagination and filtering
- `GET /products/:id` - Get a specific product with related campaigns
- `POST /products` - Create a new product
- `PUT /products/:id` - Update an existing product
- `DELETE /products/:id` - Delete a product
- `POST /products/import` - Bulk import products from CSV file

**Request Body** (POST/PUT):

```json
{
  "name": "string (required)",
  "sku": "string (required, unique)",
  "asCode": "string (optional, unique alternative code)",
  "description": "string (optional)",
  "category": "ELECTRONICS | FASHION | BEAUTY | LIFESTYLE | FITNESS | HOME | FOOD | OTHER (optional)",
  "stock": "number (optional, >= 0)",
  "price": "number (required)",
  "imageUrls": "array of strings (optional)",
  "metadata": "object (optional)"
}
```

**Query Parameters** (GET /products):

```
page: number (optional, default: 1, min: 1)
limit: number (optional, default: 10, min: 1, max: 100)
search: string (optional, searches name and description)
category: ELECTRONICS | FASHION | BEAUTY | LIFESTYLE | FITNESS | HOME | FOOD | OTHER (optional)
sku: string (optional, exact match)
asCode: string (optional, exact match)
```

**CSV Import** (POST /products/import):

- **Content-Type**: multipart/form-data
- **Parameter**: file (CSV file with headers: name, sku, asCode, description, category, stock, price, imageUrls, metadata)
- **Response**:

```json
{
  "successes": [
    {
      "id": "product-1",
      "name": "Product Name",
      "sku": "SKU-1",
      "price": 29.99,
      ...
    }
  ],
  "errors": [
    {
      "row": 3,
      "error": "SKU already exists"
    }
  ]
}
```

**CSV Format Example**:

```csv
name,sku,asCode,description,category,stock,price,imageUrls,metadata
Product 1,SKU-001,AS-001,Description 1,ELECTRONICS,100,29.99,"[""https://example.com/image1.jpg""]","{""color"":""blue""}"
Product 2,SKU-002,AS-002,Description 2,FASHION,50,49.99,"[""https://example.com/image2.jpg""]","{}"
```

## Authentication

All endpoints (except `/auth/*`) require authentication using the access token from the authentication system.

**Required Header**:

```
Cookie: access_token=<jwt_token>
```

Or if using Authorization header:

```
Authorization: Bearer <jwt_token>
```

The `AccessTokenGuard` is applied to all module controllers.

## Error Handling

Standard HTTP status codes are returned:

- `200 OK` - Successful GET/PUT/DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server errors

## Validation

All request bodies are validated using `class-validator` decorators:

- String fields are trimmed and validated
- Email fields must be valid email format
- URL fields must be valid URL format
- Numeric fields are converted from strings automatically
- Required fields throw errors if missing
- Unknown fields are stripped (whitelist: true)

## Database Operations

### Influencers

- Ordered by `createdAt DESC` by default
- Includes related `campaignLinks` and `campaign` data on GET by ID
- Status field uses `InfluencerStatus` enum

### Campaigns

- Ordered by `createdAt DESC` by default
- Includes related `store`, `products`, `influencerLinks`, and `financialDocuments`
- Date fields are automatically converted to Date objects
- Budget stored as Decimal in database, handled as number in API

### Products

- Ordered by `createdAt DESC` by default
- Includes related `campaignProducts` and `campaign` data
- Price stored as Decimal(10,2) in database
- SKU must be unique

## Dependencies Added

- `@nestjs/mapped-types` - Provides `PartialType` utility for update DTOs

## Module Registration

All modules are registered in `backend/src/app.module.ts`:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    InfluencersModule,    // NEW
    CampaignsModule,      // NEW
    ProductsModule,       // NEW
  ],
  // ...
})
```

## Frontend Integration

The frontend React Query hooks in `frontend/src/hooks/` are now fully compatible with these backend endpoints:

- `useInfluencers.ts` ✅
- `useCampaigns.ts` ✅
- `useProducts.ts` ✅

## Testing

To test the endpoints:

1. Start the backend server:

   ```bash
   cd backend
   pnpm run start:dev
   ```

2. Ensure PostgreSQL is running and migrations are applied:

   ```bash
   pnpm backend prisma migrate dev
   ```

3. Seed the database (optional):

   ```bash
   pnpm backend prisma db seed
   ```

4. Use the frontend at `http://localhost:5173` or test directly with tools like:
   - Thunder Client
   - Postman
   - curl

Example curl request:

```bash
# Login first
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt

# Get influencers
curl -X GET http://localhost:3000/influencers \
  -b cookies.txt
```

### 4. Invoices Module (`/invoices`)

**Location**: `backend/src/invoices/`

**Features**:

- Invoice image upload with OCR processing
- Automatic extraction of invoice data (ASCode, product description, unit price, totals)
- Status management (PENDING → PROCESSING → PROCESSED or FAILED)
- Linking invoices to campaigns and products
- File storage in `uploads/invoices/` directory
- Static file serving via `/uploads/` endpoint

**Endpoints**:

- `POST /invoices/upload` - Upload invoice image and run OCR
- `GET /invoices` - List all invoices with filtering and pagination
- `GET /invoices/:id` - Get specific invoice with OCR data and links
- `PUT /invoices/:id` - Update invoice details, status, and OCR data
- `PATCH /invoices/:id/status` - Update invoice processing status
- `GET /invoices/by-status/:status` - Get invoices by status
- `GET /invoices/by-campaign/:campaignId` - Get invoices linked to campaign
- `POST /invoices/:id/link-campaign` - Link invoice to campaign
- `POST /invoices/:id/link-product` - Link invoice to product
- `DELETE /invoices/:id` - Delete invoice and remove image file

**Request Body** (POST /invoices/upload - multipart/form-data):

```json
{
  "file": "image file (JPEG, PNG, WebP)",
  "campaignId": "string (optional, CUID)",
  "productId": "string (optional, CUID)",
  "status": "PENDING | PROCESSING | PROCESSED | FAILED (optional)"
}
```

**Request Body** (PUT /invoices/:id):

```json
{
  "status": "PENDING | PROCESSING | PROCESSED | FAILED (optional)",
  "campaignId": "string (optional, CUID)",
  "productId": "string (optional, CUID)",
  "ocrData": "object (optional, OCR extracted fields)",
  "extractedTotal": "number (optional)"
}
```

**Response Example** (GET /invoices/:id):

```json
{
  "id": "invoice-1",
  "imagePath": "/path/to/image.png",
  "ocrData": {
    "rawText": "Invoice text...",
    "asCode": "AS123456",
    "productDescription": "Product name",
    "unitPrice": 99.99,
    "totalAmount": 299.97,
    "extractedAt": "2024-01-15T10:30:00Z"
  },
  "extractedTotal": 299.97,
  "status": "PROCESSED",
  "campaignId": "camp-1",
  "productId": "prod-1",
  "campaign": { "id": "camp-1", "name": "Campaign Name", ... },
  "product": { "id": "prod-1", "name": "Product Name", ... },
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Query Parameters** (GET /invoices):

```
page: number (optional, default: 1, min: 1)
limit: number (optional, default: 10, min: 1, max: 100)
status: PENDING | PROCESSING | PROCESSED | FAILED (optional)
campaignId: string (optional, CUID)
productId: string (optional, CUID)
dateFrom: ISO date string (optional)
dateTo: ISO date string (optional)
search: string (optional, searches in imagePath)
```

**OCR Statuses**:

- `PENDING` - Image uploaded, awaiting processing
- `PROCESSING` - OCR extraction in progress
- `PROCESSED` - OCR completed successfully
- `FAILED` - OCR processing failed

**Status Transitions**:

- PENDING → PROCESSING, FAILED
- PROCESSING → PROCESSED, FAILED
- PROCESSED → PENDING (for re-processing)
- FAILED → PENDING (for retry)

### 5. Courier Shipments Module (`/courier-shipments`)

**Location**: `backend/src/courier-shipments/`

**Features**:

- Shipment creation with tracking and courier information
- Status progression with timeline tracking (PENDING → SENT → IN_TRANSIT → DELIVERED → RETURNED)
- Timeline events with timestamps, notes, location, and user tracking
- Linking shipments to campaigns and influencers
- Aggregate statistics for dashboards (outstanding returns, status distribution)
- Store selection for shipment origin and returns

**Endpoints**:

- `POST /courier-shipments` - Create new shipment
- `GET /courier-shipments` - List all shipments with filtering and pagination
- `GET /courier-shipments/:id` - Get specific shipment with full timeline
- `PUT /courier-shipments/:id` - Update shipment details
- `PATCH /courier-shipments/:id/status` - Update shipment status
- `GET /courier-shipments/by-status/:status` - Get shipments by status
- `GET /courier-shipments/by-campaign/:campaignId` - Get shipments for campaign
- `GET /courier-shipments/stats/outstanding-returns` - Get outstanding returns
- `GET /courier-shipments/stats/aggregate` - Get aggregate statistics
- `POST /courier-shipments/:id/timeline-event` - Add timeline event
- `DELETE /courier-shipments/:id` - Delete shipment

**Request Body** (POST /courier-shipments):

```json
{
  "trackingNumber": "string (required, unique)",
  "courierName": "string (required, e.g., UPS, FedEx, DHL)",
  "courierCompany": "string (required, full company name)",
  "sendStoreId": "string (optional, CUID)",
  "returnStoreId": "string (optional, CUID)",
  "influencerId": "string (optional, CUID)",
  "campaignId": "string (optional, CUID)",
  "status": "PENDING | SENT | IN_TRANSIT | DELIVERED | RETURNED | FAILED (optional)"
}
```

**Request Body** (PUT /courier-shipments/:id):

```json
{
  "trackingNumber": "string (optional, unique)",
  "courierName": "string (optional)",
  "courierCompany": "string (optional)",
  "sendStoreId": "string (optional, CUID)",
  "returnStoreId": "string (optional, CUID)",
  "influencerId": "string (optional, CUID)",
  "campaignId": "string (optional, CUID)",
  "sentDate": "ISO date string (optional)",
  "receivedDate": "ISO date string (optional)",
  "returnedDate": "ISO date string (optional)"
}
```

**Request Body** (POST /courier-shipments/:id/timeline-event):

```json
{
  "status": "PENDING | SENT | IN_TRANSIT | DELIVERED | RETURNED | FAILED (required)",
  "timestamp": "ISO date string (optional, defaults to now)",
  "notes": "string (optional, e.g., 'Package in transit')",
  "location": "string (optional, e.g., 'Hub 1, New York')",
  "userId": "string (optional, user ID tracking the change)"
}
```

**Response Example** (GET /courier-shipments/:id):

```json
{
  "id": "ship-1",
  "trackingNumber": "TRACK123456",
  "courierName": "UPS",
  "courierCompany": "United Parcel Service",
  "status": "IN_TRANSIT",
  "sendStoreId": "store-1",
  "returnStoreId": null,
  "influencerId": "infl-1",
  "campaignId": "camp-1",
  "sentDate": "2024-01-14T09:00:00Z",
  "receivedDate": null,
  "returnedDate": null,
  "statusTimeline": {
    "events": [
      {
        "status": "PENDING",
        "timestamp": "2024-01-13T14:30:00Z",
        "notes": "Shipment created"
      },
      {
        "status": "SENT",
        "timestamp": "2024-01-14T09:00:00Z",
        "notes": "Package picked up",
        "location": "New York, NY",
        "userId": "user-1"
      },
      {
        "status": "IN_TRANSIT",
        "timestamp": "2024-01-15T08:00:00Z",
        "notes": "In transit to destination",
        "location": "Hub 1, Pennsylvania"
      }
    ]
  },
  "sendStore": { "id": "store-1", "name": "Store Name", ... },
  "returnStore": null,
  "influencer": { "id": "infl-1", "name": "Influencer Name", ... },
  "campaign": { "id": "camp-1", "name": "Campaign Name", ... },
  "createdAt": "2024-01-13T14:30:00Z",
  "updatedAt": "2024-01-15T08:00:00Z"
}
```

**Response Example** (GET /courier-shipments/stats/aggregate):

```json
{
  "totalShipments": 150,
  "byStatus": {
    "PENDING": 5,
    "SENT": 10,
    "IN_TRANSIT": 35,
    "DELIVERED": 95,
    "RETURNED": 4,
    "FAILED": 1
  },
  "outstandingReturns": 4
}
```

**Query Parameters** (GET /courier-shipments):

```
page: number (optional, default: 1, min: 1)
limit: number (optional, default: 10, min: 1, max: 100)
status: PENDING | SENT | IN_TRANSIT | DELIVERED | RETURNED | FAILED (optional)
campaignId: string (optional, CUID)
influencerId: string (optional, CUID)
sendStoreId: string (optional, CUID)
returnStoreId: string (optional, CUID)
trackingNumber: string (optional, partial match)
courierName: string (optional, partial match)
dateFrom: ISO date string (optional)
dateTo: ISO date string (optional)
```

**Courier Statuses**:

- `PENDING` - Shipment created, awaiting pickup
- `SENT` - Picked up and on the way
- `IN_TRANSIT` - In transit to destination
- `DELIVERED` - Successfully delivered
- `RETURNED` - Returned to sender
- `FAILED` - Delivery failed

**Status Transitions**:

- PENDING → SENT, FAILED
- SENT → IN_TRANSIT, DELIVERED, FAILED
- IN_TRANSIT → DELIVERED, RETURNED, FAILED
- DELIVERED → RETURNED
- RETURNED → (no transitions)
- FAILED → PENDING (for retry)

## Environment Configuration

### OCR Settings

Add these to `.env.local` for the invoices module:

```
OCR_ENABLED=true
INVOICE_UPLOAD_DIR=uploads/invoices
```

## Next Steps

Additional modules that could be implemented:

- Stores/Firms management endpoints
- Financial documents endpoints
- Analytics snapshots endpoints
- Apify integration endpoints
- Campaign-Product link management
- Influencer-Campaign link management

## Notes

- All services use PrismaService for database access
- Controllers use standard NestJS decorators
- DTOs provide request validation
- Services include existence checks before updates/deletes
- Related data is eagerly loaded using Prisma's `include` option
- Invoice images are stored in `uploads/invoices/` and served via `/uploads/invoices/` endpoint
- OCR data is stored as JSON in the database for flexibility
- Shipment timeline events are immutable and tracked in chronological order
- Status transitions are validated to prevent invalid state changes
