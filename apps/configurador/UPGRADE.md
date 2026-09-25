# Upgrade — Beck Performance, configurador assistido (setembro de 2026)

Especificação aplicada: *Prompt Upgrades Beck Performance* (14 seções).
Fluxo registrado nos projetos e eventos como `assistido-4m-v1`.

## 1. Implementado e validado

**Mensagem e marca**
- Hero com o título, a descrição, os dois CTAs e os apoios pedidos; preço
  “a partir de R$ 500” lido de `pricing.ts`. Benefícios concretos, sem
  promessa de vendas, Google, retorno ou tempo de configuração.
- Símbolo oficial extraído do arquivo da marca (`public/brand/`), aplicado com
  o nome “Beck Performance” no cabeçalho, rodapé, termos, privacidade,
  favicon, ícone Apple, imagem de compartilhamento e PDF. O monograma provisório
  (`BrandMark`) foi removido.

**Página**
- Ordem: apresentação → exemplos demonstrativos → processo em cinco etapas →
  configurador → opções de contratação → quem atende → perguntas → chamada
  final e rodapé completo.
- Exemplos para cinco segmentos + “Outro segmento”; cada um amplia em diálogo
  acessível (miniatura e botão) e pode virar ponto de partida. O que foi
  digitado é mantido; só há confirmação quando o exemplo substituiria escolhas
  do visitante.
- Sem carrossel automático, contador, pop-up ou número fictício. Movimento
  reduzido respeitado. Barra de ação no celular só aparece com o
  configurador na tela e some enquanto um campo está em edição.

**Configurador em quatro momentos**
1. Negócio e objetivo (segmento, serviço, objetivo ou “preciso de
   orientação”, nome opcional, necessidades que exigem diagnóstico).
2. Recomendação por regra (“Recomendado para este objetivo”), com motivo,
   estrutura, estimativa e prazo; dá para escolher outro caminho ou pular.
3. Ajustes opcionais: identidade, cores, seções, formulário (WhatsApp ou
   e-mail com aviso de plataforma), recursos, categoria avançada e
   limite de orçamento com explicação da faixa e sugestão de remoção
   confirmada.
4. Resumo com edição por item, composição da estimativa, investimento
   separado de custos externos e mensalidades, link das opções, PDF e
   próximo passo.
- Preço e prévia aparecem antes de qualquer dado pessoal; campos opcionais
  nunca bloqueiam. Progresso navegável, foco no título a cada momento,
  grupos de opções com setas do teclado, ajuda pelo WhatsApp em qualquer
  momento, “Começar novamente” com confirmação.

**Dados e cálculo**
- Modelo v3 validado a cada leitura; migração automática da v1 e da v2
  (dados antigos preservados até o visitante reiniciar); links v2 e v3.
- Composição única (`breakdown`) usada por página, PDF, mensagem e receptor.
- Orçamento agora faz parte do projeto: sobrevive a recarregar e vai para o
  resumo, PDF, mensagem e pedido; “não informado”, zero e inválido são
  tratados de forma diferente.
- Link público só com opções — sem nome, contato, textos, orçamento ou id.

**Pedidos, medição e conteúdo**
- Modo WhatsApp (atual): “Preparar conversa no WhatsApp”, sem simular
  recebimento e sem `generate_lead`.
- Modo receptor pronto: contrato versionado, validação no navegador e no
  servidor, idempotência, trava de clique duplo, estados de erro com nova
  tentativa, receptor de referência que recalcula, salva antes de confirmar e
  reenfileira falhas do CRM; etapas do CRM com perda por motivo.
- Eventos centralizados, sem dado pessoal, sem duplicidade; UTMs
  normalizadas; `?segmento=` adapta a página; testes A/B preparados e inativos.
- Perguntas frequentes, privacidade e termos reescritos conforme o que a
  página faz; aceite de novidades separado do pedido.
- SEO: título e descrição sem promessas, dados estruturados sem endereço ou
  e-mail inventados, `noindex` fora de produção.

**Site da raiz** (`/Matheus-Performance/`, link “Gestão de tráfego pago”)
- Removidos: contadores (+120 empresas, R$ 12 mi, +380 mil leads, 7x ROI,
  +8 anos), cases e depoimentos de exemplo, logos “[LOGO]”, selos de
  certificação e palestra não comprovados, textos “[SUBSTITUA…]”, CNPJ,
  telefone, e-mail, redes e endereço de exemplo (também nos dados
  estruturados), “Mais escolhido” e mensagens de escassez.
- WhatsApp real; o formulário diz que prepara a conversa e deixa de disparar
  evento de lead; serviço de sites aponta para o configurador.

**Validação**
- `npm test`: 25 testes (preço e composição em 270 combinações, identidade no
  pacote, caminhos, diagnóstico, orçamento, migração v1/v2, links e
  privacidade, validação, idempotência, envio com falhas, clique duplo,
  receptor, CRM, eventos, origem, mensagem).
- `npm run typecheck` e build com o caminho do GitHub Pages.
- `tests/e2e.browser.mjs`: 14 cenários em navegador (fluxo completo,
  orçamento após recarregar, exemplos com e sem confirmação, diálogo e foco,
  caminhos, diagnóstico, migração v2, link compartilhado e inválido, copiar
  link com falha, PDF, reinício, teclado, campanha, celular, receptor com
  erro/repetição/confirmação única).
- Sem rolagem horizontal em 390 px e 1440 px; sem erros no console.

## 2. Depende de configuração externa

| Item | O que fazer |
|---|---|
| Receptor de pedidos e CRM | Hospedar `integrations/lead-receiver`, criar adaptadores e a variável `LEAD_ENDPOINT` — passo a passo em `OPERACAO.md` |
| Ferramenta de análise (GA4/Meta) | Instalar via gerenciador de tags e atualizar a privacidade antes |
| Métricas LCP/INP/CLS | Medir no PageSpeed/Search Console após publicar |
| Prazo de retorno ao visitante | Variável `RESPONSE_EXPECTATION`, só quando houver prazo real |

## 3. Depende de material ou decisão comercial

- **Logo em vetor ou PNG transparente.** O símbolo foi extraído do arquivo
  disponível; o letreiro “PERFORMANCE” não teve qualidade suficiente e foi
  substituído pelo nome em texto. Com o arquivo original, trocar
  `public/brand/simbolo*.png`.
- **Indexação no Google:** mantida fora por decisão anterior. Liberar =
  `indexarNoGoogle: true` em `contact.ts`.
- **Identidade visual no pacote:** `pricing.identity.mode` segue `'vigente'`.
- **E-mail e Instagram:** vazios em `contact.ts` até existirem endereços reais.
- **Provas sociais:** cases, depoimentos e logos só com autorização.
- **Site da raiz:** confirmar se os valores mensais dos pacotes, o
  “diagnóstico gratuito de 30 minutos” e o período inicial de 3 meses do
  contrato estão atuais; a raiz não tem política de privacidade própria.
- **Foto do responsável:** reaproveitada do site da raiz; troque em
  `public/brand/matheus-beck.webp` se preferir outra.
