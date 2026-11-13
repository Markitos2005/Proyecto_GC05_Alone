-- Datos de perfil (US-005, SCRUM-93) y del registro ampliado.
-- Migración idempotente: no elimina datos existentes.
-- Nullables a nivel de BD para conservar las cuentas creadas antes de esta migración;
-- la obligatoriedad de nombre y apellidos la aplica el servidor en registro y perfil.

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombre VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS apellidos VARCHAR(150);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(12);
