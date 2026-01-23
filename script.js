/* Academia Manara Jiu-Jitsu - script.js (somente JS) */
(() => {
  const WHATSAPP_NUMBER_E164 = "5519993422115";

  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Menu mobile
  const nav = qs("#nav");
  const toggle = qs(".nav-toggle");

  const closeNav = () => {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    qsa("a", nav).forEach((a) => a.addEventListener("click", closeNav));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });

    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!t) return;
      if (!nav.contains(t) && !toggle.contains(t)) closeNav();
    });
  }

  // Reveal on scroll
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
      { threshold: 0.12 }
    );
    qsa(".reveal").forEach((el) => io.observe(el));
  } else {
    qsa(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  // Form -> abre WhatsApp
  const form = qs("#leadForm");
  const setError = (name, msg) => {
    const el = qs(`.error[data-for="${name}"]`);
    if (el) el.textContent = msg || "";
  };

  const cleanPhone = (v) => (v || "").replace(/[^\d+]/g, "").trim();

  const validate = (data) => {
    let ok = true;

    if (!data.nome || data.nome.trim().length < 2) { setError("nome", "Informe seu nome (mínimo 2 caracteres)."); ok = false; }
    else setError("nome", "");

    const tel = cleanPhone(data.telefone);
    if (!tel || tel.replace(/\D/g, "").length < 10) { setError("telefone", "Informe um telefone/WhatsApp válido."); ok = false; }
    else setError("telefone", "");

    if (!data.mensagem || data.mensagem.trim().length < 10) { setError("mensagem", "Escreva uma mensagem mais detalhada (mínimo 10 caracteres)."); ok = false; }
    else setError("mensagem", "");

    return ok;
  };

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = {
        nome: form.nome?.value || "",
        telefone: form.telefone?.value || "",
        mensagem: form.mensagem?.value || ""
      };

      if (!validate(data)) return;

      const text =
        `Olá! Quero informações sobre treinos na Academia Manara Jiu-Jitsu.\n\n` +
        `Nome: ${data.nome}\n` +
        `Telefone: ${data.telefone}\n` +
        `Mensagem: ${data.mensagem}\n\n` +
        `Pode me responder, por favor?`;

      window.open(`https://wa.me/${WHATSAPP_NUMBER_E164}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      form.reset();
    });
  }

  // Hero Carousel
  (() => {
    const root = qs("[data-hero-carousel]");
    if (!root) return;

    const track = qs("[data-hero-track]", root);
    const slides = qsa("[data-hero-slide]", root);
    const dotsWrap = qs("[data-hero-dots]", root);
    const prevBtn = qs("[data-hero-prev]", root);
    const nextBtn = qs("[data-hero-next]", root);

    if (!track || slides.length === 0 || !dotsWrap) return;

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

    function stopAutoplay() { if (timer) clearInterval(timer); timer = null; }

    function startAutoplay() {
      if (prefersReduced || paused) return;
      stopAutoplay();
      timer = setInterval(() => goTo(index + 1, false), 5000);
    }

    function restartAutoplay() {
      if (prefersReduced || paused) return;
      startAutoplay();
    }

    prevBtn && prevBtn.addEventListener("click", prev);
    nextBtn && nextBtn.addEventListener("click", next);

    // Swipe
    let startX = null;
    root.addEventListener("pointerdown", (e) => { startX = e.clientX; });
    root.addEventListener("pointerup", (e) => {
      if (startX == null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) < 40) return;
      dx < 0 ? next() : prev();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    render();
    startAutoplay();
  })();

  // Header aparece assim que rolar 1px
  (() => {
    const header = qs(".site-header");
    if (!header) return;

    const sync = () => header.classList.toggle("is-visible", window.scrollY > 1);
    window.addEventListener("scroll", sync, { passive: true });
    sync();
  })();
})();