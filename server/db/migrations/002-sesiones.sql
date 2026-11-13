-- Sesiones de autenticación almacenadas en PostgreSQL.
-- Migración idempotente: no elimina datos existentes.

CREATE TABLE IF NOT EXISTS sesiones (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS sesiones_expire_idx
    ON sesiones (expire);
