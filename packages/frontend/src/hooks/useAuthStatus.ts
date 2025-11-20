import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/client';

export const useAuthStatus = () => {
  return useQuery({
    queryKey: ['authStatus'],
    queryFn: () => authApi.getStatus(),
    staleTime: 0, // Always consider data stale
    refetchOnMount: 'always', // Always refetch when component mounts
  });
};

