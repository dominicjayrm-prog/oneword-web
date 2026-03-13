/**
 * Generate static OG image fallbacks (cream background design).
 * Uses satori (SVG) + @resvg/resvg-wasm (PNG).
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

const wasmPath = join(ROOT, 'node_modules/@resvg/resvg-wasm/index_bg.wasm');
await initWasm(readFile(wasmPath));

// Use bundled fonts (local files)
const notoSans = await readFile(
  join(ROOT, 'node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf')
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
        backgroundColor: '#FFFDF7',
      },
      children: [
        // Logo: "one" + "word"
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'baseline',
            },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'Noto Sans',
                    fontSize: '90px',
                    fontWeight: 400,
                    color: '#1A1A2E',
                    letterSpacing: '-2px',
                  },
                  children: 'one',
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'Noto Sans',
                    fontSize: '90px',
                    fontWeight: 400,
                    color: '#FF6B4A',
                    letterSpacing: '-2px',
                  },
                  children: 'word',
                },
              },
            ],
          },
        },
        // Coral divider
        {
          type: 'div',
          props: {
            style: {
              width: '50px',
              height: '3px',
              backgroundColor: '#FF6B4A',
              marginTop: '12px',
              marginBottom: '16px',
              borderRadius: '2px',
            },
          },
        },
        // Tagline
        {
          type: 'div',
          props: {
            style: {
              fontFamily: 'Noto Sans',
              fontSize: '28px',
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'rgba(255,107,74,0.8)',
              marginTop: '0px',
            },
            children: tagline,
          },
        },
        // Subtitle
        {
          type: 'div',
          props: {
            style: {
              fontFamily: 'Noto Sans',
              fontSize: '16px',
              fontWeight: 400,
              color: '#8B8697',
              marginTop: '14px',
              letterSpacing: '3px',
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
      { name: 'Noto Sans', data: notoSans, weight: 400, style: 'normal' },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } });
  const png = resvg.render().asPng();

  await writeFile(join(ROOT, 'public', file), png);
  console.log(`✓ Generated ${file} (${(png.length / 1024).toFixed(1)} KB)`);
}

console.log('\nDone!');
