# Operação — pedidos, CRM, medição e testes

Este documento descreve o que a página faz hoje, o que já está preparado e
como ativar cada parte. Nenhum segredo aparece aqui nem no código da página.

---

## 1. Como os pedidos chegam hoje (modo WhatsApp)

O site é estático (GitHub Pages) e não tem servidor. Por isso, sem receptor
configurado:

- O botão final é **“Preparar conversa no WhatsApp”**. Ele abre o WhatsApp com
  o resumo pronto; nada é enviado até o visitante tocar em enviar.
- A página **nunca** diz que o pedido foi recebido e **nunca** emite
  `generate_lead`. Abrir o WhatsApp é registrado como `whatsapp_open`
  (intenção).
- A mensagem traz uma referência `Ref.: bp-xxxxxxxxxx · origem` para você
  ligar a conversa ao projeto e à campanha.

**Registro manual recomendado enquanto não há receptor:** a cada conversa
nova, crie o card no CRM (ou planilha) na etapa *Novo contato*, colando a
mensagem recebida. A referência evita duplicar o mesmo projeto.

## 2. Ativar o formulário “Solicitar proposta” (modo receptor)

O contrato, a validação, a idempotência e um receptor de referência já estão
prontos e testados (`npm test`).

1. Hospede `integrations/lead-receiver/receiver.ts` numa função serverless
   (Cloudflare Workers, Vercel, Netlify Functions, AWS Lambda…) ou num
   servidor Node. O handler recebe `{ method, headers, body }` e devolve
   `{ status, headers, body }` — adapte essas três linhas ao provedor.
   O código importa `src/lib/*` do configurador; compile com o mesmo
   `tsconfig` (alias `@/` → `src/`).
2. Implemente os três adaptadores com o serviço escolhido:
   - `LeadStore` — onde o pedido é salvo **antes** da resposta. `put` precisa
     ser atômico por chave (inserção condicional) para duas requisições
     simultâneas não criarem dois registros.
   - `CrmAdapter` — cria/atualiza o card no CRM.
   - `RetryQueue` — fila para reenviar ao CRM quando ele falhar.
3. Configure no ambiente **da função** (nunca no repositório):
   `LEAD_ALLOWED_ORIGIN=https://theusmkt.github.io`, o token do CRM e o
   acesso ao armazenamento.
4. No GitHub: Settings → Secrets and variables → Actions → **Variables**:
   - `LEAD_ENDPOINT` = URL pública da função (não é segredo).
   - `RESPONSE_EXPECTATION` = prazo real de retorno, se houver (ex.: “em até
     1 dia útil”). Vazio = nenhuma promessa.
5. Faça um merge em `main` (ou rode o workflow manualmente). A página passa a
   mostrar o formulário com nome + canal preferido, qualificação opcional e
   aceite separado para novidades.
6. Teste em produção com um pedido real seu e confira: registro salvo, card
   no CRM, evento `generate_lead` uma única vez.

### O que o receptor garante

| Situação | Comportamento |
|---|---|
| Dados inválidos | 422; a página mostra o erro e mantém tudo preenchido |
| Clique duplo / nova tentativa | Mesma `Idempotency-Key` → devolve o mesmo `leadId` com `duplicate: true` |
| Estimativa adulterada no navegador | Recalculada no servidor; `estimateMismatch: true` no registro |
| Falha ao salvar | 503; a página **não** confirma e oferece nova tentativa ou WhatsApp |
| CRM fora do ar | Pedido já salvo; job `crm_upsert` na fila; visitante recebe confirmação |
| Origem diferente da permitida | 403 |

Resposta de sucesso obrigatória: `{ "ok": true, "leadId": "..." }`. Qualquer
outra resposta é tratada como falha pela página.

## 3. Modelo de dados

- **Projeto** (`src/lib/project.ts`, `version: 3`, `flow: assistido-4m-v1`):
  segmento, serviço principal, objetivo ou pedido de orientação, necessidades
  complexas, caminho, seções, identidade, recursos, limite de orçamento e
  dados de contato. Validado sempre que é lido. Versões anteriores (v1, v2)
  são convertidas ao abrir; os dados antigos continuam no navegador até o
  visitante usar “Começar novamente”.
- **Pedido** (`src/lib/leads.ts`, `schema: 1`): contato, qualificação,
  consentimentos, projeto completo, estimativa do navegador (só referência) e
  origem normalizada.
- **Registro no CRM** (`integrations/lead-receiver/crm.ts`, `schema: 1`).

### Etapas do CRM

`Novo contato → Qualificação → Proposta → Aprovação → Materiais →
Desenvolvimento → Revisão → Publicação → Acompanhamento`, e **Perdido** com
motivo obrigatório (preço, prazo, sem resposta, escopo, concorrente, adiado,
outro). Pré-venda não vira produção: só se avança uma etapa por vez
(`canMove`).

### Automações sugeridas (configurar no CRM)

| Gatilho | Ação |
|---|---|
| Card criado em Novo contato | Tarefa “responder” para o mesmo dia útil |
| Novo contato sem movimento há 2 dias úteis | Lembrete de follow-up |
| Proposta sem resposta há 5 dias úteis | Follow-up; após 2 tentativas, Perdido / sem resposta |
| Aprovação → Materiais | Enviar lista de materiais (textos, imagens, logo, acessos) |
| Publicação concluída | Tarefa de acompanhamento em 30 dias |
| `estimateMismatch = true` | Revisar a estimativa antes da proposta |

## 4. Medição

Todos os eventos saem de `src/lib/analytics.ts`, como
`CustomEvent('mb:configurator')` e, se houver gerenciador de tags na página,
`window.dataLayer`. **Hoje nenhuma ferramenta de análise está instalada.**

| Evento | Quando | Propriedades |
|---|---|---|
| `configurator_start` | Primeira interação no configurador (1× por sessão) | — |
| `step_complete` | Avançar um momento (1× por momento) | `step` |
| `recommendation_applied` | Usar a recomendação | `plan`, `source` |
| `plan_selected` | Escolher um caminho | `plan`, `source` |
| `example_opened` / `example_applied` | Abrir a demonstração (ou trocar de exemplo nela) / usar como ponto de partida | `segment` |
| `example_view_mode` | Trocar Computador/Celular na demonstração | `segment`, `device` |
| `summary_view` | Chegar ao resumo (1× por sessão) | — |
| `whatsapp_open` | Clique para abrir o WhatsApp (**intenção**) | `context` (`hero`, `barra_fixa`, `ajuda`, `resumo`, `final`, `rodape`) |
| `share_link` / `pdf_save` / `help_open` | Ferramentas do resumo e ajuda | `step` (ajuda) |
| `lead_submit_attempt` / `lead_submit_error` | Envio no modo receptor | `reason` |
| `generate_lead` | **Só** após o receptor confirmar o pedido salvo (1× por pedido) | `lead_ref` |

Todo evento leva `flow_version`, variantes ativas e UTMs normalizadas.
Nunca levam nome, telefone, e-mail, textos digitados nem URL completa.
Qualificação, proposta e venda (`qualify_lead`, `proposal_sent`,
`deal_won`, `deal_lost`) acontecem no CRM e não são disparadas pela página.

Para instalar GA4 ou Meta via Google Tag Manager: inclua o snippet no
`layout.tsx`, crie gatilhos de evento personalizado para os nomes acima e
**atualize a Política de Privacidade antes de publicar**.

### Campanhas

- UTMs permitidas: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`,
  `utm_term` — em minúsculas, sem acento, até 60 caracteres. Valores que
  parecem e-mail ou telefone são descartados. Vale a primeira origem da sessão.
- `?segmento=beleza` (ids: `local`, `beleza`, `consultoria`, `criativo`,
  `alimentacao`, `outro`) abre a página com a prévia e o configurador daquele
  segmento. Uma única página atende todas as campanhas — não crie cópias.
- Preparar a página para campanhas não inclui iniciar anúncios ou gastar verba.

### Indicadores

| Indicador | Cálculo |
|---|---|
| Início do configurador | `configurator_start` ÷ visitas |
| Conclusão por momento | `step_complete(n)` ÷ `configurator_start` |
| Chegada ao resumo | `summary_view` ÷ `configurator_start` |
| Intenção de contato | `whatsapp_open(resumo)` ÷ `summary_view` |
| Pedidos confirmados | `generate_lead` (modo receptor) ou cards criados no CRM (modo WhatsApp) |
| Proposta, fechamento, perda | No CRM, por etapa e motivo de perda |
| Custo por pedido | Verba da campanha ÷ pedidos confirmados da mesma origem |

Métricas de experiência (LCP, INP, CLS) devem ser medidas no Search Console
ou PageSpeed Insights depois da publicação — não há valores afirmados aqui.

## 5. Testes A/B

`src/config/experiments.ts` tem três testes, todos **inativos**
(`hero`, `fluxo`, `cta`). Com `active: false`, todo visitante vê o controle.
Para revisar uma variante sem ativar: `?v_hero=b` ou `?v_cta=b`.

Ao ativar: a variante fica estável por visitante (`localStorage`) e vai em
todos os eventos (`var_hero`, `var_cta`). Defina antes a métrica principal
e o volume mínimo; não declare vencedor com poucos pedidos e não teste mais
de uma coisa na mesma área ao mesmo tempo. Nenhum resultado foi simulado.

## 6. Decisões comerciais em aberto

- **Identidade visual no pacote:** `pricing.identity.mode` está em
  `'vigente'` (Elegante e Marcante somam acréscimo). Trocar para
  `'incluida'` inclui a aplicação básica da identidade no pacote e mantém
  cobrados só trabalhos identificáveis (como adaptar cores próprias). Os
  testes cobrem os dois modos.
- **Indexação:** a página fica fora do Google até `indexarNoGoogle: true` em
  `contact.ts`. O build publicado já roda como produção, então essa troca é a
  única ação necessária.
- **Prazo de retorno:** nenhum é prometido até `RESPONSE_EXPECTATION` existir.
