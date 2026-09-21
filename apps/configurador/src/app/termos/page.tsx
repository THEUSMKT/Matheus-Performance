import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  robots: { index: false, follow: true },
};

export default function Termos() {
  return (
    <LegalPage title="Termos de Uso" updated="setembro de 2026">
      <h2>Sobre a estimativa</h2>
      <p>
        Os valores e prazos exibidos no configurador são estimativas, calculadas a
        partir das opções escolhidas. Eles não constituem proposta comercial. O
        orçamento final é definido por escrito, depois da conversa sobre o escopo.
      </p>

      <h2>Prazos</h2>
      <p>
        A contagem de dias úteis começa quando todos os materiais — textos, imagens e
        logo — forem entregues. Atrasos no envio deslocam a data de publicação na mesma
        medida.
      </p>

      <h2>Ajustes</h2>
      <p>
        Cada projeto inclui duas rodadas de ajustes antes da publicação. Mudanças de
        escopo depois da aprovação são orçadas à parte.
      </p>

      <h2>Conteúdo e direitos</h2>
      <p>
        Textos, imagens e marcas fornecidos por você continuam sendo seus. O site
        entregue passa a ser seu após a quitação do projeto.
      </p>
    </LegalPage>
  );
}
