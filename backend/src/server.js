import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { getStorageProviderInfo } from './storage/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

function parseAllowedOrigins(env = process.env) {
  const configuredOrigins = [
    env.CLIENT_URL,
    env.CLIENT_URLS,
    'http://localhost:5173',
    'https://likephotostudio.com',
    'https://www.likephotostudio.com',
  ]
    .flatMap((value) => String(value || '').split(','))
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set(configuredOrigins)];
}

const allowedOrigins = parseAllowedOrigins();

// Middlewares
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(
  express.json({
    verify: (req, _res, buf) => {
      if (req.originalUrl?.startsWith('/api/v1/orders/webhook/razorpay')) {
        req.rawBody = buf.toString('utf8');
      }
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Photography Marketplace API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const storageInfo = getStorageProviderInfo();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Allowed Origins: ${allowedOrigins.join(', ')}`);
  console.log(`🗂️ Storage Provider: ${storageInfo.provider}`);
  console.log(
    `🪣 Buckets: preview=${storageInfo.buckets.preview_bucket}, original=${storageInfo.buckets.original_bucket}`
  );
});

export default app;
