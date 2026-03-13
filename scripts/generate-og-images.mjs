/**
 * Generate static OG images for social media sharing.
 * Uses satori (SVG) + @resvg/resvg-wasm (PNG).
 * Uses Noto Sans (bundled) + the Geist font from @vercel/og.
 *
 * Run: node scripts/generate-og-images.mjs
 */

import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Initialize resvg WASM
const wasmPath = join(ROOT, 'node_modules/@resvg/resvg-wasm/index_bg.wasm');
await initWasm(readFile(wasmPath));

// Use fonts bundled with next.js / @vercel/og (these are static, non-variable)
const notoSans = await readFile(
  join(ROOT, 'node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf')
);
const geistRegular = await readFile(
  join(ROOT, 'node_modules/@vercel/og/dist/Geist-Regular.ttf')
);

const WIDTH = 1200;
const HEIGHT = 630;

const variants = [
  {
    file: 'og-image.png',
    tagline: 'Say it in five.',
    subtitle: 'THE DAILY GAME FOR CREATIVE MINDS',
  },
  {
    file: 'og-image-es.png',
    tagline: 'Dilo en cinco.',
    subtitle: 'EL JUEGO DIARIO PARA MENTES CREATIVAS',
  },
];

for (const { file, tagline, subtitle } of variants) {
  const element = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0F0E17 0%, #2D1B69 100%)',
      },
      children: [
        // Logo: "one" + "word"
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              fontSize: '82px',
              fontWeight: 400,
              fontFamily: 'Noto Sans',
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { color: '#FFFFFF' },
                  children: 'one',
                },
              },
              {
                type: 'span',
                props: {
                  style: { color: '#FF6B4A' },
                  children: 'word',
                },
              },
            ],
          },
        },
        // Coral divider line
        {
          type: 'div',
          props: {
            style: {
              width: '48px',
              height: '3px',
              backgroundColor: '#FF6B4A',
              marginTop: '28px',
              borderRadius: '2px',
            },
          },
        },
        // Tagline (italic effect via styling)
        {
          type: 'div',
          props: {
            style: {
              fontSize: '30px',
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'rgba(255,107,74,0.75)',
              marginTop: '24px',
              fontFamily: 'Noto Sans',
            },
            children: tagline,
          },
        },
        // Subtitle (uppercase, small)
        {
          type: 'div',
          props: {
            style: {
              fontSize: '13px',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.35)',
              marginTop: '32px',
              letterSpacing: '3px',
              fontFamily: 'Geist',
            },
            children: subtitle,
          },
        },
      ],
    },
  };

  const svg = await satori(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: 'Noto Sans',
        data: notoSans,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Geist',
        data: geistRegular,
        weight: 400,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
  });
  const png = resvg.render().asPng();

  await writeFile(join(ROOT, 'public', file), png);
  console.log(`✓ Generated ${file} (${(png.length / 1024).toFixed(1)} KB)`);
}

console.log('\nDone! OG images saved to public/');
