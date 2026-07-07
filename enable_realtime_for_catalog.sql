-- Run this script in your Supabase SQL Editor to enable Realtime for catalog tables
-- This allows your backend server to instantly detect catalog changes and send webhooks to Shiprocket without any manual sync.

begin;

-- Remove the supabase_realtime publication if it doesn't exist, though it usually does
drop publication if exists supabase_realtime;
create publication supabase_realtime;

-- Add the catalog tables to the realtime publication
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table product_variants;
alter publication supabase_realtime add table product_images;
alter publication supabase_realtime add table categories;

commit;

-- Note: You may also need to go to your Supabase Dashboard -> Database -> Replication
-- and ensure that Replication is enabled for the `supabase_realtime` publication for these 4 tables.
