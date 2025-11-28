# Influencer CRM

A comprehensive Customer Relationship Management (CRM) system designed for managing influencer marketing campaigns, financial documents, and analytics. Built with Next.js 14, NestJS 10, TypeScript, and PostgreSQL.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint & Prettier** - Code quality and formatting

### Backend
- **NestJS 10** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Prisma ORM** - Modern database toolkit
- **PostgreSQL** - Relational database
- **Swagger** - API documentation

### DevOps & Tooling
- **pnpm** - Fast, disk space efficient package manager
- **Turborepo** - Monorepo build system
- **Docker & Docker Compose** - Containerization
- **Husky & lint-staged** - Git hooks and pre-commit checks
- **Jest** - Testing framework

## 📁 Project Structure

```
.
├── apps/
│   ├── frontend/                 # Next.js 14 frontend application
│   │   ├── app/                 # App Router pages and layouts
│   │   ├── components/          # React components
│   │   ├── lib/                 # Utility functions
│   │   └── public/              # Static assets
│   └── backend/                  # NestJS 10 backend API
│       ├── src/
│       │   ├── common/          # Common utilities and decorators
│       │   ├── modules/         # Feature modules
│       │   ├── app.module.ts    # Root application module
│       │   └── main.ts          # Application entry point
│       ├── prisma/              # Database schema and migrations
│       └── test/                # Test files
├── packages/
│   ├── tsconfig/                # Shared TypeScript configurations
│   └── ui/                      # Shared UI components
├── docs/                        # Documentation
├── docker-compose.yml           # Development environment
├── turbo.json                   # Turborepo configuration
├── package.json                 # Root workspace configuration
└── pnpm-workspace.yaml          # Workspace definition
```

## 🛠️ Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher)
- **PostgreSQL** (v12 or higher) - or use Docker Compose

### Installation & Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd influencer-crm
   pnpm install
   ```

2. **Environment setup**:
   ```bash
   # Backend environment
   cp apps/backend/.env.example apps/backend/.env.local

   # Frontend environment
   cp apps/frontend/.env.example apps/frontend/.env.local
   ```

   Edit the environment files with your configuration:
   ```bash
   # apps/backend/.env.local
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/influencer_crm_dev"

   # apps/frontend/.env.local
   NEXT_PUBLIC_API_URL="http://localhost:3001"
   ```

3. **Database setup**:

   **Option A: Using Docker Compose (Recommended)**
   ```bash
   docker-compose up postgres -d
   ```

   **Option B: Local PostgreSQL**
   - Ensure PostgreSQL is running on localhost:5432
   - Create database: `influencer_crm_dev`

4. **Run database migrations**:
   ```bash
   pnpm prisma migrate dev
   ```

5. **Seed the database** (optional):
   ```bash
   pnpm prisma db seed
   ```

6. **Start the development servers**:
   ```bash
   pnpm dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - API Docs: http://localhost:3001/api

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
```

### Backend Scripts
```bash
pnpm backend start:dev    # Start backend in development mode
pnpm backend build        # Build backend for production
pnpm backend test         # Run backend tests
pnpm prisma migrate dev   # Run database migrations
pnpm prisma studio        # Open Prisma Studio
pnpm prisma db seed       # Seed database with sample data
```

### Frontend Scripts
```bash
pnpm frontend dev        # Start frontend in development mode
pnpm frontend build      # Build frontend for production
pnpm frontend test        # Run frontend tests
pnpm frontend lint        # Lint frontend code
```

## 🗄️ Database Schema

The application uses Prisma ORM with PostgreSQL. Key entities include:

- **Users & Authentication** - User management with role-based access control
- **Firms & Stores** - Multi-tenant organization structure
- **Influencers** - Influencer profiles with status tracking
- **Campaigns** - Marketing campaigns with product associations
- **Financial Documents** - POs, invoices, and forms
- **Analytics** - Performance metrics and snapshots

For detailed schema information, see:
- [Entity-Relationship Diagram](/docs/ER_DIAGRAM.md)
- [Data Layer Guide](/docs/DATA_LAYER.md)

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run backend tests only
pnpm backend test

# Run frontend tests only
pnpm frontend test
```

## 📝 Code Quality

The project uses several tools to maintain code quality:

- **ESLint** - Linting for JavaScript/TypeScript
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - Run linters on staged files
- **TypeScript** - Static type checking

Pre-commit hooks will automatically:
- Run ESLint and fix issues
- Format code with Prettier
- Run type checking

## 🚀 Deployment

### Environment Variables

#### Backend (.env.local)
```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
PORT=3001
NODE_ENV=production
FRONTEND_URL="https://your-frontend-domain.com"
JWT_SECRET="your-production-jwt-secret"
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL="https://your-backend-domain.com"
NEXT_PUBLIC_APP_NAME="Influencer CRM"
```

### Production Build

```bash
# Build all applications
pnpm build

# Start production servers
pnpm start
```

### Docker Production

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 📚 Documentation

- [Entity-Relationship Diagram](/docs/ER_DIAGRAM.md) - Complete schema structure
- [Data Layer Guide](/docs/DATA_LAYER.md) - Database setup and usage
- [API Documentation](http://localhost:3001/api) - Interactive API docs (Swagger)

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env.local
   - Run `pnpm prisma migrate dev`

2. **Port Conflicts**
   - Frontend uses port 3000
   - Backend uses port 3001
   - Change ports in environment files if needed

3. **Dependency Issues**
   - Try `pnpm install --force`
   - Clear node_modules and reinstall

4. **TypeScript Errors**
   - Run `pnpm type-check` to identify issues
   - Ensure all dependencies are installed

### Getting Help

1. Check existing documentation in `/docs`
2. Review the troubleshooting section
3. Check GitHub Issues
4. Consult the [Prisma Documentation](https://www.prisma.io/docs/)
5. Review [Next.js Documentation](https://nextjs.org/docs)
6. Check [NestJS Documentation](https://docs.nestjs.com/)

## 📄 License

Private repository. All rights reserved.
