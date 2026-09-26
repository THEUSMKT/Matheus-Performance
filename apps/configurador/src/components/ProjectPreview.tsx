import type { CSSProperties } from 'react';
import { contrastInk, objectives, palettes, segments, type Project } from '@/lib/project';
import s from './Upgrade.module.css';
export function ProjectPreview({ project: p, compact = false, mobile = false, bare = false }: {
    project: Project;
    compact?: boolean;
    mobile?: boolean;
    /** Sem barra de navegador nem borda — para usar dentro de uma moldura de celular. */
    bare?: boolean;
}) {
    const segment = segments.find(a => a.id === p.segment)!, palette = palettes.find(a => a.id === p.palette)!, accent = p.custom ?? palette.accent;
    const vars = { '--preview-accent': accent, '--preview-on': contrastInk(accent), '--preview-bg': palette.bg, '--preview-font': p.font === 'serif' || (p.font === 'auto' && p.direction === 'elegante') ? 'Georgia, serif' : 'Arial, sans-serif' } as CSSProperties;
    return <div className={`${s.browser} ${mobile ? s.phone : ''} ${compact ? s.compact : ''} ${bare ? s.bare : ''}`} style={vars}>
 {!bare && <div className={s.browserBar}><span aria-hidden="true">● ● ●</span><span>seu futuro site</span><span aria-hidden="true">↗</span></div>}<div className={`${s.site} ${s[p.direction]}`}>
 <div className={s.siteNav}><strong>{p.name || segment.demo}</strong><span>Serviços <b>↗</b></span></div>
 <div className={s.siteHero}><div><span className={s.siteLabel}>{segment.label}</span><h3>{segment.title}</h3><p>{p.description || segment.intro}</p><span className={s.previewCta}>{objectives.find(o => o.id === p.objective)!.cta} ↗</span></div><div className={`${s.art} ${s['art_' + p.segment]}`} aria-label="Composição gráfica demonstrativa"><span className={s.artOrb}/><span className={s.artArch}/><span className={s.artStem}/><span className={s.artCaption}>{p.segment === 'alimentacao' ? 'à mesa' : p.segment === 'criativo' ? 'forma & ideia' : p.segment === 'beleza' ? 'respire.' : 'feito para você'}</span></div></div>
 {p.sections.includes('servicos') && <div className={s.siteServices}>{segment.services.map((name, i) => <div key={name}><span>0{i + 1}</span><h4>{name}</h4><p>{['Uma conversa para entender o que você precisa.', 'Uma proposta pensada para a sua rotina.', 'Atenção aos detalhes do início ao fim.'][i]}</p></div>)}</div>}
 {!compact && <>
 {p.sections.includes('sobre') && <div className={s.siteSection}><span className={s.siteLabel}>Sobre o negócio</span><h4>Proximidade em cada escolha.</h4><p>Este espaço vai contar a história de {p.name || segment.demo}, sua forma de trabalhar e o que torna seu atendimento especial.</p></div>}
 {p.sections.includes('galeria') && <div className={s.siteSection}><h4>{p.segment === 'criativo' ? 'Trabalhos selecionados' : 'Um pouco do nosso universo'}</h4><div className={s.gallery}>{segment.services.map((a, i) => <div key={a}><span aria-hidden="true">{['◒', '◧', '◯'][i]}</span>{a}</div>)}</div><small>Composições ilustrativas. Fotos reais serão fornecidas por você.</small></div>}
 {p.sections.includes('depoimentos') && <div className={s.siteSection}><h4>A experiência dos seus clientes</h4><p>Espaço reservado para depoimentos reais, com autorização dos clientes. Nenhuma avaliação demonstrativa.</p></div>}
 {p.sections.includes('faq') && <div className={s.siteSection}><h4>Perguntas frequentes</h4><p>Como funciona o atendimento? +</p><p>O que preciso para começar? +</p><small>Perguntas demonstrativas; respostas serão definidas com você.</small></div>}
 {p.sections.includes('localizacao') && <div className={s.siteSection}><h4>Venha nos conhecer</h4><div className={s.map}>⌖ Seu endereço e área de atendimento</div><small>Mapa ilustrativo. Endereço a informar.</small></div>}
 {p.features.includes('catalogo') && <div className={s.siteSection}><h4>{p.segment === 'alimentacao' ? 'Do nosso cardápio' : 'Nosso catálogo'}</h4>{segment.services.map(a => <p key={a}>{a} · Consulte detalhes</p>)}<small>Catálogo demonstrativo. Sem carrinho ou pagamento online.</small></div>}
 {p.features.includes('formularioWhatsapp') && <div className={s.siteSection}><h4>Conte o que você precisa</h4><p>Nome · Sua necessidade · Enviar pelo WhatsApp</p><small>Representação de formulário. Nenhum dado é enviado nesta prévia.</small></div>}
 {p.features.includes('formularioEmail') && <div className={s.siteSection}><h4>Envie sua mensagem</h4><p>Nome · E-mail · Mensagem</p><small>Representação visual; serviço de envio a configurar.</small></div>}
 {p.features.includes('agendamento') && <div className={s.siteSection}><h4>Planeje sua visita</h4><p>Disponibilidade e plataforma de reservas a definir. Integração sujeita a avaliação.</p></div>}
 {p.features.includes('instagram') && <div className={s.siteSection}><h4>Acompanhe as novidades</h4><p>Espaço reservado para integração com o Instagram, sujeito à plataforma.</p></div>}
 <div className={s.siteContact}><h4>Vamos conversar?</h4><span className={s.previewCta}>{objectives.find(o => o.id === p.objective)!.cta} ↗</span>{p.objective === 'agenda' && !p.features.includes('agendamento') && <small>Solicitação pelo WhatsApp, sem confirmação automática de horário.</small>}</div></>}
 <div className={s.demoLabel}>CONCEITO DEMONSTRATIVO · TEXTOS E ELEMENTOS ILUSTRATIVOS</div></div></div>;
}
