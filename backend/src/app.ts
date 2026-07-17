import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import timeout from 'connect-timeout';
import { apiLimiter } from './middleware/rateLimiter';
import errorHandler from './middleware/errorHandler';
import swaggerSpec from './config/swagger';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import logger from './utils/logger';
import env from './config/env';
import requestId from './middleware/requestId';

const app = express();

// Apply request tracing and payload compression early
app.use(requestId);
app.use(compression());
app.use(timeout('30s')); // Request timeout

// ========================
// Security Middleware
// ========================

// Helmet: Security headers (CSP, HSTS, X-Frame-Options, nosniff)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true },
    frameguard: { action: 'deny' },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// Remove X-Powered-By header
app.disable('x-powered-by');

// CORS: Explicit origin whitelist (no wildcards in production)
const allowedOrigins = env.FRONTEND_URL.split(',');
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ========================
// Parsing & Logging
// ========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// HTTP request logging
if (env.NODE_ENV !== 'test') {
  app.use(
    morgan((tokens, req, res) => {
      return JSON.stringify({
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        requestId: req.requestId,
        status: tokens.status(req, res),
        duration: tokens['response-time'](req, res) + ' ms',
        ip: req.ip
      });
    }, {
      stream: { write: (message: string) => logger.info(message.trim()) },
    })
  );
}

// ========================
// Rate Limiting
// ========================
app.use('/api/v1/', apiLimiter);

// ========================
// API Documentation
// ========================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ZeroWaste OS API Documentation',
}));
app.use('/docs', (req, res) => res.redirect('/api-docs'));

// ========================
// API Routes
// ========================
app.use('/api/v1', routes);

// ========================
// 404 Handler
// ========================
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
  });
});

// ========================
// Global Error Handler
// ========================
app.use(errorHandler);

export default app;
