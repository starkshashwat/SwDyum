// ============================================================================
// routes/trustBadges.routes.js
// ----------------------------------------------------------------------------
// Route definitions for `product_trust_badges`.
// ============================================================================

import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.schema.js';
import {
    createTrustBadgeSchema,
    updateTrustBadgeSchema,
    listTrustBadgesQuerySchema,
} from '../validators/trustBadge.schema.js';
import {
    listTrustBadges,
    getTrustBadge,
    createTrustBadge,
    updateTrustBadge,
    deleteTrustBadge,
} from '../controllers/trustBadges.controller.js';

const router = Router();

router.get('/', optionalAuth, validate(listTrustBadgesQuerySchema, 'query'), listTrustBadges);
router.get('/:id', optionalAuth, validate(idParamSchema, 'params'), getTrustBadge);

router.post('/', requireAuth, requireAdmin, validate(createTrustBadgeSchema), createTrustBadge);
router.put('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), validate(updateTrustBadgeSchema), updateTrustBadge);
router.patch('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), validate(updateTrustBadgeSchema), updateTrustBadge);
router.delete('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), deleteTrustBadge);

export default router;
