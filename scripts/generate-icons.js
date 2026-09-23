import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Function to generate a valid PNG buffer from width, height, and RGBA pixel generator
function createPng(width, height, pixelFn) {
  // RGBA buffer with filter byte 0 at start of each scanline
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // Helper to create chunk
  function createChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(8 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);

    // CRC32 calculation
    let crc = 0xffffffff;
    for (let i = 4; i < 8 + len; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        const bit = (byte ^ crc) & 1;
        crc >>>= 1;
        if (bit) crc ^= 0xedb88320;
        byte >>>= 1;
      }
    }
    buf.writeInt32BE((crc ^ 0xffffffff) | 0, 8 + len);
    return buf;
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // Color type 6: RGBA
  ihdrData.writeUInt8(0, 10); // Compression method
  ihdrData.writeUInt8(0, 11); // Filter method
  ihdrData.writeUInt8(0, 12); // Interlace method
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT Chunk
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Pixel generator for Korea Travel app icon
function koreaIconPixel(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxR = Math.min(w, h) / 2;

  // Background color: #0f172a (dark slate blue)
  let r = 15;
  let g = 23;
  let b = 42;
  let a = 255;

  // Outer corner clipping if not maskable
  if (!isMaskable) {
    const cornerRadius = w * 0.22;
    const clampedX = Math.max(cornerRadius, Math.min(w - cornerRadius, x));
    const clampedY = Math.max(cornerRadius, Math.min(h - cornerRadius, y));
    const cornerDist = Math.sqrt((x - clampedX) ** 2 + (y - clampedY) ** 2);
    if (cornerDist > cornerRadius) {
      return [0, 0, 0, 0];
    }
  }

  // Inner ring
  const circleRadius = maxR * (isMaskable ? 0.65 : 0.72);
  if (dist <= circleRadius) {
    // Taegeuk curve logic
    // S-curve in the center
    const subRadius = circleRadius / 2;
    const distTopSub = Math.sqrt(dx * dx + (dy + subRadius) ** 2);
    const distBottomSub = Math.sqrt(dx * dx + (dy - subRadius) ** 2);

    let isRed = false;
    if (distTopSub <= subRadius) {
      isRed = true;
    } else if (distBottomSub <= subRadius) {
      isRed = false;
    } else {
      isRed = dx >= 0;
    }

    if (isRed) {
      // Korea Red #ef4444 to #b91c1c
      const factor = (dy + circleRadius) / (2 * circleRadius);
      r = Math.round(239 - factor * 50);
      g = Math.round(68 - factor * 40);
      b = Math.round(68 - factor * 40);
    } else {
      // Korea Blue #3b82f6 to #1d4ed8
      const factor = (dy + circleRadius) / (2 * circleRadius);
      r = Math.round(59 - factor * 30);
      g = Math.round(130 - factor * 50);
      b = Math.round(246 - factor * 30);
    }

    // Needle / Center compass dot
    if (dist < circleRadius * 0.22) {
      r = 255;
      g = 255;
      b = 255;
    }
    if (dist < circleRadius * 0.08) {
      r = 15;
      g = 23;
      b = 42;
    }
  } else if (dist <= circleRadius * 1.08 && dist >= circleRadius * 1.02) {
    // Thin gold accent ring
    r = 245;
    g = 158;
    b = 11;
  }

  return [r, g, b, a];
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate files
const icons = [
  { file: 'pwa-192x192.png', size: 192, maskable: false },
  { file: 'pwa-512x512.png', size: 512, maskable: false },
  { file: 'pwa-maskable-512x512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: true },
  { file: 'favicon.ico', size: 64, maskable: false }
];

for (const icon of icons) {
  const buf = createPng(icon.size, icon.size, (x, y, w, h) => koreaIconPixel(x, y, w, h, icon.maskable));
  fs.writeFileSync(path.join(publicDir, icon.file), buf);
  console.log(`Generated ${icon.file} (${icon.size}x${icon.size})`);
}

// Generate PWABuilder screenshots
const mobileBuf = createPng(540, 960, (x, y, w, h) => {
  if (y < 80) return [15, 23, 42, 255];
  if (y > 880) return [15, 23, 42, 255];
  return koreaIconPixel(x, y, w, h, true);
});
fs.writeFileSync(path.join(publicDir, 'screenshot-mobile.png'), mobileBuf);
console.log('Generated screenshot-mobile.png');

const desktopBuf = createPng(960, 540, (x, y, w, h) => {
  if (y < 60) return [15, 23, 42, 255];
  return koreaIconPixel(x, y, w, h, true);
});
fs.writeFileSync(path.join(publicDir, 'screenshot-desktop.png'), desktopBuf);
console.log('Generated screenshot-desktop.png');

