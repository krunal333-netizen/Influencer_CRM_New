import { useState } from 'react';
import { Plus } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import StatusBadge from '../components/StatusBadge';
import CreateInfluencerModal from '../components/modals/CreateInfluencerModal';
import { useInfluencers } from '../hooks/useInfluencers';

export default function InfluencersPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { data: influencers = [], isLoading, isError } = useInfluencers();

  const groupedByStatus = {
    COLD: influencers.filter((i) => i.status === 'COLD'),
    ACTIVE: influencers.filter((i) => i.status === 'ACTIVE'),
    FINAL: influencers.filter((i) => i.status === 'FINAL'),
  };

  const InfluencerCard = ({ influencer }: any) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">{influencer.name}</h3>
              <p className="text-sm text-slate-600">{influencer.email}</p>
            </div>
            <StatusBadge status={influencer.status} />
          </div>

          {influencer.bio && (
            <p className="text-sm text-slate-600 line-clamp-2">{influencer.bio}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {influencer.platform && (
              <Badge variant="outline" className="text-xs">
                {influencer.platform}
              </Badge>
            )}
            {influencer.followers && (
              <Badge variant="secondary" className="text-xs">
                {influencer.followers.toLocaleString()} followers
              </Badge>
            )}
          </div>

          {influencer.phone && (
            <p className="text-xs text-slate-500">
              📱 {influencer.phone}
            </p>
          )}

          {influencer.profileUrl && (
            <a
              href={influencer.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              View Profile
            </a>
          )}

          <div className="pt-3 border-t border-slate-200 text-xs text-slate-500">
            Added {new Date(influencer.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Influencers</h2>
            <p className="text-slate-600">Manage your influencer pipeline</p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Influencer
          </Button>
        </div>

        {/* Tabs by Status */}
        <Tabs defaultValue="COLD" className="w-full">
          <TabsList>
            <TabsTrigger value="COLD">
              Cold ({groupedByStatus.COLD.length})
            </TabsTrigger>
            <TabsTrigger value="ACTIVE">
              Active ({groupedByStatus.ACTIVE.length})
            </TabsTrigger>
            <TabsTrigger value="FINAL">
              Final ({groupedByStatus.FINAL.length})
            </TabsTrigger>
          </TabsList>

          {/* COLD Tab */}
          <TabsContent value="COLD" className="mt-6 space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6 text-center text-slate-500">
                  Loading...
                </CardContent>
              </Card>
            ) : isError ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6 text-center text-red-600">
                  Error loading influencers
                </CardContent>
              </Card>
            ) : groupedByStatus.COLD.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-slate-500">
                  No cold influencers yet. Create one to get started!
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedByStatus.COLD.map((influencer) => (
                  <InfluencerCard key={influencer.id} influencer={influencer} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ACTIVE Tab */}
          <TabsContent value="ACTIVE" className="mt-6 space-y-4">
            {groupedByStatus.ACTIVE.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-slate-500">
                  No active influencers yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedByStatus.ACTIVE.map((influencer) => (
                  <InfluencerCard key={influencer.id} influencer={influencer} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* FINAL Tab */}
          <TabsContent value="FINAL" className="mt-6 space-y-4">
            {groupedByStatus.FINAL.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-slate-500">
                  No final influencers yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedByStatus.FINAL.map((influencer) => (
                  <InfluencerCard key={influencer.id} influencer={influencer} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Modal */}
      <CreateInfluencerModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </DashboardLayout>
  );
}
