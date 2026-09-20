const steps = [
  { n: '01', title: 'Você escolhe', text: 'Estrutura, estilo, cores e funcionalidades, em seis telas.' },
  { n: '02', title: 'Eu desenho', text: 'Suas escolhas viram um projeto pronto para aprovação.' },
  { n: '03', title: 'Seu site no ar', text: 'Publicado no seu endereço, com duas rodadas de ajuste.' },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-20 py-16 sm:py-24">
      <div className="wrap">
        <h2 className="max-w-lg text-section font-bold">Seu site em três passos.</h2>

        <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n} className="bg-surface p-7 sm:p-8">
              <span className="tnum block text-sm font-semibold text-brand">{step.n}</span>
              <h3 className="mt-5 text-xl font-bold tracking-[-0.025em]">{step.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
