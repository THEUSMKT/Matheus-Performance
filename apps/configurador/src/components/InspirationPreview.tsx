import s from './Upgrade.module.css';

type Model = {
  label: string;
  title: string;
  detail: string;
  nav: string;
  kind: 'realestate' | 'restaurant' | 'clinic' | 'architecture' | 'fitness';
};

// Mesma ordem dos segmentos exibidos no carrossel (sem "Outro segmento").
const models: Model[] = [
  { label: 'SERVIÇOS LOCAIS', title: 'Sua casa bem cuidada, sem complicação.', detail: 'Reparos · Instalações · Contato', nav: 'Serviços', kind: 'fitness' },
  { label: 'BELEZA E BEM-ESTAR', title: 'Um tempo para você. Um cuidado só seu.', detail: 'Tratamentos · Agenda · Contato', nav: 'Agendar', kind: 'clinic' },
  { label: 'CONSULTORIA', title: 'Clareza para dar o próximo passo.', detail: 'Serviços · Método · Contato', nav: 'Sobre', kind: 'realestate' },
  { label: 'PORTFÓLIO CRIATIVO', title: 'Boas ideias merecem ganhar forma.', detail: 'Projetos · Processo · Contato', nav: 'Projetos', kind: 'architecture' },
  { label: 'ALIMENTAÇÃO', title: 'Feito com calma. Servido com afeto.', detail: 'Cardápio · Encomendas · Localização', nav: 'Cardápio', kind: 'restaurant' },
];

// Só elementos de texto (span): a miniatura fica dentro do botão do card.
export function InspirationPreview({ index }: { index: number }) {
  const model = models[index % models.length];
  return <span className={`${s.inspiration} ${s['inspiration_' + model.kind]}`}>
    <span className={s.inspirationBar}><span>● ● ●</span><small>www.suaempresa.com.br</small><b>↗</b></span>
    <span className={s.inspirationNav}><strong>{model.label}</strong><span>Início&nbsp;&nbsp; {model.nav}&nbsp;&nbsp; Contato</span><i>Menu</i></span>
    <span className={s.inspirationHero}><span className={s.inspirationCopy}><small>{model.label} · EXPERIÊNCIA DIGITAL</small><span className={s.inspirationTitle}>{model.title}</span><span className={s.inspirationButton}>Conhecer mais ↗</span></span><span className={s.inspirationArt}><i/><i/><i/></span></span>
    <span className={s.inspirationHighlights}><span><b>01</b>Experiência</span><span><b>02</b>Detalhes</span><span><b>03</b>Contato</span></span>
    <span className={s.inspirationFoot}>{model.detail}</span>
  </span>;
}

