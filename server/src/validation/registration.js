import validator from 'validator';

/** Valida tipos antes de procesarlos. No altera ni recorta la contraseña. */
export function validateRegistration(body) {
  const errors = {};
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!email) errors.email = 'El correo es obligatorio.';
  else if (email.length > 254 || !validator.isEmail(email, { allow_utf8_local_part: false })) {
    errors.email = 'El formato del correo no es válido.';
  }
  if (!password) errors.password = 'La contraseña es obligatoria.';
  else if ([...password].length < 8 || !/\p{L}/u.test(password) || !/[0-9]/.test(password)) {
    errors.password = 'Usa al menos 8 caracteres, una letra y un número.';
  } else if ([...password].length > 128) {
    errors.password = 'La contraseña no puede superar los 128 caracteres.';
  }
  return { email, password, errors };
}
