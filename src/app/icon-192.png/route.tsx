import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          borderRadius: 38,
          background: '#FF6B4A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: 'white',
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
            marginTop: -4,
          }}
        >
          W
        </span>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
