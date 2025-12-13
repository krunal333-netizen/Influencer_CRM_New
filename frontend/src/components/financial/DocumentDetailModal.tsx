import { X, Download, FileText, Calendar, DollarSign, Building } from 'lucide-react';
import { FinancialDocument } from '../../types/models';
import StatusBadge from '../StatusBadge';
import { Button } from '../ui/button';

interface DocumentDetailModalProps {
  document: FinancialDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentDetailModal({
  document,
  isOpen,
  onClose,
}: DocumentDetailModalProps) {
  if (!isOpen || !document) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PO':
        return 'text-blue-600 bg-blue-100';
      case 'INVOICE':
        return 'text-purple-600 bg-purple-100';
      case 'FORM':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PO':
        return 'Purchase Order';
      case 'INVOICE':
        return 'Invoice';
      case 'FORM':
        return 'Form';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${getTypeColor(document.type)}`}>
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{document.documentNumber}</h2>
              <p className="text-sm text-slate-600">{getTypeLabel(document.type)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Amount</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                ${parseFloat(document.amount).toFixed(2)}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-slate-700">Status</span>
              </div>
              <StatusBadge status={document.status} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Issue Date</span>
              </div>
              <p className="text-sm text-slate-900">
                {new Date(document.issueDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Due Date</span>
              </div>
              <p className="text-sm text-slate-900">
                {document.dueDate ? new Date(document.dueDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Paid Date</span>
              </div>
              <p className="text-sm text-slate-900">
                {document.paidDate ? new Date(document.paidDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {document.campaign && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Campaign</span>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium text-slate-900">{document.campaign.name}</p>
                {document.campaign.description && (
                  <p className="mt-1 text-sm text-slate-600">{document.campaign.description}</p>
                )}
                {document.campaign.store && (
                  <p className="mt-2 text-xs text-slate-500">
                    Store: {document.campaign.store.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {document.description && (
            <div>
              <span className="text-sm font-medium text-slate-700">Description</span>
              <p className="mt-2 text-sm text-slate-600">{document.description}</p>
            </div>
          )}

          {document.metadata && (
            <div>
              <span className="text-sm font-medium text-slate-700">Additional Information</span>
              <pre className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 overflow-x-auto">
                {JSON.stringify(document.metadata, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            {document.filePath && (
              <Button variant="outline" asChild>
                <a href={document.filePath} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </a>
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
