import { useQuery } from '@tanstack/react-query';
import { galleryApi } from '../api/client';

export const usePhotoUrl = (
  sectionId: string | undefined,
  photoPath: string | undefined
) => {
  return useQuery({
    queryKey: ['photoUrl', sectionId, photoPath],
    queryFn: async () => {
      if (!sectionId || !photoPath) return null;
      try {
        const urlData = await galleryApi.getPhotoUrl(sectionId, photoPath);
        return urlData.downloadUrl || '';
      } catch (error) {
        console.error('Failed to load photo URL:', error);
        return '';
      }
    },
    enabled: !!sectionId && !!photoPath,
    retry: 1,
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
};

