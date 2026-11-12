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
    const WEST_COLOR = "#9aa1ab", PL_COLOR = "#d85a30";
    const SERIES_COLORS = ["#1f5fa6", "#534ab7", "#13795b", "#e39b2a", "#c0392b", "#0c447c"];
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
          ${p.s.map((v, i) => `<div style="flex:${v};background:${GROUPS[i][0]}" title="${GROUPS[i][1]}: ${v}%">${v}%</div>`).join("")}
        </div>
      </article>`).join("");

    /* --- Heatmapa --- */
    const heatRows = [...D.cee.map(c => ({ ...c, highlight: c.id === "pl" })), { ...D.westEurope }];
    C.heatmap($("heatmap"), heatRows, KEYS.map(k => ({ key: k, label: SHORT[k], decimals: dec(k) })), { rowLabel: "Kraj" });

    /* --- Selecty wskaźników --- */
    const opts = KEYS.map(k => `<option value="${k}">${D.indicators[k].label} (${D.indicators[k].unit})</option>`).join("");
    ["rank-ind", "trend-ind", "cmp-ind"].forEach(id => { $(id).innerHTML = opts; });
    $("rank-ind").value = "le"; $("trend-ind").value = "cvd"; $("cmp-ind").value = "daly";

    /* --- Ranking --- */
    function drawRanking() {
      const k = $("rank-ind").value, ind = D.indicators[k];
      const rows = [...D.cee, D.westEurope].sort((a, b) => ind.higherWorse ? a[k] - b[k] : b[k] - a[k]);
      const max = Math.max(...rows.map(r => r[k]));
      C.hbars($("ranking"), rows.map(r => ({
        label: r.name, value: r[k], bold: r.id === "pl",
        color: r.id === "we" ? WEST_COLOR : r.id === "pl" ? PL_COLOR : "#7aa7d9"
      })), { max: max * 1.05, decimals: dec(k) });
    }
    $("rank-ind").addEventListener("change", drawRanking);
    drawRanking();

    /* --- Trendy (wiele krajów) --- */
    const trendSel = new Set(["pl", "cz", "hu", "si"]);
    /* Stałe przypisanie kolorów: kolejność wg GBD.cee, Polska zawsze koralowa */
    function colorMap(sel) {
      const m = {}; let i = 0;
      D.cee.forEach(c => { if (sel.has(c.id)) m[c.id] = c.id === "pl" ? PL_COLOR : SERIES_COLORS[i++ % SERIES_COLORS.length]; });
      return m;
    }
    function chipsHTML(sel) {
      return D.cee.map(c => `<button type="button" class="chip" data-id="${c.id}" aria-pressed="${sel.has(c.id)}">${c.name}</button>`).join("");
    }
    function seriesFor(ids, k, withWest) {
      const cm = colorMap(ids);
      const s = D.cee.filter(c => ids.has(c.id)).map(c => ({ name: c.name, color: cm[c.id], data: D.trend(c, k) }));
      if (withWest) s.push({ name: D.westEurope.name, color: WEST_COLOR, dash: true, width: 2, data: D.trend(D.westEurope, k) });
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
      C.lineChart($("trend-chart"), seriesFor(trendSel, k, true), { label: "Trend: " + D.indicators[k].label, decimals: dec(k) });
    }
    $("trend-chips").innerHTML = chipsHTML(trendSel);
    $("trend-chips").addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      const id = b.dataset.id;
      if (trendSel.has(id)) { if (trendSel.size > 1) trendSel.delete(id); } else trendSel.add(id);
      paintChips($("trend-chips"), trendSel); drawTrend();
    });
    $("trend-ind").addEventListener("change", drawTrend);
    paintChips($("trend-chips"), trendSel); drawTrend();

    /* --- Porównywarka (2–3 kraje) --- */
    const cmpSel = new Set(["pl", "cz", "sk"]);
    function drawCmp() {
      const k = $("cmp-ind").value, ind = D.indicators[k];
      const cm = colorMap(cmpSel);
      const rows = D.cee.filter(c => cmpSel.has(c.id)).map(c => ({ label: c.name, value: c[k], color: cm[c.id], bold: c.id === "pl" }));
      rows.push({ label: D.westEurope.name, value: D.westEurope[k], color: WEST_COLOR });
      const max = Math.max(...rows.map(r => r.value));
      C.hbars($("cmp-bars"), rows, { max: max * 1.08, decimals: dec(k) });
      C.lineChart($("cmp-trend"), seriesFor(cmpSel, k, true), { label: "Porównanie: " + ind.label, decimals: dec(k), height: 280 });
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
