import { faq } from '@/config/faq';
import { Icon } from './ui/Icon';

export function FAQ() {
  return (
    <section id="perguntas" className="scroll-mt-20 py-16 sm:py-24">
      <div className="wrap grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
        <div>
          <h2 className="text-section font-bold">Antes de você perguntar.</h2>
          <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">
            Se ficar alguma dúvida, me chame no WhatsApp.
          </p>
        </div>

        <div className="divide-y divide-line border-y border-line">
          {faq.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer list-none items-center gap-4 py-5 text-[1.0625rem] font-semibold tracking-[-0.02em] [&::-webkit-details-marker]:hidden">
                {item.q}
                <Icon
                  name="ChevronDown"
                  className="ml-auto size-5 flex-none text-muted transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="max-w-prose pb-5 text-[0.9375rem] leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
