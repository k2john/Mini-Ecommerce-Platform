import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import path from 'path';
import type { Server } from 'http';

dotenv.config();

import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import { notFound, errorHandler } from './middleware/error.middleware';
import logger from './utils/logger';

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 3000;

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ──────────────────────────────────────────────────────────────────────
const defaultDevOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'http://localhost:4201',
  'http://127.0.0.1:4201',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const envOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([
    ...envOrigins,
    ...(process.env.NODE_ENV === 'production' ? [] : defaultDevOrigins),
  ]),
);

const wildcardToRegExp = (pattern: string): RegExp => {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/\*/g, '.*')}$`);
};

const isAllowedOrigin = (origin: string): boolean => {
  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin === '*') return true;
    if (allowedOrigin === origin) return true;
    if (allowedOrigin.includes('*')) {
      return wildcardToRegExp(allowedOrigin).test(origin);
    }
    return false;
  });
};

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use(limiter);

// ─── Body Parsing & Compression ───────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// ─── Static Files ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── API Documentation ─────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'E-Commerce API Docs',
}));

app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'E-Commerce API is running',
    docs: '/api/docs',
    health: '/health',
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// ─── Error Handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';
const MAX_PORT_ATTEMPTS = 10;

const startServer = (port: number, attempt = 1): Server => {
  const server = app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
    logger.info(`API Docs: http://localhost:${port}/api/docs`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE' && isDev && attempt < MAX_PORT_ATTEMPTS) {
      const nextPort = port + 1;
      logger.warn(`Port ${port} is busy, retrying on ${nextPort}...`);
      startServer(nextPort, attempt + 1);
      return;
    }

    logger.error(`Failed to start server on port ${port}: ${error.message}`);
    process.exit(1);
  });

  return server;
};

startServer(DEFAULT_PORT);

export default app;
