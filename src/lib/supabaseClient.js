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

// Only these email domains are allowed to sign in. Add the admin/club-lead
// emails to ADMIN_EMAILS so they land on the admin dashboard instead of the
// student one.
export const ALLOWED_DOMAIN = '@francisxavier.ac.in';

export const ADMIN_EMAILS = [
  // 'yourname@francisxavier.ac.in',
];
