// ============================================================================
// routes/orders.routes.js
// ----------------------------------------------------------------------------
// Route definitions for `orders`. Per the task's explicit rule: ONLY GET
// (list, single) and PATCH (status/tracking/payment_status update) are
// exposed. There is deliberately NO POST /orders and NO DELETE /orders —
// orders originate from checkout/webhooks elsewhere and are a permanent
// business record. All routes are admin-only.
// ============================================================================

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.schema.js';
import { updateOrderSchema, listOrdersQuerySchema } from '../validators/order.schema.js';
import { listOrders, getOrder, updateOrder } from '../controllers/orders.controller.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, validate(listOrdersQuerySchema, 'query'), listOrders);
router.get('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), getOrder);

// No POST — orders originate from checkout/webhooks, never admin-created.
router.patch('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), validate(updateOrderSchema), updateOrder);
// No PUT — PATCH is the only supported partial-update verb for orders, to
// discourage accidentally overwriting fields with a full-replace semantic.
// No DELETE — orders are a permanent business record.

export default router;
