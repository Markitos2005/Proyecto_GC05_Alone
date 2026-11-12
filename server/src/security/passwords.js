import argon2 from 'argon2';

/** Argon2id con sal aleatoria generada por la biblioteca; nunca registrar el secreto. */
export function hashPassword(password) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}
