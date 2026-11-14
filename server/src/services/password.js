import argon2 from 'argon2';
import { hashPassword } from '../security/passwords.js';
import { validatePasswordChange } from '../validation/password.js';

export class PasswordError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const INVALID = 'Los datos del cambio de contraseña no son válidos.';

/**
 * US-006. El usuario y la sesión que se conserva salen siempre de la sesión, nunca del cliente.
 * AC-07: tras maxAttempts fallos consecutivos con la contraseña actual, la opción se bloquea lockSeconds.
 */
export function createPasswordService(users, { maxAttempts = 5, lockSeconds = 15 * 60 } = {}) {
  const notFound = () => new PasswordError(404, 'No se ha encontrado la cuenta.');
  const locked = () => new PasswordError(429, 'Demasiados intentos fallidos. Espera unos minutos antes de volver a intentarlo.');

  return {
    async change(userId, currentSessionId, body) {
      const { actual, nueva, errors } = validatePasswordChange(body);
      if (Object.keys(errors).length) {
        throw new PasswordError(400, INVALID, errors);
      }

      const account = await users.findCredentialsById(userId);
      if (!account) throw notFound();

      // AC-08: una cuenta sin contraseña local (solo OAuth) no puede usar esta opción.
      if (!account.password_hash) {
        throw new PasswordError(409, 'Tu cuenta no utiliza una contraseña local.');
      }

      // AC-07: mientras dure el bloqueo no se comprueba ninguna contraseña.
      if (account.bloqueada) throw locked();

      // AC-03: la contraseña actual debe ser correcta.
      if (!(await argon2.verify(account.password_hash, actual))) {
        const { bloqueada } = await users.registerFailedPasswordAttempt(userId, { maxAttempts, lockSeconds });
        if (bloqueada) throw locked();
        throw new PasswordError(400, INVALID, { actual: 'La contraseña actual no es correcta.' });
      }
      if (account.intentos_contrasena_fallidos > 0) await users.resetFailedPasswordAttempts(userId);

      // AC-03: la nueva contraseña no puede ser la que ya está guardada.
      if (await argon2.verify(account.password_hash, nueva)) {
        throw new PasswordError(400, INVALID, {
          nueva: 'La nueva contraseña debe ser distinta de la actual.',
        });
      }

      // AC-05, AC-06 y AC-09 en una única operación atómica del repositorio.
      const result = await users.changePassword({
        id: userId,
        passwordHash: await hashPassword(nueva),
        keepSessionId: currentSessionId,
      });
      if (!result) throw notFound();
      return result;
    },
  };
}
