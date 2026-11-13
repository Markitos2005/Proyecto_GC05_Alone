// Columnas que puede ver el propietario del perfil. Nunca incluir password_hash.
const PROFILE_COLUMNS = 'id, email, nombre, apellidos, telefono, rol, activo';

/** Consultas parametrizadas; la restricción UNIQUE resuelve también las carreras. */
export function createUserRepository(pool) {
  return {
    async emailExists(email) {
      const result = await pool.query('SELECT 1 FROM usuarios WHERE email = $1', [email]);
      return result.rowCount > 0;
    },
    async findByEmail(email) {
      const { rows } = await pool.query(
        'SELECT id, email, password_hash, rol, activo FROM usuarios WHERE email = $1',
        [email],
      );
      return rows[0] ?? null;
    },
    async create({ id, email, passwordHash, nombre, apellidos }) {
      const { rows } = await pool.query(
        `INSERT INTO usuarios (id, email, password_hash, nombre, apellidos, rol, activo)
         VALUES ($1, $2, $3, $4, $5, 'USUARIO', TRUE) RETURNING id, email, rol`,
        [id, email, passwordHash, nombre, apellidos],
      );
      return rows[0];
    },
    async findById(id) {
      const { rows } = await pool.query(`SELECT ${PROFILE_COLUMNS} FROM usuarios WHERE id = $1`, [id]);
      return rows[0] ?? null;
    },
    /** Actualiza solo nombre, apellidos y telefono; el resto de columnas no es modificable. */
    async updateProfile(id, changes) {
      const columns = ['nombre', 'apellidos', 'telefono'].filter((column) => column in changes);
      const assignments = columns.map((column, index) => `${column} = $${index + 2}`);
      const { rows } = await pool.query(
        `UPDATE usuarios SET ${[...assignments, 'updated_at = CURRENT_TIMESTAMP'].join(', ')}
         WHERE id = $1 RETURNING ${PROFILE_COLUMNS}`,
        [id, ...columns.map((column) => changes[column])],
      );
      return rows[0] ?? null;
    },
  };
}
