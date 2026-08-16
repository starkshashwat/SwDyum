BEGIN;

-- ====================================================================
-- AUTOMATION ENGINE: Auth Trigger Update
-- Updates handle_new_user to insert into automation_events for the 
-- 'customer_registered' trigger.
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_name TEXT;
  v_provider TEXT;
BEGIN
  v_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '');
  v_provider := COALESCE(new.raw_app_meta_data->>'provider', 'email');

  -- 1. Insert into profiles
  INSERT INTO public.profiles (id, name, email, phone, role, provider, email_verified)
  VALUES (
    new.id,
    v_name,
    new.email,
    new.phone,
    'Customer',
    v_provider,
    CASE WHEN new.email_confirmed_at IS NOT NULL THEN true ELSE false END
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Trigger Automation Engine Event
  INSERT INTO public.automation_events (event_id, event_name, customer_id, payload, processed)
  VALUES (
    new.id::text || '_customer_registered',
    'customer_registered',
    new.id,
    jsonb_build_object(
      'customer_name', v_name,
      'customer_email', new.email,
      'customer_phone', new.phone,
      'provider', v_provider
    ),
    false
  )
  ON CONFLICT (event_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
