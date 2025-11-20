# React Query Hooks Organization

This document describes the custom hooks created to organize and extract all `useQuery` logic.

## Hooks Directory Structure

```
src/hooks/
├── index.ts              # Barrel export file
├── useAuthStatus.ts      # Auth status query
├── useGalleries.ts       # Galleries overview query
├── usePhotoUrl.ts        # Single photo URL query
├── usePhotos.ts          # Photos list query
├── useSections.ts        # Sections list query
└── useThumbnails.ts      # Thumbnails batch query
```

## Hook Descriptions

### `useAuthStatus()`
- **Purpose**: Fetch current authentication status
- **Returns**: `{ data: authStatus, isLoading, refetch }`
- **Used in**: `App.tsx`
- **Cache Key**: `['authStatus']`

### `useSections()`
- **Purpose**: Fetch all gallery sections
- **Returns**: `{ data: sectionsData, isLoading, refetch }`
- **Used in**: `Home.tsx`
- **Cache Key**: `['sections']`

### `useGalleries()`
- **Purpose**: Fetch galleries overview
- **Returns**: `{ data: galleriesData, isLoading, refetch }`
- **Used in**: `Home.tsx`
- **Cache Key**: `['galleries']`

### `usePhotos(sectionId)`
- **Purpose**: Fetch photos for a specific section
- **Parameters**: 
  - `sectionId: string | undefined` - The section ID to fetch photos from
- **Returns**: `{ data: photosData, isLoading, error }`
- **Used in**: `GalleryView.tsx`
- **Cache Key**: `['photos', sectionId]`
- **Enabled**: Only when `sectionId` is provided

### `useThumbnails(sectionId, paths, enabled)`
- **Purpose**: Fetch thumbnails in batch for multiple photos
- **Parameters**: 
  - `sectionId: string | undefined` - The section ID
  - `paths: string[]` - Array of photo paths
  - `enabled: boolean` - Whether to enable the query
- **Returns**: `{ data: thumbnails, isLoading }`
- **Used in**: `GalleryView.tsx`
- **Cache Key**: `['thumbnails', sectionId, paths.length]`
- **Enabled**: When `sectionId` exists, `enabled` is true, and paths array has items

### `usePhotoUrl(sectionId, photoPath)`
- **Purpose**: Fetch download URL for a single photo
- **Parameters**: 
  - `sectionId: string | undefined` - The section ID
  - `photoPath: string | undefined` - Path to the photo
- **Returns**: `{ data: photoUrlData, isLoading }`
- **Used in**: `GalleryView.tsx`
- **Cache Key**: `['photoUrl', sectionId, photoPath]`
- **Enabled**: Only when both `sectionId` and `photoPath` are provided
- **Stale Time**: 5 minutes (cached for performance)

## Usage Examples

### Basic Usage
```typescript
import { usePhotos } from '../hooks';

const { data, isLoading, error } = usePhotos(sectionId);
```

### With Refetch
```typescript
import { useSections } from '../hooks';

const { data, isLoading, refetch } = useSections();

// Later...
await refetch();
```

### Dependent Queries
```typescript
import { usePhotos, useThumbnails } from '../hooks';

// First, get photos
const { data: photosData } = usePhotos(sectionId);
const paths = photosData?.photos.map(p => p.path) || [];

// Then, get thumbnails (only runs after photos are loaded)
const { data: thumbnails } = useThumbnails(
  sectionId, 
  paths, 
  !!photosData?.photos.length
);
```

## Benefits

1. **Code Organization**: All query logic is centralized and reusable
2. **Type Safety**: TypeScript interfaces ensure correct usage
3. **Consistency**: Same query keys and options across the app
4. **Maintainability**: Easy to update query logic in one place
5. **Testability**: Hooks can be tested independently
6. **DRY Principle**: No duplicate query logic across components

