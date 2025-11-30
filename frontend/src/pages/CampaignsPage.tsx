import { useState } from 'react';
import { Plus } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import StatusBadge from '../components/StatusBadge';
import CreateCampaignModal from '../components/modals/CreateCampaignModal';
import { useCampaigns } from '../hooks/useCampaigns';

export default function CampaignsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { data: campaigns = [], isLoading, isError } = useCampaigns();

  const CampaignTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Budget</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Start Date</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">End Date</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Created</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                {campaign.name}
              </td>
              <td className="px-6 py-4 text-sm">
                <StatusBadge status={campaign.status} />
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {campaign.budget ? `$${parseFloat(campaign.budget).toFixed(2)}` : '-'}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : '-'}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : '-'}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {new Date(campaign.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Campaigns</h2>
            <p className="text-slate-600">Create and manage your marketing campaigns</p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>

        {/* Campaigns Card */}
        <Card>
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
            <CardDescription>
              {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} total
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
                <p className="text-slate-500">No campaigns created yet.</p>
                <p className="text-sm text-slate-400">Create your first campaign to get started.</p>
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
