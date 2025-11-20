import { Router, Request, Response } from 'express';
import { configService } from '../services/config.service';
import { logger } from '../utils/logger';

export const authRouter = Router();

// Get list of available sections (without sensitive data)
authRouter.get('/sections', (req: Request, res: Response) => {
  try {
    logger.info('Fetching sections list');

    const sections = configService.getSections();
    const authorizedSections = req.session.authorizedSections || [];

    const sectionsWithAuth = sections.map(section => ({
      ...section,
      isAuthorized: authorizedSections.includes(section.id)
    }));

    logger.info('Sections fetched successfully', {
      totalSections: sections.length,
      authorizedSections: authorizedSections.length
    });

    res.json({ sections: sectionsWithAuth });
  } catch (error) {
    logger.error('Failed to fetch sections', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Verify passphrase for a section
authRouter.post('/verify', async (req: Request, res: Response) => {
  const { sectionId, passphrase } = req.body;

  try {
    logger.info('Passphrase verification attempt', { sectionId });

    if (!sectionId || !passphrase) {
      logger.warn('Missing required fields for verification', { sectionId: !!sectionId, passphrase: !!passphrase });
      return res.status(400).json({ error: 'Section ID and passphrase are required' });
    }

    const section = configService.getSectionById(sectionId);
    if (!section) {
      logger.warn('Section not found', { sectionId });
      return res.status(404).json({ error: 'Section not found' });
    }

    const isValid = await configService.verifyPassphrase(sectionId, passphrase);

    if (isValid) {
      // Initialize session array if needed
      if (!req.session.authorizedSections) {
        req.session.authorizedSections = [];
      }

      // Add section to authorized list if not already present
      if (!req.session.authorizedSections.includes(sectionId)) {
        req.session.authorizedSections.push(sectionId);
        logger.info('Section access granted', {
          sectionId,
          sectionName: section.name,
          totalAuthorized: req.session.authorizedSections.length
        });
      } else {
        logger.info('Section already authorized', { sectionId });
      }

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            logger.error('Failed to save session', err, { sectionId });
            reject(err);
          } else {
            logger.debug('Session saved successfully', { sectionId });
            resolve();
          }
        });
      });

      res.json({
        success: true,
        message: 'Access granted',
        section: { id: section.id, name: section.name }
      });
    } else {
      logger.warn('Invalid passphrase attempt', { sectionId });
      res.status(401).json({ error: 'Invalid passphrase' });
    }
  } catch (error) {
    logger.error('Verification failed', error, { sectionId });
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Check current authorization status
authRouter.get('/status', (req: Request, res: Response) => {
  const authorizedSections = req.session.authorizedSections || [];

  logger.debug('Auth status check', {
    isAuthenticated: authorizedSections.length > 0,
    sectionCount: authorizedSections.length
  });

  res.json({
    isAuthenticated: authorizedSections.length > 0,
    authorizedSections
  });
});

// Logout (clear session)
authRouter.post('/logout', (req: Request, res: Response) => {
  const authorizedSections = req.session.authorizedSections || [];

  logger.info('Logout initiated', {
    authorizedSectionsCount: authorizedSections.length
  });

  req.session.destroy((err) => {
    if (err) {
      logger.error('Logout failed - session destruction error', err);
      return res.status(500).json({ error: 'Logout failed' });
    }

    logger.info('Logout successful - session destroyed');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});



