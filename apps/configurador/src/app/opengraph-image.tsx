import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'Beck Performance — um site profissional para apresentar sua empresa';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  const symbol = `data:image/png;base64,${readFileSync(join(process.cwd(), 'public/brand/simbolo-grande.png')).toString('base64')}`;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', background: '#081b5c', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 34, fontWeight: 700 }}>
          <img src={symbol} width={84} height={72} alt="" />
          Beck Performance
        </div>
        <div style={{ marginTop: 48, fontSize: 64, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, maxWidth: 980 }}>
          Um site profissional para apresentar sua empresa e facilitar novos pedidos de orçamento.
        </div>
        <div style={{ marginTop: 36, fontSize: 30, color: '#c9dafb' }}>Prévia sem cadastro · Escopo e custos confirmados antes da contratação</div>
      </div>
    ),
    size,
  );
}
