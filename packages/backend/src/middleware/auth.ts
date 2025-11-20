import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    authorizedSections: string[];
  }
}

export const requireAuth = (sectionId: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.authorizedSections?.includes(sectionId)) {
      return res.status(403).json({ error: 'Unauthorized access to this section' });
    }
    next();
  };
};

export const hasAnyAuthorization = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.authorizedSections || req.session.authorizedSections.length === 0) {
    return res.status(401).json({ error: 'No authorized sections' });
  }
  next();
};

