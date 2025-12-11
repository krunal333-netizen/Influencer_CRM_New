import { useState, useEffect } from 'react';
import { Plus, Truck, Package, CheckCircle, Clock, MapPin } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import StatusBadge from '../components/StatusBadge';
import {
  useCourierShipments,
  useCreateCourierShipment,
  useUpdateCourierShipmentStatus,
  useCourierShipmentStats,
  CourierShipmentFilters,
} from '../hooks/useCourierShipments';
import { useCampaigns } from '../hooks/useCampaigns';
import { useInfluencers } from '../hooks/useInfluencers';
import { CourierShipment, TimelineEvent } from '../types/models';

export default function CourierPage() {
  const [filters, setFilters] = useState<CourierShipmentFilters>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] =
    useState<CourierShipment | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    trackingNumber: '',
    courierName: '',
    courierCompany: '',
    campaignId: '',
    influencerId: '',
  });
  const [creating, setCreating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const { data: shipments, isLoading, isError } = useCourierShipments(filters);
  const { data: stats } = useCourierShipmentStats();
  const { data: campaignsResponse } = useCampaigns({ limit: 100 });
  const { data: influencersResponse } = useInfluencers({ limit: 100 });

  const campaigns = campaignsResponse?.data || [];
  const influencers = influencersResponse?.data || [];

  const createMutation = useCreateCourierShipment();
  const updateStatusMutation = useUpdateCourierShipmentStatus();

  useEffect(() => {
    if (selectedShipment) {
      setNewStatus(selectedShipment.status);
    }
  }, [selectedShipment]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleViewDetail = (shipment: CourierShipment) => {
    setSelectedShipment(shipment);
    setDetailDialogOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'SENT':
      case 'IN_TRANSIT':
        return <Truck className="h-4 w-4" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />;
      case 'RETURNED':
        return <Package className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const TimelineComponent = ({ timeline }: { timeline: TimelineEvent[] }) => {
    if (!timeline || timeline.length === 0) {
      return (
        <div className="text-sm text-slate-500">No timeline events yet</div>
      );
    }

    return (
      <div className="space-y-4">
        {timeline.map((event, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                {getStatusIcon(event.status)}
              </div>
              {index < timeline.length - 1 && (
                <div className="h-full w-0.5 bg-slate-200 my-1" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <StatusBadge status={event.status} />
                  <div className="mt-1 text-sm text-slate-600">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              {event.notes && (
                <div className="mt-2 text-sm text-slate-700">{event.notes}</div>
              )}
              {event.location && (
                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleCreateShipment = async () => {
    if (!formData.trackingNumber || !formData.courierName) return;
    setCreating(true);
    try {
      await createMutation.mutateAsync(formData);
      setCreateDialogOpen(false);
      setFormData({
        trackingNumber: '',
        courierName: '',
        courierCompany: '',
        campaignId: '',
        influencerId: '',
      });
    } catch (error) {
      console.error('Failed to create shipment:', error);
    } finally {
      setCreating(false);
    }
  };

  const CreateShipmentDialog = () => {
    return (
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Courier Shipment</DialogTitle>
            <DialogDescription>Add a new shipment to track</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="trackingNumber">
                Tracking Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="trackingNumber"
                value={formData.trackingNumber}
                onChange={(e) =>
                  setFormData({ ...formData, trackingNumber: e.target.value })
                }
                placeholder="Enter tracking number"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="courierName">
                Courier Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="courierName"
                value={formData.courierName}
                onChange={(e) =>
                  setFormData({ ...formData, courierName: e.target.value })
                }
                placeholder="e.g., UPS, FedEx, DHL"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="courierCompany">Courier Company</Label>
              <Input
                id="courierCompany"
                value={formData.courierCompany}
                onChange={(e) =>
                  setFormData({ ...formData, courierCompany: e.target.value })
                }
                placeholder="Full company name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="campaign">Campaign (Optional)</Label>
              <Select
                value={formData.campaignId}
                onValueChange={(value) =>
                  setFormData({ ...formData, campaignId: value })
                }
              >
                <SelectTrigger id="campaign">
                  <SelectValue placeholder="Select campaign..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="influencer">Influencer (Optional)</Label>
              <Select
                value={formData.influencerId}
                onValueChange={(value) =>
                  setFormData({ ...formData, influencerId: value })
                }
              >
                <SelectTrigger id="influencer">
                  <SelectValue placeholder="Select influencer..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {influencers.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateShipment}
              disabled={
                !formData.trackingNumber || !formData.courierName || creating
              }
            >
              {creating ? 'Creating...' : 'Create Shipment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const handleStatusUpdate = async () => {
    if (!selectedShipment) return;
    try {
      await handleUpdateStatus(selectedShipment.id, newStatus);
      setDetailDialogOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const ShipmentDetailDialog = () => {
    if (!selectedShipment) return null;

    return (
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shipment Details</DialogTitle>
            <DialogDescription>
              Tracking Number: {selectedShipment.trackingNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500">Courier</Label>
                <div className="mt-1 font-medium">
                  {selectedShipment.courierName}
                </div>
                {selectedShipment.courierCompany && (
                  <div className="text-sm text-slate-600">
                    {selectedShipment.courierCompany}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs text-slate-500">Current Status</Label>
                <div className="mt-1">
                  <StatusBadge status={selectedShipment.status} />
                </div>
              </div>

              {selectedShipment.campaign && (
                <div>
                  <Label className="text-xs text-slate-500">Campaign</Label>
                  <div className="mt-1 text-sm">
                    {selectedShipment.campaign.name}
                  </div>
                </div>
              )}

              {selectedShipment.influencer && (
                <div>
                  <Label className="text-xs text-slate-500">Influencer</Label>
                  <div className="mt-1 text-sm">
                    {selectedShipment.influencer.name}
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-4">
                <Label>Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="RETURNED">Returned</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleStatusUpdate}
                  className="w-full"
                  disabled={newStatus === selectedShipment.status}
                >
                  Update Status
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500 mb-3 block">
                  Shipment Timeline
                </Label>
                <TimelineComponent
                  timeline={selectedShipment.statusTimeline || []}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 md:p-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Courier Tracking
            </h2>
            <p className="text-slate-600">
              Track shipments and manage logistics
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Shipment
          </Button>
        </div>

        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            {Object.entries(stats).map(([key, value]) => {
              if (typeof value === 'number') {
                return (
                  <Card key={key}>
                    <CardHeader className="pb-3">
                      <CardDescription className="text-xs">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </CardDescription>
                      <CardTitle className="text-2xl">{value}</CardTitle>
                    </CardHeader>
                  </Card>
                );
              }
              return null;
            })}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
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
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="RETURNED">Returned</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="campaign">Campaign</Label>
                <Select
                  value={filters.campaignId || ''}
                  onValueChange={(value) =>
                    handleFilterChange('campaignId', value || undefined)
                  }
                >
                  <SelectTrigger id="campaign">
                    <SelectValue placeholder="All campaigns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Campaigns</SelectItem>
                    {campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="influencer">Influencer</Label>
                <Select
                  value={filters.influencerId || ''}
                  onValueChange={(value) =>
                    handleFilterChange('influencerId', value || undefined)
                  }
                >
                  <SelectTrigger id="influencer">
                    <SelectValue placeholder="All influencers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Influencers</SelectItem>
                    {influencers.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Shipments</CardTitle>
            <CardDescription>
              {shipments
                ? `${shipments.length} shipment${shipments.length !== 1 ? 's' : ''}`
                : 'Loading shipments...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">
                Loading shipments...
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-red-600 bg-red-50 rounded-md">
                Error loading shipments
              </div>
            ) : !shipments || shipments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No shipments found.</p>
                <p className="text-sm text-slate-400">
                  Create your first shipment to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Tracking Number
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Courier
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Influencer
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Sent Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((shipment) => (
                      <tr
                        key={shipment.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {shipment.trackingNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {shipment.courierName}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <StatusBadge status={shipment.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {shipment.campaign?.name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {shipment.influencer?.name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {shipment.sentDate
                            ? new Date(shipment.sentDate).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(shipment)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateShipmentDialog />
      <ShipmentDetailDialog />
    </DashboardLayout>
  );
}
