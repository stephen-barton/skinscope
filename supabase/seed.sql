-- Seed test users via Supabase auth (only works in local dev with supabase db reset)
-- These use the auth.users table directly for seeding purposes

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
VALUES
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'test@skinscope.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated'),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'pro@skinscope.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated'),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'admin@skinscope.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- The trigger auto-creates user_profiles, but we need to set tiers
UPDATE public.user_profiles SET tier = 'free' WHERE id = 'a0000000-0000-0000-0000-000000000001';
UPDATE public.user_profiles SET tier = 'pro' WHERE id = 'a0000000-0000-0000-0000-000000000002';
UPDATE public.user_profiles SET tier = 'pro' WHERE id = 'a0000000-0000-0000-0000-000000000003';
