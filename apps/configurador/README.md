# Configurador de sites — Beck Performance

Prévia gratuita do site da empresa em poucos passos e desenvolvimento em
três pacotes de valor fixo (R$ 500, R$ 750 e R$ 1.000). Páginas:

- **Início (`/`)**, objetiva:
  - apresentação;
  - dois projetos reais ("Da ideia ao ar"), com "Visitar site" e
    "Conversar sobre um projeto assim";
  - benefícios concretos;
  - como funciona, com a demonstração do configurador (ilustrativa);
  - dois caminhos de contratação: pacotes e projeto sob medida;
  - Matheus Beck e o atendimento direto;
  - dúvidas essenciais e chamada final (prévia ou conversa direta).
- **Exemplos (`/exemplos/`)**:
  - projetos reais, com "Visitar site";
  - oito modelos demonstrativos, um por família visual, com filtros,
    visualização no computador e no celular e "Criar minha prévia com este
    modelo".
- **Pacotes (`/pacotes/`)**:
  - comparação compacta;
  - cartões enxutos: valor, pagamento único (domínio e hospedagem à
    parte), para que serve, 3 ou 4 diferenças, prazo, "Criar prévia com
    este pacote" e "Conversar sobre este pacote"; o detalhamento fica em
    "Ver tudo que está incluído";
  - comparação lado a lado (recolhida no celular);
  - condições (domínio e hospedagem, textos da IA e produção de conteúdo,
    ajustes e depois da entrega, projeto sob medida).
- **Criação (`/criar/`)**:
  - começa pelo nome ("Como se chama seu negócio?", com a opção "Ainda não
    defini o nome.") e pela ideia: o campo de texto já aberto, com uma
    orientação curta e um exemplo; gravar um áudio e o passo a passo
    ficam como alternativas;
  - monta a prévia numa das oito famílias visuais, de acordo com o tipo de
    negócio (clínica veterinária, banho e tosa, confeitaria, corretor...);
  - depois vem "Sua prévia está pronta", com "Conversar sobre esta prévia"
    (WhatsApp com o resumo) antes de qualquer personalização;
  - em seguida, uma escolha por tela: pacote, composição e estilo, cores,
    títulos, conteúdo e seções;
  - por fim, a revisão.
  - O pedido de desenvolvimento sai pelo WhatsApp, com "Copiar resumo" e
    "Baixar meu projeto".
  - Tudo fica salvo neste dispositivo.

Navegação, menu do celular e botões de pacote e modelo são links comuns: as
páginas funcionam mesmo que o JavaScript não carregue.

Next.js 16 · React 19 · TypeScript · CSS Modules. Exporta HTML estático e é
publicado no GitHub Pages em `/Matheus-Performance/configurador/`.

- Operação, CRM, integrações, eventos e indicadores: [`OPERACAO.md`](OPERACAO.md)
- O que mudou nesta versão e o que depende de você: [`UPGRADE.md`](UPGRADE.md)

---

## Rodar

```bash
cd apps/configurador
npm ci
npm run dev        # http://localhost:3000
npm test           # pacotes, limites, migração, mensagem, pedidos, eventos e prévias (8 casos de negócio renderizados)
npm run typecheck
NEXT_PUBLIC_BASE_PATH=/Matheus-Performance/configurador npm run build   # gera out/
npm run preview    # serve out/ no caminho do GitHub Pages
```

---

## Onde editar

Tudo que muda com frequência está em `src/config/`. Nenhum preço, contato ou
texto comercial fica escrito dentro de componente.

| Arquivo | O que controla |
|---|---|
| `packages.ts` | **Os três pacotes** (valor, limite de seções, galeria, vitrine, formulário, prazo, o que inclui), rodadas de ajuste, notas de preço, o que é projeto personalizado e custos externos |
| `contact.ts` | Marca, responsável, **WhatsApp** (único lugar do número), mensagens de abertura, e-mail e Instagram (vazios = não aparecem), liberação para o Google |
| `segments.ts` | Segmentos, estilos e cores sugeridos, respostas rápidas e o tipo de negócio de cada modelo |
| `subsegments.ts` | **Tipos de negócio** (clínica veterinária, banho e tosa, pet shop, limpeza, confeitaria, buffet, corretor...): família visual, imagens permitidas, nome provisório ("Sua clínica"), botão, textos de exemplo e termos com peso para reconhecer o tipo pela descrição |
| `families.ts` | **As oito famílias visuais**: composição, duas variantes, fonte, paletas recomendadas, apresentação dos serviços e seções sugeridas por pacote |
| `assets.ts` | **Catálogo de imagens** (arquivos de `public/demo/`) com categoria, cortes, ponto focal, texto alternativo, origem e licença |
| `projectFaq.ts` | Perguntas frequentes (valores, prazos e limites vêm de `packages.ts`) |
| `proof.ts` | Projetos reais (nome, categoria, frase, endereço, capturas em `public/projetos/`) e depoimentos — **só com autorização**, sem pacote, preço ou resultado associado |
| `experiments.ts` | Testes de mensagem e CTA (todos inativos) |
| `integrations.ts` | Receptor de pedidos e ambiente, lidos de variáveis de ambiente |

O preço é sempre o do pacote escolhido (`priceOf` em `src/lib/project.ts`).
Estilo, cores da marca e logo não têm cobrança própria. Seções e recursos
dizem qual pacote exigem (`requiredPackage`); uma escolha que pede outro
pacote só é aplicada depois que o visitante confirma. O teto de R$ 1.000 é o
preço do maior pacote — o que não cabe nele vira “projeto personalizado”.
Página, PDF, mensagem do WhatsApp e receptor usam as mesmas funções.

## Estrutura

| Caminho | Papel |
|---|---|
| `src/components/landing/` | Início (`Landing`), Exemplos (`ExamplesPage`, `ExampleGallery`), Pacotes (`PackagesPage`), projetos reais (`RealProjects`), cabeçalho/rodapé (`Chrome`), controles de escolha e estado salvo (`useProject`) |
| `public/projetos/` | Capturas dos projetos reais (WebP, origem e data no README da pasta) |
| `src/app/fonts/` | Plus Jakarta Sans (títulos), arquivo local com licença OFL |
| `src/app/criar/` · `src/components/builder/` | Página de criação: fluxo e barra do celular (`Builder`), descrição por áudio/texto (`Describe`), negócio e objetivo (`Steps`), prévia pronta e escolhas uma por tela (`Choices`, `Pickers`), revisão, pedido, copiar resumo e arquivo do projeto (`Site`), escolha, comparação e troca reversível de pacotes (`Packages`) |
| `src/lib/plan.ts` | **Plano da prévia**: a única seleção visual (família, variante, topo com imagem ou tipográfico, imagens, fonte, títulos e ações). Miniatura, exemplo aberto, prévia do celular e do computador, editor e resumo usam o mesmo cálculo |
| `src/components/preview/SitePreview.tsx` · `Preview.module.css` | Prévia do site montada pelo plano: primeira dobra e serviços próprios de cada família; estilos mudam só tons, formas e títulos |
| `public/demo/` | Ilustrações próprias por tipo de negócio (SVG, sem links externos; catálogo em `src/config/assets.ts`) |
| `src/lib/logo.ts` | Logo enviada para a prévia — fica só no navegador |
| `src/lib/project.ts` | Modelo do projeto (v4, revisão 2), pacotes, validação, migração da v1/v2/v3, tipo de negócio e nome exibido, links, mensagem |
| `src/lib/leads.ts` | Contrato do pedido, validação, envio com idempotência |
| `src/lib/analytics.ts` · `origin.ts` | Eventos e origem da visita |
| `integrations/lead-receiver/` | Receptor de referência e modelo do CRM |
| `integrations/ai-preview/` · `src/lib/aiPreview.ts` | Prévia por descrição com o Gemini: servidor intermediário (Cloudflare Worker) e contrato/validação da sugestão. Desligado sem `NEXT_PUBLIC_AI_ENDPOINT` — ver o README da pasta |
| `public/brand/` | Símbolo oficial e foto do responsável |

## Publicar

O workflow `.github/workflows/pages.yml` publica a cada merge em `main`,
com `NEXT_PUBLIC_SITE_ENV=production`. Variáveis opcionais do repositório
(Settings → Secrets and variables → Actions → Variables) estão em
`.env.example` e em `OPERACAO.md`.
