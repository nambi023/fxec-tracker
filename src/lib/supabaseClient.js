import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env vars missing. Create a .env file from .env.example and add your project URL + anon key.'
  );
}

export const supabase = createClient(url || '', key || '');

// Only this email domain is allowed to sign in. Who is an admin vs a
// student is decided by the `role` column in the `profiles` table (Supabase
// Table Editor -> profiles -> set role = 'admin' for that row), not here.
export const ALLOWED_DOMAIN = '@francisxavier.ac.in';
