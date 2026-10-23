create table if not exists public.love_wishes (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  wish_titles text[] not null check (cardinality(wish_titles) between 1 and 5),
  message text not null default '' check (char_length(message) <= 1000),
  response text check (response is null or char_length(response) <= 160),
  created_at timestamptz not null default now()
);
create index if not exists love_wishes_created_at_idx on public.love_wishes (created_at desc);
alter table public.love_wishes enable row level security;
create policy couple_members_read_love_wishes on public.love_wishes for select to authenticated using (public.is_couple_member());
create policy couple_members_send_love_wishes on public.love_wishes for insert to authenticated with check (public.is_couple_member() and sender_id = auth.uid());
create policy couple_members_reply_love_wishes on public.love_wishes for update to authenticated using (public.is_couple_member()) with check (public.is_couple_member());
revoke all on table public.love_wishes from public, anon;
grant select, insert, update on table public.love_wishes to authenticated;
