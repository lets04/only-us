-- OnlyUs: schema, authorization and private Storage.
-- Apply this migration from the Supabase SQL Editor or the Supabase CLI.
-- Never use a service_role, secret key or admin credential in the browser.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Miembro de OnlyUs' check (char_length(display_name) between 1 and 80),
  avatar_path text,
  is_couple_member boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_avatar_path_format check (avatar_path is null or avatar_path ~ '^avatars/[0-9a-f-]+\.(jpg|jpeg|png|webp)$')
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 140),
  memory_date date not null,
  description text not null check (char_length(description) between 1 and 4000),
  photo_path text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memories_photo_path_format check (photo_path is null or photo_path ~ '^shared/[0-9a-f-]+\.(jpg|jpeg|png|webp)$')
);

create index if not exists memories_memory_date_idx on public.memories (memory_date desc, created_at desc);
create index if not exists memories_created_by_idx on public.memories (created_by);

-- This function reads profiles as its owner, so the policies below do not recurse.
-- It has no arguments and only answers for the current authenticated user.
create or replace function public.is_couple_member()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.profiles as profile
    where profile.id = auth.uid()
      and profile.is_couple_member is true
  );
$$;

revoke all on function public.is_couple_member() from public;
grant execute on function public.is_couple_member() to authenticated;

alter table public.profiles enable row level security;
alter table public.memories enable row level security;
alter table storage.objects enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "members read authorised profiles" on public.profiles;
drop policy if exists "members update own profile" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated
  using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "members_read_shared_memories" on public.memories;
drop policy if exists "members_create_shared_memories" on public.memories;
drop policy if exists "members_update_shared_memories" on public.memories;
drop policy if exists "members_delete_shared_memories" on public.memories;
drop policy if exists "members read shared memories" on public.memories;
drop policy if exists "members create shared memories" on public.memories;
drop policy if exists "members update shared memories" on public.memories;
drop policy if exists "members delete shared memories" on public.memories;
create policy "members_read_shared_memories" on public.memories for select to authenticated
  using (public.is_couple_member());
create policy "members_create_shared_memories" on public.memories for insert to authenticated
  with check (public.is_couple_member() and created_by = auth.uid());
-- Memories are intentionally shared: either authorized member may edit or delete them.
create policy "members_update_shared_memories" on public.memories for update to authenticated
  using (public.is_couple_member())
  with check (public.is_couple_member());
create policy "members_delete_shared_memories" on public.memories for delete to authenticated
  using (public.is_couple_member());

-- Authenticated clients receive only the least table and column privileges required by the app.
revoke all on table public.profiles from public, anon, authenticated;
grant select (id, display_name, avatar_path, created_at, updated_at) on public.profiles to authenticated;
grant update (display_name, avatar_path) on public.profiles to authenticated;
revoke all on table public.memories from public, anon, authenticated;
grant select on public.memories to authenticated;
grant insert (title, memory_date, description, photo_path, created_by) on public.memories to authenticated;
grant update (title, memory_date, description, photo_path) on public.memories to authenticated;
grant delete on public.memories to authenticated;

-- The bucket stays private. The migration creates it when it does not exist and hardens
-- it on reruns. It accepts only the formats handled by the client, up to 5 MiB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('memory-photos', 'memory-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "onlyus_members_read_memory_photos" on storage.objects;
drop policy if exists "onlyus_members_insert_memory_photos" on storage.objects;
drop policy if exists "onlyus_members_update_memory_photos" on storage.objects;
drop policy if exists "onlyus_members_delete_memory_photos" on storage.objects;
create policy "onlyus_members_read_memory_photos" on storage.objects for select to authenticated
  using (
    bucket_id = 'memory-photos'
    and name ~ '^shared/[0-9a-f-]+\.(jpg|jpeg|png|webp)$'
    and public.is_couple_member()
  );
create policy "onlyus_members_insert_memory_photos" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'memory-photos'
    and name ~ '^shared/[0-9a-f-]+\.(jpg|jpeg|png|webp)$'
    and lower(coalesce(metadata->>'mimetype', '')) in ('image/jpeg', 'image/png', 'image/webp')
    and public.is_couple_member()
  );
create policy "onlyus_members_update_memory_photos" on storage.objects for update to authenticated
  using (
    bucket_id = 'memory-photos'
    and name ~ '^shared/[0-9a-f-]+\.(jpg|jpeg|png|webp)$'
    and public.is_couple_member()
  )
  with check (
    bucket_id = 'memory-photos'
    and name ~ '^shared/[0-9a-f-]+\.(jpg|jpeg|png|webp)$'
    and lower(coalesce(metadata->>'mimetype', '')) in ('image/jpeg', 'image/png', 'image/webp')
    and public.is_couple_member()
  );
create policy "onlyus_members_delete_memory_photos" on storage.objects for delete to authenticated
  using (
    bucket_id = 'memory-photos'
    and name ~ '^shared/[0-9a-f-]+\.(jpg|jpeg|png|webp)$'
    and public.is_couple_member()
  );
