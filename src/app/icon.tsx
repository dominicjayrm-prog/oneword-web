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
          borderRadius: 6,
          background: '#FF6B4A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: 'white',
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
