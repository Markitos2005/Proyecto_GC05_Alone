/** Consultas parametrizadas; la restricción UNIQUE resuelve también las carreras. */
export function createUserRepository(pool) {
  return {
    async emailExists(email) {
      const result = await pool.query('SELECT 1 FROM usuarios WHERE email = $1', [email]);
      return result.rowCount > 0;
    },
    async create({ id, email, passwordHash }) {
      const { rows } = await pool.query(
        `INSERT INTO usuarios (id, email, password_hash, rol, activo)
         VALUES ($1, $2, $3, 'USUARIO', TRUE) RETURNING id, email, rol`,
        [id, email, passwordHash],
      );
      return rows[0];
    },
  };
}
