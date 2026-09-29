# Upgrade — Beck Performance, configurador (setembro de 2026)

## Edição — ajustes para o celular: primeira tela, carrossel, botão flutuante e "Começar novamente" (29/09)

Cerca de 90% das visitas vêm do celular; esta rodada mexe só em usabilidade — preços, limites e integrações da IA não mudaram, e a landing de gestão de tráfego (raiz do repositório) não foi tocada.

**Primeira tela** (`Landing.tsx` + `Home.module.css`): ordem pensada para o celular — título curto **"Um site à altura da sua empresa."** (`heroVariants.a` em `src/config/experiments.ts`), a linha de apoio "Veja uma prévia grátis e imagine seu negócio com uma presença profissional.", a **captura real da Schay Corretora** (moldura de navegador; o celular complementar só aparece a partir de 560 px), o botão principal **"Gerar minha prévia gratuita"** (`ctaVariants.a`, também no cabeçalho, no menu, no rodapé, em exemplos e em pacotes), "Sem cadastro. Sem compromisso." com **"Conversar sobre meu projeto"** como link com ícone (área de toque de 44 px) e o investimento em uma linha: "Sites de página única: R$ 500 a R$ 1.000. Pagamento único pelo desenvolvimento. Domínio e hospedagem à parte." + "Ver pacotes e condições" e "Outras necessidades: orçamento sob medida". A legenda "Projeto publicado · Schay Corretora" identifica o site como trabalho de cliente no ar, não como prévia do configurador. A imagem principal carrega com prioridade (`fetchpriority="high"`) e aparece de imediato: a entrada curta (halo e formas geométricas) só mexe na posição, nunca na opacidade, e some com "reduzir movimento". Em 390×700, 360×740, 390×844 e 430×932, título, imagem inteira e botão cabem sem rolar; no computador, texto à esquerda e captura à direita.

**Projetos reais em carrossel** (`RealProjects.tsx`, `.carousel` em `Landing.module.css`): no celular, rolagem horizontal nativa com `scroll-snap` (Schay primeiro, Matheus Beck depois), o próximo cartão aparecendo na borda, "Arraste para ver outro projeto", "1 de 2" e setas "Projeto anterior"/"Próximo projeto" (44 px, desativadas nas pontas, sem loop nem avanço automático). O indicador segue a rolagem real (dedo, trackpad, teclado ou setas). A partir de 760 px, os dois ficam lado a lado e os controles somem. Cartões enxutos: captura, selo, nome, segmento, o que foi desenvolvido e as ações; a necessidade atendida fica em "Ver detalhes" (`<details>`, texto inteiro). A página de exemplos continua com os cartões completos.

**Botão flutuante "Gerar minha prévia gratuita"** (`FloatingCta.tsx`): no início e em exemplos, aparece quando o botão principal do topo sai da tela e some quando a chamada final está visível — as duas áreas são marcadas com `data-cta-zone` e observadas com `IntersectionObserver` (sem contar pixels). Some com o menu aberto (`html[data-menu-open]`), respeita a área segura do iPhone, reserva espaço no fim da página para não cobrir o rodapé, tem um brilho curto ao entrar (sem pulsar) e não existe no configurador nem em pacotes (cada cartão já tem o seu botão). Escondido, fica fora da leitura e da ordem do teclado. Evento: `start_click` com `context: flutuante`.

**"Começar novamente"** (`ResetDialog.tsx` + `ResetDialog.module.css`, ligado em `Builder.tsx`): em vez da caixa no topo da página, um diálogo nativo (`showModal`) — painel na parte de baixo no celular, centralizado no computador — com "Começar uma nova prévia?", o que será apagado, **"Continuar editando"** e **"Apagar escolhas e recomeçar"**. Abrir não apaga nada; "Continuar editando", o X e o Esc devolvem a pessoa à mesma etapa, com os mesmos dados e a mesma rolagem, e o foco volta ao botão que abriu. O foco inicial fica no botão seguro, o fundo fica inerte e parado (sem pular), e um segundo toque em "Apagar" não repete a ação. Confirmar apaga só a prévia (projeto, cópia de segurança, logo e o rascunho da descrição desta aba) — nunca o resto do armazenamento —, volta à primeira etapa com o foco no título e mostra "Prévia apagada. Você já pode começar uma nova." Respostas da IA pedidas antes (geração ou nova sugestão de uma seção) chegam atrasadas e são descartadas, e a descrição é montada de novo (gravação ou transcrição em andamento é interrompida). "Começar uma nova prévia" na página inicial abre o mesmo diálogo.

## Edição — apresentação, dois caminhos de contratação e conversa direta (29/09, noite)

**Página inicial** (`src/components/landing/Landing.tsx` + `Home.module.css`): nova primeira seção ("Sua empresa bem apresentada. O próximo contato começa aqui."), com "Criar minha prévia grátis" (ou "Continuar minha prévia") e **"Conversar sobre meu projeto"** (WhatsApp direto, sem passar pelo configurador), o microtexto "Sem cadastro para criar a prévia. Sem compromisso." e a informação comercial junto da oferta: "Sites de página única de R$ 500 a R$ 1.000. Projetos com outras necessidades: orçamento sob medida." — com domínio e hospedagem à parte logo abaixo. O destaque visual é a captura real da Schay Corretora (computador e celular, selo "Projeto publicado", halo azul); a demonstração do configurador foi para "Como funciona", identificada como ilustrativa. Ordem: projetos reais → benefícios → como funciona → dois caminhos (pacotes e **"Seu projeto precisa ir além de uma página?"**) → Matheus Beck → dúvidas → chamada final.

**Projetos reais**: cada cartão mostra "Projeto publicado", segmento, nome, a necessidade atendida (`need` em `src/config/proof.ts`), o que foi desenvolvido, "Visitar site" e **"Conversar sobre um projeto assim"** (a mensagem já cita o projeto). Nenhum pacote, preço ou resultado associado.

**Paleta por função** (`--c-*` em `Landing.module.css`, aplicada com `.bright` no início, exemplos, pacotes e páginas legais): títulos `#2563EB`, destaque em títulos grandes `#3B82F6` (só ≥ 24 px, 3,2:1 ou mais), texto `#475569`, links `#1D4ED8`, botões `#2563EB` com texto branco, fundo `#F4F8FF`, superfícies `#EAF2FF` e `#F0EDFF`, brilhos `#38BDF8`/`#93C5FD`. O azul-marinho (`--navy`) não mudou: o configurador e as prévias continuam iguais. Duas famílias tipográficas (Plus Jakarta Sans nos títulos, fonte do sistema no texto).

**Pacotes** (`/pacotes/`): cartões enxutos — nome, valor, "Pagamento único · domínio e hospedagem à parte", "Indicado para" (benefício antes da quantidade: `purpose` e `packageKeyPoints` em `packages.ts`), 3 ou 4 diferenças, a diferença real de R$ 250 para o anterior, prazo, "Criar prévia com este pacote" e **"Conversar sobre este pacote"** (a mensagem leva nome e valor). "Ver tudo que está incluído" é um `<details>` nativo. A comparação completa começa recolhida no celular. Condições reescritas a partir das regras existentes (`serviceTerms`): textos da IA, produção de conteúdo, 2 rodadas, depois da entrega, domínio e hospedagem.

**Configurador**: o campo de descrição já abre pronto para digitar, com orientação curta e o exemplo "Tenho uma empresa de reformas…" (só orientação, nunca preenchido); "Gravar minha ideia" fica à vista como alternativa e a digitação não depende do microfone. Em "Sua prévia está pronta", **"Conversar sobre esta prévia"** vem primeiro (WhatsApp com o resumo do projeto, abertura de conversa) — personalizar continua disponível, sem ser obrigatório.

**Falha ao iniciar** (`src/components/AppFallback.tsx`): se o JavaScript não iniciar (erro, arquivo bloqueado, navegador fora do suporte), aparece um aviso no topo — no fluxo da página, nunca por cima de botões — com WhatsApp, pacotes e "Tentar de novo". A mensagem do WhatsApp leva a versão do iOS e o erro, para confirmar a causa do relato no iPhone 13 com iOS 16. Sem JavaScript, a página de criação mostra o mesmo contato (`<noscript>`).

**Medição**: `whatsapp_open` agora identifica a origem (`inicio`, `projeto_real` + `project`, `pacote` + `package`, `sob_medida`, `previa`, `sobre`, `final`…). Continua sendo clique — não é mensagem enviada nem pedido recebido. Início, sucesso e falha da geração (`ai_generate`) e escolha de pacote (`package_selected`) já existiam; nada foi duplicado.

**Pendências** (sem regra definida — nada foi prometido): limite da revisão dos textos da IA, o que conta como uma rodada de ajustes, prazo/valor de alterações depois da entrega e quais necessidades sob medida são oferecidas (ver OPERACAO.md, seção 7). A indexação continua desligada (`indexarNoGoogle: false`): início, exemplos e pacotes seguem com `noindex` e o `robots.txt` bloqueia tudo até a liberação.

## Edição — prévias por família visual, contrato 2 da IA e nome antes da prévia (29/09)

**Oito famílias visuais** (`src/config/families.ts`), cada uma com composição própria da primeira dobra, apresentação dos serviços, ritmo das seções e comportamento no celular — as diferenças são estruturais, não só de cor:

| Família | Topo (duas variantes) | Serviços |
|---|---|---|
| Serviços locais — clareza e ação | oferta com lista de serviços ao lado da imagem · faixa de imagem com cartão | lista comparável com ícones |
| Beleza — editorial e acolhedora | capa com o título sobre a imagem · retrato em arco | cardápio de cuidados (serifa, sem preços) |
| Consultoria — autoridade e clareza | declaração tipográfica com áreas numeradas · painel | colunas numeradas; no computador, título à esquerda |
| Alimentação — produto e desejo | mesa posta (faixa + cartão) · cardápio com prato redondo | produtos com imagem; buffet é serviço, não vitrine |
| Arquitetura e portfólio — visual e autoral | imagem de abertura · índice | índice com numeração e muito respiro |
| Imobiliário — apresentação e orientação | apresentação do profissional · orientação com etapas | cartões "como ajudo"; vitrine só no Completo |
| Veterinária e pet — acolhimento e precisão | acolhimento · cuidados em destaque | blocos com ícones |
| Institucional versátil | equilíbrio · monograma | cartões numerados |

Os seis estilos (Moderno, Elegante...) continuam e agora mudam só tons, formas e a fonte dos títulos, então qualquer estilo funciona em qualquer família. Na etapa **Estilo** há a escolha de **Composição**: as duas variantes da família, "Topo sem imagem" e a institucional. Paletas novas: Petróleo, Grafite e Vinho. Fonte nova: Geométrica (a Plus Jakarta Sans que o site já carrega).

**Tipos de negócio** (`src/config/subsegments.ts`): clínica veterinária, banho e tosa, pet shop, limpeza, ar-condicionado, elétrica, pintura, reformas, oficina, salão, barbearia, estética, unhas, contabilidade, advocacia, saúde, consultoria empresarial, confeitaria, buffet, marmitas, padaria, restaurante, arquitetura, interiores, fotografia, design, corretor, imobiliária, loja, treino e aulas. Cada um define família, imagens permitidas, nome provisório, botão e textos de exemplo, sem fatos inventados. O reconhecimento soma termos com peso e ignora trechos negados ("não temos atendimento veterinário"): clínica ≠ banho e tosa ≠ pet shop; confeitaria por encomenda ≠ restaurante com reserva; consultoria imobiliária de corretor ≠ vitrine de imóveis. Há um segmento novo, **Veterinária e cuidados pet**.

**Imagens** (`src/config/assets.ts`): catálogo com categoria, cortes, ponto focal, texto alternativo, origem e licença; 15 ilustrações novas em `public/demo/`. A prévia só usa imagem permitida para o tipo de negócio; sem imagem adequada (advocacia, saúde, aulas, serviço desconhecido), o topo é tipográfico. Galeria e vitrine não repetem imagens entre si, e a do topo só volta na galeria quando o tipo de negócio tem uma única outra imagem (para não deixar uma foto sozinha); nada de "Sua foto" ou "Item 1".

**Mesmo estado em toda parte** (`src/lib/plan.ts`): miniatura dos exemplos, exemplo aberto, prévia do celular e do computador, editor, resumo e WhatsApp usam o mesmo cálculo. A página de exemplos mostra oito modelos (um por família).

**Nome antes da prévia**: "Como se chama seu negócio?" (com "Esse nome aparece na prévia.") junto da ideia, por áudio ou texto, e no passo a passo. "Ainda não defini o nome." usa um nome provisório do tipo de negócio ("Sua clínica", "Seu estúdio", "Seu nome" para corretor), marcado como provisório na prévia, no resumo e no WhatsApp ("Empresa: nome ainda não definido"). Um nome escrito na descrição é sugerido no campo ("Encontramos “Clínica Vila Pet”… Usar este nome"); a IA não põe nome que não está escrito, nem troca um nome digitado ou confirmado. Ao terminar de editar o nome, ele é trocado também nos textos sugeridos pela IA (só o nome exato, só nos textos não editados). A barra do navegador da prévia diz "prévia ilustrativa · endereço definido na publicação" — nenhum domínio que pareça comprado.

**IA (contrato 2)**: a resposta traz tipo de negócio, família, variante, topo, fonte, categoria de imagem, origem do nome e no máximo uma pergunta. Tudo é validado de novo na página: ids fora do catálogo caem, títulos longos são cortados no fim de uma palavra, marcação e script são removidos, "24 horas", emergência e credenciais (CRECI, CRMV, OAB) saem, preço e pacote nunca mudam. Quando a descrição é ambígua no segmento pet, a tela pergunta "Você oferece consultas veterinárias, banho e tosa ou os dois?" e a resposta muda a prévia sem nova chamada à IA.

**O que depende de você — Worker**: para a IA preencher os campos novos, publique o Worker de novo (`npx wrangler deploy` em `integrations/ai-preview/`). Não há segredo, variável ou limite novo. Enquanto o Worker antigo estiver publicado, a página continua funcionando: ela repete o pedido no formato 1 e completa o tipo de negócio a partir da descrição. Detalhes na seção "Versões do contrato" do README do Worker.

**Celular**: depois de gerar, a prévia abre na largura útil inteira (sem moldura dentro da moldura), com "Sua prévia está pronta" logo acima e o pacote com o preço à vista.

**Projetos salvos**: continuam na v4 (revisão 2). Campos novos entram vazios (tudo automático) e o tipo de negócio sai do que já estava escrito — um projeto antigo "Outro · Clínica veterinária" abre na família pet com a imagem do consultório. Arquivos exportados e links de layout continuam compatíveis.

## Edição — página inicial objetiva, projetos reais, Exemplos e Pacotes

**Página inicial (`/`)**, na ordem:
1. Apresentação e benefício: "Criar minha prévia grátis", ou "Continuar minha prévia" quando há projeto salvo.
2. **Da ideia ao ar: conheça sites que criamos.** Dois projetos reais (Schay Corretora e Matheus Beck), cada um com:
   - captura estática, sem iframe;
   - categoria, nome e uma frase;
   - "Visitar site", que abre em nova aba e avisa isso para leitores de tela.
   O site Matheus Beck aparece como "Projeto da própria marca". Nenhum projeto tem pacote, preço, resultado ou depoimento associado.
3. Como funciona, em 3 passos.
4. Acessos às páginas internas: "Explorar exemplos de sites" e "Ver pacotes e valores".
5. Quem desenvolve.
6. Dúvidas essenciais (6) e chamada final.

Saíram da página inicial:
- a galeria de modelos;
- a comparação dos pacotes;
- a faixa de valor;
- o botão flutuante. Nada fica fixo sobre o conteúdo; o cabeçalho acompanha a rolagem e, no celular, o menu tem o botão de criar a prévia.

**Exemplos (`/exemplos/`)**: "Inspire-se no próximo site da sua empresa."
- **Projetos reais**: captura de computador e de celular, com "Visitar site".
- **Modelos para imaginar o seu**: os modelos demonstrativos, identificados como tal.
  - Filtros por segmento que quebram linha (sem rolagem lateral).
  - Grade de uma coluna no celular.
  - "Ver no computador e no celular" (mesma demonstração de antes).
  - "Criar minha prévia com este modelo" é link para `criar/?modelo=<segmento>`. A página de criação pergunta antes de substituir um rascunho e guarda a versão anterior.

**Pacotes (`/pacotes/`)**: "Escolha como sua empresa vai se apresentar ao mundo."
- Abertura do maior para o menor (Completo — R$ 1.000, Profissional — R$ 750, Essencial — R$ 500), uma frase por pacote.
- Cartões completos, sem "tudo do anterior":
  - preço em destaque e pagamento único;
  - para quem é;
  - limites de seções, fotos e itens;
  - recursos, com "+" no que o pacote acrescenta;
  - prazo e quando ele começa a contar;
  - "Criar prévia com este pacote" (`criar/?pacote=`).
- Profissional com o selo "Equilíbrio entre apresentação e recursos". Os R$ 250 de diferença (Essencial → Profissional → Completo) são explicados a partir dos limites de `packages.ts`.
- Ordem dos cartões: no computador, Essencial | Profissional | Completo; no celular, Profissional, Essencial, Completo (também a ordem para teclado e leitor de tela).
- Comparação completa, em tabela no computador e em blocos no celular.
- Condições: domínio e hospedagem, depois da entrega, o que não está incluído e projeto personalizado.
- Preços e regras não mudaram. Não há preço riscado, desconto, contador ou "mais vendido".

**Atalhos antigos**:
- `/#exemplos` leva a `/exemplos/` e `/#investimento` leva a `/pacotes/`.
- `?segmento=` faz os exemplos abrirem filtrados.
- Sem JavaScript, as âncoras caem nos acessos da página inicial.
- Menu e rodapé apontam para as páginas novas em todas as páginas.

**Visual**:
- Fundos azulados claros, superfícies lavanda e um tom quente suave usados com moderação, azul vivo nos botões e azul-marinho nos textos.
- Cartões de pacote diferenciados por fundo e cor de destaque.
- Títulos em **Plus Jakarta Sans**: arquivo local, variável, 27 KB, licença OFL em `src/app/fonts/`.
- Textos na fonte do sistema: nada a baixar para ler.
- Texto principal com 16 px; comparação com 15 px ou mais.

**Compatibilidade (relato de botões sem resposta no iPhone 13 com iOS 16)**:
- O Next.js 16 declara suporte a partir do Safari 16.4.
- O JavaScript do framework carregado em todas as páginas tinha um bloco estático de classe (`static { … }`). O Safari anterior à 16.4 não entende essa sintaxe, e aí o arquivo inteiro deixa de ser lido: a página aparece, mas nada que depende de script responde. **Isso é compatível com o relato, mas a causa não está confirmada**: a versão exata do iOS 16 no aparelho não foi informada, e não houve teste em iPhone.
- O que mudou:
  - `browserslist` no `package.json` (Safari/iOS 15.4 ou mais). O build agora converte essa sintaxe; o JavaScript cresceu cerca de 0,8 KB com gzip.
  - `npm run check:compat` lê os arquivos exportados e falha se aparecer sintaxe que o Safari anterior à 16.4 não lê: bloco estático, lookbehind em expressão regular ou flag `v`.
  - O uso de `URLSearchParams.size` (Safari 17+) foi trocado.
  - Links comuns e o menu em `<details>` mantêm a navegação sem script.
  - `color-mix()` continua só em tons decorativos das prévias. No iOS 16.0 e 16.1 esses tons são ignorados sem quebrar nada.

**Medição de laboratório (não é dado de celular real):**
- Condições: Chromium local com servidor gzip (como o GitHub Pages), sem cache, mediana de 5 execuções.
- Celular: 390×844 com rede "Slow 4G" (RTT 150 ms, 1,6 Mbps) e CPU 4× mais lenta.
- Computador: 1440×900 sem limitação.
- Formato: `main` (9bf2300) → esta branch.

| Página | 1ª pintura | LCP | Bloqueio (TBT) | CLS | Transferido | Requisições | Elementos |
|---|---|---|---|---|---|---|---|
| Início, celular | 916 → 1120 ms | 916 → 1120 ms | 553 → 467 ms | 0 → 0 | 241 → 335 KB | 20 → 22 | 760 → 363 |
| Criação, celular | 760 → 900 ms | 760 → 900 ms | 208 → 298 ms | 0 → 0 | 259 → 284 KB | 17 → 17 | 338 → 339 |
| Início, computador | 172 → 168 ms | 172 → 168 ms | 41 → 43 ms | 0 → 0 | 248 → 295 KB | 30 → 22 | 760 → 363 |
| Exemplos, celular (nova) | 1008 ms | 1616 ms | 428 ms | 0 | 408 KB | 17 | 560 |
| Pacotes, celular (nova) | 1112 ms | 1112 ms | 432 ms | 0 | 244 KB | 13 | 598 |

- **Melhorou na página inicial:** menos da metade dos elementos (760 → 363) e menos bloqueio (553 → 467 ms). A galeria e a comparação saíram dela.
- **Transferido a mais:** as duas capturas reais (cerca de 80 KB em telas 3×, com variante de 1080 px) e a fonte dos títulos (27 KB). A fonte não é pré-carregada e usa `swap`, então os títulos aparecem primeiro na fonte do sistema.
- **Primeira pintura +140 a 200 ms no 4G lento emulado:** a causa não foi isolada. Não é a fonte (medido com ela bloqueada), nem o tamanho do CSS ou do HTML (iguais), nem o alvo de compatibilidade (medido sem ele). Parece vir da ordem de chegada dos arquivos em rede lenta.
- Não há ganho de velocidade a declarar. LCP, INP e CLS reais só podem ser medidos depois da publicação (PageSpeed Insights / Search Console).

**Verificação:**
- 68 testes unitários, com 3 novos:
  - listas completas e diferenças dos pacotes;
  - dados e capturas dos projetos reais;
  - rotas, links sem script e alvo de compatibilidade.
- 70 cenários de navegador. Os da página inicial foram reescritos, e os novos cobrem:
  - projetos reais;
  - atalhos antigos e campanha por segmento;
  - menu e rodapé em todas as páginas;
  - menu do celular;
  - navegação **sem JavaScript**;
  - prévia salva preservada;
  - teclado e foco visível;
  - modelo com e sem rascunho;
  - pacotes no computador e no celular;
  - toque e leitura em 320, 360, 390 e 430 px.
- Os fluxos de texto, áudio, IA, receptor e configurador seguem passando.
- axe-core (WCAG 2.1 A/AA, contraste incluído) nas três páginas, a 390 e a 1440 px: nenhuma violação. As prévias demonstrativas ficaram fora da checagem porque representam sites fictícios.
- Tudo em Chromium. **Não houve teste em iPhone/Safari real nem em iOS 16.**
- Capturas (celular primeiro; antes × depois na página inicial) em `docs/capturas/2026-09-28-paginas/`. Essa pasta não vai para o site.

**Pendências:**
- **Capturas dos projetos**: geradas do código atual de cada repositório (Schay: `THEUSMKT/schay-landing-page`, commit `65f883c`), porque este ambiente não acessa os domínios publicados. Confira se correspondem ao que está no ar (`public/projetos/README.md`).
- **Autorização da Schay Corretora**: guarde a autorização por escrito do cliente para exibir o site.
- **Validação no iPhone 13**: confirmar a versão do iOS (Ajustes → Geral → Sobre) e testar depois da publicação. O roteiro está no PR.

## Edição — evolução comercial da landing e do configurador (celular primeiro, 28/09)

Premissa de planejamento (não medida): a maior parte do tráfego pago chega
pelo celular. Tudo foi desenhado e revisado primeiro em 390 px, depois em 360
e 430 px, e só então adaptado para tablet e computador.

**Correções (reproduzidas antes de corrigir):**
- **Casa Oliva (Completo) mostrava "até 8 imagens":** os exemplos agora
  usam o limite de galeria do próprio pacote (Completo: até 15 fotos).
- **Modelo de estética + descrição de imobiliária mantinha "Beleza e
  estética":** o segmento que veio de um modelo passa a ser tratado como
  sugestão e acompanha a descrição. Quando o segmento foi escolhido à mão e
  a descrição parece de outro setor, a tela pergunta ("Usar …" / "Manter …")
  em vez de trocar sozinha.
- **Reduzir e restaurar o pacote mudava a ordem das seções:** a ordem
  anterior fica guardada junto com o que saiu (`parked.order`) e volta
  igual.
- **WhatsApp dizia "TEXTOS QUE EU ESCREVI OU EDITEI" para textos da IA:**
  o bloco agora é "TEXTOS ESCOLHIDOS PARA A PRÉVIA".
- **"Código do projeto" sugeria que a equipe consegue abrir o projeto:**
  virou "Referência (a mesma do arquivo do projeto)". O projeto continua só
  no aparelho da pessoa e no arquivo que ela enviar.

**Apresentação:**
- Topo com o novo título (versão curta no celular), a frase sobre prévia
  grátis e desenvolvimento pela Beck Performance, "Desenvolvimento de R$ 500
  a R$ 1.000", pagamento único e domínio/hospedagem à parte, "Criar minha
  prévia grátis" e "Ver exemplos de sites", e "Sem cadastro. Sem
  compromisso." O botão principal aparece sem rolar em 360, 390 e 430 px.
  Celular deitado usa o título curto.
- "Em até 5 minutos" saiu de todos os lugares (página, vitrine, imagem de
  compartilhamento, descrição). No lugar: "em poucos passos".
- Nova faixa "O que a Beck Performance faz no seu site" e "Como funciona"
  em três passos: crie sua prévia; ajuste e escolha o pacote; converse e
  confirme.
- Pacotes em blocos verticais no celular. Os itens comuns aparecem uma vez
  ("Em todos os pacotes"), e cada pacote mostra só o que o diferencia, o
  prazo e o botão "Criar prévia com o …". O botão abre a criação já no
  pacote; com uma prévia em andamento, pergunta antes e não troca nada
  sozinho. O Profissional é descrito como "Para apresentar trabalhos e
  organizar pedidos", sem selo de "mais vendido". A comparação completa tem
  versão própria para o celular, em blocos.
- Com um "Criar prévia com o …" à vista, o botão flutuante sai da tela e não
  aparece duplicado.
- Perguntas: as seis prioritárias primeiro (prévia × site final, o que o
  valor inclui, domínio e hospedagem, prazo, materiais, alterações depois da
  entrega). As outras continuam em "Ver todas".

**Exemplos preenchidos:**
- 27 ilustrações vetoriais próprias em `public/demo/` (origem e licença em
  `public/demo/README.md`). Elas preenchem galeria, destaques, cardápio e
  imóveis dos exemplos públicos. Somem "Sua foto 1", "Item 1" e "Foto do
  item" dos exemplos, e as legendas deixam claro que são ilustrativas.
- O cartão mostra o segmento, a finalidade, o pacote com o preço e "Ver
  este exemplo". No celular, o exemplo abre na versão de celular em tela
  cheia, sem moldura dentro de moldura. "Usar este modelo" mostra o pacote e
  o preço.

**Criação (configurador):**
- No celular, o progresso é uma linha ("Etapa 3 de 4: Personalizar · Cores
  (3 de 6)") que abre a lista de etapas.
- Seletor de pacote compacto: três opções lado a lado (nome, preço e
  "Selecionado") e, abaixo, os detalhes só do escolhido. Antes de a pessoa
  escolher, o pacote aparece como "Pacote inicial: você pode mudar, e nada é
  contratado agora".
- Depois da prévia pronta: "Gostei assim — revisar e solicitar".
- Áudio: o botão é "Parar gravação". Durante a gravação e a transcrição,
  "Gerar minha prévia" fica desativado e explica o motivo. No navegador do
  Instagram ou do Facebook aparece um aviso sobre o microfone, com a opção de
  digitar. Se a pessoa sair do app durante a gravação, a gravação para e o
  texto fica para conferir.
- Revisão: ferramentas agrupadas em "Salvar ou compartilhar projeto". Se o
  WhatsApp não abrir, a página indica onde copiar o resumo.
- Gerar outra sugestão para uma seção não sobrescreve um texto que a pessoa
  editou enquanto a sugestão era gerada.

**Medição:**
- Todo evento leva `device` (`celular`, `tablet` ou `computador`, só pela
  largura da tela).
- `start_click` com `context: pacote` leva o `package`.
- `ai_generate` registra também `iniciada`.

Nada disso envia texto digitado, áudio ou dados pessoais.

**Verificação:**
- 65 testes unitários, com 4 novos:
  - galeria dos exemplos no limite do pacote;
  - modelo de estética com descrição de imobiliária;
  - texto e referência do WhatsApp;
  - diferenças dos pacotes e categoria do aparelho.
- 60 cenários de navegador, 16 novos:
  - pacote vindo da apresentação, com e sem rascunho;
  - exemplos sem espaços vazios;
  - exemplo no celular;
  - primeira tela em 360, 390 e 430 px;
  - 768, 1024 e 1440 px e celular deitado (844×390);
  - progresso, pacote e revisão no celular;
  - ordem ao restaurar;
  - WhatsApp;
  - conflito de segmento;
  - navegador do Instagram.
- Tudo em Chromium, com celular emulado e microfone simulado. **Não houve
  teste em iPhone ou Safari reais.**
- Capturas antes/depois (celular primeiro) em `docs/capturas/2026-09-28/`.
  Essa pasta não vai para o site publicado.

**Medição de laboratório (não é dado de celular real):**
- Condições: Chromium local com servidor gzip (como o GitHub Pages), sem cache, mediana de 5 execuções.
- Celular: 390×844 com rede "Slow 4G" (RTT 150 ms, 1,6 Mbps) e CPU 4× mais lenta.
- Computador: 1440×900 sem limitação.
- Formato: `main` → esta branch.

| Página | 1ª pintura (= LCP) | Bloqueio (TBT) | CLS | Transferido | Requisições | Elementos |
|---|---|---|---|---|---|---|
| Apresentação, celular | 892 → 968 ms | 532 → 480 ms | 0 → 0 | 234 → 241 KB | 15 → 20 | 885 → 760 |
| Criação, celular | 752 → 776 ms | 300 → 266 ms | 0 → 0 | 255 → 259 KB | 17 → 17 | 403 → 338 |
| Apresentação, computador | 200 → 188 ms | 59 → 42 ms | 0 → 0 | 238 → 248 KB | 19 → 30 | 885 → 760 |

- **Mais leve:** a página tem menos elementos e menos tempo de bloqueio, porque a comparação de pacotes (tabela e blocos) só é montada quando a pessoa abre.
- **Mais pesado:** a primeira pintura no celular ficou +76 ms, pelo CSS novo (+6 KB sem compressão).
- **Requisições a mais:** são ilustrações pequenas (1–3 KB cada), com carregamento adiado e só depois da primeira pintura. Elas substituem os espaços "Sua foto".
- Não há ganho de desempenho a declarar. LCP, INP e CLS reais só podem ser medidos depois da publicação (PageSpeed Insights / Search Console).

**Pendências reais:**
- Fotos reais de clientes e depoimentos: não existem ainda, e nada foi
  inventado. As ilustrações são demonstração visual, não prova de
  resultado.
- Validação no iPhone (Safari) e no navegador interno do Instagram: roteiro
  no PR.
- Botão final diferente por objetivo (por exemplo, "Pedir orçamento" ×
  "Agendar"): exige mudar o contrato da mensagem e do Worker. Ficou para
  uma próxima rodada.
- O Worker não mudou nesta rodada. Publicar é só o site (Pages no merge).

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
