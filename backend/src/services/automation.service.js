import { supabaseAdmin } from '../config/supabaseClient.js';
import { CommunicationService } from './communication.service.js';

export const AutomationService = {
    /**
     * Polls the automation_events table for any events that have processed=false.
     * Processes them by finding matching automations and spawning runs.
     */
    async processUnprocessedEvents() {
        try {
            const { data: events, error } = await supabaseAdmin
                .from('automation_events')
                .select('*')
                .eq('processed', false)
                .order('processed_at', { ascending: true }) // using processed_at as created_at since it defaults to now()
                .limit(50);

            if (error) {
                console.error('AutomationService: Error fetching unprocessed events:', error);
                return;
            }

            if (!events || events.length === 0) return;

            for (const event of events) {
                await this.trackEvent(event.event_id, event.event_name, event.customer_id, event.payload, true);
            }
        } catch (err) {
            console.error('AutomationService processUnprocessedEvents Error:', err);
        }
    },

    /**
     * Entry point for triggering an event (e.g. order_placed, abandoned_cart).
     * @param {string} eventId - Unique ID for idempotency (e.g., order_id + '_' + status).
     * @param {string} eventName - The trigger name (e.g., 'order_placed').
     * @param {string} customerId - Supabase Profile ID.
     * @param {object} payload - Additional context data.
     * @param {boolean} skipInsert - If true, skips inserting into automation_events.
     */
    async trackEvent(eventId, eventName, customerId, payload = {}, skipInsert = false) {
        if (!eventId || !eventName || !customerId) {
            console.error('AutomationService: Missing required event parameters.');
            return;
        }

        try {
            if (!skipInsert) {
                // 1. Idempotency Check & Insert
                const { data: existingEvent } = await supabaseAdmin
                    .from('automation_events')
                    .select('id')
                    .eq('event_id', eventId)
                    .single();

                if (existingEvent) {
                    console.log(`AutomationService: Event ${eventId} already processed. Skipping.`);
                    return;
                }

                // Record event and mark it processed immediately
                const { error: eventErr } = await supabaseAdmin
                    .from('automation_events')
                    .insert({
                        event_id: eventId,
                        event_name: eventName,
                        customer_id: customerId,
                        payload,
                        processed: true
                    });

                if (eventErr) throw eventErr;
            } else {
                // Pre-existing event fetched by processUnprocessedEvents
                // Mark it as processed before running to prevent duplicate processing
                await supabaseAdmin
                    .from('automation_events')
                    .update({ processed: true })
                    .eq('event_id', eventId);
            }

            // 2. Find active automations for this trigger
            const { data: automations, error: autoErr } = await supabaseAdmin
                .from('automations')
                .select('id, version')
                .eq('trigger_event', eventName)
                .eq('status', 'Active');

            if (autoErr) throw autoErr;
            if (!automations || automations.length === 0) return; // No active automations

            // 3. Spawn a run for each automation
            for (const automation of automations) {
                const { data: run, error: runErr } = await supabaseAdmin
                    .from('automation_runs')
                    .insert({
                        automation_id: automation.id,
                        automation_version: automation.version,
                        customer_id: customerId,
                        trigger_event_id: eventId,
                        current_step_order: 1,
                        status: 'running',
                        context_data: payload
                    })
                    .select('*')
                    .single();

                if (runErr) {
                    console.error('AutomationService: Error creating run:', runErr);
                    continue;
                }

                // 4. Start execution of the first step immediately
                await this.executeNextStep(run.id);
            }
        } catch (error) {
            console.error('AutomationService trackEvent Error:', error);
        }
    },

    /**
     * Evaluates a single condition against the run's context data.
     * Returns true if condition passes, false otherwise.
     */
    async evaluateCondition(conditionType, config, run) {
        const contextData = run.context_data || {};

        switch (conditionType) {
            case 'order_completed': {
                // Check if customer has completed an order (used for abandoned cart verification)
                const { data: orderExists } = await supabaseAdmin
                    .from('orders')
                    .select('id')
                    .eq('customer_id', run.customer_id)
                    .in('payment_status', ['Paid', 'Captured'])
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                const expected = config.expected_value === 'Yes';
                const actual = !!orderExists;
                return expected === actual;
            }

            case 'customer_type': {
                // First-time vs Returning customer
                const { count } = await supabaseAdmin
                    .from('orders')
                    .select('id', { count: 'exact', head: true })
                    .eq('customer_id', run.customer_id)
                    .in('payment_status', ['Paid', 'Captured']);

                const orderCount = count || 0;
                const expectedType = config.expected_value; // 'first_time' or 'returning'
                if (expectedType === 'first_time') return orderCount <= 1;
                if (expectedType === 'returning') return orderCount > 1;
                return true;
            }

            case 'order_value': {
                // Compare order value with operator
                const orderValue = parseFloat(contextData.total || contextData.order_value || 0);
                const threshold = parseFloat(config.value || 0);
                const operator = config.operator || '>';

                switch (operator) {
                    case '>': return orderValue > threshold;
                    case '<': return orderValue < threshold;
                    case '=': return orderValue === threshold;
                    case '>=': return orderValue >= threshold;
                    case '<=': return orderValue <= threshold;
                    default: return true;
                }
            }

            case 'product': {
                // Check if order contains a specific product
                const productId = config.product_id;
                if (!productId) return true;

                // Check order_items or context_data items
                const orderId = contextData.id || contextData.order_id;
                if (orderId) {
                    const { data: items } = await supabaseAdmin
                        .from('order_items')
                        .select('product_id')
                        .eq('order_id', orderId)
                        .eq('product_id', productId);
                    return items && items.length > 0;
                }

                // Fallback: check context_data.items array
                const items = contextData.items || [];
                return items.some(item => item.product_id === productId || item.slug === config.product_slug);
            }

            case 'category': {
                // Check if order contains product from a specific category
                const categoryId = config.category_id;
                if (!categoryId) return true;

                const orderId = contextData.id || contextData.order_id;
                if (orderId) {
                    const { data: items } = await supabaseAdmin
                        .from('order_items')
                        .select('product_id')
                        .eq('order_id', orderId);

                    if (!items || items.length === 0) return false;

                    const productIds = items.map(i => i.product_id).filter(Boolean);
                    if (productIds.length === 0) return false;

                    const { data: products } = await supabaseAdmin
                        .from('products')
                        .select('id')
                        .in('id', productIds)
                        .eq('category_id', categoryId);

                    return products && products.length > 0;
                }
                return false;
            }

            case 'payment_method': {
                // Check payment method matches
                const expectedMethod = (config.expected_value || '').toLowerCase();
                const actualMethod = (contextData.payment_method || '').toLowerCase();
                return actualMethod.includes(expectedMethod);
            }

            default:
                console.log(`Unknown condition type: ${conditionType}`);
                return true;
        }
    },

    /**
     * Evaluates multiple conditions with AND logic.
     * All conditions must pass for the overall result to be true.
     */
    async evaluateConditions(conditions, run) {
        if (!conditions || conditions.length === 0) return true;

        for (const condition of conditions) {
            const passed = await this.evaluateCondition(
                condition.condition_type,
                condition,
                run
            );
            if (!passed) return false; // AND logic: fail on first false
        }
        return true;
    },

    /**
     * Executes the current step of an automation run.
     * @param {string} runId
     */
    async executeNextStep(runId) {
        try {
            const { data: run, error: runErr } = await supabaseAdmin
                .from('automation_runs')
                .select('*, customer:profiles(*)')
                .eq('id', runId)
                .single();

            if (runErr || !run) throw new Error('Run not found');

            // If already completed or stopped, ignore
            if (['completed', 'cancelled', 'stopped_by_condition', 'failed'].includes(run.status)) {
                return;
            }

            // Check if the parent automation is still active (respect pause)
            const { data: automation } = await supabaseAdmin
                .from('automations')
                .select('status')
                .eq('id', run.automation_id)
                .single();

            if (automation && automation.status === 'Paused') {
                // Automation was paused — keep run in 'waiting' state
                console.log(`Automation ${run.automation_id} is paused. Keeping run ${runId} waiting.`);
                return;
            }

            // Fetch current step configuration
            const { data: step, error: stepErr } = await supabaseAdmin
                .from('automation_steps')
                .select('*')
                .eq('automation_id', run.automation_id)
                .eq('automation_version', run.automation_version)
                .eq('step_order', run.current_step_order)
                .single();

            if (stepErr && stepErr.code === 'PGRST116') {
                // No more steps found, mark as completed
                await supabaseAdmin.from('automation_runs').update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    next_execution_at: null
                }).eq('id', run.id);
                return;
            } else if (stepErr) {
                throw stepErr;
            }

            // We have a step to execute. Check step type and perform action.
            let nextStepOrder = run.current_step_order + 1;
            let pauseForWait = false;

            switch (step.step_type) {
                case 'Wait': {
                    const waitValue = parseInt(step.config.value, 10);
                    const waitUnit = step.config.unit; // 'minutes', 'hours', 'days'
                    if (waitValue > 0) {
                        const nextRunTime = new Date();
                        if (waitUnit === 'minutes') nextRunTime.setMinutes(nextRunTime.getMinutes() + waitValue);
                        else if (waitUnit === 'hours') nextRunTime.setHours(nextRunTime.getHours() + waitValue);
                        else if (waitUnit === 'days') nextRunTime.setDate(nextRunTime.getDate() + waitValue);
                        
                        await supabaseAdmin.from('automation_runs').update({
                            status: 'waiting',
                            next_execution_at: nextRunTime.toISOString(),
                            current_step_order: nextStepOrder // Advance so when it wakes, it runs the *next* step
                        }).eq('id', run.id);
                        pauseForWait = true;
                    }
                    break;
                }

                case 'Send Email': {
                    // Abandoned cart safety: verify purchase not completed before sending
                    if (run.context_data?.trigger_type === 'cart_abandoned') {
                        const purchaseCompleted = await this.evaluateCondition('order_completed', { expected_value: 'Yes' }, run);
                        if (purchaseCompleted) {
                            await supabaseAdmin.from('automation_runs').update({
                                status: 'stopped_by_condition',
                                completed_at: new Date().toISOString(),
                                error_message: 'Stopped: Customer completed purchase before message was sent.'
                            }).eq('id', run.id);
                            // Mark cart as recovered
                            await supabaseAdmin.from('abandoned_carts').update({ status: 'recovered' }).eq('customer_id', run.customer_id);
                            return;
                        }
                    }

                    // Check communication preferences
                    const canSendEmail = await CommunicationService.checkPreference(run.customer_id, 'email');
                    if (!canSendEmail) {
                        console.log(`Customer ${run.customer_id} opted out of email. Skipping.`);
                        break; // Skip step but continue workflow
                    }

                    await CommunicationService.sendEmail(
                        run.customer, 
                        step.config.template_id, 
                        run.context_data, 
                        run.id
                    );
                    break;
                }

                case 'Send WhatsApp': {
                    // Abandoned cart safety check
                    if (run.context_data?.trigger_type === 'cart_abandoned') {
                        const purchaseCompleted = await this.evaluateCondition('order_completed', { expected_value: 'Yes' }, run);
                        if (purchaseCompleted) {
                            await supabaseAdmin.from('automation_runs').update({
                                status: 'stopped_by_condition',
                                completed_at: new Date().toISOString(),
                                error_message: 'Stopped: Customer completed purchase before message was sent.'
                            }).eq('id', run.id);
                            await supabaseAdmin.from('abandoned_carts').update({ status: 'recovered' }).eq('customer_id', run.customer_id);
                            return;
                        }
                    }

                    // Check communication preferences
                    const canSendWA = await CommunicationService.checkPreference(run.customer_id, 'whatsapp');
                    if (!canSendWA) {
                        console.log(`Customer ${run.customer_id} opted out of WhatsApp. Skipping.`);
                        break;
                    }

                    await CommunicationService.sendWhatsApp(
                        run.customer, 
                        step.config.template_id, 
                        run.context_data, 
                        run.id
                    );
                    break;
                }

                case 'Condition': {
                    // Support single condition or array of conditions (AND logic)
                    const conditions = step.config.conditions || [
                        { condition_type: step.config.condition_type, ...step.config }
                    ];

                    const conditionPassed = await this.evaluateConditions(conditions, run);
                    
                    if (!conditionPassed) {
                        const noBranchStepOrder = step.config.no_branch_step_order;
                        if (noBranchStepOrder) {
                            nextStepOrder = noBranchStepOrder;
                        } else {
                            // Stop completely
                            await supabaseAdmin.from('automation_runs').update({
                                status: 'stopped_by_condition',
                                completed_at: new Date().toISOString(),
                                error_message: 'Condition failed, stopping automation.'
                            }).eq('id', run.id);
                            return;
                        }
                    } else {
                        const yesBranchStepOrder = step.config.yes_branch_step_order;
                        if (yesBranchStepOrder) {
                            nextStepOrder = yesBranchStepOrder;
                        }
                    }
                    break;
                }

                case 'Add Customer Tag': {
                    const tagName = step.config.tag_name;
                    if (tagName) {
                        // Upsert tag (get or create)
                        let { data: tag } = await supabaseAdmin
                            .from('customer_tags')
                            .select('id')
                            .eq('name', tagName)
                            .single();

                        if (!tag) {
                            const { data: newTag } = await supabaseAdmin
                                .from('customer_tags')
                                .insert({ name: tagName })
                                .select('id')
                                .single();
                            tag = newTag;
                        }

                        if (tag) {
                            await supabaseAdmin
                                .from('customer_tag_assignments')
                                .upsert({
                                    customer_id: run.customer_id,
                                    tag_id: tag.id,
                                    source: 'automation',
                                    automation_run_id: run.id
                                }, { onConflict: 'customer_id,tag_id' });
                        }
                    }
                    break;
                }

                case 'Generate Coupon': {
                    const couponConfig = step.config;
                    const code = `AUTO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                    
                    const expiryDays = parseInt(couponConfig.expiry_days || '30', 10);
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + expiryDays);

                    const { data: coupon, error: couponErr } = await supabaseAdmin
                        .from('coupons')
                        .insert({
                            code,
                            description: couponConfig.description || `Auto-generated coupon for automation`,
                            discount_type: couponConfig.discount_type || 'percentage',
                            discount_value: parseFloat(couponConfig.discount_value || '10'),
                            min_order_value: parseFloat(couponConfig.min_order_value || '0'),
                            max_uses: parseInt(couponConfig.max_uses || '1', 10),
                            expiry_date: expiryDate.toISOString(),
                            is_active: true
                        })
                        .select('*')
                        .single();

                    if (couponErr) {
                        console.error('Generate Coupon error:', couponErr);
                    } else {
                        // Store coupon in context_data for later steps (Send Coupon)
                        const updatedContext = {
                            ...run.context_data,
                            coupon_code: coupon.code,
                            coupon_discount: `${coupon.discount_value}${coupon.discount_type === 'percentage' ? '%' : '₹'}`,
                            coupon_expiry: expiryDate.toLocaleDateString('en-IN'),
                            coupon_min_order: coupon.min_order_value
                        };
                        await supabaseAdmin.from('automation_runs').update({
                            context_data: updatedContext
                        }).eq('id', run.id);
                        // Update local run reference
                        run.context_data = updatedContext;
                    }
                    break;
                }

                case 'Send Coupon': {
                    // Send coupon via the specified channel (email or whatsapp)
                    const channel = step.config.channel || 'email';
                    const templateId = step.config.template_id;

                    if (!run.context_data?.coupon_code) {
                        console.warn('Send Coupon: No coupon_code found in context_data. Ensure Generate Coupon step comes first.');
                    }

                    if (channel === 'email') {
                        const canSend = await CommunicationService.checkPreference(run.customer_id, 'email');
                        if (canSend) {
                            await CommunicationService.sendEmail(run.customer, templateId, run.context_data, run.id);
                        }
                    } else {
                        const canSend = await CommunicationService.checkPreference(run.customer_id, 'whatsapp');
                        if (canSend) {
                            await CommunicationService.sendWhatsApp(run.customer, templateId, run.context_data, run.id);
                        }
                    }
                    break;
                }
                
                case 'End Automation': {
                    await supabaseAdmin.from('automation_runs').update({
                        status: 'completed',
                        completed_at: new Date().toISOString(),
                        next_execution_at: null
                    }).eq('id', run.id);
                    return;
                }

                default:
                    console.log(`Unknown step type: ${step.step_type}`);
                    break;
            }

            if (!pauseForWait) {
                // Immediately execute the next step
                await supabaseAdmin.from('automation_runs').update({
                    current_step_order: nextStepOrder,
                    status: 'running',
                    next_execution_at: null
                }).eq('id', run.id);

                // Recursively call next step
                await this.executeNextStep(run.id);
            }

        } catch (error) {
            console.error('executeNextStep error:', error);
            await supabaseAdmin.from('automation_runs').update({
                status: 'failed',
                error_message: error.message
            }).eq('id', runId);
        }
    }
};
