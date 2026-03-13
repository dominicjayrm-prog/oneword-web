import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') === 'es' ? 'es' : 'en';
  const isSpanish = lang === 'es';

  // Load fonts from Google Fonts CDN
  const [playfairBold, dmSans] = await Promise.all([
    fetch(
      'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.ttf'
    ).then((res) => res.arrayBuffer()),
    fetch(
      'https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriCZOIHTWEBlwu8Q.ttf'
    ).then((res) => res.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          backgroundColor: '#FFFDF7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span
            style={{
              fontFamily: 'Playfair Display',
              fontSize: '90px',
              fontWeight: 900,
              color: '#1A1A2E',
              letterSpacing: '-3px',
            }}
          >
            one
          </span>
          <span
            style={{
              fontFamily: 'Playfair Display',
              fontSize: '90px',
              fontWeight: 900,
              color: '#FF6B4A',
              letterSpacing: '-3px',
            }}
          >
            word
          </span>
        </div>

        {/* Coral divider */}
        <div
          style={{
            width: '50px',
            height: '3px',
            backgroundColor: '#FF6B4A',
            borderRadius: '2px',
            marginTop: '12px',
            marginBottom: '16px',
          }}
        />

        {/* Tagline */}
        <span
          style={{
            fontFamily: 'Playfair Display',
            fontSize: '28px',
            fontWeight: 400,
            fontStyle: 'italic',
            color: '#FF6B4A',
            opacity: 0.8,
          }}
        >
          {isSpanish ? 'Dilo en cinco.' : 'Say it in five.'}
        </span>

        {/* Subtitle */}
        <span
          style={{
            fontFamily: 'DM Sans',
            fontSize: '16px',
            fontWeight: 400,
            color: '#8B8697',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginTop: '14px',
          }}
        >
          {isSpanish
            ? 'EL JUEGO DIARIO PARA MENTES CREATIVAS'
            : 'THE DAILY GAME FOR CREATIVE MINDS'}
        </span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Playfair Display',
          data: playfairBold,
          style: 'normal',
          weight: 900,
        },
        {
          name: 'DM Sans',
          data: dmSans,
          style: 'normal',
          weight: 400,
        },
      ],
    },
  );
}
