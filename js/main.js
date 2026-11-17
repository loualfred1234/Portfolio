// Lou Alfred — interactions légères
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  matchMedia("(min-width: 901px)").addEventListener("change", (e) => e.matches && setMenu(false));

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

  // Parallaxe douce
  const px = [...document.querySelectorAll("[data-parallax]")];
  if (px.length && !reduce) {
    let ticking = false;
    const run = () => {
      px.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const speed = parseFloat(el.dataset.parallax) || 0.08;
        el.style.translate = `0 ${((r.top + r.height / 2 - innerHeight / 2) * -speed).toFixed(1)}px`;
      });
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(run); ticking = true; } }, { passive: true });
    run();
  }

  // Année
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
