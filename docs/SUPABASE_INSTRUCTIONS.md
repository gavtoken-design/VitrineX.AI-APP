# Guia de Configuração do Supabase

Para integrar o VitrineX AI com o Supabase e liberar o acesso (cadastro/login), siga estes passos:

## 1. Habilitar Cadastro por Email
O erro atual indica que o provedor de Email está desativado.

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard).
2. Selecione seu projeto.
3. No menu lateral, vá em **Authentication** -> **Providers**.
4. Clique em **Email**.
5. Ative a opção **Enable Email provider**.
6. Desmarque "Confirm email" se quiser que o login funcione imediatamente sem verificação de email (útil para testes).
7. Clique em **Save**.

## 2. Criar as Tabelas do Banco de Dados
Você precisa criar a estrutura do banco de dados para que o app funcione (salvar usuários, posts, campanhas, etc).

1. No Dashboard do Supabase, vá em **SQL Editor**.
2. Clique em **New query**.
3. Copie todo o conteúdo do arquivo `supabase_setup.sql` que está na raiz do projeto (`c:\Users\Jeanc\OneDrive\Área de Trabalho\VitrineX-AI - APP\supabase_setup.sql`).
4. Cole no editor SQL do Supabase.
5. Clique em **Run**.

Isso irá criar todas as tabelas: `users`, `posts`, `campaigns`, `library_items`, `trends`, etc.

## 3. Reiniciar o App
Após esses passos:
1. Recarregue a página do aplicativo.
2. Tente criar uma conta ("Criar conta").
3. O acesso deve ser liberado e os dados serão salvos no seu Supabase.

---
**Nota:** Se precisar reiniciar o banco do zero, você pode deletar as tabelas no painel "Table Editor" e rodar o script novamente, mas lembre-se que isso apaga os dados existentes.
