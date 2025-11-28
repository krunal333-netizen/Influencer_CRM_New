# Influencer CRM

A comprehensive Customer Relationship Management (CRM) system designed for managing influencer marketing campaigns, financial documents, and analytics.

## Project Structure

```
.
├── backend/                      # Backend service (Node.js + Prisma + PostgreSQL)
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema definition
│   │   ├── seed.js              # Database seed script
│   │   ├── migrations/          # Database migrations
│   │   └── .prismarc.json       # Prisma configuration
│   ├── package.json
│   ├── .env.example
│   └── .env.local
├── docs/
│   ├── ER_DIAGRAM.md            # Entity-Relationship Diagram & Schema Documentation
│   ├── DATA_LAYER.md            # Data Layer Setup & Usage Guide
│   └── README.md
└── README.md                    # This file
```

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- pnpm (v8 or higher)

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment variables**:
   ```bash
   cp backend/.env.example backend/.env.local
   ```
   
   Edit `backend/.env.local` and set your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/influencer_crm_dev"
   ```

3. **Run database migrations**:
   ```bash
   pnpm backend prisma migrate dev
   ```

4. **Seed the database** (optional):
   ```bash
   pnpm backend prisma db seed
   ```

## Data Layer

The backend uses **Prisma ORM** with **PostgreSQL** to manage data. The schema includes:

### Core Entities

- **User Management**: Users, Roles, Permissions
- **Organization**: Firms, Stores
- **Products**: Product catalog with SKU tracking
- **Influencers**: Profile management with status tracking (COLD, ACTIVE, FINAL)
- **Campaigns**: Marketing campaigns linked to stores
- **Campaign Products**: Products associated with campaigns (many-to-many)
- **Influencer-Campaign Links**: Collaboration tracking between influencers and campaigns
- **Financial Documents**: PO, Invoices, and Form metadata
- **Apify Integration**: Web scraping task execution logs
- **Analytics**: Periodic snapshots of key metrics

### Key Features

✅ **Type-safe**: Full TypeScript support through Prisma Client
✅ **Relational**: Complex relationships with cascade deletes
✅ **Indexed**: Strategic indices for query performance
✅ **Seeded**: Reference data included in seed script
✅ **Documented**: Comprehensive ER diagram and schema documentation

### Common Commands

```bash
# Generate Prisma Client
pnpm backend prisma generate

# Run migrations
pnpm backend prisma migrate dev

# Create new migration
pnpm backend prisma migrate dev --name your_migration_name

# Seed database
pnpm backend prisma db seed

# Open Prisma Studio (interactive database viewer)
pnpm backend prisma studio

# Reset database (⚠️ destructive)
pnpm backend prisma migrate reset
```

## Documentation

- **[Entity-Relationship Diagram](/docs/ER_DIAGRAM.md)**: Complete schema structure, relationships, and data model
- **[Data Layer Guide](/docs/DATA_LAYER.md)**: Setup instructions, usage patterns, and best practices

## Schema Overview

### User Management Layer
- Multi-tenant user support with role-based access control (RBAC)
- Granular permission system
- Firm-scoped user management

### Campaign Management Layer
- Store-based campaign organization
- Product associations with quantities and discounts
- Influencer collaboration tracking with status management
- Budget and date-based campaign planning

### Financial Operations Layer
- Financial document tracking (PO, Invoice, Forms)
- Status tracking for payment workflows
- Metadata and file storage support
- Campaign-linked financial tracking

### Analytics & Operations Layer
- Apify web scraping integration logs
- Periodic analytics snapshots
- Influencer status distribution metrics
- Campaign performance baseline data

## Database Relationships

Key relationships at a glance:

```
Firm (1:N)→ Store (1:N)→ Campaign (1:N)→ FinancialDocument
         ↘ User ↙

Campaign (1:N)→ Product (M:M via CampaignProduct)
             ↘ Influencer (M:M via InfluencerCampaignLink)

User (M:N)→ Role (M:N)→ Permission
```

For detailed relationships, see [ER Diagram](/docs/ER_DIAGRAM.md).

## Development

### Project Conventions

- **Code Style**: Follow existing patterns in the codebase
- **Naming**: CamelCase for files/classes, snake_case for database columns
- **Commits**: Use conventional commit messages
- **Testing**: Unit tests for business logic, integration tests for database queries

### Adding New Entities

1. Update `backend/prisma/schema.prisma`
2. Run `pnpm backend prisma migrate dev --name add_new_entity`
3. Update seed data in `backend/prisma/seed.js` if needed
4. Implement repository/service layer for the entity
5. Update documentation in `/docs`

## Acceptance Criteria

✅ `pnpm backend prisma migrate dev` succeeds
✅ Schema reflects all required entities with proper relations and indices
✅ Seed data creates reference entities (roles, permissions, sample data)
✅ ER diagram documented in `/docs/ER_DIAGRAM.md`
✅ Data layer guide provided in `/docs/DATA_LAYER.md`

## Support

For issues or questions:
1. Check [Data Layer Guide](/docs/DATA_LAYER.md) for troubleshooting
2. Review [ER Diagram](/docs/ER_DIAGRAM.md) for schema questions
3. Consult [Prisma Documentation](https://www.prisma.io/docs/)

## License

Private repository. All rights reserved.
