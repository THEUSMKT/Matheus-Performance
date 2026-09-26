# Upgrade — Beck Performance, configurador (setembro de 2026)

## Edição — quadrado 3D no topo

- O mockup de computador + celular do topo (site de exemplo “Ateliê Aurora”)
  saiu. No lugar, um quadrado 3D com a frase “Estruture seu site profissional
  em até 5 minutos”: gradiente azul-marinho → azul, reflexo discreto no alto,
  borda clara fina, sombras em camadas e leve perspectiva.
- Flutua devagar (sobe e desce com leve rotação, ciclo de 5 s) e tem um
  brilho azul que pulsa a cada 3,6 s; no mouse, cresce 3% e o brilho aumenta.
  Só `transform` e `opacity` são animados. Com “reduzir movimento”, fica parado.
- No celular fica à esquerda, fora da faixa do cartão “Estruturar meu site
  profissional”, e se movimenta menos; no computador fica na coluna direita.
- **Atenção:** o tempo de 5 minutos foi pedido; ainda não foi medido com
  visitantes. Vale acompanhar o tempo real até “Sua prévia” antes de usar a
  frase em anúncios.

## Edição — cartão flutuante e mais estilos

- “Criar minha prévia” / “Continuar minha prévia” (topo, menu e chamada
  final) não abrem mais a criação direto: rolam suavemente até os exemplos e
  destacam o cartão flutuante **“Estruturar meu site profissional”**, fixo no
  canto inferior direito (quadrado, com brilho pulsante suave e aumento ao
  passar o mouse). É esse cartão que abre `/criar/`. Com “reduzir movimento”,
  a rolagem é imediata e o cartão fica parado. A barra fixa do celular saiu
  (o cartão ocupa o lugar dela); o WhatsApp continua no topo, na chamada final
  e no rodapé.
- Aparência com seis estilos: Moderno, Elegante, Minimalista e os novos
  **Tecnológico** (+ R$ 60), **Sofisticado** (+ R$ 110) e **Escuro**
  (+ R$ 70). Os valores saem da tabela que já existia em `pricing.ts`
  (modelo + estilo), sem preço novo. A prévia mostra cada um na hora.
- Abaixo dos estilos, “Escolher um estilo diferente (entrar em contato no
  WhatsApp)” abre a conversa com a mensagem pronta; não muda o estilo
  escolhido. Evento: `whatsapp_open` com `context: estilo_diferente`.

## Edição — página de criação dedicada e primeira dobra curta

**Apresentação (`/`)**
- Primeira dobra só com “Sites para empresas de todos os portes”, “Seu próximo
  site começa aqui.”, “Monte uma prévia personalizada em poucos passos.”, o
  botão principal e “Sem cadastro.”. O botão diz “Continuar minha prévia” só
  quando há uma prévia salva que vale retomar. Cabeçalho de 56px; no celular
  o título ocupa duas linhas e o botão fica a cerca de 290px do topo.
- Botão com brilho: faixa de luz diagonal atrás do texto, uma passagem de
  cerca de 2 s a cada 7 s. Não muda o tamanho do botão, não recebe cliques,
  tem foco visível e desliga com “reduzir movimento”.
- Ilustração do produto (prévia no computador e no celular) no lugar do
  quadrado flutuante. O texto “em até 3 minutos” saiu: o tempo nunca foi
  medido com visitantes.
- WhatsApp vira link discreto. Custos e escopo saíram do topo: “Investimento”
  compacto (a partir de R$ 500 e os três caminhos, com valores de
  `pricing.ts`), domínio e hospedagem nas perguntas, estimativa completa no fim
  da criação.
- Saíram as frases que limitavam o atendimento a pequenas e médias empresas.

**Página de criação (`/criar/`)**
- Cabeçalho compacto com a marca e “Voltar” (nada se perde), “Crie a prévia
  do seu site” e “Etapa N de 4”; as opções começam logo abaixo.
- Etapa 1, Seu negócio: nome (único campo obrigatório, com erro no próprio
  campo), segmento com “Outro” + texto simples e objetivo com ícones —
  Receber contatos, Apresentar a empresa, Mostrar serviços, Exibir produtos.
- Etapa 2, Aparência: Moderno, Elegante e Minimalista em miniaturas reais,
  cores com o acréscimo ao lado e logo opcional (sem logo, vale o nome).
- Etapa 3, Conteúdo: estrutura com o selo “Sugerido para seu objetivo” (no
  lugar da etapa de recomendação), seções com preço ao lado, frases sugeridas
  e editáveis; recursos extras e necessidades complexas recolhidos.
- Etapa 4, Sua prévia: estimativa em destaque, resumo com “Editar” por item,
  “Editar prévia” e “Solicitar orçamento” (o pedido só depois de ver a prévia).
- A prévia segue as escolhas (nome ou logo, estilo, cores, seções, textos do
  segmento e o botão conforme o objetivo), é marcada “Prévia · não publicada”
  e os botões dela não enviam nada. No computador fica ao lado das opções, com
  rolagem própria e “Continuar” sempre à vista; no celular, “Editar” / “Ver
  prévia” na mesma etapa.
- Barra do celular só com “Voltar” + “Continuar” (“Ver minha prévia” na
  etapa 3) e, no fim, “Editar prévia” + “Solicitar orçamento”. Respeita a área
  segura do iPhone, some enquanto um campo está em edição (voltando só depois
  do toque, para não roubar o clique) e não cobre o conteúdo. “Começar
  novamente” discreto e com confirmação.
- Links antigos (`#configurador`, `#projeto=`) levam à página de criação.

**Dados e medição**
- Fluxo `etapas-4-v2`; eventos novos `preview_view` e `quote_request`, sem
  nada do que foi digitado. Seções renomeadas para “Serviços ou produtos” e
  “Sobre a empresa”. Objetivos antigos continuam válidos em projetos salvos.
- Logo guardada só no navegador (`bp.logo.v1`), fora de links, mensagem e
  pedido.

**Validação:** `npm test` (30 testes) e `tests/e2e.browser.mjs` (22 cenários:
apresentação, brilho e movimento reduzido, as 4 etapas, prévia, salvamento,
links, PDF, recomeço, teclado, campanha, exemplos, investimento, celular em
360/390/430, computador em 1280 e modo receptor).

**Limitações:** os prints de referência citados no pedido não chegaram — a
revisão partiu de capturas da versão publicada. A prévia é ilustrativa: usa
textos de exemplo marcados como editáveis e não gera textos nem imagens.

## Edição — versão celular mais simples

- Exemplos em carrossel (toque, trackpad, teclado, bolinhas e setas no
  computador), com selo “Clique aqui”. O card inteiro abre a demonstração,
  que no celular ocupa a tela toda e mostra o site em moldura de
  **Computador** (desenhado em 1100px e reduzido) ou **Celular**, com
  anterior/próximo e “Usar este modelo como ponto de partida”.
- Topo sem prévia: no lugar, um quadrado flutuante que leva ao configurador.
  Campanhas com `?segmento=` agora começam o carrossel no exemplo do segmento.
- Benefícios com ícone, “Como funciona” em linha do tempo, opções em
  carrossel no celular (com “fica à parte” recolhido e início no caminho
  recomendado) e perguntas com as 5 primeiras + “Ver todas”.
- Barra fixa no celular depois que o botão do topo sai da tela, trocada
  pela barra do configurador quando ele aparece; momento 3 em sanfona.
- Evento novo: `example_view_mode`. Preços, cálculo e textos legais não mudaram.
- **Atenção:** o texto “Estruture seu próprio site em até 3 minutos” foi
  pedido na edição. O tempo ainda não foi medido com visitantes; vale
  confirmar com uso real antes de anunciar em campanhas.

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
