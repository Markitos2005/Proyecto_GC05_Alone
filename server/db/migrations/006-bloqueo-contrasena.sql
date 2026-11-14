-- US-006 AC-07: límite de intentos fallidos consecutivos con la contraseña actual incorrecta.
-- Se cuenta por cuenta (no por sesión) para que iniciar sesión de nuevo no lo reinicie. Idempotente.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS intentos_contrasena_fallidos INTEGER NOT NULL DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS contrasena_bloqueada_hasta TIMESTAMPTZ;
