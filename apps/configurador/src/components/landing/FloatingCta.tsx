"use client";
/* ==========================================================================
   Botão flutuante "Gerar minha prévia gratuita" (celular e tablet; no
   computador o cabeçalho já mantém o botão à vista).

   Aparece quando nenhuma "zona de ação" está na tela — o bloco do botão
   principal do topo, a chamada final ou o topo de uma página interna,
   marcados com data-cta-zone — observando a visibilidade, sem número fixo
   de pixels. Some com o menu do celular aberto. Fica perto da base, com
   margens e a área segura do aparelho; um espaçador no fim da página evita
   que ele cubra o último conteúdo. Escondido, não recebe foco nem toque.
   Leva à página de criação: a prévia salva continua de onde parou.
   ========================================================================== */
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { track } from "@/lib/analytics";
import { builderHref } from "./Chrome";
import f from "./FloatingCta.module.css";

export function FloatingCta({ label }: { label: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const zones = [...document.querySelectorAll("[data-cta-zone]")];
    if (!zones.length || typeof IntersectionObserver === "undefined") return;
    const visible = new Map<Element, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target, e.isIntersecting);
        // Só depois de conhecer todas as zonas, e só se nenhuma estiver à vista.
        setShow(
          visible.size === zones.length &&
            [...visible.values()].every((v) => !v),
        );
      },
      { threshold: 0 },
    );
    zones.forEach((z) => io.observe(z));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div
        className={f.float}
        data-show={show ? "" : undefined}
        aria-hidden={!show}
        data-floating-cta=""
      >
        <a
          href={builderHref}
          tabIndex={show ? undefined : -1}
          onClick={() => track("start_click", { context: "flutuante" })}
        >
          <Sparkles aria-hidden="true" />
          <span>{label}</span>
        </a>
      </div>
      {/* Espaço reservado no fim da página: o botão nunca cobre o último conteúdo. */}
      <div className={f.spacer} aria-hidden="true" />
    </>
  );
}
