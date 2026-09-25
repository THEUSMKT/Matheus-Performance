'use client';
/* ==========================================================================
   Configurador assistido em quatro momentos:
   1. Negócio e objetivo  2. Recomendação  3. Ajustes opcionais
   4. Resumo e próximo passo
   Preço e prévia aparecem antes de qualquer dado pessoal. Nenhum campo
   opcional bloqueia o avanço.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import { pricing, brl } from '@/config/pricing';
import { features } from '@/config/features';
import { siteTypes } from '@/config/siteTypes';
import { FORM_EMAIL, FORM_WHATSAPP, emailFormNotice, volumeOptions, volumeQuestion } from '@/config/forms';
import { complexNeeds, plans, scopeRules } from '@/config/offer';
import { contact } from '@/config/contact';
import {
  STEP_COUNT,
  applyPlan,
  budgetInfo,
  choiceChanges,
  customStructure,
  directionPrice,
  directions,
  investmentLabel,
  needsDiagnosis,
  normalizeProject,
  objectives,
  palettes,
  priceLabel,
  projectEstimate,
  recommendationReason,
  recommendedPlan,
  sections,
  segments,
  selectedSections,
  steps,
  helpMessage,
  deadlineText,
  type Project,
} from '@/lib/project';
import { track } from '@/lib/analytics';
import { whatsappLink } from '@/lib/whatsapp';
import { ProjectPreview } from '../ProjectPreview';
import { Check, ConfirmBox, Radios, type Pending } from './Controls';
import { SummaryStep } from './SummaryStep';
import { useNarrow, type ProjectState } from './useProject';
import s from './Landing.module.css';

const titles = ['Conte sobre o seu negócio.', 'Nossa recomendação para você.', 'Ajuste o que quiser.', 'Seu projeto, pronto para conversar.'];
const hints = [
  'Quatro respostas rápidas. Só o segmento e o objetivo orientam a recomendação — o resto é opcional.',
  'Com base nas suas respostas. Você pode seguir com ela, escolher outro caminho ou decidir depois.',
  'Tudo aqui é opcional. O valor muda na hora e você vê o motivo de cada acréscimo.',
  'Confira o escopo e o investimento. Seus dados só são pedidos agora, e só o necessário.',
];

const typeSamples: Record<string, React.CSSProperties> = {
  essencial: { fontFamily: 'Arial, sans-serif', fontWeight: 500 },
  elegante: { fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  marcante: { fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900 },
};

const featureNote: Record<string, string> = {
  catalogo: scopeRules.catalogo,
  paginaExtra: scopeRules.paginaExtra,
  agendamento: scopeRules.agendaIntegrada,
  instagram: 'Exibe publicações recentes. Depende das regras do Instagram e pode exigir ferramenta com custo próprio.',
  animacoes: 'Movimentos suaves ao rolar, respeitando quem prefere menos movimento.',
};

const priced = (v: number) => (v > 0 ? `+ ${brl(v)}` : 'Incluído');

export function Configurator({ state }: { state: ProjectState }) {
  const { project: p, update, replace, reset, ready, notice, setNotice, origin } = state;
  const [pending, setPending] = useState<Pending | null>(null);
  const [resetting, setResetting] = useState(false);
  const [help, setHelp] = useState(false);
  const narrow = useNarrow();
  const [deviceChoice, setDevice] = useState<'desktop' | 'mobile' | null>(null);
  const device = deviceChoice ?? (narrow ? 'mobile' : 'desktop');
  const [barVisible, setBarVisible] = useState(false);
  const [typing, setTyping] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const editor = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const focusHeading = useRef(false);

  const e = projectEstimate(p);
  const diagnosis = needsDiagnosis(p);
  const rec = recommendedPlan(p);

  // Foco no título ao trocar de momento, para leitores de tela e teclado.
  useEffect(() => {
    if (!focusHeading.current) return;
    focusHeading.current = false;
    heading.current?.focus({ preventScroll: true });
    const top = editor.current?.getBoundingClientRect().top ?? 0;
    if (top < 60 || top > window.innerHeight * 0.6) editor.current?.scrollIntoView({ block: 'start' });
  }, [p.step]);

  // Barra do celular: só enquanto o configurador está na tela e nenhum campo
  // está em edição (o teclado virtual não fica coberto).
  useEffect(() => {
    const el = section.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setBarVisible(entry.isIntersecting), { rootMargin: '0px 0px -30% 0px' });
    io.observe(el);
    const isField = (t: EventTarget | null) => t instanceof HTMLElement && t.matches('input:not([type=checkbox]):not([type=radio]):not([type=color]), textarea, select');
    const onIn = (ev: FocusEvent) => isField(ev.target) && setTyping(true);
    const onOut = (ev: FocusEvent) => isField(ev.target) && setTyping(false);
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      io.disconnect();
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);

  function edit(patch: Partial<Project>) {
    track('configurator_start');
    update(patch);
  }

  function go(step: number) {
    const target = Math.max(0, Math.min(STEP_COUNT - 1, step));
    if (target > p.step) for (let i = p.step; i < target; i++) track('step_complete', { step: i + 1 });
    if (target === STEP_COUNT - 1) track('summary_view');
    track('configurator_start');
    setPending(null);
    setHelp(false);
    focusHeading.current = true;
    update({ step: target });
  }

  /** Aplica um caminho; pede confirmação só se desfizer ajustes do visitante. */
  function choosePlan(id: Project['plan'] & string, source: string) {
    const next = applyPlan(p, id);
    const apply = () => {
      replace(next);
      track(source === 'recomendacao' ? 'recommendation_applied' : 'plan_selected', { plan: id, source });
      setNotice(`Caminho “${plans.find((x) => x.id === id)!.name}” aplicado. A estimativa foi recalculada.`);
    };
    const changes = choiceChanges(p, next).filter((c) => c !== 'caminho de contratação');
    if (customStructure(p).length && changes.length) {
      setPending({ title: 'Aplicar este caminho muda a estrutura que você ajustou.', changes, confirmLabel: 'Aplicar mesmo assim', apply });
    } else apply();
  }

  function setForm(id: string) {
    const rest = p.features.filter((f) => f !== FORM_WHATSAPP && f !== FORM_EMAIL);
    edit({ features: id === 'nenhum' ? rest : [...rest, id], emailVolume: id === FORM_EMAIL ? p.emailVolume : null });
  }

  function toggle(list: 'features' | 'sections', id: string, on: boolean) {
    const cur = p[list];
    edit({ [list]: on ? [...cur, id] : cur.filter((x) => x !== id) });
  }

  const form = p.features.includes(FORM_EMAIL) ? FORM_EMAIL : p.features.includes(FORM_WHATSAPP) ? FORM_WHATSAPP : 'nenhum';
  const optional = features.filter((f) => ['animacoes', 'catalogo', 'paginaExtra', 'agendamento', 'instagram'].includes(f.id));

  return (
    <section className={s.workspace} id="configurador" ref={section} aria-labelledby="configurador-titulo">
      <div className={s.wrap}>
        <div className={s.sectionHead}>
          <h2 id="configurador-titulo">Monte a prévia do seu site</h2>
          <p>Sem cadastro. Suas respostas ficam salvas só neste navegador enquanto você decide.</p>
        </div>
        <div className={s.notice} role="status" aria-live="polite">
          {notice}
        </div>

        <nav aria-label="Momentos do configurador">
          <ol className={s.progress}>
            {steps.map((title, i) => (
              <li key={title} style={{ display: 'contents' }}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={p.step === i ? 'step' : undefined}
                  aria-label={`Momento ${i + 1}: ${title}${i < p.step ? ' (visto)' : ''}`}
                  data-done={i < p.step}
                >
                  <span aria-hidden="true">
                    {i + 1}
                    <span className={s.progressLabel}>. {title}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className={s.workGrid}>
          <div className={s.editor} ref={editor} style={{ scrollMarginTop: 84 }}>
            <div className={s.editorTop}>
              <span>
                Momento <strong>{p.step + 1} de {STEP_COUNT}</strong> · {steps[p.step]}
              </span>
              <span className={s.editorTools}>
                <button
                  type="button"
                  className={s.linkButton}
                  aria-expanded={help}
                  aria-controls="ajuda"
                  onClick={() => {
                    if (!help) track('help_open', { step: p.step + 1 });
                    setHelp(!help);
                  }}
                >
                  Precisa de ajuda?
                </button>
                <button type="button" className={s.linkButton} onClick={() => setResetting(true)}>
                  Começar novamente
                </button>
              </span>
            </div>

            {help && (
              <div className={s.helpPanel} id="ajuda">
                <p>Ficou com dúvida em alguma escolha? Pergunte antes de seguir — suas respostas continuam salvas aqui.</p>
                <a
                  href={whatsappLink(helpMessage(p))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('whatsapp_open', { context: 'ajuda' })}
                >
                  Tirar uma dúvida no WhatsApp ({contact.whatsappDisplay})
                </a>
                <a href="#perguntas">Ver as perguntas frequentes</a>
              </div>
            )}

            {resetting && (
              <div className={s.confirmBox} role="alertdialog" aria-labelledby="reiniciar-titulo">
                <p id="reiniciar-titulo">Apagar as escolhas salvas neste navegador e começar um projeto novo?</p>
                <div className={s.actionRow}>
                  <button
                    type="button"
                    className={`${s.primary} ${s.small}`}
                    onClick={() => {
                      reset();
                      setResetting(false);
                      focusHeading.current = true;
                    }}
                  >
                    Sim, começar novamente
                  </button>
                  <button type="button" className={`${s.secondary} ${s.small}`} autoFocus onClick={() => setResetting(false)}>
                    Manter meu projeto
                  </button>
                </div>
              </div>
            )}

            {pending && <ConfirmBox pending={pending} onCancel={() => setPending(null)} />}

            <h3 ref={heading} tabIndex={-1} className={s.stepTitle}>
              {titles[p.step]}
            </h3>
            <p className={s.hint}>{hints[p.step]}</p>

            {p.step === 0 && (
              <>
                <Radios
                  label="Segmento"
                  variant="chip"
                  value={p.segment}
                  options={segments.map((x) => ({ id: x.id, label: x.name }))}
                  onChange={(id) => edit({ segment: id })}
                />
                {p.segment === 'outro' && (
                  <label className={`${s.field} ${s.block}`}>
                    Qual é o seu segmento? <small>Opcional</small>
                    <input id="segmento-outro" maxLength={60} value={p.segmentOther} onChange={(ev) => edit({ segmentOther: ev.target.value })} placeholder="Ex.: escola de idiomas, pet shop, contabilidade" />
                  </label>
                )}
                <label className={`${s.field} ${s.block}`}>
                  Serviço ou produto principal <small>Opcional</small>
                  <input maxLength={100} value={p.service} onChange={(ev) => edit({ service: ev.target.value })} placeholder="Ex.: instalação de ar-condicionado" />
                </label>
                <Radios
                  label="O que o site precisa facilitar primeiro?"
                  value={p.guidance ? 'orientacao' : p.objective}
                  options={[
                    ...objectives.map((o) => ({ id: o.id, label: o.name, hint: `Botão principal na prévia: “${o.cta}”` })),
                    { id: 'orientacao', label: 'Ainda não sei — preciso de orientação', hint: 'Recomendamos o essencial e definimos junto com você na conversa.' },
                  ]}
                  onChange={(id) => (id === 'orientacao' ? edit({ guidance: true }) : edit({ objective: id, guidance: false }))}
                />
                {p.objective === 'agenda' && !p.guidance && <p className={s.infoBox}>{scopeRules.agendaSolicitacao}</p>}
                <label className={`${s.field} ${s.block}`}>
                  Nome do negócio <small>Opcional — aparece na prévia</small>
                  <input maxLength={80} value={p.name} onChange={(ev) => edit({ name: ev.target.value })} placeholder="Como sua empresa se chama?" autoComplete="organization" />
                </label>
                <details className={s.details} open={p.complex.length > 0}>
                  <summary>O projeto precisa de algo mais complexo?</summary>
                  <div className={s.detailsBody}>
                    <p className={s.hint}>Marque só se precisar. Esses itens dependem de levantamento, então a página não mostra um valor automático para eles.</p>
                    {complexNeeds.map((n) => (
                      <Check key={n.id} title={n.name} checked={p.complex.includes(n.id)} onChange={(on) => edit({ complex: on ? [...p.complex, n.id] : p.complex.filter((c) => c !== n.id) })} />
                    ))}
                  </div>
                </details>
              </>
            )}

            {p.step === 1 && (
              <>
                {(() => {
                  const plan = plans.find((x) => x.id === rec)!;
                  const preview = applyPlan(p, rec);
                  const inUse = p.plan === rec;
                  return (
                    <div className={s.recommendCard}>
                      <span className={s.badge}>Recomendado para este objetivo</span>
                      <h4>{plan.name}</h4>
                      <p>{recommendationReason(p)}</p>
                      <ul className={s.checkList}>
                        {plan.includes.map((i) => (
                          <li key={i}>{i}</li>
                        ))}
                      </ul>
                      <p className={s.hint} style={{ marginTop: 12 }}>
                        Estrutura sugerida:
                      </p>
                      <ul className={s.sectionPills}>
                        {selectedSections(preview).map((n) => (
                          <li key={n}>{n}</li>
                        ))}
                      </ul>
                      <p style={{ marginTop: 12 }}>
                        <strong>{investmentLabel(preview)}</strong>
                        <span className={s.hint} style={{ display: 'block', marginTop: 0 }}>
                          {diagnosis ? 'O valor é definido depois do diagnóstico — veja o motivo abaixo.' : `Estimativa de desenvolvimento · ${deadlineText(preview)}`}
                        </span>
                      </p>
                      <div className={s.actionRow}>
                        {inUse ? (
                          <p className={s.hint} style={{ fontWeight: 650 }}>
                            ✓ Recomendação em uso no seu projeto
                          </p>
                        ) : (
                          <button type="button" className={`${s.primary} ${s.small}`} onClick={() => choosePlan(rec, 'recomendacao')}>
                            Usar esta recomendação
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
                {diagnosis && (
                  <p className={s.warnBox}>
                    Você marcou: {complexNeeds.filter((n) => p.complex.includes(n.id)).map((n) => n.name.toLowerCase()).join('; ')}. Isso depende de levantamento — por isso não mostramos um valor automático, que poderia não se sustentar. A conversa começa por esse diagnóstico.
                  </p>
                )}
                <Radios
                  label="Prefere outro caminho?"
                  hint="Escolher aplica a estrutura e recalcula"
                  value={p.plan ?? ''}
                  options={plans.map((x) => ({
                    id: x.id,
                    label: x.name,
                    hint: x.forWhom,
                    aside: diagnosis || x.needsAssessment ? 'Após levantamento' : `a partir de ${brl(projectEstimate(applyPlan(p, x.id)).min)}`,
                  }))}
                  onChange={(id) => choosePlan(id as Project['plan'] & string, 'momento2')}
                />
                <p className={s.infoBox}>Não precisa decidir tudo agora. Siga para os ajustes opcionais ou vá direto ao resumo — dá para voltar a qualquer momento.</p>
              </>
            )}

            {p.step === 2 && (
              <>
                <div className={s.block}>
                  <span className={s.blockTitle}>Identidade visual</span>
                  {(p.legacyTemplate || p.legacyStyle) && (
                    <p className={s.infoBox}>
                      Mantivemos o modelo e o estilo escolhidos na versão anterior no cálculo. Escolha uma direção abaixo para substituí-los.
                    </p>
                  )}
                  <div className={s.directions} role="radiogroup" aria-label="Direção visual">
                    {directions.map((d) => {
                      const on = p.direction === d.id && !p.legacyTemplate && !p.legacyStyle;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          className={s.option}
                          style={{ flexDirection: 'column', gap: 4 }}
                          onClick={() => edit({ direction: d.id, font: 'auto', legacyTemplate: undefined, legacyStyle: undefined })}
                        >
                          <span className={s.typeSample} style={typeSamples[d.id]} aria-hidden="true">
                            Aa
                          </span>
                          <strong>{d.name}</strong>
                          <small>{d.description}</small>
                          <span className={s.price}>{priced(directionPrice(d.id))}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className={s.block}>
                  <span className={s.blockTitle}>Cores</span>
                  <div className={s.palettes}>
                    {palettes.map((c) => (
                      <button key={c.id} type="button" aria-pressed={p.palette === c.id && !p.custom} onClick={() => edit({ palette: c.id, custom: null })}>
                        <span className={s.swatch} style={{ background: c.accent }} aria-hidden="true" />
                        {c.name}
                      </button>
                    ))}
                  </div>
                  <details className={s.details} open={!!p.custom}>
                    <summary>
                      Usar as cores da minha marca <span className={s.price}>+ {brl(pricing.customColors)}</span>
                    </summary>
                    <div className={s.detailsBody}>
                      <label className={s.field}>
                        Cor principal
                        <input className={s.colorInput} type="color" value={p.custom ?? '#0761fd'} onChange={(ev) => edit({ custom: ev.target.value })} />
                      </label>
                      {p.custom && (
                        <button type="button" className={s.linkButton} style={{ justifySelf: 'start' }} onClick={() => edit({ custom: null })}>
                          Voltar para a paleta pronta
                        </button>
                      )}
                      <p className={s.hint}>O texto dos botões se ajusta à cor para manter a leitura. O acréscimo cobre a adaptação fina das cores no site.</p>
                    </div>
                  </details>
                </div>

                <div className={s.block}>
                  <span className={s.blockTitle}>
                    Seções da página principal<small>Apresentação e contato já estão incluídas</small>
                  </span>
                  <div className={s.options}>
                    {sections.map((x) => (
                      <Check
                        key={x.id}
                        title={x.name}
                        checked={p.sections.includes(x.id)}
                        disabled={x.fixed}
                        hint={x.fixed ? 'Sempre incluída' : x.id === 'depoimentos' ? 'Só com relatos reais e autorizados pelos seus clientes' : undefined}
                        aside={x.feature ? `+ ${brl(pricing.byFeature[x.feature])}` : 'Incluído'}
                        onChange={(on) => toggle('sections', x.id, on)}
                      />
                    ))}
                  </div>
                </div>

                <Radios
                  label="Formulário de contato"
                  value={form}
                  options={[
                    { id: 'nenhum', label: 'Sem formulário', hint: 'O botão de WhatsApp já está incluído.', aside: 'Incluído' },
                    { id: FORM_WHATSAPP, label: 'Formulário para WhatsApp', hint: 'Organiza o pedido e abre a conversa com as respostas. Sem mensalidade de plataforma.', aside: `+ ${brl(pricing.byFeature[FORM_WHATSAPP])}` },
                    { id: FORM_EMAIL, label: 'Formulário por e-mail', hint: 'As mensagens chegam no seu e-mail por uma plataforma externa.', aside: `+ ${brl(pricing.byFeature[FORM_EMAIL])}` },
                  ]}
                  onChange={setForm}
                />
                {form === FORM_EMAIL && (
                  <div className={s.infoBox}>
                    <strong>{emailFormNotice.title}</strong>
                    <p style={{ marginTop: 4 }}>{emailFormNotice.body}</p>
                    <p style={{ marginTop: 4 }}>{emailFormNotice.limit}</p>
                    <p style={{ marginTop: 4 }}>{emailFormNotice.separateCost}</p>
                    <Radios label={volumeQuestion} variant="chip" value={p.emailVolume ?? ''} options={volumeOptions.map((v) => ({ id: v.id, label: v.label }))} onChange={(id) => edit({ emailVolume: id })} />
                    {p.emailVolume && <p style={{ marginTop: 8 }}>{volumeOptions.find((v) => v.id === p.emailVolume)!.answer}</p>}
                  </div>
                )}

                <div className={s.block}>
                  <span className={s.blockTitle}>Outros recursos</span>
                  {p.objective === 'agenda' && <p className={s.infoBox} style={{ marginTop: 0, marginBottom: 8 }}>{scopeRules.agendaSolicitacao}</p>}
                  <div className={s.options}>
                    {optional.map((f) => (
                      <Check key={f.id} title={f.name} hint={featureNote[f.id] ?? f.pitch} aside={`+ ${brl(pricing.byFeature[f.id])}`} checked={p.features.includes(f.id)} onChange={(on) => toggle('features', f.id, on)} />
                    ))}
                  </div>
                </div>

                <details className={s.details}>
                  <summary>Categoria do projeto (avançado)</summary>
                  <div className={s.detailsBody}>
                    <label className={s.field}>
                      Categoria
                      <select value={p.type} onChange={(ev) => edit({ type: ev.target.value })}>
                        {siteTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} · {priced(pricing.byType[t.id])}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className={s.hint}>{scopeRules.categoria}</p>
                  </div>
                </details>

                <BudgetTool p={p} edit={edit} replace={replace} setNotice={setNotice} />
              </>
            )}

            {p.step === 3 && <SummaryStep state={state} go={go} origin={origin} />}

            <div className={s.stepActions}>
              {p.step > 0 && (
                <button type="button" className={s.secondary} onClick={() => go(p.step - 1)}>
                  ← Voltar
                </button>
              )}
              {p.step === 1 && (
                <button type="button" className={s.ghost} onClick={() => go(3)}>
                  Pular para o resumo
                </button>
              )}
              {p.step < STEP_COUNT - 1 && (
                <button type="button" className={s.primary} disabled={!ready} onClick={() => go(p.step + 1)}>
                  {['Ver recomendação', 'Ajustar detalhes', 'Ver resumo'][p.step]} →
                </button>
              )}
            </div>
          </div>

          <aside className={s.previewPane} id="previa" aria-label="Prévia do seu site" style={{ scrollMarginTop: 84 }}>
            <div className={s.previewTop}>
              <span>Prévia do seu site</span>
              <span className={s.deviceToggle}>
                <button type="button" aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}>
                  Computador
                </button>
                <button type="button" aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}>
                  Celular
                </button>
              </span>
            </div>
            <div className={s.previewScroll}>
              <ProjectPreview project={p} mobile={device === 'mobile'} />
            </div>
            <p className={s.previewNote}>Prévia demonstrativa: textos e imagens são ilustrativos. O site final usa o seu conteúdo.</p>
            <div className={s.estimateBox} aria-live="polite">
              <span>{diagnosis ? 'Investimento' : 'Desenvolvimento estimado'}</span>
              <strong data-testid="estimate">{investmentLabel(p)}</strong>
              <small>{diagnosis ? 'Definido após o diagnóstico' : `${e.deadline} após receber textos, imagens e logo`}</small>
              <small>Domínio, hospedagem e plataformas à parte</small>
            </div>
          </aside>
        </div>
      </div>

      {barVisible && !typing && (
        <div className={s.mobileBar}>
          <div>
            <span>{diagnosis ? 'Investimento' : 'Estimativa'}</span>
            <strong>{investmentLabel(p)}</strong>
          </div>
          <a className={`${s.secondary} ${s.small}`} href="#previa">
            Prévia
          </a>
          {p.step < STEP_COUNT - 1 ? (
            <button type="button" className={`${s.primary} ${s.small}`} onClick={() => go(p.step + 1)}>
              Continuar
            </button>
          ) : (
            <a className={`${s.primary} ${s.small}`} href="#proximo-passo">
              Próximo passo
            </a>
          )}
        </div>
      )}
    </section>
  );
}

/** Limite de orçamento: compara com a faixa e explica quando pode passar. */
function BudgetTool({ p, edit, replace, setNotice }: { p: Project; edit: (x: Partial<Project>) => void; replace: (x: Project) => void; setNotice: (t: string) => void }) {
  const info = budgetInfo(p);
  const e = projectEstimate(p);
  const spread = Math.round(pricing.rangeSpread * 100);

  // Sugestão: o opcional pago cuja remoção mais reduz a faixa. Nada sai sozinho.
  const removable = p.features.filter((f) => (pricing.byFeature[f] ?? 0) > 0);
  const best = removable
    .map((f) => {
      const next = normalizeProject({ ...p, features: p.features.filter((x) => x !== f), sections: p.sections.filter((id) => sections.find((x) => x.id === id)?.feature !== f) });
      return { f, next, total: projectEstimate(next).total };
    })
    .sort((a, b) => a.total - b.total)[0];
  const showSuggestion = info.status === 'valido' && (info.fit === 'pode_ultrapassar' || info.fit === 'excede');

  return (
    <div className={s.block}>
      <Check title="Quero comparar com um limite de orçamento" hint="O valor fica só no seu resumo e na mensagem que você decidir enviar." checked={p.budgetOn} onChange={(on) => edit({ budgetOn: on })} />
      {p.budgetOn && (
        <div className={s.infoBox}>
          <label className={s.field}>
            Meu limite para o desenvolvimento (R$)
            <input
              inputMode="decimal"
              maxLength={16}
              value={p.budget}
              placeholder="Ex.: 1.200"
              aria-invalid={info.status === 'invalido'}
              aria-describedby="orcamento-status"
              onChange={(ev) => edit({ budget: ev.target.value })}
            />
          </label>
          <p id="orcamento-status" style={{ marginTop: 8 }} aria-live="polite" className={info.status === 'invalido' ? s.fieldError : undefined}>
            {info.status === 'ausente' && 'Informe um valor para comparar com a estimativa.'}
            {info.status === 'invalido' && 'Não reconhecemos esse valor. Use só números, como 1200 ou 1.200,00.'}
            {info.status === 'abaixo' && `O projeto base começa em ${brl(pricing.base)}. Com esse limite, vale conversar sobre o que é possível.`}
            {info.status === 'valido' && info.fit === 'cabe' && `A faixa estimada (${priceLabel(p)}) cabe no seu limite. Custos externos ficam à parte.`}
            {info.status === 'valido' && info.fit === 'pode_ultrapassar' && `Seu limite está dentro da faixa, mas o teto (${brl(e.max)}) pode ultrapassá-lo.`}
            {info.status === 'valido' && info.fit === 'excede' && `Mesmo o início da faixa (${brl(e.min)}) passa do seu limite.`}
            {info.status === 'valido' && info.fit === 'diagnostico' && 'Com itens que dependem de diagnóstico, a comparação é feita depois do levantamento.'}
          </p>
          {showSuggestion && (
            <>
              <p style={{ marginTop: 8 }}>
                Por que é uma faixa: o valor calculado pode variar {spread}% para cima ou para baixo conforme o conteúdo e os detalhes confirmados na conversa.
              </p>
              {best ? (
                <div className={s.actionRow} style={{ alignItems: 'center' }}>
                  <span>
                    Sem “{features.find((x) => x.id === best.f)?.name}”, a faixa fica em {priceLabel(best.next)}.
                  </span>
                  <button
                    type="button"
                    className={`${s.secondary} ${s.small}`}
                    onClick={() => {
                      replace(best.next);
                      setNotice(`“${features.find((x) => x.id === best.f)?.name}” removido a seu pedido. A estimativa foi recalculada.`);
                    }}
                  >
                    Remover este item
                  </button>
                </div>
              ) : (
                <p style={{ marginTop: 8 }}>Revise a identidade visual, as cores próprias e a categoria. Nada é removido sem você confirmar.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
