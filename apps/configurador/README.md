# Configurador de sites — Matheus Beck

Landing page de conversão: a pessoa monta o próprio site em seis escolhas,
vê a estimativa de valor e prazo mudar na hora e sai pelo WhatsApp com o
briefing pronto.

Next.js 16 · TypeScript · Tailwind CSS 4 · Lucide.
Exporta HTML estático — nenhuma imagem é carregada, todas as prévias são
desenhadas em CSS.

---

## Rodar

```bash
cd apps/configurador
npm install
npm run dev      # http://localhost:3000
npm run build    # gera a pasta out/
```

`npm run build` já roda o TypeScript. Para checar os tipos sozinho:
`npm run typecheck`.

---

## O que você vai querer trocar

Tudo que muda com frequência está em `src/config/`. **Nenhum preço, texto de
oferta ou número de contato existe fora dessa pasta** — não é preciso abrir
componente nenhum.

| Arquivo | O que controla |
|---|---|
| `contact.ts` | **WhatsApp**, e-mail, Instagram, nome da marca, domínio |
| `pricing.ts` | Valor base, acréscimos, faixa exibida e prazos |
| `siteTypes.ts` | Etapa 1 — tipos de site |
| `templates.ts` | Etapa 2 — modelos e o layout de cada miniatura |
| `styles.ts` | Etapa 3 — personalidades visuais |
| `colors.ts` | Etapa 4 — paletas |
| `fonts.ts` | Etapa 5 — combinações tipográficas |
| `features.ts` | Etapa 6 — funcionalidades |
| `faq.ts` | Perguntas frequentes |
| `portfolio.ts` | Vitrine "Veja o que dá para criar" |

### 1. Número do WhatsApp

`src/config/contact.ts`:

```ts
whatsapp: '5551999999999',   // ← DDI + DDD + número, só dígitos
```

Todos os botões da página montam o link a partir daí. A mensagem enviada é
construída em `src/lib/whatsapp.ts` e já vai codificada com
`encodeURIComponent`.

### 2. Preços

`src/config/pricing.ts`:

```ts
base: 500,          // projeto base
rangeSpread: 0.1,   // a faixa exibida é ±10% sobre o total
byFeature: { formulario: 50, galeria: 80, ... },
```

O piso da faixa nunca fica abaixo de `base` — com nada escolhido a página
mostra **R$ 500 – 550**. O cálculo está em `src/lib/estimate.ts` e não
contém valor nenhum escrito à mão.

### 3. Prazos

Também em `pricing.ts`, em `deadlines` (faixas por pontos de complexidade) e
`complexity` (quanto cada escolha pesa).

---

## Como o preview funciona

`SitePreview.tsx` desenha uma miniatura de site inteira em CSS, a partir de
quatro coisas: **paleta** (cores), **skin** (raio, densidade, peso do
título), **layout** (um dos seis arranjos) e **funcionalidades** (cada uma
acrescenta um bloco na página). `src/lib/preview.ts` traduz as escolhas
nesse formato.

A escala usa `cqw` (container query units), então a mesma peça serve de
miniatura de 200px na vitrine e de prévia grande no configurador, sem media
query.

Para incluir um layout novo: acrescente o nome em `PreviewLayout`
(`src/lib/types.ts`) e o `case` correspondente em `renderLayout()`.

---

## Publicar

Ainda não há hospedagem configurada — isso fica para quando o provedor for
escolhido.

O que já está pronto: `npm run build` gera a pasta `out/` com HTML, CSS e
JS estáticos, sem servidor. É só apontar o host para ela. O que o provedor
vai precisar saber:

| | |
|---|---|
| Diretório base | `apps/configurador` |
| Comando de build | `npm run build` |
| Pasta publicada | `out` |
| Node | 22 |

Duas observações para a hora do deploy: a imagem de compartilhamento sai em
`out/opengraph-image` sem extensão e precisa ser servida como `image/png`,
e `out/_next/static/` pode receber cache longo porque os nomes dos arquivos
já têm hash.

---

## Antes de ir ao ar

- [ ] `contact.ts`: WhatsApp, e-mail, Instagram e `siteUrl`
- [ ] `pricing.ts`: conferir se os valores batem com o que você cobra
- [ ] `portfolio.ts`: trocar os nomes fictícios pelos projetos reais
- [ ] `/privacidade` e `/termos`: revisar os textos
- [ ] escolher o provedor de hospedagem e configurar o build acima
