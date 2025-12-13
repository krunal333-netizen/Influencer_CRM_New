import { useQuery } from '@tanstack/react-query';
import { differenceInCalendarDays, parseISO, subDays, subMonths } from 'date-fns';
import {
  getAnalyticsDashboardRequest,
  getPerformanceMetricsRequest,
} from '../api/client';
import { AnalyticsDashboardQuery, AnalyticsDashboardResponse } from '../types/analytics';

export interface AnalyticsDashboardCompareResult {
  current: AnalyticsDashboardResponse;
  previous?: AnalyticsDashboardResponse;
}

const buildPreviousQuery = (
  query: AnalyticsDashboardQuery
): AnalyticsDashboardQuery | undefined => {
  if (query.month) {
    const d = parseISO(`${query.month}-01`);
    const previousMonth = subMonths(d, 1);
    const previousMonthKey = `${previousMonth.getFullYear()}-${String(
      previousMonth.getMonth() + 1
    ).padStart(2, '0')}`;

    return {
      ...query,
      month: previousMonthKey,
      startDate: undefined,
      endDate: undefined,
      dateMode: 'month',
    };
  }

  if (query.startDate && query.endDate) {
    const start = parseISO(query.startDate);
    const end = parseISO(query.endDate);
    const days = differenceInCalendarDays(end, start);

    const previousEnd = subDays(start, 1);
    const previousStart = subDays(previousEnd, days);

    return {
      ...query,
      startDate: previousStart.toISOString().slice(0, 10),
      endDate: previousEnd.toISOString().slice(0, 10),
      month: undefined,
      dateMode: 'range',
    };
  }

  return undefined;
};

const isQueryReady = (query: AnalyticsDashboardQuery) => {
  switch (query.contextType) {
    case 'firm':
      return Boolean(query.firmId);
    case 'store':
      return Boolean(query.storeId);
    case 'campaign':
      return Boolean(query.campaignId);
    default:
      return false;
  }
};

export const useAnalyticsDashboard = (
  query: AnalyticsDashboardQuery,
  options: { compare?: boolean } = { compare: true }
) => {
  return useQuery({
    queryKey: ['analytics-dashboard', query, options.compare],
    queryFn: async (): Promise<AnalyticsDashboardCompareResult> => {
      const current = await getAnalyticsDashboardRequest(query);

      if (!options.compare) {
        return { current };
      }

      const previousQuery = buildPreviousQuery(query);
      if (!previousQuery) {
        return { current };
      }

      const previous = await getAnalyticsDashboardRequest(previousQuery);
      return { current, previous };
    },
    enabled: isQueryReady(query),
  });
};

export const usePerformanceMetrics = (query: AnalyticsDashboardQuery) => {
  return useQuery({
    queryKey: ['performance-metrics', query],
    queryFn: async () => {
      return getPerformanceMetricsRequest(query);
    },
    enabled: isQueryReady(query),
  });
};
