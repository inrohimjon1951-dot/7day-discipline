-- ================================================
-- 7 DAY DISCIPLINE — Supabase SQL Schema
-- Supabase SQL Editor ga bu kodni to'liq paste qiling
-- ================================================

-- 1. USERS TABLE
create table if not exists public.users (
  id         uuid primary key default gen_random_uuid(),
  username   text unique not null check (username in ('muhammadyusuf', 'shavkatjon')),
  email      text unique not null,
  created_at timestamptz default now()
);

-- 2. TASK_LOGS TABLE (har kunlik progress)
create table if not exists public.task_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete cascade,
  date        date not null default current_date,
  task_id     text not null,
  completed   boolean default false,
  sub_data    jsonb default '{}',
  input_data  jsonb default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(user_id, date, task_id)
);

-- 3. REACTIONS TABLE
create table if not exists public.reactions (
  id         uuid primary key default gen_random_uuid(),
  task_log_id uuid references public.task_logs(id) on delete cascade,
  user_id    uuid references public.users(id) on delete cascade,
  emoji      text not null,
  count      int default 1,
  created_at timestamptz default now(),
  unique(task_log_id, user_id, emoji)
);

-- 4. STREAKS TABLE
create table if not exists public.streaks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.users(id) on delete cascade unique,
  current_streak int default 0,
  longest_streak int default 0,
  total_completed int default 0,
  last_completed_date date,
  updated_at   timestamptz default now()
);

-- 5. UPDATED_AT trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger task_logs_updated_at
  before update on public.task_logs
  for each row execute function update_updated_at();

create trigger streaks_updated_at
  before update on public.streaks
  for each row execute function update_updated_at();

-- 6. ROW LEVEL SECURITY
alter table public.users     enable row level security;
alter table public.task_logs enable row level security;
alter table public.reactions enable row level security;
alter table public.streaks   enable row level security;

-- Users: o'zini ko'rishi mumkin, ikkisi ham ko'rishi mumkin
create policy "Users can view all users"
  on public.users for select using (true);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

-- Task logs: barcha ko'rishi mumkin, faqat o'zi yoza oladi
create policy "Anyone can view task_logs"
  on public.task_logs for select using (true);

create policy "Users can insert own task_logs"
  on public.task_logs for insert with check (auth.uid() = user_id);

create policy "Users can update own task_logs"
  on public.task_logs for update using (auth.uid() = user_id);

-- Reactions: barcha ko'rishi, o'zi yozishi
create policy "Anyone can view reactions"
  on public.reactions for select using (true);

create policy "Users can manage own reactions"
  on public.reactions for all using (auth.uid() = user_id);

-- Streaks: barcha ko'rishi
create policy "Anyone can view streaks"
  on public.streaks for select using (true);

create policy "Users can update own streaks"
  on public.streaks for all using (auth.uid() = user_id);

-- 7. REALTIME — bu tablalar uchun realtime yoqish
-- Supabase Dashboard > Database > Replication da quyidagilarni enable qiling:
-- task_logs, reactions, streaks

-- 8. AUTH: faqat ikki email qabul qilinadi
-- Bu Supabase Auth > Settings > Allowed emails ga qo'shing:
-- (yoki email confirmation o'chiring test uchun)
