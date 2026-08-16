import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import * as shippingController from '../shipping/shippingController.js';
import { handleVelocityWebhook } from '../shipping/webhookController.js';

const router = Router();

// ==========================================
// Admin Order Actions
// ==========================================
router.post('/orders/:orderId/create-shipment', requireAuth, requireAdmin, shippingController.createShipment);
router.post('/orders/:orderId/create-reverse-shipment', requireAuth, requireAdmin, shippingController.createReverseShipment);

// ==========================================
// Admin Shipments
// ==========================================
router.get('/shipments', requireAuth, requireAdmin, shippingController.listShipments);
router.get('/shipments/:shipmentId', requireAuth, requireAdmin, shippingController.getShipment);
router.post('/shipments/:shipmentId/sync', requireAuth, requireAdmin, shippingController.syncShipment);
router.post('/shipments/:shipmentId/cancel', requireAuth, requireAdmin, shippingController.cancelShipment);

// ==========================================
// Customer Tracking (Storefront)
// ==========================================
router.get('/customer/orders/:orderId/tracking', requireAuth, shippingController.getCustomerTracking);

// ==========================================
// Webhooks (No Auth)
// ==========================================
// The :token segment is VELOCITY_WEBHOOK_SECRET — Velocity's webhooks are
// unsigned, so the unguessable URL is the authentication.
router.post('/webhooks/velocity/shipment-status/:token', handleVelocityWebhook);

// ==========================================
// Serviceability (Public / Storefront)
// ==========================================
router.post('/shipping/check-serviceability', shippingController.checkServiceability);

// ==========================================
// Admin Settings — Credentials
// ==========================================
router.post('/admin/shipping/credentials', requireAuth, requireAdmin, shippingController.saveCredentials);
router.get('/admin/shipping/credentials/status', requireAuth, requireAdmin, shippingController.getCredentialStatus);
router.post('/admin/shipping/test-connection', requireAuth, requireAdmin, shippingController.testApiConnection);

// ==========================================
// Admin Settings — Warehouses
// ==========================================
router.get('/admin/shipping/warehouses', requireAuth, requireAdmin, shippingController.listWarehouses);
router.post('/admin/shipping/warehouses', requireAuth, requireAdmin, shippingController.saveWarehouse);
router.patch('/admin/shipping/warehouses/:id', requireAuth, requireAdmin, shippingController.updateWarehouse);
router.post('/admin/shipping/warehouses/:id/sync-velocity', requireAuth, requireAdmin, shippingController.syncWarehouseToVelocity);

// ==========================================
// Admin Settings — Dimension Presets
// ==========================================
router.get('/admin/shipping/dimension-presets', requireAuth, requireAdmin, shippingController.listDimensionPresets);
router.post('/admin/shipping/dimension-presets', requireAuth, requireAdmin, shippingController.saveDimensionPreset);
router.patch('/admin/shipping/dimension-presets/:id', requireAuth, requireAdmin, shippingController.updateDimensionPreset);
router.delete('/admin/shipping/dimension-presets/:id', requireAuth, requireAdmin, shippingController.deleteDimensionPreset);

// ==========================================
// Admin — Shipping Reports
// ==========================================
router.post('/admin/shipping/reports', requireAuth, requireAdmin, shippingController.getShippingReport);

export default router;
