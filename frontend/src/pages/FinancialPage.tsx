import { useState } from 'react';
import { Plus, TrendingUp, DollarSign } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import DocumentGenerationModal from '../components/financial/DocumentGenerationModal';
import DocumentTable from '../components/financial/DocumentTable';
import DocumentFilters from '../components/financial/DocumentFilters';
import DocumentDetailModal from '../components/financial/DocumentDetailModal';
import TypeMetrics from '../components/financial/TypeMetrics';
import FirmMetrics from '../components/financial/FirmMetrics';
import {
  useFinancialDocuments,
  useFinancialDocumentStatsByType,
  useFinancialDocumentStatsByFirm,
} from '../hooks/useFinancialDocuments';
import { FinancialDocument } from '../types/models';
import { useQuery } from '@tanstack/react-query';
import { getCampaignsRequest } from '../api/client';

export default function FinancialPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<FinancialDocument | null>(null);
  const [filters, setFilters] = useState<{
    type?: string;
    status?: string;
    search?: string;
  }>({});

  const { data: documentsData, isLoading: isLoadingDocuments } = useFinancialDocuments(filters);
  const { data: typeStats, isLoading: isLoadingTypeStats } = useFinancialDocumentStatsByType();
  const { data: firmStats, isLoading: isLoadingFirmStats } = useFinancialDocumentStatsByFirm();
  const { data: campaignsData } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => getCampaignsRequest({ limit: 100 }),
  });

  const documents = documentsData?.data || [];
  const campaigns = campaignsData?.data?.map((c) => ({ id: c.id, name: c.name })) || [];

  const totalAmount = documents.reduce((sum, doc) => sum + parseFloat(doc.amount), 0);
  const paidAmount = documents
    .filter((doc) => doc.status === 'PAID')
    .reduce((sum, doc) => sum + parseFloat(doc.amount), 0);
  const pendingAmount = documents
    .filter((doc) => doc.status === 'PENDING' || doc.status === 'APPROVED')
    .reduce((sum, doc) => sum + parseFloat(doc.amount), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Financial Overview</h2>
            <p className="text-slate-600">Manage invoices, purchase orders, and financial documents</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Amount</p>
                  <p className="text-3xl font-bold text-slate-900">${totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Paid</p>
                  <p className="text-3xl font-bold text-emerald-600">${paidAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-3xl font-bold text-amber-600">${pendingAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <TypeMetrics stats={typeStats || {}} isLoading={isLoadingTypeStats} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Financial Documents</CardTitle>
                <CardDescription>Recent documents and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <DocumentFilters filters={filters} onFilterChange={setFilters} />
                  <DocumentTable
                    documents={documents}
                    isLoading={isLoadingDocuments}
                    onDocumentClick={setSelectedDocument}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <FirmMetrics metrics={firmStats || []} isLoading={isLoadingFirmStats} />
          </div>
        </div>
      </div>

      <DocumentGenerationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaigns={campaigns}
      />

      <DocumentDetailModal
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </DashboardLayout>
  );
}
