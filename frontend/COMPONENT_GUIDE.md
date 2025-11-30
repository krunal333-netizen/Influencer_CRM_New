# Dashboard UI Component Guide

This guide documents the reusable components and patterns used in the CRM Dashboard.

## Directory Structure

```
frontend/src/
├── components/
│   ├── ui/              # shadcn/ui inspired base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── tabs.tsx
│   │   └── badge.tsx
│   ├── layout/          # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopNav.tsx
│   ├── modals/          # Modal dialogs
│   │   ├── CreateInfluencerModal.tsx
│   │   └── CreateCampaignModal.tsx
│   └── StatusBadge.tsx  # Status-specific badge component
├── lib/
│   └── utils.ts         # Utility functions
├── hooks/
│   ├── useInfluencers.ts
│   ├── useCampaigns.ts
│   ├── useProducts.ts
│   └── useAuth.ts
├── types/
│   ├── auth.ts
│   └── models.ts
├── pages/               # Page components
│   ├── DashboardPage.tsx
│   ├── InfluencersPage.tsx
│   ├── CampaignsPage.tsx
│   ├── ProductsPage.tsx
│   ├── StoresPage.tsx
│   ├── FinancialPage.tsx
│   └── AnalyticsPage.tsx
└── api/
    └── client.ts        # Axios client
```

## UI Components

All UI components are inspired by shadcn/ui and built with Radix UI primitives and Tailwind CSS.

### Button

```tsx
import { Button } from '@/components/ui/button';

// Variants: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon

<Button variant="default" size="lg">
  Click me
</Button>

<Button variant="outline" disabled>
  Disabled
</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    Footer here
  </CardFooter>
</Card>
```

### Dialog/Modal

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button>Action</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Badge

```tsx
import { Badge } from '@/components/ui/badge';

// Variants: default, secondary, destructive, outline, success, warning, info

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Failed</Badge>
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

## Layout Components

### DashboardLayout

The main layout wrapper that provides sidebar navigation and top navigation.

```tsx
import DashboardLayout from '@/components/layout/DashboardLayout';

<DashboardLayout>
  {/* Your page content */}
</DashboardLayout>
```

Features:
- Responsive sidebar (hidden on mobile, slides in with menu toggle)
- Top navigation with user info and logout
- Automatic page title based on route
- Mobile-friendly hamburger menu

### Sidebar

Vertical navigation menu with icons and labels. Auto-highlights current route.

Navigation items:
- Influencers
- Campaigns
- Products
- Firms & Stores
- Financial
- Analytics

### TopNav

Header with page title, menu toggle (mobile), user info, and logout button.

## Custom Components

### StatusBadge

Displays status with appropriate color coding.

```tsx
import StatusBadge from '@/components/StatusBadge';

// Influencer statuses
<StatusBadge status="COLD" />     {/* outline */}
<StatusBadge status="ACTIVE" />   {/* info */}
<StatusBadge status="FINAL" />    {/* success */}

// Campaign statuses
<StatusBadge status="DRAFT" />        {/* secondary */}
<StatusBadge status="ACTIVE" />       {/* info */}
<StatusBadge status="COMPLETED" />    {/* success */}
<StatusBadge status="CANCELLED" />    {/* destructive */}

// Financial statuses
<StatusBadge status="PENDING" />  {/* warning */}
<StatusBadge status="APPROVED" /> {/* success */}
<StatusBadge status="PAID" />     {/* success */}
```

## React Query Hooks

All data fetching uses React Query for caching, syncing, and optimistic updates.

### useInfluencers

```tsx
const { data: influencers, isLoading, isError } = useInfluencers();
```

### useCreateInfluencer

```tsx
const { mutate: createInfluencer, isPending } = useCreateInfluencer();

createInfluencer(influencerData, {
  onSuccess: () => {
    // Handle success
  },
});
```

### useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign

Similar patterns to influencers with optimistic updates.

### useProducts

Fetch products from the catalog.

## Form Modals

### CreateInfluencerModal

Modal form for creating new influencers with validation.

```tsx
const [open, setOpen] = useState(false);

<CreateInfluencerModal open={open} onOpenChange={setOpen} />
```

Fields:
- Name (required)
- Email (required, validated)
- Phone (optional)
- Bio (optional)
- Followers (optional, numeric)
- Platform (optional)
- Profile URL (optional, URL validated)

### CreateCampaignModal

Modal form for creating new campaigns.

Fields:
- Campaign Name (required)
- Description (optional)
- Budget (optional, numeric)
- Start Date (optional)
- End Date (optional)

## Pages

All pages follow the same pattern:

1. Wrap with `<DashboardLayout>`
2. Use React Query hooks for data
3. Display loading/error states
4. Render content with cards and tables
5. Include action buttons where appropriate

### InfluencersPage

Displays influencers in a tabbed interface grouped by status (COLD, ACTIVE, FINAL).
- Card-based grid layout
- Filter by status with tabs
- Create button opens modal
- Shows influencer details: name, email, bio, platform, followers

### CampaignsPage

Displays campaigns in a table with sorting.
- Columns: Name, Status, Budget, Start Date, End Date, Created
- Create button opens modal
- Status badges with color coding

### ProductsPage

Displays products in a grid.
- Shows product cards with name, SKU, description, price
- Summary stats: total products, total value, average price

### StoresPage

Organization and store management interface.
- Display current firm/organization
- Team member list
- Organization settings (placeholder for future)

### FinancialPage

Financial documents and overview.
- Summary cards: Total Amount, Paid, Pending
- Document type breakdown
- Recent documents table with status

### AnalyticsPage

Dashboard with key metrics and visualizations.
- Campaign metrics (total, active, completed, drafts)
- Influencer pipeline (total, cold, active, converted)
- Financial metrics (budget, spent, remaining)
- Budget utilization bar
- Weekly performance chart

## Styling

### Tailwind Classes

- Colors: Use `text-slate-*` and `bg-slate-*` for base colors
- Brand colors: Use `text-brand-primary` (#0F172A) and `text-brand-accent` (#14b8a6)
- Spacing: Use consistent gap and padding values (4, 6, 8)
- Responsive: Use `md:` prefix for medium breakpoint

### Theme

The dashboard uses a professional, accessible color scheme:

- Primary: Slate-900 (#0f172a)
- Secondary: Slate-600
- Accent: Teal (#14b8a6)
- Background: Slate-50 (#f8fafc)
- Cards: White background with slate borders
- Shadows: Subtle shadows for depth

## Best Practices

1. **Always use TypeScript**: Define props and data types
2. **Use React Query**: For all server state (data fetching)
3. **Use react-hook-form**: For form handling and validation
4. **Use zod**: For schema validation in forms
5. **Keep components small**: Single responsibility principle
6. **Use the layout wrapper**: All pages should use DashboardLayout
7. **Handle loading/error states**: Always show appropriate feedback
8. **Use semantic HTML**: Proper heading hierarchy, button elements
9. **Accessibility**: ARIA labels, keyboard navigation, color contrast
10. **Responsive design**: Test on mobile, tablet, and desktop

## Adding a New Page

1. Create page in `src/pages/NewPage.tsx`
2. Wrap with `<DashboardLayout>`
3. Add route in `src/App.tsx`
4. Add navigation item in `src/components/layout/Sidebar.tsx`
5. Follow the established patterns for components and hooks

## Extending Components

To add more UI components:

1. Create new file in `src/components/ui/`
2. Use Radix UI primitives as base
3. Style with Tailwind CSS
4. Export from the component file
5. Add to this guide

Example: Adding a Select component

```tsx
// src/components/ui/select.tsx
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '../../lib/utils';

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
// ... etc

// Use in pages/components
import { Select, SelectValue } from '@/components/ui/select';
```

## Dependencies

- **UI Framework**: Radix UI primitives
- **Styling**: Tailwind CSS 3.3+
- **Icons**: lucide-react
- **Data Fetching**: React Query
- **Forms**: react-hook-form + zod
- **HTTP Client**: axios

All dependencies are already installed in `frontend/package.json`.
