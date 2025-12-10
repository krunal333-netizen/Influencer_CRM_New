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
