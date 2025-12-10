import { useMutation, useQuery } from '@tanstack/react-query';
import {
  scrapeProfileRequest,
  getRunStatusRequest,
  getRunResultsRequest,
  createInfluencerFromScrapedDataRequest,
} from '../api/client';
import {
  ScrapeProfileRequest,
  ScrapeProfileResponse,
  RunStatusResponse,
  ApifyRunResult,
  InstagramProfileData,
} from '../types/models';

export function useScrapeProfile() {
  return useMutation<ScrapeProfileResponse, Error, ScrapeProfileRequest>({
    mutationFn: scrapeProfileRequest,
  });
}

export function useRunStatus(runId: string, enabled: boolean = true) {
  return useQuery<RunStatusResponse, Error>({
    queryKey: ['apify-run-status', runId],
    queryFn: () => getRunStatusRequest(runId),
    enabled: enabled && !!runId,
    refetchInterval: (data) => {
      // Poll every 2 seconds if running, every 5 seconds if created/ready
      if (data?.status === 'RUNNING') {
        return 2000;
      }
      if (data?.status === 'CREATED' || data?.status === 'READY') {
        return 5000;
      }
      return false; // Stop polling when completed/failed
    },
  });
}

export function useRunResults(runId: string, enabled: boolean = true) {
  return useQuery<ApifyRunResult, Error>({
    queryKey: ['apify-run-results', runId],
    queryFn: () => getRunResultsRequest(runId),
    enabled: enabled && !!runId,
    retry: false,
  });
}

export function useCreateInfluencerFromScrapedData() {
  return useMutation<
    Record<string, unknown>,
    Error,
    {
      scrapedData: InstagramProfileData;
      additionalData?: Record<string, unknown>;
    }
  >({
    mutationFn: ({ scrapedData, additionalData }) =>
      createInfluencerFromScrapedDataRequest(scrapedData, additionalData),
  });
}
