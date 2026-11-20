-- ============================================================
-- Recovery PWA - Supabase Database Schema
-- Run this in your Supabase Project -> SQL Editor
-- ============================================================

-- 1. Real user profiles (stores anonymous alias + email for updates)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  alias text not null,
  streak_start timestamptz default now(),
  created_at timestamptz default now()
);

-- 2. Open Group Chat messages
create table if not exists public.group_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  alias text not null,
  content text not null,
  created_at timestamptz default now()
);

-- 3. Connections (people you have linked up with)
create table if not exists public.connections (
  id uuid default gen_random_uuid() primary key,
  user_a uuid references public.profiles(id) on delete cascade not null,
  user_b uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_a, user_b)
);

-- 4. 1-on-1 Direct Messages
create table if not exists public.direct_messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.group_messages enable row level security;
alter table public.connections enable row level security;
alter table public.direct_messages enable row level security;

-- Policies (only logged-in users can read/write)
drop policy if exists "Profiles are viewable by logged-in users" on public.profiles;
create policy "Profiles are viewable by logged-in users" on public.profiles for select using (auth.role() = 'authenticated');

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Group messages viewable by logged-in users" on public.group_messages;
create policy "Group messages viewable by logged-in users" on public.group_messages for select using (auth.role() = 'authenticated');

drop policy if exists "Logged-in users can post group messages" on public.group_messages;
create policy "Logged-in users can post group messages" on public.group_messages for insert with check (auth.uid() = user_id);

drop policy if exists "Users see their own connections" on public.connections;
create policy "Users see their own connections" on public.connections for select using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Users can create connections" on public.connections;
create policy "Users can create connections" on public.connections for insert with check (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Users see their own DMs" on public.direct_messages;
create policy "Users see their own DMs" on public.direct_messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can send DMs" on public.direct_messages;
create policy "Users can send DMs" on public.direct_messages for insert with check (auth.uid() = sender_id);

-- Turn on Realtime for chats
alter publication supabase_realtime add table public.group_messages;
alter publication supabase_realtime add table public.direct_messages;
alter publication supabase_realtime add table public.connections;
