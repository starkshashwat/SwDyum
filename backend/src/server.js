// ============================================================================
// src/server.js
// ----------------------------------------------------------------------------
// Main Express application entrypoint for the Mango Pickle backend API.
//
// Boot sequence (order matters):
//   1. validateEnv()   — fail fast if required Supabase credentials are missing.
//   2. Build the Express app and apply security/parsing middleware.
//   3. Mount every route module under /api/*.
//   4. Register the 404 handler (after all real routes).
//   5. Register the centralized errorHandler (must be LAST — 4-arg signature).
//   6. app.listen(env.PORT).
//
// This file intentionally contains NO business logic — it is wiring only.
// ============================================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Agent, setGlobalDispatcher } from 'undici';

// Set global fetch connection timeout to 30 seconds to accommodate slow networks/SSL handshakes
setGlobalDispatcher(new Agent({ connectTimeout: 30000 }));

import { validateEnv, env } from './config/env.js';
import { logger } from './utils/logger.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Route modules — one per resource, thin wiring only (see each file for
// its own auth/rbac/validation decisions).
import categoriesRoutes from './routes/categories.routes.js';
import productsRoutes from './routes/products.routes.js';
import productImagesRoutes from './routes/productImages.routes.js';
import productIngredientsRoutes from './routes/productIngredients.routes.js';
import trustBadgesRoutes from './routes/trustBadges.routes.js';
import faqsRoutes from './routes/faqs.routes.js';
import processStepsRoutes from './routes/processSteps.routes.js';
import couponsRoutes from './routes/coupons.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import authRoutes from './routes/auth.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import shippingRoutes from './routes/shipping.routes.js';
import automationsRoutes from './routes/automations.routes.js';
import { shippingJobs } from './shipping/shippingJobs.js';
import { startAutomationQueueWorker } from './workers/automationQueue.js';
import { startCartAbandonmentWorker } from './workers/cartAbandonmentWorker.js';

// ── 1. Validate environment before doing anything else ─────────────────────
// If SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY are
// missing, this exits the process immediately with a clear error message
// rather than letting the app boot into a broken state.
validateEnv();

const app = express();

// ── 2. Security & parsing middleware ────────────────────────────────────────

// helmet() sets a battery of protective HTTP response headers (X-Content-
// Type-Options, X-Frame-Options, Strict-Transport-Security, etc.) with
// sensible secure defaults.
app.use(helmet());

// CORS: restricted to an explicit allow-list (env.ALLOWED_ORIGINS) — NEVER
// use `origin: '*'` for an API that handles authenticated/admin requests,
// since that would allow any website to make credentialed requests against
// this API on a logged-in admin's behalf.
app.use(
    cors({
        origin(origin, callback) {
            // Allow non-browser tools (curl/Postman/server-to-server) which
            // send no Origin header at all.
            if (!origin) return callback(null, true);

            if (env.ALLOWED_ORIGINS.length === 0 || env.ALLOWED_ORIGINS.includes(origin)) {
                return callback(null, true);
            }

            logger.warn(`Blocked CORS request from disallowed origin: ${origin}`);
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    })
);

// The Velocity webhook verifies an HMAC over the RAW request body, so its
// route must consume the body as a Buffer BEFORE express.json() parses it.
// body-parser marks the body as read, so express.json() skips it afterwards.
app.use('/api/webhooks/velocity/shipment-status', express.raw({ type: '*/*', limit: '1mb' }));

// Parse JSON bodies with a 1MB cap — generous enough for admin form
// payloads (product descriptions, pdp_config JSON, etc.) while preventing
// trivial large-body DoS attempts. File uploads bypass this entirely since
// they use multer's multipart parser (see routes/upload.routes.js), not
// express.json().
app.use(express.json({ limit: '1mb' }));

// HTTP request logging. 'dev' format in development for concise colored
// output; 'combined' (Apache-style) in production for structured log
// aggregation compatibility.
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

// Global rate limiter — applied to every request before it reaches any
// route handler.
app.use(globalLimiter);

// ── 3. Health check & root route (no auth, useful for uptime monitors / status check) ──
app.get('/', (req, res) => {
    res.json({
        name: 'Swadyum Backend API',
        status: 'online',
        health: '/health',
        documentation: 'API endpoints mounted under /api/*'
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 4. Mount API routes ──────────────────────────────────────────────────────
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/product-images', productImagesRoutes);
app.use('/api/product-ingredients', productIngredientsRoutes);
app.use('/api/trust-badges', trustBadgesRoutes);
app.use('/api/faqs', faqsRoutes);
app.use('/api/process-steps', processStepsRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/automations', automationsRoutes);
app.use('/api', shippingRoutes);

// ── 5. 404 handler — after all real routes, before the error handler ───────
app.use(notFoundHandler);

// ── 6. Centralized error handler — MUST be registered last ─────────────────
app.use(errorHandler);

// ── 7. Start listening ──────────────────────────────────────────────────────
const server = app.listen(env.PORT, () => {
    logger.info(`Mango Pickle backend API listening on port ${env.PORT} (${env.NODE_ENV})`);
    
    // Start shipping fallback polling job
    shippingJobs.startPolling();

    // Start automation queue worker
    startAutomationQueueWorker();

    // Start cart abandonment detection worker
    startCartAbandonmentWorker();
});

// ── 8. Graceful shutdown ────────────────────────────────────────────────────
const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully...`);
    shippingJobs.stopPolling();
    process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { server };

export default app;
