CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    -- Nullable para una futura cuenta OAuth; el registro local siempre exige hash.
    password_hash VARCHAR(255),
    rol VARCHAR(20) NOT NULL DEFAULT 'USUARIO',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usuarios_email_key UNIQUE (email),
    CONSTRAINT usuarios_email_normalizado CHECK (email = lower(btrim(email)))
);
