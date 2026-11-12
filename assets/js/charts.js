/* =========================================================================
   GBD Research Hub — lekkie wykresy SVG bez zależności.
   Skala map/heatmap w stylu GBD Compare: niebieski (korzystnie) → czerwony
   (niekorzystnie), z neutralnym środkiem.
   ========================================================================= */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const SEQ = ["#2166ac", "#67a9cf", "#d1e5f0", "#fddbc7", "#ef8a62", "#b2182b"];
  const fmt = (v, d = 0) => Number(v).toLocaleString("pl-PL", { minimumFractionDigits: d, maximumFractionDigits: d });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* Interpolacja koloru w skali rozbieżnej */
  function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function lerp(a, b, t) { const A = hex2rgb(a), B = hex2rgb(b); return "rgb(" + A.map((x, i) => Math.round(x + (B[i] - x) * t)).join(",") + ")"; }
  function colorScale(values, higherWorse = true) {
    const min = Math.min(...values), max = Math.max(...values);
    return v => {
      let t = max === min ? .5 : (v - min) / (max - min);
      if (!higherWorse) t = 1 - t;
      const seg = Math.min(SEQ.length - 2, Math.floor(t * (SEQ.length - 1)));
      const local = t * (SEQ.length - 1) - seg;
      return lerp(SEQ[seg], SEQ[seg + 1], local);
    };
  }
  /* Czy tekst na kolorze ma być jasny */
  function isDark(rgb) { const m = rgb.match(/\d+/g).map(Number); return (m[0] * 299 + m[1] * 587 + m[2] * 114) / 1000 < 150; }

  function legendScale(el, min, max, higherWorse, unit, decimals = 0) {
    const stops = (higherWorse ? SEQ : [...SEQ].reverse()).map((c, i) => `${c} ${i / (SEQ.length - 1) * 100}%`).join(",");
    el.innerHTML = `<div style="display:flex;align-items:center;gap:10px;font-size:.82rem;color:var(--ink-3)">
      <span>${fmt(min, decimals)}</span>
      <span style="flex:1;height:10px;border-radius:5px;background:linear-gradient(90deg,${stops})"></span>
      <span>${fmt(max, decimals)}</span><span>${esc(unit || "")}</span></div>`;
  }

  /* ---------- Wykres liniowy ---------- */
  function lineChart(el, series, opts = {}) {
    const W = opts.width || 720, H = opts.height || 300, m = { t: 16, r: 110, b: 32, l: 52 };
    const all = series.flatMap(s => s.data);
    if (!all.length) { el.innerHTML = ""; return; }
    const xs = all.map(d => d.year), ys = all.map(d => d.value);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    let y0 = opts.yMin != null ? opts.yMin : Math.min(...ys), y1 = Math.max(...ys);
    const pad = (y1 - y0) * .08 || 1; y0 = opts.yMin != null ? y0 : y0 - pad; y1 += pad;
    const X = x => m.l + (x - x0) / (x1 - x0 || 1) * (W - m.l - m.r);
    const Y = y => H - m.b - (y - y0) / (y1 - y0) * (H - m.t - m.b);
    const ticks = 5, dec = opts.decimals != null ? opts.decimals : (y1 - y0 < 20 ? 1 : 0);
    let g = "";
    for (let i = 0; i <= ticks; i++) {
      const v = y0 + (y1 - y0) * i / ticks;
      g += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="#e7e4dc"/>
            <text x="${m.l - 8}" y="${Y(v) + 4}" text-anchor="end">${fmt(v, dec)}</text>`;
    }
    const step = (x1 - x0) > 20 ? 5 : 1;
    for (let yr = Math.ceil(x0 / step) * step; yr <= x1; yr += step)
      g += `<text x="${X(yr)}" y="${H - 10}" text-anchor="middle">${yr}</text>`;
    // etykiety końcowe bez nakładania
    const ends = series.map(s => ({ s, y: Y(s.data[s.data.length - 1].value) })).sort((a, b) => a.y - b.y);
    for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 15) ends[i].y = ends[i - 1].y + 15;
    const paths = series.map(s => {
      const d = s.data.map((p, i) => (i ? "L" : "M") + X(p.year).toFixed(1) + "," + Y(p.value).toFixed(1)).join("");
      const last = s.data[s.data.length - 1];
      const ly = ends.find(e => e.s === s).y;
      return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2.5}" ${s.dash ? 'stroke-dasharray="5 4"' : ""} stroke-linejoin="round" stroke-linecap="round"/>
        <circle cx="${X(last.year)}" cy="${Y(last.value)}" r="3.5" fill="${s.color}"/>
        <text x="${X(last.year) + 8}" y="${ly + 4}" style="fill:${s.color};font-weight:600">${esc(s.name)}</text>`;
    }).join("");
    el.innerHTML = `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label || "Wykres trendu")}">${g}${paths}
      <line class="hover-line" x1="0" x2="0" y1="${m.t}" y2="${H - m.b}" stroke="#9aa1ab" stroke-dasharray="3 3" visibility="hidden"/>
      <rect x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}" fill="transparent" class="hover-zone"/></svg>
      <div class="chart-tip" style="position:absolute;pointer-events:none;background:#1d232b;color:#fff;font-size:.8rem;padding:6px 9px;border-radius:7px;display:none;white-space:nowrap"></div></div>`;
    const wrap = el.querySelector(".chart"); wrap.style.position = "relative";
    const svg = wrap.querySelector("svg"), zone = svg.querySelector(".hover-zone"), line = svg.querySelector(".hover-line"), tip = wrap.querySelector(".chart-tip");
    zone.addEventListener("mousemove", e => {
      const r = svg.getBoundingClientRect(), sx = (e.clientX - r.left) * W / r.width;
      const yr = Math.round(x0 + (sx - m.l) / (W - m.l - m.r) * (x1 - x0));
      line.setAttribute("x1", X(yr)); line.setAttribute("x2", X(yr)); line.setAttribute("visibility", "visible");
      tip.innerHTML = `<b>${yr}</b><br>` + series.map(s => { const p = s.data.find(d => d.year === yr); return p ? `<span style="color:${s.color === "#9aa1ab" ? "#ddd" : s.color};filter:brightness(1.6)">●</span> ${esc(s.name)}: ${fmt(p.value, dec)}` : ""; }).join("<br>");
      tip.style.display = "block";
      const px = X(yr) / W * r.width;
      tip.style.left = Math.min(px + 12, r.width - tip.offsetWidth) + "px"; tip.style.top = "8px";
    });
    zone.addEventListener("mouseleave", () => { tip.style.display = "none"; line.setAttribute("visibility", "hidden"); });
  }

  /* ---------- Poziome słupki ---------- */
  function hbars(el, rows, opts = {}) {
    const max = opts.max || Math.max(...rows.map(r => r.value)) * 1.05;
    const dec = opts.decimals || 0;
    el.innerHTML = rows.map(r => `
      <div class="hbar"${r.bold ? ' style="font-weight:600"' : ""}>
        <div class="bar-label">${esc(r.label)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:0;background:${r.color}"></div></div>
        <div class="bar-val">${fmt(r.value, dec)}</div>
      </div>`).join("");
    const fills = [...el.querySelectorAll(".bar-fill")];
    requestAnimationFrame(() => fills.forEach((b, i) => { if (rows[i]) b.style.width = (rows[i].value / max * 100) + "%"; }));
  }

  /* ---------- Kartogram kafelkowy województw ---------- */
  function tileMap(el, entities, key, opts = {}) {
    const ind = (window.GBD && GBD.indicators[key]) || { higherWorse: true };
    const vals = entities.map(e => e[key]);
    const col = colorScale(vals, ind.higherWorse);
    const S = 92, G = 6, cols = 5, rows = 4;
    const W = cols * (S + G), H = rows * (S + G);
    const dec = opts.decimals || 0;
    const cells = entities.map(e => {
      const c = col(e[key]), dark = isDark(c), sel = opts.selected && opts.selected.includes(e.id);
      const x = e.col * (S + G), y = e.row * (S + G);
      const short = e.name.length > 13 ? e.name.replace("-", "-\n").split("\n") : [e.name];
      return `<g class="tile" data-id="${e.id}" tabindex="0" role="button" aria-label="${esc(e.name)}: ${fmt(e[key], dec)}" style="cursor:pointer">
        <rect x="${x}" y="${y}" width="${S}" height="${S}" rx="12" fill="${c}" stroke="${sel ? "#1d232b" : "#fff"}" stroke-width="${sel ? 3 : 1}"/>
        ${short.map((s, i) => `<text x="${x + S / 2}" y="${y + 30 + i * 13}" text-anchor="middle" style="font-size:10.5px;fill:${dark ? "#fff" : "#1d232b"}">${esc(s)}</text>`).join("")}
        <text x="${x + S / 2}" y="${y + S - 18}" text-anchor="middle" style="font-size:17px;font-weight:600;fill:${dark ? "#fff" : "#1d232b"}">${fmt(e[key], dec)}</text></g>`;
    }).join("");
    el.innerHTML = `<div class="chart"><svg viewBox="-4 -4 ${W + 8} ${H + 8}" role="group" aria-label="Kartogram województw">${cells}</svg></div><div class="map-legend mt-1"></div>`;
    legendScale(el.querySelector(".map-legend"), Math.min(...vals), Math.max(...vals), ind.higherWorse, ind.unit, dec);
    if (opts.onClick) el.querySelectorAll(".tile").forEach(t => {
      const fire = () => opts.onClick(t.dataset.id);
      t.addEventListener("click", fire);
      t.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fire(); } });
    });
  }

  /* ---------- Heatmapa (wiersze × kolumny) ---------- */
  function heatmap(el, rows, cols, opts = {}) {
    // rows: [{name, ...values}], cols: [{key, label, decimals}]
    const scales = Object.fromEntries(cols.map(c => {
      const ind = (window.GBD && GBD.indicators[c.key]) || { higherWorse: true };
      return [c.key, colorScale(rows.map(r => r[c.key]), ind.higherWorse)];
    }));
    el.innerHTML = `<div class="table-wrap"><table class="data heat"><thead><tr><th>${esc(opts.rowLabel || "")}</th>${cols.map(c => `<th class="num" data-sort="${c.key}" style="cursor:pointer" title="Sortuj">${esc(c.label)} ↕</th>`).join("")}</tr></thead>
      <tbody>${rows.map(r => `<tr${r.highlight ? ' style="font-weight:600"' : ""}><td>${esc(r.name)}</td>${cols.map(c => {
        const bg = scales[c.key](r[c.key]);
        return `<td class="num" style="background:${bg};color:${isDark(bg) ? "#fff" : "#1d232b"}">${fmt(r[c.key], c.decimals || 0)}</td>`;
      }).join("")}</tr>`).join("")}</tbody></table></div>`;
    el.querySelectorAll("th[data-sort]").forEach(th => th.addEventListener("click", () => {
      const k = th.dataset.sort, ind = GBD.indicators[k] || { higherWorse: true };
      const dir = th.dataset.dir === "asc" ? "desc" : "asc";
      const sorted = [...rows].sort((a, b) => dir === "asc" ? a[k] - b[k] : b[k] - a[k]);
      heatmap(el, sorted, cols, opts);
      el.querySelector(`th[data-sort="${k}"]`).dataset.dir = dir;
    }));
  }

  /* ---------- Interaktywne drzewo hierarchii ---------- */
  const TONE = {
    red: ["var(--cmnn-tint)", "var(--cmnn-dark)", "pill red"],
    blue: ["var(--ncd-tint)", "var(--ncd-dark)", "pill blue"],
    green: ["var(--inj-tint)", "var(--inj-dark)", "pill green"],
    coral: ["var(--coral-tint)", "var(--coral-dark)", "pill coral"],
    purple: ["var(--purple-tint)", "var(--purple-dark)", "pill purple"],
    sand: ["var(--sand-2)", "var(--ink)", "pill"]
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

  window.GBDCharts = { lineChart, hbars, tileMap, heatmap, tree, colorScale, legendScale, isDark, fmt, esc, SEQ };
})();
