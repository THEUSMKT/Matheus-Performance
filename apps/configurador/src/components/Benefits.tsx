import { Icon } from './ui/Icon';

const items = [
  { icon: 'Smartphone', label: 'Feito para o celular primeiro' },
  { icon: 'PenLine', label: 'Escrito para a sua marca' },
  { icon: 'MessageCircle', label: 'Cliente falando com você' },
  { icon: 'Sparkles', label: 'Acompanhamento até publicar' },
];

export function Benefits() {
  return (
    <section aria-label="O que está incluído" className="border-y border-line bg-surface">
      <ul className="wrap grid gap-x-8 gap-y-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3 text-[0.9375rem] text-muted">
            <Icon name={item.icon} className="size-[18px] flex-none text-brand" strokeWidth={2} />
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
