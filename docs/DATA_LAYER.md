# Data Layer Documentation

## Overview

This document provides guidance on working with the Prisma-based data layer in the Influencer CRM backend.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v12+)
- pnpm (v8+)

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment**:
   Copy `.env.example` to `.env.local` and update the `DATABASE_URL`:
   ```bash
   cp backend/.env.example backend/.env.local
   ```

3. **Generate Prisma Client**:
   ```bash
   pnpm backend prisma generate
   ```

4. **Run migrations**:
   ```bash
   pnpm backend prisma migrate dev
   ```

5. **Seed the database** (optional):
   ```bash
   pnpm backend prisma db seed
   ```

## Database Migrations

### Creating a New Migration

To create a new migration after modifying `schema.prisma`:

```bash
pnpm backend prisma migrate dev --name describe_your_changes
```

This will:
1. Create the migration in `backend/prisma/migrations/`
2. Run the migration against the database
3. Generate an updated Prisma Client

### Viewing Migration History

```bash
pnpm backend prisma migrate status
```

### Resetting the Database

⚠️ **Warning**: This destroys all data

```bash
pnpm backend prisma migrate reset
```

## Using the Prisma Client

### Basic Queries

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: 'hashed_password',
  },
});

// Read
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
});

// Update
const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: { name: 'Jane Doe' },
});

// Delete
await prisma.user.delete({
  where: { id: userId },
});
```

### Complex Queries

#### With Relations

```javascript
// Include related data
const campaign = await prisma.campaign.findUnique({
  where: { id: campaignId },
  include: {
    store: true,
    products: {
      include: {
        product: true,
      },
    },
    influencerLinks: {
      include: {
        influencer: true,
      },
    },
  },
});
```

#### With Filters

```javascript
// Find all active campaigns for a store
const campaigns = await prisma.campaign.findMany({
  where: {
    storeId: storeId,
    status: 'ACTIVE',
  },
  orderBy: {
    startDate: 'desc',
  },
});
```

#### With Aggregation

```javascript
// Count campaigns per store
const campaignCounts = await prisma.campaign.groupBy({
  by: ['storeId'],
  _count: {
    id: true,
  },
});
```

## Repository Pattern (Recommended)

To maintain clean separation of concerns, consider implementing repository classes:

```javascript
// repositories/UserRepository.js
export class UserRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { roles: true, firm: true },
    });
  }

  async findByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data) {
    return this.prisma.user.create({ data });
  }

  async findAllByFirm(firmId) {
    return this.prisma.user.findMany({
      where: { firmId },
      include: { roles: true },
    });
  }
}
```

## Service Layer Pattern (Recommended)

Layer business logic on top of repositories:

```javascript
// services/CampaignService.js
export class CampaignService {
  constructor(campaignRepository, influencerRepository) {
    this.campaignRepository = campaignRepository;
    this.influencerRepository = influencerRepository;
  }

  async createCampaignWithInfluencers(campaignData, influencerIds) {
    // Business logic for campaign creation
    const campaign = await this.campaignRepository.create(campaignData);
    
    // Add influencers
    for (const influencerId of influencerIds) {
      await this.campaignRepository.addInfluencer(campaign.id, influencerId);
    }
    
    return campaign;
  }

  async getCampaignAnalytics(campaignId) {
    const campaign = await this.campaignRepository.findById(campaignId);
    // Calculate metrics, return analytics
    return {
      totalInfluencers: campaign.influencerLinks.length,
      totalBudget: campaign.budget,
      // ... more metrics
    };
  }
}
```

## Testing Databases

For testing, consider using:

1. **SQLite** (lightweight, in-memory):
   ```env
   DATABASE_URL="file:./test.db"
   ```

2. **Docker PostgreSQL** (for integration tests):
   ```bash
   docker run -d \
     -e POSTGRES_PASSWORD=test \
     -p 5433:5432 \
     postgres:15
   ```

## Common Query Patterns

### Find with Pagination

```javascript
async function getPaginatedCampaigns(page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;
  
  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.campaign.count(),
  ]);

  return {
    data: campaigns,
    pagination: {
      page,
      pageSize,
      total,
      pages: Math.ceil(total / pageSize),
    },
  };
}
```

### Bulk Operations

```javascript
// Bulk create
await prisma.product.createMany({
  data: [
    { name: 'Product 1', sku: 'SKU001', price: 100 },
    { name: 'Product 2', sku: 'SKU002', price: 200 },
  ],
});

// Bulk update
await prisma.campaign.updateMany({
  where: { status: 'DRAFT' },
  data: { status: 'CANCELLED' },
});
```

### Transactions

```javascript
// Execute multiple operations atomically
await prisma.$transaction(async (tx) => {
  const campaign = await tx.campaign.create({
    data: campaignData,
  });

  await tx.campaignProduct.createMany({
    data: products.map((p) => ({
      campaignId: campaign.id,
      productId: p.id,
      quantity: p.quantity,
    })),
  });

  return campaign;
});
```

## Troubleshooting

### Migration Issues

**Problem**: Migration failed to apply
```bash
# Check migration status
pnpm backend prisma migrate status

# Resolve migration conflicts
pnpm backend prisma migrate resolve --rolled-back <migration_name>
```

### Prisma Client Stale

**Problem**: Changes not reflected in IDE
```bash
# Regenerate Prisma Client
pnpm backend prisma generate
```

### Database Connection Issues

**Problem**: Cannot connect to database
1. Verify `DATABASE_URL` in `.env.local`
2. Ensure PostgreSQL is running
3. Check database user permissions
4. Test with: `pnpm backend prisma db execute --stdin < /dev/null`

## Best Practices

1. **Always use transactions for complex operations**
   - Ensures data consistency
   - Automatic rollback on errors

2. **Use `.include()` efficiently**
   - Only include relations you need
   - Avoid N+1 queries

3. **Leverage indices**
   - Query by indexed columns for better performance
   - Common patterns: status, createdAt, foreign keys

4. **Use enums for fixed values**
   - InfluencerStatus, FinancialDocumentType
   - Provides type safety and validation

5. **Handle errors gracefully**
   ```javascript
   try {
     const user = await prisma.user.findUnique({
       where: { email },
     });
     if (!user) {
       throw new Error('User not found');
     }
   } catch (error) {
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
       // Handle known Prisma errors
     }
     throw error;
   }
   ```

6. **Disconnect from database on shutdown**
   ```javascript
   process.on('SIGINT', async () => {
     await prisma.$disconnect();
     process.exit(0);
   });
   ```

## Performance Tips

1. **Use select instead of include when possible**
   ```javascript
   // More efficient if you only need specific fields
   await prisma.user.findUnique({
     where: { id },
     select: { id: true, email: true, name: true },
   });
   ```

2. **Batch operations**
   ```javascript
   // Use createMany instead of multiple create calls
   await prisma.product.createMany({
     data: productsArray,
   });
   ```

3. **Filter at database level**
   ```javascript
   // Database filters are more efficient than application-level
   const activeInfluencers = await prisma.influencer.findMany({
     where: { status: 'ACTIVE' },
   });
   ```

## References

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference)
- [Database Best Practices](https://www.prisma.io/docs/concepts/database)
