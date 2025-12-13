import { FileText, ShoppingCart, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface TypeStat {
  count: number;
  total: number;
  paid: number;
  pending: number;
}

interface TypeMetricsProps {
  stats: {
    PO?: TypeStat;
    INVOICE?: TypeStat;
    FORM?: TypeStat;
  };
  isLoading?: boolean;
}

export default function TypeMetrics({ stats, isLoading = false }: TypeMetricsProps) {
  const types = [
    {
      key: 'PO',
      label: 'Purchase Orders',
      icon: ShoppingCart,
      color: 'blue',
      data: stats.PO || { count: 0, total: 0, paid: 0, pending: 0 },
    },
    {
      key: 'INVOICE',
      label: 'Invoices',
      icon: FileText,
      color: 'purple',
      data: stats.INVOICE || { count: 0, total: 0, paid: 0, pending: 0 },
    },
    {
      key: 'FORM',
      label: 'Forms',
      icon: ClipboardList,
      color: 'green',
      data: stats.FORM || { count: 0, total: 0, paid: 0, pending: 0 },
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {types.map((type) => {
        const Icon = type.icon;
        const iconColors = {
          blue: 'text-blue-600 bg-blue-100',
          purple: 'text-purple-600 bg-purple-100',
          green: 'text-green-600 bg-green-100',
        };

        return (
          <Card key={type.key}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`rounded-lg p-2 ${iconColors[type.color as keyof typeof iconColors]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">{type.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{type.data.count}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total</span>
                      <span className="text-sm font-semibold text-slate-900">
                        ${type.data.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Paid</span>
                      <span className="text-sm font-semibold text-emerald-600">
                        ${type.data.paid.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Pending</span>
                      <span className="text-sm font-semibold text-amber-600">
                        ${type.data.pending.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-emerald-600 transition-all"
                      style={{
                        width: type.data.total > 0 ? `${(type.data.paid / type.data.total) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
