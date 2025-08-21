import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8081;
const PUBLIC_DIR = path.join(process.cwd(), 'public');

const server = http.createServer((req, res) => {
    const pathname = req.url.split('?')[0];
    const normalizedPath = path.normalize(pathname);

    if (pathname.includes('..') || normalizedPath.split(path.sep).includes('..')) {
        res.writeHead(400);
        res.end('Invalid path');
        return;
    }

    let relativePath = normalizedPath.replace(/^\/+/u, '');
    if (relativePath === '') {
        relativePath = 'index.html';
    }

    const filePath = path.join(PUBLIC_DIR, relativePath);

    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm',
        '.webp': 'image/webp',
        '.avif': 'image/avif'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + '..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`Server running at http://127.0.0.1:${PORT}/`);
    });
}

export default server;
