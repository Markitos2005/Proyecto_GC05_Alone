import { describe, it, expect } from 'vitest';
import { createRecoveryMailer } from '../src/services/recoveryMail.js';
import { testMailbox } from './helpers/smtp.js';

describe('SCRUM-43: correo SMTP de pruebas', () => {
  it.each(['https://externo.example.com', 'ftp://localhost', 'http://usuario:clave@localhost'])('rechaza origen externo o configuración inválida', (appOrigin) => {
    expect(() => createRecoveryMailer({ appOrigin })).toThrow();
  });
  it.each([0, 65536, 'incorrecto'])('rechaza puerto inválido', (port) => {
    expect(() => createRecoveryMailer({ port })).toThrow();
  });
  it('el enlace usa el origen configurado, sin contraseñas ni datos del Host de una petición', async () => {
    const mailbox = await testMailbox();
    try {
      await createRecoveryMailer({ port: mailbox.port, appOrigin: 'http://localhost:3000' })({ email: 'ficticio@example.com', token: 'b'.repeat(64) });
      expect(mailbox.messages).toHaveLength(1);
      expect(mailbox.messages[0]).toContain(`http://localhost:3000/#restablecer-contrasena?token=${'b'.repeat(64)}`);
      expect(mailbox.messages[0]).toContain('ficticio@example.com');
    } finally {
      await mailbox.close();
    }
  });
});
