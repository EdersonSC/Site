(function () {
  const WHATSAPP_NUMBER_E164 = "5519993422115"; // derivado do (19) 99342-2115
  const nav = document.getElementById("nav");
  const toggle = document.querySelector(".nav-toggle");

  // Menu mobile
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Fecha ao clicar em um link
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Reveal on scroll
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  // Form -> abre WhatsApp com mensagem (sem backend)
  const form = document.getElementById("leadForm");
  const setError = (name, msg) => {
    const el = document.querySelector(`.error[data-for="${name}"]`);
    if (el) el.textContent = msg || "";
  };

  const cleanPhone = (v) => (v || "").replace(/[^\d+]/g, "").trim();

  const validate = (data) => {
    let ok = true;

    if (!data.nome || data.nome.trim().length < 2) {
      setError("nome", "Informe seu nome (mínimo 2 caracteres).");
      ok = false;
    } else setError("nome", "");

    const tel = cleanPhone(data.telefone);
    if (!tel || tel.replace(/\D/g, "").length < 10) {
      setError("telefone", "Informe um telefone/WhatsApp válido.");
      ok = false;
    } else setError("telefone", "");

    if (!data.mensagem || data.mensagem.trim().length < 10) {
      setError("mensagem", "Escreva uma mensagem um pouco mais detalhada (mínimo 10 caracteres).");
      ok = false;
    } else setError("mensagem", "");

    return ok;
  };

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = {
        nome: form.nome.value,
        telefone: form.telefone.value,
        mensagem: form.mensagem.value
      };

      if (!validate(data)) return;

      const text =
        `Olá! Quero informações sobre treinos na Academia Manara Jiu-Jitsu.\n\n` +
        `Nome: ${data.nome}\n` +
        `Telefone: ${data.telefone}\n` +
        `Mensagem: ${data.mensagem}\n\n` +
        `Pode me responder, por favor?`;

      const url = `https://wa.me/${WHATSAPP_NUMBER_E164}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      form.reset();
    });
  }
})();
// ===== Hero Carousel (leve, responsivo, sem libs) =====
(function () {
  const root = document.querySelector("[data-hero-carousel]");
  if (!root) return;

  const track = root.querySelector("[data-hero-track]");
  const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
  const dotsWrap = root.querySelector("[data-hero-dots]");
  const prevBtn = root.querySelector("[data-hero-prev]");
  const nextBtn = root.querySelector("[data-hero-next]");
  const pauseBtn = root.querySelector("[data-hero-pause]");

  if (!track || slides.length === 0 || !dotsWrap) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let index = 0;
  let timer = null;
  let paused = false;

  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "hero-dot";
    b.setAttribute("aria-label", `Ir para a imagem ${i + 1}`);
    b.addEventListener("click", () => goTo(i, true));
    dotsWrap.appendChild(b);
    return b;
  });

  function render() {
    track.style.transform = `translateX(${-index * 100}%)`;
    slides.forEach((s, i) => s.setAttribute("aria-hidden", i === index ? "false" : "true"));
    dots.forEach((d, i) => d.setAttribute("aria-current", i === index ? "true" : "false"));
  }

  function goTo(i, userAction = false) {
    index = (i + slides.length) % slides.length;
    render();
    if (userAction) restartAutoplay();
  }

  function next() { goTo(index + 1, true); }
  function prev() { goTo(index - 1, true); }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function startAutoplay() {
    if (prefersReduced || paused) return;
    stopAutoplay();
    timer = setInterval(() => {
      index = (index + 1) % slides.length;
      render();
    }, 5000);
  }

  function restartAutoplay() {
    if (prefersReduced || paused) return;
    startAutoplay();
  }

  // Botões
  prevBtn && prevBtn.addEventListener("click", prev);
  nextBtn && nextBtn.addEventListener("click", next);

  // Pause
  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      paused = !paused;
      pauseBtn.setAttribute("aria-pressed", String(paused));
      pauseBtn.textContent = paused ? "Retomar" : "Pausar";
      paused ? stopAutoplay() : startAutoplay();
    });
  }

  // Pausa ao passar mouse / focar (evita “brigar” com o usuário)
  root.addEventListener("mouseenter", () => { if (!prefersReduced) stopAutoplay(); });
  root.addEventListener("mouseleave", () => { if (!prefersReduced) startAutoplay(); });
  root.addEventListener("focusin", () => { if (!prefersReduced) stopAutoplay(); });
  root.addEventListener("focusout", () => { if (!prefersReduced) startAutoplay(); });

  // Teclado
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
  });

  // Swipe (mobile)
  let startX = null;
  root.addEventListener("pointerdown", (e) => { startX = e.clientX; });
  root.addEventListener("pointerup", (e) => {
    if (startX == null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) < 40) return;
    dx < 0 ? next() : prev();
  });

  // Se mudar de aba, pausa
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  render();
  startAutoplay();
})();

/* Header escondido no topo e aparece ao rolar */
.site-header{
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;

  transform: translateY(-110%);
  opacity: 0;
  pointer-events: none;

  transition: transform .35s ease, opacity .25s ease;
}

.site-header.is-visible{
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

/* Para as âncoras (#academia etc) não ficarem “embaixo” do header */
:root{ --header-offset: 92px; }
html{ scroll-padding-top: var(--header-offset); }
section[id]{ scroll-margin-top: var(--header-offset); }

@media (max-width: 520px){
  :root{ --header-offset: 78px; }
}

// Header aparece somente quando rolar (quando o hero sai da tela)
(function () {
  const header = document.querySelector(".site-header");
  const hero = document.querySelector("[data-hero-carousel]");

  if (!header || !hero) return;

  const show = () => header.classList.add("is-visible");
  const hide = () => header.classList.remove("is-visible");

  // Preferível: baseado no hero (fica bem “estilo template”)
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        // Se o hero ainda está visível -> esconde header
        // Se o hero saiu -> mostra header
        if (e.isIntersecting) hide();
        else show();
      },
      { threshold: 0.05 }
    );

    io.observe(hero);
  } else {
    // Fallback: baseado em scroll
    const onScroll = () => (window.scrollY > 40 ? show() : hide());
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();