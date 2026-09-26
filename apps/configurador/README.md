# Configurador de sites — Beck Performance

Página de criação de sites para empresas de todos os portes. A apresentação
(`/`) mostra exemplos e o investimento inicial; a página de criação
(`/criar/`) monta a prévia do site em quatro etapas — Seu negócio →
Aparência → Conteúdo → Sua prévia — com a prévia ao lado (ou em
“Ver prévia”, no celular). No fim, a estimativa e o pedido de orçamento pelo
WhatsApp com o resumo pronto. Tudo fica salvo no navegador.

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
npm test           # regras de preço, migração, orçamento, pedidos e eventos
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
| `contact.ts` | Marca, responsável, **WhatsApp** (único lugar do número), e-mail e Instagram (vazios = não aparecem), liberação para o Google |
| `pricing.ts` | Valor base, acréscimos, faixa exibida, prazos e como a identidade visual entra no preço |
| `offer.ts` | Os três caminhos de contratação, necessidades que exigem diagnóstico, regras de escopo, rodadas de ajuste |
| `forms.ts` | Formulário por WhatsApp ou e-mail, limite do plano gratuito e textos de volume |
| `features.ts` · `siteTypes.ts` | Nomes dos recursos e categorias |
| `projectFaq.ts` | Perguntas frequentes (valores vêm de `pricing.ts`) |
| `copy.ts` | Frases de apresentação sugeridas por segmento (exemplos editáveis) |
| `experiments.ts` | Testes de mensagem e CTA (todos inativos) |
| `integrations.ts` | Receptor de pedidos e ambiente, lidos de variáveis de ambiente |

O cálculo mora em `src/lib/estimate.ts`: a função `breakdown()` gera as
linhas da composição e o total é a soma delas. Página, PDF, mensagem do
WhatsApp e receptor usam a mesma função — não há como divergirem.

## Estrutura

| Caminho | Papel |
|---|---|
| `src/components/landing/` | Apresentação, cabeçalho/rodapé (`Chrome`), controles de escolha e estado salvo (`useProject`) |
| `src/app/criar/` · `src/components/builder/` | Página de criação: as quatro etapas, escolhas visuais, resumo e pedido |
| `src/components/preview/SitePreview.tsx` | Prévia do site que reflete nome, logo, estilo, cores, seções e objetivo |
| `src/components/InspirationPreview.tsx` | Miniaturas dos exemplos (`Inspiration.module.css`) |
| `src/lib/logo.ts` | Logo enviada para a prévia — fica só no navegador |
| `src/lib/project.ts` | Modelo do projeto (v3), validação, migração da v1/v2, links, mensagem |
| `src/lib/leads.ts` | Contrato do pedido, validação, envio com idempotência |
| `src/lib/analytics.ts` · `origin.ts` | Eventos e origem da visita |
| `integrations/lead-receiver/` | Receptor de referência e modelo do CRM |
| `public/brand/` | Símbolo oficial e foto do responsável |

## Publicar

O workflow `.github/workflows/pages.yml` publica a cada merge em `main`,
com `NEXT_PUBLIC_SITE_ENV=production`. Variáveis opcionais do repositório
(Settings → Secrets and variables → Actions → Variables) estão em
`.env.example` e em `OPERACAO.md`.
