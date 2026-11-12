/* Kraje CEE — widżety: fazy transformacji, heatmapa, ranking, trendy, porównywarka.
   Wszystkie wartości liczbowe są PRZYKŁADOWE (GBD.cee w data.js). */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const C = window.GBDCharts, D = window.GBD;
    const $ = id => document.getElementById(id);
    const dec = k => (k === "le" || k === "tob" || k === "alc") ? 1 : 0;
    const KEYS = ["le", "death", "daly", "cvd", "cancer", "tob", "alc"];
    const SHORT = { le: "Oczek. dł. życia", death: "Umieralność ogólna", daly: "DALY", cvd: "Umier. CVD", cancer: "Umier. nowotwory", tob: "% DALY — tytoń", alc: "% DALY — alkohol" };
    const WEST_COLOR = C.REF, PL_COLOR = "#d85a30";
    /* zwalidowane sloty (CVD, kontrast); Polska zawsze koralowa, pozostałe kraje zachowują kolor po zaznaczeniu */
    const SERIES_COLORS = ["#1f5fa6", "#6b4fc4", "#0a8159"];
    const mean = k => D.cee.reduce((a, c) => a + c[k], 0) / D.cee.length;
    const byId = id => D.cee.find(c => c.id === id) || (id === "we" ? D.westEurope : null);

    /* Lista krajów CEE (propozycja definicji) */
    $("cee-list").innerHTML = D.cee.map(c => `<li>${c.name}</li>`).join("");

    /* --- Fazy transformacji epidemiologicznej --- */
    const PHASES = [
      { n: 1, tone: "blue", title: "Pandemie i głód", text: "Dominują choroby zakaźne, niedożywienie, wysoka śmiertelność dzieci. Oczekiwana długość życia: 20–40 lat. Historycznie — Europa przed XIX w.", s: [70, 15, 15] },
      { n: 2, tone: "purple", title: "Cofanie się pandemii", text: "Poprawa higieny, szczepienia, antybiotyki. Spadek chorób zakaźnych, wzrost NCD. Oczekiwana długość życia: 40–65 lat. Większość krajów CEE: połowa XX w.", s: [35, 50, 15] },
      { n: 3, tone: "coral", title: "Dominacja chorób cywilizacyjnych", text: "NCD (serce, nowotwory, cukrzyca) to główne przyczyny zgonów i DALY. Oczekiwana długość życia: 65–75 lat. Kraje CEE — tu jest Polska i większość regionu.", s: [10, 78, 12] },
      { n: 4, tone: "green", title: "Opóźnianie chorób zwyrodnieniowych", text: "Nadal dominują NCD, ale ich wystąpienie przesuwa się w późniejszy wiek dzięki prewencji, lepszemu leczeniu i stylowi życia. Oczekiwana długość życia: 75–85+ lat. Europa Zachodnia, Japonia.", s: [7, 83, 10] }
    ];
    const GROUPS = [["var(--cmnn)", "Choroby zakaźne, matczyne, żywieniowe"], ["var(--ncd)", "Choroby niezakaźne (NCD)"], ["var(--inj)", "Urazy"]];
    $("phases").innerHTML = PHASES.map(p => `
      <article class="tone tone-${p.tone} phase phase-${p.n}">
        <span class="phase-badge">Faza ${p.n}</span>
        <h3>${p.title}</h3>
        <p>${p.text}</p>
        <div class="stack" role="img" aria-label="Struktura obciążenia: ${p.s.map((v, i) => GROUPS[i][1] + " " + v + "%").join(", ")}">
          ${p.s.map((v, i) => `<div style="flex:${v};background:${GROUPS[i][0]}" title="${GROUPS[i][1]}: ${v}%">${v >= 5 ? v + "%" : ""}</div>`).join("")}
        </div>
      </article>`).join("");

    /* --- Heatmapa --- */
    const heatRows = [...D.cee.map(c => ({ ...c, highlight: c.id === "pl" })), { ...D.westEurope, isRef: true }];
    C.heatmap($("heatmap"), heatRows, KEYS.map(k => ({ key: k, label: SHORT[k], decimals: dec(k) })), { rowLabel: "Kraj", refRows: D.cee });

    /* --- Mapa Europy --- */
    const opts0 = KEYS.map(k => `<option value="${k}">${D.indicators[k].label}</option>`).join("");
    $("map-ind").innerHTML = opts0; $("map-ind").value = "le";
    function drawMap() {
      const k = $("map-ind").value, ind = D.indicators[k];
      $("map-sub").textContent = ind.label + " · " + ind.unit + " · kolor względem średniej CEE";
      const ranked = [...D.cee].sort((a, b) => ind.higherWorse ? a[k] - b[k] : b[k] - a[k]);
      C.europeMap($("eu-map"), D.cee, k, {
        decimals: dec(k), mid: mean(k), refName: "średnia CEE", unit: ind.unit, label: "Mapa CEE: " + ind.label,
        west: { name: "Europa Zachodnia (region GBD)", value: D.westEurope[k] },
        rank: e => `Pozycja ${ranked.findIndex(x => x.id === e.id) + 1} z ${D.cee.length} w CEE`
      });
    }
    $("map-ind").addEventListener("change", drawMap);
    drawMap();

    /* --- Oczekiwana długość życia 1990 → 2023 --- */
    const le90 = c => D.trend(c, "le")[0].value;
    C.dumbbell($("le-change"), [...D.cee].sort((a, b) => b.le - a.le).map(c => ({ label: c.name, a: le90(c), b: c.le, highlight: c.id === "pl" }))
      .concat([{ label: "Europa Zachodnia", a: le90(D.westEurope), b: D.westEurope.le, ref: true }]),
      { aLabel: "1990", bLabel: "2023", unit: "lata", decimals: 1, label: "Oczekiwana długość życia 1990 i 2023" });

    /* --- Selecty wskaźników --- */
    const opts = KEYS.map(k => `<option value="${k}">${D.indicators[k].label} (${D.indicators[k].unit})</option>`).join("");
    ["rank-ind", "trend-ind", "cmp-ind"].forEach(id => { $(id).innerHTML = opts; });
    $("rank-ind").value = "le"; $("trend-ind").value = "cvd"; $("cmp-ind").value = "daly";

    /* --- Ranking --- */
    function drawRanking() {
      const k = $("rank-ind").value, ind = D.indicators[k];
      let sub = document.getElementById("rank-sub");
      if (!sub) { sub = document.createElement("p"); sub.id = "rank-sub"; sub.className = "small muted"; $("ranking").before(sub); }
      if (k === "le") {
        /* dla długości życia słupki od zera ukrywałyby różnice — pokazujemy lukę do Europy Zachodniej */
        sub.textContent = "Luka do Europy Zachodniej: o ile lat krócej żyje się w danym kraju (" + C.fmt(D.westEurope.le, 1) + " lat w Europie Zach.)";
        const gap = [...D.cee].map(c => ({ c, g: Math.round((D.westEurope.le - c.le) * 10) / 10 })).sort((a, b) => a.g - b.g);
        C.hbars($("ranking"), gap.map(({ c, g }) => ({ label: c.name, value: g, bold: c.id === "pl", color: c.id === "pl" ? PL_COLOR : C.GROUP.ncd.base })),
          { decimals: 1, unit: "lat mniej niż Europa Zachodnia", valueLabel: "lat różnicy", label: "Luka w oczekiwanej długości życia do Europy Zachodniej", labelHeader: "Kraj", band: 32 });
        return;
      }
      sub.textContent = ind.label + " · " + ind.unit + " · wąsy: 95% UI";
      const rows = [...D.cee].sort((a, b) => ind.higherWorse ? a[k] - b[k] : b[k] - a[k]);
      const last = c => { const t = D.trend(c, k); return t[t.length - 1]; };
      C.hbars($("ranking"), rows.map(r => ({
        label: r.name, value: r[k], bold: r.id === "pl", lower: last(r).lower, upper: last(r).upper,
        color: r.id === "pl" ? PL_COLOR : C.GROUP.ncd.base
      })), { decimals: dec(k), ref: { value: D.westEurope[k], label: "Europa Zach. " + C.fmt(D.westEurope[k], dec(k)) }, unit: ind.unit, label: "Ranking krajów CEE: " + ind.label, labelHeader: "Kraj", band: 32 });
    }
    $("rank-ind").addEventListener("change", drawRanking);
    drawRanking();

    /* --- Trendy (wiele krajów) --- */
    const trendSel = new Set(["pl", "cz", "hu", "si"]);
    /* Stałe przypisanie kolorów: kolejność wg GBD.cee, Polska zawsze koralowa */
    const slots = new WeakMap();
    function colorMap(sel) {
      if (!slots.has(sel)) slots.set(sel, {});
      const asg = slots.get(sel);
      Object.keys(asg).forEach(id => { if (!sel.has(id)) delete asg[id]; });
      const m = {};
      D.cee.forEach(c => {
        if (!sel.has(c.id)) return;
        if (c.id === "pl") { m[c.id] = PL_COLOR; return; }
        if (!asg[c.id]) { const used = Object.values(asg); asg[c.id] = SERIES_COLORS.find(x => !used.includes(x)) || SERIES_COLORS[0]; }
        m[c.id] = asg[c.id];
      });
      return m;
    }
    function chipsHTML(sel) {
      return D.cee.map(c => `<button type="button" class="chip" data-id="${c.id}" aria-pressed="${sel.has(c.id)}">${c.name}</button>`).join("");
    }
    function seriesFor(ids, k, withWest) {
      const cm = colorMap(ids);
      const s = D.cee.filter(c => ids.has(c.id)).map(c => ({ name: c.name, color: cm[c.id], data: D.trend(c, k) }));
      if (withWest) s.push({ name: D.westEurope.name, ref: true, data: D.trend(D.westEurope, k) });
      return s;
    }
    function paintChips(host, sel) {
      const cm = colorMap(sel);
      host.querySelectorAll(".chip").forEach(ch => {
        const on = sel.has(ch.dataset.id);
        ch.setAttribute("aria-pressed", String(on));
        ch.style.background = on ? cm[ch.dataset.id] : "";
      });
    }
    function drawTrend() {
      const k = $("trend-ind").value;
      C.lineChart($("trend-chart"), seriesFor(trendSel, k, true), { label: "Trend: " + D.indicators[k].label, decimals: dec(k), band: false, height: 320, unit: D.indicators[k].unit });
    }
    $("trend-chips").innerHTML = chipsHTML(trendSel);
    $("trend-chips").addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      const id = b.dataset.id;
      const msg = $("trend-msg");
      if (trendSel.has(id)) { if (trendSel.size > 1) trendSel.delete(id); }
      else if (trendSel.size >= 4) { msg.textContent = "Maksymalnie 4 kraje na wykresie — odznacz jeden, aby dodać kolejny."; return; }
      else trendSel.add(id);
      msg.textContent = "Wybierz do 4 krajów. Polska zawsze w kolorze koralowym.";
      paintChips($("trend-chips"), trendSel); drawTrend();
    });
    $("trend-ind").addEventListener("change", drawTrend);
    paintChips($("trend-chips"), trendSel); drawTrend();

    /* --- Porównywarka (2–3 kraje) --- */
    const cmpSel = new Set(["pl", "cz", "sk"]);
    function drawCmp() {
      const k = $("cmp-ind").value, ind = D.indicators[k];
      const cm = colorMap(cmpSel);
      const last = c => { const t = D.trend(c, k); return t[t.length - 1]; };
      const rows = D.cee.filter(c => cmpSel.has(c.id)).map(c => ({ label: c.name, value: c[k], lower: last(c).lower, upper: last(c).upper, color: cm[c.id], bold: c.id === "pl" }));
      C.hbars($("cmp-bars"), rows, { decimals: dec(k), ref: { value: D.westEurope[k], label: "Europa Zach. " + C.fmt(D.westEurope[k], dec(k)) }, unit: ind.unit, label: "Porównanie krajów", labelHeader: "Kraj" });
      C.lineChart($("cmp-trend"), seriesFor(cmpSel, k, true), { label: "Porównanie: " + ind.label, decimals: dec(k), height: 300, band: false, unit: ind.unit });
    }
    $("cmp-chips").innerHTML = chipsHTML(cmpSel);
    $("cmp-chips").addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      const id = b.dataset.id, msg = $("cmp-msg");
      msg.textContent = "";
      if (cmpSel.has(id)) {
        if (cmpSel.size <= 2) { msg.textContent = "Wybierz co najmniej 2 kraje."; return; }
        cmpSel.delete(id);
      } else {
        if (cmpSel.size >= 3) { msg.textContent = "Możesz porównać maksymalnie 3 kraje — odznacz jeden z wybranych."; return; }
        cmpSel.add(id);
      }
      paintChips($("cmp-chips"), cmpSel); drawCmp();
    });
    $("cmp-ind").addEventListener("change", drawCmp);
    paintChips($("cmp-chips"), cmpSel); drawCmp();
  });
})();
