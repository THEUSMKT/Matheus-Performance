# Operação — pedidos, CRM, medição e testes

Este documento descreve o que a página faz hoje, o que já está preparado e
como ativar cada parte. Nenhum segredo aparece aqui nem no código da página.

---

## 1. Como os pedidos chegam hoje (modo WhatsApp)

O site é estático (GitHub Pages) e não tem servidor. Por isso, sem receptor
configurado:

- O botão final, na etapa “Revise e solicite”, é **“Solicitar desenvolvimento”**
  (ou “Pedir orçamento personalizado”, quando o projeto sai dos pacotes). Ele
  abre o WhatsApp com o resumo pronto — empresa, segmento, objetivo, serviço,
  estilo e cores, pacote, valor, seções, recursos, prazo, observações e o
  link das opções de layout; nada é enviado até o visitante tocar em enviar.
- A página **nunca** diz que o pedido foi recebido e **nunca** emite
  `generate_lead`. Abrir o WhatsApp é registrado como `whatsapp_open`
  (intenção).
- A mensagem traz uma referência `Ref.: bp-xxxxxxxxxx · origem` para você
  ligar a conversa ao projeto e à campanha.

**Registro manual recomendado enquanto não há receptor:** a cada conversa
nova, crie o card no CRM (ou planilha) na etapa *Novo contato*, colando a
mensagem recebida. A referência evita duplicar o mesmo projeto.

## 2. Ativar o formulário de pedido (modo receptor)

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
5. Faça um merge em `main` (ou rode o workflow manualmente). “Solicitar
   orçamento” passa a abrir o formulário com nome + canal preferido,
   qualificação opcional e aceite separado para novidades.
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

- **Pacotes** (`src/config/packages.ts`): Essencial R$ 500 (até 5 seções),
  Profissional R$ 750 (até 7 seções, galeria de 8 imagens, formulário,
  perguntas frequentes e depoimentos reais), Completo R$ 1.000 (até 8
  seções, galeria de 15 imagens e vitrine de 10 itens). Mudar um valor ou
  limite aqui muda a apresentação, o configurador, o PDF, a mensagem e o
  receptor.
- **Projeto** (`src/lib/project.ts`, `version: 4`, `flow: guiado-v1`):
  nome, segmento (e “Outro”), serviço principal ou “Definir depois”,
  objetivo, fonte dos títulos, título/frase/serviços próprios (vazio = sugestão), seções em
  ordem, formulário, tamanho da galeria, pacote, necessidades de projeto
  personalizado, identidade, observações e dados de contato. O pacote nunca
  fica abaixo do que as escolhas exigem. Validado sempre que é lido. Projetos
  das versões anteriores (v1, v2, v3 — chaves `mb.configurador.v1…v3`) são
  convertidos ao abrir, com aviso; os dados antigos continuam no navegador
  até o visitante usar “Começar novamente”. Na conversão da v3, o antigo
  catálogo vira vitrine (Completo), formulário por e-mail vira formulário
  para WhatsApp, e página adicional ou agenda integrada viram projeto
  personalizado; o limite de orçamento deixa de existir.
- **Logo enviada** (`src/lib/logo.ts`, chave `bp.logo.v1`): reduzida no
  navegador e guardada só nele. Nunca vai no link, na mensagem nem no pedido —
  a mensagem só avisa “Logo: tenho e envio por aqui”.
- **Link “Compartilhar opções de layout”**: leva segmento, objetivo, seções,
  pacote, estilo e cores. **Não** leva nome, textos, serviços, logo,
  imagens, observações nem contato — por isso o sócio vê o layout, não a
  prévia completa. Compartilhar a prévia completa exige armazenamento em
  servidor (não existe hoje; ver seção 6).
- **Pedido** (`src/lib/leads.ts`, `schema: 2`): contato, qualificação,
  consentimentos, projeto completo, pacote e valor do navegador (só
  referência) e origem normalizada.
- **Registro no CRM** (`integrations/lead-receiver/crm.ts`, `schema: 2`):
  o receptor recalcula pacote e valor (`price`) e marca `priceMismatch`
  quando o navegador mandou outro valor.

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
| `priceMismatch = true` | Conferir pacote e valor antes da proposta |

## 4. Medição

Todos os eventos saem de `src/lib/analytics.ts`, como
`CustomEvent('mb:configurator')` e, se houver gerenciador de tags na página,
`window.dataLayer`. **Hoje nenhuma ferramenta de análise está instalada.**

| Evento | Quando | Propriedades |
|---|---|---|
| `start_click` | Clique num botão que leva à criação | `context` (`hero`, `cabecalho`, `final`, `pacotes`, `exemplo`, `flutuante`) |
| `configurator_start` | Abrir a página de criação (1× por sessão) | — |
| `step_complete` | Avançar uma etapa (1× por etapa): 1 negócio, 2 objetivo, 3 prévia pronta, 4 estilo, 5 cores, 6 títulos, 7 conteúdo, 8 seções | `step` |
| `example_opened` / `example_applied` | Abrir um exemplo / usar como ponto de partida | `segment` |
| `example_view_mode` | Trocar Computador/Celular no exemplo | `segment`, `device` |
| `preview_view` | Ver a prévia: chegar em “Sua prévia está pronta” ou na revisão, prévia gerada pela IA, tocar em “Ver meu site” ou abrir a tela cheia | `source` (`etapa`, `ia`, `alternancia`, `tela_cheia`), `step` |
| `package_selected` | Escolher um pacote (1× por pacote e origem) | `package`, `source` |
| `package_changed` | Trocar de pacote, sempre depois da confirmação | `from`, `to`, `source` (`objetivo`, `seu_site`, `secoes`, `imagens`, `incluido`) |
| `request_click` | Clique em “Solicitar desenvolvimento” (**intenção**) | `mode` (`whatsapp`, `formulario`), `package` (ou `personalizado`) |
| `whatsapp_open` | Clique para abrir o WhatsApp (**intenção, não é pedido recebido**) | `context` (`pedido`, `pedido_alternativo`, `ajuda`, `estilo_diferente`, `projeto_personalizado`, `final`, `rodape`) |
| `ai_generate` | Resultado de “Gerar minha prévia” (só com a IA ligada) | `result` (`ok`, `erro`), `reason` |
| `ai_audio` | Resultado de “Gravar minha ideia” (transcrição; cancelar não conta) | `result` (`ok`, `erro`), `reason` (`microfone`, `curto`, `sem-fala`…) |
| `layout_share` / `pdf_save` / `help_open` | Ferramentas secundárias e ajuda | `step` (ajuda) |
| `lead_submit_attempt` / `lead_submit_error` | Envio no modo receptor | `reason` |
| `generate_lead` | **Só** após o receptor confirmar o pedido salvo (1× por pedido) | `lead_ref` |

Abrir o WhatsApp (`whatsapp_open`), pedido recebido (`generate_lead` ou card
no CRM) e contratação (etapa *Aprovação* no CRM) são coisas diferentes e
nunca se misturam nos relatórios.

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
  `alimentacao`, `outro`) começa o carrossel no exemplo do segmento e abre a
  página de criação com o segmento já escolhido. Uma única página atende
  todas as campanhas — não crie cópias.
- Preparar a página para campanhas não inclui iniciar anúncios ou gastar verba.

### Indicadores

| Indicador | Cálculo |
|---|---|
| Início do configurador | `configurator_start` ÷ visitas |
| Conclusão por etapa | `step_complete(n)` ÷ `configurator_start` |
| Chegada à prévia pronta | `preview_view(source=etapa)` ÷ `configurator_start` |
| Troca de pacote | `package_changed` ÷ `preview_view(source=etapa)` |
| Pedido de desenvolvimento | `request_click` ÷ `preview_view(source=etapa)` |
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

## 6. Prévia por descrição (IA)

Desligada até existir a variável `AI_ENDPOINT` no repositório. Configuração
passo a passo (chave do Gemini, Cloudflare Worker, segredo, teste) em
[`integrations/ai-preview/README.md`](integrations/ai-preview/README.md).
A IA só escolhe entre os layouts, estilos, cores e seções existentes e
sugere textos; não troca pacote nem marca itens de projeto personalizado.
A descrição não é guardada em servidor; no navegador, o rascunho fica só
na aba (`sessionStorage`, chave `bp.descricao.v1`).

**Por áudio:** o botão “Gravar áudio” aparece quando o navegador permite
gravar (Chrome, Edge, Firefox e Safari atuais, em HTTPS). A gravação tem de
2 a 90 segundos, vira texto no próprio campo e a pessoa confere antes de
gerar. O áudio não é guardado em lugar nenhum e o microfone é liberado assim
que a gravação para. Sem permissão de microfone, a mensagem orienta a
escrever.

## 7. Decisões e dependências em aberto

- **Compartilhar a prévia completa com um sócio** exige guardar o projeto
  num servidor (banco ou armazenamento de arquivos com link privado). Hoje
  não existe essa infraestrutura, então a função se chama “Compartilhar
  opções de layout” e diz o que não leva. Ativar isso significa escolher e
  pagar um serviço — decisão sua.
- **Prazos por pacote:** os prazos antigos por complexidade (3–5, 5–8 e 7–12
  dias úteis) foram associados, na ordem, a Essencial, Profissional e
  Completo. Confirme se valem assim.
- **Formas de pagamento, entrada e parcelamento** não existem na página
  (nada foi inventado). Se houver condição definida, inclua em
  `projectFaq.ts`.
- **Projetos reais e depoimentos:** a seção fica oculta até existir
  material autorizado em `src/config/proof.ts`.
- **Indexação:** a página fica fora do Google até `indexarNoGoogle: true` em
  `contact.ts` (decisão mantida). A página de criação nunca é indexada e
  saiu do sitemap.
- **Prazo de retorno:** nenhum é prometido até `RESPONSE_EXPECTATION` existir.
