// scripts/remove-bg.js
// Usage:
// npm install jimp
// node scripts/remove-bg.js

// Compat: some Jimp versions export via default.
// Use dynamic import to support ESM/CommonJS variations of jimp
let Jimp; 
const path = require('path');

const input = path.join(__dirname, '..', 'src', 'assets', 'imagenes', 'chef.jpg');
const output = path.join(__dirname, '..', 'src', 'assets', 'imagenes', 'chef_transparente.png');

// Threshold: how close to white a pixel must be to be made transparent (0-255)
const THRESHOLD = 240;

(async () => {
  try {
    const jimpModule = await import('jimp');
    // jimp can export a Jimp class under .Jimp or default.Jimp or export functions directly
    const JimpLib = jimpModule.Jimp || (jimpModule.default && jimpModule.default.Jimp) || jimpModule.default || jimpModule;
    // If JimpLib has a static read, use it; otherwise, try JimpLib.read
    const reader = JimpLib.read ? JimpLib : (JimpLib.Jimp ? JimpLib.Jimp : null);
    if (!reader || !reader.read) throw new Error('Cannot find Jimp.read in module');
    const image = await reader.read(input);
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      const a = this.bitmap.data[idx + 3];

      // Simple check: if RGB all above threshold, make transparent
      if (r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD) {
        this.bitmap.data[idx + 3] = 0; // alpha = 0
      }
    });

    image.write(output);
    console.log('Saved', output);
  } catch (err) {
    console.error('Error processing image:', err);
  }
})();
