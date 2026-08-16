import { supabaseAdmin } from '../config/supabaseClient.js';
import { shippingService } from './shippingService.js';
import { logger } from '../utils/logger.js';

export const shippingJobs = {
    intervalId: null,

    async syncActiveShipments() {
        logger.info('Starting fallback tracking sync job...');
        try {
            // Find shipments that need syncing
            // Condition: not in final state AND last_synced_at is > 15 mins ago
            const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
            
            const { data: shipments, error } = await supabaseAdmin
                .from('shipments')
                .select('id')
                .not('internal_status', 'in', '("delivered","cancelled","returned","lost")')
                .or(`last_synced_at.lt.${thirtyMinsAgo},last_synced_at.is.null`);

            if (error) {
                throw error;
            }

            if (!shipments || shipments.length === 0) {
                 logger.info('No active shipments require tracking sync.');
                 return;
            }

            logger.info(`Found ${shipments.length} shipments to sync.`);

            for (const shipment of shipments) {
                try {
                    await shippingService.syncShipmentTracking(shipment.id);
                } catch (syncErr) {
                    logger.error(`Error syncing shipment ${shipment.id} in job`, { error: syncErr.message });
                }
            }
            logger.info('Finished fallback tracking sync job.');
        } catch (err) {
            logger.error('Error running syncActiveShipments job', { error: err.message });
        }
    },

    startPolling() {
        const intervalMs = process.env.SHIPPING_SYNC_INTERVAL_MS 
            ? parseInt(process.env.SHIPPING_SYNC_INTERVAL_MS, 10) 
            : 15 * 60 * 1000; // Default 15 minutes
            
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        logger.info(`Starting shipping fallback polling job (interval: ${intervalMs}ms)`);
        
        this.intervalId = setInterval(async () => {
            if (this.isSyncing) {
                logger.warn('Skipping shipping sync — previous run still in progress.');
                return;
            }
            this.isSyncing = true;
            try {
                await this.syncActiveShipments();
            } finally {
                this.isSyncing = false;
            }
        }, intervalMs);
    },

    stopPolling() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            logger.info('Stopped shipping fallback polling job.');
        }
    }
};
