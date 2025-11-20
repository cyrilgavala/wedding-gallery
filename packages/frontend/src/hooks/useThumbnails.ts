import { useQuery } from '@tanstack/react-query';
import { galleryApi } from '../api/client';

export const useThumbnails = (
  sectionId: string | undefined,
  paths: string[],
  enabled: boolean
) => {
  return useQuery({
    queryKey: ['thumbnails', sectionId, paths.length],
    queryFn: async () => {
      if (!sectionId || !paths.length) return {};
      try {
        return await galleryApi.getThumbnails(sectionId, paths);
      } catch (error) {
        console.error('Failed to load thumbnails:', error);
        return {};
      }
    },
    enabled: !!sectionId && enabled && paths.length > 0,
    retry: 1,
    staleTime:  30 * 60 * 1000, // Cache for 30 minutes
  });
};

