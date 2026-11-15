-- SCRUM-109 / US-013. Avisos de pérdida independientes de los hallazgos.
-- Catálogo mínimo de centros para seleccionar un centro de una facultad.
-- No crea datos de ejemplo ni pantallas de administración de US-023.
CREATE TABLE IF NOT EXISTS centros (
    id UUID PRIMARY KEY,
    facultad_id UUID NOT NULL REFERENCES facultades (id),
    nombre VARCHAR(150) NOT NULL CHECK (btrim(nombre) <> ''),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT centros_facultad_nombre_key UNIQUE (facultad_id, nombre)
);

CREATE TABLE IF NOT EXISTS avisos (
    id UUID PRIMARY KEY,
    autor_id UUID NOT NULL REFERENCES usuarios (id),
    categoria_id UUID NOT NULL REFERENCES categorias (id),
    facultad_id UUID NOT NULL REFERENCES facultades (id),
    centro_id UUID REFERENCES centros (id),
    descripcion VARCHAR(2000) NOT NULL CHECK (btrim(descripcion) <> ''),
    fecha_perdida DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Cerrado')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS avisos_estado_fecha_idx ON avisos (estado, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS avisos_autor_idx ON avisos (autor_id);

-- Información voluntaria y privada: no seleccionar estas columnas en el feed de US-014.
CREATE TABLE IF NOT EXISTS aviso_datos_privados (
    aviso_id UUID PRIMARY KEY REFERENCES avisos (id) ON DELETE CASCADE,
    rasgos VARCHAR(2000),
    contacto_email VARCHAR(254),
    contacto_telefono VARCHAR(12),
    CHECK (rasgos IS NOT NULL OR contacto_email IS NOT NULL OR contacto_telefono IS NOT NULL)
);
