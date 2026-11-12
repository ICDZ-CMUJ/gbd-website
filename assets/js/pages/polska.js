/* =========================================================================
   Polska — przegląd, dashboard, porównywarka, profile wojewódzkie.
   Wszystkie wartości są DANYMI PRZYKŁADOWYMI (GBD.voiv, GBD.poland, GBD.trend).
   ========================================================================= */
(function () {
  "use strict";
  const C = window.GBDCharts, D = window.GBD;
  const { fmt, esc } = C;
  const KEYS = ["cvd", "cancer", "daly", "le", "tob", "alc"];
  const DEC = k => (k === "le" || k === "tob" || k === "alc") ? 1 : 0;
  /* paleta porównań — zwalidowana (kolejność stała, kolor idzie za województwem) */
  const CMP_COLORS = ["#1f5fa6", "#d85a30", "#6b4fc4"];
  const PL_COLOR = C.REF;

  /* ---------- Model wartości (ilustracyjny) ---------- */
  const trendCache = {};
  function series(ent, key) {
    const k = ent.id + ":" + key;
    if (!trendCache[k]) trendCache[k] = D.trend(ent, key);
    return trendCache[k];
  }
  const SEX = {
    all: { rate: 1, pct: 1, le: 0 },
    f:   { rate: 0.74, pct: 0.55, le: 4.1 },
    m:   { rate: 1.32, pct: 1.4, le: -4.1 }
  };
  const AGE = {
    all:     { rate: 1,    pct: 1 },
    "0-14":  { rate: 0.04, pct: 0.15 },
    "15-49": { rate: 0.22, pct: 0.95 },
    "50-69": { rate: 1.45, pct: 1.3 },
    "70+":   { rate: 5.6,  pct: 0.8 }
  };
  function adjust(v, key, sex, age) {
    if (key === "le") return v + SEX[sex].le;
    const kind = (key === "tob" || key === "alc") ? "pct" : "rate";
    let out = v * SEX[sex][kind] * AGE[age][kind];
    if (key === "daly" && age !== "all") out = v * SEX[sex].rate * ({ "0-14": 0.35, "15-49": 0.6, "50-69": 1.5, "70+": 3.4 })[age];
    return out;
  }
  function value(ent, key, year, sex = "all", age = "all") {
    const raw = year === 2023 ? ent[key] : (series(ent, key).find(p => p.year === year) || {}).value;
    const v = adjust(raw, key, sex, age);
    return Math.round(v * 10) / 10;
  }
  function seriesAdj(ent, key, sex, age) {
    return series(ent, key).map(p => ({ year: p.year, value: Math.round(adjust(p.value, key, sex, age) * 10) / 10 }));
  }
  function unitFor(key, age) {
    const u = D.indicators[key].unit;
    if (age !== "all" && u.includes("stand.")) return "na 100 tys. (w grupie wieku)";
    return u;
  }
  const byId = id => id === "pl" ? D.poland : D.voiv.find(v => v.id === id);
  const better = (key, a, b) => D.indicators[key].higherWorse ? a < b : a > b;

  /* ---------- 3.1 Przegląd ---------- */
  function overview() {
    C.arrowDiagram(document.getElementById("ov-ranks"), D.polandDeathRanks, { label: "Ranking przyczyn zgonów w Polsce, 1990 i 2023" });

    C.lineChart(document.getElementById("ov-deaths"), [
      { name: "Ch. układu krążenia", color: C.GROUP.ncd.base, data: series(D.poland, "cvd") },
      { name: "Nowotwory", color: "#6b4fc4", data: series(D.poland, "cancer") }
    ], { label: "Umieralność z powodu chorób układu krążenia i nowotworów, Polska 1990–2023", height: 300, unit: "na 100 tys. (stand.)" });

    C.treemap(document.getElementById("ov-treemap"), D.polandDalyCauses, { label: "DALY wg przyczyn, Polska 2023", ratio: 0.6 });
    C.stackedShare(document.getElementById("ov-daly"), D.polandYllYld, { label: "Struktura DALY: YLL vs YLD, Polska 1990–2023", height: 260 });

    const RC = D.riskColors;
    C.hbars(document.getElementById("ov-risks"), D.polandRisks.map(r => ({ label: r.name, value: r.value, lower: r.lower, upper: r.upper, color: RC[r.cat] })),
      { decimals: 1, unit: "% DALY", valueLabel: "% DALY", label: "Czynniki ryzyka wg odsetka przypisywalnych DALY", labelHeader: "Czynnik ryzyka" });
    const legend = document.createElement("div");
    legend.className = "viz-legend";
    legend.innerHTML = Object.keys(RC).map(k => `<span><i class="lk box" style="background:${RC[k]}"></i>${esc(D.riskNames[k])}</span>`).join("");
    document.getElementById("ov-risks").prepend(legend);

    const R1990 = { "Palenie tytoniu": 20.5, "Wysokie ciśnienie skurczowe": 16.2, "Ryzyko dietetyczne": 13.1, "Wysoki BMI": 7.4, "Wysoka glikemia na czczo": 6.0, "Spożycie alkoholu": 6.8, "Wysoki cholesterol LDL": 8.0, "Zanieczyszczenie powietrza PM2.5": 7.9, "Niska aktywność fizyczna": 2.4, "Ryzyka zawodowe": 2.6 };
    C.dumbbell(document.getElementById("ov-risk-change"),
      D.polandRisks.map(r => ({ label: r.name, a: R1990[r.name], b: r.value })).sort((x, y) => y.b - x.b),
      { aLabel: "1990", bLabel: "2023", unit: "% DALY", label: "Zmiana udziału czynników ryzyka 1990–2023" });
  }

  /* ---------- 3.2 Dashboard ---------- */
  const st = { level: "pl", key: "cvd", year: 2023, sex: "all", age: "all" };

  function dashInit() {
    const lvl = document.getElementById("d-level");
    lvl.innerHTML = `<option value="pl">Polska ogółem</option><optgroup label="Województwa">${
      [...D.voiv].sort((a, b) => a.name.localeCompare(b.name, "pl")).map(v => `<option value="${v.id}">${esc(v.name)}</option>`).join("")}</optgroup>`;
    const ind = document.getElementById("d-ind");
    ind.innerHTML = KEYS.map(k => `<option value="${k}">${esc(D.indicators[k].label)}</option>`).join("");
    lvl.addEventListener("change", () => { st.level = lvl.value; dashRender(); });
    ind.addEventListener("change", () => { st.key = ind.value; dashRender(); });
    const age = document.getElementById("d-age");
    age.addEventListener("change", () => { st.age = age.value; dashRender(); });
    const yr = document.getElementById("d-year"), yo = document.getElementById("d-year-o");
    yr.addEventListener("input", () => { st.year = +yr.value; yo.textContent = yr.value; dashRender(true); });
    document.querySelectorAll("#d-sex button").forEach(b => b.addEventListener("click", () => {
      document.querySelectorAll("#d-sex button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      st.sex = b.dataset.v; dashRender();
    }));
    dashRender();
  }

  function selectLevel(id) {
    st.level = st.level === id ? "pl" : id;
    document.getElementById("d-level").value = st.level;
    dashRender();
  }

  function dashRender(fromSlider) {
    const { key, year, sex, age } = st;
    const dec = DEC(key), unit = unitFor(key, age);
    const ageSel = document.getElementById("d-age");
    ageSel.disabled = key === "le";
    if (key === "le" && st.age !== "all") { st.age = "all"; ageSel.value = "all"; return dashRender(); }

    const ents = D.voiv.map(v => Object.assign({}, v, { [key]: value(v, key, year, sex, age) }));
    const plVal = value(D.poland, key, year, sex, age);
    const sexLbl = { all: "ogółem", f: "kobiety", m: "mężczyźni" }[sex];
    const ageLbl = age === "all" ? "wszystkie grupy wieku" : age + " lat";

    document.getElementById("d-map-title").textContent = D.indicators[key].label + ", " + year;
    document.getElementById("d-map-sub").textContent = unit + " · " + sexLbl + " · " + ageLbl;
    const rankOf = e => { const r = [...ents].sort((a, b) => D.indicators[key].higherWorse ? a[key] - b[key] : b[key] - a[key]); return `Pozycja ${r.findIndex(x => x.id === e.id) + 1} z 16 (1 = najkorzystniej)`; };
    C.polandMap(document.getElementById("d-map"), ents, key, { decimals: dec, mid: plVal, unit, selected: st.level === "pl" ? [] : [st.level], onClick: selectLevel, rank: rankOf, label: D.indicators[key].label + ", " + year });

    // KPI
    const cur = st.level === "pl" ? null : ents.find(e => e.id === st.level);
    const curVal = cur ? cur[key] : plVal;
    const ranked = [...ents].sort((a, b) => D.indicators[key].higherWorse ? a[key] - b[key] : b[key] - a[key]);
    const v1990 = value(byId(st.level), key, 1990, sex, age);
    const chg = (curVal - v1990) / v1990 * 100;
    const vals = ents.map(e => e[key]);
    const k3 = cur
      ? `<div class="kpi"><div class="k-label">Pozycja</div><div class="k-value">${ranked.findIndex(e => e.id === cur.id) + 1}<small>/16</small></div><div class="k-rankbar">${ranked.map(e => `<i class="${e.id === cur.id ? "on" : ""}"></i>`).join("")}</div><div class="k-note">1 = najkorzystniej</div></div>`
      : `<div class="kpi"><div class="k-label">Rozpiętość</div><div class="k-value k-range">${fmt(Math.min(...vals), dec)}–${fmt(Math.max(...vals), dec)}</div><div class="k-note">między województwami (${fmt((Math.max(...vals) - Math.min(...vals)) / Math.min(...vals) * 100, 0)}%)</div></div>`;
    const diff = cur ? (curVal - plVal) / plVal * 100 : null;
    const spark = (ent, color) => C.sparkline(seriesAdj(ent, key, sex, age), { color, width: 104, height: 26, highlightIndex: year - 1990 });
    const chgCol = better(key, curVal, v1990) ? "var(--ncd)" : "var(--cmnn)";
    document.getElementById("d-kpis").innerHTML = `
      <div class="kpi"><div class="k-label">${esc(cur ? cur.name : "Polska")}</div><div class="k-value">${fmt(curVal, dec)}</div>${spark(cur || D.poland, C.GROUP.ncd.base)}<div class="k-note">${year}${cur ? "" : " · średnia krajowa"}</div></div>
      ${cur
        ? `<div class="kpi"><div class="k-label">Polska</div><div class="k-value">${fmt(plVal, dec)}</div>${spark(D.poland, C.REF)}<div class="k-note">${C.signed(diff)}% różnicy</div></div>`
        : `<div class="kpi"><div class="k-label">Najkorzystniej</div><div class="k-value">${fmt(ranked[0][key], dec)}</div>${spark(ranked[0], C.GROUP.ncd.base)}<div class="k-note">${esc(ranked[0].name)}</div></div>`}
      ${k3}
      <div class="kpi"><div class="k-label">Zmiana od 1990</div><div class="k-value"><span class="k-arrow" style="color:${chgCol}">${chg < 0 ? "▼" : "▲"}</span>${C.signed(chg, 0)}%</div><div class="k-note">1990 → ${year} · ${better(key, curVal, v1990) ? "poprawa" : "pogorszenie"}</div></div>`;

    // trend (nie przerysowujemy przy przesuwaniu suwaka roku)
    if (!fromSlider) {
      const s = [{ name: "Polska", color: C.GROUP.ncd.base, ref: !!cur, data: seriesAdj(D.poland, key, sex, age) }];
      if (cur) s.push({ name: cur.name, color: C.GROUP.ncd.base, data: seriesAdj(cur, key, sex, age) });
      document.getElementById("d-trend-title").textContent = "Trend 1990–2023: " + (cur ? cur.name + " na tle Polski" : "Polska ogółem");
      document.getElementById("d-trend-sub").textContent = D.indicators[key].label + " · " + unit;
      C.lineChart(document.getElementById("d-trend"), s, { label: "Trend wskaźnika", height: 290, decimals: dec, unit });
    }

    // ranking
    const col = C.divergingScale(vals, plVal, D.indicators[key].higherWorse).color;
    const max = Math.max(...vals, plVal);
    const all = [...ranked];
    // wstaw wiersz Polski w odpowiednie miejsce rankingu
    let idx = all.findIndex(e => better(key, plVal, e[key]));
    if (idx < 0) idx = all.length;
    all.splice(idx, 0, { id: "pl", name: "Polska (średnia)", [key]: plVal, isPl: true });
    let n = 0;
    document.getElementById("d-rank").innerHTML = `<table class="data"><thead><tr><th class="num">#</th><th>Województwo</th><th class="num">Wartość</th><th style="width:38%">${esc(unit)}</th><th class="num">vs Polska</th></tr></thead><tbody>${
      all.map(e => {
        const d = (e[key] - plVal) / plVal * 100;
        const cls = e.isPl ? "is-pl" : (e.id === st.level ? "is-sel" : "");
        const dcls = e.isPl ? "" : (better(key, e[key], plVal) ? "diff-down" : "diff-up");
        return `<tr class="${cls}" data-id="${e.id}" tabindex="0"><td class="num">${e.isPl ? "–" : ++n}</td><td>${esc(e.name)}</td><td class="num">${fmt(e[key], dec)}</td>
          <td><div class="rank-bar"><i style="width:${e[key] / max * 100}%;background:${e.isPl ? PL_COLOR : col(e[key])}"></i></div></td>
          <td class="num ${dcls}">${e.isPl ? "—" : (d >= 0 ? "+" : "") + fmt(d, 1) + "%"}</td></tr>`;
      }).join("")}</tbody></table>`;
    document.querySelectorAll("#d-rank tbody tr").forEach(tr => {
      const go = () => selectLevel(tr.dataset.id);
      tr.addEventListener("click", go);
      tr.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
    });
  }

  /* ---------- 3.3 Porównywarka ---------- */
  const cmp = { sel: ["ma", "ld", "lu"], key: "cvd" };
  function cmpInit() {
    const host = document.getElementById("c-voiv");
    host.innerHTML = [...D.voiv].sort((a, b) => a.name.localeCompare(b.name, "pl"))
      .map(v => `<button type="button" class="chip" data-id="${v.id}" aria-pressed="false">${esc(v.name)}</button>`).join("");
    host.addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      const id = b.dataset.id, msg = document.getElementById("c-msg");
      msg.textContent = "";
      if (cmp.sel.includes(id)) {
        if (cmp.sel.length <= 2) { msg.textContent = "Wybierz co najmniej 2 województwa."; return; }
        cmp.sel = cmp.sel.filter(x => x !== id);
      } else {
        if (cmp.sel.length >= 3) { msg.textContent = "Możesz porównać maksymalnie 3 województwa — odznacz jedno z wybranych."; return; }
        cmp.sel.push(id);
      }
      cmpRender();
    });
    const ind = document.getElementById("c-ind");
    ind.innerHTML = KEYS.map(k => `<option value="${k}">${esc(D.indicators[k].label)}</option>`).join("");
    ind.addEventListener("change", () => { cmp.key = ind.value; cmpRender(); });
    cmpRender();
  }
  function cmpRender() {
    const key = cmp.key, dec = DEC(key);
    document.querySelectorAll("#c-voiv .chip").forEach(b => {
      const i = cmp.sel.indexOf(b.dataset.id);
      b.setAttribute("aria-pressed", String(i >= 0));
      b.style.background = i >= 0 ? CMP_COLORS[i] : "";
    });
    document.getElementById("c-unit").textContent = D.indicators[key].label + " · " + D.indicators[key].unit;
    const last = ent => series(ent, key)[series(ent, key).length - 1];
    const rows = cmp.sel.map((id, i) => ({ label: byId(id).name, value: byId(id)[key], lower: last(byId(id)).lower, upper: last(byId(id)).upper, color: CMP_COLORS[i] }));
    C.hbars(document.getElementById("c-bars"), rows, { decimals: dec, unit: D.indicators[key].unit, ref: { value: D.poland[key], label: "Polska " + fmt(D.poland[key], dec) }, label: "Porównanie województw", labelHeader: "Województwo" });
    const s = cmp.sel.map((id, i) => ({ name: byId(id).name, color: CMP_COLORS[i], data: series(byId(id), key) }));
    s.push({ name: "Polska", ref: true, data: series(D.poland, key) });
    C.lineChart(document.getElementById("c-trend"), s, { label: "Porównanie trendów", height: 300, decimals: dec, band: false, unit: D.indicators[key].unit });
  }

  /* ---------- 3.4 Profile wojewódzkie ---------- */
  const CAUSES_DEATH = [["Choroba niedokrwienna serca", .52], ["Udar mózgu", .27], ["Rak tchawicy, oskrzeli i płuca", .21], ["POChP", .14], ["Rak jelita grubego", .12]];
  const CAUSES_DALY = [["Choroba niedokrwienna serca", .085], ["Udar mózgu", .047], ["Rak płuca", .041], ["Ból dolnego odcinka kręgosłupa", .039], ["Cukrzyca typu 2", .031]];
  const BLUES = [["#1f5fa6", "#fff"], ["#3a7dc6", "#fff"], ["#7fb0e0", "#0c447c"], ["#b5d4f4", "#0c447c"], ["#e6f0fa", "#0c447c"]];
  const CORALS = [["#d85a30", "#fff"], ["#e8896a", "#fff"], ["#f3c4b3", "#993c1d"], ["#f9ebe5", "#993c1d"], ["#fdf5f1", "#993c1d"]];
  const RISK_TONE = { beh: ["var(--coral-tint)", "var(--coral-dark)"], met: ["var(--purple-tint)", "var(--purple-dark)"], env: ["var(--sand-2)", "var(--ink-2)"] };

  function profile(id) {
    const v = byId(id), pl = D.poland;
    const death = e => Math.round(980 * e.daly / 30000);
    const hale = e => Math.round((e.le - 9.8) * 10) / 10;
    document.querySelectorAll("#p-list .chip").forEach(b => {
      const on = b.dataset.id === id;
      b.setAttribute("aria-pressed", String(on));
      b.style.background = on ? "var(--ncd)" : "";
    });
    const risks = [
      ["Wysokie ciśnienie skurczowe", v.daly * 0.118, "met"],
      ["Palenie tytoniu", v.daly * v.tob / 100, "beh"],
      ["Ryzyko dietetyczne", v.daly * 0.104, "beh"],
      ["Wysoki BMI", v.daly * 0.096, "met"],
      ["Zanieczyszczenie powietrza", v.daly * 0.042 * (id === "sl" || id === "ma" ? 1.6 : 1), "env"]
    ].sort((a, b) => b[1] - a[1]);
    const op = document.getElementById("onepager");
    op.innerHTML = `
      <header class="op-head">
        <div><h3>Województwo ${esc(v.name.toLowerCase())}</h3>
          <p>Profil zdrowotny na podstawie danych GBD 2021 | Populacja: ${fmt(v.pop, 2)} mln</p></div>
        <div class="op-brand"><b>GBD Research Hub</b>Edycja 2025</div>
      </header>
      <div class="op-kpis">
        <div class="op-kpi" style="background:var(--ncd-tint);color:var(--ncd-dark)"><div class="v">${fmt(death(v))}</div>Standaryz. wsp. umieralności ogólnej /100 tys.<div class="pl">Polska: ${fmt(death(pl))}</div></div>
        <div class="op-kpi" style="background:var(--amber-tint);color:var(--amber-dark)"><div class="v">${fmt(v.daly)}</div>DALY ogółem /100 tys. (standaryz.)<div class="pl">Polska: ${fmt(pl.daly)}</div></div>
        <div class="op-kpi" style="background:var(--inj-tint);color:var(--inj-dark)"><div class="v">${fmt(v.le, 1)}</div>Oczekiwane dalsze trwanie życia (lata)<div class="pl">Polska: ${fmt(pl.le, 1)}</div></div>
        <div class="op-kpi" style="background:var(--coral-tint);color:var(--coral-dark)"><div class="v">${fmt(hale(v), 1)}</div>HALE — lata w zdrowiu<div class="pl">Polska: ${fmt(hale(pl), 1)}</div></div>
      </div>
      <div class="op-two">
        <div><h4 class="op-h">Top 5 przyczyn umieralności</h4><ol class="op-list">${CAUSES_DEATH.map((c, i) => `
          <li><span class="n" style="background:${BLUES[i][0]};color:${BLUES[i][1]}">${i + 1}</span><span>${c[0]}</span><span class="r" style="color:var(--ncd)">${fmt(death(v) * c[1] * (i < 2 ? v.cvd / pl.cvd : v.cancer / pl.cancer) * .5)}/100 tys.</span></li>`).join("")}</ol></div>
        <div><h4 class="op-h">Top 5 przyczyn DALY</h4><ol class="op-list">${CAUSES_DALY.map((c, i) => `
          <li><span class="n" style="background:${CORALS[i][0]};color:${CORALS[i][1]}">${i + 1}</span><span>${c[0]}</span><span class="r" style="color:var(--coral)">${fmt(v.daly * c[1])}/100 tys.</span></li>`).join("")}</ol></div>
      </div>
      <h4 class="op-h">Top 5 czynników ryzyka (wg przypisywalnych DALY)</h4>
      <div class="op-risks">${risks.map((r, i) => `
        <div class="op-risk" style="background:${RISK_TONE[r[2]][0]};color:${RISK_TONE[r[2]][1]}"><b>${i + 1}.</b>${r[0]}<br><span style="font-variant-numeric:tabular-nums">${fmt(r[1])} DALY</span></div>`).join("")}</div>
      <div class="op-charts">
        <div class="box"><h5>Trend DALY 1990–2023 (województwo vs Polska)</h5><div id="op-trend"></div></div>
        <div class="box"><h5>Pozycja województwa na tle kraju — DALY /100 tys.</h5><div id="op-map"></div></div>
      </div>
      <div class="op-foot">
        <p class="mb-0">Wskaźniki standaryzowane wg wieku na 100 000 ludności. Dane: GBD 2021, IHME. Analiza: GBD Research Hub. 95% UI dostępne w dashboardzie online: gbd-hub.pl/dashboard</p>
        <p class="sample-note mb-0">Dane przykładowe — szablon do wypełnienia rzeczywistymi szacunkami.</p>
        <div class="bar"><span>GBD Research Hub | [instytucja]</span><span>gbd-hub.pl | [email]</span></div>
      </div>`;
    C.lineChart(document.getElementById("op-trend"), [
      { name: "Polska", ref: true, data: series(pl, "daly") },
      { name: v.name, color: C.GROUP.ncd.base, data: series(v, "daly") }
    ], { label: "Trend DALY", height: 240, table: false, unit: "DALY na 100 tys." });
    C.polandMap(document.getElementById("op-map"), D.voiv, "daly", { selected: [id], names: false, table: false, label: "DALY na 100 tys. — województwa" });
  }
  function profileInit() {
    const host = document.getElementById("p-list");
    host.innerHTML = [...D.voiv].sort((a, b) => a.name.localeCompare(b.name, "pl"))
      .map(v => `<button type="button" class="chip" data-id="${v.id}" aria-pressed="false">${esc(v.name)}</button>`).join("");
    host.addEventListener("click", e => { const b = e.target.closest(".chip"); if (b) profile(b.dataset.id); });
    document.getElementById("p-print").addEventListener("click", () => {
      document.body.classList.add("print-profile");
      window.print();
    });
    window.addEventListener("afterprint", () => document.body.classList.remove("print-profile"));
    profile("ma");
  }

  document.addEventListener("DOMContentLoaded", () => {
    overview();
    dashInit();
    cmpInit();
    profileInit();
  });
})();
