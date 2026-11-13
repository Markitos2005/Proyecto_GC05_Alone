import { createServer } from 'node:net';

/** Buzón SMTP mínimo y efímero de pruebas. Nunca reenvía mensajes ni registra contenido. */
export async function testMailbox() {
  const messages = [];
  const sockets = new Set();
  const server = createServer((socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    socket.on('error', () => {});
    socket.setEncoding('utf8');
    socket.write('220 localhost Test SMTP\r\n');
    let buffer = '';
    let data = null;
    socket.on('data', (chunk) => {
      buffer += chunk;
      let end;
      while ((end = buffer.indexOf('\r\n')) !== -1) {
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        if (data !== null) {
          if (line === '.') {
            messages.push(data.join('\r\n').replace(/=\r\n/g, '').replace(/=([A-F0-9]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))));
            data = null;
            socket.write('250 Message captured\r\n');
          } else data.push(line.replace(/^\.\./, '.'));
        } else if (/^(EHLO|HELO)/i.test(line)) socket.write('250-localhost\r\n250 8BITMIME\r\n');
        else if (/^DATA/i.test(line)) { data = []; socket.write('354 End with dot\r\n'); }
        else if (/^QUIT/i.test(line)) socket.end('221 Bye\r\n');
        else socket.write('250 OK\r\n');
      }
    });
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return { messages, port: server.address().port, close: async () => {
    for (const socket of sockets) socket.destroy();
    await new Promise((resolve) => server.close(resolve));
  } };
}
