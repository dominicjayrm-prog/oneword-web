import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const wasmPath = join(ROOT, 'node_modules/@resvg/resvg-wasm/index_bg.wasm');
await initWasm(readFile(wasmPath));

const notoSans = await readFile(
  join(ROOT, 'node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf')
);

const faviconElement = {
  type: 'div',
  props: {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      backgroundColor: '#FF6B4A',
    },
    children: [
      {
        type: 'div',
        props: {
          style: {
            fontSize: '120px',
            fontWeight: 400,
            color: 'white',
            fontFamily: 'Noto Sans',
            marginTop: '-8px',
          },
          children: 'W',
        },
      },
    ],
  },
};

const sizes = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
];

for (const { name, size } of sizes) {
  const renderSize = Math.max(size, 180);
  const svg = await satori(faviconElement, {
    width: renderSize,
    height: renderSize,
    fonts: [
      { name: 'Noto Sans', data: notoSans, weight: 400, style: 'normal' },
    ],
  });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  const png = resvg.render().asPng();
  await writeFile(join(ROOT, 'public', name), png);
  console.log(`Done: ${name} (${size}x${size}, ${(png.length / 1024).toFixed(1)} KB)`);
}
