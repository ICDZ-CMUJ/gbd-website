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

Paleta stosuje konwencję wizualną Global Burden of Disease (IHME / publikacje GBD w The Lancet, GBD Compare):

| Znaczenie | Kolor | Token |
|---|---|---|
| Grupa I: choroby zakaźne, matczyne, noworodkowe i żywieniowe | czerwony `#c0392b` | `--cmnn` |
| Grupa II: choroby niezakaźne (NCD) | niebieski `#1f5fa6` | `--ncd` |
| Grupa III: urazy | zielony `#13795b` | `--inj` |
| Skale wartości (mapy, heatmapy) | rozbieżna niebieski → czerwony | `--seq-1…6` |
| Czynniki ryzyka: behawioralne / metaboliczne / środowiskowe | koral / fiolet / ciepła szarość | `--coral`, `--purple`, `--sand` |
| YLL / YLD / lata w zdrowiu | niebieski / koral / zielony | |
| Wnioski, ostrzeżenia | bursztyn | `--amber` |

Uwaga: w makietach z dokumentu Word grupa I była niebieska, a NCD koralowe. Na stronie odwrócono to
zgodnie z konwencją GBD, w której NCD są niebieskie, a choroby zakaźne czerwone.

## Podgląd lokalny

```bash
python3 -m http.server 8000
```

Następnie otwórz http://localhost:8000.

## Publikacja (GitHub Pages)

Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
