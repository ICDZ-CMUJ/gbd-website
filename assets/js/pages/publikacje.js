/* Publikacje — filtrowane repozytorium z GBD.publications */
(function () {
  "use strict";
  const TYPES = ["artykul", "raport", "prezentacja"];
  const REGIONS = { pl: "Polska", cee: "CEE", global: "Globalne" };
  const BANNER = { pl: "Materiały dotyczące Polski", cee: "Materiały dotyczące krajów Europy Środkowo-Wschodniej (CEE)" };
  const state = { type: "all", region: "all", q: "" };

  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");

  function setSeg(id, v) {
    document.querySelectorAll(`#${id} button`).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
  }

  function item(p) {
    const link = p.doi
      ? `<a href="https://doi.org/${esc(p.doi)}" rel="noopener">DOI: ${esc(p.doi)} ↗</a>`
      : `<span class="muted">PDF — do uzupełnienia</span>`;
    return `<li class="pub" data-type="${esc(p.type)}">
      <div class="meta"><span class="pill ${p.region === "pl" ? "coral" : p.region === "cee" ? "amber" : "blue"}">${esc(REGIONS[p.region] || p.region)}</span><span>${esc(p.year)}</span><span>${esc(p.venue)}</span></div>
      <h3>${esc(p.title)}</h3>
      <div class="authors">${esc(p.authors)}</div>
      <p>${esc(p.abstract)}</p>
      <div class="links">${link}</div></li>`;
  }

  function render() {
    const q = norm(state.q);
    const list = [...(GBD.publications || [])]
      .filter(p => state.region === "all" || p.region === state.region)
      .filter(p => !q || norm([p.title, p.authors, p.abstract, p.venue].join(" ")).includes(q))
      .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, "pl"));
    let shown = 0;
    TYPES.forEach(t => {
      const g = document.querySelector(`[data-group="${t}"]`);
      const items = list.filter(p => p.type === t);
      const visible = state.type === "all" || state.type === t;
      g.classList.toggle("hidden", !visible);
      g.querySelector(".pub-list").innerHTML = items.map(item).join("") || '<li class="muted">Brak pozycji dla wybranych filtrów.</li>';
      g.querySelector(".count").textContent = `(${items.length})`;
      if (visible) shown += items.length;
    });
    document.getElementById("empty").classList.toggle("show", shown === 0);

    const banner = document.getElementById("region-banner");
    const txt = BANNER[state.region];
    banner.classList.toggle("show", !!txt);
    if (txt) document.getElementById("region-banner-text").textContent = txt + " — filtr regionu jest aktywny.";
  }

  function syncUrl() {
    const url = new URL(location.href);
    if (state.region === "all") url.searchParams.delete("region"); else url.searchParams.set("region", state.region);
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  function fromHash() {
    const h = location.hash.slice(1);
    if (TYPES.includes(h)) { state.type = h; setSeg("f-type", h); render(); }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const r = new URLSearchParams(location.search).get("region");
    if (r && REGIONS[r]) { state.region = r; setSeg("f-region", r); }
    const h = location.hash.slice(1);
    if (TYPES.includes(h)) { state.type = h; setSeg("f-type", h); }

    document.querySelectorAll("#f-type button").forEach(b => b.addEventListener("click", () => {
      state.type = b.dataset.v; setSeg("f-type", state.type);
      history.replaceState(null, "", location.pathname + location.search + (state.type === "all" ? "" : "#" + state.type));
      render();
    }));
    document.querySelectorAll("#f-region button").forEach(b => b.addEventListener("click", () => {
      state.region = b.dataset.v; setSeg("f-region", state.region); syncUrl(); render();
    }));
    document.getElementById("f-q").addEventListener("input", e => { state.q = e.target.value; render(); });
    document.getElementById("region-clear").addEventListener("click", () => {
      state.region = "all"; setSeg("f-region", "all"); syncUrl(); render();
    });
    window.addEventListener("hashchange", fromHash);
    render();
    if (TYPES.includes(h)) document.getElementById(h).scrollIntoView();
  });
})();
