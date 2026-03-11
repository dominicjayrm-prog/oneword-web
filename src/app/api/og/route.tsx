import { ImageResponse } from '@vercel/og';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

const OG_STRINGS = {
  en: { label: "Today's Word", prompt: 'Can you describe it in 5 words?', fallback: 'One word. Five words to describe it.' },
  es: { label: 'Palabra del Día', prompt: '¿Puedes describirla en 5 palabras?', fallback: 'Una palabra. Cinco palabras para describirla.' },
} as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') === 'es' ? 'es' : 'en';
  const strings = OG_STRINGS[lang];

  try {
    const supabase = await createClient();
    const { data: wordData } = await supabase.rpc('get_today_word', { p_language: lang });

    const word = wordData?.word || 'OneWord';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#FFFDF7',
            fontFamily: 'serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 32,
              color: '#8B8697',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
            }}
          >
            {strings.label}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 120,
              fontWeight: 900,
              color: '#1A1A2E',
              marginTop: 16,
            }}
          >
            {word.toUpperCase()}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              color: '#FF6B4A',
              marginTop: 24,
            }}
          >
            {strings.prompt}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: '#8B8697',
              marginTop: 48,
            }}
          >
            <span style={{ color: '#1A1A2E', fontWeight: 700 }}>one</span>
            <span style={{ color: '#FF6B4A', fontWeight: 700 }}>word</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err) {
    console.error('OG image generation error:', err);
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#FFFDF7',
          }}
        >
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 900, color: '#1A1A2E' }}>
            <span>one</span>
            <span style={{ color: '#FF6B4A' }}>word</span>
          </div>
          <div style={{ display: 'flex', fontSize: 28, color: '#8B8697', marginTop: 16 }}>
            {strings.fallback}
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
