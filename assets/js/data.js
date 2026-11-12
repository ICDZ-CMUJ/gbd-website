/* =========================================================================
   GBD Research Hub — wspólne treści dynamiczne.
   Komponenty strony głównej (aktualności, wydarzenia, fakty) oraz widżety
   (dashboard, porównywarki) pobierają dane z tego pliku.

   UWAGA: wszystkie wartości liczbowe dla województw i krajów są DANYMI
   PRZYKŁADOWYMI do ilustracji działania widżetów. Przed publikacją należy
   je zastąpić eksportem z GBD Results Tool (val / lower / upper).
   ========================================================================= */
window.GBD = window.GBD || {};

/* ---------------- Aktualności ---------------- */
GBD.news = [
  {
    date: "2026-11-05",
    tag: "Policy Corner",
    tone: "coral",
    title: "Dlaczego ważna jest perspektywa regionalna?",
    excerpt: "Średnia krajowa maskuje różnice w umieralności z powodu chorób układu krążenia sięgające 60% między województwami.",
    href: "policy.html#news-regionalna"
  },
  {
    date: "2026-10-21",
    tag: "Data Story",
    tone: "blue",
    title: "Dlaczego GBD uzupełnia dane tradycyjnej statystyki?",
    excerpt: "Garbage codes, choroby, które nie zabijają, i przedziały niepewności — siedem różnic, które zmieniają obraz zdrowia Polski.",
    href: "polska.html#data-stories"
  },
  {
    date: "2026-10-02",
    tag: "Nauczanie",
    tone: "green",
    title: "Jak cytować dane GBD? Nowy przewodnik",
    excerpt: "Formaty Vancouver, AMA i APA, cytowanie GBD Results Tool oraz najczęstsze błędy przy powoływaniu się na szacunki GBD.",
    href: "nauczanie.html#cytowanie"
  },
  {
    date: "2026-09-15",
    tag: "Hub",
    tone: "amber",
    title: "[Przykład] Startuje GBD CEE Bulletin",
    excerpt: "Pierwszy numer kwartalnika z przeglądem danych GBD istotnych dla regionu Europy Środkowo-Wschodniej.",
    href: "kontakt.html#bulletin"
  }
];

/* ---------------- Wydarzenia ---------------- */
GBD.events = [
  { date: "2026-11-27", title: "[Przykład] Webinar: GBD Results Tool krok po kroku", place: "Online", desc: "Praktyczne warsztaty pobierania i interpretacji danych GBD." },
  { date: "2026-12-10", title: "[Przykład] Seminarium: Zdrowie województw 1990–2023", place: "Kraków", desc: "Prezentacja wyników analiz subnarodowych dla Polski." },
  { date: "2027-01-22", title: "[Przykład] Warsztaty CEE: obciążenie chorobami w regionie", place: "Online", desc: "Spotkanie sieci współpracowników z krajów CEE." }
];

/* ---------------- „Czy wiesz, że…" ---------------- */
GBD.facts = [
  {
    tone: "blue",
    big: "~80%",
    what: "obciążenia chorobami w Polsce",
    text: "to choroby niezakaźne: choroby serca, nowotwory, cukrzyca, choroby przewlekłe płuc i zaburzenia psychiczne. Większość z nich jest związana z modyfikowalnymi czynnikami ryzyka — paleniem, dietą, alkoholem i niską aktywnością fizyczną."
  },
  {
    tone: "coral",
    big: "5–8 lat",
    what: "krócej żyją mieszkańcy CEE niż Europy Zachodniej",
    text: "Ta luka zdrowotna utrzymuje się od transformacji ustrojowej. Dane GBD pokazują, że główne przyczyny to wyższe współczynniki umieralności z powodu chorób układu krążenia i nowotworów — napędzane przez czynniki ryzyka, na które polityka zdrowotna może wpływać."
  },
  {
    tone: "amber",
    big: "Ból kręgosłupa",
    what: "to #4 przyczyna DALY w Polsce",
    text: "Nie zabija, ale obniża jakość życia milionów Polaków. Tradycyjne statystyki zdrowotne, które skupiają się na zgonach, tego nie widzą. Wskaźnik DALY uwzględnia nie tylko umieralność, ale i lata przeżyte z niepełnosprawnością — dlatego pokazuje pełniejszy obraz."
  }
];
GBD.factSource = "Źródło: GBD 2021 — IHME | GBD Research Hub. Dane przykładowe — do weryfikacji z aktualnymi szacunkami GBD.";

/* ---------------- Kafelki „GBD w liczbach" ---------------- */
GBD.numbers = [
  { label: "Analizowanych przyczyn", value: 371, sub: "chorób i urazów", tone: "blue" },
  { label: "Czynników ryzyka", value: 88, sub: "monitorowanych w GBD", tone: "coral" },
  { label: "Kraje CEE w naszych analizach", value: 12, sub: "od Bałtyku po Bałkany", tone: "blue" },
  { label: "Publikacje zespołu", value: 47, sub: "artykuły i raporty", tone: "coral", todo: true }
];

/* ---------------- Publikacje ---------------- */
/* type: artykul | raport | prezentacja ; region: pl | cee | global */
GBD.publications = [
  { type: "artykul", region: "pl", year: 2025, title: "[Przykład] Obciążenie chorobami w 16 województwach Polski, 1990–2023: analiza GBD", authors: "GBD Poland Subnational Collaborators", venue: "The Lancet Regional Health — Europe", abstract: "Pierwsza kompleksowa analiza GBD na poziomie województw, prezentująca Polskę na tle Europy i dokumentująca zróżnicowanie wewnątrzkrajowe.", doi: "" },
  { type: "artykul", region: "global", year: 2024, title: "Global burden of 288 causes of death and life expectancy decomposition in 204 countries and territories and 811 subnational locations, 1990–2021", authors: "GBD 2021 Causes of Death Collaborators", venue: "The Lancet 403(10440):2100–2132", abstract: "Współautorstwo w cyklu GBD 2021 — szacunki umieralności dla 288 przyczyn zgonów.", doi: "10.1016/S0140-6736(24)00367-2" },
  { type: "artykul", region: "cee", year: 2024, title: "[Przykład] Luka zdrowotna Wschód–Zachód w Europie: dekompozycja według przyczyn i czynników ryzyka", authors: "[Autorzy]", venue: "[Czasopismo]", abstract: "Analiza różnic w oczekiwanej długości życia między krajami CEE a Europą Zachodnią.", doi: "" },
  { type: "raport", region: "pl", year: 2026, title: "Policy brief: Dlaczego ważna jest perspektywa regionalna?", authors: "GBD Research Hub", venue: "Policy brief nr 1/2026", abstract: "Zróżnicowanie standaryzowanego współczynnika umieralności z powodu chorób układu krążenia między województwami.", doi: "" },
  { type: "raport", region: "cee", year: 2026, title: "[Przykład] GBD CEE Bulletin — nr 1", authors: "GBD Research Hub", venue: "Kwartalnik", abstract: "Przegląd najnowszych danych i publikacji GBD istotnych dla regionu.", doi: "" },
  { type: "prezentacja", region: "pl", year: 2026, title: "[Przykład] GBD w praktyce zdrowia publicznego — wykład", authors: "[Prelegent]", venue: "[Konferencja]", abstract: "Slajdy z wystąpienia konferencyjnego (PDF).", doi: "" },
  { type: "prezentacja", region: "cee", year: 2025, title: "[Przykład] Transformacja epidemiologiczna w CEE", authors: "[Prelegent]", venue: "[Warsztaty]", abstract: "Slajdy z warsztatów regionalnych (PDF).", doi: "" }
];

/* ---------------- Hierarchia przyczyn GBD (poziomy 1–3, wybór) ---------------- */
GBD.causeTree = [
  {
    id: "cmnn", tone: "red", name: "I. Choroby zakaźne, matczyne, noworodkowe i żywieniowe",
    en: "Communicable, maternal, neonatal, and nutritional diseases",
    groups: [
      { name: "HIV/AIDS i choroby przenoszone drogą płciową", items: ["HIV/AIDS", "Kiła", "Chlamydioza", "Rzeżączka"] },
      { name: "Zakażenia układu oddechowego i gruźlica", items: ["Zakażenia dolnych dróg oddechowych", "Gruźlica", "COVID-19", "Zakażenia górnych dróg oddechowych"] },
      { name: "Zakażenia jelitowe", items: ["Choroby biegunkowe", "Dur brzuszny i dury rzekome", "Inne zakażenia jelitowe"] },
      { name: "Zaniedbane choroby tropikalne i malaria", items: ["Malaria", "Denga", "Schistosomatoza", "Wścieklizna"] },
      { name: "Inne choroby zakaźne", items: ["Zapalenie opon mózgowych", "Ostre wirusowe zapalenie wątroby", "Odra", "Krztusiec"] },
      { name: "Zaburzenia matczyne i noworodkowe", items: ["Zaburzenia matczyne", "Wcześniactwo", "Encefalopatia noworodkowa", "Sepsa noworodkowa"] },
      { name: "Niedobory żywieniowe", items: ["Niedożywienie białkowo-energetyczne", "Niedobór jodu", "Niedobór witaminy A", "Niedokrwistość z niedoboru żelaza"] }
    ]
  },
  {
    id: "ncd", tone: "blue", name: "II. Choroby niezakaźne (NCD)",
    en: "Non-communicable diseases — dominują w Polsce i CEE",
    groups: [
      { name: "Nowotwory", note: "#2 przyczyna zgonów w PL", items: ["Rak tchawicy, oskrzeli i płuca", "Rak jelita grubego", "Rak piersi", "Rak gruczołu krokowego", "Rak trzustki"] },
      { name: "Choroby układu krążenia", note: "#1 przyczyna zgonów w PL", items: ["Choroba niedokrwienna serca", "Udar mózgu", "Nadciśnieniowa choroba serca", "Kardiomiopatia", "Migotanie przedsionków"] },
      { name: "Przewlekłe choroby układu oddechowego", items: ["POChP", "Astma", "Śródmiąższowe choroby płuc"] },
      { name: "Choroby układu pokarmowego", items: ["Marskość wątroby", "Choroba wrzodowa", "Zapalenie trzustki"] },
      { name: "Zaburzenia neurologiczne", items: ["Choroba Alzheimera i inne otępienia", "Choroba Parkinsona", "Migrena", "Padaczka"] },
      { name: "Zaburzenia psychiczne", note: "Wysoki udział w YLD", items: ["Zaburzenia depresyjne", "Zaburzenia lękowe", "Schizofrenia", "Zaburzenia odżywiania"] },
      { name: "Zaburzenia związane z używaniem substancji", items: ["Zaburzenia związane z alkoholem", "Zaburzenia związane z narkotykami"] },
      { name: "Cukrzyca i choroby nerek", note: "Rosnący trend", items: ["Cukrzyca typu 2", "Cukrzyca typu 1", "Przewlekła choroba nerek"] },
      { name: "Choroby skóry i tkanki podskórnej", items: ["Zapalenie skóry", "Łuszczyca", "Trądzik"] },
      { name: "Choroby narządów zmysłów", items: ["Utrata słuchu związana z wiekiem", "Wady refrakcji", "Zaćma", "Jaskra"] },
      { name: "Zaburzenia układu mięśniowo-szkieletowego", items: ["Ból dolnego odcinka kręgosłupa", "Ból szyi", "Choroba zwyrodnieniowa stawów", "Reumatoidalne zapalenie stawów"] },
      { name: "Inne choroby niezakaźne", items: ["Wady wrodzone", "Choroby jamy ustnej", "Choroby układu moczowo-płciowego"] }
    ]
  },
  {
    id: "inj", tone: "green", name: "III. Urazy",
    en: "Injuries — wypadki, samobójstwa, przemoc",
    groups: [
      { name: "Urazy komunikacyjne", items: ["Wypadki drogowe — piesi", "Wypadki drogowe — kierowcy samochodów", "Wypadki drogowe — rowerzyści", "Inne urazy komunikacyjne"] },
      { name: "Urazy niezamierzone", items: ["Upadki", "Utonięcia", "Oparzenia", "Zatrucia", "Siły natury"] },
      { name: "Samookaleczenia i przemoc interpersonalna", items: ["Samookaleczenia (samobójstwa)", "Przemoc interpersonalna", "Konflikty zbrojne i terroryzm"] }
    ]
  }
];

/* ---------------- Hierarchia czynników ryzyka (poziomy 1–3, wybór) ---------------- */
GBD.riskTree = [
  {
    id: "beh", tone: "coral", name: "Behawioralne", en: "Styl życia, nawyki",
    groups: [
      { name: "Palenie tytoniu", items: ["Palenie", "Bierne palenie", "Tytoń bezdymny"] },
      { name: "Spożycie alkoholu", items: ["Spożycie alkoholu (ciągła ekspozycja)"] },
      { name: "Ryzyko dietetyczne", items: ["Dieta uboga w owoce", "Dieta uboga w warzywa", "Dieta bogata w sód", "Dieta uboga w pełne ziarna", "Dieta bogata w przetworzone mięso"] },
      { name: "Niska aktywność fizyczna", items: ["Niska aktywność fizyczna"] },
      { name: "Używanie substancji psychoaktywnych", items: ["Używanie opioidów, kokainy, amfetaminy", "Iniekcyjne używanie narkotyków"] },
      { name: "Niedożywienie matek i dzieci", items: ["Niska masa urodzeniowa", "Krótki czas ciąży", "Niedobór wzrostu i masy dziecka"] },
      { name: "Ryzykowne zachowania seksualne", items: ["Ryzykowne zachowania seksualne"] },
      { name: "Przemoc i wykorzystywanie", items: ["Przemoc ze strony partnera", "Wykorzystywanie seksualne w dzieciństwie i nękanie"] }
    ]
  },
  {
    id: "met", tone: "purple", name: "Metaboliczne", en: "Czynniki biologiczne",
    groups: [
      { name: "Wysokie ciśnienie skurczowe", items: ["Ciśnienie skurczowe > 110–115 mmHg (ciągła ekspozycja)"] },
      { name: "Wysoki BMI", items: ["BMI dorosłych > 20–25 kg/m²", "Wysoki BMI u dzieci"] },
      { name: "Wysoka glikemia na czczo", items: ["Glukoza na czczo > 4,8–5,4 mmol/l"] },
      { name: "Wysoki cholesterol LDL", items: ["LDL > 0,7–1,3 mmol/l"] },
      { name: "Niska funkcja nerek", items: ["eGFR < 60 ml/min/1,73 m² lub albuminuria"] },
      { name: "Niska gęstość mineralna kości", items: ["Niska gęstość mineralna kości"] }
    ]
  },
  {
    id: "env", tone: "sand", name: "Środowiskowe i zawodowe", en: "Otoczenie, ekspozycje",
    groups: [
      { name: "Zanieczyszczenie powietrza", items: ["PM2.5 (zewnętrzne)", "PM2.5 (z gospodarstw domowych — paliwa stałe)", "Ozon"] },
      { name: "Nieoptymalna temperatura", items: ["Niska temperatura", "Wysoka temperatura"] },
      { name: "Ryzyka zawodowe", items: ["Czynniki rakotwórcze w miejscu pracy", "Hałas zawodowy", "Urazy w pracy", "Ergonomia pracy"] },
      { name: "Niebezpieczna woda, sanitacja, higiena rąk", items: ["Niebezpieczne źródło wody", "Brak sanitacji", "Brak możliwości mycia rąk"] },
      { name: "Inne czynniki środowiskowe", items: ["Ołów", "Radon"] }
    ]
  }
];

/* ---------------- Województwa (DANE PRZYKŁADOWE) ---------------- */
/* col/row — pozycja w kartogramie kafelkowym (5 x 4) */
GBD.voiv = [
  { id: "zp", name: "Zachodniopomorskie", col: 1, row: 0, pop: 1.64, cvd: 262, le: 77.6, daly: 31200, cancer: 262, alc: 6.4, tob: 15.8 },
  { id: "pm", name: "Pomorskie",          col: 2, row: 0, pop: 2.36, cvd: 210, le: 79.0, daly: 28400, cancer: 248, alc: 5.6, tob: 14.6 },
  { id: "wn", name: "Warmińsko-mazurskie", col: 3, row: 0, pop: 1.37, cvd: 268, le: 77.1, daly: 32300, cancer: 258, alc: 6.8, tob: 16.0 },
  { id: "lb", name: "Lubuskie",           col: 0, row: 1, pop: 0.98, cvd: 265, le: 77.2, daly: 31900, cancer: 260, alc: 6.6, tob: 16.2 },
  { id: "wp", name: "Wielkopolskie",      col: 1, row: 1, pop: 3.49, cvd: 236, le: 78.4, daly: 29600, cancer: 255, alc: 5.9, tob: 15.1 },
  { id: "kp", name: "Kujawsko-pomorskie", col: 2, row: 1, pop: 2.00, cvd: 252, le: 77.7, daly: 30900, cancer: 261, alc: 6.1, tob: 15.6 },
  { id: "mz", name: "Mazowieckie",        col: 3, row: 1, pop: 5.51, cvd: 225, le: 79.3, daly: 28100, cancer: 240, alc: 5.4, tob: 14.2 },
  { id: "pd", name: "Podlaskie",          col: 4, row: 1, pop: 1.15, cvd: 240, le: 78.9, daly: 29000, cancer: 236, alc: 6.2, tob: 13.9 },
  { id: "ds", name: "Dolnośląskie",       col: 0, row: 2, pop: 2.88, cvd: 248, le: 78.0, daly: 30300, cancer: 258, alc: 6.0, tob: 15.5 },
  { id: "op", name: "Opolskie",           col: 1, row: 2, pop: 0.95, cvd: 244, le: 78.3, daly: 29700, cancer: 250, alc: 5.8, tob: 15.0 },
  { id: "ld", name: "Łódzkie",            col: 2, row: 2, pop: 2.40, cvd: 300, le: 76.6, daly: 33400, cancer: 270, alc: 6.7, tob: 16.9 },
  { id: "sk", name: "Świętokrzyskie",     col: 3, row: 2, pop: 1.18, cvd: 290, le: 77.4, daly: 32000, cancer: 252, alc: 6.3, tob: 15.7 },
  { id: "lu", name: "Lubelskie",          col: 4, row: 2, pop: 2.03, cvd: 320, le: 77.9, daly: 31400, cancer: 240, alc: 6.1, tob: 14.8 },
  { id: "sl", name: "Śląskie",            col: 1, row: 3, pop: 4.35, cvd: 270, le: 77.2, daly: 32100, cancer: 266, alc: 6.2, tob: 16.6 },
  { id: "ma", name: "Małopolskie",        col: 2, row: 3, pop: 3.43, cvd: 195, le: 79.6, daly: 27600, cancer: 238, alc: 5.3, tob: 13.8 },
  { id: "pk", name: "Podkarpackie",       col: 3, row: 3, pop: 2.07, cvd: 228, le: 79.5, daly: 28000, cancer: 228, alc: 5.5, tob: 13.6 }
];
GBD.poland = { id: "pl", name: "Polska", pop: 37.8, cvd: 250, le: 78.2, daly: 30000, cancer: 252, alc: 6.0, tob: 15.3 };

/* ---------------- Kraje CEE (DANE PRZYKŁADOWE) ---------------- */
GBD.cee = [
  { id: "pl", name: "Polska",    le: 76.5, death: 980,  daly: 30000, cvd: 250, cancer: 252, tob: 15.3, alc: 6.0 },
  { id: "cz", name: "Czechy",    le: 77.6, death: 905,  daly: 28400, cvd: 262, cancer: 228, tob: 14.4, alc: 6.6 },
  { id: "sk", name: "Słowacja",  le: 76.2, death: 1010, daly: 30600, cvd: 318, cancer: 246, tob: 14.0, alc: 6.2 },
  { id: "hu", name: "Węgry",     le: 75.4, death: 1060, daly: 31900, cvd: 330, cancer: 280, tob: 17.8, alc: 6.9 },
  { id: "si", name: "Słowenia",  le: 80.6, death: 740,  daly: 24900, cvd: 170, cancer: 222, tob: 12.1, alc: 5.8 },
  { id: "hr", name: "Chorwacja", le: 77.4, death: 930,  daly: 28800, cvd: 300, cancer: 262, tob: 16.4, alc: 5.4 },
  { id: "ro", name: "Rumunia",   le: 73.9, death: 1180, daly: 34200, cvd: 430, cancer: 232, tob: 14.6, alc: 7.2 },
  { id: "bg", name: "Bułgaria",  le: 72.1, death: 1340, daly: 37100, cvd: 560, cancer: 226, tob: 16.9, alc: 5.9 },
  { id: "lt", name: "Litwa",     le: 74.2, death: 1150, daly: 34400, cvd: 410, cancer: 236, tob: 12.8, alc: 9.4 },
  { id: "lv", name: "Łotwa",     le: 73.6, death: 1190, daly: 35100, cvd: 440, cancer: 240, tob: 13.6, alc: 8.6 },
  { id: "ee", name: "Estonia",   le: 77.3, death: 930,  daly: 29100, cvd: 270, cancer: 230, tob: 12.6, alc: 7.4 },
  { id: "ua", name: "Ukraina",   le: 71.0, death: 1420, daly: 39200, cvd: 610, cancer: 210, tob: 15.6, alc: 8.1 }
];
GBD.westEurope = { id: "we", name: "Europa Zachodnia", le: 81.7, death: 640, daly: 24200, cvd: 140, cancer: 200, tob: 11.2, alc: 4.6 };

/* Wskaźniki dostępne w widżetach */
GBD.indicators = {
  cvd:    { label: "Umieralność — choroby układu krążenia", unit: "na 100 tys. (stand.)", higherWorse: true },
  cancer: { label: "Umieralność — nowotwory", unit: "na 100 tys. (stand.)", higherWorse: true },
  daly:   { label: "DALY ogółem", unit: "na 100 tys. (stand.)", higherWorse: true },
  le:     { label: "Oczekiwana długość życia", unit: "lata", higherWorse: false },
  death:  { label: "Umieralność ogólna", unit: "na 100 tys. (stand.)", higherWorse: true },
  tob:    { label: "DALY przypisywalne paleniu tytoniu", unit: "% DALY", higherWorse: true },
  alc:    { label: "DALY przypisywalne alkoholowi", unit: "% DALY", higherWorse: true }
};

/* Deterministyczny trend 1990–2023 (ILUSTRACYJNY): wartości 1990 wyższe
   dla wskaźników „im więcej tym gorzej", niższe dla oczekiwanej dł. życia. */
GBD.trend = function (entity, key) {
  const end = entity[key];
  if (end == null) return [];
  const ind = GBD.indicators[key];
  const seed = (entity.id || "x").split("").reduce((a, c) => a + c.charCodeAt(0), 0) + key.length * 7;
  const base = { cvd: 0.78, cancer: 0.22, daly: 0.42, death: 0.5, tob: 0.38, alc: 0.12 }[key] || 0.5;
  const drop = key === "le" ? -(6 + (seed % 5) * 0.6) : base + (seed % 7) * 0.035;
  const out = [];
  for (let y = 1990; y <= 2023; y++) {
    const t = (2023 - y) / 33;              // 1 w 1990, 0 w 2023
    const wiggle = Math.sin((y + seed) * 0.7) * 0.012 + Math.sin((y + seed) * 0.23) * 0.01;
    let v;
    if (key === "le") v = end + drop * t + wiggle * 4 - (y >= 2020 && y <= 2021 ? 1.4 : 0);
    else v = end * (1 + drop * Math.pow(t, 1.15) + wiggle) * (y >= 2020 && y <= 2021 && key !== "tob" && key !== "alc" ? 1.06 : 1);
    /* 95% przedział niepewności (UI) — szerszy dla wcześniejszych lat i dla wskaźników przypisywalnych */
    const rel = key === "le" ? null : (key === "tob" || key === "alc" ? 0.16 + 0.06 * t : 0.045 + 0.05 * t);
    const half = key === "le" ? 0.35 + 0.45 * t : v * rel;
    const r1 = x => Math.round(x * 10) / 10;
    out.push({ year: y, value: r1(v), lower: r1(v - half * (key === "le" ? 1 : 0.92)), upper: r1(v + half) });
  }
  if (out.length) { out[out.length - 1].value = end; }
  return out;
};

/* ---------------- Polska: DALY wg przyczyn, 2023 (DANE PRZYKŁADOWE) ----------------
   Struktura: grupa GBD (poziom 1) → parent (poziom 2) → przyczyna (poziom 3).
   Wartości: DALY na 100 tys., standaryzowane — proporcje przybliżone, do zastąpienia. */
GBD.polandDalyCauses = [
  { name: "Choroba niedokrwienna serca", parent: "Choroby układu krążenia", group: "ncd", value: 3550 },
  { name: "Udar mózgu", parent: "Choroby układu krążenia", group: "ncd", value: 1480 },
  { name: "Nadciśnieniowa choroba serca", parent: "Choroby układu krążenia", group: "ncd", value: 520 },
  { name: "Inne choroby krążenia", parent: "Choroby układu krążenia", group: "ncd", value: 640 },
  { name: "Rak płuca", parent: "Nowotwory", group: "ncd", value: 1290 },
  { name: "Rak jelita grubego", parent: "Nowotwory", group: "ncd", value: 640 },
  { name: "Rak piersi", parent: "Nowotwory", group: "ncd", value: 380 },
  { name: "Rak trzustki", parent: "Nowotwory", group: "ncd", value: 300 },
  { name: "Inne nowotwory", parent: "Nowotwory", group: "ncd", value: 1650 },
  { name: "Ból dolnego odcinka kręgosłupa", parent: "Układ mięśniowo-szkieletowy", group: "ncd", value: 1100 },
  { name: "Inne mięśniowo-szkieletowe", parent: "Układ mięśniowo-szkieletowy", group: "ncd", value: 760 },
  { name: "Cukrzyca typu 2", parent: "Cukrzyca i choroby nerek", group: "ncd", value: 980 },
  { name: "Przewlekła choroba nerek", parent: "Cukrzyca i choroby nerek", group: "ncd", value: 430 },
  { name: "Zaburzenia depresyjne", parent: "Zaburzenia psychiczne", group: "ncd", value: 650 },
  { name: "Zaburzenia lękowe", parent: "Zaburzenia psychiczne", group: "ncd", value: 540 },
  { name: "Inne psychiczne", parent: "Zaburzenia psychiczne", group: "ncd", value: 300 },
  { name: "Bóle głowy", parent: "Zaburzenia neurologiczne", group: "ncd", value: 610 },
  { name: "Alzheimer i otępienia", parent: "Zaburzenia neurologiczne", group: "ncd", value: 560 },
  { name: "Inne neurologiczne", parent: "Zaburzenia neurologiczne", group: "ncd", value: 260 },
  { name: "POChP", parent: "Przewlekłe ch. układu oddechowego", group: "ncd", value: 760 },
  { name: "Astma", parent: "Przewlekłe ch. układu oddechowego", group: "ncd", value: 170 },
  { name: "Marskość wątroby", parent: "Choroby układu pokarmowego", group: "ncd", value: 500 },
  { name: "Inne pokarmowe", parent: "Choroby układu pokarmowego", group: "ncd", value: 280 },
  { name: "Zaburzenia związane z alkoholem", parent: "Używanie substancji", group: "ncd", value: 450 },
  { name: "Utrata słuchu", parent: "Narządy zmysłów", group: "ncd", value: 340 },
  { name: "Wady wzroku", parent: "Narządy zmysłów", group: "ncd", value: 180 },
  { name: "Choroby skóry", parent: "Choroby skóry", group: "ncd", value: 330 },
  { name: "Inne niezakaźne", parent: "Inne niezakaźne", group: "ncd", value: 720 },
  { name: "Upadki", parent: "Urazy niezamierzone", group: "inj", value: 610 },
  { name: "Inne urazy niezamierzone", parent: "Urazy niezamierzone", group: "inj", value: 330 },
  { name: "Samookaleczenia", parent: "Samookaleczenia i przemoc", group: "inj", value: 500 },
  { name: "Przemoc", parent: "Samookaleczenia i przemoc", group: "inj", value: 60 },
  { name: "Wypadki drogowe", parent: "Urazy komunikacyjne", group: "inj", value: 380 },
  { name: "Zakażenia dolnych dróg oddechowych", parent: "Zakażenia oddechowe i gruźlica", group: "cmnn", value: 430 },
  { name: "COVID-19", parent: "Zakażenia oddechowe i gruźlica", group: "cmnn", value: 260 },
  { name: "Zaburzenia noworodkowe", parent: "Zaburzenia matczyne i noworodkowe", group: "cmnn", value: 300 },
  { name: "Inne zakaźne", parent: "Inne choroby zakaźne", group: "cmnn", value: 290 },
  { name: "Niedobory żywieniowe", parent: "Niedobory żywieniowe", group: "cmnn", value: 120 }
];

/* ---------------- Polska: ranking przyczyn zgonów 1990 → 2023 (DANE PRZYKŁADOWE) ---------------- */
GBD.polandDeathRanks = {
  from: "1990", to: "2023",
  items: [
    { name: "Choroba niedokrwienna serca", group: "ncd", r1: 1, r2: 1, change: -58 },
    { name: "Udar mózgu", group: "ncd", r1: 2, r2: 2, change: -62 },
    { name: "Rak płuca", group: "ncd", r1: 3, r2: 3, change: -35 },
    { name: "POChP", group: "ncd", r1: 4, r2: 8, change: -55 },
    { name: "Nadciśnieniowa choroba serca", group: "ncd", r1: 5, r2: 4, change: -12 },
    { name: "Zakażenia dolnych dróg oddechowych", group: "cmnn", r1: 6, r2: 7, change: -38 },
    { name: "Wypadki drogowe", group: "inj", r1: 7, r2: 12, change: -71 },
    { name: "Rak jelita grubego", group: "ncd", r1: 8, r2: 6, change: -9 },
    { name: "Marskość wątroby", group: "ncd", r1: 9, r2: 10, change: -27 },
    { name: "Cukrzyca typu 2", group: "ncd", r1: 10, r2: 9, change: -18 },
    { name: "Samookaleczenia", group: "inj", r1: 11, r2: 11, change: -41 },
    { name: "Alzheimer i otępienia", group: "ncd", r1: 12, r2: 5, change: 6 }
  ]
};

/* ---------------- Polska: struktura DALY — YLL vs YLD (DANE PRZYKŁADOWE) ---------------- */
GBD.polandYllYld = (function () {
  const years = [], yll = [], yld = [];
  for (let y = 1990; y <= 2023; y++) {
    const t = (y - 1990) / 33;
    let s = 63 - 14 * Math.pow(t, 0.9) + Math.sin(y * 0.9) * 0.35;
    if (y === 2020 || y === 2021) s += 2.2;
    years.push(y); yll.push(Math.round(s * 10) / 10); yld.push(Math.round((100 - s) * 10) / 10);
  }
  return { years, series: [{ name: "YLL — lata utracone", color: "#1f5fa6", values: yll }, { name: "YLD — lata z niepełnosprawnością", color: "#d85a30", values: yld }] };
})();

/* ---------------- Polska: czynniki ryzyka — % DALY (DANE PRZYKŁADOWE) ---------------- */
GBD.polandRisks = [
  { name: "Palenie tytoniu", cat: "beh", value: 15.3, lower: 13.6, upper: 17.1 },
  { name: "Wysokie ciśnienie skurczowe", cat: "met", value: 11.8, lower: 9.9, upper: 13.6 },
  { name: "Ryzyko dietetyczne", cat: "beh", value: 10.4, lower: 7.6, upper: 13.5 },
  { name: "Wysoki BMI", cat: "met", value: 9.6, lower: 6.8, upper: 12.6 },
  { name: "Wysoka glikemia na czczo", cat: "met", value: 8.1, lower: 6.7, upper: 9.8 },
  { name: "Spożycie alkoholu", cat: "beh", value: 6.0, lower: 4.9, upper: 7.2 },
  { name: "Wysoki cholesterol LDL", cat: "met", value: 5.5, lower: 4.1, upper: 7.0 },
  { name: "Zanieczyszczenie powietrza PM2.5", cat: "env", value: 4.2, lower: 3.1, upper: 5.4 },
  { name: "Niska aktywność fizyczna", cat: "beh", value: 2.1, lower: 1.1, upper: 3.3 },
  { name: "Ryzyka zawodowe", cat: "env", value: 1.9, lower: 1.4, upper: 2.5 }
];
/* kolory kategorii ryzyka — zwalidowane (CVD ΔE, kontrast) */
GBD.riskColors = { beh: "#d85a30", met: "#6b4fc4", env: "#0091b0" };
GBD.riskNames = { beh: "Behawioralne", met: "Metaboliczne", env: "Środowiskowe i zawodowe" };
