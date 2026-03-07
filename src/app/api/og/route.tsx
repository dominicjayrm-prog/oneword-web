import { ImageResponse } from '@vercel/og';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: wordData } = await supabase.rpc('get_today_word', { p_language: 'en' });

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
            Today&apos;s Word
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
            Can you describe it in 5 words?
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
  } catch {
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
            One word. Five words to describe it.
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
