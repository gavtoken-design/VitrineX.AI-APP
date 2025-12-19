-- -- Scripts SQL para configurar o Banco de Dados Supabase --

-- 1. Habilitar extensões necessárias (opcional, mas recomendado)
create extension if not exists "uuid-ossp";

-- 2. Tabela de Usuários (Perfís)
-- Esta tabela armazena os dados complementares do usuário (plano, perfil do negócio, etc).
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

-- Configurar RLS (Row Level Security) para Usuários
alter table public.users enable row level security;

create policy "Usuários podem ver seu próprio perfil" on public.users
  for select using (auth.uid() = id);

create policy "Usuários podem atualizar seu próprio perfil" on public.users
  for update using (auth.uid() = id);

create policy "Usuários podem inserir seu próprio perfil" on public.users
  for insert with check (auth.uid() = id);

-- 3. Trigger para criar perfil automaticamente ao se cadastrar (Opcional, mas útil)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Remove o trigger antigo se existir para evitar erro de duplicidade
drop trigger if exists on_auth_user_created on auth.users;

-- Cria o trigger novamente
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 4. Tabela de Itens da Biblioteca (Library Items)
-- Armazena imagens, textos e vídeos gerados.
-- Nota: Usamos nomes de colunas em aspas duplas ("userId") para manter compatibilidade com o código frontend existente.
create table if not exists public.library_items (
  id text not null primary key, -- O código frontend gera IDs como 'lib-12345', então usamos text.
  "userId" uuid references auth.users(id) on delete cascade not null, -- Mapeia para auth.users ou public.users
  "type" text not null, -- 'image', 'video', 'text', etc.
  file_url text not null,
  thumbnail_url text,
  tags text[] default array[]::text[],
  name text,
  "createdAt" timestamp with time zone default timezone('utc'::text, now())
);

-- Configurar RLS para Library Items
alter table public.library_items enable row level security;

create policy "Usuários podem ver seus itens" on public.library_items
  for select using (auth.uid() = "userId");

create policy "Usuários podem criar itens" on public.library_items
  for insert with check (auth.uid() = "userId");

create policy "Usuários podem deletar seus itens" on public.library_items
  for delete using (auth.uid() = "userId");

-- 5. Tabelas Mockadas (Opcional - para futuro uso real)
-- O código atual ainda usa mock para Posts e Campanhas, mas se quiser preparar o banco:

create table if not exists public.posts (
  id text primary key,
  "userId" uuid references auth.users(id) on delete cascade not null,
  content_text text,
  image_url text,
  tags text[],
  "createdAt" timestamp with time zone default timezone('utc'::text, now())
);

alter table public.posts enable row level security;
create policy "Usuários veem seus posts" on public.posts for select using (auth.uid() = "userId");
create policy "Usuários criam posts" on public.posts for insert with check (auth.uid() = "userId");

-- 6. Configuração do Storage (Bucket 'media')
-- Cria o bucket se não existir
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Políticas de Segurança para o Storage

-- Permitir acesso público para leitura (imagens geradas precisam ser acessíveis)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'media' );

-- Permitir upload apenas para usuários autenticados
create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'media' and auth.role() = 'authenticated' );

-- Permitir usuários deletarem seus próprios arquivos
create policy "Users can delete own files"
  on storage.objects for delete
  using ( bucket_id = 'media' and auth.uid() = owner );

-- 7. Tabela de Públicos-Alvo (Target Audiences)
create table if not exists public.target_audiences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Configurar RLS para Target Audiences
alter table public.target_audiences enable row level security;

create policy "Usuários podem ver seus públicos-alvo" on public.target_audiences
  for select using (auth.uid() = user_id);

create policy "Usuários podem criar públicos-alvo" on public.target_audiences
  for insert with check (auth.uid() = user_id);

create policy "Usuários podem atualizar seus públicos-alvo" on public.target_audiences
  for update using (auth.uid() = user_id);

create policy "Usuários podem deletar seus públicos-alvo" on public.target_audiences
  for delete using (auth.uid() = user_id);