import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import session from 'express-session';
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
app.use(helmet());
logger.debug('Helmet security headers enabled');

app.use(compression());
logger.debug('Response compression enabled');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
logger.debug('CORS configured', { origin: process.env.CORS_ORIGIN || 'http://localhost:5173' });

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

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || 'fallback-secret-change-in-production';
if (!process.env.SESSION_SECRET) {
  logger.warn('SESSION_SECRET not set - using fallback (NOT PRODUCTION SAFE!)');
}

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
logger.debug('Session management configured', {
  secure: process.env.NODE_ENV === 'production',
  maxAge: '24 hours'
});

// Routes
app.get('/api/health', (req, res) => {
  logger.debug('Health check requested');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/gallery', galleryRouter);
logger.info('Routes registered', {
  routes: ['/api/health', '/api/auth', '/api/gallery']
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info('Wedding Gallery Backend started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});





