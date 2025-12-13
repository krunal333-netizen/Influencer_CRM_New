export type AnalyticsContextType = 'firm' | 'store' | 'campaign';

export type AnalyticsDateMode = 'month' | 'range';

export interface AnalyticsDashboardQuery {
  contextType: AnalyticsContextType;
  firmId?: string;
  storeId?: string;
  campaignId?: string;
  dateMode?: AnalyticsDateMode;
  month?: string; // yyyy-MM
  startDate?: string; // yyyy-MM-dd
  endDate?: string; // yyyy-MM-dd
}

export interface MetricComparison {
  current: number;
  previous?: number;
}

export interface AnalyticsDashboardSummary {
  campaigns?: {
    total?: number;
    active?: number;
    completed?: number;
    draft?: number;
  };
  influencers?: {
    total?: number;
    cold?: number;
    active?: number;
    final?: number;
  };
  financial?: {
    totalBudget?: number;
    spent?: number;
    remaining?: number;
    revenue?: number;
    expenses?: number;
    budgetUtilization?: number;
  };
  metrics?: {
    reach?: MetricComparison;
    engagement?: MetricComparison;
    roi?: MetricComparison;
    budgetUtilization?: MetricComparison;
  };
}

export interface AnalyticsDashboardResponse {
  contextType?: AnalyticsContextType;
  firmId?: string | null;
  storeId?: string | null;
  campaignId?: string | null;
  dateMode?: AnalyticsDateMode;
  month?: string;
  startDate?: string;
  endDate?: string;
  summary?: AnalyticsDashboardSummary;
}

export interface RoiSeriesPoint {
  period: string;
  revenue?: number;
  spend?: number;
  roi?: number;
}

export interface InfluencerPerformanceScore {
  influencerId: string;
  influencerName: string;
  score: number;
  reach?: number;
  engagementRate?: number;
  roi?: number;
}

export interface InstagramLinkMetric {
  url: string;
  clicks?: number;
  conversions?: number;
  revenue?: number;
  influencerName?: string;
  campaignName?: string;
}

export interface PerformanceMetricsResponse {
  contextType?: AnalyticsContextType;
  firmId?: string | null;
  storeId?: string | null;
  campaignId?: string | null;
  dateMode?: AnalyticsDateMode;
  month?: string;
  startDate?: string;
  endDate?: string;
  roiSeries?: RoiSeriesPoint[];
  influencerScores?: InfluencerPerformanceScore[];
  instagramLinks?: InstagramLinkMetric[];
}
