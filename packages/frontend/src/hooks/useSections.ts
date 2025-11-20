import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/client';

export const useSections = () => {
  return useQuery({
    queryKey: ['sections'],
    queryFn: () => authApi.getSections(),
    retry: 1,
    staleTime: 0, // Always consider data stale to refetch on mount
    refetchOnMount: 'always', // Always refetch when component mounts
  });
};

