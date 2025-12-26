-- Script SQL para criar as tabelas no MySQL da Hostinger
-- Rode isso no phpMyAdmin
-- 1. Tabela de Usuários (Espelho simplificado do Supabase)
CREATE TABLE IF NOT EXISTS app_users (
    supabase_uuid VARCHAR(36) NOT NULL PRIMARY KEY,
    -- ID exato que vem do Supabase (UUID)
    email VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 2. Tabela de Logs de Memória da IA
CREATE TABLE IF NOT EXISTS ia_memory_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    prompt TEXT NOT NULL,
    -- O que o usuário pediu
    response MEDIUMTEXT,
    -- O que a IA respondeu
    module VARCHAR(50) DEFAULT 'general',
    -- Qual parte do app (ex: 'post_generator', 'chat')
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- Cria uma chave estrangeira para garantir integridade (opcional, pode remover se der erro de constraint)
    -- CONSTRAINT fk_user_memory FOREIGN KEY (user_id) REFERENCES app_users(supabase_uuid) ON DELETE CASCADE
    INDEX (user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Exemplo de Insert Manual para teste
-- INSERT INTO app_users (supabase_uuid, email) VALUES ('teste-123', 'admin@teste.com');
-- INSERT INTO ia_memory_logs (user_id, prompt, response) VALUES ('teste-123', 'Olá IA', 'Olá Humano');