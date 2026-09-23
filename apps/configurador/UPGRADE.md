# Upgrade do configurador — revisão local

## Resultado

A página foi implementada no projeto Next.js original, sem migrar de tecnologia e sem backend. O fluxo agora tem seis etapas: negócio, objetivo, estrutura, identidade, recursos/investimento e resumo. A prévia usa conteúdo por segmento, seções selecionadas, cores com contraste automático, três direções visuais e modos de computador/celular.

A revisão visual prioriza celular: textos curtos na página e no configurador, detalhes comerciais nas perguntas frequentes, superfícies em azul e valores com contraste reforçado. O carrossel de exemplos e as prévias visuais da versão publicada foram preservados.

O preço continua sendo uma **estimativa**, com base de R$ 500 e a faixa de ±10% existente. Todas as tabelas de preços e complexidade de `src/config/pricing.ts` e o cálculo original `src/lib/estimate.ts` foram preservados. As direções combinam os modelos/estilos existentes: Essencial = minimal/minimalista, Elegante = elegance/elegante, Marcante = bold/criativo. Seus respectivos adicionais são calculados a partir dessa tabela, sem valores duplicados na interface. Seções pagas são mapeadas a recursos uma única vez. O tipo comercial permanece disponível nos ajustes avançados.

Há salvamento local versionado, recuperação de configurações antigas, validação dos dados de links/armazenamento, reinício com confirmação dentro da interface, comparação opcional com orçamento, resumo imprimível e mensagem de WhatsApp para revisão. Nenhuma mensagem é enviada automaticamente. Compartilhar inclui apenas opções predefinidas e cores validadas: nome e descrição não entram no link.

## Visualizar

O endereço público é `https://theusmkt.github.io/Matheus-Performance/configurador/`. Para revisão local, o servidor de prévia usa `http://127.0.0.1:4173/Matheus-Performance/configurador/` enquanto estiver ativo.

O ZIP entregue inclui código-fonte e uma cópia estática compilada em `configurador/`. Depois de extraí-lo, com Node.js instalado:

```sh
node apps/configurador/scripts/preview.cjs
```

Abra o endereço exibido no terminal. Não é necessário instalar dependências para visualizar os arquivos já compilados. O servidor escuta apenas no computador local. Abrir `index.html` diretamente por `file://` não reproduz corretamente os caminhos do GitHub Pages.

Para desenvolver e compilar novamente:

```sh
cd apps/configurador
npm ci
npm test
```

No PowerShell:

```powershell
$env:NEXT_PUBLIC_BASE_PATH='/Matheus-Performance/configurador'
npm run build
npm run typecheck
npm run preview
```

O workflow `.github/workflows/pages.yml` original aplica esse prefixo e publica as atualizações em `main` no GitHub Pages.

## Diagnóstico verificado no ZIP

- Next.js 16.3.5, React, TypeScript e Tailwind, exportação estática; site principal separado na raiz.
- Etapas antigas: tipo, modelo, estilo, cores, fontes e recursos. Decisões visuais repetidas e ausência de contexto do negócio.
- Estimativas existentes, não preços fechados: base, categoria, modelo/estilo, cores próprias e recursos.
- Prazos de 3–5, 5–8 ou 7–12 dias úteis por complexidade, contados a partir dos materiais.
- Duas rodadas de ajustes já previstas nos termos e FAQ. Não foi criada política nova de pagamento ou suporte.
- Número real configurado preservado: 55 51 98194-7979.
- Instagram e e-mail fictícios no configurador; links removidos/substituídos pelo WhatsApp existente, inclusive na privacidade.
- Persistência anterior não validava adequadamente os tipos/IDs recebidos. O fluxo ativo agora normaliza dados e elimina duplicações de recursos.
- Sem ferramenta de análise instalada no configurador; não foi adicionado rastreamento externo.

## Arquivos principais

- `src/app/page.tsx`: conecta a nova experiência.
- `src/components/Upgrade.tsx`: página, etapas, continuidade, resumo e integração com WhatsApp.
- `src/components/Upgrade.module.css`: estilos isolados, responsividade, impressão e foco.
- `src/components/ProjectPreview.tsx`: prévia por segmento, objetivo, estrutura, direção e recursos.
- `src/lib/project.ts`: modelo validado, migração, compartilhamento, mapeamento para o cálculo existente e mensagem.
- `src/config/projectFaq.ts`: dúvidas de escopo, custos e contratação.
- `src/app/layout.tsx` e `src/app/globals.css`: tipografia local, sem baixar cinco famílias externas, e remoção da faixa fixa de preço dos dados estruturados.
- `src/components/Footer.tsx`, `src/components/Navbar.tsx` e `src/app/privacidade/page.tsx`: contatos e navegação das páginas legais, explicação do compartilhamento.
- `package.json`, `scripts/preview.cjs` e `tests/`: comandos de revisão e validação.

Os componentes antigos não usados pela página inicial foram mantidos para evitar excluir trabalho anterior. A nova página não depende do antigo fluxo de seis decisões visuais. As alterações ficaram dentro de `apps/configurador`; o site principal, assets e workflow foram preservados.

## Testes

- TypeScript sem erros e build estático completo, com privacidade e termos exportados.
- Sete grupos de testes de regras: 90 combinações de segmento/objetivo/direção, cálculo original, salvar/recuperar, links sem dados pessoais, mensagem coerente, entradas inválidas, migração e remoção de adicionais sem duplicação.
- Teste de milhares de cores personalizadas com contraste mínimo de 4,5:1 nos botões da prévia.
- Automação de navegador com Edge/Chromium: jornada de seis etapas, edição, recarga, reinício, compartilhamento, mensagem, dados inválidos e fluxo móvel. Nenhuma mensagem real foi enviada.
- Verificação de ausência de rolagem horizontal em 320, 390, 768, 1024 e 1440 pixels; foco por teclado e inspeção de telas desktop/mobile.
- PDF de resumo gerado pelo navegador; screenshots e evidências ficam na pasta de revisão externa ao pacote do site.
- `tests/browser.cjs` pode ser repetido com Playwright instalado à parte e Microsoft Edge disponível; aceita `PLAYWRIGHT_MODULE` e `PREVIEW_URL`. Playwright não foi adicionado às dependências de produção.

## Mensuração sem rastreamento externo

O fluxo emite eventos locais `CustomEvent('mb:configurator')` com `detail.event` e, quando aplicável, `detail.step`. Eventos: `configurator_start`, `step_complete`, `summary_view`, `share`, `whatsapp_click`. Não contêm nome ou descrição. Um futuro analytics deverá ser conectado apenas conforme a política de privacidade/consentimento escolhida. `whatsapp_click` é clique, não contratação nem venda.

## Limites e definições comerciais pendentes

- Os cerca de três minutos são uma hipótese de duração da configuração, ainda sem teste com usuários reais; não são prazo de entrega.
- Preço final depende da validação de conteúdo, páginas e integrações. A assinatura de plataformas, domínio, hospedagem e e-mail não entra na faixa de desenvolvimento.
- Quantidades máximas de itens do catálogo, imagens de galeria e extensão do conteúdo não estão definidas nos arquivos. Devem constar da proposta.
- Fornecedor/assinatura para reservas, e-mail e feed do Instagram, limites vigentes e compatibilidade ainda precisam ser avaliados. O configurador não garante planos gratuitos nem integrações já ativas.
- Forma de pagamento, duração/valores do suporte após entrega, manutenção, editor de conteúdo, titularidade do domínio e transferência das contas/acessos precisam ser detalhados na proposta.
- Loja virtual, pagamentos online e produção de textos/imagens não foram incluídos silenciosamente.
- As ilustrações da prévia são composições CSS locais, não fotos de clientes. Os exemplos são explicitamente demonstrativos; não há avaliações ou projetos entregues inventados.
- O link copiado usa o endereço público definitivo. Links não incluem nome/descrição; PDF e mensagem podem incluir esses textos.
- A inspeção foi feita em Chromium/Edge e em tamanhos simulados, não em aparelhos físicos nem em todos os navegadores. Auditoria assistiva com leitores de tela e teste com usuários ainda são recomendáveis.

## Preparação e preservação

O ZIP original foi mantido. Todos os caminhos foram verificados antes de extrair para a pasta nova `Matheus-Performance`. O anexo não contém histórico Git; a pasta de trabalho tinha um repositório separado, no qual foi criada a branch `codex/upgrade-configurador`. Não houve descarte de alterações ou contratação de serviço.


