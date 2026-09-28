# Upgrade — Beck Performance, configurador (setembro de 2026)

## Edição — o que faltava da especificação (segunda rodada)

- **Topo da apresentação com a prévia real:** a vitrine deixou de ser um
  desenho à parte ("Atelier Norte") e passou a mostrar o exemplo Estúdio
  Forma pelo mesmo componente das prévias (`SitePreview`), no computador e
  no celular — só o que o configurador consegue montar.
- **Composições por segmento na prévia (§14):** consultoria mostra "Áreas
  de atuação"; imóveis, "Como posso ajudar" e, com a vitrine (Completo),
  "Imóveis em destaque" com imóveis demonstrativos, sem preço, endereço ou
  disponibilidade; alimentação com vitrine vira "Cardápio" por categorias,
  com pedido pelo WhatsApp e sem pagamento online; arquitetura/criativo e
  "Ver meus trabalhos" ganham galeria de portfólio (um projeto em destaque);
  com agendamento, cada serviço mostra "Pedir um horário".
- **Progresso clicável (§10):** fases concluídas no topo levam de volta
  (Seu negócio, Sua prévia); as seis escolhas da personalização aparecem
  numeradas e levam direto a cada uma. Nada é apagado ao voltar.
- **"Manter sugestão" (§10):** em estilo, cores e títulos, enquanto a
  pessoa não muda nada, o botão de avançar diz "Manter sugestão".
- **Gerar outra sugestão só para uma seção (§13):** em "Editar os textos
  das seções" (sobre, diferenciais, como funciona, perguntas), com a IA
  ligada. Usa a mesma descrição da aba e troca só aquele texto; as outras
  seções ficam, e "Desfazer" traz a versão anterior. Sem mudança no
  contrato com o Worker.
- **Desfazer também para textos (§11):** "Voltar ao texto sugerido" e
  "Usar as sugestões" podem ser desfeitos.
- **Filtro dos exemplos (§15):** "Todos" e um botão por segmento, com o
  filtro ativo marcado; "Exemplo 1 de N" segue o total filtrado.
- **Desempenho e SEO (§19):** miniaturas dos exemplos e dos estilos com
  imagem carregada sob demanda e desenho adiado fora da tela
  (`content-visibility`); descrição da página de criação atualizada. Medido
  localmente (Chromium, servidor local, sem limitação de rede, 3 execuções):
  apresentação com 15 requisições (antes 20), ~808 KB (antes ~811 KB), 885
  elementos (antes 808, pela prévia real no topo), LCP de 120–148 ms (antes
  168–232 ms). Esses números são do ambiente de teste, não do celular real.
- **Celular:** topo um pouco mais compacto; o aviso "Prévia atualizada" não
  aparece mais só porque o projeto ganhou identificador ao salvar.
- **Mantido de propósito:** a promessa "em até 5 minutos" já existia; a
  especificação pede para não criar promessas novas e preservar as atuais.
- Testes: 61 unitários e 44 cenários de navegador (3 novos). Publicação: só
  o site; o Worker não mudou nesta rodada.

## Edição — pacotes no início, pedido legível, exemplos fiéis e edição sem perder trabalho

**Causas encontradas**
- *Mensagem com `complex%22%3A…`, `identitySet`, `direction`, `palette`, `font`:*
  `projectMessage` terminava com a linha "Opções de layout", que é o
  `shareLink` — uma URL com `encodeURIComponent(JSON.stringify(estado))`.
  Essa URL ia no corpo e, codificada de novo pelo link do WhatsApp, aparecia
  como texto cru. Agora a mensagem não leva link nem JSON; o estado completo
  vai no arquivo "Baixar meu projeto". A codificação do link continua uma só
  (`whatsappLink`), e `10%`, `&`, `+`, emoji e URLs chegam intactos.
- *Exemplos:* cartão e janela já usavam a mesma configuração
  (`exampleProject`), mas "Usar este modelo" misturava o exemplo com textos
  e serviço do rascunho, então o site aberto na criação não era o do
  cartão. Agora o modelo entra inteiro (só o nome da empresa, observações e
  contato ficam), com confirmação e "Recuperar minha versão anterior". Não
  existe exemplo de pet shop no catálogo; o exemplo roxo é o Estúdio Forma
  (arquitetura/criativo) e foi usado para validar a regra.
- *Botões dos exemplos:* o cartão já abria o exemplo, mas a ação parecia só
  um link ("Ver exemplo"). Agora é o botão "Ver este exemplo", com brilho
  discreto; um gesto lateral no carrossel não abre o cartão.

**O que mudou**
- **Pacote no início da personalização:** "Escolha o pacote do seu site"
  (Escolha 1 de 6) com os três cartões (nome, preço, para quem é, até três
  benefícios derivados do catálogo, "Selecionado", "Escolher Profissional"),
  "Comparar pacotes" (tabela curta, alinhada por recurso, também na
  apresentação) e recomendação só quando as escolhas pedem, com o motivo
  ("O Profissional inclui a galeria de fotos que você escolheu"). A primeira
  prévia nunca espera essa escolha e diz em que pacote está.
- **Resumo compacto sempre à vista:** "Profissional · R$ 750 · Alterar pacote".
- **Troca de pacote sem perder trabalho:** para um pacote menor, a caixa
  mostra o novo preço e o que sai; o que sai fica guardado no rascunho
  (`parked`), fora da prévia, do resumo e do pedido, e volta com
  "Restaurar no Profissional". Com seções demais, a pessoa escolhe quais
  manter. "Desfazer" vale para a última troca de pacote, restauração ou
  nova geração. Decisão: guardar só os ids das seções, o formulário e o
  tamanho da galeria — os textos das seções já ficam no projeto, então não
  foi preciso duplicar o projeto a cada troca.
- **Seções como benefícios:** nome, uma frase de benefício, "Incluído no seu
  pacote" / "Disponível no Completo" (em texto) e "Ver pacote Completo".
  Limite atingido tem mensagem própria ("Você já selecionou 5 de 5 seções do
  Essencial.").
- **Pedido legível:** mensagem em blocos (MEU NEGÓCIO, PACOTE ESCOLHIDO,
  COMO IMAGINEI O SITE, TEXTOS…, OBSERVAÇÕES, SOBRE MIM), resumo do pedido
  antes da saída com "Editar" em cada linha, **Copiar resumo**, **Baixar meu
  projeto** (JSON versionado, sem contato) e **Abrir arquivo de projeto**.
  Acima de ~1.800 caracteres vai um resumo enxuto que aponta o arquivo.
- **Textos por seção:** "Editar os textos das seções" (sobre, detalhes dos
  serviços, diferenciais, como funciona, perguntas) sem gerar de novo; o que
  a pessoa edita fica marcado e uma nova geração mantém, com "Usar os textos
  novos" se ela quiser. "Voltar ao texto sugerido" por grupo.
- **"Deixar minha prévia mais específica":** quem atende, onde atende, o
  que destacar (no segmento de imóveis: tipos, região, compra/venda/locação).
  Entra no pedido, no bloco de atendimento da prévia e, se couber no
  limite, na descrição enviada à IA ao gerar de novo — sem mudar o contrato.
- **Prévia do visitante sem nome** mostra "Seu negócio"; nomes fictícios
  ficam só nos exemplos. Galeria e vitrine mostram espaços de foto marcados
  (não a mesma ilustração repetida como se fossem trabalhos diferentes); um
  aviso único de "textos sugeridos" substitui os selos repetidos por seção.
- **Botão flutuante** sai da frente enquanto as setas/bolinhas do carrossel
  ou o "Ver este exemplo" passam pela faixa de baixo da tela.
- Fluxo `guiado-v2`; projetos `guiado-v1` abrem na mesma escolha.
  Eventos novos: `summary_copy`, `project_export`, `project_import` (sem
  conteúdo). Nenhum preço, limite, segredo ou variável de produção mudou.

**Testes:** 61 unitários e 41 cenários de navegador (Chromium; 360, 390,
430, 768 e 1366 px; microfone simulado; WhatsApp interceptado, nada é
enviado). Não testado aqui: áudio real no Safari/iPhone, teclado virtual e
área segura em aparelho real.

**Publicação:** o site (merge na `main`) resolve tudo. O Worker **pode**
ser publicado de novo depois (opcional): as regras da IA ganharam duas
linhas (evitar clichês citados e usar "Quem atendo/Onde atendo/Quero
destacar"). O contrato não mudou, então qualquer ordem funciona e o site
nunca fica sem gerar prévias.

## Edição — criação guiada: gravar, gerar, ver e personalizar

- **Botão flutuante de volta na apresentação.** Tinha saído de propósito na
  reformulação do PR #16 (commit `89cf4c9`, “sem cartão flutuante”), e o
  teste passou a exigir que ele não existisse. Agora: “Criar minha prévia”
  (ou “Continuar minha prévia”, com projeto salvo), barra larga no celular
  com a área segura do iPhone e pílula no computador. Some enquanto um botão
  principal (topo, pacotes, final) está visível — nunca os dois ao mesmo
  tempo — e o rodapé ganha espaço para ele não cobrir nada. Evento
  `start_click` com `context: flutuante`.
- **Gravação com estados claros:** “Gravar minha ideia” / “Prefiro digitar”
  → “Gravando sua ideia…” com tempo, botão vermelho **Encerrar gravação** e
  “Cancelar gravação” → “Transcrevendo seu áudio…” → texto editável com
  “Confira o texto antes de gerar”. “Gerar” não aparece enquanto grava ou
  transcreve; “Gravar novamente” soma ao texto, não apaga. Microfone
  bloqueado, navegador sem gravação, áudio vazio e falha da transcrição
  voltam para o texto com a mensagem certa — nunca fica preso em
  “Gravando”. Sair da página cancela a gravação e libera o microfone.
- **Depois de gerar:** “Montando sua prévia…” (sem clique duplo) e a tela
  **Sua prévia está pronta** — no celular já abre no site, com
  “Personalizar meu site” e “Editar minha descrição”. Se a pessoa saiu da
  etapa enquanto gerava, nada muda sozinho: aparece o aviso com “Ver minha
  prévia”.
- **Uma escolha por tela:** Estilo → Cores → Títulos (fonte) → Conteúdo →
  Seções → Revisão, cada uma com pergunta, opções visuais, escolha atual
  marcada, Voltar/Continuar e “Escolha N de 5”. Nada avança sozinho. No
  computador, opções à esquerda e prévia ao vivo à direita; no celular,
  “Ver meu site” / “Voltar para “X”” volta na mesma escolha e na mesma
  rolagem, com o aviso “Prévia atualizada” quando algo muda.
- **Novo campo `font`** (`auto`, `serif`, `sans`, `forte`) — só visual, não
  muda preço. Fluxo `guiado-v1`: projetos salvos no fluxo anterior de 4
  etapas abrem na etapa equivalente; nenhum pacote ou preço muda sozinho.
- Visual azul e branco, transições de 180–300 ms, respeita “reduzir
  movimento”; alvos de toque com 44 px; campos com 16 px (sem zoom).
- Testes: 52 unitários e 39 cenários de navegador (360, 390, 430, 768 e
  1366 px; microfone simulado do Chromium). Áudio real no Safari/iPhone não
  pôde ser testado aqui.
- **Publicação:** só o site (merge na `main`). O Worker não mudou — não
  precisa publicar de novo.

## Edição — descrição por áudio (etapa 2)

- No card “Descreva o site que você quer” há o botão **Gravar áudio**
  (quando o navegador permite gravar). A pessoa fala por até 90 segundos, o
  áudio vira texto no próprio campo — somado ao que já estava escrito — e
  ela confere e ajusta antes de “Gerar minha prévia”. O resto do fluxo é o
  mesmo da descrição por texto.
- Como funciona: o navegador grava no formato que souber e converte para
  WAV mono de 16 kHz (`src/lib/aiAudio.ts`); o mesmo Worker recebe em
  `/transcricao`, pede só a transcrição ao Gemini e devolve o texto sem
  e-mails e telefones. Mesmas proteções (origem, tamanho, limite por IP à
  parte, nova tentativa em falha passageira, log só com status).
- Privacidade: o áudio não é guardado; o microfone é liberado ao parar. A
  política de privacidade e o aviso do card citam o áudio.
- Mensagens claras para microfone bloqueado, gravação curta, fala não
  entendida, limite e cota. Evento `ai_audio` (sem conteúdo).
- Testes: 50 unitários (3 novos: WAV/base64, rota de transcrição do Worker,
  cliente) e 28 cenários de navegador (1 novo, com microfone simulado do
  Chromium e transcrição simulada).
- Ativação: publicar o Worker de novo (`npx wrangler deploy`). Nada muda na
  chave nem na variável `AI_ENDPOINT`.

## Edição — prévia por descrição com o Gemini (etapa 1: texto)

- Na página de criação, quando o servidor da IA estiver configurado, aparece
  “Descreva o site que você quer”: a pessoa escreve em poucas frases o que a
  empresa faz e o que o site deve mostrar, e a prévia é montada **nos
  layouts existentes** — a IA escolhe segmento, objetivo, estilo, cores e
  ordem das seções e sugere título, frase e serviços. Logo abaixo continua o
  passo a passo.
- Segurança: a chave do Gemini fica só num Cloudflare Worker
  (`integrations/ai-preview/`), nunca na página nem no repositório. O Worker
  aceita só o site permitido, limita 5 gerações/minuto por visitante,
  remove e-mails e telefones do texto e não guarda nem registra a descrição.
- Validação: a resposta da IA passa por `sanitizeSuggestion` — ids fora da
  lista caem, textos são cortados e frases com fatos não informados (anos
  de mercado, número de clientes, prêmios, garantias, preços) são
  descartadas. O pacote nunca muda: seções de outro pacote e itens fora dos
  pacotes aparecem só como aviso.
- **Desligado por padrão:** sem a variável `AI_ENDPOINT`, o build é igual ao
  publicado (há teste para isso).
- Testes: 40 unitários (6 novos: pedido ao Gemini, validação, aplicação sem
  mudar pacote, respostas bloqueadas/inválidas, Worker com origem, tamanho,
  limite, cota e log sem texto, cliente) e 26 cenários de navegador (2 novos,
  com a IA simulada — nenhuma chamada real ao Gemini foi feita).
- Pendências: criar a chave e o Worker (passo a passo no README da pasta),
  confirmar o nome do modelo no AI Studio e testar com descrições reais.
  Próximas etapas: áudio, salvamento dos projetos e acesso por código.


## Edição — reformulação: prévia em 5 minutos e pacotes de R$ 500 a R$ 1.000

### O que mudou

- **Oferta em pacotes de valor fixo**, configurados num único arquivo
  (`src/config/packages.ts`): Essencial R$ 500 (até 5 seções), Profissional
  R$ 750 (até 7 seções, galeria de 8 imagens, formulário que encaminha ao
  WhatsApp, perguntas frequentes e depoimentos reais) e Completo R$ 1.000
  (até 8 seções, galeria de 15 imagens, vitrine de 10 itens). Estilos, cores
  da marca e logo **não têm mais cobrança avulsa**. O cálculo por itens
  (faixa ±10%, acréscimos por estilo, categoria e recurso) e a ferramenta
  “Comparar com meu orçamento” saíram.
- **Teto por escopo, não por corte:** cada seção e recurso diz qual pacote
  exige. A 9ª seção, loja com pagamento, estoque, sistemas, login,
  integrações, agenda em tempo real, mais de uma página, várias unidades,
  outros idiomas ou produção de conteúdo levam a “Preciso de um projeto
  personalizado”, com orçamento separado — a prévia continua salva.
- **Nenhuma troca de pacote sem escolha:** antes de aplicar uma opção de
  outro pacote aparece “Disponível no Profissional — R$ 750 no total.”, com
  “Mudar para o Profissional” e “Continuar no Essencial”. Para um pacote
  menor, a janela “Ver o que está incluído” lista o que sai antes de trocar.
  Nunca aparece “+ R$ …”.
- **Preço sempre à vista** no configurador (“Desenvolvimento: R$ 750” +
  “Ver o que está incluído”), igual na etapa final, no PDF, na mensagem do
  WhatsApp e no receptor de pedidos, sempre com “Pagamento único pelo
  desenvolvimento. Domínio e hospedagem à parte.”
- **Apresentação:** título “Veja como o site da sua empresa pode ficar em até
  5 minutos.”, “Crie sua prévia gratuitamente. Desenvolvimento profissional
  de R$ 500 a R$ 1.000.”, nota “Valor do desenvolvimento. Domínio e
  hospedagem à parte.”, botão “Criar minha prévia grátis” que **abre direto
  a criação** (o cartão flutuante saiu), “Ver exemplos de sites” e “Sem
  cadastro. Sem compromisso.”. Quem tem prévia salva vê “Continuar minha
  prévia” e “Começar uma nova prévia” (com confirmação antes de apagar).
  Ordem: exemplos → como funciona (3 passos + o que o cliente envia) → o que
  está incluído (pacotes) → projetos reais (oculto sem material) → quem
  cuida → perguntas (14) → chamada final. A lista de benefícios repetida
  saiu, e os brilhos permanentes (selo “Clique aqui”, cartão pulsante)
  também; só o botão principal mantém a passagem de luz discreta.
- **Exemplos:** cinco segmentos com composições diferentes (topo dividido,
  centralizado com foto em arco, faixa de imagem, foto de fundo e tema
  escuro), seções diferentes e o pacote de cada um. “Usar este modelo” leva
  estilo e segmento e preserva o que já foi digitado (com confirmação quando
  substitui escolhas).
- **Configurador em 4 etapas:** Seu negócio (nome e segmento obrigatórios;
  “Outro” com campo livre; serviço principal com respostas rápidas ou
  “Definir depois”) → Seu objetivo (“O que você quer que as pessoas façam no
  seu site?”, seis opções, com as comuns do segmento marcadas; define botão,
  contato e seções; agendamento deixa claro que não é agenda em tempo real)
  → Sua identidade (três estilos sugeridos para o segmento, “Ver outros
  estilos”, “Escolher por mim”, cores sugeridas ou da marca, logo opcional)
  → Seu site (prévia primeiro, nome do projeto, investimento, o que está
  incluído, observações e “Solicitar desenvolvimento”; “Personalizar meu
  site” com título, frase, serviços, seções, ordem com Subir/Descer,
  formulário, galeria e necessidades fora dos pacotes; tela cheia).
- **Prévia personalizada:** o título usa o serviço (“Instalação de
  ar-condicionado com orçamento pelo WhatsApp.”), a imagem acompanha o
  segmento ou a palavra-chave (ilustrações próprias em `public/demo/`, sem
  links externos) e os serviços sugeridos aparecem marcados como sugestão.
  Sem depoimentos, notas, selos, números ou endereços inventados; botões da
  prévia não abrem nada (“Prévia demonstrativa · botões sem ação”). No
  celular a prévia aparece em largura real, com rolagem própria.
- **Salvamento:** “Salvo neste dispositivo” só aparece depois que o navegador
  confirmou a gravação; se falhar, aparece um aviso e o fluxo continua.
  Projetos v1, v2 e v3 são convertidos (com aviso) sem apagar o original.
- **Compartilhamento honesto:** “Compartilhar opções de layout” — o link leva
  estilo, cores, objetivo, seções e pacote, não nome, textos, logo ou
  imagens (dito na tela).
- **Mensagem do WhatsApp** com empresa, segmento, objetivo, serviço, estilo e
  cores, logo, pacote, valor, seções, recursos, prazo, ajustes, observações e
  o link de opções de layout. Nenhum telefone é pedido para abrir o WhatsApp;
  contato só é pedido no formulário direto (modo receptor), quando a pessoa
  decide avançar.
- **Medição revisada:** novos `start_click`, `package_selected`,
  `package_changed` e `request_click`; saíram `quote_request`,
  `plan_selected`, `recommendation_applied` e `summary_view` (duplicava
  `preview_view`). Ver `OPERACAO.md`. Nenhuma ferramenta de análise está
  instalada: os eventos saem para `dataLayer` só se houver um gerenciador de
  tags.
- **Metadados:** descrição e imagem de compartilhamento com a nova mensagem;
  a página de criação ganhou `noindex` próprio e saiu do sitemap. A
  apresentação continua fora do Google (`indexarNoGoogle: false`, decisão
  mantida).
- A landing de gestão de tráfego (raiz do repositório) não foi alterada.

### Verificação

- `npm test`: 34 testes (pacotes e limites, todas as combinações de seções
  sem passar de R$ 1.000, troca de pacote, projeto personalizado, objetivos,
  conteúdo sugerido sem fatos inventados, estilo que não apaga conteúdo,
  ordem das seções, mensagem, mesmo valor em mensagem/pedido/receptor,
  perguntas, migração v1/v2/v3, link sem dados pessoais, pedidos, receptor e
  eventos).
- Navegador (`tests/e2e.browser.mjs`): 24 cenários — serviços locais,
  beleza, produtos, “Outro” sem logo nem textos, troca de estilo/objetivo/
  pacote, recarregar e continuar, projeto personalizado, teto de 8 seções,
  falha ao salvar, falha ao copiar, envio que falha e nova tentativa (modo
  receptor), teclado, computador e celular em 360, 390 e 430px (sem rolagem
  lateral, alvos de 44px, barra fixa sem cobrir conteúdo).
- **Cronometragem interna, não validada com usuários:** o percurso básico
  (nome de 22 caracteres, segmento, serviço com um toque, objetivo, cor e
  pedido) levou **36 s** num roteiro automatizado com ritmo humano simulado
  (digitação ~6 caracteres/s, 3 s de leitura por tela e 1,5 s por decisão),
  com 10 toques. Isso indica que o fluxo cabe folgado em 5 minutos, mas não
  substitui medir o tempo real de visitantes.

### Inconsistências e condições preservadas

- **Prazos por pacote:** não havia prazo por pacote. Os prazos existentes por
  complexidade (3–5, 5–8 e 7–12 dias úteis, contados após o recebimento dos
  materiais) foram associados a Essencial, Profissional e Completo. Confirme.
- **Nome do estilo “Essencial”:** para não confundir com o pacote Essencial,
  o estilo continua se chamando “Minimalista” (as sugestões são Moderno,
  Elegante e Minimalista, variando por segmento).
- **Formulário por e-mail** (plataforma externa) deixou de ser opção: o
  escopo novo prevê formulário que encaminha ao WhatsApp. Projetos antigos
  com e-mail foram convertidos para o formulário do WhatsApp.
- Mantidos sem mudança: 2 rodadas de ajustes, custos externos à parte, site
  do cliente após a quitação, sem mensalidade de desenvolvimento, alterações
  depois da entrega orçadas à parte, nenhuma garantia de resultado, nenhuma
  forma de pagamento anunciada (não havia).

### Limitações e dependências

- Compartilhar a prévia completa com um sócio (nome, textos, imagens) exige
  armazenamento em servidor, que não existe no GitHub Pages. Não foi criado
  nenhum serviço pago; a função ficou limitada e com o rótulo honesto.
- O formulário direto só funciona com um receptor publicado
  (`NEXT_PUBLIC_LEAD_ENDPOINT`); sem ele, o pedido segue pelo WhatsApp e
  nada é dado como recebido.
- As imagens da prévia são ilustrações de exemplo por segmento; as fotos
  reais entram no site final.

### Materiais reais ainda necessários

- Projetos entregues com autorização por escrito (print do site, prévia
  escolhida para comparar, link, segmento) → `src/config/proof.ts`.
- Depoimentos reais autorizados (texto, nome e empresa).
- Confirmação dos prazos por pacote e, se houver, das formas de pagamento.
- E-mail e Instagram profissionais, se quiser que apareçam (`contact.ts`).
- Prazo de retorno do atendimento, se quiser anunciá-lo
  (`NEXT_PUBLIC_RESPONSE_EXPECTATION`).


## Edição — vitrine do serviço no topo

- O quadrado com a frase grande virou uma vitrine: janela de navegador em
  perspectiva com um site demonstrativo (Atelier Norte, arquitetura e
  interiores: cabeçalho, título, imagem, botão e três cartões), o mesmo site
  num celular sobreposto e o selo “Sua prévia em até 5 minutos”, sobre a base
  azul. Marcada como “Exemplo ilustrativo”; nada nela é clicável. A imagem é
  uma ilustração SVG leve (`public/demo/interiores.svg`, 3,5 KB) com
  dimensões reservadas.
- Montagem em ~1,8 s quando a vitrine entra na tela (base, janela, cabeçalho,
  imagem, cartões, celular e selo), uma única vez; depois só uma flutuação de
  5px a cada 8 s. Com “reduzir movimento” ou sem JavaScript, aparece pronta e
  parada. No celular fica abaixo do texto, com menos perspectiva e altura
  proporcional (sem rolagem lateral de 320 a 430px).
- O cartão “Estruturar meu site profissional” só aparece quando o botão
  principal do topo sai da tela (IntersectionObserver) e some, com transição,
  quando ele volta. Os botões principais continuam levando até o cartão. No
  celular virou uma pílula compacta, acima da área segura.
- Ajuste: em 320px, a marca e o botão “Menu” do cabeçalho passavam da tela.

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
