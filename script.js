/* ===== Navegação mobile ===== */
(function () {
  const btn = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#nav");
  if (!btn || !nav) return;

  const setExpanded = (isOpen) => {
    btn.setAttribute("aria-expanded", String(isOpen));
    nav.classList.toggle("is-open", isOpen);
  };

  btn.addEventListener("click", () => {
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    setExpanded(!isOpen);
  });

  // Fecha ao clicar em um link
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    setExpanded(false);
  });

  // Fecha no ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setExpanded(false);
  });
})();

/* ===== Reveal on scroll ===== */
(function () {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((el) => io.observe(el));
})();

/* ===== Form -> WhatsApp ===== */
(function () {
  const form = document.querySelector("#leadForm");
  if (!form) return;

  const getErrorEl = (name) => form.querySelector(`[data-for="${name}"]`);

  const setError = (name, msg) => {
    const el = getErrorEl(name);
    if (el) el.textContent = msg || "";
  };

  const sanitize = (s) => String(s || "").trim();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = sanitize(form.nome?.value);
    const telefone = sanitize(form.telefone?.value);
    const mensagem = sanitize(form.mensagem?.value);

    let ok = true;

    setError("nome", "");
    setError("telefone", "");
    setError("mensagem", "");

    if (nome.length < 2) { setError("nome", "Informe seu nome."); ok = false; }
    if (telefone.length < 8) { setError("telefone", "Informe seu telefone/WhatsApp."); ok = false; }
    if (mensagem.length < 10) { setError("mensagem", "Escreva uma mensagem (mínimo 10 caracteres)."); ok = false; }

    if (!ok) return;

    const text =
      `Olá! Meu nome é ${nome}.\n` +
      `Meu WhatsApp: ${telefone}\n\n` +
      `${mensagem}`;

    const url = `https://wa.me/5519993422115?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });
})();

/* ===== Header aparece só quando rolar (hero sai da tela) + offset automático ===== */
(function () {
  const header = document.querySelector('.site-header');

function syncHeader() {
  header.classList.toggle('is-visible', window.scrollY > 1);
}

window.addEventListener('scroll', syncHeader, { passive: true });
syncHeader();
})();

/* ===== Hero Carousel (5 fotos, bem lento) ===== */
(function () {
  const root = document.querySelector("[data-hero-carousel]");
  if (!root) return;

  const track = root.querySelector("[data-hero-track]");
  const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
  const dotsWrap = root.querySelector("[data-hero-dots]");
  const prevBtn = root.querySelector("[data-hero-prev]");
  const nextBtn = root.querySelector("[data-hero-next]");

  if (!track || slides.length === 0 || !dotsWrap) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let index = 0;
  let timer = null;

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
    if (userAction) restart();
  }

  function next() { goTo(index + 1, true); }
  function prev() { goTo(index - 1, true); }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function start() {
    if (prefersReduced) return;
    stop();

    // bem lento:
    timer = setInterval(() => {
      index = (index + 1) % slides.length;
      render();
    }, 10000); // 10s
  }

  function restart() {
    if (prefersReduced) return;
    start();
  }

  prevBtn && prevBtn.addEventListener("click", prev);
  nextBtn && nextBtn.addEventListener("click", next);

  // pausa ao interagir com mouse/foco
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", start);

  // teclado
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
  });

  // swipe (mobile)
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
    if (document.hidden) stop();
    else start();
  });

  render();
  start();
})();