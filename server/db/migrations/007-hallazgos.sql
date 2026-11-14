-- US-008 / SCRUM-105: publicación de hallazgos con fotos y rasgos privados.
-- Migración idempotente: no elimina datos existentes.

-- Mínimo de facultades, categorías y asignación de Conserjes que necesita la publicación.
-- Su administración llegará con US-023 y US-025; aquí no se insertan datos de ejemplo.
CREATE TABLE IF NOT EXISTS facultades (
    id UUID PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT facultades_nombre_key UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT categorias_nombre_key UNIQUE (nombre)
);

-- Cada Conserje tiene como máximo una facultad asignada (US-025-AC-02).
CREATE TABLE IF NOT EXISTS asignaciones_conserje (
    usuario_id UUID PRIMARY KEY REFERENCES usuarios (id),
    facultad_id UUID NOT NULL REFERENCES facultades (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Información pública del hallazgo. Los rasgos privados NO se guardan aquí.
CREATE TABLE IF NOT EXISTS hallazgos (
    id UUID PRIMARY KEY,
    autor_id UUID NOT NULL REFERENCES usuarios (id),
    facultad_id UUID NOT NULL REFERENCES facultades (id),
    categoria_id UUID NOT NULL REFERENCES categorias (id),
    descripcion VARCHAR(2000) NOT NULL,
    fecha_hallazgo DATE NOT NULL,
    latitud DOUBLE PRECISION NOT NULL,
    longitud DOUBLE PRECISION NOT NULL,
    punto_entrega VARCHAR(2000),
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hallazgos_descripcion_no_vacia CHECK (btrim(descripcion) <> ''),
    CONSTRAINT hallazgos_latitud_valida CHECK (latitud BETWEEN -90 AND 90),
    CONSTRAINT hallazgos_longitud_valida CHECK (longitud BETWEEN -180 AND 180),
    CONSTRAINT hallazgos_estado_valido CHECK (estado IN ('Activo', 'Devuelto', 'Retirado'))
);

CREATE INDEX IF NOT EXISTS hallazgos_facultad_estado_idx ON hallazgos (facultad_id, estado, created_at DESC);
CREATE INDEX IF NOT EXISTS hallazgos_autor_idx ON hallazgos (autor_id);

-- Rasgos identificativos privados, separados de la información pública (US-008-AC-05).
CREATE TABLE IF NOT EXISTS hallazgo_rasgos_privados (
    hallazgo_id UUID PRIMARY KEY REFERENCES hallazgos (id) ON DELETE CASCADE,
    rasgos VARCHAR(2000) NOT NULL
);

-- Fotos ya verificadas y sin metadatos (SCRUM-49). Se guardan en la misma transacción
-- que el hallazgo: si algo falla, no queda ni la fila ni ninguna foto.
CREATE TABLE IF NOT EXISTS hallazgo_imagenes (
    id UUID PRIMARY KEY,
    hallazgo_id UUID NOT NULL REFERENCES hallazgos (id) ON DELETE CASCADE,
    posicion SMALLINT NOT NULL,
    mime VARCHAR(20) NOT NULL,
    datos BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hallazgo_imagenes_posicion_key UNIQUE (hallazgo_id, posicion),
    CONSTRAINT hallazgo_imagenes_posicion_valida CHECK (posicion BETWEEN 1 AND 5),
    CONSTRAINT hallazgo_imagenes_mime_valido CHECK (mime IN ('image/jpeg', 'image/png')),
    CONSTRAINT hallazgo_imagenes_tamano_valido CHECK (octet_length(datos) BETWEEN 1 AND 5242880)
);
