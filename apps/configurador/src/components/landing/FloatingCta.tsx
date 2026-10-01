"use client";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { track } from "@/lib/analytics";
import { builderHref } from "./Chrome";
import f from "./FloatingCta.module.css";

export function FloatingCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function check() {
      const scrolled = window.scrollY + window.innerHeight;
      const threshold = document.documentElement.scrollHeight * 0.8;
      setShow(scrolled >= threshold);
    }
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
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
          <span className={f.labelFull}>Site simples? Crie uma prévia grátis</span>
          <span className={f.labelShort}>Prévia grátis</span>
        </a>
      </div>
      <div className={f.spacer} aria-hidden="true" />
    </>
  );
}
