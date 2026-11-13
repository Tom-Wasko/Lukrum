// Poprawki 3 (sprawy 10–11): wspólny wykres obciążenia – czas pracy osób (Ludzie ▸ Zespół, wyniki) i obłożenie sprzętu
// (Wnętrze ▸ Stanowiska i sprzęt, wyniki). Wykres półkolisty (gauge): osobny miernik na osobę / sprzęt.
// Dane: obciążenie 0–1 (silnik/runda.py: _czas_pracy, sprzęt – oblozenie) i godziny; progi z danych
// (v.progi_czasu_pracy: niski, przepracowanie). Kolory stanów: zmienne --obc-* (styl.css).
import { esc, licz, proc } from "./wspolne.js";

// opisy stanów – osobno dla ludzi i sprzętu (ten sam podział progami)
export const OPISY_LUDZI = { niski: "mało pracy", dobry: "dobrze", przeciazenie: "przeciążenie" };
export const OPISY_SPRZETU = { niski: "duży zapas", dobry: "dobrze", przeciazenie: "na granicy" };
const ZNAK = { niski: "▼", dobry: "✓", przeciazenie: "▲", brak: "" };

function stan(pr, x) {
  if (pr.niski == null && pr.wysoki == null) return "brak";
  if (pr.wysoki != null && x > pr.wysoki) return "przeciazenie";
  if (pr.niski != null && x < pr.niski) return "niski";
  return "dobry";
}
const pc = (x) => `${Math.round(x * 100)}%`;
const szer = (x) => `${(Math.max(0, Math.min(1, x)) * 100).toFixed(2)}%`;
const znacznik = (s, opisy) => s === "brak" ? "" : `<span class="obc-stan">${ZNAK[s]} ${esc(opisy[s])}</span>`;

// klienci, którzy nie doczekali się obsługi (przyczyny „kolejka” – silnik/rynek/opinie.py KOLEJKA)
export const klienciZKolejki = (v) => Object.values(v.wyniki?.sprzedaz || {})
  .filter((s) => ["pracownicy/sprzęt", "kasa"].includes(s.przyczyna)).reduce((a, s) => a + (s.utracona || 0), 0);

function legenda(pr, opisy) {
  const zakres = { niski: `poniżej ${proc(pr.niski, 0)}`, dobry: `${proc(pr.niski, 0)}–${proc(pr.wysoki, 0)}`, przeciazenie: `ponad ${proc(pr.wysoki, 0)}` };
  const klucze = pr.niski != null && pr.wysoki != null
    ? ["niski", "dobry", "przeciazenie"].map((s) => `<span class="obc-klucz"><i class="obc-probka ${s}"></i>${ZNAK[s]} ${zakres[s]} – ${esc(opisy[s])}</span>`).join("") : "";
  return `<div class="obc-legenda">${klucze}</div>`;
}

const dymek = (p, s, opisy, jedn) => `<span class="dymek-tresc"><b>${esc(p.nazwa)}</b>${p.podpis ? ` – ${esc(p.podpis)}` : ""}<br>
  ${licz(p.h, 1)} z ${licz(p.hMax, 1)} ${jedn} (${pc(p.x)})${s !== "brak" ? ` – ${esc(opisy[s])}` : ""}${p.dymek ? `<br>${p.dymek}` : ""}</span>`;
const naglowekGrupy = (g) => `<div class="obc-grupa">${g}</div>`;

// półpierścień 0–100%: łuk o długości 100 (pathLength), wypełnienie = dasharray; kreski progów na łuku
const R = 48, SR = 10, CX = 60, CY = 58;
const punkt = (t, r) => [CX - r * Math.cos(Math.PI * t), CY - r * Math.sin(Math.PI * t)].map((n) => n.toFixed(2));
function polkole(p, pr, s) {
  const luk = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;
  const kreski = [pr.niski, pr.wysoki].filter((x) => x != null && x > 0 && x < 1).map((x) => {
    const [x1, y1] = punkt(x, R - SR / 2 - 1), [x2, y2] = punkt(x, R + SR / 2 + 1);
    return `<line class="obc-kreska" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  }).join("");
  const wyp = Math.max(0, Math.min(1, p.x)) * 100;
  return `<svg class="obc-gauge" viewBox="0 0 120 74" role="img" aria-label="${esc(p.nazwa)}: ${pc(p.x)}">
    <path class="obc-tlo" d="${luk}" pathLength="100" stroke-width="${SR * 2}"/>
    ${wyp > 0 ? `<path class="obc-wyp" d="${luk}" pathLength="100" stroke-width="${SR * 2}" stroke-dasharray="${wyp.toFixed(2)} 100"/>` : ""}
    ${kreski}
    <text class="obc-pr" x="${CX}" y="${CY - 3}" text-anchor="middle">${pc(p.x)}</text>
    <text class="obc-skr" x="${CX - R}" y="${CY + 11}" text-anchor="middle">0</text>
    <text class="obc-skr" x="${CX + R}" y="${CY + 11}" text-anchor="middle">100</text></svg>`;
}

/** Wykres obciążenia. pozycje: [{ nazwa, podpis, x (0–1), h (godziny pracy), hMax (godziny dostępne), grupa?, dymek? }],
 *  progi: { niski, wysoki } (części 0–1), opisy: OPISY_LUDZI / OPISY_SPRZETU, przypis: HTML pod wykresem. */
export function wykresObciazenia({ tytul, pozycje, progi = {}, opisy = OPISY_LUDZI, jednostka = "h", przypis = "" }) {
  if (!pozycje.length) return "";
  let grupa = null, html = "";
  for (const p of pozycje) {
    if (p.grupa && p.grupa !== grupa) { grupa = p.grupa; html += naglowekGrupy(p.grupa); }
    const s = stan(progi, p.x);
    html += `<div class="obc-miernik ma-dymek ${s}" tabindex="0">
      <div class="obc-kto"><b>${esc(p.nazwa)}</b>${p.podpis ? `<span>${esc(p.podpis)}</span>` : ""}</div>
      ${polkole(p, progi, s)}${znacznik(s, opisy)}${dymek(p, s, opisy, jednostka)}</div>`;
  }
  return `<section class="obc" aria-label="${esc(tytul)}"><h3 class="obc-tytul">${esc(tytul)}</h3>
    ${legenda(progi, opisy)}<div class="obc-siatka">${html}</div>${przypis}</section>`;
}

// Poprawki 4 (P6): obciążenie osób w dni tygodnia (silnik/runda.py: _obciazenie_dni) – potrzebne godziny / pojemność
// stanowiska w danym dniu; ponad 100% = tyle pracy zabrakło (klienci odeszli przez brak godzin osoby). null – bez zmiany.
const dataKrotka = (iso) => { const [, m, d] = iso.split("-"); return `${+d}.${m}`; };
const NAZWY_DNI = ["pn", "wt", "śr", "czw", "pt", "sob", "nd"];
function komorkaDnia(x, pr) {
  if (x == null) return `<span class="obc-dzien brak" title="Tego dnia bez zmiany">–</span>`;
  if (x > 1 + 1e-9) {
    const brak = Math.round((x - 1) * 100);
    return `<span class="obc-dzien ponad" title="Zabrakło ${brak}% mocy – klientów było o ${brak}% więcej, niż ta osoba dała radę obsłużyć">`
      + `${pc(x)}<small>zabrakło ${brak}%</small></span>`;
  }
  return `<span class="obc-dzien ${stan(pr, x)}">${pc(x)}</span>`;
}

/** Tabela osoba × dzień. pozycje: [{ nazwa, podpis, grupa?, dni: [7 części albo null] }],
 *  dni: [{ dzien, data }] (wyniki.klienci.dni) albo brak – same nazwy dni; progi jak w wykresObciazenia. */
export function tabelaDni({ tytul, pozycje, dni = [], progi = {}, przypis = "" }) {
  const P = pozycje.filter((p) => Array.isArray(p.dni) && p.dni.length);
  if (!P.length) return "";
  const n = Math.max(...P.map((p) => p.dni.length));
  const naglowki = Array.from({ length: n }, (_, i) => dni[i]
    ? `${esc(dni[i].dzien)}<div class="podpowiedz">${dataKrotka(dni[i].data)}</div>` : NAZWY_DNI[i] || `${i + 1}`);
  let grupa = null;
  const wiersze = P.map((p) => {
    const nag = p.grupa && p.grupa !== grupa ? (grupa = p.grupa, `<tr class="obc-dni-grupa"><td colspan="${n + 1}">${p.grupa}</td></tr>`) : "";
    return `${nag}<tr><td class="l"><b>${esc(p.nazwa)}</b>${p.podpis ? `<div class="podpowiedz">${esc(p.podpis)}</div>` : ""}</td>`
      + Array.from({ length: n }, (_, i) => `<td>${komorkaDnia(p.dni[i], progi)}</td>`).join("") + "</tr>";
  }).join("");
  return `<section class="obc obc-dni" aria-label="${esc(tytul)}"><h3 class="obc-tytul">${esc(tytul)}</h3>
    <div class="tab-wrap"><table class="t"><thead><tr><th class="l">Osoba</th>${naglowki.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${wiersze}</tbody></table></div>${przypis}</section>`;
}
