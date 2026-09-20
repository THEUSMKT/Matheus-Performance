# Matheus Beck — Landing page de alta conversão

Site pessoal de **gestão de tráfego pago e posicionamento digital**.
HTML, CSS e JavaScript puros — sem build, sem dependências para instalar.
É só abrir, editar e publicar.

---

## Como rodar localmente

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Publicar: suba a pasta inteira em qualquer hospedagem estática
(Netlify, Vercel, Cloudflare Pages, Hostinger, GitHub Pages).
O `netlify.toml` já traz os cabeçalhos de cache prontos.

### Publicação automática no GitHub Pages

O workflow `.github/workflows/pages.yml` publica o site (sem build, é
HTML/CSS/JS puro) a cada push na branch `main`.

**Passo único e manual**, feito pelo dono do repositório — nenhuma ferramenta
de automação consegue fazer isso pela API, é uma configuração de Settings:

1. `Settings` → `Pages` (barra lateral esquerda)
2. Em **Build and deployment → Source**, escolha **GitHub Actions**
3. Pronto — o próximo push em `main` já publica

O site fica em: **https://theusmkt.github.io/Matheus-Performance/**

---

## Estrutura

```
index.html              → todo o conteúdo da página
assets/css/style.css    → estilos (tokens de cor e fonte no topo, em :root)
assets/js/main.js       → interações (CONFIG do WhatsApp nas primeiras linhas)
assets/img/             → imagens (hoje são placeholders SVG)
robots.txt · sitemap.xml · netlify.toml
```

---

## ✅ Checklist do que você precisa trocar

### 1. WhatsApp e e-mail — `assets/js/main.js`, linhas 8–15

```js
const CONFIG = {
  whatsapp: '5551999999999',          // ← DDI + DDD + número, só dígitos
  email: 'contato@seudominio.com.br', // ← seu e-mail
  mensagemPadrao: '...'
};
```

Todos os botões da página (hero, planos, rodapé, botão flutuante e o formulário)
montam o link a partir daí — **um único lugar para alterar**.
Cada botão já leva a sua própria mensagem pronta, via atributo `data-wa`
(ex.: o botão do plano Performance Meta abre o WhatsApp escrito
"Tenho interesse no plano Performance Meta").

### 2. Suas imagens — `assets/img/`

Substitua os arquivos abaixo. **Mantenha os mesmos nomes** e o site funciona sem mexer no código
(se trocar a extensão, por exemplo para `.webp`, atualize a referência no `index.html`):

| Arquivo | Onde aparece | Tamanho ideal |
|---|---|---|
| `hero.svg` → `hero.webp` | fundo da primeira dobra | 2000×1250, você à direita do enquadramento |
| `sobre.svg` → `sobre.webp` | seção "Quem está por trás" | 800×1000 (retrato 4:5) |
| `assinatura.svg` | assinatura sob a frase de autoridade | PNG/SVG com fundo transparente |
| `avatar.svg` | fotos dos depoimentos | 112×112 (uma por depoente) |
| `logo.svg` | slot da sua logo | SVG de preferência |
| `favicon.svg` | ícone da aba | 64×64 |
| `og-image.jpg` | prévia ao compartilhar no WhatsApp/redes | 1200×630 |

> **Dica de performance:** exporte as fotos em WebP com qualidade 80.
> A foto do hero é a única imagem carregada com prioridade; todas as outras já usam `lazy loading`.

**Para usar sua logo no lugar do texto "Matheus Beck"** no menu, troque em `index.html`:

```html
<a href="#hero" class="nav__logo">Matheus<span>Beck</span></a>
<!-- por -->
<a href="#hero" class="nav__logo"><img src="assets/img/logo.svg" alt="Matheus Beck" height="34"></a>
```

### 3. Textos entre colchetes

Busque por `[` no `index.html` — todo placeholder está marcado assim:

- `[SUBSTITUA ESTE BLOCO PELA SUA TRAJETÓRIA REAL]` — seção Sobre
- `[NOME DO CLIENTE]`, `[Empresa]`, `[Cidade]` — depoimentos
- `[SUBSTITUA POR UM CASE REAL]`, `[CIDADE]` — cases
- `[LOGO 01]`…`[LOGO 08]` — faixa de logos de clientes
- `[EVENTO]` — selo de palestrante
- `[AJUSTE ESTA RESPOSTA ÀS SUAS CONDIÇÕES]` — FAQ sobre contrato
- `CNPJ 00.000.000/0001-00` — rodapé

### 4. Números e preços

- **Provas sociais** (hero e seção Resultados): o valor final fica no atributo `data-count`.
  Ex.: `<strong class="counter" data-count="120" data-prefix="+">` conta de 0 a 120.
  `data-prefix` e `data-suffix` controlam "R$" e "mi/mil/x".
- **Preços dos planos**: edite direto no `index.html`, dentro de `<p class="plan__price">`.
  Para "sob consulta", use a mesma marcação do plano Exclusive.

### 5. Domínio e SEO — `index.html` (topo do arquivo)

Troque `https://www.seudominio.com.br/` em: `canonical`, Open Graph, Twitter Card
e no bloco de dados estruturados (JSON-LD). No JSON-LD, ajuste também telefone,
e-mail, cidade/UF e os links de redes sociais (`sameAs`).
Faça o mesmo em `robots.txt` e `sitemap.xml`.

### 6. Pixels e analytics

No `<head>` do `index.html` existe um bloco comentado marcado
`TAGS DE RASTREAMENTO`. Cole ali os scripts oficiais:

- **Google Tag Manager** — substitua `GTM-XXXXXXX`
- **GA4** — substitua `G-XXXXXXXXXX`
- **Pixel da Meta** — substitua `SEU_PIXEL_ID`

O formulário já dispara os eventos de conversão automaticamente quando as tags existem:
`dataLayer.push({event:'lead_form_submit'})` e `fbq('track','Lead')`.

---

## O que já está pronto

**Estrutura:** hero em tela cheia → problema → quem sou → serviços → método →
resultados (números, cases, depoimentos, logos) → pacotes em abas → garantias →
FAQ → CTA final com formulário → rodapé.

**Conversão:** botão flutuante de WhatsApp com balão, barra de progresso de leitura,
mensagens pré-preenchidas por plano, formulário de diagnóstico que envia os dados
formatados direto para o seu WhatsApp, selos de escassez.

**Movimento:** entrada coreografada do hero (~2,5 s, palavra por palavra com máscara),
Ken Burns + parallax na foto, revelações no scroll, contadores animados,
linha do método que se desenha, marquee infinito de logos, cursor personalizado no desktop.

**Acessibilidade:** navegação por teclado (abas com setas, acordeão, menu),
`aria` nos componentes interativos, link "pular para o conteúdo",
contraste AA (o dourado usado em texto sobre fundo claro é a variável `--gold-ink`,
mais escura que o dourado decorativo) e respeito total a `prefers-reduced-motion`.

**Performance:** zero dependências além do GSAP via CDN, fontes com `display=swap`,
imagens com lazy loading, animações só em `transform`/`opacity`.
Se o GSAP não carregar (rede lenta, bloqueio), a página tem um **fallback em CSS puro**
com as mesmas animações — nada some da tela.

---

## Personalizar a identidade visual

Tudo está em `assets/css/style.css`, no bloco `:root` (primeiras linhas):

```css
--bg:#FAFAF7;        /* fundo principal off-white */
--pearl:#F2F1ED;     /* seções alternadas */
--ink:#141414;       /* texto principal */
--muted:#6B6B6B;     /* texto secundário */
--gold:#C8A96A;      /* dourado champagne (detalhes, fundos escuros) */
--gold-ink:#96762F;  /* dourado escuro (texto sobre fundo claro, contraste AA) */
--black:#0A0A0A;     /* hero */
```

Trocar a cor de destaque = mudar `--gold` e `--gold-ink`.
Trocar as fontes = ajustar `--serif` e `--sans` e o link do Google Fonts no `<head>`.
