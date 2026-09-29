import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { priceRange } from '@/config/packages';
import { shareImage } from '@/config/share';

// Gerada uma vez no build (exportação estática): vira o arquivo compartilhar.png.
export const dynamic = 'force-static';

/** Miniatura legível: marca, a frase da página inicial e a oferta em uma linha. Preço vem de packages.ts. */
export function GET() {
  const symbol = `data:image/png;base64,${readFileSync(join(process.cwd(), 'public/brand/simbolo-grande.png')).toString('base64')}`;
  // Plus Jakarta Sans (a mesma dos títulos), em cópias estáticas .ttf só para esta imagem: o gerador não lê woff2 variável.
  const font = (w: number) => readFileSync(join(process.cwd(), `src/app/fonts/plus-jakarta-sans-${w}.ttf`));
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 84px',
          color: '#1e293b',
          fontFamily: 'Jakarta',
          backgroundColor: '#f4f8ff',
          backgroundImage: 'radial-gradient(circle at 88% 12%, #c7e6ff 0%, rgba(199,230,255,0) 42%), radial-gradient(circle at 8% 100%, #e7e1ff 0%, rgba(231,225,255,0) 46%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 34, fontWeight: 800, color: '#081b5c' }}>
          <img src={symbol} width={70} height={60} alt="" />
          Beck Performance
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 40, fontSize: 86, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.06, color: '#2563eb' }}>
          <div style={{ display: 'flex' }}>
            Um site<span style={{ color: '#0ea5e9', marginLeft: 22 }}>à altura</span>
          </div>
          <div style={{ display: 'flex' }}>da sua empresa.</div>
        </div>
        <div style={{ display: 'flex', marginTop: 40, gap: 16 }}>
          <div style={{ display: 'flex', padding: '14px 26px', borderRadius: 999, background: '#2563eb', color: '#ffffff', fontSize: 30, fontWeight: 800 }}>Prévia grátis, sem cadastro</div>
          <div style={{ display: 'flex', padding: '14px 26px', borderRadius: 999, background: '#ffffff', border: '2px solid #bfd4f5', color: '#1e293b', fontSize: 30, fontWeight: 600 }}>
            {`Página única: ${priceRange}`}
          </div>
        </div>
      </div>
    ),
    {
      width: shareImage.width,
      height: shareImage.height,
      fonts: [
        { name: 'Jakarta', data: font(600), weight: 600, style: 'normal' },
        { name: 'Jakarta', data: font(800), weight: 800, style: 'normal' },
      ],
    },
  );
}
