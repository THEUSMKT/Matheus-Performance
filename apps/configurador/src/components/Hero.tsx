import { ButtonLink } from './ui/Button';
import { HeroPreview } from './HeroPreview';
import { Icon } from './ui/Icon';

export function Hero() {
  return (
    <section id="topo" className="pb-4 pt-12 sm:pt-16 lg:pb-10 lg:pt-20">
      <div className="wrap grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-14">
        <div>
          {/* O tracking apertado do display deixa o ponto solto: o span puxa
              a pontuação de volta para junto da palavra. */}
          <h1 className="text-display font-extrabold [&_i]:not-italic [&_i]:-ml-[0.055em]">
            Monte seu site<i>.</i>
            <br />
            Veja quanto custa<i>.</i>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Escolha o estilo, as cores e o que o site precisa fazer. A estimativa de
            valor e prazo aparece na hora.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#configurador" size="lg">
              Montar meu site
              <Icon name="ArrowRight" className="size-5" strokeWidth={2.25} />
            </ButtonLink>
            <ButtonLink href="#modelos" size="lg" variant="secondary">
              Ver modelos
            </ButtonLink>
          </div>

          <p className="mt-5 text-sm text-muted">
            Sem compromisso · o orçamento sai pelo WhatsApp
          </p>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}
