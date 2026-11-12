/* Metodologia — drzewa hierarchii, wagi niepełnosprawności, piramidy,
   kalkulator DALY, tabela Results Tool, słownik. */
(function () {
  "use strict";
  const fmt1 = v => v.toLocaleString("pl-PL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  /* ---------- Drzewa ---------- */
  function initTrees() {
    const c = document.getElementById("cause-tree");
    const r = document.getElementById("risk-tree");
    if (c && window.GBDCharts && window.GBD) GBDCharts.tree(c, GBD.causeTree);
    if (r && window.GBDCharts && window.GBD) GBDCharts.tree(r, GBD.riskTree);
  }

  /* ---------- Wagi niepełnosprawności ---------- */
  const DW = [
    { g: "Stany łagodne (waga 0.00–0.15)", cls: "dw-mild", rows: [
      ["Łagodna krótkowzroczność", "Niewielkie ograniczenie, korygowane okularami", 0.03],
      ["Cukrzyca bez powikłań", "Kontrolowana lekami, wymaga samodyscypliny", 0.05],
      ["Łagodna niedokrwistość", "Zmęczenie, obniżona wydolność", 0.05]] },
    { g: "Stany umiarkowane (waga 0.15–0.50)", cls: "dw-mod", rows: [
      ["Ból dolnego odcinka kręgosłupa", "Przewlekły ból, ograniczenie aktywności", 0.32],
      ["Umiarkowana depresja", "Trudności w pracy i relacjach, obniżony nastrój", 0.40],
      ["Głuchota", "Całkowita utrata słuchu", 0.33]] },
    { g: "Stany ciężkie (waga 0.50–1.00)", cls: "dw-sev", rows: [
      ["Paraplegia", "Porażenie kończyn dolnych, zależność od wózka", 0.57],
      ["Ciężka schizofrenia", "Halucynacje, dezorganizacja, niezdolność do samodzielności", 0.78],
      ["Faza terminalna nowotworu", "Ból, wyniszczenie, zależność od opieki", 0.93]] }
  ];
  function initWeights() {
    const host = document.getElementById("dw-list");
    if (!host) return;
    let n = 0;
    host.innerHTML = DW.map(grp => `<div class="dw-group">${grp.g}</div>` + grp.rows.map(([name, desc, w]) => {
      n++;
      return `<div class="dw-row ${grp.cls}">
        <div class="n">${n}</div>
        <div><h4>${name}</h4><p>${desc}</p><div class="track"><i style="width:${w * 100}%"></i></div></div>
        <div class="v">${w.toFixed(2)}</div></div>`;
    }).join("")).join("");
    host.insertAdjacentHTML("afterend", '<p class="sample-note mt-1">Wartości przybliżone — do weryfikacji z tabelą wag niepełnosprawności aktualnej edycji GBD.</p>');
  }

  /* ---------- Piramidy wieku ---------- */
  const AGES = ["80+", "65–79", "50–64", "35–49", "20–34", "0–19"];
  function initPyramids() {
    const a = document.getElementById("pyr-a"), b = document.getElementById("pyr-b");
    if (!a || !b) return;
    const A = [95, 90, 74, 58, 42, 32], B = [32, 42, 63, 84, 95, 100];
    const blues = ["#1f5fa6", "#3a7dc6", "#7fb0e3", "#b5d4f4", "#d6e7f9", "#e6f0fa"];
    const reds = ["#c0392b", "#d85a30", "#ef8a62", "#f3c4b3", "#f8ddd2", "#f9ebe5"];
    const row = (w, c, i, lbl) => `<div style="width:${w}%;background:${c};color:${i < 2 ? "#fff" : "var(--ink)"}">${lbl}</div>`;
    a.innerHTML = AGES.map((g, i) => row(A[i], blues[i], i, g)).join("");
    b.innerHTML = AGES.map((g, i) => row(B[i], reds[i], i, g)).join("");
    a.setAttribute("aria-label", "Struktura wieku Kraju A: przewaga osób starszych");
    b.setAttribute("aria-label", "Struktura wieku Kraju B: przewaga osób młodszych");
    a.setAttribute("role", "img"); b.setAttribute("role", "img");
  }

  /* ---------- Kalkulator DALY ---------- */
  const LE = 86.6;
  function initCalc() {
    const on = document.getElementById("r-onset"), de = document.getElementById("r-death"), we = document.getElementById("r-weight");
    if (!on || !de || !we) return;
    const $ = id => document.getElementById(id);
    function update(src) {
      let onset = +on.value, death = +de.value;
      const w = +we.value;
      if (onset > death) {
        if (src === on) { death = onset; de.value = death; } else { onset = death; on.value = onset; }
      }
      const yll = Math.max(0, LE - death);
      const yld = (death - onset) * w;
      const daly = yll + yld;
      $("o-onset").textContent = onset + " lat";
      $("o-death").textContent = death + " lat";
      $("o-weight").textContent = w.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const pct = v => (v / LE * 100) + "%";
      $("seg-h").style.width = pct(onset);
      $("seg-d").style.width = pct(death - onset);
      $("seg-l").style.width = pct(yll);
      $("seg-h").textContent = onset >= 10 ? "Lata w zdrowiu" : "";
      $("seg-d").textContent = death - onset >= 14 ? "Lata z chorobą (× waga = YLD)" : (death - onset >= 6 ? "YLD" : "");
      $("seg-l").textContent = yll >= 22 ? "YLL — lata utracone" : (yll >= 6 ? "YLL" : "");
      $("seg-d").style.borderRadius = onset === 0 ? "8px 0 0 8px" : "0";
      $("death-mark").style.left = pct(death);
      $("bar-yld").style.width = pct(yld);
      $("bar-yll").style.width = pct(yll);
      $("bar-yld").textContent = yld / LE > .07 ? "YLD" : "";
      $("bar-yll").textContent = yll / LE > .07 ? "YLL" : "";
      $("k-yll").textContent = fmt1(yll);
      $("k-yld").textContent = fmt1(yld);
      $("k-daly").textContent = fmt1(daly);
      $("daly-eq").textContent = fmt1(daly);
    }
    [on, de, we].forEach(el => el.addEventListener("input", () => update(el)));
    update();
  }

  /* ---------- Tabela Results Tool ---------- */
  function initResultsTable() {
    const table = document.getElementById("rt-table"), help = document.getElementById("rt-help");
    if (!table || !help) return;
    let pinned = null;
    const mark = col => {
      table.querySelectorAll("[data-col]").forEach(c => c.classList.toggle("on", c.dataset.col === col));
      help.querySelectorAll("[data-col]").forEach(c => c.classList.toggle("on", c.dataset.col === col));
    };
    table.querySelectorAll("th[data-col]").forEach(th => {
      th.tabIndex = 0;
      th.addEventListener("mouseenter", () => mark(th.dataset.col));
      th.addEventListener("mouseleave", () => mark(pinned));
      const pin = () => { pinned = pinned === th.dataset.col ? null : th.dataset.col; mark(pinned); };
      th.addEventListener("click", pin);
      th.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pin(); } });
    });
  }

  /* ---------- Słownik ---------- */
  const GLOSSARY = [
    ["Age-standardised rate", "wskaźnik standaryzowany wg wieku", "Wskaźnik przeliczony na standardową strukturę wiekową populacji GBD. Usuwa wpływ różnic w strukturze wieku, dzięki czemu można porównywać kraje, regiony i lata."],
    ["Attributable burden", "obciążenie przypisywalne", "Część obciążenia chorobą, którą można przypisać konkretnemu czynnikowi ryzyka (np. ile DALY z powodu raka płuca jest przypisywanych paleniu tytoniu)."],
    ["Cause of death", "przyczyna zgonu", "Choroba lub uraz, który zapoczątkował ciąg zdarzeń prowadzących do zgonu (wyjściowa przyczyna zgonu). GBD przypisuje każdy zgon dokładnie jednej przyczynie z hierarchii GBD."],
    ["CODEm", "Cause of Death Ensemble model", "Narzędzie modelowania przyczyn zgonów, które testuje wiele modeli statystycznych i łączy najlepsze z nich w zespół (ensemble). Wyniki są następnie uzgadniane z ogólną liczbą zgonów przez CoDCorrect."],
    ["Counterfactual", "scenariusz kontrfaktyczny", "Hipotetyczny scenariusz porównawczy, w którym ekspozycja na dany czynnik ryzyka jest na minimalnym poziomie (tzw. theoretical minimum risk exposure level, TMREL). GBD szacuje obciążenie przypisywalne danym czynnikom ryzyka, porównując stan rzeczywisty z tym scenariuszem."],
    ["DALY", "Disability-Adjusted Life Years", "Lata życia utracone z powodu przedwczesnej śmierci i niepełnosprawności; suma YLL i YLD. Jedna jednostka DALY odpowiada jednemu utraconemu rokowi życia w pełnym zdrowiu."],
    ["Disability weight", "waga niepełnosprawności", "Waga niepełnosprawności, wartość od 0 (pełne zdrowie) do 1 (odpowiednik zgonu), przypisana danemu stanowi zdrowotnemu. Wagi są ustalane na podstawie badań ankietowych prowadzonych w wielu krajach."],
    ["DisMod-MR", "Disease Modelling – Meta-Regression", "Bayesowski model meta-regresyjny GBD, który łączy dane o zapadalności, chorobowości, remisji i umieralności w spójny wewnętrznie obraz choroby — także przy niekompletnych danych."],
    ["Envelope", "„koperta” zgonów", "Łączna liczba zgonów (ze wszystkich przyczyn) w danej populacji, wieku, płci i roku, oszacowana niezależnie od przyczyn. Szacunki dla poszczególnych przyczyn muszą się w niej mieścić — sumują się do koperty."],
    ["Garbage codes", "kody nieużyteczne analitycznie", "Kody ICD wpisane jako przyczyna zgonu, które nie mogą lub nie powinny nią być (np. „niewydolność serca”, „zatrzymanie krążenia”). GBD redystrybuuje je do właściwych przyczyn zgonów."],
    ["HALE", "Health-Adjusted Life Expectancy", "Oczekiwana długość życia w zdrowiu — liczba lat, jakie osoba może przeżyć w pełnym zdrowiu, uwzględniając ryzyko zgonu i niepełnosprawności."],
    ["Incidence", "zapadalność", "Liczba nowych przypadków choroby w populacji w danym okresie (zwykle w ciągu roku), podawana jako liczba lub wskaźnik na 100 000 osób."],
    ["Mortality rate vs case fatality", "umieralność a śmiertelność", "Umieralność (mortality rate) to liczba zgonów na 100 tys. populacji — mierzy ryzyko zgonu w populacji. Śmiertelność (case fatality rate) to odsetek chorych, którzy umierają z powodu danej choroby; GBD raportuje umieralność."],
    ["Prevalence", "chorobowość", "Liczba osób żyjących z daną chorobą w określonym momencie lub okresie — „aktualna pula chorych”. Stanowi podstawę do obliczania YLD."],
    ["QALY", "Quality-Adjusted Life Years", "Lata życia skorygowane o jakość — miara zysku zdrowotnego używana głównie w ocenie technologii medycznych (HTA). W odróżnieniu od DALY liczy zdrowie „zyskane”, a nie utracone, i nie jest miarą stosowaną w GBD."],
    ["Risk factor", "czynnik ryzyka", "Cecha, zachowanie lub ekspozycja zwiększająca prawdopodobieństwo choroby lub urazu. GBD grupuje czynniki ryzyka w trzy kategorie: behawioralne, metaboliczne oraz środowiskowe i zawodowe."],
    ["SDI", "Socio-demographic Index", "Złożony wskaźnik rozwoju społeczno-demograficznego (dochód na osobę, wykształcenie, dzietność) w skali 0–1. GBD używa go do porównywania krajów o podobnym poziomie rozwoju i oceny oczekiwanych wartości wskaźników."],
    ["Sequela", "następstwo choroby", "Następstwo choroby; konkretny stan kliniczny będący konsekwencją danej choroby lub urazu (np. amputacja kończyny jako następstwo cukrzycy)."],
    ["TMREL", "Theoretical Minimum Risk Exposure Level", "Teoretycznie minimalny poziom ekspozycji na czynnik ryzyka, przy którym ryzyko dla zdrowia populacji jest najniższe (np. 0% palaczy). Stanowi punkt odniesienia w scenariuszu kontrfaktycznym."],
    ["Uncertainty interval (UI)", "przedział niepewności", "95-procentowy przedział, w którym z dużym prawdopodobieństwem mieści się prawdziwa wartość szacunku. Odzwierciedla niepewność danych źródłowych i modelowania; gdy UI dwóch wartości się nakładają, różnicy nie należy interpretować jako istotnej."],
    ["YLD", "Years Lived with Disability", "Lata przeżyte z niepełnosprawnością, ważone współczynnikiem ciężkości danego stanu zdrowotnego (wagą niepełnosprawności)."],
    ["YLL", "Years of Life Lost", "Lata życia utracone z powodu przedwczesnych zgonów, liczone jako różnica między wiekiem zgonu a oczekiwaną długością życia ze standardowej tablicy trwania życia GBD."]
  ];
  function initGlossary() {
    const host = document.getElementById("glossary"), input = document.getElementById("gl-search"), empty = document.getElementById("gl-empty");
    if (!host) return;
    const items = [...GLOSSARY].sort((a, b) => a[0].localeCompare(b[0], "pl", { sensitivity: "base" }));
    let html = "", letter = "";
    items.forEach(([term, pl, def]) => {
      const L = term[0].toUpperCase();
      if (L !== letter) { letter = L; html += `<div class="gl-letter" data-letter="${L}">${L}</div>`; }
      const key = (term + " " + pl + " " + def).toLowerCase();
      html += `<details class="acc" data-key="${key.replace(/"/g, "&quot;")}" data-letter="${L}"><summary>${term} <small>— ${pl}</small></summary><div class="acc-body">${def}</div></details>`;
    });
    host.innerHTML = html;
    if (!input) return;
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      const visible = new Set();
      host.querySelectorAll("details.acc").forEach(d => {
        const show = !q || d.dataset.key.includes(q);
        d.hidden = !show;
        if (show) visible.add(d.dataset.letter);
        if (q && show && d.querySelector("summary").textContent.toLowerCase().includes(q)) d.open = true;
        if (!q) d.open = false;
      });
      host.querySelectorAll(".gl-letter").forEach(l => { l.hidden = !visible.has(l.dataset.letter); });
      if (empty) empty.hidden = visible.size > 0;
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTrees();
    initWeights();
    initPyramids();
    initCalc();
    initResultsTable();
    initGlossary();
  });
})();
