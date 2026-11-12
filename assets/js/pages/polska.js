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
  const CMP_COLORS = ["#1f5fa6", "#d85a30", "#534ab7"];
  const PL_COLOR = "#9aa1ab";

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
    C.lineChart(document.getElementById("ov-deaths"), [
      { name: "Ch. układu krążenia", color: "#1f5fa6", data: series(D.poland, "cvd") },
      { name: "Nowotwory", color: "#5a98d8", data: series(D.poland, "cancer") }
    ], { label: "Umieralność z powodu chorób układu krążenia i nowotworów, Polska 1990–2023", height: 260, yMin: 0 });

    const stacks = [
      { label: "1990", yll: 63, yld: 37 },
      { label: "2005", yll: 56, yld: 44 },
      { label: "2023", yll: 49, yld: 51 }
    ];
    document.getElementById("ov-daly").innerHTML = stacks.map(s => `
      <div style="display:grid;grid-template-columns:48px 1fr;gap:10px;align-items:center;margin-bottom:10px">
        <b style="font-variant-numeric:tabular-nums">${s.label}</b>
        <div class="stack"><div style="flex:${s.yll};background:var(--ncd)">YLL ${s.yll}%</div><div style="flex:${s.yld};background:var(--coral)">YLD ${s.yld}%</div></div>
      </div>`).join("");

    const beh = "#d85a30", met = "#534ab7", env = "#9a9483";
    C.hbars(document.getElementById("ov-risks"), [
      { label: "Palenie tytoniu", value: D.poland.tob, color: beh },
      { label: "Wysokie ciśnienie", value: 11.8, color: met },
      { label: "Ryzyko dietetyczne", value: 10.4, color: beh },
      { label: "Wysoki BMI", value: 9.6, color: met },
      { label: "Wysoka glikemia", value: 8.1, color: met },
      { label: "Alkohol", value: D.poland.alc, color: beh },
      { label: "Wysoki LDL", value: 5.5, color: met },
      { label: "Zanieczyszczenie PM2.5", value: 4.2, color: env }
    ], { decimals: 1 });
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
    C.tileMap(document.getElementById("d-map"), ents, key, { decimals: dec, selected: st.level === "pl" ? [] : [st.level], onClick: selectLevel });

    // KPI
    const cur = st.level === "pl" ? null : ents.find(e => e.id === st.level);
    const curVal = cur ? cur[key] : plVal;
    const ranked = [...ents].sort((a, b) => D.indicators[key].higherWorse ? a[key] - b[key] : b[key] - a[key]);
    const v1990 = value(byId(st.level), key, 1990, sex, age);
    const chg = (curVal - v1990) / v1990 * 100;
    const vals = ents.map(e => e[key]);
    const k3 = cur
      ? `<div class="kpi"><div class="k-label">Pozycja</div><div class="k-value">${ranked.findIndex(e => e.id === cur.id) + 1}/16</div><div class="k-note">1 = najkorzystniej</div></div>`
      : `<div class="kpi"><div class="k-label">Rozpiętość</div><div class="k-value" style="font-size:1.15rem;padding:.3em 0">${fmt(Math.min(...vals), dec)}–${fmt(Math.max(...vals), dec)}</div><div class="k-note">między województwami</div></div>`;
    const diff = cur ? (curVal - plVal) / plVal * 100 : null;
    document.getElementById("d-kpis").innerHTML = `
      <div class="kpi"><div class="k-label">${esc(cur ? cur.name : "Polska")}</div><div class="k-value" style="color:var(--ncd)">${fmt(curVal, dec)}</div><div class="k-note">${year}</div></div>
      <div class="kpi"><div class="k-label">Polska</div><div class="k-value">${fmt(plVal, dec)}</div><div class="k-note">${cur ? (diff >= 0 ? "+" : "") + fmt(diff, 1) + "% różnicy" : "średnia krajowa"}</div></div>
      ${k3}
      <div class="kpi"><div class="k-label">Zmiana od 1990</div><div class="k-value" style="color:${better(key, curVal, v1990) ? "var(--ncd)" : "var(--cmnn)"}">${chg >= 0 ? "+" : ""}${fmt(chg, 0)}%</div><div class="k-note">1990 → ${year}</div></div>`;

    // trend (nie przerysowujemy przy przesuwaniu suwaka roku)
    if (!fromSlider) {
      const s = [{ name: "Polska", color: cur ? PL_COLOR : "#1f5fa6", data: seriesAdj(D.poland, key, sex, age), dash: !!cur }];
      if (cur) s.push({ name: cur.name, color: "#1f5fa6", data: seriesAdj(cur, key, sex, age) });
      document.getElementById("d-trend-title").textContent = "Trend 1990–2023: " + (cur ? cur.name + " na tle Polski" : "Polska ogółem");
      document.getElementById("d-trend-sub").textContent = D.indicators[key].label + " · " + unit;
      C.lineChart(document.getElementById("d-trend"), s, { label: "Trend wskaźnika", height: 280, decimals: dec });
    }

    // ranking
    const col = C.colorScale(vals, D.indicators[key].higherWorse);
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
    const rows = cmp.sel.map((id, i) => ({ label: byId(id).name, value: byId(id)[key], color: CMP_COLORS[i] }));
    rows.push({ label: "Polska (średnia)", value: D.poland[key], color: PL_COLOR, bold: true });
    C.hbars(document.getElementById("c-bars"), rows, { decimals: dec, max: key === "le" ? Math.max(...rows.map(r => r.value)) * 1.02 : undefined });
    const s = cmp.sel.map((id, i) => ({ name: byId(id).name, color: CMP_COLORS[i], data: series(byId(id), key) }));
    s.push({ name: "Polska", color: PL_COLOR, data: series(D.poland, key), dash: true });
    C.lineChart(document.getElementById("c-trend"), s, { label: "Porównanie trendów", height: 280, decimals: dec });
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
      { name: "Polska", color: PL_COLOR, data: series(pl, "daly"), dash: true },
      { name: v.name, color: "#d85a30", data: series(v, "daly") }
    ], { label: "Trend DALY", height: 230, width: 560 });
    C.tileMap(document.getElementById("op-map"), D.voiv, "daly", { selected: [id] });
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
