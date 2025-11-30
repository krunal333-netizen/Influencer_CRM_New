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
- `GET /campaigns` - List all campaigns with store, products, and influencer links
- `GET /campaigns/:id` - Get a specific campaign with full details
- `POST /campaigns` - Create a new campaign
- `PUT /campaigns/:id` - Update an existing campaign
- `DELETE /campaigns/:id` - Delete a campaign

**Request Body** (POST/PUT):
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "status": "string (optional, default: DRAFT)",
  "budget": "number (optional)",
  "startDate": "ISO date string (optional)",
  "endDate": "ISO date string (optional)",
  "storeId": "string (required, CUID)"
}
```

### 3. Products Module (`/products`)

**Location**: `backend/src/products/`

**Endpoints**:
- `GET /products` - List all products with campaign relationships
- `GET /products/:id` - Get a specific product with related campaigns
- `POST /products` - Create a new product
- `PUT /products/:id` - Update an existing product
- `DELETE /products/:id` - Delete a product

**Request Body** (POST/PUT):
```json
{
  "name": "string (required)",
  "sku": "string (required, unique)",
  "description": "string (optional)",
  "price": "number (required)"
}
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
