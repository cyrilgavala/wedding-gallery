import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import { logger } from '../utils/logger';

export interface GallerySection {
  id: string;
  name: string;
  hashedPassphrase: string;
  dropboxPath: string;
}

class ConfigService {
  private sections: GallerySection[] = [];

  constructor() {
    dotenv.config();
    logger.info('ConfigService initializing - loading environment variables');
    this.loadSections();
  }

  private loadSections() {
    const sectionsConfig = process.env.GALLERY_SECTIONS || '';
    const dropboxFolders = process.env.DROPBOX_FOLDERS?.split(',') || [];

    logger.debug('Loading gallery sections configuration', {
      hasSectionsConfig: !!sectionsConfig,
      dropboxFolderCount: dropboxFolders.length
    });

    if (!sectionsConfig) {
      logger.error('No GALLERY_SECTIONS configured in environment variables!');
      return;
    }

    const sectionPairs = sectionsConfig.split(',');

    this.sections = sectionPairs.map((pair, index) => {
      const [name, hashedPassphrase] = pair.split(':');
      const sectionId = name.toLowerCase().trim();
      const dropboxPath = dropboxFolders[index]?.trim() || `/wedding/${sectionId}`;

      logger.debug('Loaded gallery section', {
        id: sectionId,
        name: name.trim(),
        hasDropboxPath: !!dropboxFolders[index],
        dropboxPath
      });

      return {
        id: sectionId,
        name: name.trim(),
        hashedPassphrase: hashedPassphrase.trim(),
        dropboxPath
      };
    });

    logger.info(`Gallery sections loaded successfully`, {
      sectionCount: this.sections.length,
      sections: this.sections.map(s => ({ id: s.id, name: s.name, dropboxPath: s.dropboxPath }))
    });
  }

  getSections(): Array<{ id: string; name: string }> {
    return this.sections.map(({ id, name }) => ({ id, name }));
  }

  getSectionById(id: string): GallerySection | undefined {
    const section = this.sections.find(section => section.id === id);

    if (!section) {
      logger.debug('Section not found', { requestedId: id });
    }

    return section;
  }

  async verifyPassphrase(sectionId: string, passphrase: string): Promise<boolean> {
    const section = this.getSectionById(sectionId);
    if (!section) {
      logger.warn('Passphrase verification failed - section not found', { sectionId });
      return false;
    }

    logger.debug('Verifying passphrase', { sectionId });

    try {
      const isValid = await bcrypt.compare(passphrase, section.hashedPassphrase);

      if (isValid) {
        logger.info('Passphrase verified successfully', { sectionId });
      } else {
        logger.warn('Invalid passphrase provided', { sectionId });
      }

      return isValid;
    } catch (error) {
      logger.error('Error during passphrase verification', error, { sectionId });
      return false;
    }
  }

  getDropboxConfig() {
    const config = {
      accessToken: process.env.DROPBOX_ACCESS_TOKEN,
      appKey: process.env.DROPBOX_CLIENT_ID,
      appSecret: process.env.DROPBOX_CLIENT_SECRET
    };

    logger.debug('Dropbox configuration loaded', {
      hasAccessToken: !!config.accessToken,
      hasAppKey: !!config.appKey,
      hasAppSecret: !!config.appSecret
    });

    return config;
  }
}

export const configService = new ConfigService();

