import { useState, useCallback, useEffect } from 'react';
import {
  Upload,
  Search,
  X,
  CheckCircle,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';
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
  useInvoices,
  useUploadInvoice,
  useUpdateInvoice,
  useUpdateInvoiceStatus,
  useLinkInvoiceToCampaign,
  useLinkInvoiceToProduct,
  useDeleteInvoice,
  InvoiceFilters,
} from '../hooks/useInvoices';
import { useCampaigns } from '../hooks/useCampaigns';
import { useProducts } from '../hooks/useProducts';
import { InvoiceImage } from '../types/models';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function InvoicesPage() {
  const [filters, setFilters] = useState<InvoiceFilters>({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceImage | null>(
    null
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkType, setLinkType] = useState<'campaign' | 'product'>('campaign');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editedData, setEditedData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [selectedLinkId, setSelectedLinkId] = useState('');
  const [linking, setLinking] = useState(false);

  const { data: invoices, isLoading, isError } = useInvoices(filters);
  const { data: campaignsResponse } = useCampaigns({ limit: 100 });
  const { data: productsResponse } = useProducts({ limit: 100 });

  const campaigns = campaignsResponse?.data || [];
  const products = productsResponse?.data || [];

  const uploadMutation = useUploadInvoice();
  const updateMutation = useUpdateInvoice();
  const updateStatusMutation = useUpdateInvoiceStatus();
  const linkCampaignMutation = useLinkInvoiceToCampaign();
  const linkProductMutation = useLinkInvoiceToProduct();
  const deleteMutation = useDeleteInvoice();

  useEffect(() => {
    if (selectedInvoice) {
      setEditedData(selectedInvoice.ocrData || {});
    }
  }, [selectedInvoice]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleViewDetail = (invoice: InvoiceImage) => {
    setSelectedInvoice(invoice);
    setDetailDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete invoice:', error);
      }
    }
  };

  const handleLink = (invoice: InvoiceImage, type: 'campaign' | 'product') => {
    setSelectedInvoice(invoice);
    setLinkType(type);
    setLinkDialogOpen(true);
  };

  const getImageUrl = (imagePath: string) => {
    return `${API_BASE_URL}/${imagePath}`;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await uploadMutation.mutateAsync({ file: selectedFile });
      setSelectedFile(null);
      setUploadDialogOpen(false);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedInvoice) return;
    setSaving(true);
    try {
      await updateMutation.mutateAsync({
        id: selectedInvoice.id,
        ocrData: editedData,
      });
      setDetailDialogOpen(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedInvoice) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: selectedInvoice.id,
        status: 'PROCESSED',
      });
      setDetailDialogOpen(false);
    } catch (error) {
      console.error('Failed to verify:', error);
    }
  };

  const handleLinkSubmit = async () => {
    if (!selectedInvoice || !selectedLinkId) return;
    setLinking(true);
    try {
      if (linkType === 'campaign') {
        await linkCampaignMutation.mutateAsync({
          invoiceId: selectedInvoice.id,
          campaignId: selectedLinkId,
        });
      } else {
        await linkProductMutation.mutateAsync({
          invoiceId: selectedInvoice.id,
          productId: selectedLinkId,
        });
      }
      setLinkDialogOpen(false);
    } catch (error) {
      console.error('Failed to link:', error);
    } finally {
      setLinking(false);
    }
  };

  const InvoiceUploadWidget = () => {
    return (
      <div className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-brand-primary bg-brand-primary/5'
              : 'border-slate-300 hover:border-slate-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-slate-700">
                <FileText className="h-8 w-8" />
                <span className="font-medium">{selectedFile.name}</span>
              </div>
              {selectedFile.type.startsWith('image/') && (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="mx-auto max-h-64 rounded-md"
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                <X className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-2 text-sm text-slate-600">
                Drag and drop an invoice image here, or click to select
              </p>
              <input
                type="file"
                className="hidden"
                id="file-upload"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Select File
              </Button>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedFile(null);
              setUploadDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading ? 'Uploading...' : 'Upload Invoice'}
          </Button>
        </div>
      </div>
    );
  };

  const InvoiceDetailDialog = () => {
    if (!selectedInvoice) return null;

    return (
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              View and edit OCR-extracted data
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500">Image Preview</Label>
                <img
                  src={getImageUrl(selectedInvoice.imagePath)}
                  alt="Invoice"
                  className="mt-2 w-full rounded-md border"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs text-slate-500">Status</Label>
                <StatusBadge status={selectedInvoice.status} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>AS Code</Label>
                <Input
                  value={(editedData as Record<string, string>).asCode || ''}
                  onChange={(e) =>
                    setEditedData({ ...editedData, asCode: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Product Description</Label>
                <Input
                  value={
                    (editedData as Record<string, string>).productDescription ||
                    ''
                  }
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      productDescription: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Unit Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={(editedData as Record<string, string>).unitPrice || ''}
                  onChange={(e) =>
                    setEditedData({ ...editedData, unitPrice: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Total Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={
                    (editedData as Record<string, string>).totalAmount ||
                    selectedInvoice.extractedTotal ||
                    ''
                  }
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      totalAmount: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Raw OCR Text</Label>
                <textarea
                  className="min-h-[100px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={(editedData as Record<string, string>).rawText || ''}
                  onChange={(e) =>
                    setEditedData({ ...editedData, rawText: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button onClick={handleVerify}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Verified
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const LinkDialog = () => {
    return (
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Link to {linkType === 'campaign' ? 'Campaign' : 'Product'}
            </DialogTitle>
            <DialogDescription>
              Associate this invoice with a {linkType}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>
                Select {linkType === 'campaign' ? 'Campaign' : 'Product'}
              </Label>
              <Select value={selectedLinkId} onValueChange={setSelectedLinkId}>
                <SelectTrigger>
                  <SelectValue placeholder={`Choose ${linkType}...`} />
                </SelectTrigger>
                <SelectContent>
                  {linkType === 'campaign'
                    ? campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))
                    : products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLinkSubmit}
              disabled={!selectedLinkId || linking}
            >
              {linking ? 'Linking...' : 'Link'}
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
            <h2 className="text-3xl font-bold text-slate-900">Invoices</h2>
            <p className="text-slate-600">
              Upload and manage invoice images with OCR processing
            </p>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Invoice
          </Button>
        </div>

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
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="PROCESSED">Processed</SelectItem>
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
                <Label htmlFor="product">Product</Label>
                <Select
                  value={filters.productId || ''}
                  onValueChange={(value) =>
                    handleFilterChange('productId', value || undefined)
                  }
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="All products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Products</SelectItem>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
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
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>
              {invoices
                ? `${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}`
                : 'Loading invoices...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">
                Loading invoices...
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-red-600 bg-red-50 rounded-md">
                Error loading invoices
              </div>
            ) : !invoices || invoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No invoices found.</p>
                <p className="text-sm text-slate-400">
                  Upload your first invoice to get started.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {invoices.map((invoice) => (
                  <Card key={invoice.id} className="overflow-hidden">
                    <div className="aspect-video bg-slate-100 relative">
                      <img
                        src={getImageUrl(invoice.imagePath)}
                        alt="Invoice"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <StatusBadge status={invoice.status} />
                        <span className="text-xs text-slate-500">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {invoice.extractedTotal && (
                        <div className="text-lg font-semibold text-slate-900">
                          ${parseFloat(invoice.extractedTotal).toFixed(2)}
                        </div>
                      )}
                      {invoice.campaign && (
                        <div className="text-sm text-slate-600">
                          <span className="text-xs text-slate-500">
                            Campaign:{' '}
                          </span>
                          {invoice.campaign.name}
                        </div>
                      )}
                      {invoice.product && (
                        <div className="text-sm text-slate-600">
                          <span className="text-xs text-slate-500">
                            Product:{' '}
                          </span>
                          {invoice.product.name}
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewDetail(invoice)}
                        >
                          <Search className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLink(invoice, 'campaign')}
                        >
                          <LinkIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(invoice.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Invoice</DialogTitle>
            <DialogDescription>
              Upload an invoice image for OCR processing
            </DialogDescription>
          </DialogHeader>
          <InvoiceUploadWidget />
        </DialogContent>
      </Dialog>

      <InvoiceDetailDialog />
      <LinkDialog />
    </DashboardLayout>
  );
}
