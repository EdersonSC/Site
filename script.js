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
// ===== Carrossel (scroll-snap) =====
(function () {
  const root = document.querySelector("[data-carousel]");
  if (!root) return;

  const viewport = root.querySelector("[data-carousel-viewport]");
  const slides = Array.from(root.querySelectorAll("[data-carousel-slide]"));
  const dotsWrap = root.querySelector("[data-carousel-dots]");
  const prevBtn = root.querySelector("[data-carousel-prev]");
  const nextBtn = root.querySelector("[data-carousel-next]");

  if (!viewport || slides.length === 0 || !dotsWrap) return;

  // Dots
  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "carousel-dot";
    b.setAttribute("aria-label", `Ir para a foto ${i + 1}`);
    b.addEventListener("click", () => slides[i].scrollIntoView({ behavior: "smooth", inline: "start" }));
    dotsWrap.appendChild(b);
    return b;
  });

  const setActive = (index) => {
    dots.forEach((d, i) => d.setAttribute("aria-current", i === index ? "true" : "false"));
  };
  setActive(0);

  // Observa slide visível para atualizar dot
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      // pega o mais visível
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      const idx = slides.indexOf(visible.target);
      if (idx >= 0) setActive(idx);
    }, { root: viewport, threshold: [0.4, 0.6, 0.8] });

    slides.forEach(s => io.observe(s));
  }

  const go = (dir) => {
    const current = dots.findIndex(d => d.getAttribute("aria-current") === "true");
    const next = Math.min(slides.length - 1, Math.max(0, current + dir));
    slides[next].scrollIntoView({ behavior: "smooth", inline: "start" });
  };

  prevBtn && prevBtn.addEventListener("click", () => go(-1));
  nextBtn && nextBtn.addEventListener("click", () => go(1));

  // Teclado (quando o viewport está focado)
  viewport.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
  });
})();