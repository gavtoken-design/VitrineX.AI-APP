-- -- Scripts SQL Completos para o Banco de Dados Supabase (v2) --
-- 1. Habilitar extensões
create extension if not exists "uuid-ossp";
-- 2. Tabela de Usuários (Perfís)
create table if not exists public.users (
    id uuid references auth.users on delete cascade not null primary key,
    email text,
    name text,
    phone text,
    plan text default 'free',
    status text default 'active',
    "businessProfile" jsonb default '{}'::jsonb,
    "contactInfo" jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.users enable row level security;
create policy "Users view own profile" on public.users for
select using (auth.uid() = id);
create policy "Users update own profile" on public.users for
update using (auth.uid() = id);
create policy "Users insert own profile" on public.users for
insert with check (auth.uid() = id);
-- Trigger para criar perfil automaticamente
create or replace function public.handle_new_user() returns trigger as $$ begin
insert into public.users (id, email)
values (new.id, new.email);
return new;
end;
$$ language plpgsql security definer;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_new_user();
-- 3. Tabela de Itens da Biblioteca (Library Items)
create table if not exists public.library_items (
    id text not null primary key,
    "userId" uuid references auth.users(id) on delete cascade not null,
    "type" text not null,
    file_url text not null,
    thumbnail_url text,
    tags text [] default array []::text [],
    name text,
    "createdAt" timestamp with time zone default timezone('utc'::text, now())
);
alter table public.library_items enable row level security;
create policy "Users view own library items" on public.library_items for
select using (auth.uid() = "userId");
create policy "Users insert own library items" on public.library_items for
insert with check (auth.uid() = "userId");
create policy "Users update own library items" on public.library_items for
update using (auth.uid() = "userId");
create policy "Users delete own library items" on public.library_items for delete using (auth.uid() = "userId");
-- 4. Tabela de Posts
create table if not exists public.posts (
    id text primary key,
    "userId" uuid references auth.users(id) on delete cascade not null,
    title text,
    content_text text,
    image_url text,
    image_prompt text,
    date timestamp with time zone,
    "createdAt" timestamp with time zone default timezone('utc'::text, now()),
    tags text [],
    hashtags text []
);
alter table public.posts enable row level security;
create policy "Users view own posts" on public.posts for
select using (auth.uid() = "userId");
create policy "Users insert own posts" on public.posts for
insert with check (auth.uid() = "userId");
create policy "Users update own posts" on public.posts for
update using (auth.uid() = "userId");
create policy "Users delete own posts" on public.posts for delete using (auth.uid() = "userId");
-- 5. Tabela de Anúncios (Ads)
create table if not exists public.ads (
    id text primary key,
    "userId" uuid references auth.users(id) on delete cascade not null,
    platform text,
    headline text,
    copy text,
    media_url text,
    "createdAt" timestamp with time zone default timezone('utc'::text, now())
);
alter table public.ads enable row level security;
create policy "Users view own ads" on public.ads for
select using (auth.uid() = "userId");
create policy "Users insert own ads" on public.ads for
insert with check (auth.uid() = "userId");
create policy "Users update own ads" on public.ads for
update using (auth.uid() = "userId");
create policy "Users delete own ads" on public.ads for delete using (auth.uid() = "userId");
-- 6. Tabela de Campanhas (Campaigns)
create table if not exists public.campaigns (
    id text primary key,
    "userId" uuid references auth.users(id) on delete cascade not null,
    name text,
    type text,
    description text,
    strategy text,
    hashtags text [],
    video_url text,
    timeline text,
    "createdAt" timestamp with time zone default timezone('utc'::text, now()),
    -- Note: posts and ads are relations, typically stored as arrays of IDs or separate relation tables. 
    -- For compatibility with the JSON structure validation, we can store them as JSONB if strictly needed, 
    -- but relational is better. For now, assuming the types interface matches what is stored or joined.
    -- Storing complex objects as JSONB for simplicity if the app expects full objects.
    posts jsonb default '[]'::jsonb,
    ads jsonb default '[]'::jsonb
);
alter table public.campaigns enable row level security;
create policy "Users view own campaigns" on public.campaigns for
select using (auth.uid() = "userId");
create policy "Users insert own campaigns" on public.campaigns for
insert with check (auth.uid() = "userId");
create policy "Users update own campaigns" on public.campaigns for
update using (auth.uid() = "userId");
create policy "Users delete own campaigns" on public.campaigns for delete using (auth.uid() = "userId");
-- 7. Tabela de Tendências (Trends)
create table if not exists public.trends (
    id text primary key,
    "userId" uuid references auth.users(id) on delete cascade not null,
    query text,
    score numeric,
    data text,
    sources jsonb,
    "groundingMetadata" jsonb,
    "createdAt" timestamp with time zone default timezone('utc'::text, now())
);
alter table public.trends enable row level security;
create policy "Users view own trends" on public.trends for
select using (auth.uid() = "userId");
create policy "Users insert own trends" on public.trends for
insert with check (auth.uid() = "userId");
create policy "Users update own trends" on public.trends for
update using (auth.uid() = "userId");
create policy "Users delete own trends" on public.trends for delete using (auth.uid() = "userId");
-- 8. Tabela de Agendamento (Schedule)
create table if not exists public.schedule (
    id text primary key,
    "userId" uuid references auth.users(id) on delete cascade not null,
    datetime timestamp with time zone not null,
    platform text,
    "contentId" text,
    "contentType" text,
    content text,
    "mediaUrl" text,
    status text default 'scheduled',
    created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.schedule enable row level security;
create policy "Users view own schedule" on public.schedule for
select using (auth.uid() = "userId");
create policy "Users insert own schedule" on public.schedule for
insert with check (auth.uid() = "userId");
create policy "Users update own schedule" on public.schedule for
update using (auth.uid() = "userId");
create policy "Users delete own schedule" on public.schedule for delete using (auth.uid() = "userId");
-- 9. Tabela de Públicos-Alvo (Target Audiences)
-- Note: This uses snake_case for fields as per previous SQL
create table if not exists public.target_audiences (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.target_audiences enable row level security;
create policy "Users view own target audiences" on public.target_audiences for
select using (auth.uid() = user_id);
create policy "Users insert own target audiences" on public.target_audiences for
insert with check (auth.uid() = user_id);
create policy "Users update own target audiences" on public.target_audiences for
update using (auth.uid() = user_id);
create policy "Users delete own target audiences" on public.target_audiences for delete using (auth.uid() = user_id);
-- 10. Configuração do Storage (Bucket 'media')
insert into storage.buckets (id, name, public)
values ('media', 'media', true) on conflict (id) do nothing;
create policy "Public Access Media" on storage.objects for
select using (bucket_id = 'media');
create policy "Authenticated Upload Media" on storage.objects for
insert with check (
        bucket_id = 'media'
        and auth.role() = 'authenticated'
    );
create policy "Users delete own media" on storage.objects for delete using (
    bucket_id = 'media'
    and auth.uid() = owner
);