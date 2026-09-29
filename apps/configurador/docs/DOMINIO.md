# Domínio próprio e lançamento — plano (não executado)

Este documento prepara a mudança; nada aqui foi aplicado. O domínio ainda não
foi escolhido nem registrado — nenhum nome abaixo é real. Os endereços
publicados hoje continuam valendo:

- `https://theusmkt.github.io/Matheus-Performance/` — site de gestão de tráfego (raiz do repositório)
- `https://theusmkt.github.io/Matheus-Performance/configurador/` — criação de sites (este app)

## Estrutura desejada

| Endereço | Conteúdo |
|---|---|
| `https://SEU-DOMINIO/` | site de gestão de tráfego (continua na raiz) |
| `https://SEU-DOMINIO/sites/` | página inicial de criação de sites |
| `https://SEU-DOMINIO/sites/exemplos/` | exemplos |
| `https://SEU-DOMINIO/sites/pacotes/` | pacotes |
| `https://SEU-DOMINIO/sites/criar/` | configurador |

## Como a publicação funciona hoje

`.github/workflows/pages.yml` monta **um único site** do GitHub Pages:

1. copia a raiz do repositório (site de tráfego) para `_site/`;
2. gera este app com `NEXT_PUBLIC_BASE_PATH=/Matheus-Performance/configurador` e o copia para `_site/configurador/`.

O domínio próprio do GitHub Pages vale para **esse conjunto inteiro**: ao
configurá-lo (Settings → Pages → Custom domain), a raiz passa a responder em
`https://SEU-DOMINIO/` e o prefixo `/Matheus-Performance` deixa de existir.
Por isso o prefixo do configurador precisa mudar junto.

## Passo a passo no dia da migração

1. **Registrar o domínio** e apontar o DNS para o GitHub Pages (registros
   `A`/`AAAA` do apex e `CNAME` do `www`, conforme a documentação do GitHub).
2. **Workflow** (`pages.yml`):
   - `BASE_PATH: /sites` (em vez de `/Matheus-Performance/configurador`);
   - copiar o build para `_site/sites/` (em vez de `_site/configurador/`);
   - manter uma página em `_site/configurador/` que redirecione para `/sites/`
     (HTML estático com `<meta http-equiv="refresh">` e `<link rel="canonical">`),
     para que links antigos compartilhados continuem funcionando.
3. **Endereços** — um arquivo só, `src/config/contact.ts`:
   - `siteUrl: 'https://SEU-DOMINIO/sites'` (sem barra no fim; precisa bater com `BASE_PATH`);
   - `mainSiteUrl: 'https://SEU-DOMINIO/'`.
   Canonical, Open Graph, imagem de compartilhamento (`compartilhar.png`),
   sitemap, dados estruturados, link "Gestão de tráfego pago" do rodapé,
   endereço do projeto "Matheus Beck" (`proof.ts`) e links de projeto
   compartilhados derivam desses dois valores.
   (São constantes de propósito: o Worker da IA importa este arquivo e não
   tem `process.env`.)
4. **Worker da IA** (`integrations/ai-preview/wrangler.toml`): incluir a nova
   origem em `ALLOWED_ORIGINS`, **sem barra e sem caminho** (a origem do
   navegador não leva `/sites`):
   `ALLOWED_ORIGINS = "https://theusmkt.github.io,https://SEU-DOMINIO"`
   Publicar o Worker **antes** do site novo; remover a origem antiga só
   depois de algumas semanas. Se usar `www`, incluir as duas formas.
5. **Receptor de pedidos** (`integrations/lead-receiver`), se estiver ativo:
   mesma regra de origem.
6. **Site de tráfego** (raiz): revisar os links absolutos para o configurador
   (`/Matheus-Performance/configurador/` → `/sites/`) — fora do escopo deste app.
7. **Conferir antes de anunciar**: rotas diretas e atualização de página em
   `/sites/`, `/sites/exemplos/`, `/sites/pacotes/`, `/sites/criar/`;
   imagens e fontes sem `404`; `compartilhar.png` com `Content-Type: image/png`;
   geração da prévia pela IA (CORS).

### Atenção: projetos salvos no navegador

A prévia fica salva no `localStorage` do navegador, que é separado por
origem. Quem começou uma prévia em `theusmkt.github.io` **não** a verá em
`SEU-DOMINIO`. O arquivo de projeto (Salvar ou compartilhar projeto →
exportar) e o link de opções continuam funcionando no endereço novo.

## Indexação (liberar só no lançamento definitivo)

Hoje nada é indexado, de propósito:

- **De onde vem o `noindex`:** `src/app/layout.tsx` usa
  `robots: { index: false }` enquanto `isProduction && contact.indexarNoGoogle`
  for falso. `isProduction` vem de `NEXT_PUBLIC_SITE_ENV=production`
  (definido no workflow); `indexarNoGoogle` está `false` em
  `src/config/contact.ts`. Exemplos e pacotes herdam essa regra; `criar/` é
  sempre `noindex` (mostra dados digitados); privacidade e termos também.
- **`robots.txt`:** o app gera o dele em `.../configurador/robots.txt`, mas os
  buscadores só leem o da **raiz do domínio**. Hoje quem vale é o
  `robots.txt` da raiz do repositório (site de tráfego). Com domínio próprio,
  acrescente ao `robots.txt` da raiz as regras de `/sites/` e a linha
  `Sitemap: https://SEU-DOMINIO/sites/sitemap.xml`.
- **Para liberar:** `indexarNoGoogle: true` em `contact.ts`, com o domínio
  definitivo já em `siteUrl` — nunca em builds de teste (sem
  `NEXT_PUBLIC_SITE_ENV=production`, a página continua `noindex`).
- Depois, cadastrar o domínio no Google Search Console e enviar o sitemap.
  Nenhuma posição nos resultados de busca é garantida.

## Medição

- Eventos ficam em `src/lib/analytics.ts` e vão para `window.dataLayer` e
  para o evento `mb:configurator`. **Não há coleta persistente configurada**:
  sem uma ferramenta instalada (com autorização e política de privacidade
  atualizada), os eventos não são guardados em lugar nenhum.
- `whatsapp_open` e `start_click` são **cliques**, não mensagens recebidas,
  propostas nem contratos. Não contar clique como pedido confirmado.
- Nenhum pixel, gravação de sessão ou serviço externo foi instalado.
