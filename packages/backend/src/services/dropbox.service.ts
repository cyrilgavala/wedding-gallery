import { Dropbox } from 'dropbox';
import { configService } from './config.service';
import { logger } from '../utils/logger';

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

class DropboxService {
  private client: Dropbox | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    const config = configService.getDropboxConfig();

    logger.info('Initializing Dropbox client', {
      hasAccessToken: !!config.accessToken,
      hasAppKey: !!config.appKey,
      hasAppSecret: !!config.appSecret
    });

    if (!config.accessToken) {
      logger.error('Dropbox access token not configured - service will not work!');
      return;
    }

    this.client = new Dropbox({
      accessToken: config.accessToken,
      clientId: config.appKey,
      clientSecret: config.appSecret
    });

    logger.info('Dropbox client initialized successfully');
  }

  async listPhotos(folderPath: string): Promise<Photo[]> {
    if (!this.client) {
      logger.error('Dropbox client not initialized - cannot list photos');
      throw new Error('Dropbox client not initialized');
    }

    logger.debug('Listing photos from Dropbox folder', { folderPath });

    try {
      const response = await this.client.filesListFolder({
        path: folderPath,
        recursive: false
      });

      logger.debug('Dropbox folder listed', {
        folderPath,
        totalEntries: response.result.entries.length
      });

      const photos: Photo[] = [];

      for (const entry of response.result.entries) {
        if (entry['.tag'] === 'file' && this.isImageFile(entry.name)) {
          photos.push({
            id: entry.id,
            name: entry.name,
            path: entry.path_display || entry.path_lower || '',
            size: (entry as any).size,
            modifiedTime: (entry as any).client_modified
          });
        }
      }

      logger.info('Photos listed successfully', {
        folderPath,
        totalEntries: response.result.entries.length,
        imageFiles: photos.length
      });

      return photos.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      logger.error('Error listing photos from Dropbox', error, { folderPath });
      throw new Error('Failed to fetch photos from Dropbox');
    }
  }

  async getThumbnailBatch(paths: string[]): Promise<Map<string, string>> {
    if (!this.client) {
      logger.error('Dropbox client not initialized - cannot get thumbnails');
      throw new Error('Dropbox client not initialized');
    }

    const BATCH_SIZE = 25;
    const thumbnails = new Map<string, string>();

    logger.debug('Starting thumbnail batch processing', {
      totalPaths: paths.length,
      batchCount: Math.ceil(paths.length / BATCH_SIZE)
    });

    try {
      // Process paths in batches of 25
      for (let i = 0; i < paths.length; i += BATCH_SIZE) {
        const batchPaths = paths.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

        logger.debug('Processing thumbnail batch', {
          batchNumber,
          batchSize: batchPaths.length,
          startIndex: i
        });

        const entries = batchPaths.map(path => ({
          format: { '.tag': 'jpeg' as const },
          path,
          size: { '.tag': 'w256h256' as const }
        }));

        const response = await this.client.filesGetThumbnailBatch({
          entries
        });

        let successCount = 0;
        for (const entry of response.result.entries) {
          if (entry['.tag'] === 'success') {
            thumbnails.set(entry.metadata.path_lower!, `data:image/jpeg;base64,${entry.thumbnail}`);
            successCount++;
          } else {
            logger.warn('Thumbnail fetch failed for entry', {
              tag: entry['.tag'],
              batchNumber
            });
          }
        }

        logger.debug('Thumbnail batch processed', {
          batchNumber,
          successCount,
          failedCount: batchPaths.length - successCount
        });
      }

      logger.info('Thumbnail batch processing complete', {
        totalRequested: paths.length,
        totalReceived: thumbnails.size,
        successRate: `${((thumbnails.size / paths.length) * 100).toFixed(1)}%`
      });

      return thumbnails;
    } catch (error) {
      logger.error('Error getting thumbnail batch', error, {
        totalPaths: paths.length
      });
      throw error;
    }
  }

  async getTemporaryLink(path: string): Promise<string> {
    if (!this.client) {
      logger.error('Dropbox client not initialized - cannot get temporary link');
      throw new Error('Dropbox client not initialized');
    }

    logger.debug('Requesting temporary link from Dropbox', { path });

    try {
      const response = await this.client.filesGetTemporaryLink({ path });

      logger.debug('Temporary link generated', {
        path,
        linkLength: response.result.link.length
      });

      return response.result.link;
    } catch (error) {
      logger.error('Error getting temporary link', error, { path });
      throw new Error('Failed to get temporary link');
    }
  }

  async getPhotoWithUrls(path: string): Promise<Partial<Photo>> {
    logger.debug('Getting photo with URLs', { path });

    try {
      const downloadUrl = await this.getTemporaryLink(path);

      logger.debug('Photo URLs generated', { path });

      return {
        downloadUrl,
        previewUrl: downloadUrl // Can be the same for simplicity
      };
    } catch (error) {
      logger.error('Error getting photo URLs', error, { path });
      return {};
    }
  }

  private isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(ext);
  }
}

export const dropboxService = new DropboxService();

