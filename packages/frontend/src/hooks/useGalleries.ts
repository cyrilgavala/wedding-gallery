import { useQuery } from '@tanstack/react-query';
import { galleryApi } from '../api/client';

export const useGalleries = () => {
  return useQuery({
    queryKey: ['galleries'],
    queryFn: () => galleryApi.getOverview(),
    retry: 1,
    staleTime: 0, // Always consider data stale
    refetchOnMount: 'always', // Always refetch when component mounts
  });
};

