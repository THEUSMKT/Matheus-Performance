/* ==========================================================================
   Matheus Beck — interações da landing page
   Vanilla JS + GSAP/ScrollTrigger (carregados via CDN, com fallback).
   ▸ Para personalizar número de WhatsApp e e-mail, edite CONFIG logo abaixo.
   ========================================================================== */

const CONFIG = {
  // Somente números, com DDI + DDD. Ex.: 5551999999999
  whatsapp: '5551999999999',
  // E-mail usado no fallback do formulário
  email: 'contato@seudominio.com.br',
  // Mensagem padrão quando o botão não tiver data-wa
  mensagemPadrao: 'Olá, Matheus! Vim pelo site e quero falar sobre tráfego pago.'
};

(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';

  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ── 1. WhatsApp: monta todos os links a partir do data-wa ─────────────── */
  const waURL = (msg) =>
    `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg || CONFIG.mensagemPadrao)}`;

  $$('[data-wa]').forEach((el) => {
    el.setAttribute('href', waURL(el.dataset.wa));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  /* ── 2. Ano no rodapé ──────────────────────────────────────────────────── */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ── 3. Navegação ──────────────────────────────────────────────────────── */
  const nav = $('#nav');
  const burger = $('#navBurger');

  const onScrollNav = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
  onScrollNav();

  burger?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  $$('#navMenu a').forEach((a) =>
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    })
  );

  /* ── 4. Barra de progresso de leitura ──────────────────────────────────── */
  const bar = $('#progressBar');
  const onScrollProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScrollNav(); onScrollProgress(); ticking = false; });
  }, { passive: true });
  onScrollProgress();

  /* ── 5. Cursor personalizado (apenas desktop com mouse) ────────────────── */
  const cursor = $('#cursor');
  if (cursor && window.matchMedia('(hover:hover) and (min-width:901px)').matches && !reduced) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY; cursor.classList.add('is-on');
    }, { passive: true });

    const loop = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    $$('a, button, .card, .plan, .faq__q').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-big'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-big'));
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));
  }

  /* ── 6. Split de palavras para os títulos com máscara ──────────────────── */
  const splitWords = (el) => {
    if (el.dataset.split === 'done') return [];
    const out = [];

    const wrap = (node) => {
      const w = document.createElement('span');
      w.className = 'word';
      const inner = document.createElement('span');
      inner.className = 'word__i';
      inner.appendChild(node);
      w.appendChild(inner);
      out.push(inner);
      return w;
    };

    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parts = node.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((p) => {
          if (!p.trim()) { frag.appendChild(document.createTextNode(p)); return; }
          frag.appendChild(wrap(document.createTextNode(p)));
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        el.replaceChild(wrap(node.cloneNode(true)), node);
      }
    });

    el.dataset.split = 'done';
    return out;
  };

  document.documentElement.classList.add('js-anim');
  if (!hasGSAP || reduced) document.documentElement.classList.add('no-gsap');

  // Revela um elemento no modo fallback (CSS puro)
  const showCSS = (el, delay = 0) => {
    if (!el) return;
    el.style.transitionDelay = `${delay}ms`;
    requestAnimationFrame(() => el.classList.add('is-in'));
  };

  /* ── 7. Contadores animados ────────────────────────────────────────────── */
  const runCounter = (el) => {
    if (el.dataset.done === '1') return;
    el.dataset.done = '1';
    const target = parseFloat(el.dataset.count) || 0;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const dur = reduced ? 0 : 1600;
    const start = performance.now();
    const fmt = (v) => prefix + v.toLocaleString('pt-BR') + suffix;

    if (!dur) { el.textContent = fmt(target); return; }

    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ── 8. Sequência coreografada do HERO (~2,5s) ─────────────────────────── */
  const heroTitle = $('#heroTitle');
  const heroWords = heroTitle ? splitWords(heroTitle) : [];
  const shimmer = $('.shimmer');

  const playHero = () => {
    const els = ['#heroEyebrow', '#heroSub', '#heroActions', '#heroProof', '#heroScroll']
      .map((s) => $(s)).filter(Boolean);

    if (reduced || !hasGSAP) {
      // Fallback coreografado só com CSS, mantendo o mesmo ritmo da versão GSAP.
      const step = reduced ? 0 : 1;
      showCSS($('#heroImg'), 0);
      showCSS($('#heroEyebrow'), 400 * step);
      heroWords.forEach((w, i) => {
        w.style.transitionDelay = `${(700 + i * 80) * step}ms`;
        requestAnimationFrame(() => (w.style.transform = 'none'));
      });
      heroWords.forEach((w) => requestAnimationFrame(() => (w.style.opacity = 1)));
      showCSS($('#heroSub'), 1400 * step);
      showCSS($('#heroActions'), 1800 * step);
      showCSS($('#heroRule'), 2100 * step);
      showCSS($('#heroProof'), 2100 * step);
      showCSS($('#heroScroll'), 2400 * step);
      setTimeout(() => {
        shimmer?.classList.add('is-lit');
        $$('#heroProof .counter').forEach(runCounter);
      }, 1250 * step);
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('#heroImg',
        { autoAlpha: 0, filter: 'brightness(.6) contrast(1.05) saturate(.92) blur(20px)', scale: 1.14 },
        { autoAlpha: 1, filter: 'brightness(.6) contrast(1.05) saturate(.92) blur(0px)', scale: 1.02,
          duration: 1.6, ease: 'power2.out' })
      .fromTo('#heroEyebrow',
        { autoAlpha: 0, letterSpacing: '.1em', y: 10 },
        { autoAlpha: 1, letterSpacing: '.32em', y: 0, duration: 1 }, 0.4)
      .fromTo(heroWords,
        { yPercent: 118, autoAlpha: 0, filter: 'blur(6px)' },
        { yPercent: 0, autoAlpha: 1, filter: 'blur(0px)', duration: .9, stagger: .08 }, 0.7)
      .add(() => shimmer?.classList.add('is-lit'), 1.25)
      .fromTo('#heroSub', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: .9 }, 1.4)
      .fromTo('#heroActions', { autoAlpha: 0, scale: .95, y: 12 },
        { autoAlpha: 1, scale: 1, y: 0, duration: .7, ease: 'back.out(1.6)' }, 1.8)
      .fromTo('#heroRule', { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 2.1)
      .fromTo('#heroProof', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .8 }, 2.1)
      .add(() => $$('#heroProof .counter').forEach(runCounter), 2.15)
      .fromTo('#heroScroll', { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: .8 }, 2.4);
  };

  /* ── 9. Ken Burns + parallax do hero ───────────────────────────────────── */
  const heroFX = () => {
    const img = $('#heroImg');
    if (!img || reduced || !hasGSAP) return;

    gsap.to(img, { scale: 1.1, duration: 20, ease: 'none', repeat: -1, yoyo: true, delay: 1.6 });

    if (window.ScrollTrigger) {
      gsap.to(img, {
        yPercent: 12, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero__content', {
        yPercent: 18, autoAlpha: .2, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
  };

  /* ── 10. Animações de entrada ao rolar ─────────────────────────────────── */
  const setupScrollReveals = () => {
    const titles = $$('.reveal-words').filter((t) => t.id !== 'heroTitle');

    if (reduced || !hasGSAP || !window.ScrollTrigger) {
      // Fallback: revela tudo assim que entra na viewport (ou de imediato).
      const io = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries, obs) => {
            entries.forEach((e) => {
              if (!e.isIntersecting) return;
              const el = e.target;
              showCSS(el, Number(el.dataset.delay || 0));
              $$('.counter', el).forEach(runCounter);
              if (el.classList.contains('counter')) runCounter(el);
              if (el.classList.contains('reveal-words')) {
                $$('.word__i', el).forEach((w, i) => showCSS(w, i * 45));
              }
              obs.unobserve(el);
            });
          }, { rootMargin: '0px 0px -12% 0px' })
        : null;

      titles.forEach((t) => splitWords(t));
      $$('.stagger').forEach((g) =>
        Array.from(g.children).forEach((c, i) => (c.dataset.delay = i * 90)));

      $$('.reveal, .reveal-words, .stagger > *, .counter').forEach((el) => {
        if (io) io.observe(el);
        else { el.classList.add('is-in'); runCounter(el); }
      });

      // Linha do método: preenche conforme o scroll, sem GSAP
      const fillEl = $('#timelineFill');
      if (fillEl && !reduced) {
        const paint = () => {
          const tl = $('#timeline');
          if (!tl) return;
          const r = tl.getBoundingClientRect();
          const p = Math.min(Math.max((window.innerHeight * 0.72 - r.top) / r.height, 0), 1);
          const vertical = window.matchMedia('(max-width:680px)').matches;
          fillEl.style[vertical ? 'height' : 'width'] = `${p * 100}%`;
        };
        window.addEventListener('scroll', paint, { passive: true });
        window.addEventListener('resize', paint);
        paint();
      } else if (fillEl) {
        fillEl.style.width = '100%';
      }
      return;
    }

    titles.forEach((t) => {
      const words = splitWords(t);
      gsap.fromTo(words,
        { yPercent: 115, autoAlpha: 0 },
        {
          yPercent: 0, autoAlpha: 1, duration: .85, ease: 'power3.out', stagger: .045,
          scrollTrigger: { trigger: t, start: 'top 85%' }
        });
    });

    $$('.reveal').forEach((el) => {
      gsap.fromTo(el, { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    $$('.stagger').forEach((group) => {
      gsap.fromTo(Array.from(group.children), { autoAlpha: 0, y: 34 },
        { autoAlpha: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .09,
          scrollTrigger: { trigger: group, start: 'top 85%' } });
    });

    $$('.counter').forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => runCounter(el) });
    });

    // Linha dourada do método desenhando conforme o scroll
    const fill = $('#timelineFill');
    if (fill) {
      const vertical = window.matchMedia('(max-width:680px)').matches;
      gsap.fromTo(fill, vertical ? { height: '0%' } : { width: '0%' },
        {
          [vertical ? 'height' : 'width']: '100%', ease: 'none',
          scrollTrigger: { trigger: '#timeline', start: 'top 72%', end: 'bottom 72%', scrub: .6 }
        });
    }
  };

  /* ── 11. Abas dos pacotes ──────────────────────────────────────────────── */
  const initTabs = () => {
    const btns = $$('.tabs__btn');
    const pill = $('#tabsPill');
    if (!btns.length) return;

    const movePill = (btn) => {
      if (!pill) return;
      pill.style.width = `${btn.offsetWidth}px`;
      pill.style.transform = `translateX(${btn.offsetLeft - 5}px)`; // offsetLeft já é relativo ao switch
    };

    const activate = (btn) => {
      btns.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(b.getAttribute('aria-controls'));
        if (!panel) return;
        if (on) {
          panel.hidden = false;
          panel.classList.add('is-active', 'is-swapping');
          requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.remove('is-swapping')));
        } else {
          panel.classList.remove('is-active');
          panel.hidden = true;
        }
      });
      movePill(btn);
      if (hasGSAP && window.ScrollTrigger) ScrollTrigger.refresh();
    };

    btns.forEach((btn, i) => {
      btn.addEventListener('click', () => activate(btn));
      btn.addEventListener('keydown', (e) => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        const next = btns[(i + dir + btns.length) % btns.length];
        next.focus();
        activate(next);
      });
    });

    const setInitial = () => movePill($('.tabs__btn.is-active') || btns[0]);
    setInitial();
    window.addEventListener('resize', setInitial);
    // Reposiciona depois que as fontes carregam (larguras mudam)
    if (document.fonts?.ready) document.fonts.ready.then(setInitial);
  };

  /* ── 12. Carrosséis (cases e depoimentos) ──────────────────────────────── */
  const initCarousel = (root) => {
    if (!root) return;
    const track = $('.carousel__track', root);
    const slides = $$('.carousel__track > li', root);
    const dotsBox = $('.carousel__dots', root);
    let index = 0;
    let timer = null;

    const go = (i) => {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      $$('button', dotsBox).forEach((d, di) => {
        d.classList.toggle('is-active', di === index);
        d.setAttribute('aria-selected', String(di === index));
      });
      slides.forEach((s, si) => s.setAttribute('aria-hidden', String(si !== index)));
    };

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir para o item ${i + 1}`);
      dot.addEventListener('click', () => { go(i); restart(); });
      dotsBox.appendChild(dot);
    });

    $$('.carousel__btn', root).forEach((b) =>
      b.addEventListener('click', () => { go(index + Number(b.dataset.dir)); restart(); })
    );

    const restart = () => {
      clearInterval(timer);
      if (!reduced) timer = setInterval(() => go(index + 1), 7000);
    };

    // Swipe no mobile
    let x0 = null;
    root.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
    root.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) { go(index + (dx < 0 ? 1 : -1)); restart(); }
      x0 = null;
    }, { passive: true });

    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', restart);

    go(0);
    restart();
  };

  /* ── 13. FAQ (acordeão) ────────────────────────────────────────────────── */
  const initFaq = () => {
    $$('.faq__item').forEach((item) => {
      const btn = $('.faq__q', item);
      btn.addEventListener('click', () => {
        const open = item.classList.contains('is-open');
        $$('.faq__item.is-open').forEach((o) => {
          o.classList.remove('is-open');
          $('.faq__q', o).setAttribute('aria-expanded', 'false');
        });
        if (!open) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  };

  /* ── 14. Marquee infinito (duplica os itens) ───────────────────────────── */
  const initMarquee = () => {
    const row = $('#marqueeRow');
    if (!row || row.dataset.cloned) return;
    row.innerHTML += row.innerHTML;
    row.dataset.cloned = '1';
  };

  /* ── 15. Formulário de diagnóstico → WhatsApp ──────────────────────────── */
  const initForm = () => {
    const form = $('#diagForm');
    const note = $('#formNote');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        note.textContent = 'Preencha todos os campos para continuar.';
        note.classList.add('is-error');
        form.reportValidity();
        return;
      }
      note.classList.remove('is-error');

      const d = new FormData(form);
      const msg =
        `Olá, Matheus! Quero um diagnóstico.\n\n` +
        `• Nome: ${d.get('nome')}\n` +
        `• Empresa: ${d.get('empresa')}\n` +
        `• WhatsApp: ${d.get('whatsapp')}\n` +
        `• Segmento: ${d.get('segmento')}\n` +
        `• Investimento atual: ${d.get('investimento')}`;

      note.textContent = 'Abrindo o WhatsApp… se nada acontecer, libere os pop-ups do navegador.';
      window.open(waURL(msg), '_blank', 'noopener');

      // Eventos de conversão (disparam apenas se as tags estiverem instaladas)
      window.dataLayer?.push({ event: 'lead_form_submit' });
      window.fbq?.('track', 'Lead');
    });
  };

  /* ── 16. Balão do WhatsApp aparece sozinho uma vez ─────────────────────── */
  const teaseWhatsApp = () => {
    const el = $('.wa-float');
    if (!el || reduced) return;
    setTimeout(() => {
      el.classList.add('is-teasing');
      setTimeout(() => el.classList.remove('is-teasing'), 4200);
    }, 6000);
  };

  /* ── 17. Boot ──────────────────────────────────────────────────────────── */
  const boot = () => {
    playHero();
    heroFX();
    setupScrollReveals();
    initTabs();
    initCarousel($('#casesCarousel'));
    initCarousel($('#quotesCarousel'));
    initFaq();
    initMarquee();
    initForm();
    teaseWhatsApp();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
