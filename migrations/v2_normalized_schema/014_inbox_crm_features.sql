-- 014_inbox_crm_features.sql
BEGIN;

-- ============================================================
-- 1. Create WHATSAPP_CHATS table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    phone TEXT NOT NULL UNIQUE,
    display_name TEXT,
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    unread_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Open', 'Waiting Customer', 'Resolved', 'Spam')),
    priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Realtime replication for chats
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'whatsapp_chats'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_chats;
  END IF;
END $$;

-- RLS for chats
ALTER TABLE public.whatsapp_chats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage whatsapp_chats" ON public.whatsapp_chats;
CREATE POLICY "Admins can manage whatsapp_chats"
ON public.whatsapp_chats
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role::text IN ('Admin', 'Super Admin', 'Manager')
  )
);

-- ============================================================
-- 2. Create WHATSAPP_NOTES table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.whatsapp_chats(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage whatsapp_notes" ON public.whatsapp_notes;
CREATE POLICY "Admins can manage whatsapp_notes"
ON public.whatsapp_notes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role::text IN ('Admin', 'Super Admin', 'Manager')
  )
);

-- ============================================================
-- 3. Create WHATSAPP_REMINDERS table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.whatsapp_chats(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage whatsapp_reminders" ON public.whatsapp_reminders;
CREATE POLICY "Admins can manage whatsapp_reminders"
ON public.whatsapp_reminders
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role::text IN ('Admin', 'Super Admin', 'Manager')
  )
);

-- ============================================================
-- 4. Alter WHATSAPP_MESSAGES table
-- ============================================================
ALTER TABLE public.whatsapp_messages ADD COLUMN IF NOT EXISTS chat_id UUID REFERENCES public.whatsapp_chats(id) ON DELETE SET NULL;

-- ============================================================
-- 5. Trigger to Sync Whatsapp Messages to Chats
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_whatsapp_chat()
RETURNS TRIGGER AS $$
DECLARE
  v_chat_id UUID;
  v_customer_id UUID;
  v_display_name TEXT;
  v_normalized_phone TEXT;
BEGIN
  -- Normalize phone (remove non-digits, keep '+' if present, though Swadyum usually has pure digits)
  v_normalized_phone := regexp_replace(NEW.sender_phone, '\D', '', 'g');
  
  -- Try to find existing chat by normalized phone
  SELECT id INTO v_chat_id FROM public.whatsapp_chats WHERE regexp_replace(phone, '\D', '', 'g') = v_normalized_phone LIMIT 1;
  
  -- Try to find customer by phone
  IF v_chat_id IS NULL OR (SELECT customer_id FROM public.whatsapp_chats WHERE id = v_chat_id) IS NULL THEN
    SELECT id INTO v_customer_id FROM public.profiles WHERE regexp_replace(phone, '\D', '', 'g') = v_normalized_phone LIMIT 1;
  ELSE
    SELECT customer_id INTO v_customer_id FROM public.whatsapp_chats WHERE id = v_chat_id;
  END IF;

  -- Determine display name
  IF NEW.direction = 'inbound' AND NEW.sender_name IS NOT NULL AND NEW.sender_name != 'Unknown Sender' THEN
    v_display_name := NEW.sender_name;
  ELSIF v_customer_id IS NOT NULL THEN
    SELECT name INTO v_display_name FROM public.profiles WHERE id = v_customer_id;
  END IF;

  IF v_chat_id IS NULL THEN
    -- Create new chat
    INSERT INTO public.whatsapp_chats (
      customer_id, phone, display_name, last_message, last_message_at, unread_count, status
    ) VALUES (
      v_customer_id, NEW.sender_phone, COALESCE(v_display_name, NEW.sender_phone), NEW.message_body, NEW.created_at, CASE WHEN NEW.direction = 'inbound' THEN 1 ELSE 0 END, 'New'
    ) RETURNING id INTO v_chat_id;
  ELSE
    -- Update existing chat
    UPDATE public.whatsapp_chats
    SET 
      last_message = NEW.message_body,
      last_message_at = NEW.created_at,
      display_name = COALESCE(v_display_name, display_name),
      customer_id = COALESCE(v_customer_id, customer_id),
      unread_count = CASE WHEN NEW.direction = 'inbound' THEN unread_count + 1 ELSE unread_count END,
      status = CASE WHEN NEW.direction = 'inbound' AND status IN ('Resolved', 'Waiting Customer') THEN 'Open' ELSE status END,
      updated_at = now()
    WHERE id = v_chat_id;
  END IF;

  -- Attach chat_id to the incoming message
  NEW.chat_id := v_chat_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_whatsapp_chat ON public.whatsapp_messages;
CREATE TRIGGER trigger_sync_whatsapp_chat
BEFORE INSERT ON public.whatsapp_messages
FOR EACH ROW
EXECUTE FUNCTION public.sync_whatsapp_chat();

-- ============================================================
-- 6. Backfill existing messages to chats
-- ============================================================
DO $$
DECLARE
  msg RECORD;
BEGIN
  FOR msg IN 
    SELECT * FROM public.whatsapp_messages ORDER BY created_at ASC
  LOOP
    -- For each historical message, we'll mimic the trigger manually
    -- Note: The trigger is BEFORE INSERT, so it will fire for NEW inserts.
    -- For existing messages, we just do a direct UPDATE/INSERT.
    DECLARE
      v_chat_id UUID;
      v_customer_id UUID;
      v_normalized_phone TEXT;
    BEGIN
      v_normalized_phone := regexp_replace(msg.sender_phone, '\D', '', 'g');
      
      SELECT id INTO v_chat_id FROM public.whatsapp_chats WHERE regexp_replace(phone, '\D', '', 'g') = v_normalized_phone LIMIT 1;
      
      IF v_chat_id IS NULL THEN
        SELECT id INTO v_customer_id FROM public.profiles WHERE regexp_replace(phone, '\D', '', 'g') = v_normalized_phone LIMIT 1;
        
        INSERT INTO public.whatsapp_chats (
          customer_id, phone, display_name, last_message, last_message_at, unread_count, status
        ) VALUES (
          v_customer_id, msg.sender_phone, COALESCE(msg.sender_name, msg.sender_phone), msg.message_body, msg.created_at, CASE WHEN msg.direction = 'inbound' THEN 1 ELSE 0 END, 'Open'
        ) RETURNING id INTO v_chat_id;
      ELSE
        UPDATE public.whatsapp_chats
        SET 
          last_message = msg.message_body,
          last_message_at = msg.created_at,
          unread_count = CASE WHEN msg.direction = 'inbound' THEN unread_count + 1 ELSE unread_count END
        WHERE id = v_chat_id;
      END IF;
      
      -- Update message with chat_id
      UPDATE public.whatsapp_messages SET chat_id = v_chat_id WHERE id = msg.id;
    END;
  END LOOP;
END $$;

COMMIT;
