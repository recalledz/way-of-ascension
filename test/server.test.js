import { test, before, after } from 'node:test';
import assert from 'node:assert';
import net from 'net';

process.env.NODE_ENV = 'test';
const server = (await import('../server.js')).default;

before(() => server.listen(8081));
after(() => server.close());

test('blocks path traversal attempts', async () => {
  const data = await new Promise((resolve, reject) => {
    const socket = net.connect(8081, '127.0.0.1', () => {
      socket.write('GET /../server.js HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n');
    });
    let response = '';
    socket.on('data', chunk => {
      response += chunk.toString();
    });
    socket.on('end', () => resolve(response));
    socket.on('error', reject);
  });
  const statusLine = data.split('\r\n')[0];
  assert.match(statusLine, /^HTTP\/1.1 400/);
});
