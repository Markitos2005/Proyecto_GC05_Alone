
-- US-010 / SCRUM-114: historial de cambios de estado de los hallazgos.
-- Migracion idempotente: conserva los datos existentes.

CREATE TABLE IF NOT EXISTS hallazgo_historial_estados (
    id UUID PRIMARY KEY,
    hallazgo_id UUID NOT NULL REFERENCES hallazgos (id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios (id),
    estado_anterior VARCHAR(20) NOT NULL,
    estado_nuevo VARCHAR(20) NOT NULL,
    motivo VARCHAR(2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT historial_estado_anterior_valido
        CHECK (estado_anterior IN ('Activo', 'Devuelto', 'Retirado')),

    CONSTRAINT historial_estado_nuevo_valido
        CHECK (estado_nuevo IN ('Activo', 'Devuelto', 'Retirado')),

    CONSTRAINT historial_transicion_valida
        CHECK (
            (estado_anterior = 'Activo' AND estado_nuevo IN ('Devuelto', 'Retirado'))
        )
);

CREATE INDEX IF NOT EXISTS hallazgo_historial_hallazgo_fecha_idx
    ON hallazgo_historial_estados (hallazgo_id, created_at DESC);
