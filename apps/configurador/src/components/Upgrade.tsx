'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { contact } from '@/config/contact';
import { pricing, brl } from '@/config/pricing';
import { features } from '@/config/features';
import { siteTypes } from '@/config/siteTypes';
import { externalServicesNote, volumeOptions } from '@/config/forms';
import { projectFaq } from '@/config/projectFaq';
import { KEY, exampleProject, initialProject, normalizeProject, migrateLegacy, fromShare, shareLink, segments, objectives, sections, directions, palettes, recommendations, directionPrice, projectEstimate, priceLabel, projectMessage, externalFeatures, type Project } from '@/lib/project';
import { ProjectPreview } from './ProjectPreview';
import { InspirationPreview } from './InspirationPreview';
import s from './Upgrade.module.css';
const steps = ['Seu negócio', 'Seu objetivo', 'Sua estrutura', 'Identidade visual', 'Recursos e valor', 'Seu projeto'];
// Local integration point. No tracker or personal information is sent.
function event(name: string, step?: number) { window.dispatchEvent(new CustomEvent('mb:configurator', { detail: { event: name, ...(step === undefined ? {} : { step }) } })); }
function Choice({ selected, onClick, title, children }: {
    selected: boolean;
    onClick: () => void;
    title: string;
    children?: ReactNode;
}) { return <button type="button" className={`${s.choice} ${selected ? s.selected : ''}`} aria-pressed={selected} onClick={onClick}><span className={s.choiceTop}><strong>{title}</strong><span aria-hidden="true">{selected ? '✓' : '○'}</span></span>{children && <span className={s.choiceDescription}>{children}</span>}</button>; }
export default function Upgrade() {
    const [p, setP] = useState<Project>(initialProject);
    const [ready, setReady] = useState(false), [hasProgress, setHasProgress] = useState(false), [notice, setNotice] = useState(''), [mobileView, setMobileView] = useState(false), [device, setDevice] = useState<'desktop' | 'mobile'>('desktop'), [resetPrompt, setResetPrompt] = useState(false), [share, setShare] = useState(''), [menu, setMenu] = useState(false), [budget, setBudget] = useState(''), [budgetMode, setBudgetMode] = useState(false);
    const heading = useRef<HTMLHeadingElement>(null), focusNext = useRef(false), examplesRail = useRef<HTMLDivElement>(null);
    const e = projectEstimate(p), seg = segments.find(a => a.id === p.segment)!;
    useEffect(() => {
        let loaded: Project | null = null;
        try {
            loaded = fromShare(window.location.hash);
            if (loaded)
                setNotice('Configuração do link carregada. Nome e descrição não são compartilhados.');
        }
        catch {
            setNotice('Este link é inválido ou de outra versão. Você pode configurar um novo projeto.');
        }
        if (!loaded)
            try {
                const current = localStorage.getItem(KEY), old = localStorage.getItem('mb.configurador.v1');
                if (current) {
                    loaded = normalizeProject(JSON.parse(current));
                    setNotice('Seu projeto foi recuperado neste navegador.');
                }
                else if (old) {
                    loaded = migrateLegacy(JSON.parse(old));
                    setNotice('Recuperamos suas escolhas anteriores. Revise a estrutura e a identidade antes de continuar.');
                }
            }
            catch {
                setNotice('Não foi possível recuperar o progresso. Você pode continuar normalmente.');
            }
        if (loaded) {
            setP(loaded);
            setHasProgress(true);
        }
        setReady(true);
        const onHash = () => { try {
            const linked = fromShare(window.location.hash);
            if (linked) {
                setP(linked);
                setHasProgress(true);
                setMobileView(false);
                setNotice('Configuração compartilhada carregada.');
            }
        }
        catch {
            setNotice('Link inválido. Suas escolhas atuais foram preservadas.');
        } };
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, []);
    useEffect(() => { if (!ready || !hasProgress)
        return; try {
        localStorage.setItem(KEY, JSON.stringify(p));
    }
    catch {
        setNotice('O navegador não permitiu salvar. Mantenha esta aba aberta ou copie o link das opções.');
    } }, [p, ready, hasProgress]);
    useEffect(() => { if (focusNext.current) {
        heading.current?.focus();
        focusNext.current = false;
    } }, [p.step, mobileView]);
    function update(patch: Partial<Project>) { setP(old => normalizeProject({ ...old, ...patch })); setHasProgress(true); setShare(''); }
    function go(step: number) { focusNext.current = true; update({ step }); setMobileView(false); if (step === 5)
        event('summary_view'); }
    function start() { setHasProgress(true); event('configurator_start'); document.getElementById('configurador')?.scrollIntoView(); }
    function toggleFeature(id: string) { update({ features: p.features.includes(id) ? p.features.filter(f => f !== id) : [...p.features, id] }); }
    function toggleSection(id: string) { update({ sections: p.sections.includes(id) ? p.sections.filter(f => f !== id) : [...p.sections, id] }); }
    function reset() { setP(initialProject()); setHasProgress(false); setResetPrompt(false); setShare(''); setBudget(''); setBudgetMode(false); setMobileView(false); try {
        localStorage.removeItem(KEY);
        localStorage.removeItem('mb.configurador.v1');
    }
    catch { } history.replaceState(null, '', location.pathname + location.search + '#configurador'); setNotice('Projeto reiniciado. Você pode começar novamente.'); heading.current?.focus(); }
    async function copyShare() { const link = shareLink(p); setShare(link); event('share'); try {
        await navigator.clipboard.writeText(link);
        setNotice('Link copiado. Nome e descrição não estão incluídos.');
    }
    catch {
        setNotice('Copie o link no campo abaixo. Ele não inclui nome ou descrição.');
    } }
    function preset(id: string) { setP({ ...exampleProject(id), name: p.name, description: p.description }); setHasProgress(true); setShare(''); setNotice('Ponto de partida aplicado. Revise as seções e os adicionais sugeridos.'); start(); }
    function moveExamples(direction: 'next' | 'previous') { examplesRail.current?.scrollBy({ left: direction === 'next' ? 360 : -360, behavior: 'smooth' }); }
    const optional = features.filter(f => !['whatsapp', 'redes'].includes(f.id) && !sections.some(a => a.feature === f.id));
    const extras = p.features.filter(f => pricing.byFeature[f] > 0);
    const budgetSuggestion = extras.length ? normalizeProject({ ...p, features: p.features.filter(f => f !== extras[extras.length - 1]), sections: p.sections.filter(id => sections.find(s => s.id === id)?.feature !== extras[extras.length - 1]) }) : null;
    return <div className={s.page} id="topo">
 <header className={s.header}><nav className={s.nav} aria-label="Navegação principal"><a className={s.brand} href="#topo" aria-label="Beck Performance — início"><span>MB</span><div>BECK<small>PERFORMANCE</small></div></a><div className={`${s.navLinks} ${menu ? s.menuOpen : ''}`}><a href="#exemplos" onClick={() => setMenu(false)}>Exemplos</a><a href="#como-funciona" onClick={() => setMenu(false)}>Como funciona</a><a href="#perguntas" onClick={() => setMenu(false)}>Perguntas</a></div><a className={s.primary} href="#configurador" onClick={start}>Configurar meu site <span aria-hidden="true">↗</span></a><button className={s.menuButton} aria-label="Abrir navegação" aria-expanded={menu} onClick={() => setMenu(!menu)}>☰</button></nav></header>
 <main><section className={`${s.wrap} ${s.hero}`}><div className={s.heroCopy}><span className={s.eyebrow}><span /> SITES PROFISSIONAIS PARA NEGÓCIOS LOCAIS</span><h1>Seu site profissional,<br />do seu jeito, em até <em>3 minutos.</em></h1><div className={s.heroPills}><span>Até 3 minutos</span><span>R$ 500 a R$ 1.000</span><span>Prévia ao vivo</span></div><div className={s.heroActions}><a className={s.primary} href="#configurador" onClick={start}>{hasProgress ? 'Continuar meu projeto' : 'Montar meu site agora'} ↗</a><a className={s.textLink} href="#exemplos">Ver modelos ↓</a></div></div><div className={s.heroShowcase}><div className={s.showcaseNote}><span>SUA IDEIA EM FORMA DE SITE</span><span>PRÉVIA</span></div><ProjectPreview project={{ ...initialProject(), segment: 'beleza', direction: 'elegante', palette: 'verde' }} compact/><div className={s.showcaseBottom}><span className={s.statusDot}/> Visualize antes de contratar</div></div></section>
 <div className={`${s.wrap} ${s.benefits}`}><div><span aria-hidden="true">01</span>Escolha seu estilo</div><div><span aria-hidden="true">02</span>Veja a prévia</div><div><span aria-hidden="true">03</span>Receba a estimativa</div><div><span aria-hidden="true">04</span>Eu desenvolvo</div></div>
 <section id="como-funciona" className={`${s.wrap} ${s.process}`}><div><span className={s.eyebrow}>CLAREZA EM CADA ETAPA</span><h2>Como funciona<br />na prática.</h2></div><ol>{[['Você configura', 'Escolhas simples.'], ['Você visualiza', 'Prévia na hora.'], ['Eu publico', 'Acompanhamento até o ar.']].map(([title, text], i) => <li key={title}><span>0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section>
 <section className={s.workspace} id="configurador" aria-label="Configurador de site"><div className={s.wrap}><div className={s.sectionHead}><div><span className={s.eyebrow}>SEU SITE, PASSO A PASSO</span><h2>Monte a sua estrutura.</h2><p>Escolha. Visualize. Entenda o investimento.</p></div><span className={s.localBadge}>{hasProgress ? 'Salvamento local automático' : 'Sem cadastro · sem compromisso'}</span></div><div className={s.notice} role="status">{notice}</div>
 <ol className={s.steps} aria-label="Etapas do projeto">{steps.map((title, i) => <li key={title}><button onClick={() => go(i)} aria-current={p.step === i ? 'step' : undefined}><span>{i + 1}</span><b>{title}</b></button></li>)}</ol><div className={s.mobileTabs}><button aria-pressed={!mobileView} onClick={() => setMobileView(false)}>Configurar</button><button aria-pressed={mobileView} onClick={() => setMobileView(true)}>Ver prévia</button></div>
 <div className={s.mobileEstimate}><strong>{priceLabel(p)}</strong><span>{e.deadline}</span><small>Estimativa · custos externos à parte</small></div><div className={`${s.workGrid} ${mobileView ? s.viewPreview : ''}`}><div className={s.editor}><div className={s.editorHeading}><span className={s.eyebrow}>PASSO 0{p.step + 1} DE 06</span><button className={s.resetLink} onClick={() => setResetPrompt(true)}>Começar novamente</button></div>{resetPrompt && <div className={s.noticeBox}><p>Apagar as escolhas salvas e começar um novo projeto?</p><div className={s.actionRow}><button className={s.secondary} onClick={() => setResetPrompt(false)}>Manter meu projeto</button><button className={s.primary} onClick={reset}>Sim, começar novamente</button></div></div>}<h3 ref={heading} tabIndex={-1} className={s.stepTitle}>{['Primeiro, o seu negócio.', 'O que você mais quer facilitar?', 'Uma estrutura que faz sentido.', 'Encontre a sua linguagem visual.', 'O que seu site precisa fazer?', 'Seu projeto, bem organizado.'][p.step]}</h3>
 {p.step === 0 && <><p className={s.hint}>Conte um pouco sobre o que você faz. A prévia já começa a mudar.</p><label className={s.field}>Nome do negócio <small>opcional</small><input maxLength={80} value={p.name} onChange={ev => update({ name: ev.target.value })} placeholder="Como seu negócio se chama?" autoComplete="organization"/></label><fieldset><legend>Qual é o seu segmento?</legend><div className={s.choiceGrid}>{segments.map(a => <Choice key={a.id} title={a.name} selected={p.segment === a.id} onClick={() => update({ segment: a.id })}/>)}</div></fieldset><label className={s.field}>O que você oferece? <small>opcional</small><textarea maxLength={280} value={p.description} onChange={ev => update({ description: ev.target.value })} placeholder="Ex.: Consultoria financeira para pequenos negócios." rows={3}/><small>{p.description.length}/280 caracteres · salvo apenas neste navegador</small></label></>}
 {p.step === 1 && <><p className={s.hint}>O objetivo orienta o botão principal e nossa recomendação de seções.</p><div className={s.choiceStack}>{objectives.map(a => <Choice key={a.id} title={a.name} selected={p.objective === a.id} onClick={() => update({ objective: a.id })}>Botão na prévia: “{a.cta}”</Choice>)}</div>{p.objective === 'agenda' && <p className={s.noticeBox}>Solicitar horário pelo WhatsApp está incluído. Não é um sistema de reservas com disponibilidade automática.</p>}</>}
 {p.step === 2 && <><p className={s.hint}>Seções são partes da mesma página. Uma página adicional tem endereço próprio; integrações adicionam funcionalidades.</p><div className={s.recommend}><strong>Para {seg.name.toLowerCase()}</strong><p>{p.objective === 'trabalhos' ? 'Uma galeria ajuda a apresentar seu trabalho.' : p.objective === 'localizacao' ? 'A localização ajuda as pessoas a encontrar você.' : 'Apresentação, serviços e contato ajudam a orientar a conversa.'} Seções extras usam os adicionais abaixo.</p><button className={s.textLink} onClick={() => { update({ sections: recommendations(p) }); setNotice('Estrutura recomendada aplicada. Confira os adicionais e a estimativa.'); }}>Aplicar estrutura recomendada ↗</button></div><div className={s.choiceStack}>{sections.map(a => <label key={a.id} className={s.checkRow}><input type="checkbox" checked={p.sections.includes(a.id)} disabled={a.fixed} onChange={() => toggleSection(a.id)}/><span><strong>{a.name}</strong><small>{a.fixed ? 'Essencial à página' : a.feature ? 'Seção opcional · participa do cálculo do prazo' : 'Conteúdo da página principal'}</small></span><b>{a.feature ? `+ ${brl(pricing.byFeature[a.feature])}` : 'Incluído'}</b></label>)}</div><p className={s.hint}>O escopo e a quantidade de conteúdo serão confirmados no orçamento. Depoimentos exigem relatos reais autorizados.</p></>}
 {p.step === 3 && <><p className={s.hint}>Modelo, personalidade e tipografia em uma escolha. Os adicionais existentes estão indicados em cada direção.</p>{(p.legacyTemplate || p.legacyStyle) && <p className={s.noticeBox}>Mantivemos o modelo e estilo antigos no cálculo ({p.legacyTemplate} / {p.legacyStyle}). Escolha uma direção abaixo para substituí-los e alinhar a prévia.</p>}<div className={s.directions}>{directions.map((d, i) => <Choice key={d.id} title={d.name} selected={p.direction === d.id && !p.legacyTemplate && !p.legacyStyle} onClick={() => update({ direction: d.id, font: 'auto', legacyTemplate: undefined, legacyStyle: undefined })}><span className={`${s.typeSample} ${s['type' + i]}`}>Aa<span>Feito para você.</span></span>{d.description}<b>{directionPrice(d.id) ? `+ ${brl(directionPrice(d.id))}` : 'Incluído'}</b></Choice>)}</div><fieldset><legend>Sua paleta de cores</legend><div className={s.palettes}>{palettes.map(a => <button key={a.id} aria-pressed={p.palette === a.id && !p.custom} onClick={() => update({ palette: a.id, custom: null })}><span style={{ background: a.accent }}/><span>{a.name} {p.palette === a.id && !p.custom ? '✓' : ''}</span></button>)}</div></fieldset><details className={s.details}><summary>Já tenho minhas cores <span>+ {brl(pricing.customColors)}</span></summary><label className={s.colorField}>Cor principal<input type="color" aria-label="Sua cor principal" value={p.custom ?? '#6650b5'} onChange={ev => update({ custom: ev.target.value })}/></label><button className={s.textLink} onClick={() => update({ custom: null })}>Voltar à paleta pronta</button><p className={s.hint}>O texto dos botões se adapta à cor escolhida para manter contraste. O fundo de leitura permanece claro.</p></details><details className={s.details}><summary>Personalizar mais</summary><label className={s.field}>Tipografia<select value={p.font} onChange={ev => update({ font: ev.target.value })}><option value="auto">Recomendada para a direção</option><option value="sans">Sem serifa · direta e contemporânea</option><option value="serif">Com serifa · editorial e clássica</option></select></label></details></>}
 {p.step === 4 && <><p className={s.hint}>Adicione apenas o que ajuda seu cliente. Os valores são de implementação e entram na estimativa.</p><div className={s.included}><strong>✓ Já incluído</strong><p>Layout responsivo, botão de WhatsApp e links para redes sociais. Duas rodadas de ajustes e acompanhamento até publicar.</p></div>{['Opcionais', 'Serviços externos · sujeitos a avaliação'].map((group, index) => <fieldset key={group}><legend>{group}</legend>{optional.filter(f => externalFeatures.includes(f.id) === (index === 1)).map(f => <label className={s.checkRow} key={f.id}><input type="checkbox" checked={p.features.includes(f.id)} onChange={() => toggleFeature(f.id)}/><span><strong>{f.name}</strong><small>{f.id === 'agendamento' ? 'Integração com plataforma de reservas a definir. Assinatura externa e compatibilidade sob avaliação.' : f.id === 'instagram' ? 'Integração sujeita às regras da plataforma e possíveis custos de provedor.' : f.id === 'paginaExtra' ? 'Uma página além da principal. Conteúdo e finalidade a confirmar.' : f.id === 'catalogo' ? 'Itens com foto e descrição; sem carrinho ou pagamento online.' : f.pitch}</small><small>{(pricing.complexity.heavyFeatures as readonly string[]).includes(f.id) ? 'Maior complexidade' : 'Adiciona complexidade'} · prazo recalculado ao selecionar.{f.hint ? ` ${f.hint}` : ''}</small></span><b>+ {brl(pricing.byFeature[f.id])}</b></label>)}</fieldset>)}{p.features.includes('formularioEmail') && <label className={s.field}>Contatos esperados por mês<select value={p.emailVolume ?? 'naoSei'} onChange={ev => update({ emailVolume: ev.target.value })}>{volumeOptions.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}</select><small>Limites e valores do provedor serão confirmados. Nenhuma assinatura está incluída nesta estimativa.</small></label>}<details className={s.details}><summary>Tipo de projeto e escopo avançado</summary><label className={s.field}>Categoria comercial<select value={p.type} onChange={ev => update({ type: ev.target.value })}>{siteTypes.map(t => <option key={t.id} value={t.id}>{t.name} · + {brl(pricing.byType[t.id])}</option>)}</select></label><p className={s.hint}>A categoria não adiciona páginas automaticamente. Uma loja virtual ou sistema com regras próprias exige avaliação.</p></details><label className={s.checkRow}><input type="checkbox" checked={budgetMode} onChange={ev => setBudgetMode(ev.target.checked)}/><span>Quero ficar dentro de um orçamento</span></label>{budgetMode && <div className={s.noticeBox}><label className={s.field}>Meu limite para desenvolvimento (R$)<input type="number" min={pricing.base} step="50" value={budget} onChange={ev => setBudget(ev.target.value)}/></label>{budget && Number(budget) < pricing.base ? <p>O projeto base começa em {brl(pricing.base)}.</p> : budget && e.max > Number(budget) ? <><p>A estimativa atual pode ultrapassar seu limite.</p>{budgetSuggestion ? <><p>Remover “{features.find(f => f.id === extras[extras.length - 1])?.name}” muda a faixa para {priceLabel(budgetSuggestion)}.</p><button className={s.secondary} onClick={() => { setP(budgetSuggestion); setShare(''); setNotice('Recurso removido após sua confirmação.'); }}>Confirmar esta remoção</button></> : <p>Revise a direção visual, cores próprias e categoria. Nada será removido automaticamente.</p>}</> : budget ? <p>A faixa estimada cabe no limite. Custos externos ficam à parte.</p> : <p>Informe um limite para comparar com a estimativa.</p>}</div>}<p className={s.noticeBox}>{externalServicesNote}</p></>}
 {p.step === 5 && <><dl className={s.summary}>
 <div><dt>Seu projeto</dt><dd>{p.name || seg.demo} · {seg.name}<button onClick={() => go(0)}>Editar ↗</button></dd></div><div><dt>Estilo</dt><dd>{directions.find(d => d.id === p.direction)!.name} · {p.custom ?? palettes.find(a => a.id === p.palette)!.name}<button onClick={() => go(3)}>Editar ↗</button></dd></div><div><dt>Investimento estimado</dt><dd><strong className={s.summaryPrice}>{priceLabel(p)}</strong></dd></div>
 </dl><a className={`${s.primary} ${s.whatsapp}`} href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(projectMessage(p))}`} target="_blank" rel="noopener noreferrer" onClick={() => event('whatsapp_click')}>Conversar sobre este projeto ↗</a><div className={s.actionRow}><button className={s.secondary} onClick={copyShare}>Copiar link</button><button className={s.secondary} onClick={() => window.print()}>Salvar PDF</button></div>{share && <label className={s.field}>Link para compartilhar<input readOnly value={share} onFocus={ev => ev.target.select()}/></label>}<details className={s.details}><summary>Revisar mensagem do WhatsApp</summary><pre className={s.message}>{projectMessage(p)}</pre></details></>}
 <div className={s.stepActions}><button className={s.secondary} disabled={p.step === 0} onClick={() => go(p.step - 1)}>← Voltar</button><span>{p.step + 1} / 6</span>{p.step < 5 ? <button className={s.primary} disabled={!ready} onClick={() => { event('step_complete', p.step + 1); go(p.step + 1); }}>{p.step === 4 ? 'Ver meu projeto' : 'Continuar'} →</button> : <button className={s.secondary} onClick={() => go(0)}>Revisar escolhas</button>}</div></div>
 <aside className={s.previewPane} aria-label="Prévia do seu site"><div className={s.previewHeader}><div><span className={s.eyebrow}>SUA IDEIA GANHANDO FORMA</span><strong>Prévia do seu site</strong></div><div className={s.deviceButtons}><button aria-label="Prévia no computador" aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}>▱</button><button aria-label="Prévia no celular" aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}>▯</button></div></div><div className={s.previewScroll}><ProjectPreview project={p} mobile={device === 'mobile'}/></div><p className={s.previewNote}>Prévia ilustrativa. O site final será desenvolvido e ajustado por Matheus.</p><div className={s.estimate}><div><span>DESENVOLVIMENTO ESTIMADO</span><strong data-testid="estimate">{priceLabel(p)}</strong><small>{e.deadline} após receber os materiais</small></div><span className={s.estimateIcon} aria-hidden="true">↗</span></div><p className={s.externalNote}>Domínio, hospedagem e plataformas à parte. O valor final depende do escopo confirmado.</p><button className={s.mobileReturn} onClick={() => setMobileView(false)}>← Voltar à configuração</button></aside></div></div></section>
 <section id="exemplos" className={`${s.wrap} ${s.examples}`}><div className={s.sectionHead}><div><span className={s.eyebrow}>ESCOLHA UM PONTO DE PARTIDA</span><h2>Exemplos de páginas<br />para você se inspirar.</h2></div><div className={s.carouselControls}><button type="button" onClick={() => moveExamples('previous')} aria-label="Ver modelos anteriores">←</button><button type="button" onClick={() => moveExamples('next')} aria-label="Ver próximos modelos">→</button></div></div><div className={s.examplesRail} ref={examplesRail} aria-label="Modelos de sites arrastáveis">{segments.filter(a => a.id !== 'outro').map((a, i) => { const demo = exampleProject(a.id); return <article key={a.id}><InspirationPreview index={i}/><div className={s.exampleInfo}><span>MODELO 0{i + 1} · {a.name}</span><h3>{a.demo}</h3><button className={s.textLink} onClick={() => preset(a.id)}>Usar como base ↗</button></div></article>; })}</div><p className={s.dragHint}>Arraste para os lados e escolha um estilo para começar.</p></section>
 <section className={`${s.wrap} ${s.featuresShowcase}`}><div className={s.sectionHead}><div><span className={s.eyebrow}>VOCÊ DEFINE O QUE IMPORTA</span><h2>O que seu site<br />pode ter.</h2></div></div><div className={s.featureTiles}>{[['◌','WhatsApp'],['□','Formulário'],['▦','Galeria'],['⌖','Localização'],['↗','Redes sociais'],['＋','Página extra']].map(([icon,label]) => <div key={label}><span aria-hidden="true">{icon}</span><strong>{label}</strong></div>)}</div></section>
 <section className={`${s.wrap} ${s.author}`}><div className={s.authorMark} aria-hidden="true">MB<span>.</span></div><div><span className={s.eyebrow}>BECK PERFORMANCE</span><h2>Você visualiza.<br />Eu faço acontecer.</h2><p>Estratégia, desenvolvimento e publicação.</p><a className={s.textLink} href="/Matheus-Performance/">Conheça meu trabalho ↗</a></div><div className={s.authorProcess}><span>Escopo claro</span><span>Site responsivo</span><span>Acompanhamento até publicar</span></div></section>
 <section id="perguntas" className={`${s.wrap} ${s.faq}`}><div><span className={s.eyebrow}>DÚVIDAS FREQUENTES</span><h2>Tudo claro<br />antes de começar.</h2></div><div>{projectFaq.map(([q, a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
 <section className={s.final}><span className={s.eyebrow}>O PRÓXIMO PASSO É SEU</span><h2>Seu negócio merece<br />um site à altura.</h2><a className={s.primary} href="#configurador" onClick={start}>{hasProgress ? 'Continuar meu projeto' : 'Montar meu site agora'} ↗</a><p>Configure em poucos minutos. Publique com clareza e profissionalismo.</p></section></main>
 <footer className={`${s.wrap} ${s.footer}`}><div className={s.brand}><span>MB</span><div>BECK<small>PERFORMANCE</small></div></div><div><a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a><Link href="/privacidade/">Privacidade</Link><Link href="/termos/">Termos</Link></div><small>© {new Date().getFullYear()} Beck Performance</small></footer></div>;
}
