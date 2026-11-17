// Lou Alfred — interactions légères
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = (n) => String(n).padStart(2, "0");

  // Header : état au scroll
  const header = document.querySelector("[data-header]");
  const onScroll = () => header?.classList.toggle("is-scrolled", scrollY > 30);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menu mobile
  const burger = document.querySelector(".burger");
  const nav = document.getElementById("nav");
  const setMenu = (open) => {
    burger?.setAttribute("aria-expanded", String(open));
    burger?.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    nav?.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  };
  burger?.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  nav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  matchMedia("(min-width: 1101px)").addEventListener("change", (e) => e.matches && setMenu(false));

  // Date du jour, façon journal : « Mardi 17 novembre 2026 »
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  document.querySelectorAll("[data-date]").forEach((el) => (el.textContent = today.charAt(0).toUpperCase() + today.slice(1)));
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  // Apparition au scroll
  const targets = document.querySelectorAll(".reveal, .reveal-img");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add("is-in"));
  }

  // Parallaxe très douce (limitée pour ne jamais découvrir les bords)
  const px = [...document.querySelectorAll("[data-parallax]")];
  if (px.length && !reduce) {
    let ticking = false;
    const run = () => {
      px.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const speed = parseFloat(el.dataset.parallax) || 0.05;
        const max = el.offsetHeight * 0.035;
        const v = Math.max(-max, Math.min(max, (r.top + r.height / 2 - innerHeight / 2) * -speed));
        el.style.translate = `0 ${v.toFixed(1)}px`;
      });
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(run); ticking = true; } }, { passive: true });
    run();
  }

  // Rubriques : l'aperçu change selon la ligne survolée
  const preview = document.querySelector("[data-preview]");
  if (preview) {
    const imgs = [...preview.querySelectorAll("img")];
    const caption = preview.querySelector("[data-preview-caption]");
    const rows = [...document.querySelectorAll(".rub")];
    const show = (i) => {
      imgs.forEach((img, k) => img.classList.toggle("is-active", k === i));
      rows.forEach((row, k) => row.classList.toggle("is-active", k === i));
      if (caption) caption.textContent = rows[i].dataset.caption || "";
    };
    rows.forEach((row, i) => {
      row.addEventListener("mouseenter", () => show(i));
      row.addEventListener("focusin", () => show(i));
    });
  }

  // Bandeau « Au quotidien » : une phrase à la fois, qui glisse vers le haut
  const ticker = document.querySelector("[data-ticker]");
  if (ticker && !reduce) {
    const items = [...ticker.querySelectorAll(".ticker__item")];
    const count = ticker.querySelector("[data-ticker-count]");
    let i = 0;
    let timer = null;
    const step = () => {
      const current = items[i];
      i = (i + 1) % items.length;
      const next = items[i];
      current.classList.remove("is-current");
      current.classList.add("is-leaving");
      next.classList.remove("is-leaving");
      next.classList.add("is-current");
      setTimeout(() => current.classList.remove("is-leaving"), 950);
      if (count) count.textContent = `${pad(i + 1)} / ${pad(items.length)}`;
    };
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !timer) timer = setInterval(step, 2600);
      if (!entry.isIntersecting && timer) { clearInterval(timer); timer = null; }
    }).observe(ticker);
  }
})();
