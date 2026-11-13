import { validateProfileUpdate } from '../validation/profile.js';

export class ProfileError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

/** Lista explícita: jamás devolver hash ni estado interno aunque el repositorio amplíe su respuesta. */
function toProfile(user) {
  return {
    id: user.id,
    email: user.email,
    nombre: user.nombre ?? '',
    apellidos: user.apellidos ?? '',
    telefono: user.telefono ?? null,
    rol: user.rol,
  };
}

/** Reglas US-005. El usuario se identifica siempre por la sesión, nunca por datos del cliente. */
export function createProfileService(users) {
  const notFound = () => new ProfileError(404, 'No se ha encontrado el perfil.');
  return {
    async get(userId) {
      const user = await users.findById(userId);
      if (!user) throw notFound();
      return toProfile(user);
    },
    async update(userId, body) {
      const { changes, errors } = validateProfileUpdate(body);
      if (Object.keys(errors).length) {
        throw new ProfileError(400, 'Los datos del perfil no son válidos.', errors);
      }
      const user = await users.updateProfile(userId, changes);
      if (!user) throw notFound();
      return toProfile(user);
    },
  };
}
