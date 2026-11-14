-- US-006 AC-09: registro de cada cambio de contraseña con la cuenta y la fecha.
-- Nunca se guarda ninguna contraseña ni hash. Migración idempotente.
CREATE TABLE IF NOT EXISTS cambios_contrasena (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS cambios_contrasena_usuario_idx
    ON cambios_contrasena (usuario_id, created_at);
