import { useQuery } from '@tanstack/react-query';
import { galleryApi } from '../api/client';

export const usePhotos = (sectionId: string | undefined) => {
  return useQuery({
    queryKey: ['photos', sectionId],
    queryFn: async () => {
      if (!sectionId) throw new Error('No section ID');
      return await galleryApi.getPhotos(sectionId);
    },
    enabled: !!sectionId,
    retry: 1,
    staleTime:  30 * 60 * 1000, // Cache for 30 minutes
  });
};

