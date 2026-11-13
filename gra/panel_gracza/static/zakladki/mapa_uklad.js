// Układ mapy Lublina (M11): wygląd z miasto.yaml → uklad (siatka, kształty dzielnic z pól, położenie lokali i budynków)
// oraz geometria krzywych (drogi, kolej, rzeka jako gładkie krzywe przez punkty kontrolne). Tylko rysowanie –
// silnik gry liczy odległości z położeń w strefy.yaml / lokale.yaml / budynki.yaml.

const UKLADY = new WeakMap();

/** Dane mapy z położeniami do rysowania: siatka z układu, strefy z listą pól (komorki) i środkiem, lokale i budynki
 * na polach z układu, `strefaPola` („x,y” → strefa) i `wies` (pola bez zabudowy miejskiej – pola uprawne). */
export function zastosujUklad(M) {
  const uk = M.miasto?.uklad;
  if (!uk) return M;
  if (UKLADY.has(M)) return UKLADY.get(M);
  const komorki = {}, strefaPola = new Map();
  uk.wiersze.forEach((w, y) => [...w].forEach((c, x) => {
    const s = uk.legenda[c];
    if (s) { (komorki[s] ||= []).push([x, y]); strefaPola.set(`${x},${y}`, s); }
  }));
  const strefy = Object.fromEntries(Object.entries(M.strefy).map(([k, s]) => {
    const kk = komorki[k] || [];
    if (!kk.length) return [k, s];
    const xs = kk.map((c) => c[0]), ys = kk.map((c) => c[1]);
    const x = Math.min(...xs), y = Math.min(...ys);
    const srodek = [xs.reduce((a, b) => a + b, 0) / kk.length + 0.5, ys.reduce((a, b) => a + b, 0) / kk.length + 0.5];
    return [k, { ...s, mapa: { x, y, szer: Math.max(...xs) + 1 - x, gl: Math.max(...ys) + 1 - y }, komorki: kk, srodek }];
  }));
  const naPolu = (o) => (uk.pola[o.id] ? { ...o, mapa: { ...o.mapa, x: uk.pola[o.id][0], y: uk.pola[o.id][1] } } : o);
  // wieś: pola bez strefy dalej niż 1 pole od każdej dzielnicy – tam pola uprawne zamiast miejskiego terenu
  const { szer: S, gl: G } = uk.siatka, wies = new Set();
  for (let x = 0; x < S; x++) for (let y = 0; y < G; y++) {
    let blisko = false;
    for (let i = -1; i <= 1 && !blisko; i++) for (let j = -1; j <= 1; j++) if (strefaPola.has(`${x + i},${y + j}`)) { blisko = true; break; }
    if (!blisko) wies.add(`${x},${y}`);
  }
  const wynik = { ...M, siatka: uk.siatka, strefy, lokale: M.lokale.map(naPolu), budynki: M.budynki.map(naPolu), strefaPola, wies };
  UKLADY.set(M, wynik);
  return wynik;
}

// --- krzywe: centripetalny Catmull-Rom przez punkty kontrolne (bez pętli i przestrzałów przy nierównych odstępach) ---
const f = (n) => +n.toFixed(3);
/** Odcinki Béziera [p1, b1, b2, p2] krzywej przez punkty; na końcach punkty pozorne (odbicie sąsiada). */
function beziery(punkty) {
  const n = punkty.length, odbij = (a, b) => [2 * a[0] - b[0], 2 * a[1] - b[1]];
  const p = [n > 1 ? odbij(punkty[0], punkty[1]) : punkty[0], ...punkty, n > 1 ? odbij(punkty[n - 1], punkty[n - 2]) : punkty[n - 1]];
  const wynik = [];
  for (let i = 1; i < p.length - 2; i++) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    // odległości w potędze 1/2 (centripetal) i 1 (kwadraty tamtych) – wzór Yuksela dla punktów pośrednich Béziera
    const [d1, d2, d3] = [[p0, p1], [p1, p2], [p2, p3]].map(([u, v]) => Math.max(1e-6, Math.sqrt(Math.hypot(v[0] - u[0], v[1] - u[1]))));
    const b1 = [0, 1].map((j) => (d1 * d1 * p2[j] - d2 * d2 * p0[j] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[j]) / (3 * d1 * (d1 + d2)));
    const b2 = [0, 1].map((j) => (d3 * d3 * p1[j] - d2 * d2 * p3[j] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[j]) / (3 * d3 * (d3 + d2)));
    wynik.push([p1, b1, b2, p2]);
  }
  return wynik;
}
/** Ścieżka SVG gładkiej krzywej przez punkty. */
export function krzywa(punkty) {
  const B = beziery(punkty);
  return `M${f(B[0][0][0])} ${f(B[0][0][1])}` + B.map(([, b1, b2, p2]) => `C${f(b1[0])} ${f(b1[1])} ${f(b2[0])} ${f(b2[1])} ${f(p2[0])} ${f(p2[1])}`).join("");
}
const PROBKI = new WeakMap();
/** Krzywa próbkowana co `krok` pól długości: {x, y, tx, ty (styczna), dl (długość)}; pamiętana dla tablicy punktów. */
export function probki(punkty, krok = 0.05) {
  if (PROBKI.has(punkty)) return PROBKI.get(punkty);
  const gesto = [];
  for (const [a, b1, b2, c] of beziery(punkty)) {
    for (let k = 0; k < 24; k++) {
      const t = k / 24, u = 1 - t;
      gesto.push([0, 1].map((j) => u * u * u * a[j] + 3 * u * u * t * b1[j] + 3 * u * t * t * b2[j] + t * t * t * c[j]));
    }
  }
  gesto.push(punkty[punkty.length - 1]);
  const dl = [0];
  for (let i = 1; i < gesto.length; i++) dl.push(dl[i - 1] + Math.hypot(gesto[i][0] - gesto[i - 1][0], gesto[i][1] - gesto[i - 1][1]));
  const L = dl[dl.length - 1], n = Math.max(2, Math.round(L / krok)), x = [], y = [];
  for (let k = 0, j = 0; k <= n; k++) {
    const s = (L * k) / n;
    while (j < dl.length - 2 && dl[j + 1] < s) j++;
    const u = dl[j + 1] > dl[j] ? (s - dl[j]) / (dl[j + 1] - dl[j]) : 0;
    x.push(gesto[j][0] + (gesto[j + 1][0] - gesto[j][0]) * u);
    y.push(gesto[j][1] + (gesto[j + 1][1] - gesto[j][1]) * u);
  }
  const tx = [], ty = [];
  for (let k = 0; k <= n; k++) {
    const a = Math.max(0, k - 1), b = Math.min(n, k + 1), d = Math.hypot(x[b] - x[a], y[b] - y[a]) || 1;
    tx.push((x[b] - x[a]) / d); ty.push((y[b] - y[a]) / d);
  }
  const wynik = { x, y, tx, ty, dl: L, krok: L / n, n };
  PROBKI.set(punkty, wynik);
  return wynik;
}
/** Punkt na krzywej w odległości s od początku: [x, y, tx, ty]. */
export function punktNa(P, s) {
  const t = Math.min(P.n, Math.max(0, s / P.krok)), i = Math.min(P.n - 1, Math.floor(t)), u = t - i;
  return [P.x[i] + (P.x[i + 1] - P.x[i]) * u, P.y[i] + (P.y[i + 1] - P.y[i]) * u,
    P.tx[i] + (P.tx[i + 1] - P.tx[i]) * u, P.ty[i] + (P.ty[i + 1] - P.ty[i]) * u];
}
/** Linia równoległa d pól w prawo od kierunku krzywej (d < 0 – w lewo) jako ścieżka SVG. */
export function rownolegla(punkty, d) {
  const P = probki(punkty);
  let s = "";
  for (let k = 0; k <= P.n; k++) s += `${k ? "L" : "M"}${f(P.x[k] - P.ty[k] * d)} ${f(P.y[k] + P.tx[k] * d)}`;
  return s;
}
/** Pola siatki, przez które (z zapasem `zapas` pól) przechodzi któraś z tras – bez zabudowy. */
export function polaTras(trasy, zapas) {
  const pola = new Set();
  for (const { punkty, polowa } of trasy) {
    const P = probki(punkty), r = polowa + zapas;
    for (let k = 0; k <= P.n; k++) {
      for (let x = Math.floor(P.x[k] - r); x <= Math.floor(P.x[k] + r); x++) {
        for (let y = Math.floor(P.y[k] - r); y <= Math.floor(P.y[k] + r); y++) {
          const dx = Math.max(x - P.x[k], 0, P.x[k] - x - 1), dy = Math.max(y - P.y[k], 0, P.y[k] - y - 1);
          if (dx * dx + dy * dy < r * r) pola.add(`${x},${y}`);
        }
      }
    }
  }
  return pola;
}
/** Punkty przecięcia dwóch krzywych: [{x, y, s1, s2}] – s1, s2: odległość punktu od początku każdej krzywej. */
export function przeciecia(punkty1, punkty2) {
  const A = probki(punkty1), B = probki(punkty2), wynik = [], kub = new Map();
  for (let i = 0; i < A.n; i++) {   // odcinki pierwszej krzywej w kubełkach po polach siatki
    const k = `${Math.floor(A.x[i])},${Math.floor(A.y[i])}`;
    if (!kub.has(k)) kub.set(k, []);
    kub.get(k).push(i);
  }
  for (let j = 0; j < B.n; j++) {
    const cx = Math.floor(B.x[j]), cy = Math.floor(B.y[j]);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const i of kub.get(`${cx + a},${cy + b}`) || []) {
      const [x1, y1, x2, y2, x3, y3, x4, y4] = [A.x[i], A.y[i], A.x[i + 1], A.y[i + 1], B.x[j], B.y[j], B.x[j + 1], B.y[j + 1]];
      const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
      if (Math.abs(d) < 1e-9) continue;
      const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d, u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
      if (t >= 0 && t < 1 && u >= 0 && u < 1) wynik.push({ x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1), s1: (i + t) * A.krok, s2: (j + u) * B.krok });
    }
  }
  return wynik.filter((p, k) => wynik.findIndex((q) => Math.hypot(p.x - q.x, p.y - q.y) < 0.5) === k);
}
/** Fragment krzywej od s0 do s1 (pola długości), przesunięty o d pól w prawo, jako ścieżka SVG. */
export function odcinek(punkty, s0, s1, d = 0) {
  const P = probki(punkty), k0 = Math.max(0, Math.floor(s0 / P.krok)), k1 = Math.min(P.n, Math.ceil(s1 / P.krok));
  let s = "";
  for (let k = k0; k <= k1; k++) s += `${k > k0 ? "L" : "M"}${f(P.x[k] - P.ty[k] * d)} ${f(P.y[k] + P.tx[k] * d)}`;
  return s;
}
