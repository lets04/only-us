-- OnlyUs: historia editable, visibilidad de fotos y canciones compartidas.
-- Aplica esta migración DESPUÉS de 20261022_onlyus.sql desde el SQL Editor.
-- No elimina tablas, recuerdos ni archivos existentes. No desactiva RLS.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.touch_updated_at() from public, anon, authenticated;

alter table public.memories
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_visible boolean not null default true,
  add column if not exists show_in_carousel boolean not null default false,
  add column if not exists show_in_story boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'memories_sort_order_range'
  ) then
    alter table public.memories
      add constraint memories_sort_order_range check (sort_order between 0 and 1000000);
  end if;
end
$$;

create index if not exists memories_story_idx
  on public.memories (show_in_story, is_visible, sort_order, memory_date);
create index if not exists memories_carousel_idx
  on public.memories (show_in_carousel, is_visible, sort_order, memory_date);

drop trigger if exists memories_touch_updated_at on public.memories;
create trigger memories_touch_updated_at
  before update on public.memories
  for each row execute procedure public.touch_updated_at();

grant insert (id, title, memory_date, description, photo_path, created_by, sort_order, is_visible, show_in_carousel, show_in_story)
  on public.memories to authenticated;
grant update (title, memory_date, description, photo_path, sort_order, is_visible, show_in_carousel, show_in_story)
  on public.memories to authenticated;

create table if not exists public.story_settings (
  id smallint primary key default 1 check (id = 1),
  title text not null check (char_length(title) between 1 and 140),
  subtitle text not null check (char_length(subtitle) between 1 and 220),
  intro_text text not null check (char_length(intro_text) between 1 and 20000),
  relationship_start_date date not null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.story_settings (id, title, subtitle, intro_text, relationship_start_date)
values (
  1,
  'Nuestra historia',
  'De no soportarnos a convertirnos en el lugar seguro del otro',
  $story$Nos conocimos a principios de 2025. Al principio llegué a odiarlo por un malentendido durante una llamada, cuando todavía éramos amigos. Después empezamos a hacer llamadas todos los días y nos fuimos conociendo de una manera bonita y profunda.

Con el tiempo descubrí la increíble persona que es y me enamoré de él poco a poco, sin darme cuenta. Un día entendí que era la persona que más quería. Al principio de la relación tenía miedo, pero también me gustaba muchísimo y decidí intentarlo con él.

El 23 de junio de 2025 nos hicimos novios.

Al día siguiente ya quería guardar una foto nuestra. Apenas llevábamos un día siendo pareja y yo sentía que ese comienzo merecía quedarse.

Después llegaron las salidas a comer, las videollamadas para ver películas cuando no podíamos estar juntos todo el tiempo, las llamadas en las que nos mostrábamos nuestros cuartos y tantas otras formas de irnos conociendo más.

Hemos vivido momentos bonitos y también momentos difíciles. A pesar de los problemas, hemos decidido seguir juntos y continuar aprendiendo a querernos mejor.

No todo ha sido perfecto. Nuestra historia está hecha de recuerdos, cariño, aprendizaje y de la decisión de seguir construyendo algo juntos.$story$,
  '2025-06-23'
)
on conflict (id) do nothing;

drop trigger if exists story_settings_touch_updated_at on public.story_settings;
create trigger story_settings_touch_updated_at
  before update on public.story_settings
  for each row execute procedure public.touch_updated_at();

alter table public.story_settings enable row level security;

drop policy if exists "members_read_story_settings" on public.story_settings;
drop policy if exists "members_update_story_settings" on public.story_settings;
create policy "members_read_story_settings" on public.story_settings
  for select to authenticated
  using (public.is_couple_member());
create policy "members_update_story_settings" on public.story_settings
  for update to authenticated
  using (public.is_couple_member())
  with check (public.is_couple_member());

revoke all on table public.story_settings from public, anon, authenticated;
grant select on table public.story_settings to authenticated;
grant update (title, subtitle, intro_text, relationship_start_date, updated_by)
  on table public.story_settings to authenticated;

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 140),
  artist text not null check (char_length(artist) between 1 and 140),
  spotify_url text not null check (
    spotify_url ~ '^https://open\.spotify\.com/(intl-[a-z]{2}/)?(track|album)/[A-Za-z0-9]+(\?.*)?$'
  ),
  dedication text not null default '' check (char_length(dedication) <= 2000),
  sort_order integer not null default 0 check (sort_order between 0 and 1000000),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists songs_sort_idx on public.songs (sort_order, created_at);

drop trigger if exists songs_touch_updated_at on public.songs;
create trigger songs_touch_updated_at
  before update on public.songs
  for each row execute procedure public.touch_updated_at();

alter table public.songs enable row level security;

drop policy if exists "members_read_songs" on public.songs;
drop policy if exists "members_create_songs" on public.songs;
drop policy if exists "members_update_songs" on public.songs;
drop policy if exists "members_delete_songs" on public.songs;
create policy "members_read_songs" on public.songs
  for select to authenticated
  using (public.is_couple_member());
create policy "members_create_songs" on public.songs
  for insert to authenticated
  with check (public.is_couple_member() and created_by = auth.uid());
create policy "members_update_songs" on public.songs
  for update to authenticated
  using (public.is_couple_member())
  with check (public.is_couple_member());
create policy "members_delete_songs" on public.songs
  for delete to authenticated
  using (public.is_couple_member());

revoke all on table public.songs from public, anon, authenticated;
grant select on table public.songs to authenticated;
grant insert (title, artist, spotify_url, dedication, sort_order, created_by)
  on table public.songs to authenticated;
grant update (title, artist, spotify_url, dedication, sort_order)
  on table public.songs to authenticated;
grant delete on table public.songs to authenticated;
