// Budynki mapy Lublina (M7): zestaw części (ściany z oknami, parter z witryną i markizą, szyldy na ścianach,
// attyka lubelska, dachy, wieże i walce) oraz przepisy dla budynków z budynki.yaml, lokali i zabytków z miasto.yaml.
// Tylko wygląd – dane gry bez zmian. Rysujemy w pikselach ekranu przez g.p(x, y, h), jak bryla() w mapa_teren.js
// (pomocnicze pkt/romb są tu osobno, bo mapa_teren.js importuje stąd zabytki).
import { polaTras } from "./mapa_uklad.js";
import { esc } from "./wspolne.js";

const pkt = (lista) => lista.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");
const romb = (g, x, y, s, l, h = 0) => [g.p(x, y, h), g.p(x + s, y, h), g.p(x + s, y + l, h), g.p(x, y + l, h)];

// --- kolory ---
// styl kreskówkowy: cień w fiolet zamiast szarości, łagodniejszy (lewa – przód, prawa – bok)
const CIEN = [0x5b, 0x3f, 0x86], CL = 0.1, CP = 0.22;
/** Kolor `hex` przyciemniony o t (0–1) albo rozjaśniony (t < 0). */
export function ton(hex, t) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255];
  const z = t >= 0 ? CIEN : [255, 255, 255], a = Math.abs(t);
  return `#${c.map((v, i) => Math.round(v + (z[i] - v) * a).toString(16).padStart(2, "0")).join("")}`;
}
// cukierkowe fasady kamienic Starego Miasta i Krakowskiego Przedmieścia
const FASADY = ["#ffd66e", "#ffa9c0", "#93e3c0", "#9fd3ff", "#fff0b8", "#ffb48a", "#cdb4ff", "#ffcf9e"];
const DACHOWKA = "#ff6b6b", BLACHA = "#b9c3e8", SZYBA = "#8fdcff", STOLARKA = "#8a5a44", MIEDZ = "#5fd6b0";

const wiel = (pts, fill, reszta = "") => `<polygon points="${pkt(pts)}" fill="${fill}"${reszta}/>`;
const KONTUR = "#4b3a66", UPROSZCZENIE = 1.5;   // gruby ciemnofioletowy kontur – wygląd kreskówki
const OBRYS = ` stroke="${KONTUR}" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"`;

/** Prostopadłościan od wysokości h0 do h1 (px): dwie widoczne ściany i dach. */
export function blok(g, x, y, s, l, h0, h1, kolor, dach = kolor) {
  const L = [g.p(x, y + l, h0), g.p(x + s, y + l, h0), g.p(x + s, y + l, h1), g.p(x, y + l, h1)];
  const P = [g.p(x + s, y, h0), g.p(x + s, y + l, h0), g.p(x + s, y + l, h1), g.p(x + s, y, h1)];
  return wiel(L, ton(kolor, CL), OBRYS) + wiel(P, ton(kolor, CP), OBRYS) + wiel(romb(g, x, y, s, l, h1), dach, OBRYS);
}

/** Widoczne ściany prostopadłościanu: L (przód, y + l) i P (bok, x + s). pt(u, h, d) – punkt u pól od lewej
 * krawędzi ściany na wysokości h, d pól przed ścianą; `nachyl` – pochylenie napisu na ścianie. */
function sciany(g, x, y, s, l) {
  const [a, b] = g.p(0, 0), [c, e] = g.p(1, 0), [f, k] = g.p(0, -1);   // kierunki ścian na ekranie (zależą od rzutu)
  return {
    L: { pt: (u, h, d = 0) => g.p(x + u, y + l + d, h), dl: s, cien: CL, nachyl: (e - b) / (c - a) },
    P: { pt: (u, h, d = 0) => g.p(x + s + d, y + l - u, h), dl: l, cien: CP, nachyl: (k - b) / (f - a) },
  };
}
/** Prostokąt na ścianie (cieniowany jak ściana). */
const plat = (S, u0, h0, u1, h1, kolor, d = 0) =>
  wiel([S.pt(u0, h0, d), S.pt(u1, h0, d), S.pt(u1, h1, d), S.pt(u0, h1, d)], ton(kolor, S.cien));

/** Prostokąt na ścianie jako fragment ścieżki (wiele okien = jedna ścieżka). */
const czworokat = (S, u0, h0, u1, h1) => `M${pkt([S.pt(u0, h0), S.pt(u1, h0), S.pt(u1, h1), S.pt(u0, h1)]).replace(/ /g, "L")}Z`;
/** Okna w rzędach pięter od h0 do h1 (jedna ścieżka szyb na ścianę). Styl kreskówkowy: okna rzadsze i większe
 * (UPROSZCZENIE razy), z konturem, bez ram – `rama` z dawnych przepisów jest pomijana. */
function okna(S, h0, h1, { pietro = 8, wys = 4.6, szer = 0.1, krok = 0.22, od = 0.08, kolor = SZYBA } = {}) {
  krok *= UPROSZCZENIE; szer *= 1.8; pietro *= UPROSZCZENIE; wys = Math.min(wys * 1.5, pietro * 0.8);
  const dl = S.dl - 2 * od, n = Math.max(1, Math.floor(dl / krok + 0.4)), k = dl / n;
  let d = "";
  for (let b = h0; b + pietro <= h1 + 0.5; b += pietro) {
    const h = b + (pietro - wys) / 2;
    for (let i = 0; i < n; i++) {
      const u = od + k * (i + 0.5);
      d += czworokat(S, u - szer / 2, h, u + szer / 2, h + wys);
    }
  }
  return d ? `<path d="${d}" fill="${ton(kolor, S.cien)}" stroke="${KONTUR}" stroke-width=".6" stroke-linejoin="round"/>` : "";
}
/** Ciągłe pasy szyb (biurowce, szkło). */
function pasy(S, h0, h1, { co = 6, wys = 3.6, kolor = SZYBA, od = 0.03 } = {}) {
  let html = "";
  for (let h = h0; h + wys <= h1; h += co) html += plat(S, od, h, S.dl - od, h + wys, kolor);
  return html;
}
/** Witryna parteru: jedna szyba z konturem (styl kreskówkowy). */
function witryna(S, u0, u1, h0 = 1, h1 = 6.5) {
  return wiel([S.pt(u0, h0), S.pt(u1, h0), S.pt(u1, h1), S.pt(u0, h1)], ton(SZYBA, S.cien), OBRYS);
}
const drzwi = (S, u, h = 6.5, szer = 0.1, kolor = STOLARKA) => plat(S, u - szer / 2, 0, u + szer / 2, h, kolor);

/** Markiza w paski nad parterem: od ściany na wysokości h do d pól przed ścianą, 3,5 px niżej. */
function markiza(S, u0, u1, h, kolor, d = 0.1, paski = true) {
  const n = paski ? Math.max(2, Math.round((u1 - u0) / 0.12)) : 1;
  let html = "";
  for (let i = 0; i < n; i++) {
    const a = u0 + (u1 - u0) * i / n, b = u0 + (u1 - u0) * (i + 1) / n;
    html += wiel([S.pt(a, h), S.pt(b, h), S.pt(b, h - 3.5, d), S.pt(a, h - 3.5, d)], ton(paski && i % 2 ? "#ffffff" : kolor, S.cien * 0.6));
  }
  return html;
}

/** Napis na ścianie (pochylony jak ściana). */
function napis(S, u, h, tekst, f, kolor = "#ffffff") {
  const [a, b] = S.pt(u, h);
  return `<text transform="matrix(1 ${S.nachyl} 0 1 ${a.toFixed(1)} ${b.toFixed(1)})" font-size="${f.toFixed(1)}" fill="${kolor}"`
    + ` text-anchor="middle" class="szyld">${esc(tekst)}</text>`;
}
/** Szyld: tło na ścianie i napis dopasowany do szerokości. */
function szyld(S, u0, u1, h0, h1, tlo, tekst, kolor = "#ffffff") {
  const szer = Math.abs(S.pt(u1, 0)[0] - S.pt(u0, 0)[0]);
  const f = Math.min(h1 - h0 - 0.8, szer / (0.66 * Math.max(tekst.length, 1)));
  // na mocno pochylonej (wąskiej, bocznej) ścianie sam szyld bez napisu – tekst byłby nieczytelny
  return plat(S, u0, h0, u1, h1, tlo) + (f >= 1.6 && Math.abs(S.nachyl) <= 1.2 ? napis(S, (u0 + u1) / 2, h0 + (h1 - h0 - f * 0.72) / 2, tekst, f, kolor) : "");
}
/** Tarcza zegara na ścianie. */
function zegar(S, u, h, r = 3.2) {
  const [a, b] = S.pt(u, h);
  return `<g transform="matrix(1 ${S.nachyl} 0 1 ${a.toFixed(1)} ${b.toFixed(1)})"><circle r="${r}" fill="#fdfaf0" stroke="#3b3326" stroke-width=".6"/>`
    + `<path d="M0 0V${-r * 0.7}M0 0H${r * 0.5}" stroke="#3b3326" stroke-width=".6" stroke-linecap="round"/></g>`;
}
/** Okno zamknięte łukiem (gotyk, brama). */
function luk(S, u, h0, h1, szer, kolor) {
  const pts = [S.pt(u - szer / 2, h0), S.pt(u + szer / 2, h0), S.pt(u + szer / 2, h1 - szer * 18),
    S.pt(u + szer / 4, h1 - szer * 5), S.pt(u, h1), S.pt(u - szer / 4, h1 - szer * 5), S.pt(u - szer / 2, h1 - szer * 18)];
  return wiel(pts, ton(kolor, S.cien));
}

// --- dachy ---
/** Dach płaski z obróbką (attyka) i opcjonalnymi urządzeniami na dachu. */
function dachPlaski(g, x, y, s, l, h, { urzadzenia = 0, swietliki = 0 } = {}) {
  let html = wiel(romb(g, x + 0.05, y + 0.05, s - 0.1, l - 0.1, h), "#1b2433", ` opacity=".1"`);
  for (let i = 0; i < swietliki; i++) {
    const u = x + 0.2 + (s - 0.4) * (i + 0.5) / swietliki;
    html += wiel(romb(g, u - 0.05, y + 0.2, 0.1, l - 0.4, h), "#cfe3f2");
  }
  for (let i = 0; i < urzadzenia; i++) html += blok(g, x + s - 0.32 - i * 0.2, y + 0.15, 0.12, 0.12, h, h + 3, "#c9ced6");
  return html;
}
/** Dach dwuspadowy; kalenica wzdłuż osi x („x”) albo y („y”), szczyt w kolorze ściany. */
function dachDwuspadowy(g, x, y, s, l, h, w, kolor, sciana, os = "x") {
  if (os === "x") {
    const m = y + l / 2;
    return wiel([g.p(x, y, h), g.p(x + s, y, h), g.p(x + s, m, h + w), g.p(x, m, h + w)], ton(kolor, -0.08), OBRYS)
      + wiel([g.p(x, y + l, h), g.p(x + s, y + l, h), g.p(x + s, m, h + w), g.p(x, m, h + w)], ton(kolor, 0.1), OBRYS)
      + wiel([g.p(x + s, y, h), g.p(x + s, y + l, h), g.p(x + s, m, h + w)], ton(sciana, CP), OBRYS);
  }
  const m = x + s / 2;
  return wiel([g.p(x, y, h), g.p(x, y + l, h), g.p(m, y + l, h + w), g.p(m, y, h + w)], ton(kolor, -0.05), OBRYS)
    + wiel([g.p(x + s, y, h), g.p(x + s, y + l, h), g.p(m, y + l, h + w), g.p(m, y, h + w)], ton(kolor, 0.22), OBRYS)
    + wiel([g.p(x, y + l, h), g.p(x + s, y + l, h), g.p(m, y + l, h + w)], ton(sciana, CL), OBRYS);
}
/** Dach czterospadowy (ostrosłup). */
function dachNamiotowy(g, x, y, s, l, h, w, kolor) {
  const E = g.p(x + s / 2, y + l / 2, h + w);
  const tr = (a, b, t) => wiel([a, b, E], ton(kolor, t), OBRYS);
  return tr(g.p(x, y, h), g.p(x + s, y, h), -0.06) + tr(g.p(x, y, h), g.p(x, y + l, h), 0)
    + tr(g.p(x, y + l, h), g.p(x + s, y + l, h), 0.12) + tr(g.p(x + s, y, h), g.p(x + s, y + l, h), 0.24);
}
/** Dach łukowy (kolebkowy) nad halą, kalenica wzdłuż x. */
function dachLukowy(g, x, y, s, l, h, w, kolor, sciana) {
  const n = 8, prof = Array.from({ length: n + 1 }, (_, i) => [y + l * i / n, h + w * Math.sin(Math.PI * i / n)]);
  let html = "";
  for (let i = 0; i < n; i++) {
    const [y0, h0] = prof[i], [y1, h1] = prof[i + 1];
    html += wiel([g.p(x, y0, h0), g.p(x + s, y0, h0), g.p(x + s, y1, h1), g.p(x, y1, h1)], ton(kolor, -0.1 + 0.3 * i / n), OBRYS);
  }
  return html + wiel(prof.map(([py, ph]) => g.p(x + s, py, ph)), ton(sciana, CP), OBRYS);
}
/** Dach pulpitowy (jednospadowy) podniesiony od frontu, z pasem w kolorze marki na podniesionej ścianie. */
function dachPulpitowy(g, x, y, s, l, h, w, kolor, pas) {
  return wiel([g.p(x, y, h), g.p(x + s, y, h), g.p(x + s, y + l, h + w), g.p(x, y + l, h + w)], kolor, OBRYS)
    + wiel([g.p(x, y + l, h), g.p(x + s, y + l, h), g.p(x + s, y + l, h + w), g.p(x, y + l, h + w)], ton(pas, CL), OBRYS)
    + wiel([g.p(x + s, y, h), g.p(x + s, y + l, h), g.p(x + s, y + l, h + w)], ton(pas, CP), OBRYS);
}
/** Kopuła na bębnie (walec + półelipsa). */
function kopula(g, cx, cy, r, h, kolor) {
  const [a, b] = g.p(cx, cy, h), f = (n) => n.toFixed(1);
  const [kx, ky] = g.elipsa(r);
  if (g.plaski) return kolo2d(a, b, kx, kolor);
  return `<path d="M${f(a - kx)} ${f(b)}A${f(kx)} ${f(kx * 0.95)} 0 0 1 ${f(a + kx)} ${f(b)}A${f(kx)} ${f(ky)} 0 0 1 ${f(a - kx)} ${f(b)}Z" fill="${kolor}"${OBRYS}/>`
    + `<path d="M${f(a + kx * 0.2)} ${f(b - kx * 0.93)}A${f(kx)} ${f(kx * 0.95)} 0 0 1 ${f(a + kx)} ${f(b)}A${f(kx)} ${f(ky)} 0 0 1 ${f(a + kx * 0.2)} ${f(b + ky * 0.98)}Z" fill="#1b2433" opacity=".2"/>`;
}
/** Nowoczesny biurowiec: pasy szyb, szyld nad parterem. */
function biurowiec(g, x, y, s, l, { h = 32, sciana = "#e9edf1", szklo = SZYBA, szyld: sz, co = 6 } = {}) {
  const S = sciany(g, x, y, s, l);
  let html = blok(g, x, y, s, l, 0, h, sciana, ton(sciana, 0.12)) + pasy(S.L, 10, h - 1, { co, kolor: szklo }) + pasy(S.P, 10, h - 1, { co, kolor: szklo });
  html += witryna(S.L, 0.06, S.L.dl - 0.2) + drzwi(S.L, S.L.dl - 0.11, 6.5, 0.1, "#37474f");
  if (sz) html += szyld(S.L, 0.04, S.L.dl - 0.04, 6.8, 9.6, sz[1], sz[0], sz[2]);
  return html + dachPlaski(g, x, y, s, l, h, { urzadzenia: 1 });
}
/** Attyka lubelska (renesans lubelski): ściany przedłużone ponad dach, ślepe arkady i sterczyny. */
function attyka(g, x, y, s, l, h, kolor, w = 5) {
  const S = sciany(g, x, y, s, l), jasny = ton(kolor, -0.3);
  // wnętrze: dach i tylne ścianki attyki widziane od środka
  let html = wiel(romb(g, x, y, s, l, h), BLACHA)
    + wiel([g.p(x, y, h), g.p(x + s, y, h), g.p(x + s, y, h + w), g.p(x, y, h + w)], ton(kolor, CL + 0.12))
    + wiel([g.p(x, y, h), g.p(x, y + l, h), g.p(x, y + l, h + w), g.p(x, y, h + w)], ton(kolor, CP + 0.12));
  const sterczyna = (a, b) => wiel([[a - 1.1, b], [a + 1.1, b], [a, b - 4.5]], jasny);
  for (const [px, py] of [[x, y], [x + s, y], [x, y + l]]) { const [a, b] = g.p(px, py, h + w); html += sterczyna(a, b); }
  for (const K of [S.L, S.P]) {
    html += plat(K, 0, h, K.dl, h + w, kolor) + plat(K, 0, h + w - 0.8, K.dl, h + w, jasny);
    const n = Math.max(2, Math.round(K.dl / 0.24));
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) * K.dl / n;
      html += plat(K, u - 0.025, h + 1, u + 0.025, h + w - 1.6, ton(kolor, 0.3));
    }
    for (let i = 1; i < Math.round(K.dl / 0.5); i++) { const [a, b] = K.pt(i * K.dl / Math.round(K.dl / 0.5), h + w); html += sterczyna(a, b); }
  }
  const [a, b] = g.p(x + s, y + l, h + w);
  return html + sterczyna(a, b);
}
/** Blanki na murze (zamek): zęby na ścianach L i P. */
function blanki(g, x, y, s, l, h, kolor) {
  const S = sciany(g, x, y, s, l);
  let html = wiel([g.p(x, y, h), g.p(x + s, y, h), g.p(x + s, y, h + 3), g.p(x, y, h + 3)], ton(kolor, CL + 0.08))
    + wiel([g.p(x, y, h), g.p(x, y + l, h), g.p(x, y + l, h + 3), g.p(x, y, h + 3)], ton(kolor, CP + 0.08));
  for (const K of [S.L, S.P]) {
    const n = Math.max(2, Math.round(K.dl / 0.09));
    for (let i = 0; i < n; i += 2) html += plat(K, i * K.dl / n, h, (i + 1) * K.dl / n, h + 3, kolor);
  }
  return html;
}

// --- walec i stożek (wieże okrągłe) ---
/** Widok 2D: kopuła albo stożek z góry – koło z jaśniejszym połyskiem. */
const kolo2d = (a, b, r, kolor) => `<circle cx="${a.toFixed(1)}" cy="${b.toFixed(1)}" r="${r.toFixed(1)}" fill="${kolor}"${OBRYS}/>`
  + `<circle cx="${(a - r * 0.3).toFixed(1)}" cy="${(b - r * 0.3).toFixed(1)}" r="${(r * 0.35).toFixed(1)}" fill="#ffffff" opacity=".3"/>`;
function walec(g, cx, cy, r, h0, h1, kolor, dach = kolor) {
  const [a, b0] = g.p(cx, cy, h0), b1 = g.p(cx, cy, h1)[1];
  const [kx, ky] = g.elipsa(r);
  const f = (n) => n.toFixed(1);
  return `<path d="M${f(a - kx)} ${f(b1)}V${f(b0)}A${f(kx)} ${f(ky)} 0 0 0 ${f(a + kx)} ${f(b0)}V${f(b1)}Z" fill="${ton(kolor, CL)}"${OBRYS}/>`
    + `<path d="M${f(a + kx * 0.15)} ${f(b1)}V${f(b0 + ky * 0.99)}A${f(kx)} ${f(ky)} 0 0 0 ${f(a + kx)} ${f(b0)}V${f(b1)}Z" fill="${ton(kolor, CP)}"/>`
    + `<ellipse cx="${f(a)}" cy="${f(b1)}" rx="${f(kx)}" ry="${f(ky)}" fill="${dach}"${OBRYS}/>`;
}
function stozek(g, cx, cy, r, h, w, kolor) {
  const [a, b] = g.p(cx, cy, h), f = (n) => n.toFixed(1);
  const [kx, ky] = g.elipsa(r);
  if (g.plaski) return kolo2d(a, b, kx, kolor);
  return `<path d="M${f(a - kx)} ${f(b)}A${f(kx)} ${f(ky)} 0 0 0 ${f(a + kx)} ${f(b)}L${f(a)} ${f(b - w)}Z" fill="${ton(kolor, 0.04)}"${OBRYS}/>`
    + `<path d="M${f(a + kx * 0.15)} ${f(b + ky * 0.99)}A${f(kx)} ${f(ky)} 0 0 0 ${f(a + kx)} ${f(b)}L${f(a)} ${f(b - w)}Z" fill="${ton(kolor, 0.24)}"/>`;
}
/** Maszt z flagą albo iglicą na (cx, cy) od wysokości h. */
function maszt(g, cx, cy, h, w, flaga) {
  const [a, b] = g.p(cx, cy, h);
  return `<line x1="${a}" y1="${b}" x2="${a}" y2="${b - w}" stroke="#4a4a4a" stroke-width=".8"/>`
    + (flaga ? `<path d="M${a} ${b - w}h6v1.8h-6z" fill="#ffffff"/><path d="M${a} ${b - w + 1.8}h6v1.8h-6z" fill="#d4213d"/>` : "");
}

// --- przepisy ---
/** Kamienica: parter (witryna, markiza, szyld), piętra z oknami, gzyms i dach (attyka lubelska, dwuspadowy, płaski). */
function kamienica(g, x, y, s, l, o) {
  const { h = 26, kolor = FASADY[0], dach = "attyka", markizaKolor, szyld: sz, sklep = true, zdobienia = true } = o;
  const S = sciany(g, x, y, s, l);
  let html = blok(g, x, y, s, l, 0, h, kolor, dach === "plaski" ? "#d5d1c8" : BLACHA);
  // cokół parteru
  html += plat(S.L, 0, 0, S.L.dl, 1, ton(kolor, 0.25)) + plat(S.P, 0, 0, S.P.dl, 1, ton(kolor, 0.25));
  if (sklep) html += witryna(S.L, 0.08, S.L.dl - 0.22) + drzwi(S.L, S.L.dl - 0.12);
  else html += okna(S.L, 0, 9, { pietro: 9 }) ;
  html += okna(S.P, 0, 9, { pietro: 9, krok: 0.26 });
  html += okna(S.L, 11, h - 1.5, { rama: zdobienia ? ton(kolor, -0.4) : undefined }) + okna(S.P, 11, h - 1.5, { rama: zdobienia ? ton(kolor, -0.4) : undefined });
  if (zdobienia) html += plat(S.L, 0, h - 1.2, S.L.dl, h, ton(kolor, -0.35)) + plat(S.P, 0, h - 1.2, S.P.dl, h, ton(kolor, -0.35))
    + plat(S.L, 0, 10.4, S.L.dl, 11, ton(kolor, -0.35)) + plat(S.P, 0, 10.4, S.P.dl, 11, ton(kolor, -0.35));
  if (sz) html += szyld(S.L, 0.06, S.L.dl - 0.06, 7.4, 10.2, sz[1], sz[0], sz[2]);
  if (markizaKolor) html += markiza(S.L, 0.06, S.L.dl - 0.06, 7.2, markizaKolor);
  if (dach === "attyka") html += attyka(g, x, y, s, l, h, kolor);
  else if (dach === "dwuspadowy") html += dachDwuspadowy(g, x, y, s, l, h, 9, DACHOWKA, kolor, s >= l ? "x" : "y");
  else if (dach === "namiotowy") html += dachNamiotowy(g, x, y, s, l, h, 8, DACHOWKA);
  else html += dachPlaski(g, x, y, s, l, h, { urzadzenia: 1 });
  return html;
}

/** Hala handlowa / hurtownia: niska bryła, pas w kolorze marki z nazwą, wejście z daszkiem, rampy, parking. */
function hala(g, x, y, s, l, { tlo, tekst = "#ffffff", nazwa, sciana = "#eceef1", h = 14, rampy = true, dach = "plaski", szklo = false }) {
  const parking = l >= 2;
  const L_ = parking ? l - 0.62 : l;
  const S = sciany(g, x, y, s, L_);
  let html = "";
  if (parking) {   // parking przed wejściem: asfalt, linie, kilka aut
    const py = y + L_ + 0.06, pl = l - L_ - 0.06;
    html += wiel(romb(g, x, py, s, pl), "#c3c7cd");
    for (let u = x + 0.12; u < x + s - 0.05; u += 0.16) html += `<line x1="${g.p(u, py + 0.05)[0]}" y1="${g.p(u, py + 0.05)[1]}" x2="${g.p(u, py + 0.24)[0]}" y2="${g.p(u, py + 0.24)[1]}" stroke="#fff" stroke-width=".6"/>`;
    const auta = ["#e45f26", "#2d73d6", "#f4f1ea", "#43a047", "#5f6b7a"];
    for (let i = 0; i < 5; i++) {
      const u = x + 0.16 + ((i * 7) % 11) * 0.16;
      if (u > x + s - 0.16) continue;
      html += blok(g, u + 0.02, py + 0.07, 0.11, 0.17, 0, 2.6, auta[i]);
    }
  }
  html += blok(g, x, y, s, L_, 0, h, sciana, "#d3d7dc");
  if (szklo) html += witryna(S.L, 0.05, S.L.dl - 0.05, 0, h - 5.5);   // przeszklony front
  html += plat(S.L, 0, h - 5, S.L.dl, h - 0.6, tlo) + plat(S.P, 0, h - 5, S.P.dl, h - 0.6, tlo);
  const f = Math.min(3.6, Math.abs(S.L.pt(S.L.dl * 0.8, 0)[0] - S.L.pt(0, 0)[0]) / (0.66 * nazwa.length));
  html += napis(S.L, S.L.dl / 2, h - 4.4 + (4.4 - f * 0.72) / 2, nazwa, f, tekst);
  const w = S.L.dl / 2;   // wejście ze szklanymi drzwiami i daszkiem
  html += witryna(S.L, w - 0.28, w + 0.28, 0, 6.5) + markiza(S.L, w - 0.34, w + 0.34, 7.6, tlo, 0.1, false);
  if (rampy) for (let i = 0; i < Math.min(3, Math.floor(S.P.dl / 0.3)); i++) {
    const u = 0.15 + i * 0.3;
    html += plat(S.P, u, 0, u + 0.2, 6, "#5b6470") + plat(S.P, u - 0.02, 6, u + 0.22, 6.8, "#3d444e");
  }
  if (dach === "lukowy") return html + dachLukowy(g, x, y, s, L_, h, 8, "#b9c0c8", sciana);
  if (dach === "dwuspadowy") return html + dachDwuspadowy(g, x, y, s, L_, h, 5, "#a9b0b8", sciana, s >= L_ ? "x" : "y");
  if (dach === "pulpitowy") return html + dachPulpitowy(g, x, y, s, L_, h, 6, "#9aa3ad", tlo);
  return html + dachPlaski(g, x, y, s, L_, h, { urzadzenia: 2, swietliki: Math.round(s * 1.5) });
}

/** Zakład z dachem szedowym (piłokształtnym): stolarnia, zakłady mięsne. */
function zaklad(g, x, y, s, l, { sciana = "#e6e1d8", h = 12, nazwa, tlo = "#5b6470", komin = true }) {
  const S = sciany(g, x, y, s, l);
  let html = blok(g, x, y, s, l, 0, h, sciana, "#b7bcc3") + okna(S.L, 2, h - 2, { pietro: h - 4, wys: 5, krok: 0.2 });
  html += plat(S.P, 0.1, 0, 0.45, 8, "#6c7480") + plat(S.P, 0.1, 8, 0.45, 8.6, "#3d444e");   // brama
  if (nazwa) html += szyld(S.L, 0.15, S.L.dl - 0.15, h - 3.4, h - 0.6, tlo, nazwa);
  if (komin) html += walec(g, x + 0.18, y + 0.2, 0.06, h, h + 26, "#a5523a", "#3d2a22");
  const n = Math.max(2, Math.round(s / 0.35)), w = s / n;
  for (let i = 0; i < n; i++) {
    const a = x + i * w;
    html += wiel([g.p(a, y, h), g.p(a, y + l, h), g.p(a + w, y + l, h + 6), g.p(a + w, y, h + 6)], "#9aa1aa", OBRYS)
      + wiel([g.p(a + w, y, h), g.p(a + w, y + l, h), g.p(a + w, y + l, h + 6), g.p(a + w, y, h + 6)], ton(SZYBA, CP), OBRYS)
      + wiel([g.p(a, y + l, h), g.p(a + w, y + l, h), g.p(a + w, y + l, h + 6)], ton(sciana, CL), OBRYS);
  }
  return html;
}

/** Bank: kamienna fasada z kolumnami, fryz w kolorze banku z nazwą, tympanon. */
function bank(g, x, y, s, l, { kolor, nazwa, h, sciana }) {
  const S = sciany(g, x, y, s, l), dl = S.L.dl;
  let html = blok(g, x, y, s, l, 0, h, sciana, "#d7ccb4");
  html += okna(S.P, 2, h - 6, { pietro: (h - 8) / 2, wys: 7, krok: 0.2, rama: ton(sciana, -0.4) });
  html += plat(S.L, 0.06, 0, dl - 0.06, h - 8, ton(sciana, 0.28)) + drzwi(S.L, dl / 2, 7, 0.12, "#3b2c22");
  for (let i = 0; i < 4; i++) { const u = 0.1 + i * (dl - 0.2) / 3; html += plat(S.L, u - 0.035, 0, u + 0.035, h - 8, "#fbf8ef"); }
  html += plat(S.L, 0, 0, dl, 0.8, "#cfc8bb") + szyld(S.L, 0, dl, h - 8, h - 2.6, kolor, nazwa);
  html += wiel([S.L.pt(0, h - 2.6), S.L.pt(dl, h - 2.6), S.L.pt(dl / 2, h + 4)], ton(sciana, CL), OBRYS);
  return html + dachPlaski(g, x, y, s, l, h);
}

/** Lokal z kebabem (pole 0,6 × 0,6): witryna, markiza i dach w kolorze firmy, szyld; wolny – zabite witryny. */
export function lokalBudynek(g, x, y, { h, kolor, wolny, wBudowie }) {
  const s = 0.6, S = sciany(g, x, y, s, s);
  let html = blok(g, x, y, s, s, 0, h, wolny ? "#ffffff" : "#f4efe4", kolor);
  if (wBudowie) {   // rusztowanie
    for (const K of [S.L, S.P]) for (let u = 0.05; u <= K.dl; u += 0.18) html += plat(K, u - 0.01, 0, u + 0.01, h + 3, "#c98a3c", 0.04);
    return html;
  }
  if (wolny) return html + plat(S.L, 0.06, 1, 0.42, 6.5, "#c9ccd1") + plat(S.P, 0.08, 1, 0.52, 6.5, "#c9ccd1")
    + drzwi(S.L, 0.51, 6.5, 0.1, "#9aa0a8") + szyld(S.L, 0.03, 0.57, h - 5.6, h - 1.4, "#8a929c", "WOLNY");
  html += witryna(S.L, 0.05, 0.43) + drzwi(S.L, 0.51) + witryna(S.P, 0.06, 0.54)
    + szyld(S.L, 0.03, 0.57, h - 5.6, h - 1.4, kolor, "KEBAB") + markiza(S.L, 0.04, 0.56, 7.6, kolor, 0.08);
  return html;
}

// banki przy Krakowskim Przedmieściu – kolor i krótka nazwa na fryzie
const BANKI = {
  bank_1: ["#00866b", "CRÉDIT AGR."], bank_2: ["#003574", "PKO BP"], bank_3: ["#c8102e", "PEKAO"],
  bank_4: ["#ff6200", "ING"], bank_5: ["#1d1d1b", "mBank"], bank_6: ["#ec0000", "SANTANDER"],
};
const HALE = {
  makro: { tlo: "#ffd200", tekst: "#0b3d91", nazwa: "MAKRO", sciana: "#2d5aa6", h: 15 },
  selgros: { tlo: "#e30613", nazwa: "SELGROS", sciana: "#f4f4f2", dach: "dwuspadowy", h: 13 },
  eurocash: { tlo: "#0a4f9e", nazwa: "EUROCASH", sciana: "#c9ced5", dach: "lukowy", h: 11 },
  auchan: { tlo: "#e2001a", nazwa: "AUCHAN", sciana: "#f2f2ef", dach: "lukowy", szklo: true, h: 15 },
  biedronka: { tlo: "#e30613", tekst: "#ffde00", nazwa: "BIEDRONKA", rampy: false, szklo: true, h: 12 },
  lidl: { tlo: "#0050aa", tekst: "#fff200", nazwa: "LIDL", rampy: false, dach: "pulpitowy", szklo: true, sciana: "#f0f1f2", h: 12 },
  stokrotka: { tlo: "#00843d", nazwa: "STOKROTKA", rampy: false, sciana: "#e6f0e4", dach: "dwuspadowy", h: 11 },
  sprzet_gastro: { tlo: "#546e7a", nazwa: "SPRZĘT GASTRO", sciana: "#b9c1c9", h: 16 },
  market_budowlany: { tlo: "#f47b20", nazwa: "PARK HANDLOWY", h: 17, sciana: "#3b6fb6", dach: "lukowy" },
};
// przepisy dla pojedynczych budynków (id z budynki.yaml); x, y, s, l – obrys już z odstępem od krawędzi pola
const PRZEPISY = {
  ratusz(g, x, y, s, l) {   // klasycystyczny gmach z wieżą zegarową (jak Trybunał Koronny na Rynku)
    const S = sciany(g, x, y, s, l), sc = "#f4eedf", dl = S.L.dl;
    let html = blok(g, x, y, s, l, 0, 26, sc) + plat(S.L, 0, 0, dl, 1.2, "#d9d0bd") + plat(S.P, 0, 0, S.P.dl, 1.2, "#d9d0bd");
    html += okna(S.L, 2, 25, { pietro: 11, wys: 7, krok: 0.2, rama: "#ffffff" }) + okna(S.P, 2, 25, { pietro: 11, wys: 7, krok: 0.2, rama: "#ffffff" });
    html += plat(S.L, dl / 2 - 0.35, 0, dl / 2 + 0.35, 19, ton(sc, 0.2), 0.04);   // portyk z kolumnami
    for (let i = 0; i < 4; i++) { const u = dl / 2 - 0.3 + i * 0.2; html += plat(S.L, u - 0.03, 0, u + 0.03, 19, "#ffffff", 0.05); }
    html += szyld(S.L, dl / 2 - 0.38, dl / 2 + 0.38, 19, 23, "#e9e1cc", "RATUSZ · SANEPID", "#5a4a32")
      + wiel([S.L.pt(dl / 2 - 0.4, 23), S.L.pt(dl / 2 + 0.4, 23), S.L.pt(dl / 2, 30)], ton(sc, CL), OBRYS);
    html += dachNamiotowy(g, x, y, s, l, 26, 11, DACHOWKA);
    const tx = x + s / 2 - 0.2, ty = y + l / 2 - 0.2, T = sciany(g, tx, ty, 0.4, 0.4);
    html += blok(g, tx, ty, 0.4, 0.4, 26, 46, sc) + zegar(T.L, 0.2, 40) + zegar(T.P, 0.2, 40)
      + luk(T.L, 0.2, 28, 35, 0.12, "#5b6b7a") + dachNamiotowy(g, tx - 0.03, ty - 0.03, 0.46, 0.46, 46, 12, MIEDZ);
    return html + maszt(g, tx + 0.2, ty + 0.2, 58, 8, true);
  },
  biura: (g, x, y, s, l) => kamienica(g, x, y, s, l, { h: 30, kolor: FASADY[0], szyld: ["BIURO RACHUNKOWE", "#2f5d62", "#fff"] }),
  poczta(g, x, y, s, l) {   // Poczta Główna przy Krakowskim Przedmieściu
    const html = kamienica(g, x, y, s, l, { h: 28, kolor: "#efe3c8", dach: "dwuspadowy", szyld: ["POCZTA", "#f2b705", "#c8102e"] });
    const [a, b] = g.p(x + 0.25, y + l + 0.08);
    return html + `<rect x="${a - 2}" y="${b - 7}" width="4" height="6" rx="1" fill="#f2b705" stroke="#c8102e" stroke-width=".6"/>`;
  },
  agencja_nieruchomosci: (g, x, y, s, l) => kamienica(g, x, y, s, l, { h: 28, kolor: FASADY[1], szyld: ["NIERUCHOMOŚCI", "#e5333f"] }),
  agencja_pracy: (g, x, y, s, l) => kamienica(g, x, y, s, l, { h: 26, kolor: FASADY[4], dach: "dwuspadowy", szyld: ["PRACA", "#795548"], markizaKolor: "#795548" }),
  piekarnia: (g, x, y, s, l) => kamienica(g, x, y, s, l, { h: 20, kolor: FASADY[7], dach: "dwuspadowy", szyld: ["PIEKARNIA", "#8d5a2b"], markizaKolor: "#c98a3c" })
    + walec(g, x + 0.2, y + 0.25, 0.05, 20, 32, "#a5523a", "#3d2a22"),
  rozen: (g, x, y, s, l) => zaklad(g, x, y, s, l, { nazwa: "ROŻEN · ŁĘCZNA", tlo: "#b71c1c" }),
  stolarnia(g, x, y, s, l) {
    let html = zaklad(g, x, y, s - 0.35, l, { sciana: "#c8995f", nazwa: "STOLARNIA", tlo: "#6d4c2f", komin: false });
    for (let i = 0; i < 4; i++) html += blok(g, x + s - 0.3, y + 0.15 + i * 0.03, 0.26, 0.06, i * 1.6, i * 1.6 + 1.6, "#d9a868");
    return html;
  },
  galeria(g, x, y, s, l) {   // Galeria „Pod Zegarem”: kamienica z zegarem i narożną wieżyczką
    const S = sciany(g, x, y, s, l);
    let html = kamienica(g, x, y, s, l, { h: 28, kolor: "#e7dcc8", dach: "plaski", szyld: ["GALERIA", "#5c6bc0"] });
    html += witryna(S.P, 0.05, S.P.dl - 0.05) + zegar(S.L, S.L.dl / 2, 22, 3.6);
    return html + walec(g, x + s - 0.12, y + l - 0.12, 0.12, 28, 34, "#e7dcc8") + stozek(g, x + s - 0.12, y + l - 0.12, 0.12, 34, 9, MIEDZ);
  },
  akademia(g, x, y, s, l) {   // Akademia Gastro: nowoczesna szkoła z czapką kucharską na dachu
    const S = sciany(g, x, y, s, l);
    let html = blok(g, x, y, s, l, 0, 22, "#f3f4f2", "#d5d8da") + pasy(S.L, 3, 22, { co: 7, wys: 4 }) + pasy(S.P, 3, 22, { co: 7, wys: 4 });
    html += plat(S.L, 0, 0, S.L.dl, 1.2, "#26a69a") + szyld(S.L, 0.1, S.L.dl - 0.1, 15.5, 19.5, "#26a69a", "AKADEMIA GASTRO");
    html += witryna(S.L, S.L.dl / 2 - 0.2, S.L.dl / 2 + 0.2, 0, 6.5) + dachPlaski(g, x, y, s, l, 22);
    return html + walec(g, x + s * 0.7, y + l / 2, 0.11, 22, 28, "#ffffff") + `<ellipse cx="${g.p(x + s * 0.7, y + l / 2, 31)[0]}" cy="${g.p(x + s * 0.7, y + l / 2, 31)[1]}" rx="6.5" ry="4" fill="#ffffff" stroke="rgba(0,0,0,.15)" stroke-width=".5"/>`;
  },
  drukarnia: (g, x, y, s, l) => kamienica(g, x, y, s, l, { h: 26, kolor: FASADY[2], szyld: ["DRUKARNIA", "#ec407a"] }),
  agencja_lajk(g, x, y, s, l) {
    const S = sciany(g, x, y, s, l);
    let html = blok(g, x, y, s, l, 0, 24, "#fde4ee", "#f3c1d6") + pasy(S.L, 9, 24, { co: 5, wys: 3.2, kolor: "#f8a5c6" }) + pasy(S.P, 9, 24, { co: 5, wys: 3.2, kolor: "#f8a5c6" });
    html += witryna(S.L, 0.06, S.L.dl - 0.2) + drzwi(S.L, S.L.dl - 0.11) + szyld(S.L, 0.06, S.L.dl - 0.06, 6.8, 9, "#ec407a", "LAJK ♥");
    return html + dachPlaski(g, x, y, s, l, 24, { urzadzenia: 1 });
  },
  uczelnia(g, x, y, s, l) {   // Pracownia Analiz UMCS: niski pawilon i wieżowiec jak Rektorat UMCS
    const S = sciany(g, x, y, s, l);
    let html = blok(g, x, y, s, l, 0, 12, "#ece8df", "#d6d2c8") + pasy(S.L, 2, 12, { co: 5, wys: 3.2 }) + pasy(S.P, 2, 12, { co: 5, wys: 3.2 });
    const tx = x + 0.2, ty = y + 0.25, T = sciany(g, tx, ty, 0.55, 1.1);
    html += blok(g, tx, ty, 0.55, 1.1, 12, 62, "#efebe2", "#cfcac0") + okna(T.L, 12, 58, { pietro: 4.6, wys: 2.6, krok: 0.12, szer: 0.07 })
      + okna(T.P, 12, 58, { pietro: 4.6, wys: 2.6, krok: 0.12, szer: 0.07 }) + szyld(T.P, 0.15, 0.95, 57, 61.5, "#3f51b5", "UMCS");
    return html + dachPlaski(g, tx, ty, 0.55, 1.1, 62, { urzadzenia: 1 });
  },
  redakcja(g, x, y, s, l) {
    let html = kamienica(g, x, y, s, l, { h: 26, kolor: "#b8c4cf", dach: "plaski", szyld: ["KURIER", "#455a64"] });
    const [a, b] = g.p(x + 0.3, y + 0.3, 26);
    html += `<ellipse cx="${a}" cy="${b - 4}" rx="4" ry="2.4" transform="rotate(-25 ${a} ${b - 4})" fill="#eceff1" stroke="#90a4ae" stroke-width=".6"/><line x1="${a}" y1="${b}" x2="${a}" y2="${b - 3}" stroke="#78909c"/>`;
    return html + maszt(g, x + s - 0.25, y + 0.25, 26, 14);
  },
  harpagon: (g, x, y, s, l) => kamienica(g, x, y, s, l, { h: 18, kolor: "#8a7766", dach: "dwuspadowy", szyld: ["KANTOR", "#1b1b1b", "#e9c46a"], zdobienia: false }),
  fala_koziolka(g, x, y, s, l) {   // studio radia z masztem i billboardem
    const S = sciany(g, x, y, s, l);
    let html = blok(g, x, y, s, l, 0, 14, "#f5e1ea", "#e7c3d3") + witryna(S.L, 0.06, S.L.dl - 0.2) + drzwi(S.L, S.L.dl - 0.11)
      + szyld(S.L, 0.04, S.L.dl - 0.04, 8, 12, "#ec407a", "FALA KOZIOŁKA") + dachPlaski(g, x, y, s, l, 14);
    const [a, b] = g.p(x + 0.25, y + 0.25, 14);
    html += `<path d="M${a - 3} ${b}L${a} ${b - 48}L${a + 3} ${b}M${a - 2.2} ${b - 12}H${a + 2.2}M${a - 1.4} ${b - 26}H${a + 1.4}M${a - 0.8} ${b - 38}H${a + 0.8}" fill="none" stroke="#c62828" stroke-width=".8"/>`
      + `<circle cx="${a}" cy="${b - 49}" r="1.4" fill="#ff5252"/>`;
    return html;
  },
  kozi_grod_events(g, x, y, s, l) {
    let html = kamienica(g, x, y, s, l, { h: 24, kolor: FASADY[6], dach: "plaski", szyld: ["EVENTS", "#8e24aa"], markizaKolor: "#ec407a" });
    for (const [i, k] of [[0.2, "#ec407a"], [0.45, "#ffd54f"], [0.7, "#4fc3f7"]]) {   // flagi na dachu
      const [a, b] = g.p(x + i, y + 0.3, 24);
      html += `<line x1="${a}" y1="${b}" x2="${a}" y2="${b - 9}" stroke="#555" stroke-width=".6"/><path d="M${a} ${b - 9}l5 1.5l-5 1.5z" fill="${k}"/>`;
    }
    return html;
  },
  ubezpieczyciel(g, x, y, s, l) {
    const S = sciany(g, x, y, s, l);
    let html = blok(g, x, y, s, l, 0, 32, "#e8f0e6", "#c9d6c6") + pasy(S.L, 10, 32, { kolor: "#7fbf8a" }) + pasy(S.P, 10, 32, { kolor: "#7fbf8a" });
    html += witryna(S.L, 0.06, S.L.dl - 0.2) + drzwi(S.L, S.L.dl - 0.11) + szyld(S.L, 0.06, S.L.dl - 0.06, 6.8, 9.6, "#43a047", "TUW POD KOZIOŁKIEM");
    return html + dachPlaski(g, x, y, s, l, 32, { urzadzenia: 2 });
  },
  detektyw: (g, x, y, s, l) => kamienica(g, x, y, s, l, { h: 22, kolor: "#7a4b3a", dach: "dwuspadowy", szyld: ["DETEKTYW", "#1b1b1b", "#e0e0e0"], sklep: false, zdobienia: false }),
  gielda(g, x, y, s, l) {   // szklany biurowiec z paskiem notowań
    const S = sciany(g, x, y, s, l);
    let html = blok(g, x, y, s, l, 0, 56, "#2c3e57", "#22324a") + pasy(S.L, 16, 54, { co: 4.5, wys: 2.8, kolor: "#6f9cc6" })
      + pasy(S.P, 16, 54, { co: 4.5, wys: 2.8, kolor: "#6f9cc6" });
    html += witryna(S.L, 0.06, S.L.dl - 0.06, 0, 8) + szyld(S.L, 0, S.L.dl, 10, 14.5, "#0b0f17", "S&P 500 ▲", "#26e07f")
      + szyld(S.P, 0, S.P.dl, 10, 14.5, "#0b0f17", "BYK I KOZIOŁEK", "#ffd166");
    html += blok(g, x + 0.1, y + 0.1, s - 0.2, l - 0.2, 56, 60, "#3d5373");
    return html + maszt(g, x + s / 2, y + l / 2, 60, 12);
  },
};

// odstępy między budynkami: margines budynków gry od krawędzi pola i skala obrysu zabudowy wolnych pól (wokół środka pola)
const MARGINES_BUDYNKU = 0.15, SKALA_ZABUDOWY = 0.8;
/** Geometria z obrysem zmniejszonym k razy wokół środka pola (x, y) – wysokości bez zmian. */
const ciasniej = (g, x, y, k) => ({ ...g, p: (u, v, h = 0) => g.p(x + 0.5 + (u - x - 0.5) * k, y + 0.5 + (v - y - 0.5) * k, h), elipsa: (r) => g.elipsa(r * k) });
/** Styl prosty w 3D: budynek z rolą jako zabawkowa bryła – jasna ściana w odcieniu koloru rodzaju, kilka dużych okien,
 * drzwi, szyld z krótką nazwą pod dachem w kolorze rodzaju i ikonka na dachu. `wys` – wysokość z legendy (px). */
export function budynekProsty(g, b, kolor, wys, ikona = "") {
  const { x, y, szer: s, gl: l } = b.mapa;
  const X = x + MARGINES_BUDYNKU, Y = y + MARGINES_BUDYNKU, S = s - 2 * MARGINES_BUDYNKU, L = l - 2 * MARGINES_BUDYNKU;
  const h = Math.max(14, Math.round(wys * 0.75)), duzy = s * l > 1;
  const rodzaj = !duzy && ["bank", "urzad", "poczta", "uczelnia"].includes(b.rodzaj) ? "namiotowy" : "plaski";
  let html = budyneczek(g, X, Y, S, L, { h, sciana: ton(kolor, -0.85), dach: ton(kolor, -0.3), rodzaj, pietro: 9, akcent: kolor, pas: 7 });
  const nazwa = BANKI[b.id]?.[1] || HALE[b.id]?.nazwa || b.nazwa.split(/[ „]/)[0].toUpperCase();
  html += szyld(sciany(g, X, Y, S, L).L, 0.03, S - 0.03, h - 6.5, h - 0.5, kolor, nazwa);
  const [a, c] = g.p(X + S / 2, Y + L / 2, h + (rodzaj === "namiotowy" ? 9 : 0));
  return html + `<circle cx="${a.toFixed(1)}" cy="${(c - 7).toFixed(1)}" r="7" fill="${kolor}" stroke="#ffffff" stroke-width="1.4"/>`
    + `<text x="${a.toFixed(1)}" y="${(c - 3.6).toFixed(1)}" text-anchor="middle" font-size="9">${ikona}</text>`;
}
/** Kształt budynku z budynki.yaml (bez parków i wody – te rysuje mapa.js). */
export function rysujBudynek(g, b) {
  const { x, y, szer: s, gl: l } = b.mapa;
  const X = x + MARGINES_BUDYNKU, Y = y + MARGINES_BUDYNKU, S = s - 2 * MARGINES_BUDYNKU, L = l - 2 * MARGINES_BUDYNKU;
  if (PRZEPISY[b.id]) return PRZEPISY[b.id](g, X, Y, S, L);
  if (BANKI[b.id]) {   // każdy bank w innym stylu: klasyczne gmachy, kamienice i nowoczesne biurowce
    const [kolor, nazwa] = BANKI[b.id];
    switch (b.id) {
      case "bank_1": return kamienica(g, X, Y, S, L, { h: 30, kolor: FASADY[2], szyld: [nazwa, kolor] });
      case "bank_2": return bank(g, X, Y, S, L, { kolor, nazwa, h: 28, sciana: "#efe6d2" })
        + walec(g, X + S / 2, Y + L / 2, 0.16, 28, 33, "#efe6d2") + kopula(g, X + S / 2, Y + L / 2, 0.16, 33, MIEDZ) + maszt(g, X + S / 2, Y + L / 2, 47, 4);
      case "bank_4": return biurowiec(g, X, Y, S, L, { h: 36, sciana: "#ffffff", szklo: "#f7b98c", szyld: [nazwa, kolor] });
      case "bank_5": return biurowiec(g, X, Y, S, L, { h: 32, sciana: "#2b2f36", szklo: "#7f9fbf", szyld: [nazwa, "#e4002b"], co: 4.5 });
      case "bank_6": return kamienica(g, X, Y, S, L, { h: 27, kolor: FASADY[5], dach: "dwuspadowy", szyld: [nazwa, kolor] });
      default: return bank(g, X, Y, S, L, { kolor, nazwa, h: 31, sciana: "#e6e3d6" });
    }
  }
  if (HALE[b.id]) return hala(g, X, Y, S, L, HALE[b.id]);
  // nowy budynek bez przepisu: kamienica w kolorze z rodzaju
  return kamienica(g, X, Y, S, L, { h: 24, kolor: FASADY[(x + y) % FASADY.length], szyld: [b.nazwa.split(/[ „]/)[0].toUpperCase(), "#455a64"] });
}

/** Samolot pasażerski z góry, z cieniem (h – wysokość nad ziemią, px). */
function samolot(g, cx, cy, h = 0) {
  const P = (pts, hh) => pkt(pts.map(([u, v]) => g.p(cx + u, cy + v, hh)));
  const kadlub = [[-0.42, -0.045], [0.34, -0.045], [0.44, 0], [0.34, 0.045], [-0.42, 0.045]];
  const skrzydla = [[0.02, -0.04], [0.14, -0.04], [-0.08, -0.4], [-0.16, -0.4], [-0.16, 0.4], [-0.08, 0.4], [0.14, 0.04], [0.02, 0.04]];
  const ster = [[-0.36, -0.04], [-0.3, -0.04], [-0.4, -0.16], [-0.45, -0.16], [-0.45, 0.16], [-0.4, 0.16], [-0.3, 0.04], [-0.36, 0.04]];
  let html = "";
  for (const k of [skrzydla, ster, kadlub]) html += `<polygon points="${P(k, 0)}" fill="#1b2433" opacity=".14"/>`;
  return html + `<polygon points="${P(skrzydla, h + 2)}" fill="#dfe5ea" stroke="#9aa5b1" stroke-width=".4"/><polygon points="${P(ster, h + 2)}" fill="#dfe5ea" stroke="#9aa5b1" stroke-width=".4"/>`
    + `<polygon points="${P(kadlub, h + 2.5)}" fill="#ffffff" stroke="#9aa5b1" stroke-width=".4"/><polygon points="${P([[-0.45, -0.012], [-0.3, -0.012], [-0.3, 0.012], [-0.45, 0.012]], h + 3)}" fill="#1565c0"/>`;
}

/** Zalew (budynek „woda”): plaża z parasolami i wieżą ratownika, pomost z łódkami, żaglówki (pływają, gdy włączony ruch). */
export function zbiornik(g, b, ruch = true) {
  const { x, y, szer: s, gl: l } = b.mapa, X = x + 0.12, Y = y + 0.12, W = s - 0.24, H = l - 0.24;
  const f = (n) => n.toFixed(1);
  let html = "";
  // pomost od plaży w głąb wody i łódki przy nim
  const px = X + W - 0.75;
  html += blok(g, px, Y + H - 0.85, 0.09, 0.9, 0, 1.6, "#a1785a", "#b98d68");
  for (const [j, k] of [[0.25, "#e53935"], [0.55, "#fafafa"]]) {
    const P = (u, v) => g.p(px + 0.14 + u, Y + H - j + v, 0.6);
    html += wiel([P(0, -0.06), P(0.22, -0.06), P(0.26, 0), P(0.22, 0.06), P(0, 0.06)], k, OBRYS);
  }
  // żaglówki: elipsa w środku zalewu (piksele ekranu), różne miejsca startu
  const tor = Array.from({ length: 24 }, (_, i) => {
    const t = (2 * Math.PI * i) / 24;
    return g.p(X + W / 2 + (W / 2 - 0.6) * Math.cos(t), Y + H / 2 + (H / 2 - 0.5) * Math.sin(t));
  });
  const d = `M${tor.map(([a, c]) => `${f(a)} ${f(c)}`).join("L")}Z`;
  [["#ffffff", "#1e88e5"], ["#fff3e0", "#e53935"], ["#ffffff", "#43a047"]].forEach(([zagiel, kadlub], i) => {
    const lodz = `<path d="M-5.5 0H5.5L3.6 2.4H-3.6Z" fill="${kadlub}"/><line x1="0" y1="0" x2="0" y2="-13" stroke="#5d4037" stroke-width=".7"/>`
      + `<path d="M.6 -12.5V-1H7.5Z" fill="${zagiel}" stroke="rgba(0,0,0,.2)" stroke-width=".4"/><path d="M-.6 -10V-1H-4.5Z" fill="${zagiel}" stroke="rgba(0,0,0,.2)" stroke-width=".4"/>`
      + `<ellipse cy="2.6" rx="6" ry="1.1" fill="#ffffff" opacity=".35"/>`;
    if (ruch) html += `<g>${lodz}<animateMotion dur="${70 + i * 17}s" begin="-${i * 23}s" repeatCount="indefinite" path="${d}"/></g>`;
    else { const [a, c] = tor[(i * 8) % 24]; html += `<g transform="translate(${f(a)} ${f(c)})">${lodz}</g>`; }
  });
  // plaża od frontu: parasole, wieża ratownika
  for (const [u, k] of [[0.5, "#e53935"], [0.9, "#fdd835"], [1.3, "#1e88e5"], [1.7, "#43a047"]]) {
    if (u > W - 0.9) continue;
    const [a, c] = g.p(X + u, Y + H + 0.04);
    html += `<line x1="${f(a)}" y1="${f(c)}" x2="${f(a)}" y2="${f(c - 7)}" stroke="#6d4c41" stroke-width=".6"/><path d="M${f(a - 4.5)} ${f(c - 6)}Q${f(a)} ${f(c - 10.5)} ${f(a + 4.5)} ${f(c - 6)}Z" fill="${k}"/>`;
  }
  const [a, c] = g.p(X + 0.25, Y + H + 0.03);
  html += `<path d="M${f(a - 2.5)} ${f(c)}L${f(a - 1.8)} ${f(c - 8)}M${f(a + 2.5)} ${f(c)}L${f(a + 1.8)} ${f(c - 8)}" stroke="#8d6e63" stroke-width=".8"/>`
    + `<rect x="${f(a - 3)}" y="${f(c - 13)}" width="6" height="5" fill="#ffffff" stroke="#e53935" stroke-width=".9"/><path d="M${f(a - 3.6)} ${f(c - 13)}L${f(a)} ${f(c - 16)}L${f(a + 3.6)} ${f(c - 13)}Z" fill="#e53935"/>`;
  return html;
}

// --- zabytki i miejsca z miasto.yaml (id → kształt); pozostałe rysuje mapa_teren.js ---
export const ZABYTKI = {
  zamek(g, x, y, s = 3, l = 2) {   // Zamek Lubelski na wzgórzu (3 × 2 pola): neogotycki gmach z bramą, skrzydło, donżon, kaplica
    const mur = "#f3ebd8", rama = "#6b7f93", W = 10;   // W – wysokość wzgórza (px)
    // wzgórze: zielone stoki i brukowany dziedziniec na górze, rampa do bramy
    let html = wiel(romb(g, x + 0.02, y + 0.02, s - 0.04, l - 0.04), "#b9d89c")
      + wiel([g.p(x + 0.06, y + l - 0.04), g.p(x + s - 0.06, y + l - 0.04), g.p(x + s - 0.12, y + l - 0.14, W), g.p(x + 0.12, y + l - 0.14, W)], "#9cc47e")
      + wiel([g.p(x + s - 0.04, y + 0.06), g.p(x + s - 0.04, y + l - 0.04), g.p(x + s - 0.14, y + l - 0.14, W), g.p(x + s - 0.14, y + 0.12, W)], "#8ab36d")
      + wiel(romb(g, x + 0.12, y + 0.12, s - 0.26, l - 0.26, W), "#e3d8c0");
    html += wiel([g.p(x + s / 2 - 0.16, y + l - 0.02), g.p(x + s / 2 + 0.16, y + l - 0.02), g.p(x + s / 2 + 0.16, y + l - 0.5, W), g.p(x + s / 2 - 0.16, y + l - 0.5, W)], "#d8ccb0", OBRYS);
    // Kaplica Trójcy Świętej (gotycka, czerwony dach, sygnaturka) – z tyłu po lewej
    const K = sciany(g, x + 0.3, y + 0.2, 0.95, 0.42);
    html += blok(g, x + 0.3, y + 0.2, 0.95, 0.42, W, W + 30, "#efe2c4");
    for (let u = 0.14; u < 0.9; u += 0.18) html += luk(K.L, u, W + 8, W + 23, 0.06, rama);
    html += dachDwuspadowy(g, x + 0.3, y + 0.2, 0.95, 0.42, W + 30, 17, DACHOWKA, "#efe2c4", "x")
      + walec(g, x + 0.95, y + 0.41, 0.05, W + 44, W + 52, "#efe2c4") + stozek(g, x + 0.95, y + 0.41, 0.06, W + 52, 11, MIEDZ);
    // romański donżon – z tyłu po prawej, najwyższy
    const dx = x + s - 0.75, dy = y + 0.5;
    html += walec(g, dx, dy, 0.3, W, W + 76, "#d9c7a5", "#c2ae89");
    const [a, b] = g.p(dx, dy, W + 76);
    html += `<ellipse cx="${a}" cy="${b}" rx="9.8" ry="4.9" fill="none" stroke="#c9b48e" stroke-width="3.2" stroke-dasharray="2.2 1.8"/>`;
    for (const h of [W + 24, W + 46, W + 64]) { const [c, d] = g.p(dx + 0.1, dy + 0.29, h); html += `<rect x="${c - 1.1}" y="${d - 6}" width="2.2" height="6" rx="1.1" fill="${rama}"/>`; }
    // skrzydło boczne (wschodnie) z blankami
    const B = sciany(g, x + s - 0.62, y + 0.85, 0.42, l - 1.25);
    html += blok(g, x + s - 0.62, y + 0.85, 0.42, l - 1.25, W, W + 34, mur) + blanki(g, x + s - 0.62, y + 0.85, 0.42, l - 1.25, W + 34, mur);
    for (let u = 0.1; u < B.P.dl; u += 0.16) html += luk(B.P, u, W + 8, W + 17, 0.05, rama) + luk(B.P, u, W + 21, W + 30, 0.05, rama);
    // neogotycki gmach od frontu: dwa piętra ostrołukowych okien, blanki
    const fx = x + 0.2, fy = y + l - 0.62, fs = s - 0.4, S = sciany(g, fx, fy, fs, 0.42);
    html += blok(g, fx, fy, fs, 0.42, W, W + 38, mur);
    for (let u = 0.12; u < S.L.dl - 0.05; u += 0.15) {
      if (Math.abs(u - S.L.dl / 2) < 0.32) continue;
      html += luk(S.L, u, W + 7, W + 17, 0.055, rama) + luk(S.L, u, W + 22, W + 32, 0.055, rama);
    }
    html += luk(S.P, 0.21, W + 7, W + 17, 0.055, rama) + luk(S.P, 0.21, W + 22, W + 32, 0.055, rama) + blanki(g, fx, fy, fs, 0.42, W + 38, mur);
    // wieża bramna pośrodku z ostrołukiem bramy, oknami, blankami i dwiema ośmiobocznymi wieżyczkami
    const tx = x + s / 2 - 0.27, ty = y + l - 0.72, T = sciany(g, tx, ty, 0.54, 0.6);
    html += blok(g, tx, ty, 0.54, 0.6, W, W + 64, mur) + luk(T.L, 0.27, W, W + 22, 0.22, "#4a3a2c")
      + luk(T.L, 0.27, W + 30, W + 42, 0.09, rama) + luk(T.L, 0.27, W + 47, W + 57, 0.07, rama) + luk(T.P, 0.3, W + 30, W + 42, 0.08, rama)
      + blanki(g, tx, ty, 0.54, 0.6, W + 64, mur);
    for (const i of [tx + 0.03, tx + 0.51]) {
      html += walec(g, i, ty + 0.57, 0.08, W + 44, W + 76, mur, "#e6dcc6");
      const [c, d] = g.p(i, ty + 0.57, W + 76);
      html += `<ellipse cx="${c}" cy="${d}" rx="2.6" ry="1.3" fill="none" stroke="#d8ccb0" stroke-width="1.8" stroke-dasharray="1.1 .9"/>`;
    }
    return html + maszt(g, tx + 0.27, ty + 0.3, W + 67, 14, true);
  },
  brama_krakowska(g, x, y) {   // ceglana wieża bramna, ośmioboczna nadbudowa i barokowy hełm
    const S = sciany(g, x + 0.28, y + 0.28, 0.44, 0.44);
    let html = blok(g, x + 0.28, y + 0.28, 0.44, 0.44, 0, 26, "#b9603f") + luk(S.L, 0.22, 0, 12, 0.2, "#3e2a20") + luk(S.P, 0.22, 0, 12, 0.2, "#3e2a20")
      + luk(S.L, 0.22, 16, 22, 0.07, "#f2e6d0") + luk(S.P, 0.22, 16, 22, 0.07, "#f2e6d0");
    html += walec(g, x + 0.5, y + 0.5, 0.2, 26, 36, "#f2ece0", "#e4dccc");
    const [a, b] = g.p(x + 0.5, y + 0.5, 36);   // hełm: cebula, latarnia, iglica
    html += `<path d="M${a - 8} ${b}C${a - 9} ${b - 6} ${a - 2} ${b - 7} ${a - 2} ${b - 11}H${a + 2}C${a + 2} ${b - 7} ${a + 9} ${b - 6} ${a + 8} ${b}Z" fill="#4f6b5d" stroke="rgba(0,0,0,.2)" stroke-width=".5"/>`
      + `<path d="M${a} ${b - 11}V${b}H${a + 8}C${a + 9} ${b - 6} ${a + 2} ${b - 7} ${a + 2} ${b - 11}Z" fill="#000" opacity=".18"/>`
      + `<rect x="${a - 1.6}" y="${b - 16}" width="3.2" height="5" fill="#f2ece0"/><path d="M${a - 2.4} ${b - 16}L${a} ${b - 22}L${a + 2.4} ${b - 16}Z" fill="#4f6b5d"/>`
      + `<line x1="${a}" y1="${b - 22}" x2="${a}" y2="${b - 27}" stroke="#d4a017" stroke-width=".8"/>`;
    return html;
  },
  wieza_trynitarska(g, x, y) {   // wysoka wieża z zegarem i zieloną iglicą
    const S = sciany(g, x + 0.32, y + 0.32, 0.36, 0.36);
    let html = blok(g, x + 0.32, y + 0.32, 0.36, 0.36, 0, 48, "#efe2c6") + luk(S.L, 0.18, 0, 8, 0.12, "#4a3a2c");
    for (const h of [14, 26]) html += luk(S.L, 0.18, h, h + 7, 0.06, "#6b7f93") + luk(S.P, 0.18, h, h + 7, 0.06, "#6b7f93");
    html += zegar(S.L, 0.18, 40, 3) + zegar(S.P, 0.18, 40, 3) + plat(S.L, 0, 46.8, 0.36, 48, "#ffffff") + plat(S.P, 0, 46.8, 0.36, 48, "#ffffff");
    html += dachNamiotowy(g, x + 0.3, y + 0.3, 0.4, 0.4, 48, 7, MIEDZ) + walec(g, x + 0.5, y + 0.5, 0.06, 53, 57, MIEDZ) + stozek(g, x + 0.5, y + 0.5, 0.08, 57, 14, MIEDZ);
    return html + maszt(g, x + 0.5, y + 0.5, 71, 4);
  },
  csk(g, x, y, s, l) {   // Centrum Spotkania Kultur: biała bryła, przeszklony parter, zielony dach z drzewkami
    const S = sciany(g, x + 0.08, y + 0.08, s - 0.16, l - 0.16);
    let html = blok(g, x + 0.08, y + 0.08, s - 0.16, l - 0.16, 0, 18, "#f2f1ec", "#86c06c") + witryna(S.L, 0.05, S.L.dl - 0.05, 0, 6)
      + witryna(S.P, 0.05, S.P.dl - 0.05, 0, 6) + pasy(S.L, 9, 17, { co: 8, wys: 2.4, kolor: "#c9d8e2" });
    for (const [i, j] of [[0.3, 0.3], [0.6, 0.35], [0.4, 0.6]]) {
      const [a, b] = g.p(x + i, y + j, 18);
      html += `<circle cx="${a}" cy="${b - 3}" r="3" fill="#4f9d5a"/>`;
    }
    return html;
  },
  umcs(g, x, y, s, l) {   // kampus: dwa pawilony z pasami okien
    const S = sciany(g, x + 0.1, y + 0.15, s - 0.2, l - 0.3);
    return blok(g, x + 0.1, y + 0.15, s - 0.2, l - 0.3, 0, 20, "#efebe2", "#cfcac0") + okna(S.L, 2, 20, { pietro: 6, wys: 3.4, krok: 0.14 })
      + okna(S.P, 2, 20, { pietro: 6, wys: 3.4, krok: 0.14 }) + szyld(S.L, 0.5, 1.1, 14.5, 18.5, "#3f51b5", "UMCS") + dachPlaski(g, x + 0.1, y + 0.15, s - 0.2, l - 0.3, 20, { urzadzenia: 2 });
  },
  kul(g, x, y, s, l) {   // historyczny gmach z czerwonym dachem i wieżyczką
    let html = kamienica(g, x + 0.1, y + 0.15, s - 0.2, l - 0.3, { h: 22, kolor: "#efe2c4", dach: "dwuspadowy", szyld: ["KUL", "#7b1f2a"], sklep: false });
    html += walec(g, x + s / 2, y + l / 2, 0.08, 30, 36, "#efe2c4") + stozek(g, x + s / 2, y + l / 2, 0.08, 36, 9, MIEDZ);
    return html + maszt(g, x + s / 2, y + l / 2, 45, 3);
  },
  politechnika_lubelska(g, x, y, s, l) {   // nowoczesny gmach: szkło i grafit
    const S = sciany(g, x + 0.1, y + 0.15, s - 0.2, l - 0.3);
    return blok(g, x + 0.1, y + 0.15, s - 0.2, l - 0.3, 0, 24, "#5f6b78", "#4d5763") + pasy(S.L, 2, 24, { co: 5.5, wys: 3.6, kolor: "#9cc3e0" })
      + pasy(S.P, 2, 24, { co: 5.5, wys: 3.6, kolor: "#9cc3e0" }) + szyld(S.L, 0.3, 1.5, 19, 23, "#c62828", "POLITECHNIKA") + dachPlaski(g, x + 0.1, y + 0.15, s - 0.2, l - 0.3, 24, { urzadzenia: 2 });
  },
  dworzec_metropolitalny(g, x, y, s = 3, l = 2) {   // dworzec Lublin Główny przy torach i Dworzec Metropolitalny przed nim
    // z tyłu (od torów): historyczny gmach z wieżą zegarową, arkadami okien i czerwonym dachem
    const hx = x + 0.15, hy = y + 0.12, hs = s - 0.3, H = sciany(g, hx, hy, hs, 0.55), sc = "#f1e6cc";
    let html = wiel(romb(g, x + 0.05, y + 0.05, s - 0.1, l - 0.1), "#d9dde2");   // plac i perony autobusowe
    html += blok(g, hx, hy, hs, 0.55, 0, 22, sc) + okna(H.L, 2, 21, { pietro: 9.5, wys: 6, krok: 0.16, szer: 0.08, rama: "#ffffff" })
      + okna(H.P, 2, 21, { pietro: 9.5, wys: 6, krok: 0.16, szer: 0.08, rama: "#ffffff" }) + dachNamiotowy(g, hx, hy, hs, 0.55, 22, 7, DACHOWKA);
    const wx = x + s / 2 - 0.2, W = sciany(g, wx, hy + 0.05, 0.4, 0.5);
    html += blok(g, wx, hy + 0.05, 0.4, 0.5, 0, 40, sc) + luk(W.L, 0.2, 0, 13, 0.18, "#5d4a3a") + zegar(W.L, 0.2, 31, 3.6) + zegar(W.P, 0.25, 31, 3.6)
      + szyld(W.L, 0.02, 0.38, 17, 21.5, "#7b2d26", "LUBLIN GŁÓWNY") + dachNamiotowy(g, wx - 0.03, hy + 0.02, 0.46, 0.56, 40, 13, MIEDZ)
      + maszt(g, wx + 0.2, hy + 0.3, 53, 5);
    // z przodu: przeszklona hala Dworca Metropolitalnego pod falistym dachem na słupach
    const mx = x + 0.3, my = y + 0.85, ms = s - 0.6, M = sciany(g, mx, my, ms, 0.45);
    html += blok(g, mx, my, ms, 0.45, 0, 11, "#cfe2ef", "#b9c9d6") + witryna(M.L, 0.04, M.L.dl - 0.04, 0, 10) + witryna(M.P, 0.04, M.P.dl - 0.04, 0, 10);
    for (const u of [0.12, 0.85, 1.6, s - 0.15]) for (const v of [0.78, 1.45]) {
      const [c, d] = g.p(x + u, y + v);
      html += `<line x1="${c}" y1="${d}" x2="${c}" y2="${d - 17}" stroke="#9aa5b1" stroke-width="1.3"/>`;
    }
    const fala = (yy) => { const [a0, b0] = g.p(x + 0.06, yy, 17), [a1, b1] = g.p(x + s - 0.06, yy, 17); return [a0, b0, a1, b1]; };
    const [a0, b0, a1, b1] = fala(y + 1.5), [a3, b3, a2, b2] = fala(y + 0.72);
    const q = (p0, q0, p1, q1) => `Q${(p0 + p1) / 2 - 6} ${(q0 + q1) / 2 - 9} ${(p0 + p1) / 2} ${(q0 + q1) / 2}T${p1} ${q1}`;
    html += `<path d="M${a0} ${b0}${q(a0, b0, a1, b1)}L${a2} ${b2}${q(a2, b2, a3, b3)}Z" fill="#eef2f6" stroke="#9aa5b1" stroke-width=".7"/>`
      + `<path d="M${a0} ${b0}${q(a0, b0, a1, b1)}" fill="none" stroke="#7f9cc0" stroke-width="1.8"/>`;
    // autobusy na stanowiskach przed halą
    for (const [i, k] of [[0.35, "#d32f2f"], [1.25, "#2e7d32"], [2.1, "#1565c0"]]) {
      const A = sciany(g, x + i, y + 1.6, 0.42, 0.14);
      html += blok(g, x + i, y + 1.6, 0.42, 0.14, 0, 8, k, "#eceff1") + plat(A.L, 0.03, 3.6, 0.39, 6.4, SZYBA) + plat(A.P, 0.02, 3.6, 0.12, 6.4, SZYBA);
    }
    return html;
  },
  lotnisko(g, x, y, s = 3, l = 3) {   // Port Lotniczy Lublin: pas startowy, płyta z samolotami, terminal, wieża kontroli
    let html = wiel(romb(g, x + 0.05, y + 0.05, s - 0.1, l - 0.1), "#dfe7d0") + wiel(romb(g, x + 0.1, y + 1.55, s - 0.2, 0.6), "#8b9099");
    const [a1, b1] = g.p(x + 0.3, y + 1.85), [a2, b2] = g.p(x + s - 0.3, y + 1.85);
    html += `<line x1="${a1}" y1="${b1}" x2="${a2}" y2="${b2}" stroke="#fff" stroke-width="1.2" stroke-dasharray="5 4"/>`;
    for (const u of [0.15, s - 0.25]) for (let j = 0; j < 4; j++) {   // oznaczenia progów pasa
      const [c, d] = g.p(x + u, y + 1.62 + j * 0.13), [e, f] = g.p(x + u + 0.1, y + 1.62 + j * 0.13);
      html += `<line x1="${c}" y1="${d}" x2="${e}" y2="${f}" stroke="#fff" stroke-width="1.4"/>`;
    }
    html += wiel(romb(g, x + 0.2, y + 1.05, s - 0.6, 0.45), "#b9bfc7") + wiel(romb(g, x + 0.9, y + 1.45, 0.12, 0.12), "#8b9099");   // płyta i łącznik
    const T = sciany(g, x + 0.25, y + 0.25, 1.4, 0.65);
    html += blok(g, x + 0.25, y + 0.25, 1.4, 0.65, 0, 14, "#eef2f6", "#cfd8e0") + witryna(T.L, 0.05, T.L.dl - 0.05, 0, 11)
      + szyld(T.L, 0.2, 1.2, 11.2, 14, "#1565c0", "PORT LOTNICZY LUBLIN") + dachLukowy(g, x + 0.25, y + 0.25, 1.4, 0.65, 14, 5, "#dfe6ec", "#eef2f6");
    html += walec(g, x + 2.36, y + 0.46, 0.1, 0, 34, "#eef2f6") + walec(g, x + 2.36, y + 0.46, 0.16, 34, 40, "#4aa3d8", "#cfd8e0") + maszt(g, x + 2.36, y + 0.46, 40, 6);
    return html + samolot(g, x + 0.9, y + 1.28, 0) + samolot(g, x + 1.8, y + 1.28, 0) + samolot(g, x + 2.45, y + 1.85, 7);
  },
  arena(g, x, y, s, l) {   // Arena Lublin: trybuny wokół boiska, biały dach i maszty oświetlenia
    const t = 0.32, h = 12, tr = "#e6e9ee", dach = "#ffffff";
    let html = blok(g, x + 0.1, y + 0.1, s - 0.2, t, 0, h, tr, dach) + blok(g, x + 0.1, y + 0.1, t, l - 0.2, 0, h, tr, dach);
    html += wiel(romb(g, x + 0.1 + t, y + 0.1 + t, s - 0.2 - 2 * t, l - 0.2 - 2 * t), "#5aa955")
      + wiel(romb(g, x + 0.1 + t + 0.08, y + 0.1 + t + 0.08, s - 0.36 - 2 * t, l - 0.36 - 2 * t), "none", ` stroke="#ffffff" stroke-width=".8"`);
    const [m0, n0] = g.p(x + s / 2, y + 0.1 + t + 0.08), [m1, n1] = g.p(x + s / 2, y + l - 0.18 - t);
    html += `<line x1="${m0}" y1="${n0}" x2="${m1}" y2="${n1}" stroke="#fff" stroke-width=".8"/>`;
    // trybuny od strony widza – niższe, żeby było widać boisko
    html += blok(g, x + 0.1, y + l - 0.1 - t, s - 0.2, t, 0, h * 0.6, tr, "#3d7fc4") + blok(g, x + s - 0.1 - t, y + 0.1, t, l - 0.2 - t, 0, h * 0.6, tr, "#3d7fc4");
    html += wiel(romb(g, x + 0.1, y + 0.1, s - 0.2, t * 0.6, h), "#3d7fc4") + wiel(romb(g, x + 0.1, y + 0.1, t * 0.6, l - 0.2, h), "#3d7fc4");
    for (const [i, j] of [[0.1, 0.1], [s - 0.1, 0.1], [0.1, l - 0.1], [s - 0.1, l - 0.1]]) {
      const [a, b] = g.p(x + i, y + j);
      html += `<line x1="${a}" y1="${b}" x2="${a}" y2="${b - 30}" stroke="#8c96a3" stroke-width="1"/><rect x="${a - 3}" y="${b - 33}" width="6" height="3" fill="#fff8d0" stroke="#8c96a3" stroke-width=".5"/>`;
    }
    return html;
  },
};

// --- zabudowa wolnych pól (tylko wygląd): charakter dzielnic Lublina, stała dla danego pola ---
/** Liczba pseudolosowa 0–1 z kluczy (ten sam wygląd przy każdym rysowaniu). */
function losuj(...klucze) {
  let h = 2166136261;
  for (const c of klucze.join(",")) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const wybierz = (lista, r) => lista[Math.floor(r * lista.length) % lista.length];

// --- drzewa: liściaste (korona z kilku kół), topole, świerki (piętra), krzewy; kontur tylko wokół całej sylwetki ---
const LISCIE = ["#5fd36e", "#4cc28a", "#7be08a", "#3fb26a", "#a3e36b"];
const IGLY = ["#2f9e6a", "#3aa874", "#27885c"];
const f1 = (n) => n.toFixed(1);
/** Sylwetka z kształtów z konturem tylko na zewnątrz: najpierw kształty z grubym obrysem, potem te same bez – wewnątrz
 * nie ma kresek między kołami korony. `ksztalty` – lista znaczników SVG bez wypełnienia (fill dopisujemy). */
function sylwetka(ksztalty, kolor, kontur = true) {
  const z = (s, reszta) => s.replace("/>", ` fill="${kolor}"${reszta}/>`);
  return (kontur ? ksztalty.map((s) => z(s, ` stroke="${KONTUR}" stroke-width="1.7" stroke-linejoin="round"`)).join("") : "")
    + ksztalty.map((s) => z(s, "")).join("");
}
const kolko = (a, b, r) => `<circle cx="${f1(a)}" cy="${f1(b)}" r="${f1(r)}"/>`;
/** Cień drzewa na ziemi (3D: płaska elipsa w prawo, 2D: przesunięta korona). */
const cienDrzewa = (a, b, rx, ry) => `<ellipse cx="${f1(a)}" cy="${f1(b)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="#1b2433" opacity=".17"/>`;

/** Drzewo liściaste: pień i korona z trzech kół z połyskiem; prosto – las w oddali (bez konturu i połysku). */
function drzewo(g, px, py, r = 1, kolor = "#5fd36e", prosto = false) {
  const [a, b] = g.p(px, py), jasny = ton(kolor, -0.35);
  if (g.plaski) {   // 2D: korona z góry i cień w prawo w dół
    return cienDrzewa(a + 2 * r, b + 2 * r, 5.6 * r, 5.2 * r)
      + sylwetka([kolko(a, b - 0.8 * r, 4.6 * r), kolko(a - 2.6 * r, b + 1.2 * r, 3.6 * r), kolko(a + 2.5 * r, b + 1.3 * r, 3.5 * r)], kolor, !prosto)
      + (prosto ? "" : kolko(a - 1.5 * r, b - 1.9 * r, 1.9 * r).replace("/>", ` fill="${jasny}"/>`));
  }
  const H = 9.5 * r;   // środek korony nad ziemią (px)
  return cienDrzewa(a + 2 * r, b, 5.4 * r, 2.2 * r)
    + `<line x1="${f1(a)}" y1="${f1(b)}" x2="${f1(a)}" y2="${f1(b - H + 2 * r)}" stroke="#7a5a3a" stroke-width="${f1(1.9 * r)}" stroke-linecap="round"/>`
    + sylwetka([kolko(a, b - H - 1.6 * r, 4.7 * r), kolko(a - 3 * r, b - H + 0.9 * r, 3.8 * r), kolko(a + 3.1 * r, b - H + 1.1 * r, 3.6 * r)], kolor, !prosto)
    + (prosto ? "" : kolko(a - 1.7 * r, b - H - 3.2 * r, 2 * r).replace("/>", ` fill="${jasny}"/>`));
}
/** Topola: wysoka, wąska korona. */
function topola(g, px, py, r = 1, kolor = "#4cc28a") {
  const [a, b] = g.p(px, py), jasny = ton(kolor, -0.35);
  if (g.plaski) return drzewo(g, px, py, r * 0.8, kolor);
  const el = (cy, rx, ry) => `<ellipse cx="${f1(a)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}"/>`;
  return cienDrzewa(a + 3 * r, b, 4 * r, 1.8 * r)
    + `<line x1="${f1(a)}" y1="${f1(b)}" x2="${f1(a)}" y2="${f1(b - 5 * r)}" stroke="#7a5a3a" stroke-width="${f1(1.6 * r)}" stroke-linecap="round"/>`
    + sylwetka([el(b - 13 * r, 3.3 * r, 8.6 * r)], kolor)
    + el(b - 16 * r, 1.3 * r, 4 * r).replace("/>", ` fill="${jasny}"/>`);
}
/** Świerk: trzy piętra igieł; prosto – las w oddali. */
function swierk(g, px, py, r = 1, prosto = false, kolor = IGLY[0]) {
  const [a, b] = g.p(px, py);
  if (g.plaski) return cienDrzewa(a + 2 * r, b + 2 * r, 4.6 * r, 4.4 * r) + sylwetka([kolko(a, b, 4.4 * r)], kolor, !prosto)
    + (prosto ? "" : kolko(a, b, 2 * r).replace("/>", ` fill="${ton(kolor, -0.3)}"/>`));
  const pietro = (dol, szer, wys) => `<path d="M${f1(a)} ${f1(dol - wys)}L${f1(a + szer)} ${f1(dol)}H${f1(a - szer)}Z"/>`;
  const pietra = [pietro(b - 2.5 * r, 5.6 * r, 8 * r), pietro(b - 7 * r, 4.6 * r, 7.5 * r), pietro(b - 11.5 * r, 3.4 * r, 6.5 * r)];
  return cienDrzewa(a + 2 * r, b, 4.6 * r, 2 * r)
    + `<line x1="${f1(a)}" y1="${f1(b)}" x2="${f1(a)}" y2="${f1(b - 3 * r)}" stroke="#6d4c35" stroke-width="${f1(1.6 * r)}"/>`
    + sylwetka(pietra, kolor, !prosto)
    + (prosto ? "" : `<path d="M${f1(a)} ${f1(b - 18 * r)}L${f1(a + 3.4 * r)} ${f1(b - 11.5 * r)}L${f1(a + 5.6 * r)} ${f1(b - 2.5 * r)}H${f1(a)}Z" fill="#1b2433" opacity=".13"/>`);
}
/** Krzew: niska kępka. */
function krzew(g, px, py, r = 1, kolor = "#7be08a") {
  const [a, b] = g.p(px, py), d = g.plaski ? 0 : 3 * r;
  return cienDrzewa(a + 1.5 * r, b + (g.plaski ? 1.5 * r : 0), 3.6 * r, g.plaski ? 3.2 * r : 1.4 * r)
    + sylwetka([kolko(a - 1.4 * r, b - d, 2.4 * r), kolko(a + 1.5 * r, b - d, 2.3 * r), kolko(a, b - d - 1.2 * r, 2.5 * r)], kolor);
}
/** Kępa drzew na prostokącie [x, x+w) × [y, y+h): losowe, ale stałe położenia z odstępem (bez nakładania się i bez
 * siatki), większe drzewa w środku kępy, mieszanka gatunków; rysowane od tyłu. gestosc – drzew na pole, iglaste –
 * udział świerków, krzewy – udział krzewów, maks – górna granica liczby drzew, prosto – las w oddali. */
export function kepa(g, x, y, w, h, { gestosc = 2, iglaste = 0.2, krzewy = 0.15, maks = 14, klucz = "", prosto = false } = {}) {
  let i = 0;
  const r = () => losuj("kepa", klucz, x.toFixed(2), y.toFixed(2), i++);
  const n = Math.min(maks, Math.max(1, Math.round(w * h * gestosc))), odstep = 0.62 / Math.sqrt(gestosc), m = 0.12;
  const pkty = [];
  for (let proba = 0; proba < n * 25 && pkty.length < n; proba++) {
    const p = [x + m + r() * Math.max(0, w - 2 * m), y + m + r() * Math.max(0, h - 2 * m)];
    if (pkty.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) >= odstep)) pkty.push(p);
  }
  const [sx, sy] = [x + w / 2, y + h / 2], zasieg = Math.hypot(w, h) / 2 || 1;
  const drzewa = pkty.map(([px, py]) => {
    const t = r(), wiek = (0.8 + r() * 0.35) * (1.12 - 0.3 * Math.hypot(px - sx, py - sy) / zasieg);   // w środku kępy większe
    return { px, py, t, wiek, kolor: r() };
  }).sort((p, q) => g.glebia(p.px, p.py) - g.glebia(q.px, q.py));
  return drzewa.map(({ px, py, t, wiek, kolor }) => {
    if (t < iglaste) return swierk(g, px, py, wiek, prosto, wybierz(IGLY, kolor));
    if (prosto) return drzewo(g, px, py, wiek, wybierz(LISCIE, kolor), true);
    if (t < iglaste + krzewy) return krzew(g, px, py, wiek * 0.85, wybierz(LISCIE, kolor));
    if (t < iglaste + krzewy + 0.1) return topola(g, px, py, wiek, wybierz(LISCIE, kolor));
    return drzewo(g, px, py, wiek, wybierz(LISCIE, kolor));
  }).join("");
}
const AUTA_PARKING = ["#e45f26", "#2d73d6", "#f4f1ea", "#43a047", "#5f6b7a", "#f2b705", "#c62828", "#263238"];
function parkingPole(g, x, y, s, l, r) {
  let html = wiel(romb(g, x, y, s, l), "#c3c7cd");
  for (let u = x + 0.1; u < x + s; u += 0.15) html += `<line x1="${g.p(u, y + 0.04)[0]}" y1="${g.p(u, y + 0.04)[1]}" x2="${g.p(u, y + 0.2)[0]}" y2="${g.p(u, y + 0.2)[1]}" stroke="#fff" stroke-width=".5"/>`;
  for (let v = y + 0.04; v < y + l - 0.16; v += 0.3) {
    for (let u = x + 0.1; u < x + s - 0.1; u += 0.15) if (r() < 0.6) html += blok(g, u + 0.02, v, 0.1, 0.16, 0, 2.6, wybierz(AUTA_PARKING, r()));
  }
  return html;
}
// --- zabudowa wolnych pól w stylu zabawkowego miasteczka: krępe bryły, kilka dużych okien, kolorowe dachy ---
const DACHY = [DACHOWKA, "#ff8fb1", "#7a8cff", "#ffa94d", "#4fc3a1", "#b388ff"];
const DACHY_PLASKIE = ["#ff9fb7", "#8fd3ff", "#ffd66e", "#a5e8c8", "#c9b5ff", "#ffb38a"];
/** Miękki cień budynku na ziemi – wystaje za prawy bok i tył bryły. */
const cienNaZiemi = (g, x, y, s, l) => wiel(romb(g, x + 0.06, y - 0.05, s + 0.07, l + 0.02), KONTUR, ` opacity=".15"`);
/** Pozycje n okien rozstawionych równo na ścianie długości dl. */
const rozstaw = (dl, n) => Array.from({ length: n }, (_, i) => (dl * (i + 0.5)) / n);
/** Duże okna w równej siatce: w miejscach `us` na ścianie, rząd na każde piętro od h0 do h1. */
function okienka(S, h0, h1, pietro, us, kolor = SZYBA) {
  const w = Math.min(0.16, (S.dl / Math.max(us.length, 1)) * 0.7);   // duże okna: do 70% odstępu między nimi
  let d = "";
  for (let b = h0; b + pietro <= h1 + 0.5; b += pietro) {
    for (const u of us) d += czworokat(S, u - w / 2, b + pietro * 0.14, u + w / 2, b + pietro * 0.86);
  }
  return d ? `<path d="${d}" fill="${ton(kolor, S.cien)}" stroke="${KONTUR}" stroke-width=".6" stroke-linejoin="round"/>` : "";
}
/** Zabawkowy budynek: cień, bryła z cokołem, okna (na parterze frontu drzwi pośrodku), opcjonalny pas pod dachem,
 * dach dwuspadowy, namiotowy albo płaski z obrzeżem. */
function budyneczek(g, x, y, s, l, { h, sciana, dach, rodzaj = "plaski", pietro = 8, drzwi: zDrzwiami = true, akcent, pas = 2, szyby = SZYBA }) {
  const S = sciany(g, x, y, s, l), plaski = rodzaj === "plaski";
  let html = cienNaZiemi(g, x, y, s, l) + blok(g, x, y, s, l, 0, h, sciana, plaski ? dach : sciana);
  html += plat(S.L, 0, 0, S.L.dl, 1.2, ton(sciana, 0.18)) + plat(S.P, 0, 0, S.P.dl, 1.2, ton(sciana, 0.18));
  if (akcent) html += plat(S.L, 0, h - pas, S.L.dl, h, akcent) + plat(S.P, 0, h - pas, S.P.dl, h, akcent);   // pas pod dachem
  const gora = akcent ? h - pas : h, nL = Math.max(1, Math.round(S.L.dl / 0.22)), nP = Math.max(1, Math.round(S.P.dl / 0.3));
  if (zDrzwiami) {
    html += okienka(S.L, pietro, gora, pietro, rozstaw(S.L.dl, nL), szyby) + drzwi(S.L, S.L.dl / 2, Math.min(6.5, pietro - 1), 0.09);
    if (S.L.dl >= 0.26) html += okienka(S.L, 0, pietro, pietro, [S.L.dl * 0.18, S.L.dl * 0.82], szyby);
  } else html += okienka(S.L, 0, gora, pietro, rozstaw(S.L.dl, nL), szyby);
  html += okienka(S.P, 0, gora, pietro, rozstaw(S.P.dl, nP), szyby);
  const w = Math.min(9, 30 * Math.min(s, l));   // wysokość dachu spadzistego (px)
  if (plaski) return html + wiel(romb(g, x + 0.05, y + 0.05, s - 0.1, l - 0.1, h), ton(dach, 0.14));
  if (rodzaj === "namiotowy") return html + dachNamiotowy(g, x - 0.03, y - 0.03, s + 0.06, l + 0.06, h, w, dach);
  return html + dachDwuspadowy(g, x - 0.03, y - 0.03, s + 0.06, l + 0.06, h, w, dach, sciana, s >= l ? "x" : "y");
}
function domek(g, x, y, r) {
  const sciana = wybierz(["#fff3c4", "#ffd1dc", "#c9f0ff", "#d9f7c8", "#ffe0b8"], r());
  return budyneczek(g, x, y, 0.3, 0.26, { h: 8, sciana, dach: wybierz(DACHY, r()), rodzaj: "dwuspadowy", pietro: 8 });
}
const naPolu = (s, l) => [0.5 - s / 2, 0.5 - l / 2];   // budynek na środku pola
function wzdluzAlboWszerz(r, a, b) { return r() < 0.5 ? [a, b] : [b, a]; }

// rodzaje zabudowy: (g, x, y – róg pola, r – losowanie) → html
const ZABUDOWA = {
  kamienica(g, x, y, r) {   // kamieniczka: kolorowa fasada, pas pod dachem, czasem markiza nad parterem
    const sciana = wybierz(FASADY, r()), s = 0.6, l = 0.56, [dx, dy] = naPolu(s, l);
    let html = budyneczek(g, x + dx, y + dy, s, l, { h: wybierz([16, 20, 24], r()), sciana, dach: wybierz(DACHY, r()),
      rodzaj: wybierz(["dwuspadowy", "namiotowy", "plaski"], r()), akcent: ton(sciana, 0.28) });
    if (r() < 0.35) html += markiza(sciany(g, x + dx, y + dy, s, l).L, 0.04, s - 0.04, 7.4, wybierz(["#ff6b6b", "#4fc3a1", "#7a8cff", "#ffa94d"], r()));
    return html;
  },
  biurowiec(g, x, y, r) {   // biurowiec: dużo szyb, płaski kolorowy dach
    const [dx, dy] = naPolu(0.58, 0.58);
    return budyneczek(g, x + dx, y + dy, 0.58, 0.58, { h: wybierz([20, 24], r()), sciana: wybierz(["#e8f4ff", "#fff4e0", "#e9e4ff", "#e0fff4"], r()),
      dach: wybierz(DACHY_PLASKIE, r()), pietro: 6, drzwi: false, szyby: wybierz([SZYBA, "#b3a6ff", "#7fe5d0"], r()) });
  },
  skwer(g, x, y) {
    const html = wiel(romb(g, x + 0.18, y + 0.18, 0.64, 0.64), "#e6dcc6") + wiel(romb(g, x + 0.3, y + 0.3, 0.4, 0.4), "#a9d88f");
    return html + drzewo(g, x + 0.32, y + 0.34) + drzewo(g, x + 0.62, y + 0.62, 0.9);
  },
  akademik(g, x, y, r) {   // akademik: długa bryła z kolorowym pasem pod dachem
    const [s, l] = wzdluzAlboWszerz(r, 0.64, 0.34), [dx, dy] = naPolu(s, l);
    return budyneczek(g, x + dx, y + dy, s, l, { h: 22, sciana: "#fffaf0", dach: wybierz(DACHY_PLASKIE, r()), pietro: 5,
      akcent: wybierz(["#ff8f6b", "#64b5f6", "#81c784", "#f06292"], r()) });
  },
  pawilon(g, x, y, r) {   // niski pawilon usługowy
    const [dx, dy] = naPolu(0.6, 0.5);
    return budyneczek(g, x + dx, y + dy, 0.6, 0.5, { h: 10, sciana: wybierz(["#cfe8ff", "#ffe9c2", "#e6dcff"], r()), dach: wybierz(DACHY_PLASKIE, r()), pietro: 9 });
  },
  blok(g, x, y, r) {   // blok spółdzielczy (LSM): długi, kolorowy dach i narożniki
    const [s, l] = wzdluzAlboWszerz(r, 0.66, 0.34), [dx, dy] = naPolu(s, l);
    return budyneczek(g, x + dx, y + dy, s, l, { h: 18, sciana: wybierz(["#fff4d6", "#ffe0ea", "#dff2ff", "#e6dcff", "#ddf7e3"], r()),
      dach: wybierz(DACHY_PLASKIE, r()), pietro: 5, akcent: wybierz(["#f2b705", "#e57373", "#64b5f6", "#81c784", "#ba68c8"], r()) });
  },
  wiezowiec(g, x, y, r) {   // wieżowiec (Czuby): najwyższy w okolicy, ale krępy
    const [dx, dy] = naPolu(0.46, 0.46);
    return budyneczek(g, x + dx, y + dy, 0.46, 0.46, { h: 30, sciana: wybierz(["#fff1d6", "#e3f1ff", "#ffe3ef"], r()), dach: wybierz(DACHY_PLASKIE, r()),
      pietro: 5, akcent: wybierz(["#e57373", "#64b5f6", "#f2b705", "#81c784"], r()) });
  },
  plac_zabaw(g, x, y) {
    let html = wiel(romb(g, x + 0.22, y + 0.22, 0.56, 0.56), "#a9d88f") + wiel(romb(g, x + 0.3, y + 0.3, 0.22, 0.22), "#f1dfa9");
    html += blok(g, x + 0.58, y + 0.32, 0.12, 0.12, 0, 7, "#ef5350", "#ffca28");
    const [a, b] = g.p(x + 0.4, y + 0.66), [c, d] = g.p(x + 0.65, y + 0.66);
    html += `<path d="M${a} ${b}V${b - 9}H${c}V${d}" fill="none" stroke="#1e88e5" stroke-width="1.2"/><line x1="${(a + c) / 2}" y1="${b - 9}" x2="${(a + c) / 2}" y2="${b - 3}" stroke="#555" stroke-width=".6"/>`;
    return html + drzewo(g, x + 0.72, y + 0.72, 0.9);
  },
  boisko(g, x, y, r) {   // orlik albo kort
    const orlik = r() < 0.6;
    let html = wiel(romb(g, x + 0.18, y + 0.18, 0.64, 0.64), orlik ? "#5aa955" : "#d9824a")
      + wiel(romb(g, x + 0.24, y + 0.24, 0.52, 0.52), "none", ` stroke="#fff" stroke-width=".7"`);
    const [a, b] = g.p(x + 0.5, y + 0.24), [c, d] = g.p(x + 0.5, y + 0.76);
    html += `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="#fff" stroke-width=".7"/>`;
    for (const [i, j] of [[0.18, 0.18], [0.82, 0.18], [0.18, 0.82], [0.82, 0.82]]) {
      const [e, f] = g.p(x + i, y + j);
      html += `<line x1="${e}" y1="${f}" x2="${e}" y2="${f - 8}" stroke="#90a4ae" stroke-width=".6"/>`;
    }
    return html;
  },
  parking: (g, x, y, r) => parkingPole(g, x + 0.18, y + 0.18, 0.64, 0.64, r),
  drzewa(g, x, y, r) {   // kępa: 2–4 drzewa i krzewy, czasem świerk
    return kepa(g, x + 0.08, y + 0.08, 0.84, 0.84, { gestosc: 2 + r() * 2, iglaste: 0.2, krzewy: 0.25, klucz: `z${x},${y}` });
  },
  domki(g, x, y, r) {   // domy jednorodzinne z ogródkami
    let html = wiel(romb(g, x + 0.16, y + 0.16, 0.68, 0.68), "#cfe5b3") + domek(g, x + 0.22, y + 0.2, r);
    if (r() < 0.5) html += domek(g, x + 0.5, y + 0.52, r);
    return html;
  },
  dzialki(g, x, y, r) {   // ogródki działkowe: grządki i altanki
    let html = "";
    for (const [i, j] of [[0.18, 0.18], [0.5, 0.18], [0.18, 0.5], [0.5, 0.5]]) {
      html += wiel(romb(g, x + i + 0.01, y + j + 0.01, 0.3, 0.3), wybierz(["#b9d98f", "#cfe5b3", "#c9a77a", "#a9d88f"], r()));
      const t = r();
      if (t < 0.55) html += blok(g, x + i + 0.08, y + j + 0.08, 0.1, 0.1, 0, 5, wybierz(["#a1887f", "#90caf9", "#ffe082"], r()), "#795548");
      else if (t < 0.7) html += drzewo(g, x + i + 0.15, y + j + 0.15, 0.6, "#7cb342");
    }
    return html;
  },
  magazyn(g, x, y, r) {   // hala magazynowa
    const sc = wybierz(["#bfe3ff", "#ffd3a8", "#d8c8ff", "#c8f0d8"], r()), px = x + 0.18, py = y + 0.2, S = sciany(g, px, py, 0.64, 0.56);
    const html = cienNaZiemi(g, px, py, 0.64, 0.56) + blok(g, px, py, 0.64, 0.56, 0, 11, sc) + plat(S.L, 0.1, 0, 0.3, 7, "#78909c") + plat(S.L, 0.36, 0, 0.56, 7, "#78909c");
    return html + (r() < 0.5 ? dachLukowy(g, px, py, 0.64, 0.56, 11, 6, "#ff9fb7", sc) : dachDwuspadowy(g, px, py, 0.64, 0.56, 11, 5, "#7fb2ff", sc, "x"));
  },
  silos(g, x, y) {
    let html = "";
    for (const i of [0.32, 0.56]) html += walec(g, x + i, y + 0.32, 0.11, 0, 34, "#fff0c2", "#ffd36e") + stozek(g, x + i, y + 0.32, 0.11, 34, 5, "#ff8f8f");
    return html + blok(g, x + 0.2, y + 0.5, 0.6, 0.3, 0, 10, "#cfd8dc");
  },
};
// dzielnica → [rodzaj, waga]
const DZIELNICE = {
  stare_miasto: [["kamienica", 1]],
  centrum: [["kamienica", 0.55], ["biurowiec", 0.3], ["skwer", 0.15]],
  akademickie: [["akademik", 0.5], ["boisko", 0.25], ["drzewa", 0.1], ["parking", 0.15]],
  politechnika: [["pawilon", 0.45], ["parking", 0.3], ["drzewa", 0.1], ["boisko", 0.15]],
  dworzec: [["parking", 0.3], ["magazyn", 0.3], ["kamienica", 0.3], ["drzewa", 0.1]],
  zygmuntowskie: [["blok", 0.4], ["kamienica", 0.25], ["drzewa", 0.1], ["boisko", 0.1], ["domki", 0.15]],
  lsm_czuby: [["blok", 0.6], ["wiezowiec", 0.1], ["plac_zabaw", 0.2], ["drzewa", 0.1]],
  czechow: [["blok", 0.5], ["domki", 0.32], ["drzewa", 0.1], ["wiezowiec", 0.08]],
  felin: [["magazyn", 0.4], ["silos", 0.1], ["domki", 0.4], ["drzewa", 0.1]],
  zemborzyce: [["domki", 0.65], ["drzewa", 0.1], ["dzialki", 0.25]],
  "": [["dzialki", 0.6], ["drzewa", 0.4]],   // pola miasta poza dzielnicami
};
// budynki bez roli w grze – na mapie ich nie rysujemy (pola zostają puste albo z zielenią, placami, parkingami)
const ZIELEN_PROSTA = new Set(["drzewa", "skwer"]);
const BEZ_FUNKCJI = new Set(["kamienica", "biurowiec", "akademik", "pawilon", "blok", "wiezowiec", "domki", "magazyn", "silos"]);
// przed lokalami i zabytkami tylko niska zabudowa – nie zasłania tego, co w grze ważne
const NISKIE = [["drzewa", 0.25], ["skwer", 0.3], ["parking", 0.25], ["domki", 0.2]];
// część wolnych pól zostaje pusta (trawa, kolor dzielnicy) – mapa nie jest przeładowana; w centrum ciaśniej
const PUSTE = { stare_miasto: 0.15, centrum: 0.25, "": 0.6 }, PUSTE_INNE = 0.42;
function rodzajZabudowy(strefa, r, niskie = false) {
  const lista = niskie ? NISKIE : DZIELNICE[strefa] || DZIELNICE[""];
  let t = r * lista.reduce((s, [, w]) => s + w, 0);
  for (const [k, w] of lista) { if ((t -= w) <= 0) return k; }
  return lista[0][0];
}

// --- świat za kadrem: mapa nie kończy się w widocznym polu ---
const DALEJ = 26;   // ile pól terenu za marginesem rysujemy (sięga poza kadr, także w wyższej ramce telefonu)
const TRASY = new WeakMap();
/** Drogi i rzeki z miasto.yaml; końce leżące na brzegu marginesu przedłużone poza kadr (ten sam kierunek). */
export function trasyMiasta(mi, siatka, mg) {
  if (!mi) return { drogi: [], rzeki: [] };
  if (TRASY.has(mi)) return TRASY.get(mi);
  const { szer: S, gl: G } = siatka;
  const brzeg = ([x, y]) => x <= -mg || x >= S + mg || y <= -mg || y >= G + mg;
  const dalej = (p, q) => { const dx = p[0] - q[0], dy = p[1] - q[1], L = Math.hypot(dx, dy); return [p[0] + dx / L * DALEJ, p[1] + dy / L * DALEJ]; };
  const wydluz = (t) => {
    const pts = t.punkty.slice(), n = pts.length;
    if (n > 1 && brzeg(pts[0])) pts[0] = dalej(pts[0], pts[1]);   // zamiana końca, nie nowy punkt na prostej
    if (n > 1 && brzeg(pts[n - 1])) pts[n - 1] = dalej(pts[n - 1], pts[n - 2]);
    return { ...t, punkty: pts };
  };
  const T = { drogi: (mi.drogi || []).map(wydluz), rzeki: (mi.rzeki || []).map(wydluz) };
  TRASY.set(mi, T);
  return T;
}
/** Podział [a, b) na kawałki długości krok (ostatni krótszy): [[początek, długość]…]. */
function podzial(a, b, krok) {
  const w = [];
  for (let x = a; x < b - 1e-9; x += krok) w.push([x, Math.min(krok, b - x)]);
  return w;
}
/** Pola okolicy: pas marginesu co 1,5 pola, dalej co 3 – tylko te, które mogą trafić do kadru. */
export function polaOkolicy(g, wies = null) {
  const { szer: S, gl: G } = g.siatka, mg = g.mg, pola = [];
  for (const k of wies || []) {   // M11: pola bez zabudowy miejskiej w siatce – też pola uprawne
    const [x, y] = k.split(",").map(Number);
    pola.push({ x, y, w: 1, h: 1, daleko: false, wies: true });
  }
  const zapas = Math.max(0, g.szer - g.wys) / 2 + 40;   // ramka telefonu ma proporcje do 1:1 – kadr wyższy niż mapa
  const widac = (x, y, w, h) => [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].some(([a, b]) => {
    const [px, py] = g.p(a, b);
    return px > -40 && px < g.szer + 40 && py > -zapas && py < g.wys + zapas;
  });
  for (const [x, w] of podzial(-mg, S + mg, 1.5)) for (const [y, h] of podzial(-mg, G + mg, 1.5)) {
    if (!(x > -0.5 && x < S && y > -0.5 && y < G)) pola.push({ x, y, w, h, daleko: false });
  }
  const os = (n) => [...podzial(-mg - Math.ceil(DALEJ / 3) * 3, -mg, 3), [-mg, n + 2 * mg, true], ...podzial(n + mg, n + mg + DALEJ, 3)];
  const xs = os(S), ys = os(G), wnetrze = (k) => k.length === 3;
  for (const kx of xs) for (const ky of ys) {
    if (wnetrze(kx) && wnetrze(ky)) continue;
    for (const [x, w] of wnetrze(kx) ? podzial(kx[0], kx[0] + kx[1], 3) : [kx]) {
      for (const [y, h] of wnetrze(ky) ? podzial(ky[0], ky[0] + ky[1], 3) : [ky]) if (widac(x, y, w, h)) pola.push({ x, y, w, h, daleko: true });
    }
  }
  return pola;
}

/** Czy prostokąt [x0, x1] × [y0, y1] (pola siatki) przecina drogę albo rzekę (odcinki po liniach siatki). */
function naTrasie(T, x0, y0, x1, y1, zapas = 0.3) {
  for (const t of [...T.drogi, ...T.rzeki]) {
    for (let i = 1; i < t.punkty.length; i++) {
      const [ax, ay] = t.punkty[i - 1], [bx, by] = t.punkty[i];
      if (Math.max(ax, bx) + zapas > x0 && Math.min(ax, bx) - zapas < x1 && Math.max(ay, by) + zapas > y0 && Math.min(ay, by) - zapas < y1) return true;
    }
  }
  return false;
}

/** M11: czy kafel okolicy [x, x+w) × [y, y+h) zawiera pole przy trasie (zbiór z polaTras). */
function naPolachTras(pola, x, y, w, h) {
  for (let i = Math.floor(x); i < x + w; i++) for (let j = Math.floor(y); j < y + h; j++) if (pola.has(`${i},${j}`)) return true;
  return false;
}

/** Obiekty zabudowy wolnych pól miasta i okolicy (lasy, zagrody). `zajete` – zbiór „x,y” pól z budynkami i lokalami. */
export function zabudowa(g, M, zajete) {
  if (g.prosty && g.plaski) return [];   // 2D: bez zieleni, placów i okolicy – tylko to, co ważne w grze
  const { szer: W, gl: H } = g.siatka, mg = g.mg, mi = M.miasto, wynik = [];
  const strefaPola = M.strefaPola ? (x, y) => M.strefaPola.get(`${x},${y}`) || ""
    : (x, y) => Object.entries(M.strefy).find(([, s]) => x >= s.mapa.x && x < s.mapa.x + s.mapa.szer && y >= s.mapa.y && y < s.mapa.y + s.mapa.gl)?.[0] || "";
  // M11: pola, przez które biegną drogi, kolej i rzeka (krzywe) – bez zabudowy
  const T = trasyMiasta(mi, g.siatka, mg), polowa = mi?.uklad?.polowa_szerokosci || {};
  const przyTrasie = mi?.uklad ? polaTras([...T.drogi.map((d) => ({ punkty: d.punkty, polowa: polowa[d.rodzaj] ?? 0.2 })),
    ...T.rzeki.map((t) => ({ punkty: t.punkty, polowa: polowa.rzeka ?? 0.25 }))], 0.05) : new Set();
  const losowanie = (...k) => { let i = 0; return () => losuj(...k, i++); };
  const niskie = new Set();
  for (const o of [...M.lokale, ...(mi?.miejsca || [])]) {
    const { x, y, szer = 1, gl = 1 } = o.mapa;
    for (let i = 0; i <= szer; i++) for (let j = 0; j <= gl; j++) if (i === szer || j === gl) niskie.add(`${x + i},${y + j}`);
  }
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
    if (zajete.has(`${x},${y}`) || M.wies?.has(`${x},${y}`) || przyTrasie.has(`${x},${y}`)) continue;
    const r = losowanie("pole", x, y), strefa = strefaPola(x, y);
    if (r() < (PUSTE[strefa] ?? PUSTE_INNE)) continue;
    const rodzaj = rodzajZabudowy(strefa, r(), niskie.has(`${x},${y}`));
    if (BEZ_FUNKCJI.has(rodzaj)) continue;   // decyzja autora: bez małych budynków bez roli w grze – tylko zieleń i place
    if (g.prosty && !ZIELEN_PROSTA.has(rodzaj)) continue;   // styl prosty w 3D: tylko drzewa i skwery
    wynik.push({ klucz: g.glebia(x + 1, y + 1), html: `<g pointer-events="none">${ZABUDOWA[rodzaj](ciasniej(g, x, y, SKALA_ZABUDOWY), x, y, r)}</g>` });
  }
  // okolica (także poza kadrem): lasy, zagrody i wsie na polach za miastem
  for (const { x, y, w, h, daleko } of polaOkolicy(g, M.wies)) {
    if (mi?.uklad ? naPolachTras(przyTrasie, x, y, w, h) : naTrasie(T, x + 0.1, y + 0.1, x + w - 0.1, y + h - 0.1, 0.25)) continue;
    const r = losowanie("okolica", x, y), t = r();
    let html = "";
    if (t < (daleko ? 0.14 : 0.2)) {   // las: świerki i liściaste (w oddali rzadszy i prostszy)
      // gęsty las blisko miasta, rzadszy i prostszy w oddali; świerki przeważają
      html += kepa(g, x, y, w, h, { gestosc: daleko ? 0.55 : 2.4, iglaste: 0.55, krzewy: 0.1, maks: daleko ? 6 : 12, klucz: `o${x},${y}`, prosto: daleko });
    } else if (!g.prosty && t < (daleko ? 0.22 : 0.3)) {   // zagroda (nie w stylu prostym) albo (dalej) wieś: domy, stodoła, drzewa
      const domy = daleko && w >= 2.9 && h >= 2.9 ? [[0.4, 0.5], [1.3, 0.5], [0.5, 1.6], [1.6, 1.7]].slice(0, 2 + Math.floor(r() * 3)) : [[0.35, 0.35]];
      for (const [i, j] of domy) html += domek(g, x + i, y + j, r);
      html += blok(g, x + w - 0.7, y + 0.3, 0.4, 0.28, 0, 9, "#8d6e63") + dachDwuspadowy(g, x + w - 0.7, y + 0.3, 0.4, 0.28, 9, 7, "#6d4c41", "#8d6e63", "x")
        + drzewo(g, x + 0.4, y + h - 0.45, 0.9);
    }
    if (html) wynik.push({ klucz: g.glebia(x + w, y + h), html: `<g pointer-events="none">${html}</g>` });
  }
  return wynik;
}
