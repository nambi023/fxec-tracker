-- ============================================================
-- FXEC Student Tracker - Supabase schema
-- Run this in Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- If you already ran an earlier version of this schema (tables already
-- exist), just run this one line to add the new column, then skip to the
-- rest of the file - the "create table if not exists" below will just be
-- skipped for tables that already exist.
alter table if exists checkins add column if not exists task_plan text;

-- 1. Profiles table (one row per student/admin, auto-created on first login)
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  email text not null,
  full_name text,
  roll_number text,
  role text not null default 'student', -- 'student' or 'admin'
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);


-- 2. Checkins table (one row per student per slot per day)
create table if not exists checkins (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references auth.users(id) not null,
  slot_number int not null,
  lat double precision not null,
  lng double precision not null,
  zone_matched text,
  activity_claimed text not null,
  task_plan text, -- free-text: what exactly the student is working on
  status text not null, -- 'verified' | 'mismatch' | 'review' | 'missed'
  created_at timestamptz default now()
);

alter table checkins enable row level security;

create policy "Students can insert their own checkins"
  on checkins for insert
  with check (auth.uid() = student_id);

create policy "Students can view their own checkins"
  on checkins for select
  using (auth.uid() = student_id);

create policy "Admins can view all checkins"
  on checkins for select
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Speeds up "today's checkins" and per-student history queries
create index if not exists idx_checkins_student_date
  on checkins (student_id, created_at desc);


-- 3. Auto-create a profile row whenever a new user signs in for the first time
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 4. Domain restriction (server-side, cannot be bypassed by disabling JS)
-- This uses a Postgres function wired up as a Supabase "Before User Created"
-- Auth Hook. Go to: Dashboard -> Authentication -> Hooks -> Before User
-- Created, and select this function. Non-college emails will be rejected
-- even if someone bypasses the frontend check.
create or replace function public.restrict_signup_domain()
returns trigger as $$
begin
  if new.email is not null and new.email not like '%@francisxavier.ac.in' then
    raise exception 'Only francisxavier.ac.in college emails are allowed';
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- NOTE: wiring this as a live Before-User-Created hook must be done from the
-- Supabase dashboard UI (Authentication -> Hooks), not via plain SQL trigger,
-- because auth.users is a protected schema. The function above is ready to
-- select from that dropdown.


-- 5. To make yourself an admin after your first login, run:
-- update profiles set role = 'admin' where email = 'your-email@francisxavier.ac.in';
