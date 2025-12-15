
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, getAds, getScheduleEntries, getTrends, getLibraryItems } from '../services/core/db';
import { Post, Ad, ScheduleEntry, Trend, LibraryItem } from '../types';

// Query Keys
export const QUERY_KEYS = {
  dashboard: 'dashboard',
  posts: 'posts',
  ads: 'ads',
  schedule: 'schedule',
  trends: 'trends',
  library: 'library',
};

// --- Hooks ---

export const useDashboardData = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.dashboard, userId],
    queryFn: async () => {
      // Parallel fetching for dashboard
      const [posts, ads, schedule, trends] = await Promise.all([
        getPosts(userId),
        getAds(userId),
        getScheduleEntries(userId),
        getTrends(userId),
      ]);
      return { posts, ads, schedule, trends };
    },
  });
};

export const usePosts = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.posts, userId],
    queryFn: () => getPosts(userId),
  });
};

export const useAds = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ads, userId],
    queryFn: () => getAds(userId),
  });
};

export const useSchedule = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.schedule, userId],
    queryFn: () => getScheduleEntries(userId),
  });
};

export const useTrends = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.trends, userId],
    queryFn: () => getTrends(userId),
  });
};

export const useLibrary = (userId: string, tags?: string[]) => {
  return useQuery({
    queryKey: [QUERY_KEYS.library, userId, tags],
    queryFn: () => getLibraryItems(userId, tags),
  });
};
