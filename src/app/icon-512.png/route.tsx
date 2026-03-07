import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          borderRadius: 102,
          background: '#FF6B4A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: 320,
            fontWeight: 900,
            color: 'white',
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
            marginTop: -10,
          }}
        >
          W
        </span>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
