import { Building2, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface FirmMetric {
  firmId: string;
  firmName: string;
  count: number;
  total: number;
  paid: number;
  pending: number;
}

interface FirmMetricsProps {
  metrics: FirmMetric[];
  isLoading?: boolean;
}

export default function FirmMetrics({ metrics, isLoading = false }: FirmMetricsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Firm Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Firm Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">No firm data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firm Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div
              key={metric.firmId}
              className="rounded-lg border border-slate-200 p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-slate-600" />
                  <h4 className="font-semibold text-slate-900">{metric.firmName}</h4>
                </div>
                <span className="text-xs text-slate-500">{metric.count} documents</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className="h-3 w-3 text-slate-500" />
                    <span className="text-xs text-slate-600">Total</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    ${metric.total.toFixed(2)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs text-slate-600">Paid</span>
                  </div>
                  <p className="text-lg font-bold text-emerald-600">
                    ${metric.paid.toFixed(2)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3 text-amber-500" />
                    <span className="text-xs text-slate-600">Pending</span>
                  </div>
                  <p className="text-lg font-bold text-amber-600">
                    ${metric.pending.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-emerald-600 transition-all"
                  style={{ width: `${(metric.paid / metric.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
