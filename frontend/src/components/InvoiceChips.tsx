import { Receipt, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { InvoiceImage } from '../types/models';
import StatusBadge from './StatusBadge';

interface InvoiceChipsProps {
  invoices?: InvoiceImage[];
}

export default function InvoiceChips({ invoices }: InvoiceChipsProps) {
  const navigate = useNavigate();

  if (!invoices || invoices.length === 0) {
    return <div className="text-sm text-slate-500">No invoices linked</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-700">
          Linked Invoices ({invoices.length})
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate('/dashboard/invoices')}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View All
        </Button>
      </div>
      <div className="space-y-2">
        {invoices.slice(0, 3).map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-sm"
          >
            <Receipt className="h-4 w-4 text-slate-500" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-900">
                {invoice.extractedTotal
                  ? `$${parseFloat(invoice.extractedTotal).toFixed(2)}`
                  : 'Invoice'}
              </div>
              <div className="text-xs text-slate-500">
                {new Date(invoice.createdAt).toLocaleDateString()}
              </div>
            </div>
            <StatusBadge status={invoice.status} />
          </div>
        ))}
        {invoices.length > 3 && (
          <div className="text-xs text-slate-500 text-center">
            +{invoices.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}
