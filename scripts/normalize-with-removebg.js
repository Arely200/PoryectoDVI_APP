// scripts/normalize-with-removebg.js
// Usa la API de remove.bg para eliminar fondos y guardarlos en
// src/assets/imagenes/normalized/*.png
// Uso: export REMOVE_BG_API_KEY=tu_clave  (o setx / PowerShell)
// Luego: node scripts/normalize-with-removebg.js

const fs = require('fs');
const path = require('path');
const https = require('https');

const INPUT_DIR = path.join(process.cwd(), 'src', 'assets', 'imagenes');
const OUT_DIR = path.join(INPUT_DIR, 'normalized');
const API_KEY = process.env.REMOVE_BG_API_KEY || process.env.REMOVEBG_API_KEY;

if (!API_KEY) {
  console.error('ERROR: variable de entorno REMOVE_BG_API_KEY no encontrada.');
  process.exit(1);
}

function ensureOutDir() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

function isImageFile(f) {
  const ext = path.extname(f).toLowerCase();
  return ['.png', '.jpg', '.jpeg'].includes(ext);
}

function postRemoveBg(filePath) {
  return new Promise((resolve, reject) => {
    const filename = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);
    const boundary = '---NodeRemoveBgBoundary' + Date.now();

    const CRLF = '\r\n';
    const preamble = Buffer.from(
      '--' + boundary + CRLF +
      'Content-Disposition: form-data; name="image_file"; filename="' + filename + '"' + CRLF +
      'Content-Type: application/octet-stream' + CRLF + CRLF
    );
    const epilogue = Buffer.from(CRLF + '--' + boundary + '--' + CRLF);

    const contentLength = preamble.length + fileData.length + epilogue.length;

    const options = {
      hostname: 'api.remove.bg',
      port: 443,
      path: '/v1.0/removebg',
      method: 'POST',
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': contentLength,
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (res.statusCode === 200) {
          resolve(buf);
        } else {
          // Try parse JSON error
          let msg = `Status ${res.statusCode}`;
          try {
            const js = JSON.parse(buf.toString('utf8'));
            msg = js.errors ? JSON.stringify(js.errors) : JSON.stringify(js);
          } catch (e) {
            msg = buf.toString('utf8');
          }
          reject(new Error(msg));
        }
      });
    });

    req.on('error', (e) => reject(e));

    req.write(preamble);
    req.write(fileData);
    req.write(epilogue);
    req.end();
  });
}

async function main() {
  ensureOutDir();
  const files = fs.readdirSync(INPUT_DIR).filter(f => isImageFile(f));
  console.log('Procesando', files.length, 'imágenes desde', INPUT_DIR);

  for (const f of files) {
    const inputPath = path.join(INPUT_DIR, f);
    const base = path.basename(f, path.extname(f));
    const outName = base + '_std.png';
    const outPath = path.join(OUT_DIR, outName);

    if (fs.existsSync(outPath)) {
      console.log('Omitiendo (ya existe):', outName);
      continue;
    }

    try {
      console.log('Llamando remove.bg para', f);
      const imgBuf = await postRemoveBg(inputPath);
      fs.writeFileSync(outPath, imgBuf);
      console.log('Guardado:', outName);
    } catch (err) {
      console.error('Error procesando', f, err.message || err);
    }
  }
  console.log('Proceso completado. Archivos en:', OUT_DIR);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
