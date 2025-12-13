import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ComparisonWidgetProps {
  title: string;
  value?: number | null;
  previousValue?: number | null;
  format?: (value: number) => string;
}

const defaultFormat = (value: number) => value.toLocaleString();

export default function ComparisonWidget({
  title,
  value,
  previousValue,
  format = defaultFormat,
}: ComparisonWidgetProps) {
  const hasValue = typeof value === 'number' && !Number.isNaN(value);
  const hasPrevious =
    typeof previousValue === 'number' && !Number.isNaN(previousValue);

  const delta = hasValue && hasPrevious ? value - previousValue : undefined;
  const deltaPct =
    hasValue && hasPrevious && previousValue !== 0
      ? (delta! / previousValue) * 100
      : undefined;

  const isUp = typeof delta === 'number' && delta > 0;
  const isDown = typeof delta === 'number' && delta < 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-3xl font-bold text-slate-900">
              {hasValue ? format(value) : '—'}
            </p>
            {hasPrevious ? (
              <p className="mt-1 text-xs text-slate-500">
                Prev: {format(previousValue)}
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Prev: —</p>
            )}
          </div>

          {typeof deltaPct === 'number' ? (
            <div
              className={
                'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ' +
                (isUp
                  ? 'bg-emerald-50 text-emerald-700'
                  : isDown
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-slate-100 text-slate-600')
              }
            >
              {isUp ? (
                <TrendingUp className="h-4 w-4" />
              ) : isDown ? (
                <TrendingDown className="h-4 w-4" />
              ) : null}
              <span>{deltaPct.toFixed(1)}%</span>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
