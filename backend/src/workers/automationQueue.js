import { supabaseAdmin } from '../config/supabaseClient.js';
import { AutomationService } from '../services/automation.service.js';

let isProcessing = false;

/**
 * Polls the automation_runs table for any runs that are 'waiting' 
 * and whose next_execution_at time has passed.
 */
export async function processAutomationQueue() {
    if (isProcessing) return;
    isProcessing = true;

    try {
        // 1. Process any unprocessed raw events (from edge functions, etc)
        await AutomationService.processUnprocessedEvents();

        // 2. Fetch due automation runs
        const { data: runs, error } = await supabaseAdmin
            .from('automation_runs')
            .select('id')
            .eq('status', 'waiting')
            .lte('next_execution_at', new Date().toISOString());

        if (error) {
            console.error('Error fetching automation queue:', error);
            return;
        }

        if (runs && runs.length > 0) {
            console.log(`Processing ${runs.length} due automation runs...`);
            for (const run of runs) {
                // We update status to 'running' to prevent duplicate execution 
                // in case the next execution takes longer than the polling interval
                await supabaseAdmin
                    .from('automation_runs')
                    .update({ status: 'running' })
                    .eq('id', run.id);

                // Execute in background without awaiting so we don't block the loop for long
                AutomationService.executeNextStep(run.id).catch(err => {
                    console.error(`Error processing run ${run.id}:`, err);
                });
            }
        }
    } catch (error) {
        console.error('processAutomationQueue Error:', error);
    } finally {
        isProcessing = false;
    }
}

/**
 * Starts the queue polling interval.
 */
export function startAutomationQueueWorker() {
    // Poll every 1 minute (60000ms)
    // Adjust interval as needed based on expected volume
    console.log('Started Automation Queue Worker...');
    setInterval(processAutomationQueue, 60000);
}
