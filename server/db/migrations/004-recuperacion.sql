-- Nunca almacenar el enlace ni el token original, solo su resumen SHA-256.
CREATE TABLE IF NOT EXISTS recuperacion_tokens (
    usuario_id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL
);

-- También contar solicitudes de correos inexistentes, sin guardar el correo aquí.
CREATE TABLE IF NOT EXISTS recuperacion_solicitudes (
    email_hash CHAR(64) NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS recuperacion_solicitudes_email_fecha
    ON recuperacion_solicitudes (email_hash, requested_at);
