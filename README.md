# Influencer CRM

A comprehensive Customer Relationship Management (CRM) system designed for managing influencer marketing campaigns, financial documents, and analytics. Built with Next.js 14, NestJS 10, TypeScript, and PostgreSQL.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **React Hook Form + Zod** - Form validation

### Backend
- **NestJS 10** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Prisma ORM** - Modern database toolkit
- **PostgreSQL** - Relational database
- **Swagger** - API documentation
- **JWT + Argon2** - Authentication and password hashing
- **Passport** - Authentication middleware

### DevOps & Tooling
- **pnpm** - Fast, disk space efficient package manager
- **Turborepo** - Monorepo build system
- **Docker & Docker Compose** - Containerization
- **Husky & lint-staged** - Git hooks and pre-commit checks
- **Jest** - Testing framework
- **ESLint & Prettier** - Code quality and formatting

## 📁 Project Structure

```
.
├── backend/                      # Backend service (NestJS 10 + Prisma + PostgreSQL)
│   ├── src/
│   │   ├── auth/                # Authentication module (JWT + Argon2)
│   │   ├── users/               # User management
│   │   ├── influencers/         # Influencer CRUD + stage transitions
│   │   ├── campaigns/           # Campaign management
│   │   ├── products/            # Product catalog
│   │   ├── firms/               # Firm administration
│   │   ├── stores/              # Store management
│   │   ├── financial-documents/ # Financial document handling
│   │   ├── apify/               # Instagram scraping integration
│   │   ├── prisma/              # Prisma service module
│   │   └── common/              # Common utilities and decorators
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema definition
│   │   ├── seed.js              # Database seed script
│   │   └── migrations/          # Database migrations
│   ├── package.json
│   ├── .env                     # Dev environment (tracked)
│   └── .env.example             # Environment template
├── frontend/                     # Frontend application (React + Vite + Tailwind)
│   ├── src/
│   │   ├── pages/               # Route pages
│   │   ├── components/          # React components
│   │   ├── lib/                 # Utility functions
│   │   ├── hooks/               # Custom React hooks
│   │   └── contexts/            # React contexts
│   └── package.json
├── packages/
│   ├── eslint-config/           # Shared ESLint configuration
│   ├── tsconfig/                # Shared TypeScript configurations
│   ├── ui/                      # Shared UI components
│   └── utils/                   # Shared utilities
├── docs/
│   ├── ER_DIAGRAM.md            # Entity-Relationship Diagram & Schema Documentation
│   ├── DATA_LAYER.md            # Data Layer Setup & Usage Guide
│   └── AUTH_FLOW.md             # Authentication flow documentation
├── docker-compose.yml           # Development environment
├── turbo.json                   # Turborepo configuration
├── package.json                 # Root workspace configuration
├── pnpm-workspace.yaml          # Workspace definition
└── README.md                    # This file
```

## 🛠️ Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher)
- **PostgreSQL** (v12 or higher) - or use Docker Compose

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment variables**:
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Edit `backend/.env` and set your PostgreSQL connection string:
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

5. **Start the development servers**:
   ```bash
   pnpm dev
   ```
   This will start:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000
   - API Docs: http://localhost:3000/api

### Docker Development

For a complete containerized development environment:

```bash
# Start all services
docker-compose up

# Or start specific services
docker-compose up postgres backend
docker-compose up frontend
```

## 📜 Available Scripts

### Root Level Scripts

```bash
pnpm dev          # Start both frontend and backend in development
pnpm build        # Build all applications and packages
pnpm test         # Run all tests
pnpm lint         # Lint all packages
pnpm lint:fix     # Fix linting issues
pnpm format       # Format code with Prettier
pnpm type-check   # Type check all TypeScript files
pnpm clean        # Clean build artifacts

# Backend shortcuts
pnpm backend      # Access backend scripts (e.g., pnpm backend start:dev)
pnpm prisma       # Access Prisma CLI (e.g., pnpm prisma migrate dev)
pnpm migrate      # Run database migrations
```

### Backend Scripts

```bash
cd backend

pnpm start:dev    # Start backend in development mode
pnpm build        # Build for production
pnpm start        # Start production build
pnpm test         # Run tests
pnpm lint         # Lint backend code
pnpm lint:fix     # Fix linting issues

# Prisma commands
pnpm prisma migrate dev     # Create and apply migrations
pnpm prisma generate        # Generate Prisma Client
pnpm prisma studio          # Open Prisma Studio
pnpm prisma db seed         # Seed database
```

### Frontend Scripts

```bash
cd frontend

pnpm dev          # Start frontend dev server (http://localhost:5173)
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Lint frontend code
pnpm lint:fix     # Fix linting issues
```

## 🔐 Authentication API Overview

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
pnpm backend start:dev

# production build
pnpm backend build && pnpm backend start
```

## 🎨 Frontend (React + Tailwind)

A React client (Vite + TypeScript) demonstrates the auth flow with React Query mutations, React Hook Form + Zod validation, Tailwind styling, and an auth context that gates protected routes.

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

## 🔌 Apify Instagram Scraping Integration

The system includes optional Instagram profile scraping via Apify to automatically populate influencer data.

### Setup Instructions

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

### Available Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/apify/scrape-profile` | Trigger Instagram profile scrape |
| GET | `/apify/run/:runId/status` | Check scrape job status |
| GET | `/apify/run/:runId/results` | Get scraped profile data |

### Usage Examples

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

### Features

- ✅ **Dry-run mode**: Test without API credentials
- ✅ **Auto-population**: Name, email, followers, bio from Instagram
- ✅ **Email extraction**: Additional email discovery service
- ✅ **Duplicate detection**: Prevents duplicate influencer creation
- ✅ **Error handling**: Comprehensive error responses
- ✅ **Swagger docs**: Complete API documentation at `/api`

### Integration with Influencer Creation

The influencer creation flow can automatically trigger Instagram scraping when a profile URL is provided, populating fields like:
- Profile Name (fullName)
- Followers Count
- Email (extracted from bio/email scraper)
- Biography
- Profile Picture URL

## 📚 Documentation

For detailed documentation on specific topics, refer to:

- **[ER Diagram](docs/ER_DIAGRAM.md)** - Entity-Relationship Diagram and Schema Documentation
- **[Data Layer](docs/DATA_LAYER.md)** - Data Layer Setup and Usage Guide
- **[Auth Flow](docs/AUTH_FLOW.md)** - Authentication Flow Documentation
- **[API Implementation](API_IMPLEMENTATION.md)** - Comprehensive API Documentation
- **[Dashboard Implementation](DASHBOARD_IMPLEMENTATION.md)** - Frontend Dashboard Documentation
- **[ESLint Setup](ESLINT_SETUP.md)** - ESLint Configuration Guide

## 🗄️ Database Schema

The system includes 13 core tables:

1. **users** - User accounts with RBAC
2. **roles** - Role definitions
3. **permissions** - Permission definitions
4. **firms** - Organizations
5. **stores** - Store locations within firms
6. **products** - Product catalog
7. **influencers** - Influencer profiles (with status tracking)
8. **campaigns** - Marketing campaigns
9. **campaign_products** - M:M linking campaigns to products
10. **influencer_campaign_links** - M:M linking influencers to campaigns
11. **financial_documents** - POs, invoices, forms
12. **apify_run_logs** - Web scraping task logs
13. **analytics_snapshots** - Periodic metrics snapshots

Plus 2 junction tables for M:N relationships (roles-users, permissions-roles).

### Key Features

- Uses CUID for primary keys
- Three enums: `InfluencerStatus` (COLD/ACTIVE/FINAL), `FinancialDocumentType` (PO/INVOICE/FORM)
- Many-to-many relationships use junction tables
- Strategic indices on foreign keys, status fields, and frequently queried columns
- Cascade deletes on parent-child relationships

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run backend tests
pnpm backend test

# Run backend E2E tests
pnpm backend test -- --testPathPattern="e2e-spec"

# Run frontend tests
pnpm frontend test
```

## 🔍 Linting & Formatting

```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check
```

## 🏗️ Building for Production

```bash
# Build all packages
pnpm build

# Build backend only
pnpm backend build

# Build frontend only
pnpm frontend build
```

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

This project is proprietary and confidential.
