import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'Monte seu site e veja quanto custa';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#f8f9fb',
          color: '#111318',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, fontWeight: 600 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(112deg, #4f46e5, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            M
          </div>
          Matheus Beck
        </div>

        <div style={{ marginTop: 44, fontSize: 86, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
          Monte seu site.
        </div>
        <div style={{ fontSize: 86, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#4f46e5' }}>
          Veja quanto custa.
        </div>

        <div style={{ marginTop: 40, fontSize: 32, color: '#667085' }}>
          Estimativa de valor e prazo em menos de 3 minutos.
        </div>
      </div>
    ),
    size,
  );
}
