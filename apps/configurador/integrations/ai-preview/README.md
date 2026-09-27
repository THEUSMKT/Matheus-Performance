# Prévia por descrição (Gemini) — como ativar

A página continua estática no GitHub Pages. A chave da API do Gemini **não
pode** ficar nela (tudo que vai para o navegador é público), então um
servidor intermediário pequeno guarda a chave e conversa com o Google:

```
Navegador (GitHub Pages) ──POST {descrição}──▶ Cloudflare Worker ──chave──▶ API do Gemini
            ◀──────── sugestão validada ────────┘  (guarda a chave, limita, filtra)
```

Sem a variável `AI_ENDPOINT` no repositório, o recurso fica desligado e o
site publicado não muda.

Quando a página receber uma atualização de conteúdo ou instruções do Gemini,
publique também este Worker com `npx wrangler deploy` dentro desta pasta para
usar a geração detalhada. O contrato continua compatível com o Worker atual;
se ele ainda não tiver sido atualizado, a página mostra os textos de apoio
específicos de cada segmento.

## 1. Criar a chave do Gemini (Google AI Studio)

1. Entre em <https://aistudio.google.com> com a conta Google da empresa.
2. Menu **Get API key** → **Create API key**. Escolha (ou crie) um projeto
   do Google Cloud só para este site.
3. Copie a chave **direto para o passo 3** abaixo. Não cole em conversas,
   e-mails, arquivos do repositório nem em variáveis `NEXT_PUBLIC_*`.
4. Em **Models** (no AI Studio), confira o nome exato de um modelo Flash-Lite
   disponível e atualize `GEMINI_MODEL` no `wrangler.toml` se for diferente.

Uso gratuito: tem limite de pedidos por minuto e por dia (Google ajusta os
números com frequência — veja a página *Rate limits* da documentação e o
painel do AI Studio). No uso gratuito o Google pode usar o conteúdo enviado
para melhorar os produtos dele, com revisão humana; por isso a página pede
para não incluir dados pessoais e o Worker remove e-mails e telefones.
Ativar o faturamento no projeto (plano pago) muda isso e aumenta os limites.

## 2. Criar o Worker (Cloudflare)

1. Crie uma conta gratuita em <https://dash.cloudflare.com/sign-up>.
2. No computador, dentro desta pasta:

```bash
cd apps/configurador/integrations/ai-preview
npx wrangler login          # abre o navegador para autorizar
npx wrangler deploy         # publica; anote o endereço *.workers.dev
```

O `wrangler.toml` já traz: origem permitida (`https://theusmkt.github.io`),
modelo e limite de 5 gerações por minuto por visitante.

## 3. Cadastrar a chave como segredo do Worker

```bash
npx wrangler secret put GEMINI_API_KEY    # cole a chave quando pedir
```

(ou no painel: Workers & Pages → beck-configurador-ia → Settings →
Variables and Secrets → Add → tipo **Secret**). A chave fica criptografada
na Cloudflare e nunca aparece no código, no log nem na resposta.

Teste rápido (troque o endereço):

```bash
curl -s https://beck-configurador-ia.SEU-USUARIO.workers.dev \
  -H 'Origin: https://theusmkt.github.io' -H 'Content-Type: application/json' \
  -d '{"schema":1,"description":"Faço bolos e doces sob encomenda e quero receber pedidos pelo WhatsApp."}'
```

Deve voltar `{"ok":true,"suggestion":{...}}`.

## 4. Ligar na página

No GitHub: **Settings → Secrets and variables → Actions → Variables → New
repository variable**: nome `AI_ENDPOINT`, valor = endereço do Worker. É uma
variável (não segredo) porque o endereço é público — a proteção está no
Worker. O próximo build publicado mostra “Descreva o site que você quer” na
página de criação. Para desligar, apague a variável e publique de novo.

## Segurança e custos

| Proteção | Onde |
|---|---|
| Chave só como segredo do Worker | `wrangler secret put` |
| Só o site permitido chama o Worker (CORS + checagem de origem) | `ALLOWED_ORIGINS` |
| 5 gerações/minuto por IP | `[[ratelimits]]` |
| Descrição de 20 a 1.200 caracteres, corpo até 6 KB | `worker.ts` |
| E-mails e telefones removidos antes do Gemini | `redact()` em `src/lib/aiPreview.ts` |
| Resposta validada: ids do catálogo, textos limitados, sem alegações inventadas, pacote nunca muda | `sanitizeSuggestion()` / `applySuggestion()` |
| Nada do texto vai para log ou armazenamento | `worker.ts` registra só códigos de status |

A checagem de origem impede o uso por outros sites no navegador, mas não
impede chamadas diretas de quem copiar o endereço — por isso o limite por IP
e a cota diária do próprio Gemini. Se houver abuso, ative também o
Turnstile (anti-robô gratuito da Cloudflare) numa próxima etapa.

## Falhas passageiras e diagnóstico

Se o Gemini responder 500/503, demorar mais de 18 s ou devolver um JSON
cortado ou fora do formato, o Worker tenta **mais uma vez** (no máximo duas
chamadas por pedido; cada uma conta na cota do Gemini). Cota esgotada (429),
conteúdo bloqueado e erros de configuração (400/403) não são repetidos. A
página espera até 45 s.

Para ver o motivo de um erro, na pasta deste Worker:

```bash
npx wrangler tail --format pretty
```

e gere uma prévia no site. O log mostra só status e motivo (`status: 503`,
`reason: formato`, `TimeoutError`, `nova tentativa`) — nunca o texto nem a
chave. `Ctrl + C` encerra.
