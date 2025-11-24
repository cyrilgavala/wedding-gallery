import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import session from 'express-session';
import path from 'path';
import { authRouter } from './routes/auth';
import { galleryRouter } from './routes/gallery';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3001;

logger.info('Starting Wedding Gallery Backend', {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: PORT,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
});

// Middleware
// Configure Helmet with relaxed CSP for production static assets
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? false : undefined,
  crossOriginEmbedderPolicy: false
}));
logger.debug('Helmet security headers enabled');

app.use(compression());
logger.debug('Response compression enabled');

// CORS configuration - handle both development and production
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));
logger.debug('CORS configured', { origin: corsOrigin });

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    };

    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
});

// In production, trust the proxy (Heroku uses proxies) - MUST be set before session
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  logger.debug('Trust proxy enabled for production');
}

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || 'fallback-secret-change-in-production';
if (!process.env.SESSION_SECRET) {
  logger.warn('SESSION_SECRET not set - using fallback (NOT PRODUCTION SAFE!)');
}

const sessionConfig = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' as const
  }
};

app.use(session(sessionConfig));
logger.debug('Session management configured', {
  secure: sessionConfig.cookie.secure,
  sameSite: sessionConfig.cookie.sameSite,
  maxAge: '24 hours',
  trustProxy: process.env.NODE_ENV === 'production'
});

// Serve static files from frontend build in production (BEFORE API routes)
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  logger.info('Serving static files from', { path: frontendPath });

  // Serve static files with proper MIME types
  app.use(express.static(frontendPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Ensure correct MIME types for assets
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
    }
  }));
}

// API Routes
app.get('/api/health', (req, res) => {
  logger.debug('Health check requested');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/gallery', galleryRouter);
logger.info('Routes registered', {
  routes: ['/api/health', '/api/auth', '/api/gallery']
});

// SPA fallback - serve index.html for all non-API routes (AFTER API routes)
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info('Wedding Gallery Backend started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});





