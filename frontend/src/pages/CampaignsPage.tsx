import { useState } from 'react';
import { Plus } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import StatusBadge from '../components/StatusBadge';
import CreateCampaignModal from '../components/modals/CreateCampaignModal';
import { useCampaigns, CampaignFilters } from '../hooks/useCampaigns';

export default function CampaignsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<CampaignFilters>({
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState('');

  const { data: response, isLoading, isError } = useCampaigns(filters);
  const campaigns = response?.data || [];
  const pagination = response?.pagination;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    handleFilterChange('search', value || undefined);
  };

  const getDeliverableCount = (campaign: (typeof campaigns)[0]) => {
    const count =
      (campaign.reelsRequired || 0) +
      (campaign.postsRequired || 0) +
      (campaign.storiesRequired || 0);
    return count || '-';
  };

  const getBudgetUtilization = (campaign: (typeof campaigns)[0]) => {
    const budget = campaign.budget ? parseFloat(campaign.budget) : 0;
    const spent = campaign.budgetSpent ? parseFloat(campaign.budgetSpent) : 0;
    if (budget === 0) return 'N/A';
    return `${((spent / budget) * 100).toFixed(0)}%`;
  };

  const CampaignTable = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Type
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Deliverables
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Utilized
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Influencers
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Start Date
              </th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                  {campaign.name}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {campaign.type || 'MIXED'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge status={campaign.status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {getDeliverableCount(campaign)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {campaign.budget
                    ? `$${parseFloat(campaign.budget).toFixed(2)}`
                    : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {getBudgetUtilization(campaign)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {campaign.influencerLinks?.length || 0}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {campaign.startDate
                    ? new Date(campaign.startDate).toLocaleDateString()
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.pages} ({pagination.total}{' '}
            total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleFilterChange('page', (filters.page || 1) - 1)
              }
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleFilterChange('page', (filters.page || 1) + 1)
              }
              disabled={pagination.page === pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Campaigns</h2>
            <p className="text-slate-600">
              Create and manage your marketing campaigns
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="grid gap-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Campaign name..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) =>
                    handleFilterChange('status', value || undefined)
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={filters.type || ''}
                  onValueChange={(value) =>
                    handleFilterChange('type', value || undefined)
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="REELS">Reels</SelectItem>
                    <SelectItem value="POSTS">Posts</SelectItem>
                    <SelectItem value="STORIES">Stories</SelectItem>
                    <SelectItem value="MIXED">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="limit">Results Per Page</Label>
                <Select
                  value={String(filters.limit || 10)}
                  onValueChange={(value) =>
                    handleFilterChange('limit', parseInt(value))
                  }
                >
                  <SelectTrigger id="limit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Card */}
        <Card>
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
            <CardDescription>
              {pagination
                ? `${pagination.total} campaign${pagination.total !== 1 ? 's' : ''} total`
                : 'Loading campaigns...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">
                Loading campaigns...
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-red-600 bg-red-50 rounded-md">
                Error loading campaigns
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No campaigns found.</p>
                <p className="text-sm text-slate-400">
                  Try adjusting your filters.
                </p>
              </div>
            ) : (
              <CampaignTable />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <CreateCampaignModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </DashboardLayout>
  );
}
