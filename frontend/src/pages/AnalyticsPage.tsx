import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const mockAnalytics = {
  campaigns: {
    total: 24,
    active: 8,
    completed: 12,
    draft: 4,
  },
  influencers: {
    total: 156,
    cold: 98,
    active: 45,
    final: 13,
  },
  financial: {
    totalBudget: 450000,
    spent: 280000,
    remaining: 170000,
  },
  performance: [
    { name: 'Week 1', revenue: 12000, spend: 8000 },
    { name: 'Week 2', revenue: 15000, spend: 9500 },
    { name: 'Week 3', revenue: 13500, spend: 8800 },
    { name: 'Week 4', revenue: 18000, spend: 11000 },
  ],
};

export default function AnalyticsPage() {
  const budgetUtilization = (
    (mockAnalytics.financial.spent / mockAnalytics.financial.totalBudget) * 100
  ).toFixed(1);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 md:p-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Analytics</h2>
          <p className="text-slate-600">Monitor your CRM performance and key metrics</p>
        </div>

        {/* Campaign Metrics */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Campaign Metrics</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-900">{mockAnalytics.campaigns.total}</p>
                  <p className="mt-2 text-sm text-slate-600">Total Campaigns</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">{mockAnalytics.campaigns.active}</p>
                  <p className="mt-2 text-sm text-slate-600">Active Campaigns</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-emerald-600">{mockAnalytics.campaigns.completed}</p>
                  <p className="mt-2 text-sm text-slate-600">Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-600">{mockAnalytics.campaigns.draft}</p>
                  <p className="mt-2 text-sm text-slate-600">Drafts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Influencer Metrics */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Influencer Pipeline</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-900">{mockAnalytics.influencers.total}</p>
                  <p className="mt-2 text-sm text-slate-600">Total Influencers</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-600">{mockAnalytics.influencers.cold}</p>
                  <p className="mt-2 text-sm text-slate-600">Cold Leads</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-amber-600">{mockAnalytics.influencers.active}</p>
                  <p className="mt-2 text-sm text-slate-600">Active</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-emerald-600">{mockAnalytics.influencers.final}</p>
                  <p className="mt-2 text-sm text-slate-600">Converted</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Financial Metrics */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Financial Overview</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-600">Total Budget</p>
                  <p className="text-3xl font-bold text-slate-900">
                    ${(mockAnalytics.financial.totalBudget / 1000).toFixed(0)}K
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-600">Total Spent</p>
                  <p className="text-3xl font-bold text-orange-600">
                    ${(mockAnalytics.financial.spent / 1000).toFixed(0)}K
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-600">Remaining Budget</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    ${(mockAnalytics.financial.remaining / 1000).toFixed(0)}K
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Budget Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
            <CardDescription>Current spending vs. budget</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <p className="text-sm font-medium text-slate-600">Budget Used</p>
                <p className="text-2xl font-bold text-slate-900">{budgetUtilization}%</p>
              </div>
              <div className="h-4 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                  style={{ width: `${budgetUtilization}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>${(mockAnalytics.financial.spent / 1000).toFixed(1)}K spent</span>
                <span>${(mockAnalytics.financial.totalBudget / 1000).toFixed(1)}K total</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <CardDescription>Revenue vs. spending by week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.performance.map((week) => (
                <div key={week.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-900">{week.name}</span>
                    <span className="text-slate-600">
                      ${(week.revenue - week.spend).toLocaleString()} profit
                    </span>
                  </div>
                  <div className="grid gap-2 grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Revenue</p>
                      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${(week.revenue / 20000) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 mt-1">${week.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Spend</p>
                      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-orange-500"
                          style={{ width: `${(week.spend / 20000) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 mt-1">${week.spend.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
