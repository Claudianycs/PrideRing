-- PRiDeRing - schema do banco (Supabase / Postgres)
-- Rode este script inteiro no SQL Editor do seu projeto Supabase.

create extension if not exists "pgcrypto";

-- Perfil público/privado de cada usuário (1:1 com auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Novo usuário',
  pronoun text,
  bio text,
  instagram text,
  whatsapp text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Preferências de compartilhamento (o que aparece no perfil público)
create table if not exists public.sharing_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  share_name boolean not null default true,
  share_pronoun boolean not null default true,
  share_bio boolean not null default true,
  share_instagram boolean not null default true,
  share_whatsapp boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Vínculo entre o serial da tag NFC física e o dono do anel
create table if not exists public.nfc_tags (
  serial_number text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  ring_name text not null default 'Meu PRiDeRing',
  record_type text,
  linked_at timestamptz not null default now()
);

-- Histórico de conexões feitas ao ler o anel de outra pessoa
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  target_id uuid references auth.users(id) on delete set null,
  target_name text,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.sharing_preferences enable row level security;
alter table public.nfc_tags enable row level security;
alter table public.connections enable row level security;

-- profiles: leitura pública (necessária para o perfil público via NFC),
-- escrita só do próprio dono.
create policy "profiles_select_public" on public.profiles
  for select using (true);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- sharing_preferences: mesma lógica de profiles.
create policy "sharing_select_public" on public.sharing_preferences
  for select using (true);
create policy "sharing_insert_own" on public.sharing_preferences
  for insert with check (auth.uid() = user_id);
create policy "sharing_update_own" on public.sharing_preferences
  for update using (auth.uid() = user_id);

-- nfc_tags: leitura pública (para localizar o dono ao ler a tag),
-- escrita só de quem é dono do vínculo.
create policy "nfc_tags_select_public" on public.nfc_tags
  for select using (true);
create policy "nfc_tags_insert_own" on public.nfc_tags
  for insert with check (auth.uid() = user_id);
create policy "nfc_tags_update_own" on public.nfc_tags
  for update using (auth.uid() = user_id);
create policy "nfc_tags_delete_own" on public.nfc_tags
  for delete using (auth.uid() = user_id);

-- connections: cada usuário só vê e cria as suas próprias.
create policy "connections_select_own" on public.connections
  for select using (auth.uid() = owner_id);
create policy "connections_insert_own" on public.connections
  for insert with check (auth.uid() = owner_id);

-- Cria automaticamente profiles + sharing_preferences quando uma conta é criada,
-- para que essas linhas sempre existam (evita ter que checar "não existe ainda"
-- espalhado pelo frontend).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Novo usuário'));
  insert into public.sharing_preferences (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
