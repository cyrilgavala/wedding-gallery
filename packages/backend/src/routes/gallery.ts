import { Router, Request, Response } from 'express';
import { configService } from '../services/config.service';
import { dropboxService } from '../services/dropbox.service';
import { logger } from '../utils/logger';

export const galleryRouter = Router();

// Get photos for a specific section (requires authentication)
galleryRouter.get('/:sectionId/photos', async (req: Request, res: Response) => {
  const { sectionId } = req.params;

  try {
    logger.info('Fetching photos for section', { sectionId });

    // Check if user is authorized for this section
    const authorizedSections = req.session.authorizedSections || [];
    if (!authorizedSections.includes(sectionId)) {
      logger.warn('Unauthorized photo access attempt', { sectionId, authorizedSections });
      return res.status(403).json({ error: 'Unauthorized access to this section' });
    }

    const section = configService.getSectionById(sectionId);
    if (!section) {
      logger.warn('Section not found', { sectionId });
      return res.status(404).json({ error: 'Section not found' });
    }

    logger.debug('Listing photos from Dropbox', {
      sectionId,
      sectionName: section.name,
      dropboxPath: section.dropboxPath
    });

    const photos = await dropboxService.listPhotos(section.dropboxPath);

    logger.info('Photos fetched successfully', {
      sectionId,
      sectionName: section.name,
      photoCount: photos.length
    });

    res.json({
      section: { id: section.id, name: section.name },
      photos,
      count: photos.length
    });
  } catch (error) {
    logger.error('Error fetching photos', error, { sectionId });
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Get temporary download/preview link for a photo
galleryRouter.post('/:sectionId/photo-url', async (req: Request, res: Response) => {
  const { sectionId } = req.params;
  const { photoPath } = req.body;

  try {
    logger.info('Fetching photo URL', { sectionId, photoPath });

    // Check if user is authorized for this section
    const authorizedSections = req.session.authorizedSections || [];
    if (!authorizedSections.includes(sectionId)) {
      logger.warn('Unauthorized photo URL access attempt', { sectionId, photoPath });
      return res.status(403).json({ error: 'Unauthorized access to this section' });
    }

    if (!photoPath) {
      logger.warn('Missing photo path in request', { sectionId });
      return res.status(400).json({ error: 'Photo path is required' });
    }

    const section = configService.getSectionById(sectionId);
    if (!section) {
      logger.warn('Section not found', { sectionId });
      return res.status(404).json({ error: 'Section not found' });
    }

    // Verify the photo path belongs to the section's folder
    if (!photoPath.startsWith(section.dropboxPath)) {
      logger.warn('Invalid photo path - path traversal attempt detected', {
        sectionId,
        photoPath,
        expectedPrefix: section.dropboxPath
      });
      return res.status(403).json({ error: 'Invalid photo path for this section' });
    }

    logger.debug('Generating temporary URLs from Dropbox', { sectionId, photoPath });

    const urls = await dropboxService.getPhotoWithUrls(photoPath);

    logger.info('Photo URL generated successfully', { sectionId, photoPath });

    res.json({
      photoPath,
      ...urls
    });
  } catch (error) {
    logger.error('Error fetching photo URL', error, { sectionId, photoPath });
    res.status(500).json({ error: 'Failed to fetch photo URL' });
  }
});

// Get thumbnails for multiple photos (batch)
galleryRouter.post('/:sectionId/thumbnails', async (req: Request, res: Response) => {
  const { sectionId } = req.params;
  const { paths } = req.body;

  try {
    logger.info('Fetching thumbnails batch', {
      sectionId,
      pathCount: Array.isArray(paths) ? paths.length : 0
    });

    // Check if user is authorized for this section
    const authorizedSections = req.session.authorizedSections || [];
    if (!authorizedSections.includes(sectionId)) {
      logger.warn('Unauthorized thumbnails access attempt', { sectionId });
      return res.status(403).json({ error: 'Unauthorized access to this section' });
    }

    if (!Array.isArray(paths)) {
      logger.warn('Invalid paths parameter - not an array', { sectionId, pathsType: typeof paths });
      return res.status(400).json({ error: 'Paths array is required' });
    }

    const section = configService.getSectionById(sectionId);
    if (!section) {
      logger.warn('Section not found', { sectionId });
      return res.status(404).json({ error: 'Section not found' });
    }

    // Verify all photo paths belong to the section's folder
    for (const path of paths) {
      if (!path.startsWith(section.dropboxPath)) {
        logger.warn('Invalid thumbnail path - path traversal attempt detected', {
          sectionId,
          invalidPath: path,
          expectedPrefix: section.dropboxPath
        });
        return res.status(403).json({ error: 'Invalid photo path for this section' });
      }
    }

    logger.debug('Fetching thumbnail batch from Dropbox', {
      sectionId,
      pathCount: paths.length,
      batchSize: Math.ceil(paths.length / 25)
    });

    const thumbnails = await dropboxService.getThumbnailBatch(paths);
    
    logger.info('Thumbnails fetched successfully', {
      sectionId,
      requestedCount: paths.length,
      receivedCount: thumbnails.size
    });

    res.json({ thumbnails: Object.fromEntries(thumbnails) });
  } catch (error) {
    logger.error('Error fetching thumbnails', error, {
      sectionId,
      pathCount: Array.isArray(paths) ? paths.length : 0
    });
    res.status(500).json({ error: 'Failed to fetch thumbnails' });
  }
});

// Get all authorized galleries overview
galleryRouter.get('/overview', async (req: Request, res: Response) => {
  try {
    const authorizedSections = req.session.authorizedSections || [];

    logger.info('Fetching galleries overview', {
      authorizedSectionsCount: authorizedSections.length
    });

    if (authorizedSections.length === 0) {
      logger.debug('No authorized sections - returning empty galleries');
      return res.json({ galleries: [] });
    }

    logger.debug('Fetching gallery data for authorized sections', {
      sectionIds: authorizedSections
    });

    const galleries = await Promise.all(
      authorizedSections.map(async (sectionId: string) => {
        const section = configService.getSectionById(sectionId);
        if (!section) {
          logger.warn('Authorized section not found in config', { sectionId });
          return null;
        }

        try {
          logger.debug('Fetching photos for overview', {
            sectionId,
            sectionName: section.name
          });

          const photos = await dropboxService.listPhotos(section.dropboxPath);

          logger.debug('Gallery overview data retrieved', {
            sectionId,
            photoCount: photos.length
          });

          return {
            id: section.id,
            name: section.name,
            photoCount: photos.length,
            previewPhoto: photos[0] || null
          };
        } catch (error) {
          logger.error(`Error fetching overview for section`, error, {
            sectionId,
            sectionName: section.name
          });
          return {
            id: section.id,
            name: section.name,
            photoCount: 0,
            previewPhoto: null,
            error: 'Failed to load photos'
          };
        }
      })
    );

    const validGalleries = galleries.filter((g: any) => g !== null);

    logger.info('Galleries overview fetched successfully', {
      totalGalleries: validGalleries.length,
      galleriesWithErrors: validGalleries.filter((g: any) => g.error).length
    });

    res.json({
      galleries: validGalleries
    });
  } catch (error) {
    logger.error('Error fetching gallery overview', error);
    res.status(500).json({ error: 'Failed to fetch gallery overview' });
  }
});

