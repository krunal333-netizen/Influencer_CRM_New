import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { RoiSeriesPoint } from '../../types/analytics';

interface CampaignRoiChartProps {
  data: RoiSeriesPoint[];
  isLoading?: boolean;
}

export default function CampaignRoiChart({
  data,
  isLoading = false,
}: CampaignRoiChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign ROI</CardTitle>
          <CardDescription>Revenue vs spend and ROI over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign ROI</CardTitle>
          <CardDescription>Revenue vs spend and ROI over time</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">No ROI data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign ROI</CardTitle>
        <CardDescription>Revenue vs spend and ROI over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="amount"
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) => `$${v}`}
              />
              <YAxis
                yAxisId="roi"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                formatter={(value: unknown, name: string) => {
                  if (typeof value !== 'number') {
                    return [value as string, name];
                  }

                  if (name.toLowerCase() === 'roi') {
                    return [`${value.toFixed(2)}%`, 'ROI'];
                  }

                  return [`$${value.toLocaleString()}`, name];
                }}
              />
              <Legend />
              <Line
                yAxisId="amount"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="amount"
                type="monotone"
                dataKey="spend"
                name="Spend"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="roi"
                type="monotone"
                dataKey="roi"
                name="ROI"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
