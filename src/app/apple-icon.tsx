import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: '#FF6B4A',
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
            marginTop: -4,
          }}
        >
          W
        </span>
      </div>
    ),
    { ...size }
  );
}
