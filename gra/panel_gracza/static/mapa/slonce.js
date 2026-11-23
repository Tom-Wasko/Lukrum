// Pora dnia na mapie: wysokość Słońca nad Lublinem (z daty i godziny) zamienia się na płynny odcień i przyciemnienie.
// Bez bibliotek; wzory przybliżone (wystarczą do oświetlenia mapy, nie do astronomii).
const LAT = 51.2465, LON = 22.5684, STR = Math.PI / 180;

const minutyWarszawa = (d) => {   // godzina na zegarze w Polsce (CET/CEST), w minutach od północy
  try {
    const cz = new Intl.DateTimeFormat("pl-PL", { timeZone: "Europe/Warsaw", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(d);
    return +cz.find((p) => p.type === "hour").value * 60 + +cz.find((p) => p.type === "minute").value;
  } catch { return d.getHours() * 60 + d.getMinutes(); }
};

/** Wysokość Słońca (stopnie nad horyzontem) w Lublinie. `minuty` – godzina polskiego zegara (0–1440); bez niej: teraz. */
export function wysokoscSlonca(minuty = null, teraz = new Date()) {
  const utc = teraz.getUTCHours() * 60 + teraz.getUTCMinutes() + teraz.getUTCSeconds() / 60;
  const polskie = minutyWarszawa(teraz);
  const przesuniecie = ((polskie - Math.floor(utc) + 1440 + 720) % 1440) - 720;   // CET = +60, CEST = +120
  const minutyUtc = minuty == null ? utc : minuty - przesuniecie;
  const dzien = Math.floor((Date.UTC(teraz.getUTCFullYear(), teraz.getUTCMonth(), teraz.getUTCDate()) - Date.UTC(teraz.getUTCFullYear(), 0, 0)) / 864e5);
  const b = 2 * Math.PI * (dzien - 81) / 364;
  const rownanieCzasu = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  const deklinacja = 23.44 * STR * Math.sin(2 * Math.PI * (dzien - 81) / 365);
  const czasSloneczny = minutyUtc + 4 * LON + rownanieCzasu;
  const kat = (czasSloneczny / 4 - 180) * STR;   // kąt godzinny
  return Math.asin(Math.sin(LAT * STR) * Math.sin(deklinacja) + Math.cos(LAT * STR) * Math.cos(deklinacja) * Math.cos(kat)) / STR;
}

// punkty kontrolne: wysokość Słońca → [r, g, b, krycie nakładki]; pomiędzy interpolacja liniowa
let ETAPY = [
  [-18, [10, 20, 60, 0.5]],     // noc
  [-8, [25, 40, 100, 0.38]],    // zmierzch
  [-2, [150, 80, 90, 0.24]],    // po zachodzie
  [3, [255, 130, 40, 0.15]],    // złota godzina
  [12, [255, 190, 110, 0.04]],
  [20, [255, 255, 255, 0]],     // dzień
];

let LAMPY = { od: 4, rozpietosc: 10 };
/** Ustawienia pory z `dane/mapa/miasto.yaml` (klucz `pora`): etapy nakładki i lampy. Bez nich działają wartości wbudowane powyżej. */
export function ustawUstawieniaPory(p) {
  if (Array.isArray(p?.etapy) && p.etapy.length > 1) ETAPY = p.etapy;
  if (p?.lampy) LAMPY = { ...LAMPY, ...p.lampy };
}
/** Jak mocno świecą lampy (0–1) przy danej wysokości Słońca: zapalają się przy zachodzie, pełne niżej o `rozpietosc` stopni. */
export const stopienLamp = (h) => Math.min(1, Math.max(0, (LAMPY.od - h) / LAMPY.rozpietosc));

// godzina ręczna z suwaka mapy (null = prawdziwy zegar); wnętrza czytają ją stąd, więc oba widoki pokazują tę samą porę
let CZAS_RECZNY = null;
export const ustawCzasReczny = (m) => { CZAS_RECZNY = m; };
export const czasReczny = () => CZAS_RECZNY;

/** Kolor nakładki (rgba) i jej krycie dla danej wysokości Słońca. */
export function nakladkaPory(h) {
  if (h <= ETAPY[0][0]) { const [r, g, b, a] = ETAPY[0][1]; return { kolor: `rgb(${r} ${g} ${b})`, krycie: a }; }
  for (let i = 1; i < ETAPY.length; i++) {
    if (h <= ETAPY[i][0]) {
      const [h0, c0] = ETAPY[i - 1], [h1, c1] = ETAPY[i], t = (h - h0) / (h1 - h0);
      const m = c0.map((x, j) => x + (c1[j] - x) * t);
      return { kolor: `rgb(${m[0].toFixed(0)} ${m[1].toFixed(0)} ${m[2].toFixed(0)})`, krycie: m[3] };
    }
  }
  return { kolor: "rgb(255 255 255)", krycie: 0 };
}

export const naGodzine = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(Math.floor(m % 60)).padStart(2, "0")}`;
export const terazMinuty = () => minutyWarszawa(new Date());
