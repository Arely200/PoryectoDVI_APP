// scripts/normalize-images.js
// Normaliza imágenes en src/assets/imagenes:
// - redimensiona al tamaño objetivo manteniendo aspecto
// - centra en lienzo transparente de TARGET_SIZE
// - intenta eliminar fondo blanco si la esquina sugiere fondo blanco
// - guarda PNGs en src/assets/imagenes/normalized with suffix _std.png

const fs = require('fs');
const path = require('path');
let Jimp;

const INPUT_DIR = path.join(process.cwd(), 'src', 'assets', 'imagenes');
const OUT_DIR = path.join(INPUT_DIR, 'normalized');
const TARGET_SIZE = 512; // tamaño final cuadrado (px)
const INNER = 420; // área máxima para la imagen dentro del lienzo

async function ensureOutDir() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

function isMostlyWhitePixel(r, g, b, threshold = 240) {
  return r >= threshold && g >= threshold && b >= threshold;
}

function intToRGBA(hex) {
  if (Jimp && typeof Jimp.intToRGBA === 'function') return Jimp.intToRGBA(hex);
  const a = hex & 0xFF;
  const b = (hex >> 8) & 0xFF;
  const g = (hex >> 16) & 0xFF;
  const r = (hex >> 24) & 0xFF;
  return { r, g, b, a };
}

async function tryRemoveWhiteBackground(image) {
  // Comprueba las esquinas para decidir si aplicar "white->transparent"
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const sample = [
    image.getPixelColor(0, 0),
    image.getPixelColor(image.bitmap.width - 1, 0),
    image.getPixelColor(0, image.bitmap.height - 1),
    image.getPixelColor(image.bitmap.width - 1, image.bitmap.height - 1),
  ];

  const cornerWhite = sample.reduce((acc, hex) => {
    const { r, g, b } = intToRGBA(hex);
    return acc + (isMostlyWhitePixel(r, g, b) ? 1 : 0);
  }, 0);

  if (cornerWhite < 2) {
    // no aplicar si menos de la mitad de las esquinas son blancas
    return image;
  }

  // aplicar: transformar píxeles muy claros a transparentes
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const a = this.bitmap.data[idx + 3];

    if (r > 240 && g > 240 && b > 240) {
      this.bitmap.data[idx + 3] = 0; // transparente
    }
  });

  return image;
}

async function processImage(file) {
  try {
    const ext = path.extname(file).toLowerCase();
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) return null;

    const inputPath = path.join(INPUT_DIR, file);
    const img = await Jimp.read(inputPath);

    // intentar eliminar fondo blanco si procede
    await tryRemoveWhiteBackground(img);

    // ajustar tamaño (mantener aspecto) al área INNER
    img.scaleToFit(INNER, INNER, Jimp.RESIZE_BILINEAR);

    // crear lienzo transparente TARGET_SIZE x TARGET_SIZE
    const canvas = new Jimp(TARGET_SIZE, TARGET_SIZE, 0x00000000);

    const x = Math.round((TARGET_SIZE - img.bitmap.width) / 2);
    const y = Math.round((TARGET_SIZE - img.bitmap.height) / 2);

    canvas.composite(img, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
    });

    const base = path.basename(file, ext);
    const outName = `${base}_std.png`;
    const outPath = path.join(OUT_DIR, outName);

    await canvas.rgba(true).writeAsync(outPath);
    return outName;
  } catch (err) {
    console.error('Error procesando', file, err.message);
    return null;
  }
}

async function main() {
  try {
    const jm = await import('jimp');
    Jimp = jm.Jimp || jm.default || jm;
  } catch (e) {
    console.error('No se pudo cargar jimp:', e.message);
    process.exit(1);
  }
  await ensureOutDir();
  const files = fs.readdirSync(INPUT_DIR).filter(f => !f.startsWith('.') && f !== 'normalized');
  console.log(`Encontrados ${files.length} archivos en ${INPUT_DIR}`);

  const results = [];
  for (const f of files) {
    console.log('Procesando', f);
    const out = await processImage(f);
    if (out) results.push(out);
  }

  console.log('Hecho. Archivos generados:', results.length);
  if (results.length > 0) console.log(results.slice(0, 20));
  console.log(`Salida en: ${OUT_DIR}`);
  console.log('Nota: la eliminación de fondo blanco es heurística. Revísalos y ajustamos manualmente los que fallen.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
