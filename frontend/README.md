# CRM Dashboard Frontend

A modern, responsive React/Vite dashboard for managing influencer campaigns, built with Tailwind CSS, shadcn/ui components, and React Query.

## Features

### Core Modules

1. **Influencers** - Manage influencer profiles with pipeline status tracking (COLD → ACTIVE → FINAL)
2. **Campaigns** - Create and manage marketing campaigns with budget and timeline tracking
3. **Products** - View and manage product catalog
4. **Firms & Stores** - Organization and location management
5. **Financial Overview** - Track invoices, purchase orders, and financial documents
6. **Analytics** - Dashboard with key metrics and performance insights

### Technical Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Data** - React Query for efficient data fetching and caching
- **Form Validation** - react-hook-form with zod schema validation
- **Component Library** - shadcn/ui inspired components built on Radix UI
- **Consistent Theming** - Tailwind CSS with custom color schemes
- **Optimistic Updates** - Immediate UI updates with server confirmation
- **Type-Safe** - Full TypeScript support with strict mode

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Base UI components (button, card, dialog, etc.)
│   │   ├── layout/          # Dashboard layout & navigation
│   │   ├── modals/          # Form modals for creating/editing entities
│   │   └── StatusBadge.tsx  # Status display component
│   ├── hooks/
│   │   ├── useInfluencers.ts    # Influencer data hooks
│   │   ├── useCampaigns.ts      # Campaign data hooks
│   │   ├── useProducts.ts       # Product data hooks
│   │   ├── useAuth.ts           # Authentication context hook
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── InfluencersPage.tsx
│   │   ├── CampaignsPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── StoresPage.tsx
│   │   ├── FinancialPage.tsx
│   │   └── AnalyticsPage.tsx
│   ├── types/
│   │   ├── auth.ts      # Authentication types
│   │   └── models.ts    # Data model types
│   ├── lib/
│   │   └── utils.ts     # Utility functions
│   ├── api/
│   │   └── client.ts    # Axios client configuration
│   ├── context/
│   │   └── AuthProvider.tsx  # Auth context provider
│   ├── routes/
│   │   └── ProtectedRoute.tsx  # Protected route wrapper
│   ├── App.tsx          # Main app router
│   ├── main.tsx         # App entry point
│   └── index.css        # Global styles
├── COMPONENT_GUIDE.md   # Detailed component documentation
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Install dependencies from root
pnpm install

# Or install in frontend directory
cd frontend && pnpm install
```

### Development

```bash
# Start dev server
pnpm frontend dev

# Or from frontend directory
cd frontend && pnpm dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Build for production
pnpm frontend build

# Preview production build
pnpm frontend preview
```

## Configuration

### API Endpoint

Set the API URL via environment variable:

```bash
VITE_API_URL=http://localhost:3000
```

Defaults to `http://localhost:3000` if not set.

### Theming

Update `tailwind.config.js` to customize colors:

```js
theme: {
  extend: {
    colors: {
      brand: {
        primary: '#0F172A',    // Dark blue
        accent: '#14b8a6',     // Teal
      },
    },
  },
}
```

## Components

See [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) for detailed component documentation including:

- UI component library (Button, Card, Dialog, Badge, Tabs, etc.)
- Layout components (DashboardLayout, Sidebar, TopNav)
- Custom components (StatusBadge)
- Form modals
- Best practices and usage examples

## Data Fetching

All data fetching uses React Query for optimal performance:

```tsx
// Example: Fetching influencers
import { useInfluencers } from '@/hooks/useInfluencers';

function MyComponent() {
  const { data: influencers, isLoading, isError } = useInfluencers();
  
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data</div>;
  
  return <div>{/* render influencers */}</div>;
}
```

### Available Hooks

**Influencers:**
- `useInfluencers()` - Fetch all influencers
- `useInfluencer(id)` - Fetch single influencer
- `useCreateInfluencer()` - Create influencer mutation
- `useUpdateInfluencer()` - Update influencer mutation
- `useDeleteInfluencer()` - Delete influencer mutation

**Campaigns:**
- `useCampaigns()` - Fetch all campaigns
- `useCampaign(id)` - Fetch single campaign
- `useCreateCampaign()` - Create campaign mutation (with optimistic updates)
- `useUpdateCampaign()` - Update campaign mutation
- `useDeleteCampaign()` - Delete campaign mutation

**Products:**
- `useProducts()` - Fetch all products
- `useProduct(id)` - Fetch single product
- `useCreateProduct()` - Create product mutation
- `useUpdateProduct()` - Update product mutation
- `useDeleteProduct()` - Delete product mutation

## Pages Overview

### Dashboard Home

Landing page showing:
- Welcome message
- Firm context information
- User role assignments
- Quick stats overview
- Navigation guide

### Influencers

Manage influencer profiles with:
- Tabbed view by status (COLD, ACTIVE, FINAL)
- Influencer cards showing details
- Platform and follower count
- Create new influencer modal
- Contact information

### Campaigns

Manage marketing campaigns with:
- Table view with sorting
- Campaign name, status, budget, dates
- Create new campaign modal
- Status color coding
- Budget tracking

### Products

Browse product catalog with:
- Grid layout for products
- Product details (name, SKU, price)
- Summary statistics
- Product value metrics

### Firms & Stores

Organization management:
- Current organization details
- Team members list
- Store locations (placeholder)
- Settings options

### Financial Overview

Financial document tracking:
- Summary cards (total, paid, pending)
- Document type breakdown
- Recent documents table
- Payment status tracking

### Analytics

Performance dashboard with:
- Campaign metrics
- Influencer pipeline stats
- Financial overview
- Budget utilization chart
- Weekly performance tracking

## Forms & Validation

Forms use react-hook-form with zod for validation:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name required'),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}
```

## Styling

### Tailwind CSS

The project uses Tailwind CSS for styling with:
- Utility-first approach
- Custom brand colors
- Responsive design with `md:` prefix
- Dark mode support ready

### Component Classes

Common class patterns:

```tsx
// Spacing
<div className="p-6 md:p-8">        {/* padding */}
<div className="gap-4 md:gap-6">      {/* gaps */}
<div className="mb-4 mt-8">          {/* margins */}

// Colors
<div className="text-slate-900">    {/* text color */}
<div className="bg-slate-100">      {/* background */}
<div className="border-slate-200">  {/* borders */}

// Typography
<h1 className="text-3xl font-bold">
<p className="text-sm text-slate-600">

// Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## Authentication

The app uses the AuthProvider context for authentication:

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, logout, isLoading } = useAuth();
  
  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

Protected routes automatically redirect to login if not authenticated.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting with Vite
- React Query caching and background fetching
- Lazy loading for images and components
- Optimistic updates for better UX
- Production build size: ~132KB (gzipped)

## Development Tips

### Adding a New Page

1. Create page in `src/pages/MyPage.tsx`
2. Wrap with `<DashboardLayout>`
3. Add route in `src/App.tsx`
4. Add navigation in `src/components/layout/Sidebar.tsx`

### Adding a New UI Component

1. Create component in `src/components/ui/ComponentName.tsx`
2. Use Radix UI primitives as base
3. Style with Tailwind CSS
4. Export and use in pages

### Creating Custom Hooks

1. Create hook in `src/hooks/useMyHook.ts`
2. Use React Query for server state
3. Add TypeScript types
4. Export and use in components

## Testing

Currently mocked data is used in development. Replace with actual API calls when backend is ready.

## Troubleshooting

### Port 5173 already in use

```bash
pnpm dev -- --port 3000
```

### Dependencies not installing

```bash
pnpm install --force
```

### Tailwind styles not applying

Ensure `index.css` includes Tailwind directives and content paths are correct in `tailwind.config.js`.

## Future Enhancements

- [ ] Dark mode support
- [ ] Real-time collaboration features
- [ ] Export to PDF/Excel
- [ ] Advanced filtering and search
- [ ] Activity logging and audit trail
- [ ] Custom dashboards
- [ ] Email notifications
- [ ] Mobile app
- [ ] API documentation UI
- [ ] User preferences and settings

## License

All rights reserved. Influencer CRM © 2024

## Support

For issues or questions, contact the development team.
