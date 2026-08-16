import express from 'express';
import { 
    listAutomations, 
    getAutomation, 
    createAutomation, 
    updateAutomation, 
    duplicateAutomation, 
    trackEvent,
    syncCart,
    listTemplates,
    saveTemplate,
    listRuns,
    listCommunicationLogs
} from '../controllers/automations.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

// All routes require an authenticated admin/editor. The previously public
// /events and /cart/sync routes had no legitimate callers (the storefront
// writes abandoned_carts directly) and allowed anyone to trigger
// service-role WhatsApp/email sends and coupon generation.
router.use(requireAuth, requireAdmin);

// Static routes MUST be registered before /:id or Express matches
// "config"/"data" as an automation id and 404s them.
router.get('/config/templates', listTemplates);
router.post('/config/templates', saveTemplate);
router.get('/data/runs', listRuns);
router.get('/data/logs', listCommunicationLogs);

// Core Automation CRUD
router.get('/', listAutomations);
router.post('/', createAutomation);
router.get('/:id', getAutomation);
router.put('/:id', updateAutomation);
router.post('/:id/duplicate', duplicateAutomation);
router.post('/events', trackEvent);
router.post('/cart/sync', syncCart);

export default router;
