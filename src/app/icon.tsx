import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: '#FF6B4A',
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
            marginTop: -1,
          }}
        >
          W
        </span>
      </div>
    ),
    { ...size }
  );
}
