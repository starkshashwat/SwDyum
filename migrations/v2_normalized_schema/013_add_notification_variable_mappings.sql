-- Add JSONB column for WhatsApp template variable mappings
ALTER TABLE public.notification_settings ADD COLUMN IF NOT EXISTS variable_mappings JSONB DEFAULT '{}'::jsonb;

-- Comment on the column
COMMENT ON COLUMN public.notification_settings.variable_mappings IS 'JSON object storing the mapping of Meta template variables to system fields. Format: {"component_type": {"variable_index": "system_field"}}. Example: {"body": {"1": "customer_name", "2": "order_number"}}';
