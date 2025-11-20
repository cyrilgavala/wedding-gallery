import axios from 'axios';
import { queryClient } from './queryClient';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 or 403, the session has likely expired
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear all cached queries to force refetch
      queryClient.invalidateQueries();
    }
    return Promise.reject(error);
  }
);

export interface Section {
  id: string;
  name: string;
  isAuthorized?: boolean;
}

export interface Photo {
  id: string;
  name: string;
  path: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  downloadUrl?: string;
  size?: number;
  modifiedTime?: string;
}

export interface Gallery {
  id: string;
  name: string;
  photoCount: number;
  error?: string;
}

// Auth endpoints
export const authApi = {
  getSections: async () => {
    const response = await api.get<{ sections: Section[] }>('/auth/sections');
    return response.data;
  },

  verifyPassphrase: async (sectionId: string, passphrase: string) => {
    const response = await api.post('/auth/verify', { sectionId, passphrase });
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get<{ isAuthenticated: boolean; authorizedSections: string[] }>(
      '/auth/status'
    );
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

// Gallery endpoints
export const galleryApi = {
  getPhotos: async (sectionId: string) => {
    const response = await api.get<{ section: Section; photos: Photo[]; count: number }>(
      `/gallery/${sectionId}/photos`
    );
    return response.data;
  },

  getPhotoUrl: async (sectionId: string, photoPath: string) => {
    const response = await api.post<{ photoPath: string; downloadUrl?: string; previewUrl?: string }>(
      `/gallery/${sectionId}/photo-url`,
      { photoPath }
    );
    return response.data;
  },

  getThumbnails: async (sectionId: string, paths: string[]): Promise<Record<string, string>> => {
    const response = await api.post<{ thumbnails: Record<string, string> }>(
      `/gallery/${sectionId}/thumbnails`,
      { paths }
    );
    return response.data.thumbnails;
  },

  getOverview: async () => {
    const response = await api.get<{ galleries: Gallery[] }>('/gallery/overview');
    return response.data;
  }
};
