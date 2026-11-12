/* =========================================================================
   GBD Research Hub — wspólny JS: nawigacja, stopka, komponenty dynamiczne.
   ========================================================================= */
(function () {
  "use strict";

  const NAV = [
    { href: "index.html", label: "Start" },
    {
      label: "O nas", match: ["o-nas.html", "metodologia.html"], sub: [
        { href: "o-nas.html#kim-jestesmy", label: "Kim jesteśmy" },
        { href: "o-nas.html#czym-jest-gbd", label: "Czym jest GBD" },
        { href: "metodologia.html", label: "Metodologia" },
        { href: "metodologia.html#jak-korzystac", label: "Jak korzystać z danych GBD" },
        { href: "metodologia.html#slownik", label: "Słownik pojęć" },
        { href: "metodologia.html#linki", label: "Linki zewnętrzne" },
        { href: "o-nas.html#zespol", label: "Zespół" },
        { href: "o-nas.html#partnerzy", label: "Partnerzy" }
      ]
    },
    {
      label: "Polska", match: ["polska.html"], sub: [
        { href: "polska.html#przeglad", label: "Przegląd krajowy" },
        { href: "polska.html#dashboard", label: "Dashboard" },
        { href: "polska.html#porownywarka", label: "Porównywarka województw" },
        { href: "polska.html#profile", label: "Profile wojewódzkie (PDF)" },
        { href: "polska.html#data-stories", label: "Data Stories" },
        { href: "publikacje.html?region=pl", label: "Pobierz materiały →" }
      ]
    },
    {
      label: "Kraje CEE", match: ["cee.html"], sub: [
        { href: "cee.html#porownania", label: "Porównania regionalne" },
        { href: "cee.html#wskazniki", label: "Kluczowe wskaźniki" },
        { href: "cee.html#porownywarka", label: "Porównywarka krajów" },
        { href: "cee.html#data-stories", label: "Data Stories" },
        { href: "publikacje.html?region=cee", label: "Pobierz materiały →" }
      ]
    },
    {
      label: "Policy Corner", match: ["policy.html"], sub: [
        { href: "policy.html#wprowadzenie", label: "Wprowadzenie" },
        { href: "policy.html#news-regionalna", label: "Policy news" },
        { href: "policy.html#szablon", label: "Szablon policy brief" },
        { href: "policy.html#polska", label: "Polska — rekomendacje" },
        { href: "policy.html#cee", label: "CEE — rekomendacje" },
        { href: "policy.html#infografiki", label: "Infografiki" }
      ]
    },
    {
      label: "Publikacje", match: ["publikacje.html"], sub: [
        { href: "publikacje.html#artykul", label: "Artykuły naukowe" },
        { href: "publikacje.html#raport", label: "Raporty i policy briefs" },
        { href: "publikacje.html#prezentacja", label: "Prezentacje" }
      ]
    },
    {
      label: "Nauczanie", match: ["nauczanie.html"], sub: [
        { href: "nauczanie.html#garbage-codes", label: "Redystrybucja garbage codes" },
        { href: "nauczanie.html#cytowanie", label: "Jak cytować dane GBD" },
        { href: "nauczanie.html#materialy", label: "Materiały do kursów" },
        { href: "nauczanie.html#case-studies", label: "Case studies" },
        { href: "nauczanie.html#wideo", label: "Wideo-tutoriale" }
      ]
    },
    {
      label: "Media", match: ["media.html"], sub: [
        { href: "media.html#w-mediach", label: "GBD w mediach" },
        { href: "media.html#dla-dziennikarzy", label: "Materiały dla dziennikarzy" },
        { href: "media.html#kontakt-media", label: "Kontakt dla mediów" }
      ]
    },
    {
      label: "Kontakt", match: ["kontakt.html"], sub: [
        { href: "kontakt.html#kontakt", label: "Kontakt" },
        { href: "kontakt.html#dolacz", label: "Dołącz do sieci" },
        { href: "kontakt.html#bulletin", label: "GBD CEE Bulletin" }
      ]
    }
  ];

  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  /* Logo: trzy segmenty w barwach grup przyczyn GBD */
  const LOGO = `<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="17" fill="none" stroke="#1f5fa6" stroke-width="6" stroke-dasharray="74 33" transform="rotate(-90 20 20)"/>
    <circle cx="20" cy="20" r="17" fill="none" stroke="#c0392b" stroke-width="6" stroke-dasharray="18 89" stroke-dashoffset="-77" transform="rotate(-90 20 20)"/>
    <circle cx="20" cy="20" r="17" fill="none" stroke="#13795b" stroke-width="6" stroke-dasharray="9 98" stroke-dashoffset="-98" transform="rotate(-90 20 20)"/>
  </svg>`;

  function renderHeader() {
    const host = document.querySelector("[data-site-header]");
    if (!host) return;
    const items = NAV.map((n, i) => {
      if (!n.sub) {
        const cur = n.href === page ? ' aria-current="page"' : "";
        return `<li><a href="${n.href}"${cur}>${n.label}</a></li>`;
      }
      const isCur = n.match && n.match.includes(page);
      const subs = n.sub.map(s => `<li><a href="${s.href}">${s.label}</a></li>`).join("");
      return `<li class="has-sub${isCur ? " current" : ""}">
        <button type="button" aria-expanded="false" aria-controls="sub-${i}">${n.label}</button>
        <ul class="sub" id="sub-${i}">${subs}</ul></li>`;
    }).join("");
    host.outerHTML = `
      <a class="sr-only" href="#main">Przejdź do treści</a>
      <header class="site-header">
        <div class="container">
          <a class="brand" href="index.html">${LOGO}
            <span class="brand-name">GBD Research Hub<span>Polska · CEE</span></span></a>
          <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
          <nav class="nav" id="site-nav" aria-label="Główna nawigacja"><ul>${items}</ul></nav>
        </div>
      </header>`;

    const nav = document.getElementById("site-nav");
    const toggle = document.querySelector(".nav-toggle");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Zamknij" : "Menu";
    });
    nav.querySelectorAll(".has-sub > button").forEach(btn => {
      btn.addEventListener("click", () => {
        const li = btn.parentElement;
        const open = !li.classList.contains("open");
        nav.querySelectorAll(".has-sub.open").forEach(x => { x.classList.remove("open"); x.firstElementChild.setAttribute("aria-expanded", "false"); });
        if (open) { li.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
      });
    });
    nav.addEventListener("click", e => {
      if (e.target.closest(".sub a") || (e.target.tagName === "A")) {
        nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); toggle.textContent = "Menu";
      }
    });
    document.addEventListener("click", e => {
      if (!e.target.closest(".nav")) nav.querySelectorAll(".has-sub.open").forEach(x => { x.classList.remove("open"); x.firstElementChild.setAttribute("aria-expanded", "false"); });
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") nav.querySelectorAll(".has-sub.open").forEach(x => x.classList.remove("open"));
    });
  }

  function renderFooter() {
    const host = document.querySelector("[data-site-footer]");
    if (!host) return;
    host.outerHTML = `
      <div class="gbd-stripe" aria-hidden="true"><i style="background:var(--cmnn)"></i><i style="background:var(--ncd);flex:3"></i><i style="background:var(--inj)"></i></div>
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <a class="brand" href="index.html" style="color:#fff">${LOGO}<span class="brand-name" style="color:#fff">GBD Research Hub<span style="color:#8d96a2">Polska · CEE</span></span></a>
              <p class="mt-1">Interdyscyplinarny zespół analizujący obciążenie chorobami w Polsce i Europie Środkowo-Wschodniej na podstawie danych Global Burden of Disease Study.</p>
              <p class="small" style="color:#8d96a2">[Nazwa instytucji] · [adres]</p>
            </div>
            <div><h4>Dane i wiedza</h4><ul>
              <li><a href="o-nas.html#czym-jest-gbd">Czym jest GBD</a></li>
              <li><a href="metodologia.html">Metodologia</a></li>
              <li><a href="polska.html#dashboard">Dashboard Polska</a></li>
              <li><a href="cee.html">Kraje CEE</a></li></ul></div>
            <div><h4>Materiały</h4><ul>
              <li><a href="policy.html">Policy Corner</a></li>
              <li><a href="publikacje.html">Publikacje</a></li>
              <li><a href="nauczanie.html">GBD w nauczaniu</a></li>
              <li><a href="media.html">Media</a></li></ul></div>
            <div><h4>Kontakt</h4><ul>
              <li><a href="kontakt.html#kontakt">Napisz do nas</a></li>
              <li><a href="kontakt.html#dolacz">Dołącz do sieci</a></li>
              <li><a href="kontakt.html#bulletin">GBD CEE Bulletin</a></li>
              <li><a href="https://www.healthdata.org/" rel="noopener">IHME ↗</a></li></ul></div>
          </div>
          <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} GBD Research Hub. Dane: Global Burden of Disease Study, IHME.</span>
            <span>Wartości oznaczone jako przykładowe służą ilustracji — do weryfikacji z GBD Results Tool.</span>
          </div>
        </div>
      </footer>`;
  }

  /* ---------- Komponenty strony głównej ---------- */
  const fmtDate = iso => new Date(iso + "T12:00:00").toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
  const toneVar = t => ({ blue: "var(--ncd)", red: "var(--cmnn)", green: "var(--inj)", coral: "var(--coral)", amber: "var(--amber)", purple: "var(--purple)" }[t] || "var(--ink-3)");

  function renderNews() {
    document.querySelectorAll("[data-news]").forEach(host => {
      const n = parseInt(host.dataset.news, 10) || 3;
      const items = [...GBD.news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n);
      host.innerHTML = items.map(it => `
        <a class="news-card" href="${it.href}">
          <div class="thumb" style="background:${toneVar(it.tone)}"></div>
          <div class="body">
            <div class="meta"><span class="pill ${it.tone}">${it.tag}</span><time datetime="${it.date}">${fmtDate(it.date)}</time></div>
            <h3>${it.title}</h3><p>${it.excerpt}</p>
          </div></a>`).join("");
    });
  }

  function renderEvents() {
    document.querySelectorAll("[data-events]").forEach(host => {
      const today = new Date().toISOString().slice(0, 10);
      const items = GBD.events.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
      if (!items.length) { host.innerHTML = '<p class="muted">Brak zaplanowanych wydarzeń — zapisz się do newslettera, aby otrzymać zapowiedzi.</p>'; return; }
      host.innerHTML = items.map(e => {
        const d = new Date(e.date + "T12:00:00");
        return `<div class="event">
          <div class="date"><b>${d.getDate()}</b><span>${d.toLocaleDateString("pl-PL", { month: "short" })}</span></div>
          <div><h4>${e.title}</h4><p>${e.place} · ${e.desc}</p></div></div>`;
      }).join("");
    });
  }

  function renderFacts() {
    const host = document.querySelector("[data-facts]");
    if (!host) return;
    const facts = GBD.facts;
    host.innerHTML = `<div class="fact-rotator">${facts.map((f, i) => `
      <div class="fact tone tone-${f.tone}${i === 0 ? " active" : ""}" role="group" aria-roledescription="slajd" aria-label="${i + 1} z ${facts.length}">
        <span class="eyebrow">Czy wiesz, że…</span>
        <div class="big">${f.big}</div>
        <div class="what">${f.what}</div>
        <p>${f.text}</p>
        <div class="src">${GBD.factSource}</div>
      </div>`).join("")}</div>
      <div class="fact-dots" role="tablist">${facts.map((_, i) => `<button type="button" aria-label="Fakt ${i + 1}" aria-current="${i === 0}"></button>`).join("")}</div>`;
    const slides = host.querySelectorAll(".fact");
    const dots = host.querySelectorAll(".fact-dots button");
    // fakt tygodnia: start od faktu odpowiadającego numerowi tygodnia
    const week = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1)) / 6048e5);
    let cur = week % facts.length;
    const show = i => {
      cur = (i + facts.length) % facts.length;
      slides.forEach((s, j) => s.classList.toggle("active", j === cur));
      dots.forEach((d, j) => d.setAttribute("aria-current", String(j === cur)));
    };
    show(cur);
    dots.forEach((d, i) => d.addEventListener("click", () => { show(i); restart(); }));
    let timer;
    const restart = () => { clearInterval(timer); timer = setInterval(() => show(cur + 1), 9000); };
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) restart();
    host.addEventListener("mouseenter", () => clearInterval(timer));
    host.addEventListener("mouseleave", restart);
  }

  function renderNumbers() {
    const host = document.querySelector("[data-numbers]");
    if (!host) return;
    host.innerHTML = GBD.numbers.map(n => `
      <div class="stat ${n.tone}">
        <div class="label">${n.label}</div>
        <div class="value" data-count="${n.value}">0</div>
        <div class="sub">${n.sub}${n.todo ? ' <span class="badge" title="Wartość do uzupełnienia">?</span>' : ""}</div>
      </div>`).join("");
  }

  /* Animowane liczniki (uruchamiane przy wejściu w widok) */
  function initCounters() {
    const els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const run = el => {
      const target = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split(".")[1] || "").length;
      if (reduce) { el.textContent = target.toLocaleString("pl-PL", { minimumFractionDigits: dec }); return; }
      const t0 = performance.now(), dur = 1400;
      const step = t => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * e).toLocaleString("pl-PL", { minimumFractionDigits: dec, maximumFractionDigits: dec });
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    }), { threshold: .4 });
    els.forEach(el => io.observe(el));
  }

  /* Formularze demonstracyjne (brak backendu) */
  function initForms() {
    document.querySelectorAll("form[data-demo]").forEach(f => {
      f.addEventListener("submit", e => {
        e.preventDefault();
        const msg = f.querySelector(".form-msg") || f.parentElement.querySelector(".form-msg");
        if (!f.checkValidity()) { f.reportValidity(); return; }
        if (msg) msg.textContent = f.dataset.demo || "Dziękujemy! (Formularz demonstracyjny — integracja z systemem wysyłki do uzupełnienia.)";
        f.reset();
      });
    });
  }

  /* Kopiowanie cytowań */
  function initCopy() {
    document.querySelectorAll(".cite-box").forEach(box => {
      if (box.querySelector(".copy-btn")) return;
      const b = document.createElement("button");
      b.type = "button"; b.className = "copy-btn"; b.textContent = "Kopiuj";
      b.addEventListener("click", async () => {
        const text = box.innerText.replace(/Kopiuj|Skopiowano/g, "").trim();
        try { await navigator.clipboard.writeText(text); b.textContent = "Skopiowano"; }
        catch { b.textContent = "Zaznacz i skopiuj"; }
        setTimeout(() => (b.textContent = "Kopiuj"), 1800);
      });
      box.appendChild(b);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
    if (window.GBD) {
      if (GBD.news) renderNews();
      if (GBD.events) renderEvents();
      if (GBD.facts) renderFacts();
      if (GBD.numbers) renderNumbers();
    }
    initCounters();
    initForms();
    initCopy();
  });

  window.GBDSite = { fmtDate, toneVar };
})();
