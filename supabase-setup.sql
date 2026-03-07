-- ============================================
-- OneWord Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  current_streak integer default 0,
  longest_streak integer default 0,
  total_plays integer default 0,
  total_votes_received integer default 0,
  best_rank integer,
  last_played_date date,
  language text default 'en',
  push_token text,
  notifications_enabled boolean default false,
  notification_time time,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- 2. DAILY WORDS TABLE
create table public.daily_words (
  id uuid default gen_random_uuid() primary key,
  word text not null,
  date date not null unique,
  category text not null default 'general',
  language text not null default 'en',
  created_at timestamptz default now()
);

alter table public.daily_words enable row level security;

create policy "Words are viewable by everyone"
  on public.daily_words for select using (true);

-- 3. DESCRIPTIONS TABLE
create table public.descriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  word_id uuid references public.daily_words(id) on delete cascade not null,
  description text not null,
  vote_count integer default 0,
  elo_rating integer default 1200,
  rank integer,
  language text default 'en',
  created_at timestamptz default now(),
  unique(user_id, word_id)
);

alter table public.descriptions enable row level security;

create policy "Descriptions are viewable by everyone"
  on public.descriptions for select using (true);

create policy "Users can insert their own descriptions"
  on public.descriptions for insert with check (auth.uid() = user_id);

create policy "Users can update their own descriptions"
  on public.descriptions for update using (auth.uid() = user_id);

-- 4. VOTES TABLE
create table public.votes (
  id uuid default gen_random_uuid() primary key,
  voter_id uuid references public.profiles(id) on delete cascade not null,
  word_id uuid references public.daily_words(id) on delete cascade not null,
  winner_id uuid references public.descriptions(id) on delete cascade not null,
  loser_id uuid references public.descriptions(id) on delete cascade not null,
  created_at timestamptz default now()
);

alter table public.votes enable row level security;

create policy "Votes are viewable by everyone"
  on public.votes for select using (true);

create policy "Authenticated users can vote"
  on public.votes for insert with check (auth.uid() = voter_id);

-- 5. FRIENDSHIPS TABLE
create table public.friendships (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  addressee_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(requester_id, addressee_id)
);

alter table public.friendships enable row level security;

create policy "Users can view their own friendships"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Users can create friend requests"
  on public.friendships for insert with check (auth.uid() = requester_id);

create policy "Users can update friendships addressed to them"
  on public.friendships for update
  using (auth.uid() = addressee_id);

-- 6. RPC: get_today_word
create or replace function public.get_today_word(p_language text default 'en')
returns public.daily_words
language sql
security definer
as $$
  select * from public.daily_words
  where date = current_date and language = p_language
  limit 1;
$$;

-- 7. RPC: get_vote_pair (returns two random descriptions for voting)
create or replace function public.get_vote_pair(p_word_id uuid, p_voter_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_build_object(
    'option_a', json_build_object('id', a.id, 'description', a.description, 'user_id', a.user_id),
    'option_b', json_build_object('id', b.id, 'description', b.description, 'user_id', b.user_id)
  ) into result
  from (
    select * from public.descriptions
    where word_id = p_word_id and user_id != p_voter_id
    order by random()
    limit 1
  ) a
  cross join (
    select * from public.descriptions
    where word_id = p_word_id and user_id != p_voter_id
    order by random()
    limit 1 offset 1
  ) b;

  return result;
end;
$$;

-- 8. Insert today's word so the game works immediately!
insert into public.daily_words (word, date, category, language)
values
  ('Sunset', current_date, 'nature', 'en'),
  ('Atardecer', current_date, 'naturaleza', 'es');

-- 9. Auto-create profile on signup (optional trigger)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'player_' || left(new.id::text, 8)),
    coalesce(new.raw_user_meta_data->>'language', 'en')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
