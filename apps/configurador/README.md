# Configurador de sites — Beck Performance

Prévia gratuita do site da empresa em poucos passos e desenvolvimento em
três pacotes de valor fixo (R$ 500, R$ 750 e R$ 1.000). Páginas:

- **Início (`/`)**, objetiva:
  - apresentação;
  - dois projetos reais ("Da ideia ao ar");
  - como funciona;
  - acessos a exemplos e pacotes;
  - quem desenvolve;
  - dúvidas essenciais e chamada final.
- **Exemplos (`/exemplos/`)**:
  - projetos reais, com "Visitar site";
  - modelos demonstrativos por segmento, com filtros, visualização no
    computador e no celular e "Criar minha prévia com este modelo".
- **Pacotes (`/pacotes/`)**:
  - comparação compacta;
  - cartões completos de cada pacote;
  - comparação lado a lado;
  - condições (domínio e hospedagem, depois da entrega, o que não está
    incluído, projeto personalizado).
- **Criação (`/criar/`)**:
  - monta a prévia contando sobre o negócio (por áudio, texto ou passo a
    passo);
  - depois vem "Sua prévia está pronta";
  - em seguida, uma escolha por tela: pacote, estilo, cores, títulos,
    conteúdo e seções;
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
npm test           # pacotes, limites, migração, mensagem, pedidos e eventos
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
| `segments.ts` | Segmentos, textos sugeridos, estilos e cores sugeridos, respostas rápidas e regras por palavra-chave (ex.: ar-condicionado → imagem de climatização) |
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
| `src/components/preview/SitePreview.tsx` | Prévia do site: nome, logo, segmento, serviço, objetivo, estilo, cores e seções na ordem escolhida |
| `public/demo/` | Ilustrações próprias por segmento (SVG, sem links externos) |
| `src/lib/logo.ts` | Logo enviada para a prévia — fica só no navegador |
| `src/lib/project.ts` | Modelo do projeto (v4), pacotes, validação, migração da v1/v2/v3, links, mensagem |
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
