// Nakładka sceny (podróż 04/nakladka): czysta logika układu, bez DOM i bez importów (testy: testy/swiat/test_nakladka.py, node).
// Jedna warstwa dla wszystkich scen: (1) rozkład szyldów punktów tak, by nie nachodziły na siebie, na postacie i na cudze rekwizyty,
// (2) układ otwartego dymka tam, gdzie jest miejsce (nie na szyldzie, tablicy ani rekwizycie z punktem).
// Prostokąty: { x, y, w, h } w tych samych jednostkach (piksele względem lewego górnego rogu sceny).

/** Pole wspólne dwóch prostokątów (0, gdy się nie stykają). */
export function pole(a, b) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}
/** Pole prostokąta `a` wystające poza `obszar`. */
const poza = (a, obszar) => a.w * a.h - pole(a, { x: 0, y: 0, w: obszar.w, h: obszar.h });
export const naKrzyz = (a, b) => pole(a, b) > 0;

/** Kandydaci na szyld `m` (w, h) przy punkcie `r`: najpierw układ wskazany w scenie (`gdzie`), potem pozostałe, od najbliższych. */
function kandydaciSzyldu(r, m, gdzie) {
  const cx = r.x + (r.w - m.w) / 2, dol = r.y + r.h, g = 3;
  const wsz = {
    dol: [cx, dol - m.h * 0.55], gora: [cx, r.y - m.h * 0.45], srodek: [cx, r.y + (r.h - m.h) / 2],
    lewo: [r.x - m.w * 0.7, r.y + (r.h - m.h) / 2], prawo: [r.x + r.w - m.w * 0.3, r.y + (r.h - m.h) / 2],
    wewn: [cx, dol - m.h - 4], "prawy-brzeg": [r.x + r.w - m.w - 4, dol - m.h - 4], "lewy-brzeg": [r.x + 4, dol - m.h - 4],
    // dalsze miejsca zapasowe: tuż pod, tuż nad, w rogach
    "pod": [cx, dol + g], "nad": [cx, r.y - m.h - g], "pod-lewo": [r.x, dol + g], "pod-prawo": [r.x + r.w - m.w, dol + g],
    "nad-lewo": [r.x, r.y - m.h - g], "nad-prawo": [r.x + r.w - m.w, r.y - m.h - g], "wewn-gora": [cx, r.y + 4],
    "wewn-lewo": [r.x + 4, r.y + (r.h - m.h) / 2], "wewn-prawo": [r.x + r.w - m.w - 4, r.y + (r.h - m.h) / 2],
    "z-lewej": [r.x - m.w - g, r.y + (r.h - m.h) / 2], "z-prawej": [r.x + r.w + g, r.y + (r.h - m.h) / 2],
  };
  const kolej = [gdzie && wsz[gdzie] ? gdzie : "dol", "dol", "pod", "gora", "nad", "wewn", "pod-lewo", "pod-prawo", "nad-lewo", "nad-prawo", "wewn-gora", "wewn-lewo",
    "wewn-prawo", "srodek", "z-lewej", "z-prawej", "lewo", "prawo", "prawy-brzeg", "lewy-brzeg"];
  const widziane = new Set(), wynik = [];
  for (const k of kolej) { if (widziane.has(k)) continue; widziane.add(k); wynik.push({ k, x: wsz[k][0], y: wsz[k][1] }); }
  return wynik;
}

/**
 * Rozkład szyldów punktów. punkty: [{ id, rect, szyld: {w, h}, gdzie?, cichy? }]; przeszkody: prostokąty, na które szyld nie ma wchodzić
 * (postacie); obszar: { w, h }. Zwraca [{ id, x, y, nachodzi }] (lewy górny róg szyldu; `nachodzi`: nie znaleziono wolnego miejsca).
 * Zachłannie, w kolejności punktów: każdy szyld dostaje pierwsze miejsce o najmniejszym koszcie (nakładanie na szyldy już ułożone,
 * na przeszkody, na cudze rekwizyty i wyjście poza scenę; własny rekwizyt kosztuje mało, bo szyld wisi na jego krawędzi).
 */
export function rozlozSzyldy(punkty, obszar, przeszkody = []) {
  const ulozone = [], wynik = [];
  for (const p of punkty) {
    const cudze = punkty.filter((q) => q !== p).map((q) => q.rect);
    let najlepszy = null;
    for (const [i, c] of kandydaciSzyldu(p.rect, p.szyld, p.gdzie).entries()) {
      const r = { x: c.x, y: c.y, w: p.szyld.w, h: p.szyld.h };
      const koszt = 4000 * ulozone.reduce((s, u) => s + pole(r, u), 0) + 2500 * przeszkody.reduce((s, u) => s + pole(r, u), 0)
        + 3000 * poza(r, obszar) + 6 * cudze.reduce((s, u) => s + pole(r, u), 0) + 2 * pole(r, p.rect) + i * 40;
      if (!najlepszy || koszt < najlepszy.koszt) najlepszy = { x: r.x, y: r.y, koszt };
    }
    const r = { x: najlepszy.x, y: najlepszy.y, w: p.szyld.w, h: p.szyld.h };
    // szyld mieści się w scenie (jeśli się da), a jego prostokąt zostaje przeszkodą dla następnych
    r.x = Math.min(Math.max(0, r.x), Math.max(0, obszar.w - r.w)); r.y = Math.min(Math.max(0, r.y), Math.max(0, obszar.h - r.h));
    const nachodzi = ulozone.some((u) => naKrzyz(r, u)) || przeszkody.some((u) => naKrzyz(r, u));
    ulozone.push(r);
    wynik.push({ id: p.id, x: r.x, y: r.y, nachodzi });
  }
  return wynik;
}

/**
 * Układ otwartego dymka przy postaci. osoba: rect postaci; dymek: { w, h }; przeszkody: prostokąty rekwizytów z punktami i szyldów punktów;
 * obszar: { w, h }. Zwraca { x, y, strona } (lewy górny róg dymka; strona: nad | prawo | lewo | pod). Pasek przy górnej krawędzi sceny
 * (tam wiszą szyldy sklepów i tablice) jest „droższy” niż reszta, więc dymek woli bok postaci na wysokości głowy.
 */
export function ulozDymek(osoba, dymek, przeszkody, obszar, pasekGory = 0.24) {
  const g = 6, w = dymek.w, h = dymek.h;
  const glowaY = osoba.y + osoba.h * 0.25, cx = osoba.x + osoba.w / 2;
  const kandydaci = [
    ["prawo", osoba.x + osoba.w + g, glowaY - h / 2], ["lewo", osoba.x - w - g, glowaY - h / 2],
    ["nad", cx - w / 2, osoba.y - h - g], ["nad", osoba.x, osoba.y - h - g], ["nad", osoba.x + osoba.w - w, osoba.y - h - g],
    ["prawo", osoba.x + osoba.w + g, osoba.y + osoba.h * 0.55 - h / 2], ["lewo", osoba.x - w - g, osoba.y + osoba.h * 0.55 - h / 2],
    ["pod", cx - w / 2, osoba.y + osoba.h + g],
  ];
  const pas = { x: 0, y: 0, w: obszar.w, h: obszar.h * pasekGory };
  let najlepszy = null;
  for (const [i, [strona, x, y]] of kandydaci.entries()) {
    const r = { x, y, w, h };
    const koszt = 40 * przeszkody.reduce((s, u) => s + pole(r, u), 0) + 3 * pole(r, osoba) + 50 * poza(r, obszar) + 1.5 * pole(r, pas) + i * 30;
    if (!najlepszy || koszt < najlepszy.koszt) najlepszy = { strona, x, y, koszt };
  }
  const x = Math.min(Math.max(0, najlepszy.x), Math.max(0, obszar.w - w)), y = Math.min(Math.max(0, najlepszy.y), Math.max(0, obszar.h - h));
  return { x, y, strona: najlepszy.strona };
}

/** Klucz „dymek już oglądany w tej rundzie” (znak „nowe” znika po otwarciu). */
export const kluczDymka = (runda, scena, kto) => `${runda}|${scena}|${kto}`;

/** Dymki już otwarte w tej sesji (znak „nowe” przy postaci znika po otwarciu). */
const otwarte = new Set();
export const widziany = (klucz) => otwarte.has(klucz);
export const oznaczWidziany = (klucz) => { otwarte.add(klucz); };
