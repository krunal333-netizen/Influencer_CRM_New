import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { InfluencerPerformanceScore } from '../../types/analytics';

interface InfluencerPerformanceScoringProps {
  scores: InfluencerPerformanceScore[];
  isLoading?: boolean;
}

const scoreColor = (score: number) => {
  if (score >= 80) {
    return 'bg-emerald-600';
  }
  if (score >= 60) {
    return 'bg-blue-600';
  }
  if (score >= 40) {
    return 'bg-amber-500';
  }
  return 'bg-rose-600';
};

export default function InfluencerPerformanceScoring({
  scores,
  isLoading = false,
}: InfluencerPerformanceScoringProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Influencer Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!scores.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Influencer Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">No influencer performance data available</p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...scores].sort((a, b) => b.score - a.score).slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Influencer Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sorted.map((row) => (
            <div key={row.influencerId} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <p className="font-semibold text-slate-900">{row.influencerName}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Reach: {row.reach?.toLocaleString() ?? '—'} · Engagement:{' '}
                    {typeof row.engagementRate === 'number'
                      ? `${row.engagementRate.toFixed(2)}%`
                      : '—'}{' '}
                    · ROI:{' '}
                    {typeof row.roi === 'number' ? `${row.roi.toFixed(2)}%` : '—'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-slate-600">Score</p>
                  <p className="text-2xl font-bold text-slate-900">{row.score.toFixed(0)}</p>
                </div>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full transition-all ${scoreColor(row.score)}`}
                  style={{ width: `${Math.min(100, Math.max(0, row.score))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
