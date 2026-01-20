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