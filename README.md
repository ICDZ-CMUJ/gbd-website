# GBD Research Hub — strona WWW

Statyczna strona GBD Research Hub (Polska · Europa Środkowo-Wschodnia), zbudowana według dokumentu
„Struktura strony GBD Research Hub". Czysty HTML/CSS/JS, bez kroku budowania i bez zależności,
więc działa po otwarciu `index.html` lokalnie i na GitHub Pages.

## Struktura

| Plik | Sekcja z dokumentu |
|---|---|
| `index.html` | 1. Strona główna: lead, „GBD w liczbach", „Czy wiesz, że…", aktualności, wydarzenia, newsletter |
| `o-nas.html` | 2.1 Kim jesteśmy · 2.2 Czym jest GBD (oś czasu) · 2.4 Zespół · 2.5 Partnerzy |
| `metodologia.html` | 2.3 Metodologia · 2.3.1 Jak korzystać z danych · 2.3.2 Słownik · 2.3.3 Linki |
| `polska.html` | 3. Polska: przegląd, dashboard, porównywarka województw, profile PDF, Data Stories |
| `cee.html` | 4. Kraje CEE: porównania, kluczowe wskaźniki, porównywarka krajów, Data Stories |
| `policy.html` | 5. Policy Corner: news, szablon policy briefu, wytyczne, rekomendacje, infografiki |
| `publikacje.html` | 6. Publikacje (filtry; obsługa `?region=pl` / `?region=cee`) |
| `nauczanie.html` | 7. GBD w nauczaniu: garbage codes, cytowanie, quiz, materiały |
| `media.html` | 8. Media |
| `kontakt.html` | 9. Kontakt, Dołącz do sieci, GBD CEE Bulletin |

```
assets/css/styles.css   system wizualny (tokeny kolorów, komponenty)
assets/js/data.js       treści dynamiczne: aktualności, wydarzenia, fakty, publikacje, dane widżetów
assets/js/site.js       nagłówek/menu, stopka, komponenty strony głównej, formularze
assets/js/charts.js     wykresy SVG bez zależności (linie, słupki, kartogram, heatmapa, drzewa)
assets/js/pages/*.js    skrypty poszczególnych podstron
```

## Jak aktualizować treści

- **Aktualności, wydarzenia, „Czy wiesz, że…", publikacje** edytuje się w `assets/js/data.js`.
  Strona główna sama pokazuje 3 najnowsze wpisy i nadchodzące wydarzenia.
- **Dane do dashboardów** (`GBD.voiv`, `GBD.cee`, `GBD.trend`) to obecnie **dane przykładowe**.
  Przed publikacją trzeba je zastąpić eksportem z [GBD Results Tool](https://vizhub.healthdata.org/gbd-results/)
  (kolumny `val`, `lower`, `upper`).
- Miejsca oznaczone ramką **„Do uzupełnienia"** odpowiadają punktom „Do uzupełnienia" z dokumentu.
- Formularze (newsletter, kontakt) są demonstracyjne i nie mają backendu.

## Paleta barw

Paleta stosuje konwencję wizualną Global Burden of Disease (IHME / publikacje GBD w The Lancet, GBD Compare).
Palety kategorialne sprawdzono walidatorem (separacja dla daltonizmu ΔE, kontrast, nasycenie).

| Znaczenie | Kolor | Token |
|---|---|---|
| Grupa I: choroby zakaźne, matczyne, noworodkowe i żywieniowe | czerwony `#c0392b` | `--cmnn` |
| Grupa II: choroby niezakaźne (NCD) | niebieski `#1f5fa6` | `--ncd` |
| Grupa III: urazy | zielony `#0b7d57` | `--inj` |
| Mapy, heatmapy, rankingi | skala rozbieżna 7 klas wokół punktu odniesienia (średnia PL / CEE): niebieski = korzystniej, szary = średnia, czerwony = mniej korzystnie | `--div-1…7` |
| Czynniki ryzyka: behawioralne / metaboliczne / środowiskowe | `#d85a30` / `#6b4fc4` / `#0091b0` | `GBD.riskColors` |
| Porównania (maks. 3–4 serie) | niebieski, koral, fiolet, zieleń; punkt odniesienia szary `#9aa1ab` | |
| YLL / YLD | niebieski / koral | |

Uwaga: w makietach z dokumentu Word grupa I była niebieska, a NCD koralowe. Na stronie odwrócono to
zgodnie z konwencją GBD, w której NCD są niebieskie, a choroby zakaźne czerwone.

## Wykresy

`assets/js/charts.js` to własna biblioteka SVG bez zależności. Każdy wykres jest rysowany w rzeczywistej
szerokości kontenera, ma tooltip (mysz i klawiatura) i rozwijany widok tabeli:

- `lineChart`: trendy z 95% przedziałem niepewności (UI), oś krzyżowa, adnotacja COVID-19;
- `hbars`: ranking z wąsami UI i linią odniesienia;
- `polandMap` / `europeMap`: kartogramy na prawdziwych granicach;
- `treemap`: DALY wg przyczyn w stylu GBD Compare (grupa → poziom 2 → poziom 3);
- `arrowDiagram`: zmiana rang przyczyn 1990 → 2023 (diagram strzałkowy GBD);
- `stackedShare`: udziały w czasie (YLL vs YLD); `dumbbell`: zmiana A → B; `sparkline`; `heatmap`.

Granice w `assets/js/geo.js` generuje `tools/build-geo.mjs` (instrukcja w nagłówku pliku). Województwa
pochodzą z PRG/GUGiK (przez ppatrzyk/polska-geojson), kraje z Natural Earth (domena publiczna).

## Podgląd lokalny

```bash
python3 -m http.server 8000
```

Następnie otwórz http://localhost:8000.

## Publikacja (GitHub Pages)

Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
