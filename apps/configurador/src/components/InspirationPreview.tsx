import s from './Upgrade.module.css';

type Model = {
  label: string;
  title: string;
  detail: string;
  kind: 'realestate' | 'restaurant' | 'clinic' | 'architecture' | 'fitness';
};

const models: Model[] = [
  { label: 'IMOBILIÁRIA', title: 'Imóveis que combinam com a sua próxima fase.', detail: 'Busca · Destaques · Mapa', kind: 'realestate' },
  { label: 'GASTRONOMIA', title: 'Uma experiência que começa antes da mesa.', detail: 'Cardápio · Reservas · Galeria', kind: 'restaurant' },
  { label: 'CLÍNICA', title: 'Cuidado que inspira confiança desde o primeiro clique.', detail: 'Especialidades · Agenda · Equipe', kind: 'clinic' },
  { label: 'ARQUITETURA', title: 'Espaços que traduzem a sua forma de viver.', detail: 'Portfólio · Projetos · Contato', kind: 'architecture' },
  { label: 'FITNESS', title: 'Treino com método. Evolução com direção.', detail: 'Planos · Resultados · Aula teste', kind: 'fitness' },
];

export function InspirationPreview({ index }: { index: number }) {
  const model = models[index % models.length];
  return <div className={`${s.inspiration} ${s['inspiration_' + model.kind]}`}>
    <div className={s.inspirationBar}><span>● ● ●</span><small>www.suaempresa.com.br</small><b>↗</b></div>
    <div className={s.inspirationNav}><strong>{model.label}</strong><span>Início&nbsp;&nbsp; Projetos&nbsp;&nbsp; Contato</span><i>Menu</i></div>
    <div className={s.inspirationHero}><div><small>{model.label} · EXPERIÊNCIA DIGITAL</small><h3>{model.title}</h3><button>Conhecer mais ↗</button></div><div className={s.inspirationArt}><i/><i/><i/></div></div>
    <div className={s.inspirationHighlights}><span><b>01</b>Experiência</span><span><b>02</b>Detalhes</span><span><b>03</b>Contato</span></div>
    <div className={s.inspirationFoot}>{model.detail}</div>
  </div>;
}
