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

/** US-006. El usuario y la sesión que se conserva salen siempre de la sesión, nunca del cliente. */
export function createPasswordService(users) {
  const notFound = () => new PasswordError(404, 'No se ha encontrado la cuenta.');

  return {
    async change(userId, currentSessionId, body) {
      const { nueva, errors } = validatePasswordChange(body);
      if (Object.keys(errors).length) {
        throw new PasswordError(400, 'Los datos del cambio de contraseña no son válidos.', errors);
      }

      const account = await users.findCredentialsById(userId);
      if (!account) throw notFound();

      // AC-08: una cuenta sin contraseña local (solo OAuth) no puede usar esta opción.
      if (!account.password_hash) {
        throw new PasswordError(409, 'Tu cuenta no utiliza una contraseña local.');
      }

      // SCRUM-99: aquí se verificará la contraseña actual y se limitarán los intentos fallidos.

      // AC-03: la nueva contraseña no puede ser la que ya está guardada.
      if (await argon2.verify(account.password_hash, nueva)) {
        throw new PasswordError(400, 'Los datos del cambio de contraseña no son válidos.', {
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
