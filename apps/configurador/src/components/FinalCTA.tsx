import { ButtonLink } from './ui/Button';
import { Icon } from './ui/Icon';

export function FinalCTA() {
  return (
    <section className="py-16 sm:py-24">
      <div className="wrap">
        <div className="brand-gradient-deep relative overflow-hidden rounded-xl px-7 py-14 text-center sm:px-12 sm:py-20">
          {/* Brilho discreto atrás do título, só para dar profundidade. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-1/2 left-1/2 size-[520px] -translate-x-1/2 rounded-full opacity-45 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,.55), transparent 62%)' }}
          />

          <div className="relative">
            <h2 className="mx-auto max-w-xl text-section font-bold text-white">
              Seu negócio merece um site profissional.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[1.0625rem] leading-relaxed text-white/85">
              Monte sua ideia agora e receba uma estimativa de valor e prazo.
            </p>

            <ButtonLink
              href="#configurador"
              size="lg"
              variant="inverse"
              className="mt-8"
            >
              Criar meu site
              <Icon name="ArrowRight" className="size-5" strokeWidth={2.25} />
            </ButtonLink>

            <p className="mt-4 text-sm text-white/85">Leva menos de 3 minutos.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
