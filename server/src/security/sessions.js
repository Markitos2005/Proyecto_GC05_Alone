import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

const PgSession = connectPgSimple(session);

/** Sesiones persistentes en PostgreSQL. */
export function createSessionMiddleware(pool, secret) {
  if (!secret || secret.length < 32) {
    throw new Error('Configura SESSION_SECRET con al menos 32 caracteres.');
  }

  return session({
    store: new PgSession({
      pool,
      tableName: 'sesiones',
      createTableIfMissing: false,
    }),
    name: 'lostfound.sid',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  });
}
