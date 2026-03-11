import sharp from 'sharp';
import { writeFileSync } from 'fs';

const svgCircle = (size) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#FF6B4A"/>
  <text x="${size/2}" y="${size * 0.72}" text-anchor="middle" font-family="Georgia, serif" font-weight="900" font-size="${size * 0.69}" fill="white">W</text>
</svg>`);

const svgApple = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="40" fill="#FF6B4A"/>
  <text x="90" y="125" text-anchor="middle" font-family="Georgia, serif" font-weight="900" font-size="120" fill="white">W</text>
</svg>`);

async function generatePng(svg, size, outputPath) {
  await sharp(svg).resize(size, size).png().toFile(outputPath);
  console.log(`Generated ${outputPath}`);
}

async function generateIco(sizes) {
  // Generate individual PNGs for ICO
  const pngBuffers = await Promise.all(
    sizes.map(size => sharp(svgCircle(size)).resize(size, size).png().toBuffer())
  );

  // Build ICO file manually
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * numImages;

  let offset = headerSize + dirSize;
  const entries = pngBuffers.map((buf, i) => {
    const entry = { size: sizes[i], buffer: buf, offset };
    offset += buf.length;
    return entry;
  });

  const totalSize = offset;
  const ico = Buffer.alloc(totalSize);

  // ICO header
  ico.writeUInt16LE(0, 0);     // reserved
  ico.writeUInt16LE(1, 2);     // type: ICO
  ico.writeUInt16LE(numImages, 4);

  // Directory entries
  entries.forEach((entry, i) => {
    const pos = headerSize + i * dirEntrySize;
    ico.writeUInt8(entry.size < 256 ? entry.size : 0, pos);      // width
    ico.writeUInt8(entry.size < 256 ? entry.size : 0, pos + 1);  // height
    ico.writeUInt8(0, pos + 2);    // color palette
    ico.writeUInt8(0, pos + 3);    // reserved
    ico.writeUInt16LE(1, pos + 4); // color planes
    ico.writeUInt16LE(32, pos + 6); // bits per pixel
    ico.writeUInt32LE(entry.buffer.length, pos + 8);  // size
    ico.writeUInt32LE(entry.offset, pos + 12);        // offset
  });

  // Image data
  entries.forEach(entry => {
    entry.buffer.copy(ico, entry.offset);
  });

  writeFileSync('public/favicon.ico', ico);
  console.log('Generated public/favicon.ico');
}

async function main() {
  await generatePng(svgCircle(16), 16, 'public/favicon-16x16.png');
  await generatePng(svgCircle(32), 32, 'public/favicon-32x32.png');
  await generatePng(svgApple, 180, 'public/apple-touch-icon.png');
  await generateIco([16, 32, 48]);
}

main().catch(console.error);
