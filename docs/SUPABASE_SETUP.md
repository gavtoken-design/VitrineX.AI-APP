# VitrineX AI - Configuração do Supabase

Este guia explica como configurar o Supabase para ativar o sistema de cadastro/login.

## Passo 1: Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "**New Project**"
4. Preencha:
   - **Name**: VitrineX AI
   - **Database Password**: [Escolha uma senha forte]
   - **Region**: Escolha a região mais próxima
5. Clique em "**Create new project**" e aguarde ~2 minutos

## Passo 2: Obter Credenciais

Após o projeto ser criado:

1. No painel lateral, clique em "**Project Settings**" (ícone de engrenagem)
2. Clique em "**API**"
3. Copie os seguintes valores:

### Valores necessários:
- **Project URL**: `https://[seu-projeto].supabase.co`
- **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Passo 3 Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini AI (opcional)
VITE_GEMINI_API_KEY=sua_gemini_api_key

# Canva Connect API (opcional)
VITE_CANVA_CLIENT_ID=
VITE_CANVA_CLIENT_SECRET=
```

## Passo 4: Criar Tabelas no Supabase

No Supabase Dashboard:

1. Vá em "**SQL Editor**" no menu lateral
2. Cole e execute este SQL:

```sql
-- 1. Habilitar extensões necessárias para segurança, IDs, GraphQL e Automação
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "pg_graphql" SCHEMA "graphql";
CREATE SCHEMA IF NOT EXISTS "pgmq";
CREATE EXTENSION IF NOT EXISTS "pgmq" SCHEMA "pgmq";
CREATE EXTENSION IF NOT EXISTS "pg_cron" SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_net" SCHEMA "extensions";

-- 2. Tabela de Usuários (Perfis)
-- Esta tabela armazena os dados complementares do usuário (plano, perfil do negócio, etc).
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT,
  name TEXT,
  phone TEXT,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  "businessProfile" JSONB DEFAULT '{}'::jsonb,
  "contactInfo" JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configurar RLS (Row Level Security) para Usuários
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.users;
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users;
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.users;
CREATE POLICY "Usuários podem inserir seu próprio perfil" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Trigger para criar perfil automaticamente ao se cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove o trigger antigo se existir para evitar erro de duplicidade
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Cria o trigger novamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Tabela de Itens da Biblioteca (Library Items)
-- Armazena imagens, textos e vídeos gerados.
CREATE TABLE IF NOT EXISTS public.library_items (
  id TEXT NOT NULL PRIMARY KEY, -- O código frontend gera IDs como 'lib-12345'
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  "type" TEXT NOT NULL, -- 'image', 'video', 'text', etc.
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::text[],
  name TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Configurar RLS para Library Items
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seus itens" ON public.library_items;
CREATE POLICY "Usuários podem ver seus itens" ON public.library_items
  FOR SELECT USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Usuários podem criar itens" ON public.library_items;
CREATE POLICY "Usuários podem criar itens" ON public.library_items
  FOR INSERT WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "Usuários podem deletar seus itens" ON public.library_items;
CREATE POLICY "Usuários podem deletar seus itens" ON public.library_items
  FOR DELETE USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Usuários podem atualizar seus itens" ON public.library_items;
CREATE POLICY "Usuários podem atualizar seus itens" ON public.library_items
  FOR UPDATE USING (auth.uid() = "userId");

-- 5. Tabela de Anúncios (Ads)
CREATE TABLE IF NOT EXISTS public.ads (
  id TEXT PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  headline TEXT,
  copy TEXT,
  media_url TEXT,
  platform TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem seus ads" ON public.ads;
CREATE POLICY "Usuários veem seus ads" ON public.ads 
  FOR SELECT USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Usuários criam ads" ON public.ads;
CREATE POLICY "Usuários criam ads" ON public.ads 
  FOR INSERT WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "Usuários deletam seus ads" ON public.ads;
CREATE POLICY "Usuários deletam seus ads" ON public.ads 
  FOR DELETE USING (auth.uid() = "userId");

-- 6. Tabela de Tendências (Trends)
CREATE TABLE IF NOT EXISTS public.trends (
  id TEXT PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT,
  sentiment TEXT,
  popularity FLOAT,
  region TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem suas trends" ON public.trends;
CREATE POLICY "Usuários veem suas trends" ON public.trends 
  FOR SELECT USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Usuários criam trends" ON public.trends;
CREATE POLICY "Usuários criam trends" ON public.trends 
  FOR INSERT WITH CHECK (auth.uid() = "userId");

-- 7. Tabela de Posts (Preparação para futuro uso real)
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_text TEXT,
  image_url TEXT,
  tags TEXT[],
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem seus posts" ON public.posts;
CREATE POLICY "Usuários veem seus posts" ON public.posts 
  FOR SELECT USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Usuários criam posts" ON public.posts;
CREATE POLICY "Usuários criam posts" ON public.posts 
  FOR INSERT WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "Usuários deletam seus posts" ON public.posts;
CREATE POLICY "Usuários deletam seus posts" ON public.posts 
  FOR DELETE USING (auth.uid() = "userId");

-- 8. Tabela de Campanhas (Preparação para futuro uso real)
CREATE TABLE IF NOT EXISTS public.campaigns (
  id TEXT PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem suas campanhas" ON public.campaigns;
CREATE POLICY "Usuários veem suas campanhas" ON public.campaigns 
  FOR SELECT USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Usuários criam campanhas" ON public.campaigns;
CREATE POLICY "Usuários criam campanhas" ON public.campaigns 
  FOR INSERT WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "Usuários atualizam suas campanhas" ON public.campaigns;
CREATE POLICY "Usuários atualizam suas campanhas" ON public.campaigns 
  FOR UPDATE USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Usuários deletam suas campanhas" ON public.campaigns;
CREATE POLICY "Usuários deletam suas campanhas" ON public.campaigns 
  FOR DELETE USING (auth.uid() = "userId");

-- 9. Tabela de Agendamento (Schedule)
CREATE TABLE IF NOT EXISTS public.schedule (
  id TEXT PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  datetime TIMESTAMP WITH TIME ZONE,
  platform TEXT,
  status TEXT DEFAULT 'pending',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem seu agendamento" ON public.schedule;
CREATE POLICY "Usuários veem seu agendamento" ON public.schedule 
  FOR SELECT USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Usuários criam agendamento" ON public.schedule;
CREATE POLICY "Usuários criam agendamento" ON public.schedule 
  FOR INSERT WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "Usuários deletam agendamento" ON public.schedule;
CREATE POLICY "Usuários deletam agendamento" ON public.schedule 
  FOR DELETE USING (auth.uid() = "userId");
```

## Estrutura de Dados Criada

### Tabela `users` (Perfis de Usuário)

## Passo 5: Configurar Email (Opcional)

Por padrão, o Supabase envia emails de confirmação. Para desenvolvimento:

1. Vá em "**Authentication**" → "**Providers**"
2. Clique em "**Email**"
3. **Desative** "Confirm email" para testes
4. Ou configure um provedor de email (Sendgrid, Mailgun, etc.)

## Passo 6: Testar

1. Reinicie o servidor de desenvolvimento: `npm run dev`
2. Acesse `http://localhost:8080`
3. Tente criar uma conta
4. Verifique no Supabase Dashboard → "**Authentication**" → "**Users**" se o usuário foi criado

## Segurança

- ✅ **Row Level Security (RLS)** habilitado
- ✅ Usuários só acessam seus próprios dados
- ✅ Políticas de segurança configuradas
- ✅ Trigger automático para criar perfil

## Troubleshooting

### Erro: "Invalid API key"
- Verifique se copiou o `anon public` correto
- Confirme que o `.env` está na raiz do projeto

### Erro: "User already registered"
- Vá em Authentication → Users e delete o usuário
- Ou use um email diferente

### Emails não chegam
- Verifique a pasta de spam
- Desative confirmação de email nas configurações
- Configure um provedor de email personalizado

## Próximos Passos

Depois de configurar:
1. Teste o cadastro/login
2. Configure o Google Gemini AI
3. Configure a API do Canva (opcional)
4. Personalize perfil de usuário
