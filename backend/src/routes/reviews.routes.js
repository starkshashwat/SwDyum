// ============================================================================
// routes/reviews.routes.js
// ----------------------------------------------------------------------------
// Route definitions for `product_reviews` moderation. All routes are
// admin-only (requireAuth + requireAdmin) — this is the ADMIN moderation
// API, not the public review-submission endpoint (which will live in the
// public frontend's own backend surface in a later phase). No POST route
// exists here — see reviews.controller.js header comment for rationale.
// ============================================================================

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.schema.js';
import { moderateReviewSchema, listReviewsQuerySchema } from '../validators/review.schema.js';
import {
    listReviews,
    getReview,
    moderateReview,
    deleteReview,
} from '../controllers/reviews.controller.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, validate(listReviewsQuerySchema, 'query'), listReviews);
router.get('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), getReview);

// No POST — reviews are created by customers elsewhere (see controller comment).
router.put('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), validate(moderateReviewSchema), moderateReview);
router.patch('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), validate(moderateReviewSchema), moderateReview);
router.delete('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), deleteReview);

export default router;
