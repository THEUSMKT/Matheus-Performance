import type { Metadata } from 'next';
import { revisionRounds } from '@/config/offer';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  robots: { index: false, follow: true },
};

export default function Termos() {
  return (
    <LegalPage title="Termos de Uso" updated="setembro de 2026">
      <h2>Sobre a prévia e a estimativa</h2>
      <p>
        A prévia é demonstrativa e os valores e prazos exibidos são estimativas calculadas a partir das opções escolhidas. Eles não constituem
        proposta comercial. Escopo, investimento e prazo são definidos por escrito, depois da conversa sobre o projeto.
      </p>
      <p>
        Projetos com necessidades que dependem de levantamento — como loja virtual, integrações, sistemas ou várias unidades — não recebem valor
        automático: o investimento é definido após o diagnóstico.
      </p>

      <h2>Custos externos</h2>
      <p>
        Domínio, hospedagem, e-mail profissional e plataformas de terceiros têm cobrança própria, paga diretamente aos fornecedores, e não fazem
        parte do valor de desenvolvimento, salvo quando a proposta disser o contrário.
      </p>

      <h2>Prazos</h2>
      <p>
        A contagem de dias úteis começa quando todos os materiais — textos, imagens e logo — forem entregues. Atrasos no envio deslocam a data de
        publicação na mesma medida.
      </p>

      <h2>Ajustes</h2>
      <p>
        Cada projeto inclui {revisionRounds} rodadas de ajustes antes da publicação. Mudanças de escopo depois da aprovação são orçadas à parte.
      </p>

      <h2>Resultados</h2>
      <p>
        O site ajuda a apresentar a empresa e a facilitar o contato, mas não há garantia de vendas, de posição em buscadores ou de retorno
        financeiro.
      </p>

      <h2>Conteúdo e direitos</h2>
      <p>
        Textos, imagens e marcas fornecidos por você continuam sendo seus, e você declara ter autorização para usá-los. O site entregue passa a ser
        seu após a quitação do projeto; titularidade do domínio e transferência de acessos ficam registradas na proposta.
      </p>
    </LegalPage>
  );
}
