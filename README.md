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

## Authentication API Overview

The backend now exposes a NestJS-powered authentication service that handles user onboarding, login, refresh-token rotation, and role-protected profile access. Passwords and refresh tokens are hashed with Argon2 and refresh tokens are stored as HTTP-only cookies to prevent JavaScript access.

### Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/auth/register` | Creates a coordinator-level account, hashes the password, rotates refresh tokens, and returns a sanitized profile. |
| POST | `/auth/login` | Validates credentials, issues fresh access/refresh tokens, and persists the hashed refresh token. |
| POST | `/auth/refresh` | Reads the HTTP-only `refresh_token` cookie, verifies it, and rotates both tokens atomically. |
| GET | `/auth/me` | Returns the authenticated user's profile (roles + firm context) using the access token. |
| POST | `/auth/logout` | Revokes the stored refresh token hash and clears authentication cookies. |

Tokens are delivered via the `access_token` and `refresh_token` cookies (HTTP-only, `SameSite=Lax` in dev). Access tokens default to 15 minutes, refresh tokens to 7 days, and both values can be overridden with env variables.

### Running the backend locally

```bash
# watch mode
pnpm --filter @influencer-crm/backend start:dev

# production build
pnpm --filter @influencer-crm/backend build && pnpm --filter @influencer-crm/backend start
```

## Frontend (React + Tailwind)

A small React client (Vite + TypeScript) demonstrates the auth flow with React Query mutations, React Hook Form + Zod validation, Tailwind styling, and an auth context that gates protected routes.

```bash
pnpm --filter @influencer-crm/frontend dev   # http://localhost:5173
```

Key features:
- Login & registration screens with inline validation and API error surfaces
- React Query mutations that call the backend with `withCredentials` enabled (for cookies)
- Auth provider that hydrates `/auth/me`, exposes `logout`, and guards routes via `<ProtectedRoute />`
- Tailwind-powered UI cards for forms and the sample dashboard

### Environment variables

| Variable | Description |
| -------- | ----------- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma. |
| `PORT` | NestJS server port (defaults to 3000). |
| `FRONTEND_URL` | Comma-separated list of allowed origins for CORS. |
| `COOKIE_DOMAIN` | Optional domain override for auth cookies. |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secrets used to sign the respective JWTs. |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Human-friendly TTL strings (`15m`, `7d`, etc.). |
| `APIFY_API_KEY` | Optional Apify API key for Instagram scraping. Leave empty for dry-run mode only. |

### Apify Instagram Scraping Integration

The system includes optional Instagram profile scraping via Apify to automatically populate influencer data.

#### Setup Instructions

1. **Get Apify API Key** (optional):
   - Sign up at [Apify](https://apify.com/)
   - Navigate to Account → Integrations → API Token
   - Copy your API token

2. **Configure Environment**:
   ```bash
   # Add to backend/.env
   APIFY_API_KEY="your_apify_api_key_here"
   ```

3. **Dry-run Mode** (works without API key):
   - Set `dryRun: true` when calling scrape endpoints
   - Returns mock data for testing
   - Perfect for development and demos

#### Available Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/apify/scrape-profile` | Trigger Instagram profile scrape |
| GET | `/apify/run/:runId/status` | Check scrape job status |
| GET | `/apify/run/:runId/results` | Get scraped profile data |

#### Usage Examples

**Start a scrape job (dry-run):**
```bash
curl -X POST http://localhost:3000/apify/scrape-profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instagramUrl": "https://www.instagram.com/username",
    "dryRun": true
  }'
```

**Check job status:**
```bash
curl -X GET http://localhost:3000/apify/run/{runId}/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get results:**
```bash
curl -X GET http://localhost:3000/apify/run/{runId}/results \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Create influencer from scraped data:**
```bash
curl -X POST http://localhost:3000/influencers/from-scraped-data \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scrapedData": {
      "username": "johndoe",
      "fullName": "John Doe",
      "bio": "Digital creator | Photographer",
      "followersCount": 15420,
      "profilePictureUrl": "https://example.com/avatar.jpg",
      "profileUrl": "https://www.instagram.com/johndoe",
      "emails": ["john@example.com"]
    }
  }'
```

#### Features

- ✅ **Dry-run mode**: Test without API credentials
- ✅ **Auto-population**: Name, email, followers, bio from Instagram
- ✅ **Email extraction**: Additional email discovery service
- ✅ **Duplicate detection**: Prevents duplicate influencer creation
- ✅ **Error handling**: Comprehensive error responses
- ✅ **Swagger docs**: Complete API documentation at `/api`

#### Integration with Influencer Creation

The influencer creation flow can automatically trigger Instagram scraping when a profile URL is provided, populating fields like:
- Profile Name (fullName)
- Followers Count
- Email (extracted from bio/email scraper)
- Bio
- Profile Avatar URL

See [`docs/AUTH_FLOW.md`](./docs/AUTH_FLOW.md) for a deeper dive into request/response examples, Thunder Client snippets, and troubleshooting tips.

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
