// ============================================================================
// routes/coupons.routes.js
// ----------------------------------------------------------------------------
// Route definitions for `coupons`. Unlike catalog entities, coupons are NOT
// exposed as public reads (no reason for anonymous callers to enumerate
// coupon codes/values) — every route here requires requireAuth + requireAdmin.
// ============================================================================

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.schema.js';
import {
    createCouponSchema,
    updateCouponSchema,
    listCouponsQuerySchema,
} from '../validators/coupon.schema.js';
import {
    listCoupons,
    getCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
} from '../controllers/coupons.controller.js';

const router = Router();

// All coupon routes are admin-only — no public reads.
router.get('/', requireAuth, requireAdmin, validate(listCouponsQuerySchema, 'query'), listCoupons);
router.get('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), getCoupon);
router.post('/', requireAuth, requireAdmin, validate(createCouponSchema), createCoupon);
router.put('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), validate(updateCouponSchema), updateCoupon);
router.patch('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), validate(updateCouponSchema), updateCoupon);
router.delete('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), deleteCoupon);

export default router;
