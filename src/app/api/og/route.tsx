import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') === 'es' ? 'es' : 'en';
  const isSpanish = lang === 'es';
  const title = searchParams.get('title');
  const type = searchParams.get('type'); // 'blog' | 'author' | default
  const author = searchParams.get('author');

  // Load fonts from Google Fonts CDN
  const [playfairBold, dmSans] = await Promise.all([
    fetch(
      'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.ttf'
    ).then((res) => res.arrayBuffer()),
    fetch(
      'https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriCZOIHTWEBlwu8Q.ttf'
    ).then((res) => res.arrayBuffer()),
  ]);

  // Blog post OG image
  if (type === 'blog' && title) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            backgroundColor: '#0A0A12',
            display: 'flex',
            flexDirection: 'column',
            padding: '60px 80px',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span
              style={{
                fontFamily: 'Playfair Display',
                fontSize: '32px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-1px',
              }}
            >
              one
            </span>
            <span
              style={{
                fontFamily: 'Playfair Display',
                fontSize: '32px',
                fontWeight: 900,
                color: '#FF6B4A',
                letterSpacing: '-1px',
              }}
            >
              word
            </span>
            <span
              style={{
                fontFamily: 'DM Sans',
                fontSize: '14px',
                color: '#8B8697',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginLeft: '16px',
              }}
            >
              BLOG
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            <span
              style={{
                fontFamily: 'Playfair Display',
                fontSize: title.length > 60 ? '48px' : '56px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-2px',
                lineHeight: 1.15,
                maxWidth: '900px',
              }}
            >
              {title}
            </span>
            {author && (
              <span
                style={{
                  fontFamily: 'DM Sans',
                  fontSize: '20px',
                  color: '#FF6B4A',
                  marginTop: '24px',
                }}
              >
                {isSpanish ? 'por' : 'by'} {author}
              </span>
            )}
          </div>

          <div
            style={{
              width: '50px',
              height: '3px',
              backgroundColor: '#FF6B4A',
              borderRadius: '2px',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'Playfair Display', data: playfairBold, style: 'normal', weight: 900 },
          { name: 'DM Sans', data: dmSans, style: 'normal', weight: 400 },
        ],
      },
    );
  }

  // Author profile OG image
  if (type === 'author' && title) {
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
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50px',
              backgroundColor: '#FF6B4A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
            }}
          >
            <span style={{ fontFamily: 'Playfair Display', fontSize: '48px', fontWeight: 900, color: '#FFFFFF' }}>
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
          <span
            style={{
              fontFamily: 'Playfair Display',
              fontSize: '52px',
              fontWeight: 900,
              color: '#1A1A2E',
              letterSpacing: '-2px',
            }}
          >
            {title}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '16px' }}>
            <span style={{ fontFamily: 'Playfair Display', fontSize: '24px', fontWeight: 900, color: '#1A1A2E' }}>one</span>
            <span style={{ fontFamily: 'Playfair Display', fontSize: '24px', fontWeight: 900, color: '#FF6B4A' }}>word</span>
            <span style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#8B8697', letterSpacing: '3px', textTransform: 'uppercase', marginLeft: '12px' }}>BLOG</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'Playfair Display', data: playfairBold, style: 'normal', weight: 900 },
          { name: 'DM Sans', data: dmSans, style: 'normal', weight: 400 },
        ],
      },
    );
  }

  // Default site OG image
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
