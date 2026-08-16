// ============================================================================
// routes/faqs.routes.js
// ----------------------------------------------------------------------------
// Route definitions for `product_faqs`.
// ============================================================================

import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.schema.js';
import { createFaqSchema, updateFaqSchema, listFaqsQuerySchema } from '../validators/faq.schema.js';
import { listFaqs, getFaq, createFaq, updateFaq, deleteFaq } from '../controllers/faqs.controller.js';

const router = Router();

router.get('/', optionalAuth, validate(listFaqsQuerySchema, 'query'), listFaqs);
router.get('/:id', optionalAuth, validate(idParamSchema, 'params'), getFaq);

router.post('/', requireAuth, requireAdmin, validate(createFaqSchema), createFaq);
router.put('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), validate(updateFaqSchema), updateFaq);
router.patch('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), validate(updateFaqSchema), updateFaq);
router.delete('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), deleteFaq);

export default router;
