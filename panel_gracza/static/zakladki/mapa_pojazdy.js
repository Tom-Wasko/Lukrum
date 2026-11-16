// Pojazdy 3D na mapie Lublina (M11): auta, taksówki, dostawczaki, ciężarówki, autobusy, trolejbusy i pociągi jako
// bryły w rzucie mapy, jadące po gładkich krzywych dróg i torów. SMIL nie umie obracać brył w rzucie, więc
// położenie liczy pętla requestAnimationFrame, a rysunek to ścieżki SVG poprawiane co klatkę (widoczne ściany i dach).
// Auta na końcu drogi w mieście skręcają w drogę, która tam dochodzi (albo zawracają) – nie znikają na skrzyżowaniach.
import { ton } from "./mapa_budynki.js";
import { probki, punktNa } from "./mapa_uklad.js";

const SZYBA = "#9cc3df", CL = 0.14, CP = 0.26;
const PAS = 0.072, TOR = 0.11;   // przesunięcie pasa ruchu i toru od osi (pola), ruch prawostronny; tory jak w mapa_teren.js
const GESTOSC = { ekspresowa: 0.4, aleja: 0.3, ulica: 0.2 };
const PREDKOSC = { ekspresowa: 1.8, aleja: 0.9, ulica: 0.75, kolej: 1.9 };
const PASY_EKSPRES = [0.1, 0.27];   // obwodnica: dwa pasy w każdą stronę (wewnętrzny, zewnętrzny)
const AUTA = ["#e45f26", "#2d73d6", "#f2b705", "#43a047", "#7e57c2", "#5f6b7a", "#ec407a", "#f4f4f4", "#263238", "#c62828", "#90a4ae"];
const FLOTA = {
  ekspresowa: [["osobowy", 0.55], ["ciezarowka", 0.25], ["dostawczy", 0.15], ["autobus", 0.05]],
  aleja: [["osobowy", 0.55], ["trolejbus", 0.15], ["autobus", 0.12], ["taksowka", 0.1], ["dostawczy", 0.08]],
  ulica: [["osobowy", 0.7], ["dostawczy", 0.2], ["taksowka", 0.1]],
};
// bryła: [a0, a1 – od tyłu do przodu (pola), w – pół szerokości, h0, h1 – wysokość (px), kolor ścian, kolor dachu | null]
const MODELE = {
  osobowy: (k) => [[-0.13, 0.13, 0.058, 0.6, 3.4, k, k], [-0.08, 0.05, 0.05, 3.4, 5.8, SZYBA, ton(k, -0.1)]],
  taksowka: () => [...MODELE.osobowy("#f7f7f2"), [-0.035, 0.005, 0.018, 5.8, 7, "#ffc400", "#ffd54f"]],
  dostawczy: () => [[-0.17, 0.17, 0.062, 0.6, 7.5, "#eef1f4", "#dde3e8"], [0.13, 0.172, 0.063, 3.4, 6.6, SZYBA, null]],
  ciezarowka: (k) => [[-0.3, 0.11, 0.066, 0.8, 10, "#e3e7eb", "#d0d6db"], [0.12, 0.25, 0.062, 0.8, 7.5, k, ton(k, -0.1)],
    [0.2, 0.252, 0.063, 4, 6.8, SZYBA, null]],
  autobus: () => [[-0.27, 0.27, 0.07, 0.8, 9.5, "#d32f2f", "#eceff1"], [-0.25, 0.272, 0.0705, 4.4, 7.8, SZYBA, null]],
  trolejbus: () => [[-0.27, 0.27, 0.07, 0.8, 9.5, "#2e7d32", "#eceff1"], [-0.25, 0.272, 0.0705, 4.4, 7.8, SZYBA, null]],
};
const wagon = (bok, czolo) => [[-0.25, 0.25, 0.075, 0.8, 10.5, bok, "#a7b0ba"], [-0.22, 0.22, 0.0755, 5, 8, SZYBA, null],
  ...(czolo ? [[0.21, 0.252, 0.076, 5, 8.8, "#263238", null]] : [])];

// prosty generator liczb z ziarnem – ten sam ruch przy każdym rysowaniu
function losowe(klucz) {
  let h = 2166136261;
  for (const c of klucz) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h ^= h >>> 13; return ((h >>> 0) % 1e6) / 1e6; };
}
const wybierz = (lista, r) => { let t = r * lista.reduce((s, [, w]) => s + w, 0); for (const [k, w] of lista) if ((t -= w) <= 0) return k; return lista[0][0]; };

const NS = "http://www.w3.org/2000/svg";
const WEZEL = 0.35;   // koniec drogi bliżej niż tyle pól od innej drogi – skrzyżowanie, można w nią skręcić
let petla = 0;

/** Skrzyżowania na końcach dróg miejskich: dla każdej drogi [na początku, na końcu] lista {d: droga, s: miejsce na niej}. */
function skrzyzowania(drogi) {
  const wynik = new Map();
  for (const d of drogi) {
    const konce = [d.punkty[0], d.punkty[d.punkty.length - 1]].map(([x, y]) => {
      const lista = [];
      for (const o of drogi) {
        if (o === d) continue;
        const P = probki(o.punkty);
        let naj = Infinity, s = 0;
        for (let k = 0; k <= P.n; k++) { const r = Math.hypot(P.x[k] - x, P.y[k] - y); if (r < naj) { naj = r; s = k * P.krok; } }
        if (naj < WEZEL) lista.push({ d: o, s });
      }
      return lista;
    });
    wynik.set(d, konce);
  }
  return wynik;
}

/** Kolejność rysowania brył jednego pojazdu: dalsze najpierw (kabina ciężarówki jadącej tyłem – przed ładunkiem);
 * bryła leżąca na innej (kabina osobówki, kogut taksówki) zawsze po niej; nakładka (szyby) zaraz po bryle, w którą
 * jest wpuszczona. `glebiaW(a)` – głębia punktu osi pojazdu w odległości a od środka. DOM zmieniany tylko przy zmianie. */
function ulozBryly(p, glebiaW) {
  const cz = p.bryly.map(([a0, a1, , h0, h1, , dach], i) => ({ i, a0, a1, h0, h1, nakladka: !dach, gl: glebiaW((a0 + a1) / 2) }));
  for (const c of cz) {
    if (!c.nakladka) continue;
    const m = (c.a0 + c.a1) / 2, rodzic = cz.find((o) => !o.nakladka && o.a0 <= m && m <= o.a1 && o.h0 <= c.h0 && c.h1 <= o.h1 + 0.01);
    if (rodzic) { c.gl = rodzic.gl; c.po = rodzic.i; }
  }
  const lezy = (a, b) => !a.nakladka && !b.nakladka && a.h0 >= b.h1 - 0.01 && a.a0 < b.a1 && b.a0 < a.a1;   // a leży na b
  const kol = cz.slice().sort((a, b) => lezy(a, b) ? 1 : lezy(b, a) ? -1 : a.gl - b.gl || (a.po === b.i ? 1 : b.po === a.i ? -1 : 0));
  // podstawa przed tym, co na niej leży, nawet gdy sortowanie ich rozdzieliło
  for (let k = 0; k < kol.length; k++) {
    for (let j = k + 1; j < kol.length; j++) if (lezy(kol[k], kol[j])) { kol.splice(j + 1, 0, kol[k]); kol.splice(k, 1); k--; break; }
  }
  const klucz = kol.map((c) => c.i).join(",");
  if (klucz === p.kolejnosc) return;
  p.kolejnosc = klucz;
  for (const c of kol) for (const el of p.el[c.i]) if (el) p.grupa.append(el);
  if (p.kreska) p.grupa.append(p.kreska);
}

/** Uruchamia ruch pojazdów 3D w grupie #mapa-pojazdy (zatrzymuje poprzedni). `trasy` – drogi z trasyMiasta. */
export function uruchomPojazdy(svg, g, trasy, natezenie) {
  cancelAnimationFrame(petla);
  const warstwa = svg.querySelector("#mapa-pojazdy");
  if (!warstwa) return;
  const pojazdy = [];
  // grupy z maskami tuneli (mapa_teren.js: maskaTuneli): pociągi znikają pod drogami, auta z dróg miejskich pod
  // obwodnicą; auta na obwodnicy na wierzchu, bez maski
  const grupa = (maska) => {
    const el = document.createElementNS(NS, "g");
    if (maska && svg.querySelector(`#${maska}`)) el.setAttribute("mask", `url(#${maska})`);
    warstwa.append(el);
    return el;
  };
  const pociagi = grupa("mapa-tunele"), miejskie = grupa("mapa-tunele-drog"), ekspresowe = grupa(null);
  const miasto = trasy.filter((d) => !["ekspresowa", "kolej", "deptak"].includes(d.rodzaj)), wezly = skrzyzowania(miasto);
  const dodaj = (P, s0, v, wstecz, bryly, przes, linie, cel, d = null) => {
    const el = bryly.map(([, , , , , bok, dach]) => {
      const sciany = [ton(bok, CL), ton(bok, CP)].map((k) => { const p = document.createElementNS(NS, "path"); p.setAttribute("fill", k); return p; });
      const gora = dach ? document.createElementNS(NS, "path") : null;
      if (gora) gora.setAttribute("fill", dach);
      return [...sciany, gora];
    });
    const grupa = document.createElementNS(NS, "g");
    for (const trzy of el) for (const p of trzy) if (p) grupa.append(p);
    let kreska = null;
    if (linie) { kreska = document.createElementNS(NS, "path"); kreska.setAttribute("stroke", "#37474f"); kreska.setAttribute("stroke-width", ".7"); kreska.setAttribute("fill", "none"); grupa.append(kreska); }
    cel.append(grupa);
    // s – przejechana droga od początku jazdy w kierunku ruchu; d – droga miejska (skręca na skrzyżowaniach)
    const zakres = [Math.min(...bryly.map((b) => b[0])), Math.max(...bryly.map((b) => b[1]))];   // tył i przód pojazdu
    pojazdy.push({ P, s: ((s0 % P.dl) + P.dl) % P.dl, v, wstecz, bryly, el, przes, kreska, grupa, cel, d, zakres, kolejnosc: "", glebia: 0 });
  };
  for (const d of trasy) {
    if (d.rodzaj === "deptak") continue;
    const P = probki(d.punkty), los = losowe(d.id);
    if (d.rodzaj === "kolej") {
      for (const [bok, wagony, wstecz, start] of [["#c62828", 4, false, 0.1], ["#1565c0", 3, true, 0.6]]) {
        for (let w = 0; w < wagony; w++) {
          // wagony co 0,53 pola za czołem (w obu kierunkach jazdy – położenie liczone od końca toru); ostatni wagon
          // to drugie czoło zespołu trakcyjnego, odwrócone
          const ostatni = w === wagony - 1;
          let b = wagon(bok, w === 0 || ostatni);
          if (ostatni) b = b.map(([a0, a1, ...r]) => [-a1, -a0, ...r]);
          dodaj(P, start * P.dl - w * 0.53, PREDKOSC.kolej, wstecz, b, TOR, false, pociagi);
        }
      }
      continue;
    }
    const n = Math.max(1, Math.round(P.dl * GESTOSC[d.rodzaj] * natezenie));
    for (let i = 0; i < n; i++) {
      const kolor = AUTA[Math.floor(los() * AUTA.length)], rodzaj = wybierz(FLOTA[d.rodzaj], los());
      const pas = d.rodzaj === "ekspresowa" ? PASY_EKSPRES[Math.floor(i / 2) % 2] : PAS;
      const ekspres = d.rodzaj === "ekspresowa";
      dodaj(P, (i / n) * P.dl, PREDKOSC[d.rodzaj] * (pas === PASY_EKSPRES[0] ? 1.15 : 1), i % 2 === 1, MODELE[rodzaj](kolor), pas,
        rodzaj === "trolejbus", ekspres ? ekspresowe : miejskie, ekspres ? null : d);
    }
  }
  const pkt = (x, y, h) => { const [a, b] = g.p(x, y, h); return `${a.toFixed(1)},${b.toFixed(1)}`; };
  /** Auto miejskie na końcu drogi: skręca w losową drogę ze skrzyżowania (w stronę, w którą jest dokąd jechać) albo
   * zawraca; pociągi i obwodnica kończą się daleko za kadrem – tam po prostu od początku. */
  const dalej = (p) => {
    const L = p.P.dl;
    if (!p.d) { p.s -= L; return; }
    const opcje = [];
    for (const { d, s } of wezly.get(p.d)[p.wstecz ? 0 : 1]) {
      const P = probki(d.punkty);
      if (P.dl - s > 0.5) opcje.push({ d, P, s, wstecz: false });
      if (s > 0.5) opcje.push({ d, P, s: P.dl - s, wstecz: true });
    }
    const reszta = p.s - L;
    if (!opcje.length) { p.wstecz = !p.wstecz; p.s = reszta; return; }   // ślepy koniec (albo za kadrem) – zawraca
    const o = opcje[Math.floor(Math.random() * opcje.length)];
    p.v *= PREDKOSC[o.d.rodzaj] / PREDKOSC[p.d.rodzaj];
    Object.assign(p, { d: o.d, P: o.P, wstecz: o.wstecz, s: o.s + reszta });
  };
  let poprzednia = performance.now() / 1000;
  const klatka = () => {
    if (!svg.isConnected) return;
    const t = performance.now() / 1000, dt = Math.min(0.1, t - poprzednia);   // po powrocie do karty bez skoku
    poprzednia = t;
    for (const p of pojazdy) {
      p.s += p.v * dt;
      while (p.s >= p.P.dl) dalej(p);
      const L = p.P.dl, s = p.s;
      const [x, y, tx, ty] = punktNa(p.P, p.wstecz ? L - s : s);
      const ux = p.wstecz ? -tx : tx, uy = p.wstecz ? -ty : ty, vx = -uy, vy = ux;   // kierunek jazdy i prawa strona
      const cx = x + vx * p.przes, cy = y + vy * p.przes;
      p.glebia = g.glebia(cx, cy);   // bliżej patrzącego – rysowany później
      const rog = (a, b) => [cx + ux * a + vx * b, cy + uy * a + vy * b];
      p.bryly.forEach(([a0, a1, w, h0, h1, , dach], i) => {
        const [L1, P1, gora] = p.el[i];
        const sciany = [[rog(a1, -w), rog(a1, w), ux, uy], [rog(a0, w), rog(a0, -w), -ux, -uy], [rog(a0, w), rog(a1, w), vx, vy], [rog(a1, -w), rog(a0, -w), -vx, -vy]];
        // nakładka (szyby: bez dachu) wpuszczona w nadwozie: przód i tył tylko na skraju pojazdu (przednia szyba, czoło
        // pociągu) – inaczej jej ściana z wnętrza nadwozia prześwitywałaby, gdy pojazd jedzie tyłem do patrzącego
        const [amin, amax] = p.zakres;
        let jasna = "", ciemna = "";
        for (const [k, [A, B, nx, ny]] of sciany.entries()) {
          if (!g.widac(nx, ny)) continue;   // ściana odwrócona od widza
          if (!dach && ((k === 0 && a1 < amax - 1e-3) || (k === 1 && a0 > amin + 1e-3))) continue;
          const d = `M${pkt(A[0], A[1], h0)}L${pkt(B[0], B[1], h0)}L${pkt(B[0], B[1], h1)}L${pkt(A[0], A[1], h1)}Z`;
          if (nx - ny < 0 && !jasna) jasna = d; else if (!ciemna) ciemna = d; else jasna = d;
        }
        L1.setAttribute("d", jasna);
        P1.setAttribute("d", ciemna);
        if (gora) {
          const r = [rog(a0, -w), rog(a1, -w), rog(a1, w), rog(a0, w)];
          gora.setAttribute("d", `M${r.map(([rx, ry]) => pkt(rx, ry, h1)).join("L")}Z`);
        }
      });
      ulozBryly(p, (a) => g.glebia(cx + ux * a, cy + uy * a));
      if (p.kreska) {   // pałąki trolejbusu do sieci
        const [a, b] = [rog(-0.04, -0.025), rog(-0.04, 0.025)], [c, e] = [rog(-0.24, -0.03), rog(-0.24, 0.03)];
        p.kreska.setAttribute("d", `M${pkt(a[0], a[1], 9.5)}L${pkt(c[0], c[1], 16)}M${pkt(b[0], b[1], 9.5)}L${pkt(e[0], e[1], 16)}`);
      }
    }
    // M16: kolejność rysowania według głębi – pojazd za innym nie wjeżdża na niego (zmiana DOM tylko gdy trzeba)
    for (const cel of [pociagi, miejskie, ekspresowe]) {
      const lista = pojazdy.filter((p) => p.cel === cel).sort((a, b) => a.glebia - b.glebia);
      if (lista.some((p, i) => cel.children[i] !== p.grupa)) for (const p of lista) cel.append(p.grupa);
    }
    petla = requestAnimationFrame(klatka);
  };
  klatka();
}
