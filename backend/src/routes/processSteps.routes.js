// ============================================================================
// routes/processSteps.routes.js
// ----------------------------------------------------------------------------
// Route definitions for `product_process_steps`.
// ============================================================================

import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.schema.js';
import {
    createProcessStepSchema,
    updateProcessStepSchema,
    listProcessStepsQuerySchema,
} from '../validators/processStep.schema.js';
import {
    listProcessSteps,
    getProcessStep,
    createProcessStep,
    updateProcessStep,
    deleteProcessStep,
} from '../controllers/processSteps.controller.js';

const router = Router();

router.get('/', optionalAuth, validate(listProcessStepsQuerySchema, 'query'), listProcessSteps);
router.get('/:id', optionalAuth, validate(idParamSchema, 'params'), getProcessStep);

router.post('/', requireAuth, requireAdmin, validate(createProcessStepSchema), createProcessStep);
router.put(
    '/:id',
    requireAuth,
    requireAdmin,
    validate(idParamSchema, 'params'),
    validate(updateProcessStepSchema),
    updateProcessStep
);
router.patch(
    '/:id',
    requireAuth,
    requireAdmin,
    validate(idParamSchema, 'params'),
    validate(updateProcessStepSchema),
    updateProcessStep
);
router.delete('/:id', requireAuth, requireAdmin, validate(idParamSchema, 'params'), deleteProcessStep);

export default router;
