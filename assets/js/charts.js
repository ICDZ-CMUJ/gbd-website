/* =========================================================================
   GBD Research Hub — biblioteka wykresów (SVG, bez zależności).

   Zasady (spójne na całej stronie):
   - wykres rysowany w rzeczywistej szerokości kontenera (tekst zawsze ~12px,
     także na telefonie); przerysowanie przy zmianie rozmiaru,
   - linie 2px, zaokrąglone końce słupków 4px (prosto przy osi), siatka 1px,
     przerwy 2px w kolorze tła między stykającymi się polami,
   - tekst zawsze w kolorach atramentu, kolor danych tylko na znakach,
   - każdy wykres: tooltip (mysz + klawiatura) i widok tabeli,
   - kolory przyczyn wg konwencji GBD: grupa I czerwień, NCD niebieski,
     urazy zieleń; skale wartości: niebieski (korzystniej) → szary → czerwony.
   ========================================================================= */
(function () {
  "use strict";

  const INK = "#1d232b", INK2 = "#444b55", INK3 = "#6b7280", GRID = "#e8e5de", AXIS = "#cfcabf";
  const REF = "#9aa1ab";
  /* skala rozbieżna 7 klas: korzystnie (niebieski) → neutralnie (szary) → niekorzystnie (czerwony) */
  const DIV = ["#174a85", "#3f7fbf", "#9dc1e6", "#e4e1da", "#f2b5a0", "#d9603e", "#a3231c"];
  const GROUP = {
    cmnn: { name: "Choroby zakaźne, matczyne, noworodkowe i żywieniowe", short: "Zakaźne, matczyne, noworodkowe, żywieniowe", base: "#c0392b",
      ramp: ["#8e2a1f", "#b13427", "#c84a3c", "#d6665a", "#e18479", "#e9a197", "#f0bcb4"] },
    ncd: { name: "Choroby niezakaźne", short: "Niezakaźne (NCD)", base: "#1f5fa6",
      ramp: ["#123f73", "#1a5293", "#1f5fa6", "#2f6fb6", "#427fc2", "#5890cc", "#6ea0d5", "#86b1dd", "#9dc1e5", "#2a6aa9", "#3a78b8", "#4c87c4"] },
    inj: { name: "Urazy", short: "Urazy", base: "#0b7d57",
      ramp: ["#05583d", "#0b7d57", "#2a9572", "#4caa8b", "#71bea4"] }
  };
  const reduceMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fmt = (v, d = 0) => Number(v).toLocaleString("pl-PL", { minimumFractionDigits: d, maximumFractionDigits: d });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const f1 = n => Math.round(n * 10) / 10;
  const textW = (s, size = 12, bold) => String(s).length * size * (bold ? 0.58 : 0.53);
  const compact = new Intl.NumberFormat("pl-PL", { notation: "compact", maximumFractionDigits: 1 });
  const signed = (v, d = 1) => (v > 0 ? "+" : v < 0 ? "−" : "") + fmt(Math.abs(v), d);

  function hex2rgb(h) { const n = parseInt(h.replace("#", ""), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function luminance(c) {
    const m = c.startsWith("#") ? hex2rgb(c) : c.match(/\d+/g).map(Number);
    return (m[0] * 299 + m[1] * 587 + m[2] * 114) / 1000;
  }
  const isDark = c => luminance(c) < 150;
  const onFill = c => isDark(c) ? "#ffffff" : INK;

  /* ---------- skale ---------- */
  function niceTicks(min, max, count = 5) {
    if (min === max) { min -= 1; max += 1; }
    const raw = (max - min) / count, mag = Math.pow(10, Math.floor(Math.log10(raw))), e = raw / mag;
    const step = (e >= 7.5 ? 10 : e >= 3.5 ? 5 : e >= 1.5 ? 2 : 1) * mag;
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, ticks = [];
    for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(10));
    return { ticks, lo, hi, step };
  }
  function tickFmt(hi, step) {
    if (Math.abs(hi) >= 10000) return v => compact.format(v);
    const d = step < 1 ? (step < 0.1 ? 2 : 1) : 0;
    return v => fmt(v, d);
  }
  /* Skala rozbieżna wokół punktu odniesienia (np. średnia krajowa). */
  function divergingScale(values, mid, higherWorse = true) {
    const maxDev = Math.max(...values.map(v => Math.abs(v - mid))) || 1;
    const cls = v => { let t = (v - mid) / maxDev; if (!higherWorse) t = -t; return Math.max(0, Math.min(6, Math.round(t * 3) + 3)); };
    return { mid, maxDev, cls, color: v => DIV[cls(v)], higherWorse };
  }
  /* Zgodność wsteczna: skala rozbieżna wokół średniej. */
  function colorScale(values, higherWorse = true) {
    const mid = values.reduce((a, b) => a + b, 0) / values.length;
    return divergingScale(values, mid, higherWorse).color;
  }

  /* ---------- krzywa monotoniczna (Fritsch–Carlson) ---------- */
  function monotone(pts) {
    const n = pts.length, r = v => Math.round(v * 10) / 10;
    if (!n) return "";
    if (n < 3) return pts.map((p, i) => (i ? "L" : "M") + r(p[0]) + "," + r(p[1])).join("");
    const dx = [], m = [], t = [];
    for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i]; }
    t[0] = m[0]; t[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (m[i] === 0) { t[i] = t[i + 1] = 0; continue; }
      const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
      if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
    }
    let d = "M" + r(pts[0][0]) + "," + r(pts[0][1]);
    for (let i = 0; i < n - 1; i++) {
      const h = dx[i] / 3;
      d += "C" + r(pts[i][0] + h) + "," + r(pts[i][1] + t[i] * h) + " " + r(pts[i + 1][0] - h) + "," + r(pts[i + 1][1] - t[i + 1] * h) + " " + r(pts[i + 1][0]) + "," + r(pts[i + 1][1]);
    }
    return d;
  }
  const bandPath = (upper, lower) => monotone(upper) + "L" + monotone([...lower].reverse()).slice(1) + "Z";
  /* prostokąt zaokrąglony tylko na końcu danych (prosto przy osi) */
  function barRight(x, y, w, h, r = 4) {
    if (w <= 0) return "";
    r = Math.min(r, w, h / 2);
    return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
  }

  /* etykieta kategorii po lewej: zawija do 2 linii, gdy nie mieści się w kolumnie */
  function sideLabel(x, cy, text, maxW, cls) {
    if (textW(text, 13) <= maxW) return `<text x="${x}" y="${cy + 4.5}" text-anchor="end" class="${cls}">${esc(text)}</text>`;
    const lines = wrapText(text, maxW, 12, 2) || [fitText(text, maxW, 12)];
    return `<text x="${x}" y="${cy + 4.5 - (lines.length - 1) * 6.5}" text-anchor="end" class="${cls}" style="font-size:12px">${lines.map((l, j) => `<tspan x="${x}" dy="${j ? 13 : 0}">${esc(l)}</tspan>`).join("")}</text>`;
  }

  /* ---------- tooltip ---------- */
  let tipEl;
  function tip() {
    if (!tipEl) { tipEl = document.createElement("div"); tipEl.className = "viz-tip"; tipEl.setAttribute("role", "status"); document.body.appendChild(tipEl); }
    return tipEl;
  }
  function showTip(ev, build) {
    const t = tip(); t.replaceChildren(); build(t); t.classList.add("on");
    let x, y;
    if (ev && ev.clientX != null && ev.type && ev.type.startsWith("pointer") || ev && ev.type === "mousemove") { x = ev.clientX; y = ev.clientY; }
    else { const r = (ev.currentTarget || ev.target || ev).getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + 4; }
    const w = t.offsetWidth, h = t.offsetHeight, pad = 14;
    let left = x + pad, top = y - h - pad;
    if (left + w > innerWidth - 8) left = Math.max(8, x - w - pad);
    if (top < 8) top = y + pad + 6;
    t.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  }
  const hideTip = () => tipEl && tipEl.classList.remove("on");
  function tTitle(t, text, sub) {
    const d = document.createElement("div"); d.className = "tt-title"; d.textContent = text; t.appendChild(d);
    if (sub) { const s = document.createElement("div"); s.className = "tt-sub"; s.textContent = sub; t.appendChild(s); }
  }
  function tRow(t, { color, value, label, kind = "line", note }) {
    const r = document.createElement("div"); r.className = "tt-row";
    const k = document.createElement("i"); k.className = "tt-key " + kind; if (color) k.style.background = color;
    const v = document.createElement("b"); v.textContent = value;
    const l = document.createElement("span"); l.textContent = label || "";
    r.append(k, v, l); t.appendChild(r);
    if (note) { const n = document.createElement("div"); n.className = "tt-note"; n.textContent = note; t.appendChild(n); }
  }
  function tNote(t, text) { const n = document.createElement("div"); n.className = "tt-note"; n.textContent = text; t.appendChild(n); }
  if (typeof window !== "undefined") window.addEventListener("scroll", hideTip, { passive: true });

  /* ---------- montaż responsywny + animacja przy wejściu w widok ---------- */
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("viz-play"); io.unobserve(e.target); }
  }), { threshold: 0.25 }) : null;

  function mount(el, render) {
    if (!el) return;
    el.__render = render;
    el.classList.add("viz");
    const w = Math.round(el.clientWidth || el.getBoundingClientRect().width || 640);
    const first = !el.__drawn;
    el.__w = w;
    render(Math.max(260, w));
    el.__drawn = true;
    if (first && !reduceMotion && io) { el.classList.add("viz-anim"); io.observe(el); }
    else el.classList.add("viz-play");
    if (!el.__ro && "ResizeObserver" in window) {
      el.__ro = new ResizeObserver(() => {
        const nw = Math.round(el.clientWidth);
        if (nw && Math.abs(nw - el.__w) > 4) {
          el.__w = nw; clearTimeout(el.__t);
          el.__t = setTimeout(() => el.__render(Math.max(260, nw)), 120);
        }
      });
      el.__ro.observe(el);
    }
  }
  function host(el, cls) {
    el.replaceChildren();
    const d = document.createElement("div"); d.className = "viz-body " + (cls || "");
    el.appendChild(d); return d;
  }
  function legendHTML(items) {
    return `<div class="viz-legend">${items.map(i => `<span><i class="lk ${i.kind || "line"}" style="background:${i.color}"></i>${esc(i.label)}</span>`).join("")}</div>`;
  }
  /* Widok tabeli — dostępny odpowiednik każdego wykresu */
  function tableView(el, headers, rows, caption) {
    const d = document.createElement("details"); d.className = "viz-table";
    const s = document.createElement("summary"); s.textContent = "Pokaż dane w tabeli"; d.appendChild(s);
    const wrap = document.createElement("div"); wrap.className = "table-wrap";
    const tb = document.createElement("table"); tb.className = "data";
    if (caption) { const c = document.createElement("caption"); c.className = "sr-only"; c.textContent = caption; tb.appendChild(c); }
    const th = document.createElement("thead"), tr = document.createElement("tr");
    headers.forEach((h, i) => { const x = document.createElement("th"); x.textContent = h; if (i) x.className = "num"; tr.appendChild(x); });
    th.appendChild(tr); tb.appendChild(th);
    const body = document.createElement("tbody");
    rows.forEach(r => { const row = document.createElement("tr"); r.forEach((c, i) => { const td = document.createElement("td"); td.textContent = c; if (i) td.className = "num"; row.appendChild(td); }); body.appendChild(row); });
    tb.appendChild(body); wrap.appendChild(tb); d.appendChild(wrap); el.appendChild(d);
  }

  /* =======================================================================
     1. Wykres liniowy: trendy z przedziałem niepewności 95% UI
     series: [{ name, color, data:[{year,value,lower?,upper?}], ref? }]
     ======================================================================= */
  function lineChart(el, series, opts = {}) {
    series = series.filter(s => s.data && s.data.length);
    if (!series.length) { el.innerHTML = ""; return; }
    mount(el, W => {
      const H = opts.height || 300, narrow = W < 520;
      const allV = series.flatMap(s => s.data.flatMap(p => [p.value, p.lower ?? p.value, p.upper ?? p.value]));
      let mn = Math.min(...allV), mx = Math.max(...allV);
      const pad = (mx - mn) * 0.08 || 1;
      const nt = niceTicks(opts.yMin != null ? Math.min(opts.yMin, mn) : mn - pad, mx + pad, H < 250 ? 4 : 5);
      const yf = tickFmt(nt.hi, nt.step);
      const dec = opts.decimals != null ? opts.decimals : (nt.step < 1 ? 1 : 0);
      const years = series[0].data.map(d => d.year), x0 = years[0], x1 = years[years.length - 1];
      const endLabels = opts.endLabels !== false && !narrow;
      const endW = endLabels ? Math.min(170, 22 + Math.max(...series.map(s => textW(fmt(s.data[s.data.length - 1].value, dec), 12.5, true) + 6 + textW(s.name, 12)))) : 14;
      const m = { t: 18, r: endW, b: 30, l: 14 + Math.max(...nt.ticks.map(v => textW(yf(v), 11.5))) };
      const X = y => m.l + (y - x0) / (x1 - x0 || 1) * (W - m.l - m.r);
      const Y = v => H - m.b - (v - nt.lo) / (nt.hi - nt.lo) * (H - m.t - m.b);
      const single = series.length === 1;
      let s = "";
      /* adnotacje (np. pandemia COVID-19) */
      (opts.annotations || [{ from: 2020, to: 2021, label: "COVID-19" }]).forEach(a => {
        if (a.from < x0 || a.to > x1) return;
        const ax = X(a.from) - 3, aw = X(a.to) - X(a.from) + 6;
        s += `<rect x="${ax}" y="${m.t}" width="${aw}" height="${H - m.t - m.b}" fill="#f3f1ec"/>
          <text x="${ax + aw / 2}" y="${m.t - 5}" text-anchor="middle" class="t-ann">${esc(a.label)}</text>`;
      });
      nt.ticks.forEach(v => {
        s += `<line x1="${m.l}" x2="${W - m.r + 6}" y1="${Y(v)}" y2="${Y(v)}" stroke="${v === nt.lo ? AXIS : GRID}"/>
          <text x="${m.l - 8}" y="${Y(v) + 4}" text-anchor="end" class="t-axis">${yf(v)}</text>`;
      });
      const xstep = narrow ? 10 : 5;
      for (let y = Math.ceil(x0 / xstep) * xstep; y <= x1; y += xstep) {
        if (x1 % xstep && X(x1) - X(y) < 34) continue;
        s += `<line x1="${X(y)}" x2="${X(y)}" y1="${H - m.b}" y2="${H - m.b + 4}" stroke="${AXIS}"/><text x="${X(y)}" y="${H - 10}" text-anchor="middle" class="t-axis">${y}</text>`;
      }
      if (x1 % xstep) s += `<text x="${X(x1)}" y="${H - 10}" text-anchor="middle" class="t-axis t-strong">${x1}</text>`;
      /* przedziały niepewności i obszary */
      const order = [...series].sort((a, b) => (b.ref ? 1 : 0) - (a.ref ? 1 : 0));
      order.forEach((sr, i) => {
        const col = sr.ref ? REF : sr.color, pts = sr.data.map(p => [X(p.year), Y(p.value)]);
        const hasUI = opts.band !== false && sr.data[0].lower != null && !sr.ref;
        if (hasUI) s += `<path class="viz-band" d="${bandPath(sr.data.map(p => [X(p.year), Y(p.upper)]), sr.data.map(p => [X(p.year), Y(p.lower)]))}" fill="${col}" fill-opacity="${single ? .14 : .1}"/>`;
        else if (single && opts.area !== false) {
          const gid = "g" + Math.random().toString(36).slice(2, 8);
          s += `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".16"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
            <path class="viz-band" d="${monotone(pts)}L${pts[pts.length - 1][0]},${H - m.b}L${pts[0][0]},${H - m.b}Z" fill="url(#${gid})"/>`;
        }
      });
      order.forEach(sr => {
        const col = sr.ref ? REF : sr.color, pts = sr.data.map(p => [X(p.year), Y(p.value)]);
        s += `<path class="viz-line" pathLength="1" d="${monotone(pts)}" fill="none" stroke="${col}" stroke-width="${sr.ref ? 1.75 : 2}" stroke-linecap="round" stroke-linejoin="round"/>`;
      });
      /* etykiety końcowe z liniami prowadzącymi */
      const ends = series.map(sr => { const p = sr.data[sr.data.length - 1]; return { sr, y: Y(p.value), y0: Y(p.value), v: p.value }; }).sort((a, b) => a.y - b.y);
      if (endLabels) {
        const gap = 17;
        for (let it = 0; it < 30; it++) for (let i = 1; i < ends.length; i++) {
          const o = ends[i].y - ends[i - 1].y;
          if (o < gap) { const d = (gap - o) / 2; ends[i].y += d; ends[i - 1].y -= d; }
        }
        ends.forEach(e => { e.y = Math.max(m.t + 4, Math.min(H - m.b - 2, e.y)); });
      }
      ends.forEach(e => {
        const col = e.sr.ref ? REF : e.sr.color, xe = X(x1);
        s += `<circle class="viz-dot" cx="${xe}" cy="${e.y0}" r="4.5" fill="${col}" stroke="#fff" stroke-width="2"/>`;
        if (endLabels) {
          const lx = xe + 12;
          if (Math.abs(e.y - e.y0) > 2) s += `<path d="M${xe + 6},${e.y0}C${xe + 9},${e.y0} ${xe + 7},${e.y} ${lx - 3},${e.y}" stroke="${AXIS}" fill="none"/>`;
          s += `<text x="${lx}" y="${e.y + 4}" class="t-end"><tspan class="t-val">${fmt(e.v, dec)}</tspan><tspan dx="6" class="t-name">${esc(e.sr.name)}</tspan></text>`;
        }
      });
      s += `<g class="viz-cross" visibility="hidden"><line y1="${m.t}" y2="${H - m.b}" stroke="${INK3}" stroke-width="1"/>${series.map((sr, i) => `<circle r="5" fill="${sr.ref ? REF : sr.color}" stroke="#fff" stroke-width="2" data-i="${i}"/>`).join("")}</g>
        <rect class="viz-hit" x="${m.l}" y="0" width="${W - m.l - m.r + 6}" height="${H}" fill="transparent"/>`;

      const b = host(el);
      b.innerHTML = (series.length > 1 && opts.legend !== false ? legendHTML(series.map(sr => ({ label: sr.name, color: sr.ref ? REF : sr.color }))) : "") +
        `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" tabindex="0" aria-label="${esc(opts.label || "Wykres trendu")}. Użyj strzałek, aby przeglądać lata.">${s}</svg>` +
        (series.some(sr => sr.data[0].lower != null) && opts.band !== false ? `<p class="viz-foot"><i class="band-key"></i>cieniowanie: 95% przedział niepewności (UI)</p>` : "");
      const svg = b.querySelector("svg"), cross = svg.querySelector(".viz-cross"), hit = svg.querySelector(".viz-hit");
      let cur = null;
      const show = (yr, ev) => {
        cur = Math.max(x0, Math.min(x1, yr));
        cross.setAttribute("visibility", "visible");
        cross.querySelector("line").setAttribute("x1", X(cur)); cross.querySelector("line").setAttribute("x2", X(cur));
        cross.querySelectorAll("circle").forEach(c => {
          const p = series[+c.dataset.i].data.find(d => d.year === cur);
          if (p) { c.setAttribute("cx", X(cur)); c.setAttribute("cy", Y(p.value)); }
        });
        const rect = svg.getBoundingClientRect();
        const evPos = ev && ev.clientX != null ? ev : { clientX: rect.left + X(cur), clientY: rect.top + m.t + 10, type: "pointermove" };
        showTip(evPos, t => {
          tTitle(t, String(cur), opts.unit);
          series.map(sr => ({ sr, p: sr.data.find(d => d.year === cur) })).filter(o => o.p).sort((a, b) => b.p.value - a.p.value).forEach(({ sr, p }) => {
            tRow(t, { color: sr.ref ? REF : sr.color, value: fmt(p.value, dec), label: sr.name, note: p.lower != null && !sr.ref ? `95% UI: ${fmt(p.lower, dec)}–${fmt(p.upper, dec)}` : null });
          });
        });
      };
      const hide = () => { cross.setAttribute("visibility", "hidden"); hideTip(); };
      hit.addEventListener("pointermove", ev => {
        const r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) * W / r.width;
        show(Math.round(x0 + (x - m.l) / (W - m.l - m.r) * (x1 - x0)), ev);
      });
      hit.addEventListener("pointerleave", hide);
      svg.addEventListener("focus", () => show(cur ?? x1));
      svg.addEventListener("blur", hide);
      svg.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); show((cur ?? x1) + (e.key === "ArrowLeft" ? -1 : 1)); }
        if (e.key === "Escape") hide();
      });
      if (opts.table !== false) {
        const step = years.length > 12 ? 1 : 1;
        tableView(el, ["Rok", ...series.map(sr => sr.name)], years.filter((_, i) => i % step === 0).map(y => [String(y), ...series.map(sr => {
          const p = sr.data.find(d => d.year === y); return p ? fmt(p.value, dec) + (p.lower != null ? ` (${fmt(p.lower, dec)}–${fmt(p.upper, dec)})` : "") : "—";
        })]), opts.label);
      }
    });
  }

  /* =======================================================================
     2. Słupki poziome (ranking) z 95% UI i linią odniesienia
     rows: [{ label, value, lower?, upper?, color?, ref?, bold? }]
     opts: { decimals, max, ref:{ value, label }, unit }
     ======================================================================= */
  function hbars(el, rows, opts = {}) {
    mount(el, W => {
      const dec = opts.decimals || 0, narrow = W < 520;
      const band = opts.band || (narrow ? 34 : 36), th = Math.min(20, band - 14);
      const top = opts.ref ? 24 : 4;
      const lw = Math.min(narrow ? 118 : 176, 14 + Math.max(...rows.map(r => textW(r.label, 13, r.bold))));
      const valW = 14 + Math.max(...rows.map(r => textW(fmt(r.value, dec), 12.5, true)));
      const maxV = opts.max || Math.max(...rows.map(r => r.upper ?? r.value), opts.ref ? opts.ref.value : 0) * 1.03;
      const H = top + rows.length * band + 6;
      const X = v => lw + Math.max(0, v) / maxV * (W - lw - valW - 4);
      let s = "";
      const nt = niceTicks(0, maxV, narrow ? 3 : 4);
      nt.ticks.filter(v => v <= maxV).forEach(v => { s += `<line x1="${X(v)}" x2="${X(v)}" y1="${top - 2}" y2="${H - 4}" stroke="${v === 0 ? AXIS : GRID}"/>`; });
      rows.forEach((r, i) => {
        const y = top + i * band, cy = y + band / 2, col = r.ref ? REF : (r.color || GROUP.ncd.base);
        const hi = r.upper ?? r.value;
        s += `<g class="viz-row" data-i="${i}" tabindex="0" role="listitem" aria-label="${esc(r.label)}: ${fmt(r.value, dec)}">
          <rect x="0" y="${y}" width="${W}" height="${band}" fill="transparent"/>
          ${sideLabel(lw - 10, cy, r.label, lw - 14, "t-label" + (r.bold ? " t-strong" : ""))}
          <path class="viz-bar" d="${barRight(X(0), cy - th / 2, X(r.value) - X(0), th)}" fill="${col}"/>
          ${r.lower != null ? `<path d="M${X(r.lower)},${cy}H${X(r.upper)}M${X(r.lower)},${cy - 5}v10M${X(r.upper)},${cy - 5}v10" stroke="${INK}" stroke-opacity=".55" stroke-width="1.25" fill="none"/>` : ""}
          <text x="${X(hi) + 7}" y="${cy + 4.5}" class="t-val">${fmt(r.value, dec)}</text></g>`;
      });
      if (opts.ref) {
        const rx = X(opts.ref.value);
        s += `<line x1="${rx}" x2="${rx}" y1="${top - 6}" y2="${H - 4}" stroke="${INK2}" stroke-width="1.25"/>
          <text x="${rx}" y="${top - 10}" text-anchor="${rx > W - 90 ? "end" : "middle"}" class="t-ann t-strong">${esc(opts.ref.label)}</text>`;
      }
      const b = host(el);
      b.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="list" aria-label="${esc(opts.label || "Ranking")}">${s}</svg>`;
      const svg = b.querySelector("svg");
      svg.querySelectorAll(".viz-row").forEach(g => {
        const r = rows[+g.dataset.i];
        const on = ev => {
          svg.classList.add("viz-focus"); g.classList.add("on");
          showTip(ev, t => {
            tTitle(t, r.label, opts.unit);
            tRow(t, { color: r.ref ? REF : (r.color || GROUP.ncd.base), value: fmt(r.value, dec), label: opts.valueLabel || "wartość", kind: "box",
              note: r.lower != null ? `95% UI: ${fmt(r.lower, dec)}–${fmt(r.upper, dec)}` : null });
            if (opts.ref && !r.ref) tNote(t, `${signed((r.value - opts.ref.value) / opts.ref.value * 100)}% vs ${opts.ref.label}`);
          });
        };
        const off = () => { svg.classList.remove("viz-focus"); g.classList.remove("on"); hideTip(); };
        g.addEventListener("pointermove", on); g.addEventListener("pointerleave", off);
        g.addEventListener("focus", on); g.addEventListener("blur", off);
      });
      if (opts.table !== false) tableView(el, [opts.labelHeader || "Kategoria", "Wartość"], rows.map(r => [r.label, fmt(r.value, dec) + (r.lower != null ? ` (${fmt(r.lower, dec)}–${fmt(r.upper, dec)})` : "")]), opts.label);
    });
  }

  /* =======================================================================
     3. Kartogram — prawdziwe granice (assets/js/geo.js)
     ======================================================================= */
  function scaleLegend(sc, dec, unit, refName, narrow) {
    const lo = sc.mid - sc.maxDev * (sc.higherWorse ? 1 : -1), hi = sc.mid + sc.maxDev * (sc.higherWorse ? 1 : -1);
    return `<div class="viz-scale">
      <div class="sw">${DIV.map((c, i) => `<i style="background:${c}"${i === 3 ? ' class="mid"' : ""}></i>`).join("")}</div>
      <div class="lbl"><span>${fmt(sc.higherWorse ? lo : hi, dec)}</span><span class="m">${esc(refName)}: ${fmt(sc.mid, dec)}</span><span>${fmt(sc.higherWorse ? hi : lo, dec)}</span></div>
      <div class="lbl dir"><span>← korzystniej</span>${narrow ? "" : `<span>${esc(unit || "")}</span>`}<span>mniej korzystnie →</span></div></div>`;
  }

  function choropleth(el, geo, entities, key, opts) {
    const ind = (window.GBD && GBD.indicators[key]) || { higherWorse: true, unit: "" };
    const higherWorse = opts.higherWorse != null ? opts.higherWorse : ind.higherWorse;
    const dec = opts.decimals || 0;
    mount(el, W => {
      const narrow = W < 480, k = W / geo.width, H = Math.round(geo.height * k);
      const vals = entities.map(e => e[key]).concat(opts.extra ? opts.extra.map(e => e.value) : []);
      const mid = opts.mid != null ? opts.mid : vals.reduce((a, b) => a + b, 0) / vals.length;
      const sc = divergingScale(vals, mid, higherWorse);
      const fs = px => (px / k).toFixed(1);
      let s = `<g transform="scale(${k})">`;
      (geo.context || []).forEach(d => { s += `<path d="${d}" fill="#efede7" stroke="#fff" stroke-width="${(1 / k).toFixed(2)}"/>`; });
      if (opts.extra) opts.extra.forEach((x, xi) => {
        x.paths.forEach(d => { s += `<path class="viz-region viz-extra" data-x="${xi}" d="${d}" fill="${sc.color(x.value)}" fill-opacity=".38" stroke="#fff" stroke-width="${(1 / k).toFixed(2)}"/>`; });
      });
      entities.forEach(e => {
        const g = geo.shapes[e.id]; if (!g) return;
        s += `<path class="viz-region" data-id="${e.id}" d="${g.d}" fill="${sc.color(e[key])}" stroke="#fff" stroke-width="${(1.5 / k).toFixed(2)}" stroke-linejoin="round" tabindex="0" role="${opts.onClick ? "button" : "img"}" aria-label="${esc(e.name)}: ${fmt(e[key], dec)}"/>`;
      });
      (opts.selected || []).forEach(id => { const g = geo.shapes[id]; if (g) s += `<path d="${g.d}" fill="none" stroke="${INK}" stroke-width="${(2.5 / k).toFixed(2)}" stroke-linejoin="round" pointer-events="none"/>`; });
      s += `<path class="viz-hover" fill="none" stroke="${INK}" stroke-width="${(1.5 / k).toFixed(2)}" pointer-events="none" d=""/>`;
      if (opts.labels !== false) entities.forEach(e => {
        const g = geo.shapes[e.id]; if (!g || (opts.skipLabels || []).includes(e.id)) return;
        const fill = sc.color(e[key]), c = onFill(fill);
        const showName = !narrow && opts.names !== false;
        s += `<g pointer-events="none" class="viz-maplabel">${showName ? `<text x="${g.cx}" y="${g.cy - fs(3)}" text-anchor="middle" font-size="${fs(10.5)}" fill="${c}" fill-opacity=".9">${esc(opts.shortName ? opts.shortName(e) : e.name)}</text>` : ""}
          <text x="${g.cx}" y="${showName ? +g.cy + +fs(11) : +g.cy + +fs(4.5)}" text-anchor="middle" font-size="${fs(narrow ? 11 : 13)}" font-weight="650" fill="${c}" style="font-variant-numeric:tabular-nums">${fmt(e[key], dec)}</text></g>`;
      });
      if (opts.extra) opts.extra.forEach(x => { if (x.label) s += `<g pointer-events="none"><text x="${x.label[0]}" y="${x.label[1]}" text-anchor="middle" font-size="${fs(10.5)}" fill="${INK2}">${esc(x.short || x.name)}</text><text x="${x.label[0]}" y="${+x.label[1] + +fs(15)}" text-anchor="middle" font-size="${fs(13)}" font-weight="650" fill="${INK}">${fmt(x.value, dec)}</text></g>`; });
      s += "</g>";
      const b = host(el);
      b.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="group" aria-label="${esc(opts.label || "Mapa")}">${s}</svg>` + scaleLegend(sc, dec, opts.unit || ind.unit, opts.refName || "średnia", narrow);
      const svg = b.querySelector("svg"), hov = svg.querySelector(".viz-hover");
      svg.querySelectorAll(".viz-region").forEach(p => {
        const isX = p.classList.contains("viz-extra");
        const e = isX ? null : entities.find(x => x.id === p.dataset.id);
        const x = isX ? opts.extra[+p.dataset.x] : null;
        const name = isX ? x.name : e.name, v = isX ? x.value : e[key];
        const on = ev => {
          if (!isX) hov.setAttribute("d", p.getAttribute("d"));
          showTip(ev, t => {
            tTitle(t, name, opts.unit || ind.unit);
            tRow(t, { color: sc.color(v), value: fmt(v, dec), label: ind.label || "", kind: "box" });
            const diff = (v - mid) / mid * 100;
            tNote(t, `${signed(diff)}% vs ${opts.refName || "średnia"} (${fmt(mid, dec)})`);
            if (opts.rank && !isX) tNote(t, opts.rank(e));
          });
        };
        const off = () => { hov.setAttribute("d", ""); hideTip(); };
        p.addEventListener("pointermove", on); p.addEventListener("pointerleave", off);
        p.addEventListener("focus", on); p.addEventListener("blur", off);
        if (opts.onClick && !isX) {
          p.style.cursor = "pointer";
          p.addEventListener("click", () => opts.onClick(e.id));
          p.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); opts.onClick(e.id); } });
        }
      });
      if (opts.table !== false) tableView(el, [opts.entityLabel || "Region", (ind.label || "Wartość") + (opts.unit || ind.unit ? " (" + (opts.unit || ind.unit) + ")" : "")],
        [...entities].sort((a, b) => a[key] - b[key]).map(e => [e.name, fmt(e[key], dec)]).concat(opts.extra ? opts.extra.map(x => [x.name, fmt(x.value, dec)]) : []), opts.label);
    });
  }

  const SHORT_VOIV = { "Warmińsko-mazurskie": "Warm.-maz.", "Kujawsko-pomorskie": "Kuj.-pom.", "Zachodniopomorskie": "Zach.-pom.", "Świętokrzyskie": "Świętokrz.", "Dolnośląskie": "Dolnośląskie" };
  function polandMap(el, entities, key, opts = {}) {
    if (!window.GBDGeo) return tileFallback(el, entities, key, opts);
    const G = GBDGeo.poland;
    choropleth(el, { width: G.width, height: G.height, shapes: G.regions }, entities, key, Object.assign({
      refName: "Polska", entityLabel: "Województwo", label: "Mapa województw",
      mid: window.GBD && GBD.poland ? GBD.poland[key] : undefined,
      shortName: e => SHORT_VOIV[e.name] || e.name
    }, opts));
  }
  function europeMap(el, entities, key, opts = {}) {
    if (!window.GBDGeo) return;
    const G = GBDGeo.europe;
    choropleth(el, { width: G.width, height: G.height, shapes: G.cee, context: G.other }, entities, key, Object.assign({
      entityLabel: "Kraj", label: "Mapa Europy Środkowo-Wschodniej", names: false, skipLabels: ["si"]
    }, opts, opts.west ? { extra: [{ name: opts.west.name, short: "Europa Zach.", value: opts.west.value, paths: G.west, label: G.westLabel || [120, 300] }] } : {}));
  }
  /* awaryjny kartogram kafelkowy (gdy brak geo.js) */
  function tileFallback(el, entities, key, opts) {
    const ind = (window.GBD && GBD.indicators[key]) || { higherWorse: true };
    const vals = entities.map(e => e[key]), sc = divergingScale(vals, opts.mid ?? vals.reduce((a, b) => a + b) / vals.length, ind.higherWorse);
    el.innerHTML = `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">${entities.map(e => `<div style="grid-column:${e.col + 1};grid-row:${e.row + 1};background:${sc.color(e[key])};color:${onFill(sc.color(e[key]))};border-radius:8px;padding:8px;font-size:.75rem">${esc(e.name)}<b style="display:block;font-size:1rem">${fmt(e[key], opts.decimals || 0)}</b></div>`).join("")}</div>`;
  }

  /* =======================================================================
     4. Heatmapa (tabela) — skala rozbieżna względem średniej kolumny
     ======================================================================= */
  function heatmap(el, rows, cols, opts = {}) {
    const ref = opts.refRows || rows.filter(r => !r.isRef);
    const scales = Object.fromEntries(cols.map(c => {
      const ind = (window.GBD && GBD.indicators[c.key]) || { higherWorse: true };
      const vals = ref.map(r => r[c.key]);
      return [c.key, divergingScale(rows.map(r => r[c.key]), vals.reduce((a, b) => a + b, 0) / vals.length, ind.higherWorse)];
    }));
    const draw = (data, sortKey, dir) => {
      el.classList.add("viz");
      el.innerHTML = `<div class="table-wrap heat-wrap"><table class="data heat"><thead><tr><th>${esc(opts.rowLabel || "")}</th>${cols.map(c => `<th class="num"><button type="button" data-sort="${c.key}" class="sort${sortKey === c.key ? " on" : ""}" aria-label="Sortuj: ${esc(c.label)}">${esc(c.label)}<span aria-hidden="true">${sortKey === c.key ? (dir === "asc" ? " ↑" : " ↓") : " ↕"}</span></button></th>`).join("")}</tr></thead>
        <tbody>${data.map(r => `<tr class="${r.highlight ? "hl" : ""}${r.isRef ? " ref" : ""}"><th scope="row">${esc(r.name)}</th>${cols.map(c => {
          const bg = scales[c.key].color(r[c.key]);
          return `<td class="num"><span class="cell" style="background:${bg};color:${onFill(bg)}" data-r="${esc(r.name)}" data-c="${esc(c.label)}" data-v="${fmt(r[c.key], c.decimals || 0)}" data-bg="${bg}">${fmt(r[c.key], c.decimals || 0)}</span></td>`;
        }).join("")}</tr>`).join("")}</tbody></table></div>
        <div class="viz-scale compact"><div class="sw">${DIV.map((c, i) => `<i style="background:${c}"${i === 3 ? ' class="mid"' : ""}></i>`).join("")}</div><div class="lbl dir"><span>← korzystniej niż średnia CEE</span><span>mniej korzystnie →</span></div></div>`;
      el.querySelectorAll("button[data-sort]").forEach(btn => btn.addEventListener("click", () => {
        const k = btn.dataset.sort, nd = sortKey === k && dir === "asc" ? "desc" : "asc";
        draw([...rows].sort((a, b) => nd === "asc" ? a[k] - b[k] : b[k] - a[k]), k, nd);
      }));
      el.querySelectorAll(".cell").forEach(c => {
        const on = ev => showTip(ev, t => { tTitle(t, c.dataset.r); tRow(t, { color: c.dataset.bg, value: c.dataset.v, label: c.dataset.c, kind: "box" }); });
        c.addEventListener("pointermove", on); c.addEventListener("pointerleave", hideTip);
      });
    };
    draw(rows);
  }

  /* =======================================================================
     5. Treemapa przyczyn (styl GBD Compare): grupa → przyczyna poziomu 2 → poziomu 3
     nodes: [{ name, value, group:'cmnn'|'ncd'|'inj', parent }]
     ======================================================================= */
  function squarify(items, x, y, w, h) {
    const out = [], total = items.reduce((a, b) => a + b.value, 0);
    if (!total) return out;
    const scale = w * h / total;
    let rest = items.map(i => Object.assign({}, i, { area: i.value * scale })).sort((a, b) => b.area - a.area);
    const worst = (row, side) => { const s = row.reduce((a, b) => a + b.area, 0), mx = Math.max(...row.map(r => r.area)), mn = Math.min(...row.map(r => r.area)); return Math.max(side * side * mx / (s * s), (s * s) / (side * side * mn)); };
    while (rest.length) {
      const side = Math.min(w, h); let row = [rest[0]], i = 1;
      while (i < rest.length && worst(row.concat(rest[i]), side) <= worst(row, side)) { row.push(rest[i]); i++; }
      rest = rest.slice(i);
      const s = row.reduce((a, b) => a + b.area, 0);
      if (w >= h) { const cw = s / h; let cy = y; row.forEach(r => { const rh = r.area / cw; out.push(Object.assign(r, { x, y: cy, w: cw, h: rh })); cy += rh; }); x += cw; w -= cw; }
      else { const ch = s / w; let cx = x; row.forEach(r => { const rw = r.area / ch; out.push(Object.assign(r, { x: cx, y, w: rw, h: ch })); cx += rw; }); y += ch; h -= ch; }
    }
    return out;
  }
  function treemap(el, nodes, opts = {}) {
    mount(el, W => {
      const H = opts.height || Math.round(Math.min(560, Math.max(320, W * (opts.ratio || 0.62))));
      const total = nodes.reduce((a, b) => a + b.value, 0), unit = opts.unit || "DALY na 100 tys.";
      const groups = ["ncd", "inj", "cmnn"].map(g => ({ id: g, value: nodes.filter(n => n.group === g).reduce((a, b) => a + b.value, 0) })).filter(g => g.value);
      const cells = [];
      squarify(groups, 0, 0, W, H).forEach(g => {
        const parents = {};
        nodes.filter(n => n.group === g.id).forEach(n => { (parents[n.parent || n.name] = parents[n.parent || n.name] || []).push(n); });
        const plist = Object.entries(parents).map(([p, ch]) => ({ id: p, value: ch.reduce((a, b) => a + b.value, 0), ch })).sort((a, b) => b.value - a.value);
        plist.forEach((p, i) => { p.color = GROUP[g.id].ramp[i % GROUP[g.id].ramp.length]; });
        squarify(plist, g.x, g.y, g.w, g.h).forEach(p => {
          squarify(p.ch, p.x, p.y, p.w, p.h).forEach(c => cells.push(Object.assign(c, { color: p.color, parentName: p.id, parentValue: p.value })));
        });
      });
      let s = "";
      cells.forEach((c, i) => {
        const x = c.x + 1, y = c.y + 1, w = Math.max(0, c.w - 2), h = Math.max(0, c.h - 2), ink = onFill(c.color);
        const pct = c.value / total * 100;
        /* etykieta tylko gdy się mieści (zawijana do 2–3 linii); inaczej nazwa w tooltipie i tabeli */
        const size = w > 120 && h > 60 ? 13 : 11.5, lines = wrapText(c.name, w - 14, size, h > 70 ? 3 : 2);
        const fits = lines && w > 46 && h > 22 + (lines.length - 1) * (size + 2);
        const showPct = fits && h > 24 + lines.length * (size + 3) + 12;
        s += `<g class="viz-cell" data-i="${i}" tabindex="0" role="listitem" aria-label="${esc(c.name)}: ${fmt(pct, 1)}% DALY">
          <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${c.color}"/>
          ${fits ? `<text x="${x + 7}" y="${y + size + 5}" fill="${ink}" font-size="${size}" font-weight="600">${lines.map((l, j) => `<tspan x="${x + 7}" dy="${j ? size + 2 : 0}">${esc(l)}</tspan>`).join("")}</text>` : ""}
          ${showPct ? `<text x="${x + 7}" y="${y + size + 7 + lines.length * (size + 2) + 4}" fill="${ink}" fill-opacity=".85" font-size="12" style="font-variant-numeric:tabular-nums">${fmt(pct, 1)}%</text>` : ""}</g>`;
      });
      const b = host(el);
      b.innerHTML = (opts.legend !== false ? legendHTML(groups.map(g => ({ label: `${GROUP[g.id].short} · ${fmt(g.value / total * 100, 0)}%`, color: GROUP[g.id].base, kind: "box" }))) : "") +
        `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="list" aria-label="${esc(opts.label || "Treemapa przyczyn")}">${s}</svg>`;
      const svg = b.querySelector("svg");
      svg.querySelectorAll(".viz-cell").forEach(g => {
        const c = cells[+g.dataset.i];
        const on = ev => {
          svg.classList.add("viz-focus"); g.classList.add("on");
          showTip(ev, t => {
            tTitle(t, c.name, c.parentName !== c.name ? c.parentName : GROUP[c.group].name);
            tRow(t, { color: c.color, value: fmt(c.value / total * 100, 1) + "%", label: "wszystkich DALY", kind: "box" });
            tNote(t, `${fmt(c.value)} ${unit}`);
          });
        };
        const off = () => { svg.classList.remove("viz-focus"); g.classList.remove("on"); hideTip(); };
        g.addEventListener("pointermove", on); g.addEventListener("pointerleave", off);
        g.addEventListener("focus", on); g.addEventListener("blur", off);
      });
      if (opts.table !== false) tableView(el, ["Przyczyna", "Grupa", unit, "% DALY"], [...nodes].sort((a, b) => b.value - a.value).map(n => [n.name, GROUP[n.group].short, fmt(n.value), fmt(n.value / total * 100, 1)]), opts.label);
    });
  }
  /* zawija tekst do maks. n linii; null, gdy słowo się nie mieści */
  function wrapText(s, w, size, n) {
    const words = String(s).split(" "), lines = [];
    let cur = "";
    for (const wd of words) {
      if (textW(wd, size, true) > w) return null;
      const t = cur ? cur + " " + wd : wd;
      if (textW(t, size, true) <= w) cur = t; else { lines.push(cur); cur = wd; }
    }
    if (cur) lines.push(cur);
    return lines.length <= n ? lines : null;
  }
  function fitText(s, w, size) {
    if (textW(s, size, true) <= w) return s;
    let t = s; while (t.length > 3 && textW(t + "…", size, true) > w) t = t.slice(0, -1);
    return t.length > 3 ? t.trimEnd() + "…" : "";
  }

  /* =======================================================================
     6. Diagram strzałkowy rang (styl GBD Compare)
     data: { from:'1990', to:'2023', items:[{ name, group, r1, r2, change }] }
     ======================================================================= */
  function arrowDiagram(el, data, opts = {}) {
    mount(el, W => {
      const narrow = W < 560, n = data.items.length, rowH = narrow ? 32 : 34, boxH = rowH - 6, top = 30;
      const chgW = narrow ? 0 : 76, gapW = narrow ? 30 : Math.min(120, W * 0.12);
      const bw = (W - chgW - gapW) / 2;
      const H = top + n * rowH + 4;
      const L = [...data.items].sort((a, b) => a.r1 - b.r1), R = [...data.items].sort((a, b) => a.r2 - b.r2);
      const yOf = r => top + (r - 1) * rowH + rowH / 2;
      const tint = { cmnn: "#f9e3df", ncd: "#e4eef9", inj: "#dcf0e7" };
      let s = `<text x="${bw / 2}" y="16" text-anchor="middle" class="t-head">${esc(data.from)}</text>
        <text x="${bw + gapW + bw / 2}" y="16" text-anchor="middle" class="t-head">${esc(data.to)}</text>
        ${chgW ? `<text x="${W - 4}" y="16" text-anchor="end" class="t-ann">${esc(opts.changeLabel || "zmiana wsk. stand.")}</text>` : ""}`;
      data.items.forEach((it, i) => {
        const y1 = yOf(it.r1), y2 = yOf(it.r2), x1 = bw, x2 = bw + gapW, c = GROUP[it.group].base;
        const down = it.r2 > it.r1;
        s += `<path class="viz-arrow" data-i="${i}" d="M${x1 + 2},${y1}C${x1 + gapW * .5},${y1} ${x2 - gapW * .5},${y2} ${x2 - 2},${y2}" fill="none" stroke="${c}" stroke-width="2" ${down ? 'stroke-dasharray="5 4"' : ""} stroke-linecap="round"/>`;
      });
      const box = (it, x, r, side) => {
        const y = yOf(r) - boxH / 2, i = data.items.indexOf(it), c = GROUP[it.group].base;
        const nameW = bw - 44 - (side === "R" && chgW ? 0 : 0);
        return `<g class="viz-arow" data-i="${i}" tabindex="0" role="listitem" aria-label="${esc(it.name)}: ${data.from} miejsce ${it.r1}, ${data.to} miejsce ${it.r2}">
          <rect x="${x}" y="${y}" width="${bw}" height="${boxH}" rx="5" fill="${tint[it.group]}"/>
          <rect x="${x}" y="${y}" width="5" height="${boxH}" rx="2" fill="${c}"/>
          <text x="${x + 14}" y="${y + boxH / 2 + 4.5}" class="t-rank">${r}</text>
          <text x="${x + 36}" y="${y + boxH / 2 + 4.5}" class="t-label" style="font-size:${textW(it.name, 13) > nameW ? 12 : 13}px">${esc(fitText(it.name, nameW + 6, textW(it.name, 13) > nameW ? 11.4 : 12.4))}</text></g>`;
      };
      L.forEach(it => { s += box(it, 0, it.r1, "L"); });
      R.forEach(it => {
        s += box(it, bw + gapW, it.r2, "R");
        if (chgW && it.change != null) s += `<text x="${W - 4}" y="${yOf(it.r2) + 4.5}" text-anchor="end" class="t-val">${it.change < 0 ? "▼" : "▲"} ${signed(it.change, 0)}%</text>`;
      });
      const b = host(el);
      b.innerHTML = legendHTML([{ label: GROUP.cmnn.short, color: GROUP.cmnn.base, kind: "box" }, { label: GROUP.ncd.short, color: GROUP.ncd.base, kind: "box" }, { label: GROUP.inj.short, color: GROUP.inj.base, kind: "box" }]) +
        `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="list" aria-label="${esc(opts.label || "Ranking przyczyn")}">${s}</svg>
        <p class="viz-foot"><svg width="26" height="8" aria-hidden="true"><path d="M1,4H25" stroke="${INK2}" stroke-width="2"/></svg> awans w rankingu lub bez zmian &nbsp; <svg width="26" height="8" aria-hidden="true"><path d="M1,4H25" stroke="${INK2}" stroke-width="2" stroke-dasharray="5 4"/></svg> spadek w rankingu${chgW ? " · ▲▼ zmiana standaryzowanego współczynnika" : ""}</p>`;
      const svg = b.querySelector("svg");
      const hl = i => { svg.classList.add("viz-focus"); svg.querySelectorAll(`[data-i="${i}"]`).forEach(x => x.classList.add("on")); };
      const un = () => { svg.classList.remove("viz-focus"); svg.querySelectorAll(".on").forEach(x => x.classList.remove("on")); hideTip(); };
      svg.querySelectorAll(".viz-arow, .viz-arrow").forEach(g => {
        const it = data.items[+g.dataset.i];
        const on = ev => { un(); hl(g.dataset.i); showTip(ev, t => {
          tTitle(t, it.name, GROUP[it.group].name);
          tRow(t, { color: GROUP[it.group].base, value: `#${it.r1} → #${it.r2}`, label: `${data.from} → ${data.to}` });
          if (it.change != null) tNote(t, `Zmiana standaryzowanego współczynnika: ${signed(it.change, 0)}%`);
        }); };
        g.addEventListener("pointermove", on); g.addEventListener("pointerleave", un);
        g.addEventListener("focus", on); g.addEventListener("blur", un);
      });
      if (opts.table !== false) tableView(el, ["Przyczyna", "Miejsce " + data.from, "Miejsce " + data.to, "Zmiana wsk. (%)"], R.map(it => [it.name, String(it.r1), String(it.r2), it.change != null ? signed(it.change, 0) : "—"]), opts.label);
    });
  }

  /* =======================================================================
     7. Udziały w czasie (100% obszar skumulowany), np. YLL vs YLD
     data: { years:[...], series:[{ name, color, values:[...] }] }
     ======================================================================= */
  function stackedShare(el, data, opts = {}) {
    mount(el, W => {
      const H = opts.height || 240, narrow = W < 520;
      const m = { t: 10, r: narrow ? 10 : 64, b: 28, l: 40 };
      const yrs = data.years, x0 = yrs[0], x1 = yrs[yrs.length - 1];
      const X = y => m.l + (y - x0) / (x1 - x0) * (W - m.l - m.r), Y = v => H - m.b - v / 100 * (H - m.t - m.b);
      const tot = yrs.map((_, i) => data.series.reduce((a, s) => a + s.values[i], 0));
      let acc = yrs.map(() => 0), s = "";
      [0, 25, 50, 75, 100].forEach(v => { s += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="${v ? GRID : AXIS}"/><text x="${m.l - 8}" y="${Y(v) + 4}" text-anchor="end" class="t-axis">${v}%</text>`; });
      const layers = data.series.map(sr => {
        const lo = acc.slice(), hi = acc.map((a, i) => a + sr.values[i] / tot[i] * 100); acc = hi;
        return { sr, lo, hi };
      });
      layers.forEach(({ sr, lo, hi }) => {
        const up = yrs.map((y, i) => [X(y), Y(hi[i])]), dn = yrs.map((y, i) => [X(y), Y(lo[i])]);
        s += `<path class="viz-band" d="${bandPath(up, dn)}" fill="${sr.color}"/>`;
      });
      layers.slice(0, -1).forEach(({ hi }) => { s += `<path d="${monotone(yrs.map((y, i) => [X(y), Y(hi[i])]))}" fill="none" stroke="#fff" stroke-width="2"/>`; });
      layers.forEach(({ sr, lo, hi }) => {
        const i = yrs.length - 1, mid = (lo[i] + hi[i]) / 2, sh = hi[i] - lo[i];
        if (!narrow) s += `<text x="${W - m.r + 8}" y="${Y(mid) - 2}" class="t-val">${fmt(sh, 0)}%</text><text x="${W - m.r + 8}" y="${Y(mid) + 13}" class="t-axis">${esc(sr.name)}</text>`;
        const j = 0, m0 = (lo[j] + hi[j]) / 2;
        if (!narrow && hi[j] - lo[j] > 14) s += `<text x="${X(x0) + 10}" y="${Y(m0) + 4}" fill="${onFill(sr.color)}" font-size="12" font-weight="600">${esc(sr.name)} ${fmt(hi[j] - lo[j], 0)}%</text>`;
      });
      for (let y = Math.ceil(x0 / 5) * 5; y <= x1; y += narrow ? 10 : 5) s += `<text x="${X(y)}" y="${H - 9}" text-anchor="middle" class="t-axis">${y}</text>`;
      s += `<g class="viz-cross" visibility="hidden"><line y1="${m.t}" y2="${H - m.b}" stroke="${INK}" stroke-opacity=".6"/></g><rect class="viz-hit" x="${m.l}" y="0" width="${W - m.l - m.r}" height="${H}" fill="transparent"/>`;
      const b = host(el);
      b.innerHTML = legendHTML(data.series.map(sr => ({ label: sr.name, color: sr.color, kind: "box" }))) + `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label || "Udziały w czasie")}">${s}</svg>`;
      const svg = b.querySelector("svg"), cross = svg.querySelector(".viz-cross"), ln = cross.querySelector("line");
      svg.querySelector(".viz-hit").addEventListener("pointermove", ev => {
        const r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) * W / r.width;
        const yr = Math.max(x0, Math.min(x1, Math.round(x0 + (x - m.l) / (W - m.l - m.r) * (x1 - x0)))), i = yrs.indexOf(yr);
        ln.setAttribute("x1", X(yr)); ln.setAttribute("x2", X(yr)); cross.setAttribute("visibility", "visible");
        showTip(ev, t => { tTitle(t, String(yr), opts.unit); [...layers].reverse().forEach(({ sr, lo, hi }) => tRow(t, { color: sr.color, value: fmt(hi[i] - lo[i], 0) + "%", label: sr.name, kind: "box" })); });
      });
      svg.querySelector(".viz-hit").addEventListener("pointerleave", () => { cross.setAttribute("visibility", "hidden"); hideTip(); });
      if (opts.table !== false) tableView(el, ["Rok", ...data.series.map(s => s.name + " (%)")], yrs.map((y, i) => [String(y), ...layers.map(l => fmt(l.hi[i] - l.lo[i], 0))]), opts.label);
    });
  }

  /* =======================================================================
     8. Wykres hantlowy: zmiana A → B (np. 1990 → 2023)
     rows: [{ label, a, b, highlight?, ref? }]
     ======================================================================= */
  function dumbbell(el, rows, opts = {}) {
    mount(el, W => {
      const dec = opts.decimals != null ? opts.decimals : 1, narrow = W < 520, band = 32;
      const lw = Math.min(narrow ? 104 : 160, 14 + Math.max(...rows.map(r => textW(r.label, 13, r.highlight))));
      const vals = rows.flatMap(r => [r.a, r.b]);
      const nt = niceTicks(Math.min(...vals), Math.max(...vals), narrow ? 3 : 5);
      const top = 8, H = top + rows.length * band + 28, right = narrow ? 34 : 44;
      const X = v => lw + (v - nt.lo) / (nt.hi - nt.lo) * (W - lw - right);
      const cA = opts.colorA || "#b7b1a5", cB = opts.colorB || GROUP.ncd.base;
      let s = "";
      nt.ticks.forEach(v => { s += `<line x1="${X(v)}" x2="${X(v)}" y1="${top}" y2="${H - 24}" stroke="${GRID}"/><text x="${X(v)}" y="${H - 8}" text-anchor="middle" class="t-axis">${fmt(v, nt.step < 1 ? 1 : 0)}</text>`; });
      rows.forEach((r, i) => {
        const cy = top + i * band + band / 2, colB = r.ref ? REF : r.highlight ? (opts.highlightColor || "#d85a30") : cB;
        const rightSide = r.b >= r.a;
        s += `<g class="viz-row" data-i="${i}" tabindex="0" role="listitem" aria-label="${esc(r.label)}: ${fmt(r.a, dec)} → ${fmt(r.b, dec)}">
          <rect x="0" y="${cy - band / 2}" width="${W}" height="${band}" fill="transparent"/>
          ${sideLabel(lw - 12, cy, r.label, lw - 16, "t-label" + (r.highlight || r.ref ? " t-strong" : ""))}
          <line class="viz-dbar" x1="${X(r.a)}" x2="${X(r.b)}" y1="${cy}" y2="${cy}" stroke="${colB}" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/>
          <circle cx="${X(r.a)}" cy="${cy}" r="5" fill="${cA}" stroke="#fff" stroke-width="2"/>
          <circle class="viz-dot" cx="${X(r.b)}" cy="${cy}" r="6" fill="${colB}" stroke="#fff" stroke-width="2"/>
          <text x="${X(r.b) + (rightSide ? 11 : -11)}" y="${cy + 4.5}" text-anchor="${rightSide ? "start" : "end"}" class="t-val">${fmt(r.b, dec)}</text></g>`;
      });
      const b = host(el);
      b.innerHTML = legendHTML([{ label: opts.aLabel || "1990", color: cA, kind: "dot" }, { label: opts.bLabel || "2023", color: cB, kind: "dot" }]) +
        `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="list" aria-label="${esc(opts.label || "Zmiana")}">${s}</svg>`;
      const svg = b.querySelector("svg");
      svg.querySelectorAll(".viz-row").forEach(g => {
        const r = rows[+g.dataset.i];
        const on = ev => { svg.classList.add("viz-focus"); g.classList.add("on"); showTip(ev, t => {
          tTitle(t, r.label, opts.unit);
          tRow(t, { color: r.ref ? REF : r.highlight ? (opts.highlightColor || "#d85a30") : cB, value: fmt(r.b, dec), label: opts.bLabel || "2023", kind: "dot" });
          tRow(t, { color: cA, value: fmt(r.a, dec), label: opts.aLabel || "1990", kind: "dot" });
          tNote(t, `Zmiana: ${signed(r.b - r.a, dec)}`);
        }); };
        const off = () => { svg.classList.remove("viz-focus"); g.classList.remove("on"); hideTip(); };
        g.addEventListener("pointermove", on); g.addEventListener("pointerleave", off);
        g.addEventListener("focus", on); g.addEventListener("blur", off);
      });
      if (opts.table !== false) tableView(el, ["Kraj", opts.aLabel || "1990", opts.bLabel || "2023", "Zmiana"], rows.map(r => [r.label, fmt(r.a, dec), fmt(r.b, dec), signed(r.b - r.a, dec)]), opts.label);
    });
  }

  /* =======================================================================
     9. Sparkline (do kafelków KPI) — zwraca znacznik SVG
     ======================================================================= */
  function sparkline(data, opts = {}) {
    const W = opts.width || 120, H = opts.height || 30, c = opts.color || GROUP.ncd.base;
    const v = data.map(d => d.value), mn = Math.min(...v), mx = Math.max(...v);
    const X = i => 3 + i / (v.length - 1) * (W - 8), Y = x => 3 + (1 - (x - mn) / (mx - mn || 1)) * (H - 6);
    const pts = v.map((x, i) => [X(i), Y(x)]);
    const hi = opts.highlightIndex != null ? opts.highlightIndex : v.length - 1;
    return `<svg class="spark" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${monotone(pts)}" fill="none" stroke="${REF}" stroke-width="1.5"/><circle cx="${pts[hi][0]}" cy="${pts[hi][1]}" r="3.5" fill="${c}" stroke="#fff" stroke-width="1.5"/></svg>`;
  }

  /* ---------- Interaktywne drzewo hierarchii (bez zmian w API) ---------- */
  const TONE = {
    red: ["var(--cmnn-tint)", "var(--cmnn-dark)", "pill red"], blue: ["var(--ncd-tint)", "var(--ncd-dark)", "pill blue"],
    green: ["var(--inj-tint)", "var(--inj-dark)", "pill green"], coral: ["var(--coral-tint)", "var(--coral-dark)", "pill coral"],
    purple: ["var(--purple-tint)", "var(--purple-dark)", "pill purple"], sand: ["var(--sand-2)", "var(--ink)", "pill"]
  };
  function tree(el, data, opts = {}) {
    el.innerHTML = `<ul class="tree">${data.map((l1, i) => {
      const t = TONE[l1.tone] || TONE.sand;
      return `<li class="tree-l1"><details${opts.openFirst && i === 0 ? " open" : ""}>
        <summary style="background:${t[0]};color:${t[1]}"><span>${esc(l1.name)}<br><small style="font-weight:400;opacity:.85">${esc(l1.en || "")}</small></span>
          <span class="count">${l1.groups.length} grup · rozwiń</span></summary>
        <ul class="tree-l2">${l1.groups.map(g => `<li><details><summary><span>${esc(g.name)}${g.note ? ` <span class="${t[2]}" style="font-size:.78rem;padding:1px 9px">${esc(g.note)}</span>` : ""}</span></summary>
          <div class="tree-l3">${g.items.map(it => `<span class="${t[2]}">${esc(it)}</span>`).join("")}</div></details></li>`).join("")}</ul>
      </details></li>`;
    }).join("")}</ul>
    <div class="mt-1" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn btn-ghost" data-tree="open">Rozwiń wszystko</button><button type="button" class="btn btn-ghost" data-tree="close">Zwiń wszystko</button></div>`;
    el.querySelector('[data-tree="open"]').addEventListener("click", () => el.querySelectorAll("details").forEach(d => d.open = true));
    el.querySelector('[data-tree="close"]').addEventListener("click", () => el.querySelectorAll("details").forEach(d => d.open = false));
  }

  /* legenda skali (zgodność wsteczna) */
  function legendScale(el, min, max, higherWorse, unit, decimals = 0) {
    const sc = divergingScale([min, max], (min + max) / 2, higherWorse);
    el.innerHTML = scaleLegend(sc, decimals, unit, "średnia", false);
  }

  window.GBDCharts = {
    lineChart, hbars, tileMap: polandMap, polandMap, europeMap, heatmap, treemap, arrowDiagram, stackedShare, dumbbell, sparkline, tree,
    colorScale, divergingScale, legendScale, isDark, onFill, fmt, esc, signed, DIV, GROUP, REF,
    tooltip: { show: showTip, hide: hideTip, title: tTitle, row: tRow, note: tNote }
  };
})();
