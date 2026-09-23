import { pricing, brl } from '../config/pricing';
import { features } from '../config/features';
import { contact } from '../config/contact';
import { estimate } from './estimate';
import { emptySelection, type Selection } from './types';
export const segments = [
    { id: 'local', name: 'Serviços locais', demo: 'Oficina do Lar', title: 'Sua casa bem cuidada, sem complicação.', intro: 'Reparos e soluções para deixar cada ambiente pronto para o seu dia a dia.', services: ['Pequenos reparos', 'Instalações', 'Manutenção preventiva'], label: 'Cuidado em cada detalhe' },
    { id: 'beleza', name: 'Beleza e bem-estar', demo: 'Ateliê Aurora', title: 'Um tempo para você. Um cuidado só seu.', intro: 'Beleza e bem-estar com atenção ao seu estilo e à sua rotina.', services: ['Cuidados faciais', 'Beleza natural', 'Rituais de bem-estar'], label: 'Seu momento de cuidado' },
    { id: 'consultoria', name: 'Consultoria e autônomos', demo: 'Clara Consultoria', title: 'Clareza para dar o próximo passo.', intro: 'Orientação próxima para organizar prioridades e transformar ideias em um plano de ação.', services: ['Diagnóstico inicial', 'Planejamento', 'Acompanhamento'], label: 'Ideias que ganham direção' },
    { id: 'criativo', name: 'Portfólio criativo', demo: 'Estúdio Forma', title: 'Boas ideias merecem ganhar forma.', intro: 'Design e direção criativa para marcas com algo próprio a dizer.', services: ['Identidade visual', 'Design editorial', 'Direção de arte'], label: 'Design com intenção' },
    { id: 'alimentacao', name: 'Alimentação', demo: 'Casa Oliva', title: 'Feito com calma. Servido com afeto.', intro: 'Receitas da casa, ingredientes da estação e uma boa razão para reunir quem você gosta.', services: ['Pratos da casa', 'Opções da estação', 'Encomendas especiais'], label: 'Sabores para compartilhar' },
    { id: 'outro', name: 'Outro segmento', demo: 'Seu Negócio · demonstração', title: 'O que você precisa, com atenção de verdade.', intro: 'Conheça nossos serviços e encontre a solução que faz sentido para você.', services: ['Atendimento personalizado', 'Soluções sob medida', 'Acompanhamento'], label: 'Seu negócio, bem apresentado' },
] as const;
export const objectives = [
    { id: 'orcamento', name: 'Receber pedidos de orçamento', cta: 'Pedir um orçamento' },
    { id: 'servicos', name: 'Apresentar meus serviços', cta: 'Conhecer os serviços' },
    { id: 'agenda', name: 'Facilitar solicitações de agendamento', cta: 'Solicitar um horário' },
    { id: 'trabalhos', name: 'Mostrar meus trabalhos', cta: 'Ver trabalhos' },
    { id: 'localizacao', name: 'Apresentar meu negócio e localização', cta: 'Ver localização' },
] as const;
export const directions = [
    { id: 'essencial', name: 'Essencial', template: 'minimal', style: 'minimalista', description: 'Linhas limpas, leitura direta e espaço para respirar.' },
    { id: 'elegante', name: 'Elegante', template: 'elegance', style: 'elegante', description: 'Tipografia editorial, tons suaves e detalhes delicados.' },
    { id: 'marcante', name: 'Marcante', template: 'bold', style: 'criativo', description: 'Títulos fortes, contraste e composição expressiva.' },
] as const;
export const palettes = [
    { id: 'roxo', name: 'Violeta', accent: '#6650b5', bg: '#f6f3fc' },
    { id: 'verde', name: 'Oliva', accent: '#485d44', bg: '#f2f3ea' },
    { id: 'azul', name: 'Oceano', accent: '#285c79', bg: '#eff5f8' },
    { id: 'terracota', name: 'Argila', accent: '#a44932', bg: '#fbf2eb' },
] as const;
export const sections = [
    { id: 'apresentacao', name: 'Apresentação', feature: null, fixed: true },
    { id: 'servicos', name: 'Serviços', feature: null, fixed: false },
    { id: 'sobre', name: 'Sobre o negócio', feature: null, fixed: false },
    { id: 'galeria', name: 'Galeria', feature: 'galeria', fixed: false },
    { id: 'depoimentos', name: 'Depoimentos', feature: 'depoimentos', fixed: false },
    { id: 'faq', name: 'Perguntas frequentes', feature: 'faq', fixed: false },
    { id: 'localizacao', name: 'Localização', feature: 'mapa', fixed: false },
    { id: 'contato', name: 'Contato', feature: null, fixed: true },
] as const;
export const externalFeatures = ['formularioEmail', 'agendamento', 'instagram'];
export const KEY = 'mb.configurador.v2';
export type Project = {
    version: 2;
    name: string;
    description: string;
    segment: string;
    objective: string;
    sections: string[];
    direction: string;
    palette: string;
    custom: string | null;
    font: string;
    features: string[];
    type: string;
    legacyTemplate?: string;
    legacyStyle?: string;
    emailVolume: string | null;
    step: number;
};
export function initialProject(): Project { return { version: 2, name: '', description: '', segment: 'consultoria', objective: 'orcamento', sections: ['apresentacao', 'servicos', 'sobre', 'contato'], direction: 'essencial', palette: 'roxo', custom: null, font: 'auto', features: ['whatsapp', 'redes'], type: 'landing', emailVolume: null, step: 0 }; }
const record = (x: unknown): Record<string, unknown> => x !== null && typeof x === 'object' && !Array.isArray(x) ? x as Record<string, unknown> : {};
const cleanText = (x: unknown, max: number) => typeof x === 'string' ? x.replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, max) : '';
const pick = (x: unknown, ids: readonly string[], fallback: string) => typeof x === 'string' && ids.includes(x) ? x : fallback;
export function normalizeProject(input: unknown): Project {
    const x = record(input), d = initialProject();
    if (x.version !== 2)
        return d;
    const chosen = Array.isArray(x.sections) ? [...new Set(x.sections.filter((s): s is string => typeof s === 'string' && sections.some(a => a.id === s)))] : d.sections;
    for (const s of sections.filter(s => s.fixed))
        if (!chosen.includes(s.id))
            chosen.push(s.id);
    let selected = Array.isArray(x.features) ? [...new Set(x.features.filter((f): f is string => typeof f === 'string' && features.some(a => a.id === f)))] : d.features;
    selected = selected.filter(f => !sections.some(s => s.feature === f));
    chosen.forEach(id => { const f = sections.find(s => s.id === id)?.feature; if (f)
        selected.push(f); });
    for (const f of ['whatsapp', 'redes'])
        if (!selected.includes(f))
            selected.push(f);
    return { ...d, name: cleanText(x.name, 80), description: cleanText(x.description, 280), segment: pick(x.segment, segments.map(s => s.id), d.segment), objective: pick(x.objective, objectives.map(o => o.id), d.objective), sections: chosen, features: selected, direction: pick(x.direction, directions.map(s => s.id), d.direction), palette: pick(x.palette, palettes.map(s => s.id), d.palette), custom: typeof x.custom === 'string' && /^#[0-9a-f]{6}$/i.test(x.custom) ? x.custom : null, font: pick(x.font, ['auto', 'sans', 'serif'], 'auto'), type: pick(x.type, Object.keys(pricing.byType), 'landing'), legacyTemplate: typeof x.legacyTemplate === 'string' && Object.hasOwn(pricing.byTemplate, x.legacyTemplate) ? x.legacyTemplate : undefined, legacyStyle: typeof x.legacyStyle === 'string' && Object.hasOwn(pricing.byStyle, x.legacyStyle) ? x.legacyStyle : undefined, emailVolume: typeof x.emailVolume === 'string' && ['ate50', 'mais50', 'naoSei'].includes(x.emailVolume) ? x.emailVolume : null, step: typeof x.step === 'number' && Number.isInteger(x.step) ? Math.max(0, Math.min(5, x.step)) : 0 };
}
export function migrateLegacy(input: unknown): Project {
    const x = record(record(input).selection), d = initialProject();
    if (!Object.keys(x).length)
        return d;
    const fs = Array.isArray(x.features) ? x.features : [];
    return normalizeProject({ ...d, name: x.company, type: x.type, legacyTemplate: x.template, legacyStyle: x.style, palette: x.color, custom: record(x.customColor).accent, features: fs, sections: [...d.sections, ...sections.filter(s => s.feature && fs.includes(s.feature)).map(s => s.id)], emailVolume: x.emailVolume });
}
export function selectionFor(p: Project): Selection {
    const d = directions.find(d => d.id === p.direction)!;
    return { ...emptySelection, type: p.type, template: p.legacyTemplate ?? d.template, style: p.legacyStyle ?? d.style, color: p.palette, customColor: p.custom ? { accent: p.custom, bg: '#faf9f6' } : null, font: p.font, features: p.features, company: p.name, emailVolume: p.emailVolume };
}
export function projectEstimate(p: Project) { return estimate(selectionFor(p)); }
export function priceLabel(p: Project) { const e = projectEstimate(p); return `${brl(e.min)} – ${brl(e.max)}`; }
export function directionPrice(id: string) { const d = directions.find(d => d.id === id)!; return pricing.byTemplate[d.template] + pricing.byStyle[d.style]; }
export function recommendations(p: Project): string[] { return [...new Set(['apresentacao', 'servicos', 'sobre', ...(p.segment === 'criativo' || p.objective === 'trabalhos' ? ['galeria'] : []), ...(p.segment === 'local' || p.segment === 'alimentacao' || p.objective === 'localizacao' ? ['localizacao'] : []), 'contato'])]; }
export function exampleProject(id: string): Project {
    const p = normalizeProject({ ...initialProject(), segment: id, objective: id === 'criativo' ? 'trabalhos' : id === 'beleza' ? 'agenda' : id === 'alimentacao' ? 'localizacao' : 'orcamento', direction: id === 'beleza' || id === 'alimentacao' ? 'elegante' : id === 'criativo' ? 'marcante' : 'essencial', palette: id === 'alimentacao' ? 'verde' : id === 'beleza' ? 'terracota' : 'roxo' });
    return normalizeProject({ ...p, sections: recommendations(p) });
}
export function shareLink(p: Project) {
    const { name: _n, description: _d, ...safe } = normalizeProject(p);
    return `${contact.siteUrl}/#projeto=${encodeURIComponent(JSON.stringify({ ...safe, step: 5 }))}`;
}
export function fromShare(hash: string): Project | null {
    if (!hash.startsWith('#projeto='))
        return null;
    if (hash.length > 6000)
        throw Error('Link muito longo');
    const data = JSON.parse(decodeURIComponent(hash.slice(9)));
    if (record(data).version !== 2)
        throw Error('Versão de link não reconhecida');
    return normalizeProject({ ...record(data), name: '', description: '' });
}
export function contrastInk(hex: string) {
    const rgb = hex.slice(1).match(/../g)!.map(v => parseInt(v, 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    const l = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    return (l + 0.05) / 0.05 >= 4.5 ? '#000000' : '#ffffff';
}
export function projectMessage(p: Project) {
    return [contact.whatsappIntro, p.name ? `Negócio: ${p.name}` : 'Negócio: a informar', `Segmento: ${segments.find(s => s.id === p.segment)!.name}`, p.description ? `Descrição: ${p.description}` : '', `Objetivo: ${objectives.find(o => o.id === p.objective)!.name}`, `Estrutura: ${p.features.includes('paginaExtra') ? 'página principal + 1 página adicional' : 'página principal'}; seções: ${sections.filter(s => p.sections.includes(s.id)).map(s => s.name).join(', ')}`, `Tipo comercial: ${p.type}`, `Identidade: ${directions.find(d => d.id === p.direction)!.name}; ${p.custom ?? p.palette}; fonte ${p.font}${p.legacyTemplate ? `; modelo anterior ${p.legacyTemplate}/${p.legacyStyle}` : ''}`, `Recursos: ${features.filter(f => p.features.includes(f.id)).map(f => f.name).join(', ')}`, p.features.includes('formularioEmail') ? `Volume de contatos: ${p.emailVolume ?? 'a definir'}` : '', `Desenvolvimento estimado: ${priceLabel(p)}. Valor final depende da confirmação do escopo.`, `Prazo estimado: ${projectEstimate(p).deadline}, após receber textos, imagens e logo. Duas rodadas de ajustes antes da publicação.`, `Custos externos à parte: domínio, hospedagem e plataformas. Integrações dependem de avaliação.`, `Configuração (sem nome e descrição): ${shareLink(p)}`, contact.whatsappOutro].filter(Boolean).join('\n\n');
}
