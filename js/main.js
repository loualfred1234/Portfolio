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

  // Documents des projets : sur ordinateur, ouverture dans une visionneuse sur la page ;
  // sur téléphone, le lecteur PDF natif s'ouvre dans un nouvel onglet.
  const docLinks = document.querySelectorAll("a[data-doc]");
  if (docLinks.length && "HTMLDialogElement" in window) {
    const viewer = document.createElement("dialog");
    viewer.className = "viewer";
    viewer.setAttribute("aria-label", "Document");
    viewer.innerHTML =
      '<div class="viewer__inner"><div class="viewer__bar"><p class="viewer__title"></p>' +
      '<div class="viewer__actions"><a class="link viewer__open" target="_blank" rel="noopener">Ouvrir dans un onglet ↗</a>' +
      '<button type="button" class="viewer__close" aria-label="Fermer le document">✕</button></div></div>' +
      '<iframe class="viewer__frame" title="Document"></iframe></div>';
    document.body.append(viewer);
    const frame = viewer.querySelector("iframe");
    const title = viewer.querySelector(".viewer__title");
    const openLink = viewer.querySelector(".viewer__open");
    viewer.querySelector(".viewer__close").addEventListener("click", () => viewer.close());
    viewer.addEventListener("click", (e) => { if (e.target === viewer) viewer.close(); });
    viewer.addEventListener("close", () => { frame.src = "about:blank"; document.body.classList.remove("viewer-open"); });
    const wide = matchMedia("(min-width: 900px)");
    docLinks.forEach((link) => link.addEventListener("click", (e) => {
      if (!wide.matches) return;
      e.preventDefault();
      frame.src = link.href;
      title.textContent = link.dataset.title || link.textContent.trim();
      openLink.href = link.href;
      viewer.showModal();
      document.body.classList.add("viewer-open");
    }));
  }

  // Galeries photo : un clic agrandit la photo ; flèches, boutons ou glissé pour passer à la suivante
  const photoLinks = [...document.querySelectorAll("a[data-photo]")];
  if (photoLinks.length && "HTMLDialogElement" in window) {
    const box = document.createElement("dialog");
    box.className = "lightbox";
    box.setAttribute("aria-label", "Photo agrandie");
    box.innerHTML =
      '<button type="button" class="lightbox__close" aria-label="Fermer" autofocus>✕</button>' +
      '<p class="lightbox__count"></p>' +
      '<figure class="lightbox__fig"><img class="lightbox__img" alt=""><figcaption class="lightbox__cap"></figcaption></figure>' +
      '<button type="button" class="lightbox__btn lightbox__prev" aria-label="Photo précédente">←</button>' +
      '<button type="button" class="lightbox__btn lightbox__next" aria-label="Photo suivante">→</button>';
    document.body.append(box);
    const img = box.querySelector(".lightbox__img");
    const cap = box.querySelector(".lightbox__cap");
    const count = box.querySelector(".lightbox__count");
    let group = [];
    let index = 0;
    const show = (k) => {
      index = (k + group.length) % group.length;
      const thumb = group[index].querySelector("img");
      img.src = group[index].href;
      img.alt = thumb ? thumb.alt : "";
      cap.textContent = img.alt;
      count.textContent = `${pad(index + 1)} / ${pad(group.length)}`;
    };
    photoLinks.forEach((link) => link.addEventListener("click", (e) => {
      e.preventDefault();
      const gallery = link.closest("[data-gallery]");
      group = gallery ? [...gallery.querySelectorAll("a[data-photo]")] : [link];
      show(group.indexOf(link));
      box.showModal();
      document.body.classList.add("viewer-open");
    }));
    box.querySelector(".lightbox__close").addEventListener("click", () => box.close());
    box.querySelector(".lightbox__prev").addEventListener("click", () => show(index - 1));
    box.querySelector(".lightbox__next").addEventListener("click", () => show(index + 1));
    box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
    box.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
    let startX = null;
    box.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
      startX = null;
    });
    box.addEventListener("close", () => { document.body.classList.remove("viewer-open"); img.removeAttribute("src"); });
  }

  // Carrousel des galeries : flèches, et défilement doux d'une photo toutes les 4 s
  // (en pause au survol, arrêté dès qu'on s'en sert, désactivé si les animations sont réduites)
  document.querySelectorAll("[data-gallery]").forEach((gallery) => {
    const track = gallery.querySelector(".gallery__track");
    if (!track) return;
    const stepSize = () => {
      const item = track.querySelector("li");
      const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
      return item ? item.getBoundingClientRect().width + gap : 240;
    };
    const go = (dir) => {
      const end = track.scrollWidth - track.clientWidth - 2;
      if (dir > 0 && track.scrollLeft >= end) track.scrollTo({ left: 0 });
      else if (dir < 0 && track.scrollLeft <= 2) track.scrollTo({ left: track.scrollWidth });
      else track.scrollBy({ left: dir * stepSize() });
    };
    let timer = null;
    let stopped = reduce;
    let hovering = false;
    const stop = () => { stopped = true; clearInterval(timer); timer = null; };
    gallery.querySelectorAll(".gallery__arrow").forEach((btn) => btn.addEventListener("click", () => { stop(); go(Number(btn.dataset.dir)); }));
    ["pointerdown", "wheel", "touchstart", "keydown"].forEach((type) => track.addEventListener(type, stop, { passive: true }));
    track.addEventListener("mouseenter", () => { hovering = true; });
    track.addEventListener("mouseleave", () => { hovering = false; });
    const tick = () => { if (!hovering && !document.querySelector("dialog[open]")) go(1); };
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !stopped && !timer) timer = setInterval(tick, 4000);
      if (!entry.isIntersecting && timer) { clearInterval(timer); timer = null; }
    }).observe(track);
  });

  // Carrousel Instagram : un visuel à la fois (flèches, glissé ou clavier), compteur « 01 / 04 »
  document.querySelectorAll("[data-slider]").forEach((slider) => {
    const track = slider.querySelector(".post-slider__track");
    const count = slider.querySelector(".post-slider__count");
    const total = track.children.length;
    let index = 0;
    let settle = 0;
    const show = (i) => { count.textContent = `${pad(i + 1)} / ${pad(total)}`; };
    // Se recaler sur le visuel réellement affiché (après un glissé, ou si un défilement n'a pas eu lieu)
    const sync = () => { index = Math.round(track.scrollLeft / track.clientWidth); show(index); };
    const later = (ms) => { clearTimeout(settle); settle = setTimeout(sync, ms); };
    const go = (i) => {
      index = (i + total) % total;
      show(index);
      track.scrollTo({ left: index * track.clientWidth });
      later(1000);
    };
    slider.querySelectorAll("[data-dir]").forEach((btn) => btn.addEventListener("click", () => go(index + Number(btn.dataset.dir))));
    track.addEventListener("scroll", () => later(120), { passive: true });
  });

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
