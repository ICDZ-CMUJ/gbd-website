// Generuje assets/js/geo.js — gotowe ścieżki SVG (bez bibliotek w runtime).
//
// Źródła danych:
//   - województwa: github.com/ppatrzyk/polska-geojson (wojewodztwa-min.geojson, na bazie PRG / GUGiK)
//   - kraje Europy: world-atlas@2 countries-50m (Natural Earth, domena publiczna)
//
// Uruchomienie (w osobnym katalogu roboczym):
//   npm i d3-geo@3.1.1 topojson-client@3.1.0 world-atlas@2.0.2
//   node build-geo.mjs <woj.geojson> <countries-50m.json> <out geo.js>
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(process.cwd() + "/");
const d3 = require("d3-geo");
const topojson = require("topojson-client");

const [wojPath, worldPath, outPath] = process.argv.slice(2);
const round = s => s.replace(/-?\d+\.\d+/g, n => String(Math.round(+n))).replace(/L(-?\d+),(-?\d+)(?=L\1,\2)/g, "");

/* ---------- Polska: 16 województw ---------- */
const NAME2ID = {
  "zachodniopomorskie": "zp", "pomorskie": "pm", "warmińsko-mazurskie": "wn", "lubuskie": "lb",
  "wielkopolskie": "wp", "kujawsko-pomorskie": "kp", "mazowieckie": "mz", "podlaskie": "pd",
  "dolnośląskie": "ds", "opolskie": "op", "łódzkie": "ld", "świętokrzyskie": "sk",
  "lubelskie": "lu", "śląskie": "sl", "małopolskie": "ma", "podkarpackie": "pk"
};
const woj = JSON.parse(readFileSync(wojPath, "utf8"));
const PW = 600, PH = 560;
const pProj = d3.geoTransverseMercator().rotate([-19.2, 0]).fitExtent([[6, 6], [PW - 6, PH - 6]], woj);
const pPath = d3.geoPath(pProj);
const poland = { width: PW, height: PH, regions: {} };
for (const f of woj.features) {
  const id = NAME2ID[f.properties.nazwa];
  if (!id) throw new Error("Nieznane województwo: " + f.properties.nazwa);
  const [cx, cy] = pPath.centroid(f);
  poland.regions[id] = { d: round(pPath(f)), cx: Math.round(cx), cy: Math.round(cy) };
}
// lekkie korekty pozycji etykiet (kształty nieregularne)
const nudge = { pm: [8, 10], kp: [0, 4], mz: [6, 8], wn: [6, 0], zp: [0, 8], ma: [0, 4] };
for (const [id, [dx, dy]] of Object.entries(nudge)) { poland.regions[id].cx += dx; poland.regions[id].cy += dy; }

/* ---------- Europa ---------- */
const CEE = { "616": "pl", "203": "cz", "703": "sk", "348": "hu", "705": "si", "191": "hr", "642": "ro", "100": "bg", "440": "lt", "428": "lv", "233": "ee", "804": "ua" };
// Europa Zachodnia — region GBD (bez państw-miast)
const WEST = new Set(["040", "056", "208", "246", "250", "276", "300", "372", "380", "442", "528", "578", "620", "724", "752", "756", "826", "352", "470", "196"]);
const world = JSON.parse(readFileSync(worldPath, "utf8"));
const countries = topojson.feature(world, world.objects.countries);
const EW = 640, EH = 560;
const box = { type: "Feature", geometry: { type: "Polygon", coordinates: [[[3, 40.5], [3, 60.5], [41, 60.5], [41, 40.5], [3, 40.5]]] } };
const eProj = d3.geoAzimuthalEqualArea().rotate([-21, -50]).fitExtent([[0, 0], [EW, EH]], box).clipExtent([[-2, -2], [EW + 2, EH + 2]]);
const ePath = d3.geoPath(eProj);
const europe = { width: EW, height: EH, cee: {}, west: [], other: [], westLabel: eProj([8.6, 50.2]).map(Math.round) };
const inView = f => { const b = ePath.bounds(f); return b[1][0] > 0 && b[0][0] < EW && b[1][1] > 0 && b[0][1] < EH; };
for (const f of countries.features) {
  const lonlat = d3.geoCentroid(f);
  if (lonlat[0] < -30 || lonlat[0] > 60 || lonlat[1] < 25 || lonlat[1] > 75) continue;
  if (!inView(f)) continue;
  const d = round(ePath(f) || "");
  if (!d) continue;
  if (CEE[f.id]) {
    const [cx, cy] = ePath.centroid(f);
    europe.cee[CEE[f.id]] = { d, cx: Math.round(cx), cy: Math.round(cy) };
  } else if (WEST.has(f.id)) europe.west.push(d);
  else europe.other.push(d);
}
// etykieta Chorwacji w kształcie „rogala" — przesunięcie
if (europe.cee.hr) { europe.cee.hr.cx -= 10; europe.cee.hr.cy -= 10; }

const out = `/* Wygenerowane przez tools/build-geo.mjs — nie edytować ręcznie.
   Granice: województwa — PRG/GUGiK via ppatrzyk/polska-geojson; kraje — Natural Earth (domena publiczna). */
window.GBDGeo = ${JSON.stringify({ poland, europe })};
`;
writeFileSync(outPath, out);
console.log("OK", outPath, (out.length / 1024).toFixed(0) + " KB", Object.keys(poland.regions).length, "województw,", Object.keys(europe.cee).length, "krajów CEE");
