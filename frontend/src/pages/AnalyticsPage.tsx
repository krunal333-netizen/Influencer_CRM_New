import { useEffect, useMemo, useState } from 'react';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import ComparisonWidget from '../components/analytics/ComparisonWidget';
import CampaignRoiChart from '../components/analytics/CampaignRoiChart';
import InfluencerPerformanceScoring from '../components/analytics/InfluencerPerformanceScoring';
import InstagramLinkTracking from '../components/analytics/InstagramLinkTracking';
import { useAuth } from '../hooks/useAuth';
import { useCampaigns } from '../hooks/useCampaigns';
import {
  useAnalyticsDashboard,
  usePerformanceMetrics,
} from '../hooks/useAnalytics';
import type { AnalyticsDashboardQuery } from '../types/analytics';

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const num = Number(value);
    if (Number.isFinite(num)) {
      return num;
    }
  }

  return undefined;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const getRecord = (
  obj: Record<string, unknown> | undefined,
  key: string
): Record<string, unknown> | undefined => {
  const value = obj?.[key];
  return isRecord(value) ? value : undefined;
};

type PrimaryContext = 'store' | 'campaign';
type StoreScope = 'firm' | 'store';
type DateMode = 'month' | 'range';

export default function AnalyticsPage() {
  const { user } = useAuth();

  const [primaryContext, setPrimaryContext] = useState<PrimaryContext>('store');
  const [storeScope, setStoreScope] = useState<StoreScope>('firm');

  const [dateMode, setDateMode] = useState<DateMode>('month');
  const [month, setMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [startDate, setStartDate] = useState(() =>
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(() =>
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );

  const campaignsQuery = useCampaigns({ page: 1, limit: 100 });
  const campaigns = useMemo(
    () => campaignsQuery.data?.data ?? [],
    [campaignsQuery.data?.data]
  );

  const stores = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const c of campaigns) {
      if (c.storeId && c.store?.name) {
        map.set(c.storeId, { id: c.storeId, name: c.store.name });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [campaigns]);

  const [storeId, setStoreId] = useState<string | undefined>(undefined);
  const [campaignId, setCampaignId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!campaignId && campaigns.length) {
      setCampaignId(campaigns[0].id);
    }
  }, [campaignId, campaigns]);

  useEffect(() => {
    if (!storeId && stores.length) {
      setStoreId(stores[0].id);
    }
  }, [storeId, stores]);

  const dashboardQueryParams = useMemo((): AnalyticsDashboardQuery => {
    const firmId = user?.firm?.id;

    return {
      contextType:
        primaryContext === 'campaign'
          ? 'campaign'
          : storeScope === 'firm'
            ? 'firm'
            : 'store',
      firmId,
      storeId:
        primaryContext === 'store' && storeScope === 'store'
          ? storeId
          : undefined,
      campaignId: primaryContext === 'campaign' ? campaignId : undefined,
      dateMode,
      month: dateMode === 'month' ? month : undefined,
      startDate: dateMode === 'range' ? startDate : undefined,
      endDate: dateMode === 'range' ? endDate : undefined,
    };
  }, [
    user?.firm?.id,
    primaryContext,
    storeScope,
    storeId,
    campaignId,
    dateMode,
    month,
    startDate,
    endDate,
  ]);

  const dashboardQuery = useAnalyticsDashboard(dashboardQueryParams, {
    compare: true,
  });

  const performanceQuery = usePerformanceMetrics(dashboardQueryParams);

  const currentSummary = useMemo(() => {
    const current = dashboardQuery.data?.current;
    return (current?.summary ?? current) as unknown as
      | Record<string, unknown>
      | undefined;
  }, [dashboardQuery.data]);

  const previousSummary = useMemo(() => {
    const previous = dashboardQuery.data?.previous;
    return (previous?.summary ?? previous) as unknown as
      | Record<string, unknown>
      | undefined;
  }, [dashboardQuery.data]);

  const currentMetrics = getRecord(currentSummary, 'metrics');
  const previousMetrics = getRecord(previousSummary, 'metrics');

  const getMetricValue = (
    metrics: Record<string, unknown> | undefined,
    key: string
  ) => {
    const raw = metrics?.[key];
    if (isRecord(raw)) {
      return toNumber(raw.current);
    }
    return toNumber(raw);
  };

  const reachCurrent = getMetricValue(currentMetrics, 'reach');
  const reachPrevious = getMetricValue(previousMetrics, 'reach');

  const engagementCurrent = getMetricValue(currentMetrics, 'engagement');
  const engagementPrevious = getMetricValue(previousMetrics, 'engagement');

  const roiCurrent = getMetricValue(currentMetrics, 'roi');
  const roiPrevious = getMetricValue(previousMetrics, 'roi');

  const budgetUtilCurrent = getMetricValue(currentMetrics, 'budgetUtilization');
  const budgetUtilPrevious = getMetricValue(
    previousMetrics,
    'budgetUtilization'
  );

  const campaignsSummary = getRecord(currentSummary, 'campaigns');
  const influencersSummary = getRecord(currentSummary, 'influencers');
  const financialSummary = getRecord(currentSummary, 'financial');

  const campaignTotal = toNumber(campaignsSummary?.total);
  const campaignActive = toNumber(campaignsSummary?.active);
  const campaignCompleted = toNumber(campaignsSummary?.completed);
  const campaignDraft = toNumber(campaignsSummary?.draft);

  const influencerTotal = toNumber(influencersSummary?.total);
  const influencerCold = toNumber(influencersSummary?.cold);
  const influencerActive = toNumber(influencersSummary?.active);
  const influencerFinal = toNumber(influencersSummary?.final);

  const totalBudget = toNumber(financialSummary?.totalBudget);
  const spentBudget = toNumber(financialSummary?.spent);
  const remainingBudget =
    toNumber(financialSummary?.remaining) ??
    (typeof totalBudget === 'number' && typeof spentBudget === 'number'
      ? totalBudget - spentBudget
      : undefined);

  const budgetUtilization =
    toNumber(financialSummary?.budgetUtilization) ??
    (typeof totalBudget === 'number' &&
    totalBudget > 0 &&
    typeof spentBudget === 'number'
      ? (spentBudget / totalBudget) * 100
      : undefined);

  const roiSeries = performanceQuery.data?.roiSeries ?? [];
  const influencerScores = performanceQuery.data?.influencerScores ?? [];
  const instagramLinks = performanceQuery.data?.instagramLinks ?? [];

  const isLoading = dashboardQuery.isLoading || campaignsQuery.isLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Analytics</h2>
            <p className="text-slate-600">
              Monitor performance, ROI, and budget utilization
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Tabs
              value={primaryContext}
              onValueChange={(v) => setPrimaryContext(v as PrimaryContext)}
            >
              <TabsList>
                <TabsTrigger value="store">Store</TabsTrigger>
                <TabsTrigger value="campaign">Campaign</TabsTrigger>
              </TabsList>
            </Tabs>

            {primaryContext === 'store' ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Tabs
                  value={storeScope}
                  onValueChange={(v) => setStoreScope(v as StoreScope)}
                >
                  <TabsList>
                    <TabsTrigger value="firm">Firm</TabsTrigger>
                    <TabsTrigger value="store">Store</TabsTrigger>
                  </TabsList>
                </Tabs>

                {storeScope === 'store' ? (
                  <Select value={storeId} onValueChange={setStoreId}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
              </div>
            ) : (
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger className="w-[260px]">
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={dateMode}
              onValueChange={(v) => setDateMode(v as DateMode)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Date mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="range">Date Range</SelectItem>
              </SelectContent>
            </Select>

            {dateMode === 'month' ? (
              <Input
                className="w-[170px]"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  className="w-[160px]"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  className="w-[160px]"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {!user?.firm && primaryContext === 'store' && storeScope === 'firm' ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6 text-center text-amber-800">
              <p className="mb-2">No firm found for the current user.</p>
              <p className="text-sm">
                Associate your account with a firm to view firm-level analytics.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {primaryContext === 'campaign' &&
        !campaignsQuery.isLoading &&
        campaigns.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-slate-600">
              <p>
                No campaigns found. Create a campaign to view campaign
                analytics.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {primaryContext === 'store' &&
        storeScope === 'store' &&
        !campaignsQuery.isLoading &&
        stores.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-slate-600">
              <p>No stores found for the current firm.</p>
            </CardContent>
          </Card>
        ) : null}

        {/* Comparison widgets */}
        <div className="grid gap-4 md:grid-cols-4">
          <ComparisonWidget
            title="Reach"
            value={reachCurrent}
            previousValue={reachPrevious}
          />
          <ComparisonWidget
            title="Engagement"
            value={engagementCurrent}
            previousValue={engagementPrevious}
          />
          <ComparisonWidget
            title="ROI"
            value={roiCurrent}
            previousValue={roiPrevious}
            format={(v) => `${v.toFixed(2)}%`}
          />
          <ComparisonWidget
            title="Budget Utilization"
            value={budgetUtilCurrent ?? budgetUtilization}
            previousValue={budgetUtilPrevious}
            format={(v) => `${v.toFixed(1)}%`}
          />
        </div>

        {/* Campaign Metrics */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Campaign Metrics
          </h3>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-900">
                    {isLoading ? '—' : (campaignTotal?.toLocaleString() ?? '—')}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Total Campaigns</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">
                    {isLoading
                      ? '—'
                      : (campaignActive?.toLocaleString() ?? '—')}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Active Campaigns
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-emerald-600">
                    {isLoading
                      ? '—'
                      : (campaignCompleted?.toLocaleString() ?? '—')}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-600">
                    {isLoading ? '—' : (campaignDraft?.toLocaleString() ?? '—')}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Drafts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Influencer Metrics */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Influencer Pipeline
          </h3>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-900">
                    {isLoading
                      ? '—'
                      : (influencerTotal?.toLocaleString() ?? '—')}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Total Influencers
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-600">
                    {isLoading
                      ? '—'
                      : (influencerCold?.toLocaleString() ?? '—')}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Cold Leads</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-amber-600">
                    {isLoading
                      ? '—'
                      : (influencerActive?.toLocaleString() ?? '—')}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Active</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-emerald-600">
                    {isLoading
                      ? '—'
                      : (influencerFinal?.toLocaleString() ?? '—')}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Converted</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Financial Metrics */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Financial Overview
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-600">
                    Total Budget
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {typeof totalBudget === 'number'
                      ? `$${(totalBudget / 1000).toFixed(0)}K`
                      : '—'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-600">
                    Total Spent
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {typeof spentBudget === 'number'
                      ? `$${(spentBudget / 1000).toFixed(0)}K`
                      : '—'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-600">
                    Remaining Budget
                  </p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {typeof remainingBudget === 'number'
                      ? `$${(remainingBudget / 1000).toFixed(0)}K`
                      : '—'}
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
                <p className="text-sm font-medium text-slate-600">
                  Budget Used
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {typeof budgetUtilization === 'number'
                    ? `${budgetUtilization.toFixed(1)}%`
                    : '—'}
                </p>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                  style={{ width: `${Math.min(100, budgetUtilization ?? 0)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>
                  {typeof spentBudget === 'number'
                    ? `$${(spentBudget / 1000).toFixed(1)}K spent`
                    : '—'}
                </span>
                <span>
                  {typeof totalBudget === 'number'
                    ? `$${(totalBudget / 1000).toFixed(1)}K total`
                    : '—'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <CampaignRoiChart
            data={roiSeries}
            isLoading={performanceQuery.isLoading}
          />
          <InfluencerPerformanceScoring
            scores={influencerScores}
            isLoading={performanceQuery.isLoading}
          />
        </div>

        <InstagramLinkTracking
          links={instagramLinks}
          isLoading={performanceQuery.isLoading}
        />

        {dashboardQuery.isError ? (
          <Card className="border-rose-200 bg-rose-50">
            <CardContent className="pt-6 text-center text-rose-700">
              <p>Unable to load analytics data. Please try again.</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
