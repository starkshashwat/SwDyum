-- SQL Script to create the whatsapp_messages table and enable realtime

-- Create table to store WhatsApp messages
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp_message_id TEXT UNIQUE,
  sender_phone TEXT NOT NULL,
  sender_name TEXT,
  message_body TEXT,
  message_type TEXT DEFAULT 'text',
  direction TEXT CHECK (direction IN ('inbound', 'outbound')) NOT NULL,
  raw_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service_role / admin to do everything
CREATE POLICY "Allow service role full access" ON public.whatsapp_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Enable Realtime for live chat dashboard
ALTER TABLE public.whatsapp_messages REPLICA IDENTITY FULL;

-- Add whatsapp_messages to the supabase_realtime publication
-- Note: If publication doesn't exist, this might fail, but it's standard for supabase.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
  END IF;
END $$;
