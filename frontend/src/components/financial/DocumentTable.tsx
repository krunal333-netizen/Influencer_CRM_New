import { useState } from 'react';
import {
  MoreVertical,
  FileText,
  CheckCircle,
  XCircle,
  Download,
} from 'lucide-react';
import StatusBadge from '../StatusBadge';
import { FinancialDocument } from '../../types/models';
import {
  useUpdateFinancialDocumentStatus,
  useMarkFinancialDocumentPaid,
  useDeleteFinancialDocument,
} from '../../hooks/useFinancialDocuments';

interface DocumentTableProps {
  documents: FinancialDocument[];
  isLoading?: boolean;
  onDocumentClick?: (document: FinancialDocument) => void;
}

export default function DocumentTable({
  documents,
  isLoading = false,
  onDocumentClick,
}: DocumentTableProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const updateStatus = useUpdateFinancialDocumentStatus();
  const markPaid = useMarkFinancialDocumentPaid();
  const deleteDoc = useDeleteFinancialDocument();

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      setActiveMenu(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await markPaid.mutateAsync({ id });
      setActiveMenu(null);
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDoc.mutateAsync(id);
        setActiveMenu(null);
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PO':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'INVOICE':
        return <FileText className="h-5 w-5 text-purple-600" />;
      case 'FORM':
        return <FileText className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-slate-600" />;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-2 text-sm text-slate-600">
          No financial documents found
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Document
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Type
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Campaign
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Status
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Issue Date
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Due Date
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr
              key={doc.id}
              className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => onDocumentClick?.(doc)}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {getTypeIcon(doc.type)}
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {doc.documentNumber}
                    </p>
                    {doc.description && (
                      <p className="text-xs text-slate-500 truncate max-w-xs">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {getTypeLabel(doc.type)}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {doc.campaign?.name || '-'}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                ${parseFloat(doc.amount).toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm">
                <StatusBadge status={doc.status} />
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {new Date(doc.issueDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : '-'}
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === doc.id ? null : doc.id);
                    }}
                    className="rounded-lg p-1 hover:bg-slate-200 transition-colors"
                  >
                    <MoreVertical className="h-4 w-4 text-slate-600" />
                  </button>

                  {activeMenu === doc.id && (
                    <div className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        {doc.status !== 'PAID' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkPaid(doc.id);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark as Paid
                          </button>
                        )}
                        {doc.status === 'PENDING' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(doc.id, 'APPROVED');
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </button>
                        )}
                        {doc.status !== 'REJECTED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(doc.id, 'REJECTED');
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        )}
                        {doc.filePath && (
                          <a
                            href={doc.filePath}
                            download
                            onClick={(e) => e.stopPropagation()}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(doc.id);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
