import nodemailer from 'nodemailer';

/** Solo SMTP local de pruebas: no envía mensajes a proveedores ni destinatarios reales. */
export function createRecoveryMailer({
  port = 1025,
  appOrigin = 'http://localhost:5173',
} = {}) {
  const origin = new URL(appOrigin);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname) ||
      !['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password) {
    throw new Error('RECOVERY_APP_ORIGIN debe ser una dirección local de pruebas.');
  }
  const smtpPort = Number(port);
  if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    throw new Error('SMTP_TEST_PORT debe ser un puerto válido.');
  }
  const transport = nodemailer.createTransport({
    host: '127.0.0.1', port: smtpPort, secure: false,
    // Mailpit local no requiere TLS ni autenticación. No usar esta configuración en producción.
    ignoreTLS: true, logger: false, debug: false,
    connectionTimeout: 3000, greetingTimeout: 3000, socketTimeout: 5000,
    disableFileAccess: true, disableUrlAccess: true,
  });

  return async ({ email, token }) => {
    const link = new URL(origin.origin);
    // El fragmento no se envía al servidor al abrir el enlace. SCRUM-94 lo leerá.
    link.hash = `restablecer-contrasena?token=${encodeURIComponent(token)}`;
    await transport.sendMail({
      from: 'Lost&Found UEx <no-reply@example.com>',
      to: { address: email },
      subject: 'Restablecer contraseña · Lost&Found UEx',
      text: `Has solicitado restablecer tu contraseña.\n\n${link.href}\n\nEl enlace caduca en 30 minutos y solo puede utilizarse una vez. Una nueva solicitud admitida invalida el enlace anterior. Si no lo solicitaste, ignora este mensaje.`,
    });
  };
}
