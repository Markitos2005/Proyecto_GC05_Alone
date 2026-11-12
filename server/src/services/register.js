import { randomUUID } from 'node:crypto';
import { hashPassword } from '../security/passwords.js';
import { validateRegistration } from '../validation/registration.js';

export class RegistrationError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

/** Reglas US-001. Solo se admiten email/password; el cliente no decide rol ni estado. */
export function createRegistrationService(users) {
  return async function register(body) {
    const { email, password, errors } = validateRegistration(body);
    if (Object.keys(errors).length) {
      throw new RegistrationError(400, 'Revisa los datos del formulario.', errors);
    }
    const duplicate = () => new RegistrationError(409, 'No se puede registrar ese correo.');
    if (await users.emailExists(email)) throw duplicate();
    const passwordHash = await hashPassword(password);
    try {
      const user = await users.create({ id: randomUUID(), email, passwordHash });
      // Lista explícita: jamás devolver hash aunque el repositorio amplíe su respuesta.
      return { id: user.id, email: user.email, rol: user.rol };
    } catch (error) {
      if (error.code === '23505' && error.constraint === 'usuarios_email_key') throw duplicate();
      throw error;
    }
  };
}
