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

// Internal/Webhook Events (could be secured further with api-keys)
router.post('/events', trackEvent);

// Public Cart Sync
router.post('/cart/sync', syncCart);

// Admin routes
router.use(requireAuth, requireAdmin);

// Core Automation CRUD
router.get('/', listAutomations);
router.post('/', createAutomation);
router.get('/:id', getAutomation);
router.put('/:id', updateAutomation);
router.post('/:id/duplicate', duplicateAutomation);

// Templates
router.get('/config/templates', listTemplates);
router.post('/config/templates', saveTemplate);

// Logs & Runs
router.get('/data/runs', listRuns);
router.get('/data/logs', listCommunicationLogs);

export default router;
