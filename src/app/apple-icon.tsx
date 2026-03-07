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
          borderRadius: 36,
          background: '#FF6B4A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: 110,
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
    { ...size }
  );
}
