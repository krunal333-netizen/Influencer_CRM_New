import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { InstagramLinkMetric } from '../../types/analytics';

interface InstagramLinkTrackingProps {
  links: InstagramLinkMetric[];
  isLoading?: boolean;
}

export default function InstagramLinkTracking({
  links,
  isLoading = false,
}: InstagramLinkTrackingProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Instagram Link Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!links.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Instagram Link Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">No tracked links found for this period</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instagram Link Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th className="pb-2">Link</th>
                <th className="pb-2">Influencer</th>
                <th className="pb-2">Campaign</th>
                <th className="pb-2 text-right">Clicks</th>
                <th className="pb-2 text-right">Conversions</th>
                <th className="pb-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {links.slice(0, 20).map((row) => (
                <tr key={row.url} className="border-b border-slate-100 last:border-b-0">
                  <td className="py-3 pr-4">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex max-w-[320px] items-center gap-1 truncate text-blue-600 hover:underline"
                      title={row.url}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="truncate">{row.url}</span>
                    </a>
                  </td>
                  <td className="py-3 pr-4 text-slate-700">
                    {row.influencerName ?? '—'}
                  </td>
                  <td className="py-3 pr-4 text-slate-700">
                    {row.campaignName ?? '—'}
                  </td>
                  <td className="py-3 text-right text-slate-900">
                    {row.clicks?.toLocaleString() ?? '—'}
                  </td>
                  <td className="py-3 text-right text-slate-900">
                    {row.conversions?.toLocaleString() ?? '—'}
                  </td>
                  <td className="py-3 text-right font-medium text-slate-900">
                    {typeof row.revenue === 'number'
                      ? `$${row.revenue.toLocaleString()}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
