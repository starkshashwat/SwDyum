import { supabaseAdmin } from '../config/supabaseClient.js';

// ====================================================================
// Template Variable Processing
// ====================================================================

/**
 * Replaces variables like {{customer_name}} in a string with actual values from data object.
 */
function processTemplate(text, data) {
    if (!text) return '';
    let processed = text;
    
    // Flatten nested objects for template replacement
    const flatData = flattenObject(data);
    
    for (const [key, value] of Object.entries(flatData)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        processed = processed.replace(regex, value != null ? String(value) : '');
    }
    return processed;
}

/**
 * Flattens nested objects so {shipping_details: {name: 'X'}} becomes {shipping_details_name: 'X'}
 * Also keeps top-level keys.
 */
function flattenObject(obj, prefix = '') {
    const result = {};
    for (const [key, value] of Object.entries(obj || {})) {
        const fullKey = prefix ? `${prefix}_${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(result, flattenObject(value, fullKey));
        }
        result[fullKey] = value;
    }
    return result;
}

// ====================================================================
// Provider Abstraction Layer
// ====================================================================

/**
 * Email Provider abstraction.
 * Currently supports Brevo. Extensible to Resend, SES, etc.
 */
const EmailProviders = {
    async brevo(to, subject, html, senderName = 'Swadyum', senderEmail = 'no-reply@swadyum.store') {
        const brevoApiKey = process.env.BREVO_API_KEY;
        if (!brevoApiKey) return { success: false, mock: true, messageId: `mock-email-${Date.now()}` };

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': brevoApiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sender: { name: senderName, email: senderEmail },
                to: [{ email: to.email, name: to.name }],
                subject,
                htmlContent: html,
            }),
        });

        if (!response.ok) {
            const errRes = await response.json();
            return { success: false, error: JSON.stringify(errRes) };
        }

        const successRes = await response.json();
        return { success: true, messageId: successRes.messageId };
    }
};

/**
 * WhatsApp Provider abstraction.
 * Currently supports Meta Cloud API. Extensible to other providers.
 */
const WhatsAppProviders = {
    async meta(phone, template, language) {
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (!accessToken || !phoneNumberId) {
            return { success: false, mock: true, messageId: `mock-wa-${Date.now()}` };
        }

        const metaUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
        const cleanPhone = String(phone).replace(/\D/g, '');

        const payload = {
            messaging_product: "whatsapp",
            to: cleanPhone,
            type: "template",
            template: {
                name: template.template_id,
                language: { code: language || 'en_US' }
            }
        };

        const response = await fetch(metaUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errRes = await response.json();
            return { success: false, error: JSON.stringify(errRes) };
        }

        const successRes = await response.json();
        return { success: true, messageId: successRes.messages?.[0]?.id || `meta-${Date.now()}` };
    }
};

// ====================================================================
// Retry Helper
// ====================================================================

/**
 * Retries a function up to maxRetries times with exponential backoff.
 */
async function withRetry(fn, maxRetries = 3, baseDelayMs = 2000) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
                const delay = baseDelayMs * Math.pow(2, attempt - 1);
                console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError;
}

// ====================================================================
// Communication Service
// ====================================================================

export const CommunicationService = {
    /**
     * Check customer communication preferences before sending.
     * Returns true if allowed to send, false if customer has opted out.
     */
    async checkPreference(customerId, channel) {
        if (!customerId) return true; // No customer, allow send (edge case)

        try {
            const { data: prefs } = await supabaseAdmin
                .from('communication_preferences')
                .select('*')
                .eq('customer_id', customerId)
                .single();

            if (!prefs) return true; // No preferences record = default opt-in

            // For now, treat all automation messages as marketing
            if (channel === 'email') return prefs.email_marketing !== false;
            if (channel === 'whatsapp') return prefs.whatsapp_marketing !== false;
            return true;
        } catch {
            return true; // Default to allow if preferences check fails
        }
    },

    /**
     * Check for duplicate messages to prevent same template being sent to same customer in same run.
     */
    async isDuplicateMessage(customerId, templateName, automationRunId) {
        if (!automationRunId) return false;

        const { data } = await supabaseAdmin
            .from('communication_logs')
            .select('id')
            .eq('customer_id', customerId)
            .eq('template_name', templateName)
            .eq('automation_run_id', automationRunId)
            .in('status', ['Sent', 'Delivered', 'Read'])
            .limit(1);

        return data && data.length > 0;
    },

    async sendEmail(customer, templateId, contextData, automationRunId = null) {
        try {
            // Fetch template
            const { data: template, error: tmplError } = await supabaseAdmin
                .from('email_templates')
                .select('*')
                .eq('id', templateId)
                .single();

            if (tmplError || !template) throw new Error('Email template not found');

            // Duplicate message protection
            if (automationRunId && customer?.id) {
                const isDup = await this.isDuplicateMessage(customer.id, template.name, automationRunId);
                if (isDup) {
                    console.log(`Duplicate email to ${customer.email} with template ${template.name} in run ${automationRunId}. Skipping.`);
                    return true;
                }
            }

            const subject = processTemplate(template.subject, contextData);
            const html = processTemplate(template.body_html, contextData);

            // Send with retry
            const result = await withRetry(async () => {
                const res = await EmailProviders.brevo(
                    { email: customer.email, name: customer.full_name || customer.name },
                    subject,
                    html
                );

                if (res.mock) {
                    console.log(`[MOCK EMAIL] To: ${customer.email} | Subject: ${subject}`);
                    return { status: 'Sent', providerMessageId: res.messageId };
                }

                if (!res.success) throw new Error(`Email sending failed: ${res.error}`);
                return { status: 'Sent', providerMessageId: res.messageId };
            });

            // Log communication
            await supabaseAdmin.from('communication_logs').insert({
                customer_id: customer.id,
                channel: 'Email',
                automation_run_id: automationRunId,
                template_name: template.name,
                status: result.status,
                provider_message_id: result.providerMessageId,
            });

            return true;
        } catch (error) {
            console.error('sendEmail Error:', error);
            await supabaseAdmin.from('communication_logs').insert({
                customer_id: customer?.id,
                channel: 'Email',
                automation_run_id: automationRunId,
                status: 'Failed',
                error_message: error.message
            });
            throw error;
        }
    },

    async sendWhatsApp(customer, templateId, contextData, automationRunId = null) {
        try {
            // Fetch template
            const { data: template, error: tmplError } = await supabaseAdmin
                .from('whatsapp_templates')
                .select('*')
                .eq('id', templateId)
                .single();

            if (tmplError || !template) throw new Error('WhatsApp template not found');

            // Duplicate message protection
            if (automationRunId && customer?.id) {
                const isDup = await this.isDuplicateMessage(customer.id, template.name, automationRunId);
                if (isDup) {
                    console.log(`Duplicate WhatsApp to ${customer.phone} with template ${template.name} in run ${automationRunId}. Skipping.`);
                    return true;
                }
            }

            // Send with retry
            const result = await withRetry(async () => {
                const res = await WhatsAppProviders.meta(
                    customer.phone,
                    template,
                    template.language || 'en_US'
                );

                if (res.mock) {
                    console.log(`[MOCK WHATSAPP] To: ${customer.phone} | Template: ${template.name}`);
                    return { status: 'Sent', providerMessageId: res.messageId };
                }

                if (!res.success) throw new Error(`WhatsApp sending failed: ${res.error}`);
                return { status: 'Sent', providerMessageId: res.messageId };
            });

            // Log communication
            await supabaseAdmin.from('communication_logs').insert({
                customer_id: customer.id,
                channel: 'WhatsApp',
                automation_run_id: automationRunId,
                template_name: template.name,
                status: result.status,
                provider_message_id: result.providerMessageId,
            });

            return true;
        } catch (error) {
            console.error('sendWhatsApp Error:', error);
            await supabaseAdmin.from('communication_logs').insert({
                customer_id: customer?.id,
                channel: 'WhatsApp',
                automation_run_id: automationRunId,
                status: 'Failed',
                error_message: error.message
            });
            throw error;
        }
    }
};
