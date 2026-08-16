import { supabaseAdmin } from '../config/supabaseClient.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resilientQuery } from '../utils/resilientQuery.js';
import { AutomationService } from '../services/automation.service.js';

// ----------------------------------------------------------------------------
// Events
// ----------------------------------------------------------------------------
export const trackEvent = asyncHandler(async (req, res) => {
    // In production, secure this endpoint so only internal services can call it
    const { event_id, event_name, customer_id, payload } = req.body;
    await AutomationService.trackEvent(event_id, event_name, customer_id, payload);
    res.json({ success: true });
});

export const syncCart = asyncHandler(async (req, res) => {
    const { cart_id, customer_id, customer_email, customer_phone, cart_items, cart_value, cart_url } = req.body;

    // For tracking, we need either an existing ID, a customer ID, or an email/phone
    if (!customer_id && !customer_email && !customer_phone) {
        return res.status(400).json({ error: 'Missing customer identification' });
    }

    const payload = {
        customer_id: customer_id || null,
        customer_email,
        customer_phone,
        cart_items,
        cart_value,
        cart_url,
        status: 'active',
        updated_at: new Date().toISOString(),
        automation_triggered: false
    };

    if (cart_id) {
        // Update existing
        const { data, error } = await supabaseAdmin
            .from('abandoned_carts')
            .update(payload)
            .eq('id', cart_id)
            .select('id')
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
            return res.json({ success: true, cart_id: data.id });
        }
    }

    // Create new
    const { data, error } = await supabaseAdmin
        .from('abandoned_carts')
        .insert(payload)
        .select('id')
        .single();
        
    if (error) throw error;
    res.json({ success: true, cart_id: data.id });
});

// ----------------------------------------------------------------------------
// Automations
// ----------------------------------------------------------------------------
export const listAutomations = asyncHandler(async (req, res) => {
    const { data, error } = await resilientQuery(supabaseAdmin, {
        table: 'automations',
        select: '*, automation_steps(count), automation_runs(count)',
        order: 'created_at',
        ascending: false,
    });
    if (error) throw error;

    // For dashboard, we might want to group the run status counts.
    // We can do an additional query for run stats.
    const { data: runsData } = await supabaseAdmin.from('automation_runs').select('automation_id, status');
    
    const enriched = data.map(auto => {
        const autoRuns = runsData?.filter(r => r.automation_id === auto.id) || [];
        return {
            ...auto,
            total_enrolled: autoRuns.length,
            currently_running: autoRuns.filter(r => r.status === 'running' || r.status === 'waiting').length,
            completed: autoRuns.filter(r => r.status === 'completed').length,
            failed: autoRuns.filter(r => r.status === 'failed').length,
        };
    });

    res.json({ data: enriched });
});

export const getAutomation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await resilientQuery(supabaseAdmin, {
        table: 'automations',
        select: '*, automation_steps(*)',
        single: true,
        filters: (q) => q.eq('id', id)
    });
    if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Automation not found.' });
        throw error;
    }
    // Sort steps by step_order
    if (data.automation_steps) {
        data.automation_steps.sort((a, b) => a.step_order - b.step_order);
    }
    res.json({ data });
});

export const createAutomation = asyncHandler(async (req, res) => {
    const { name, trigger_event, status, steps } = req.body;

    const { data: automation, error } = await supabaseAdmin
        .from('automations')
        .insert({ name, trigger_event, status: status || 'Draft', version: 1 })
        .select('*')
        .single();
    if (error) throw error;

    if (steps && steps.length > 0) {
        const stepsToInsert = steps.map((s, index) => ({
            automation_id: automation.id,
            automation_version: 1,
            step_order: index + 1,
            step_type: s.step_type,
            config: s.config || {}
        }));
        await supabaseAdmin.from('automation_steps').insert(stepsToInsert);
    }

    res.json({ data: automation });
});

export const updateAutomation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, trigger_event, status, steps } = req.body;

    // Fetch current version
    const { data: current } = await supabaseAdmin.from('automations').select('version').eq('id', id).single();
    const newVersion = (current?.version || 1) + 1;

    const { data: automation, error } = await supabaseAdmin
        .from('automations')
        .update({ name, trigger_event, status, version: newVersion, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();
    if (error) throw error;

    if (steps) {
        const stepsToInsert = steps.map((s, index) => ({
            automation_id: automation.id,
            automation_version: newVersion,
            step_order: index + 1,
            step_type: s.step_type,
            config: s.config || {}
        }));
        await supabaseAdmin.from('automation_steps').insert(stepsToInsert);
    }

    res.json({ data: automation });
});

export const duplicateAutomation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Fetch original
    const { data: original } = await resilientQuery(supabaseAdmin, {
        table: 'automations',
        select: '*, automation_steps(*)',
        single: true,
        filters: (q) => q.eq('id', id)
    });

    const { data: newAutomation, error } = await supabaseAdmin
        .from('automations')
        .insert({ 
            name: `${original.name} (Copy)`, 
            trigger_event: original.trigger_event, 
            status: 'Draft', 
            version: 1 
        })
        .select('*')
        .single();
    if (error) throw error;

    if (original.automation_steps && original.automation_steps.length > 0) {
        const stepsToInsert = original.automation_steps
            .filter(s => s.automation_version === original.version)
            .map((s) => ({
                automation_id: newAutomation.id,
                automation_version: 1,
                step_order: s.step_order,
                step_type: s.step_type,
                config: s.config
            }));
        await supabaseAdmin.from('automation_steps').insert(stepsToInsert);
    }

    res.json({ data: newAutomation });
});

// ----------------------------------------------------------------------------
// Templates
// ----------------------------------------------------------------------------
export const listTemplates = asyncHandler(async (req, res) => {
    const { channel } = req.query; // 'email' or 'whatsapp'
    const table = channel === 'whatsapp' ? 'whatsapp_templates' : 'email_templates';
    const { data, error } = await resilientQuery(supabaseAdmin, { table, select: '*', order: 'created_at', ascending: false });
    if (error) throw error;
    res.json({ data });
});

export const saveTemplate = asyncHandler(async (req, res) => {
    const { channel } = req.query; // 'email' or 'whatsapp'
    const table = channel === 'whatsapp' ? 'whatsapp_templates' : 'email_templates';
    
    if (req.body.id) {
        const { data, error } = await supabaseAdmin.from(table).update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.body.id).select('*').single();
        if (error) throw error;
        res.json({ data });
    } else {
        const { data, error } = await supabaseAdmin.from(table).insert(req.body).select('*').single();
        if (error) throw error;
        res.json({ data });
    }
});

// ----------------------------------------------------------------------------
// Logs and Runs
// ----------------------------------------------------------------------------
export const listRuns = asyncHandler(async (req, res) => {
    const { automation_id } = req.query;
    const { data, error } = await resilientQuery(supabaseAdmin, {
        table: 'automation_runs',
        select: '*, customer:profiles(*)',
        order: 'started_at',
        ascending: false,
        filters: (q) => automation_id ? q.eq('automation_id', automation_id) : q
    });
    if (error) throw error;
    res.json({ data });
});

export const listCommunicationLogs = asyncHandler(async (req, res) => {
    const { data, error } = await resilientQuery(supabaseAdmin, {
        table: 'communication_logs',
        select: '*, customer:profiles(*), automation_run:automation_runs(automation_id)',
        order: 'sent_at',
        ascending: false,
    });
    if (error) throw error;
    res.json({ data });
});
