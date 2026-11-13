// Mapa Lublina (M1–M6): geometria lekkiej izometrii, teren, drogi, Bystrzyca, punkty orientacyjne, ruch i pora dnia.
// Dane: kat.mapa.miasto (dane/mapa/miasto.yaml) – sam wygląd, bez wpływu na grę. Płaskie warstwy (teren, strefy, drogi,
// rzeka, ruch) rysujemy w układzie siatki w <g transform="matrix(…)">, bryły – w pikselach ekranu przez p(x, y, h).
import { esc } from "./wspolne.js";
import { kepa, polaOkolicy, ton, trasyMiasta, ZABYTKI } from "./mapa_budynki.js";
import { krzywa, odcinek, przeciecia, probki, punktNa, rownolegla } from "./mapa_uklad.js";

// rzut z północą prawie w górę: plan obrócony o OBROT (północ lekko w prawo, żeby widać było front i bok budynków)
// i spłaszczony w pionie o SPLASZCZ (po spłaszczeniu północ ok. 22° od pionu); BOK – bok pola na ekranie (px)
const BOK = 31, OBROT = (14 * Math.PI) / 180, SPLASZCZ = 0.6;
const WSCH = [BOK * Math.cos(OBROT), BOK * SPLASZCZ * Math.sin(OBROT)];    // ekranowy wektor pola na wschód (+x)
const POLD = [-BOK * Math.sin(OBROT), BOK * SPLASZCZ * Math.cos(OBROT)];   // ekranowy wektor pola na południe (+y)
const BOK_2D = 28;   // widok 2D: plan prosto z góry, północ dokładnie w górę, bez wysokości (bok pola w px)
/** Kierunek północy na ekranie w stopniach od pionu (zgodnie z zegarem) – dla róży wiatrów. */
export const polnocStopni = (plaski) => (plaski ? 0 : (Math.atan2(-POLD[0], POLD[1]) * 180) / Math.PI);
const MARGINES = 16, NAD = 70;  // miejsce nad mapą na wysokie budynki
// styl prosty (minimalizm, 2D i 3D): same dzielnice, drogi, lokale i budynki z rolą jako gładkie bryły; false – dawny,
// szczegółowy wygląd (kamienice, zieleń, przechodnie, portale tuneli…)
const STYL_PROSTY = true;

/** Rzut siatki na ekran z marginesem `mg` pól terenu podmiejskiego wokół miasta; `plaski` – widok 2D z góry
 * (wysokości pomijane: bryły to same dachy, auta – prostokąty). Oprócz p(x, y, h): glebia(x, y) –
 * kolejność rysowania (większa = bliżej patrzącego), widac(nx, ny) – czy ściana o normalnej (nx, ny) patrzy na widza,
 * elipsa(r) – półosie [kx, ky] okręgu o promieniu r pól na ziemi. */
export function geometria(siatka, mg = 0, plaski = false) {
  const [ex, ey] = plaski ? [BOK_2D, 0] : WSCH, [sx, sy] = plaski ? [0, BOK_2D] : POLD, wz = plaski ? 0 : 1;
  const rogi = [[-mg, -mg], [siatka.szer + mg, -mg], [-mg, siatka.gl + mg], [siatka.szer + mg, siatka.gl + mg]]
    .map(([x, y]) => [x * ex + y * sx, x * ey + y * sy]);
  const minX = Math.min(...rogi.map((r) => r[0])), maxX = Math.max(...rogi.map((r) => r[0]));
  const minY = Math.min(...rogi.map((r) => r[1])), maxY = Math.max(...rogi.map((r) => r[1]));
  const ox = MARGINES - minX, oy = (plaski ? MARGINES : NAD) - minY;
  return {
    p: (x, y, h = 0) => [ox + x * ex + y * sx, oy + x * ey + y * sy - h * wz], plaski, prosty: STYL_PROSTY,
    glebia: (x, y) => x * ey + y * sy,
    widac: (nx, ny) => nx * ey + ny * sy > 1e-9,
    elipsa: (r) => [r * Math.hypot(ex, sx), r * Math.hypot(ey, sy)],
    mg, siatka, szer: 2 * MARGINES + maxX - minX, wys: (plaski ? MARGINES : NAD) + MARGINES + maxY - minY,
    macierz: `matrix(${ex.toFixed(4)} ${ey.toFixed(4)} ${sx.toFixed(4)} ${sy.toFixed(4)} ${ox.toFixed(2)} ${oy.toFixed(2)})`,
  };
}

export const pkt = (lista) => lista.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");
export const romb = (g, x, y, s, l, h = 0) => [g.p(x, y, h), g.p(x + s, y, h), g.p(x + s, y + l, h), g.p(x, y + l, h)];

// prostopadłościan: dwie widoczne ściany (ciemniejsze) i dach – płaskie kolory, cienki obrys
export function bryla(g, x, y, s, l, h, kolor, obrys = "rgba(0,0,0,.14)", dach = kolor) {
  const lewa = [g.p(x, y + l), g.p(x + s, y + l), g.p(x + s, y + l, h), g.p(x, y + l, h)];
  const prawa = [g.p(x + s, y), g.p(x + s, y + l), g.p(x + s, y + l, h), g.p(x + s, y, h)];
  const sciana = (pts, cien) => `<polygon points="${pkt(pts)}" fill="${kolor}" stroke="${obrys}" stroke-width=".6"/>`
    + `<polygon points="${pkt(pts)}" fill="#1b2433" opacity="${cien}"/>`;
  return sciana(lewa, 0.14) + sciana(prawa, 0.26)
    + `<polygon points="${pkt(romb(g, x, y, s, l, h))}" fill="${dach}" stroke="${obrys}" stroke-width=".6"/>`;
}

// dach czterospadowy (ostrosłup) nad prostokątem na wysokości h
function dachSpadzisty(g, x, y, s, l, h, wys, kolor) {
  const E = g.p(x + s / 2, y + l / 2, h + wys);
  const tr = (a, b, cien) => `<polygon points="${pkt([a, b, E])}" fill="${kolor}" stroke="rgba(0,0,0,.14)" stroke-width=".6"/>`
    + `<polygon points="${pkt([a, b, E])}" fill="#1b2433" opacity="${cien}"/>`;
  return tr(g.p(x, y, h), g.p(x + s, y, h), 0) + tr(g.p(x, y, h), g.p(x, y + l, h), 0.05)
    + tr(g.p(x, y + l, h), g.p(x + s, y + l, h), 0.12) + tr(g.p(x + s, y, h), g.p(x + s, y + l, h), 0.24);
}

// wielokąt „koła” w układzie siatki (po rzucie – elipsa leżąca na ziemi)
const kolo = (g, cx, cy, r, h = 0, n = 20) =>
  pkt(Array.from({ length: n }, (_, i) => g.p(cx + r * Math.cos(2 * Math.PI * i / n), cy + r * Math.sin(2 * Math.PI * i / n), h)));

/** Drzewa parku: kępa z odstępami i mieszanką gatunków (mapa_budynki.js: kepa); gesto – gęściej (np. Górki). */
export function drzewa(g, x, y, s, l, gesto = false) {
  return kepa(g, x + 0.05, y + 0.05, s - 0.1, l - 0.1, { gestosc: gesto ? 4 : 2.2, iglaste: 0.15, krzewy: 0.2, maks: 16, klucz: `p${x},${y}` });
}

// --- linie po siatce: zaokrąglone narożniki (jak na schematach), łuki przez wierzchołki ---
function sciezka(punkty, r = 0.7) {   // r – promień łuków albo lista promieni dla kolejnych wierzchołków
  let d = `M${punkty[0][0]} ${punkty[0][1]}`;
  for (let i = 1; i < punkty.length - 1; i++) {
    const [px, py] = punkty[i - 1], [x, y] = punkty[i], [nx, ny] = punkty[i + 1];
    const ri = Array.isArray(r) ? r[i] : r;
    const d1 = Math.hypot(x - px, y - py), d2 = Math.hypot(nx - x, ny - y);
    const r1 = Math.min(ri, d1 / 2) / d1, r2 = Math.min(ri, d2 / 2) / d2;
    d += ` L${x - (x - px) * r1} ${y - (y - py) * r1} Q${x} ${y} ${x + (nx - x) * r2} ${y + (ny - y) * r2}`;
  }
  const [lx, ly] = punkty[punkty.length - 1];
  return `${d} L${lx} ${ly}`;
}
const dlugosc = (punkty) => punkty.slice(1).reduce((s, [x, y], i) => s + Math.hypot(x - punkty[i][0], y - punkty[i][1]), 0);

// rodzaj drogi → [obrys, szerokość obrysu, wypełnienie, szerokość] (w polach siatki)
const DROGI = {
  ekspresowa: ["#d79a2b", 0.42, "#f4c35e", 0.32],
  aleja: ["#b8bfc9", 0.36, "#ffffff", 0.27],
  ulica: ["#c5cad1", 0.28, "#fbfbfb", 0.2],
  deptak: ["#cdb58a", 0.34, "#efdfbf", 0.27],
};

// pseudolosowość z ziarnem (stały wygląd przy każdym rysowaniu)
function losowe(tekst) {
  let a = 0;
  for (const z of String(tekst)) a = (Math.imul(a ^ z.charCodeAt(0), 2654435761) >>> 0);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// pola uprawne za miastem (margines i dalej, poza kadr): łaty w odcieniach zieleni i zbóż, na części – rzędy upraw
function okolica(g, wies) {
  const los = losowe("okolica"), barwy = ["#dbe6c6", "#e7e2c0", "#d2e2c0", "#e2e8cf", "#d9e4bf", "#ebe3c3"];
  let html = "";
  for (const { x, y, w, h } of polaOkolicy(g, wies)) {
    const kolor = barwy[Math.floor(los() * barwy.length)];
    html += `<rect x="${x + 0.12}" y="${y + 0.12}" width="${w - 0.24}" height="${h - 0.24}" rx=".25" fill="${kolor}"/>`;
    if (los() < 0.45) {   // rzędy upraw
      const wzdluz = los() < 0.5, n = Math.round((wzdluz ? h : w) / 0.3);
      let d = "";
      for (let i = 1; i < n; i++) {
        const t = (wzdluz ? y : x) + 0.12 + i * ((wzdluz ? h : w) - 0.24) / n;
        d += wzdluz ? `M${x + 0.25} ${t}H${x + w - 0.25}` : `M${t} ${y + 0.25}V${y + h - 0.25}`;
      }
      html += `<path d="${d}" stroke="#1b2433" stroke-opacity=".07" stroke-width=".05" fill="none"/>`;
    }
  }
  return html;
}

// --- widok 2D: minimalizm – jednolite tło, plamy dzielnic, gładkie szare drogi bez detali ---
// szerokości dróg stylu prostego (pola): pasy aut z mapa_pojazdy.js (PAS 0,072, obwodnica 0,1 i 0,27 od osi, auto
// ok. 0,12 szerokości) mieszczą się w jezdni
const PROSTY_SZER = { ulica: 0.3, aleja: 0.34, deptak: 0.3, ekspresowa: 0.72 };
const PROSTY = { tlo: "#f2efe8", rzeka: "#8ec9e8", park: "#bfe0a8", droga: "#cfd2d8", deptak: "#e7dcc4", ekspres: "#a9afb8", kolej: "#9aa0a8" };
/** Prostokąt z zaokrąglonymi rogami w pikselach ekranu (tylko widok 2D – rzut prosto z góry) z miękkim cieniem. */
export function plytka(g, x, y, s, l, kolor, { cien = true, obrys = "", r = 4 } = {}) {
  const [a, b] = g.p(x, y), [c, d] = g.p(x + s, y + l), w = (c - a).toFixed(1), h = (d - b).toFixed(1);
  return (cien ? `<rect x="${(a + 1.5).toFixed(1)}" y="${(b + 2).toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="#4b3a66" opacity=".14"/>` : "")
    + `<rect x="${a.toFixed(1)}" y="${b.toFixed(1)}" width="${w}" height="${h}" rx="${r}" fill="${kolor}"${obrys}/>`;
}
/** Gładka bryła stylu prostego: w 3D prostopadłościan z cieniem na ziemi i jaśniejszym dachem, w 2D – płytka.
 * `obrys` – kolor brzegu (np. wolny lokal), `przerywany` – brzeg przerywany. */
export function kostka(g, x, y, s, l, h, kolor, { obrys, przerywany = false, cien = true } = {}) {
  if (g.plaski) {
    const o = obrys ? ` stroke="${obrys}" stroke-width="1.2"${przerywany ? ` stroke-dasharray="3 2"` : ""}` : "";
    return plytka(g, x, y, s, l, kolor, { cien, obrys: o, r: 3 });
  }
  const pod = cien ? `<polygon points="${pkt(romb(g, x + 0.07, y - 0.05, s + 0.08, l + 0.05))}" fill="#4b3a66" opacity=".13"/>` : "";
  const brzeg = obrys || "rgba(0,0,0,.08)";
  return pod + bryla(g, x, y, s, l, h, kolor, brzeg, ton(kolor, -0.2))
    + (przerywany ? `<polygon points="${pkt(romb(g, x, y, s, l, h))}" fill="none" stroke="${obrys}" stroke-width="1.2" stroke-dasharray="3 2"/>` : "");
}
function terenProsty(g, M, kolorStrefy) {
  const mi = M.miasto, { szer: S, gl: G } = g.siatka, D = 2 * g.mg + 60;
  const T = trasyMiasta(mi, g.siatka, g.mg);
  let html = `<rect x="${-D}" y="${-D}" width="${S + 2 * D}" height="${G + 2 * D}" fill="${PROSTY.tlo}"/>`;
  for (const [k, s] of Object.entries(M.strefy)) {   // dzielnice: pola bez szczelin, jedna plama koloru
    const kolor = esc(kolorStrefy(k, s));
    for (const [x, y] of s.komorki || []) html += `<rect class="strefa" data-strefa="${esc(k)}" x="${x - 0.01}" y="${y - 0.01}" width="1.02" height="1.02" fill="${kolor}" fill-opacity=".55"/>`;
    if (!s.komorki) { const { x, y, szer, gl } = s.mapa; html += `<rect class="strefa" data-strefa="${esc(k)}" x="${x}" y="${y}" width="${szer}" height="${gl}" rx=".5" fill="${kolor}" fill-opacity=".55"/>`; }
  }
  for (const b of M.budynki.filter((b) => b.rodzaj === "park")) {
    const { x, y, szer, gl } = b.mapa;
    html += `<rect x="${x + 0.1}" y="${y + 0.1}" width="${szer - 0.2}" height="${gl - 0.2}" rx=".3" fill="${PROSTY.park}"/>`;
  }
  for (const r of T.rzeki) html += `<path d="${krzywa(r.punkty)}" fill="none" stroke="${PROSTY.rzeka}" stroke-width=".38" stroke-linecap="round"><title>${esc(r.nazwa)}</title></path>`;
  for (const b of M.budynki.filter((b) => b.rodzaj === "woda")) {
    const { x, y, szer, gl } = b.mapa;
    html += `<rect x="${x + 0.15}" y="${y + 0.15}" width="${szer - 0.3}" height="${gl - 0.3}" rx="1" fill="${PROSTY.rzeka}"/>`;
  }
  const drogi = T.drogi;
  for (const d of drogi.filter((d) => d.rodzaj === "kolej")) {   // dwa tory dokładnie tam, gdzie jeżdżą pociągi (TOR)
    html += `<path d="${krzywa(d.punkty)}" fill="none" stroke="#e4e0d6" stroke-width="${(2 * TOR + 0.14).toFixed(2)}"><title>${esc(d.nazwa)}</title></path>`;
    for (const o of [TOR, -TOR]) html += `<path d="${rownolegla(d.punkty, o)}" fill="none" stroke="${PROSTY.kolej}" stroke-width=".05" stroke-dasharray=".22 .1"/>`;
  }
  // tunele: kolej pod drogami – wloty przy krawędziach jezdni (drogi rysowane później zakrywają środek)
  for (const t of tunele(g, M)) html += wloty(t);
  for (const d of drogi.filter((d) => !["kolej", "ekspresowa"].includes(d.rodzaj))) {
    html += `<path d="${krzywa(d.punkty)}" fill="none" stroke="${d.rodzaj === "deptak" ? PROSTY.deptak : PROSTY.droga}" stroke-width="${PROSTY_SZER[d.rodzaj]}" stroke-linecap="round" stroke-linejoin="round"><title>${esc(d.nazwa)}</title></path>`;
  }
  // drogi pod obwodnicą: ciemne wloty z betonowymi portalami, obwodnica (niżej) zakrywa środek tunelu
  for (const t of tuneleDrog(g, M)) html += wloty(t);
  for (const d of drogi.filter((d) => d.rodzaj === "ekspresowa")) {   // obwodnica na wierzchu – inne drogi pod nią
    html += `<path d="${krzywa(d.punkty)}" fill="none" stroke="${PROSTY.ekspres}" stroke-width="${PROSTY_SZER.ekspresowa}" stroke-linecap="round"><title>${esc(d.nazwa)}</title></path>`;
  }
  return html;
}

/** Teren w układzie siatki: okolica, miasto, strefy (kolor strefy albo warstwy), parki, rzeki, woda, drogi. */
export function teren(g, M, kolorStrefy) {
  if (g.prosty) return terenProsty(g, M, kolorStrefy);
  const mi = M.miasto, mg = g.mg, { szer: S, gl: G } = g.siatka;
  const T = trasyMiasta(mi, g.siatka, mg), D = 2 * mg + 60;   // tło okolicy daleko poza kadr
  let html = `<rect x="${-D}" y="${-D}" width="${S + 2 * D}" height="${G + 2 * D}" fill="#e3ebd5"/>` + (mg ? okolica(g, M.wies) : "");
  if (M.wies) {   // M11: teren miejski tylko przy dzielnicach – miasto ma nieregularny kształt, dalej pola uprawne
    for (let x = 0; x < S; x++) for (let y = 0; y < G; y++) {
      if (!M.wies.has(`${x},${y}`)) html += `<rect x="${x - 0.01}" y="${y - 0.01}" width="1.02" height="1.02" fill="#eef1e7"/>`;
    }
  } else html += `<rect x="-.15" y="-.15" width="${S + 0.3}" height="${G + 0.3}" rx=".8" fill="#eef1e7" stroke="#d6dccb" stroke-width=".06"/>`;
  for (const [k, s] of Object.entries(M.strefy)) {
    const kolor = esc(kolorStrefy(k, s));
    if (s.komorki) {   // dzielnica z pól: pola stykają się, na brzegu dzielnicy wąski pas ulicy
      const jest = (x, y) => M.strefaPola.get(`${x},${y}`) === k;
      for (const [x, y] of s.komorki) {
        const l = jest(x - 1, y) ? -0.01 : 0.07, p = jest(x + 1, y) ? -0.01 : 0.07, g0 = jest(x, y - 1) ? -0.01 : 0.07, d = jest(x, y + 1) ? -0.01 : 0.07;
        html += `<rect class="strefa" data-strefa="${esc(k)}" x="${x + l}" y="${y + g0}" width="${1 - l - p}" height="${1 - g0 - d}" fill="${kolor}"/>`;
      }
      continue;
    }
    const { x, y, szer, gl } = s.mapa;
    html += `<rect class="strefa" data-strefa="${esc(k)}" x="${x + 0.07}" y="${y + 0.07}" width="${szer - 0.14}" height="${gl - 0.14}" rx=".45" fill="${kolor}"/>`;
  }
  for (const b of M.budynki.filter((b) => b.rodzaj === "park")) {
    const { x, y, szer, gl } = b.mapa;
    html += `<rect x="${x + 0.1}" y="${y + 0.1}" width="${szer - 0.2}" height="${gl - 0.2}" rx=".35" fill="#a9d88f" stroke="#86c06c" stroke-width=".05"/>`;
  }
  for (const m of mi?.miejsca || []) {
    if (m.ksztalt !== "gorki") continue;
    const { x, y, szer, gl } = m.mapa;
    html += `<rect x="${x + 0.1}" y="${y + 0.1}" width="${szer - 0.2}" height="${gl - 0.2}" rx=".8" fill="#b9dc9c"/>`;
  }
  for (const r of T.rzeki) {   // rzeka: gładka krzywa z brzegiem
    const p = krzywa(r.punkty);
    html += `<path d="${p}" fill="none" stroke="#cfe3c0" stroke-width=".7" stroke-linecap="round"/>`
      + `<path d="${p}" fill="none" stroke="#6fb8de" stroke-width=".5" stroke-linecap="round"/>`
      + `<path d="${p}" fill="none" stroke="#8fd0ef" stroke-width=".36" stroke-linecap="round"><title>${esc(r.nazwa)}</title></path>`;
  }
  for (const b of M.budynki.filter((b) => b.rodzaj === "woda")) {   // zbiornik: plaża, głębia, skarpa, fale
    const { x, y, szer, gl } = b.mapa, id = `woda-${esc(b.id)}`, los = losowe(b.id);
    const X = x + 0.12, Y = y + 0.12, W = szer - 0.24, H = gl - 0.24, tafla = `x="${X}" y="${Y}" width="${W}" height="${H}" rx="1.1"`;
    html += `<rect x="${X - 0.1}" y="${Y - 0.1}" width="${W + 0.2}" height="${H + 0.2}" rx="1.2" fill="#eadcae"/>`
      + `<defs><radialGradient id="${id}-g"><stop offset="0" stop-color="#4b9fd3"/><stop offset=".65" stop-color="#76c1e8"/><stop offset="1" stop-color="#a8ddf3"/></radialGradient>`
      + `<clipPath id="${id}-c"><rect ${tafla}/></clipPath></defs>`
      + `<rect ${tafla} fill="url(#${id}-g)"/>`
      // cień skarpy od tylnych brzegów – tafla leży niżej niż ląd
      + `<g clip-path="url(#${id}-c)"><rect x="${X + 0.1}" y="${Y + 0.1}" width="${W}" height="${H}" rx="1.1" fill="none" stroke="#25628a" stroke-opacity=".3" stroke-width=".24"/></g>`
      + `<rect ${tafla} fill="none" stroke="#5aa6d2" stroke-width=".04"/>`;
    for (let i = 0; i < Math.round(W * H * 1.3); i++) {   // migoczące fale
      const px = X + 0.4 + los() * (W - 0.8), py = Y + 0.35 + los() * (H - 0.7);
      html += `<path d="M${px.toFixed(2)} ${py.toFixed(2)}q.06 -.05 .12 0t.12 0" fill="none" stroke="#ffffff" stroke-width=".025" stroke-linecap="round" opacity=".5">`
        + `<animate attributeName="opacity" values=".08;.7;.08" dur="${(3 + los() * 3).toFixed(1)}s" begin="-${(los() * 5).toFixed(1)}s" repeatCount="indefinite"/></path>`;
    }
  }
  const drogi = T.drogi;
  const kolej = drogi.filter((d) => d.rodzaj === "kolej"), jezdnie = drogi.filter((d) => d.rodzaj !== "kolej");
  for (const d of kolej) {   // linia dwutorowa: podsypka, podkłady, dwie pary szyn
    html += `<path d="${krzywa(d.punkty)}" fill="none" stroke="#d8d2c4" stroke-width=".5"><title>${esc(d.nazwa)}</title></path>`;
    for (const t of [TOR, -TOR]) {   // M16: tory rozsunięte – mijające się pociągi nie stykają się bokami
      html += `<path d="${rownolegla(d.punkty, t)}" fill="none" stroke="#9c8b78" stroke-width=".15" stroke-dasharray=".035 .07"/>`;
      for (const o of [0.045, -0.045]) html += `<path d="${rownolegla(d.punkty, t + o)}" fill="none" stroke="#6b7079" stroke-width=".014"/>`;
    }
  }
  // M15: tunele kolejowe – pociąg przejeżdża pod drogą: portale przy krawędziach jezdni (drogi rysowane później zakrywają środek)
  for (const t of tunele(g, M)) html += wloty(t);
  // M13: droga ekspresowa (obwodnica) – dwie jezdnie; inne drogi przechodzą pod nią tunelami, więc obwodnica na wierzchu
  const ekspres = jezdnie.filter((d) => d.rodzaj === "ekspresowa"), zwykle = jezdnie.filter((d) => d.rodzaj !== "ekspresowa");
  // najpierw obrysy wszystkich dróg, potem jezdnie – skrzyżowania łączą się gładko
  for (const d of zwykle) {
    const [obrys, w] = DROGI[d.rodzaj];
    html += `<path d="${krzywa(d.punkty)}" fill="none" stroke="${obrys}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  for (const d of zwykle) {
    const [, , kolor, w] = DROGI[d.rodzaj];
    html += `<path d="${krzywa(d.punkty)}" fill="none" stroke="${kolor}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"><title>${esc(d.nazwa)}</title></path>`;
  }
  for (const d of zwykle) {   // przerywana linia środkowa
    if (d.rodzaj === "deptak") continue;
    html += `<path d="${krzywa(d.punkty)}" fill="none" stroke="#c9ced6" stroke-width=".016" stroke-dasharray=".12 .1"/>`;
  }
  // tunele pod obwodnicą: ciemne wloty z portalami, obwodnica (rysowana na końcu) zakrywa środek tunelu
  for (const t of tuneleDrog(g, M)) html += wloty(t);
  for (const e of ekspres) html += drogaEkspresowa(e);
  return html;
}

// --- M13: droga ekspresowa (obwodnica S12 / S17 / S19) ---
const EKSPRES = { pobocze: 0.9, jezdnia: 0.78, krawedz: 0.36, pas: 0.19, rozdzial: 0.1 };   // szerokości i przesunięcia (pola)
/** Dwie jezdnie po dwa pasy: pobocze, asfalt, białe krawędzie, przerywane linie pasów, zielony pas rozdziału z barierą. */
function drogaEkspresowa(d) {
  const p = krzywa(d.punkty), E = EKSPRES;
  let html = `<path d="${p}" fill="none" stroke="#c4cdb6" stroke-width="${E.pobocze}" stroke-linecap="round"/>`
    + `<path d="${p}" fill="none" stroke="#868e97" stroke-width="${E.jezdnia}" stroke-linecap="round"><title>${esc(d.nazwa)}</title></path>`;
  for (const z of [E.krawedz, -E.krawedz]) html += `<path d="${rownolegla(d.punkty, z)}" fill="none" stroke="#f4f4f4" stroke-width=".022"/>`;
  for (const z of [E.pas, -E.pas]) html += `<path d="${rownolegla(d.punkty, z)}" fill="none" stroke="#ffffff" stroke-width=".018" stroke-dasharray=".16 .13"/>`;
  return html + `<path d="${p}" fill="none" stroke="#7fb069" stroke-width="${E.rozdzial}"/><path d="${p}" fill="none" stroke="#d9dde2" stroke-width=".02"/>`;
}

// --- M15: tunele kolejowe pod drogami ---
const TOR = 0.11;   // przesunięcie osi toru od osi linii (jak w mapa_pojazdy.js)
const WLOT = 0.14, PORTAL = 0.06;   // głębokość ciemnego wlotu przed krawędzią górnej trasy i grubość betonowej ściany (pola)
const SCIANA_H = 5, OTWOR_H = 3.8;   // 3D: wysokość ściany czołowej i otworu (px)
/** Szerokość narysowanej drogi (pola, z obrysem albo poboczem) – w stylu prostym inna niż w pełnym wyglądzie. */
const szerokoscDrogi = (rodzaj) => STYL_PROSTY ? PROSTY_SZER[rodzaj] : rodzaj === "ekspresowa" ? EKSPRES.pobocze : DROGI[rodzaj][1];
/** Tunel: trasa `dol` (punkty) pod trasą `gora` w przecięciu k (s1 – na górnej, s2 – na dolnej). Wloty leżą równo
 * z krawędziami górnej trasy (połowa szerokości H), na całej szerokości dolnej (połowa r) – także przy skośnym
 * przecięciu. a, b – wjazd i wyjazd wzdłuż dolnej (dla maski pojazdów). */
function tunelPod(gora, dol, H, r, k, reszta = {}) {
  const [, , tx, ty] = punktNa(probki(gora), k.s1), [, , ux, uy] = punktNa(probki(dol), k.s2);
  const nx = -ty, ny = tx, un0 = ux * nx + uy * ny, un = Math.sign(un0 || 1) * Math.max(0.35, Math.abs(un0));
  const dl = (H + WLOT) / Math.abs(un);
  return { punkty: dol, a: k.s2 - dl, b: k.s2 + dl, x: k.x, y: k.y, tx, ty, ux, uy, un, H, r, ...reszta };
}
/** Punkty wlotu po stronie z (±1): czworokąt równoległy do krawędzi górnej trasy, od odległości o0 do o1 od jej osi,
 * o połowie długości (wzdłuż krawędzi) pol – [[x, y]…] w polach siatki. */
function czworokatWlotu(t, z, o0, o1, pol) {
  const P = (o) => { const l = (z * o) / t.un; return [t.x + t.ux * l, t.y + t.uy * l]; };
  const [a, b] = [P(o0), P(o1)];
  return [[a[0] - t.tx * pol, a[1] - t.ty * pol], [a[0] + t.tx * pol, a[1] + t.ty * pol], [b[0] + t.tx * pol, b[1] + t.ty * pol], [b[0] - t.tx * pol, b[1] - t.ty * pol]];
}
const pol = (t) => t.r / Math.abs(t.un);   // połowa szerokości dolnej trasy mierzona wzdłuż krawędzi górnej
/** Wloty na ziemi (w układzie siatki): ciemny otwór przy krawędzi górnej trasy i betonowa krawędź, po obu stronach. */
function wloty(t) {
  const wiel = (pts, kolor) => `<polygon points="${pts.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`).join(" ")}" fill="${kolor}"/>`;
  let html = "";
  for (const z of [1, -1]) {
    html += wiel(czworokatWlotu(t, z, t.H - 0.02, t.H + WLOT, pol(t)), "#2e3339")
      + wiel(czworokatWlotu(t, z, t.H + WLOT, t.H + WLOT + PORTAL, pol(t) + 0.1), "#aab2bb");
  }
  return html;
}
/** 3D: niskie betonowe ściany czołowe z ciemnym otworem (obiekty mapy, rysowane od tyłu) – tunel wygląda jak tunel. */
export function scianyTuneli(g, M) {
  if (g.plaski || !M.miasto) return [];
  const wynik = [];
  for (const t of [...tunele(g, M), ...tuneleDrog(g, M)]) {
    for (const z of [1, -1]) {
      const [s0, s1] = czworokatWlotu(t, z, t.H + WLOT, t.H + WLOT, pol(t) + 0.1), [o0, o1] = czworokatWlotu(t, z, t.H + WLOT, t.H + WLOT, pol(t));
      const sc = (A, B, h, kolor) => `<polygon points="${pkt([g.p(A[0], A[1]), g.p(B[0], B[1]), g.p(B[0], B[1], h), g.p(A[0], A[1], h)])}" fill="${kolor}"/>`;
      const [cx, cy] = [(s0[0] + s1[0]) / 2, (s0[1] + s1[1]) / 2];
      wynik.push({ klucz: g.glebia(cx, cy), html: `<g pointer-events="none">${sc(s0, s1, SCIANA_H, "#b9c0c8")}${sc(o0, o1, OTWOR_H, "#2e3339")}`
        + `<polygon points="${pkt([g.p(s0[0], s0[1], SCIANA_H), g.p(s1[0], s1[1], SCIANA_H), g.p(s1[0], s1[1], SCIANA_H + 1.2), g.p(s0[0], s0[1], SCIANA_H + 1.2)])}" fill="#d5dade"/></g>` });
    }
  }
  return wynik;
}
const TUNELE = new WeakMap();
/** Tunele kolejowe pod drogami: [{punkty (tor), a, b, …}] – a, b: wjazd i wyjazd wzdłuż linii kolejowej. */
export function tunele(g, M) {
  const T = trasyMiasta(M.miasto, g.siatka, g.mg);
  if (!M.miasto || TUNELE.has(T)) return TUNELE.get(T) || [];
  const wynik = [];
  for (const k of T.drogi.filter((d) => d.rodzaj === "kolej")) {
    for (const d of T.drogi.filter((d) => d.rodzaj !== "kolej")) {
      for (const p of przeciecia(d.punkty, k.punkty)) wynik.push(tunelPod(d.punkty, k.punkty, szerokoscDrogi(d.rodzaj) / 2, TOR + 0.09, p));
    }
  }
  TUNELE.set(T, wynik);
  return wynik;
}
const TUNELE_DROG = new WeakMap();
/** Tunele zwykłych dróg pod obwodnicą: [{punkty (droga), rodzaj, a, b, …}] – a, b: wjazd i wyjazd wzdłuż drogi. */
export function tuneleDrog(g, M) {
  const T = trasyMiasta(M.miasto, g.siatka, g.mg);
  if (!M.miasto || TUNELE_DROG.has(T)) return TUNELE_DROG.get(T) || [];
  const wynik = [];
  for (const e of T.drogi.filter((d) => d.rodzaj === "ekspresowa")) {
    for (const d of T.drogi.filter((d) => !["ekspresowa", "kolej"].includes(d.rodzaj))) {
      for (const p of przeciecia(e.punkty, d.punkty)) {
        wynik.push(tunelPod(e.punkty, d.punkty, szerokoscDrogi("ekspresowa") / 2, szerokoscDrogi(d.rodzaj) / 2, p, { rodzaj: d.rodzaj }));
      }
    }
  }
  TUNELE_DROG.set(T, wynik);
  return wynik;
}
/** Maski chowające pojazdy w tunelach (pas toru albo drogi i nad nim – pojazdy mają wysokość): #mapa-tunele –
 * pociągi pod drogami, #mapa-tunele-drog – auta pod obwodnicą (auta na obwodnicy jadą nad nimi, bez maski). */
export function maskaTuneli(g, M) {
  const maska = (id, t, w) => {
    if (!t.length) return "";
    const pasy = t.map(({ punkty, a, b }) => `<path d="${odcinek(punkty, a + 0.04, b - 0.04)}" fill="none" stroke="#000" stroke-width="${w}"/>`).join("");
    return `<mask id="${id}" maskUnits="userSpaceOnUse" x="-5000" y="-5000" width="20000" height="20000"><rect x="-5000" y="-5000" width="20000" height="20000" fill="#fff"/>`
      + [0, 4, 8, 12].map((h) => `<g transform="translate(0 ${-h})"><g transform="${g.macierz}">${pasy}</g></g>`).join("") + "</mask>";
  };
  return maska("mapa-tunele", tunele(g, M), 0.56) + maska("mapa-tunele-drog", tuneleDrog(g, M), 0.5);
}
/** Zielone tablice z numerami dróg ekspresowych przy obwodnicy (w pikselach ekranu, nad mapą). */
export function tabliceObwodnicy(g, M) {
  const mi = M.miasto;
  if (!mi || g.prosty) return "";
  let html = "";
  for (const d of trasyMiasta(mi, g.siatka, g.mg).drogi.filter((d) => d.rodzaj === "ekspresowa")) {
    const P = probki(d.punkty);
    for (const [u, nr] of [[0.3, "S19"], [0.5, "S12"], [0.62, "S17"], [0.78, "S17"]]) {
      const [x, y, tx, ty] = punktNa(P, u * P.dl), [a, b] = g.p(x - ty * 0.75, y + tx * 0.75);
      html += `<g transform="translate(${a.toFixed(1)} ${b.toFixed(1)})"><line y1="0" y2="-8" stroke="#6b7079" stroke-width="1"/>`
        + `<rect x="-10" y="-18" width="20" height="11" rx="2.5" fill="#1b7f3b" stroke="#ffffff" stroke-width="1"/>`
        + `<text y="-9.6" text-anchor="middle" font-size="7.5" font-weight="800" fill="#ffffff">${nr}</text></g>`;
    }
  }
  return html;
}

// --- punkty orientacyjne: proste bryły, klik – krótki opis ---
const MIEJSCA = {
  zamek(g, x, y, s, l) {
    return bryla(g, x + 0.12, y + 0.12, 0.34, 0.34, 30, "#d6c3a0") + dachSpadzisty(g, x + 0.12, y + 0.12, 0.34, 0.34, 30, 10, "#b5543c")
      + bryla(g, x + 0.12, y + 0.42, s - 0.24, l - 0.54, 14, "#e2d2b2") + bryla(g, x + 0.46, y + 0.12, s - 0.58, 0.32, 18, "#e2d2b2");
  },
  brama(g, x, y) {
    const luk = [g.p(x + 0.4, y + 0.8, 0), g.p(x + 0.6, y + 0.8, 0), g.p(x + 0.6, y + 0.8, 9), g.p(x + 0.5, y + 0.8, 12), g.p(x + 0.4, y + 0.8, 9)];
    return bryla(g, x + 0.25, y + 0.2, 0.5, 0.6, 26, "#cf8a5c") + `<polygon points="${pkt(luk)}" fill="#5b3a2a"/>`
      + dachSpadzisty(g, x + 0.25, y + 0.2, 0.5, 0.6, 26, 13, "#8a3d2b");
  },
  wieza(g, x, y) {
    return bryla(g, x + 0.32, y + 0.32, 0.36, 0.36, 42, "#e7d6b6") + dachSpadzisty(g, x + 0.32, y + 0.32, 0.36, 0.36, 42, 15, "#6f9a7a");
  },
  plac(g, x, y, s, l) {
    return `<polygon points="${pkt(romb(g, x + 0.08, y + 0.08, s - 0.16, l - 0.16))}" fill="#e9dfc9" stroke="#cdbd9a" stroke-width=".8"/>`
      + `<polygon points="${pkt(romb(g, x + 0.28, y + 0.25, s - 0.56, l - 0.5))}" fill="none" stroke="#b39e76" stroke-width="1" stroke-dasharray="3 2"/>`;
  },
  fontanna(g, x, y, s, l) {
    const [a, b] = g.p(x + s / 2, y + l / 2);
    return `<polygon points="${pkt(romb(g, x + 0.08, y + 0.08, s - 0.16, l - 0.16))}" fill="#e7e0d3" stroke="#cbbfa8" stroke-width=".8"/>`
      + `<polygon points="${kolo(g, x + s / 2, y + l / 2, 0.3)}" fill="#8fd0ef" stroke="#5fa9d3" stroke-width=".8"/>`
      + `<g class="fontanna-woda"><line x1="${a}" y1="${b}" x2="${a}" y2="${b - 12}" stroke="#bfe6f7" stroke-width="2.2" stroke-linecap="round"/>`
      + `<circle cx="${a}" cy="${b - 13}" r="2.4" fill="#d8f1fb"/></g>`;
  },
  csk(g, x, y, s, l) {
    return bryla(g, x + 0.1, y + 0.1, s - 0.2, l - 0.2, 16, "#ecebe5", undefined, "#9ccc8a")
      + `<polygon points="${pkt(romb(g, x + 0.25, y + 0.25, s - 0.5, l - 0.5, 16))}" fill="#7dbb6c"/>`;
  },
  uczelnia(g, x, y, s, l) {
    return bryla(g, x + 0.1, y + 0.14, s - 0.2, l - 0.28, 20, "#f1ede3", undefined, "#c3cad6")
      + `<polygon points="${pkt(romb(g, x + 0.2, y + 0.24, s - 0.4, l - 0.48, 20))}" fill="#aab4c4"/>`;
  },
  dworzec(g, x, y, s, l) {
    return bryla(g, x + 0.08, y + 0.15, s - 0.16, l - 0.3, 11, "#dfe4ea", undefined, "#7f9cc0")
      + bryla(g, x + s - 0.4, y + 0.2, 0.22, 0.22, 24, "#dfe4ea", undefined, "#5d7ea8");
  },
  stadion(g, x, y, s, l) {
    return bryla(g, x + 0.1, y + 0.1, s - 0.2, l - 0.2, 12, "#e6e9ee", undefined, "#3d7fc4")
      + `<polygon points="${pkt(romb(g, x + 0.42, y + 0.42, s - 0.84, l - 0.84, 12))}" fill="#62b25a" stroke="#fff" stroke-width=".8"/>`;
  },
  lotnisko(g, x, y, s) {
    const pas = romb(g, x + 0.1, y + 1.55, s - 0.2, 0.6);
    const [a1, b1] = g.p(x + 0.3, y + 1.85), [a2, b2] = g.p(x + s - 0.3, y + 1.85);
    return `<polygon points="${pkt(romb(g, x + 0.05, y + 0.05, s - 0.1, 2.9))}" fill="#dfe7d0"/>`
      + `<polygon points="${pkt(pas)}" fill="#8b9099"/><line x1="${a1}" y1="${b1}" x2="${a2}" y2="${b2}" stroke="#fff" stroke-width="1.2" stroke-dasharray="5 4"/>`
      + bryla(g, x + 0.3, y + 0.25, 1.3, 0.7, 10, "#eef2f6", undefined, "#c9d3de")
      + bryla(g, x + 2.2, y + 0.3, 0.32, 0.32, 26, "#eef2f6", undefined, "#4aa3d8");
  },
  gorki(g, x, y, s, l) {
    let html = "";
    for (const [i, j, r] of [[0.9, 0.9, 16], [2.1, 1.2, 13], [1.3, 2.2, 14]]) {
      if (i > s || j > l) continue;
      const [a, b] = g.p(x + i, y + j);
      html += `<ellipse cx="${a}" cy="${b}" rx="${r * 1.6}" ry="${r * 0.8}" fill="#9fcf80"/><ellipse cx="${a}" cy="${b - r * 0.25}" rx="${r}" ry="${r * 0.5}" fill="#b4dc96"/>`;
    }
    return html + drzewa(g, x + 0.2, y + 2.4, 0.6, 0.6, true) + drzewa(g, x + 2.2, y + 0.1, 0.6, 0.6, true);
  },
};

/** Punkt orientacyjny jako obiekt mapy (klucz – kolejność rysowania od tyłu). */
const DYMEK_MIEJSCA = `data-ikona="📍" data-kolor="#a1887f" data-rada="Kliknij – ciekawostka o Lublinie (nie wpływa na grę)"`;
export function miejsce(g, m) {
  const { x, y, szer: s, gl: l } = m.mapa;
  if (g.prosty && g.plaski) {   // 2D: neutralna płytka z nazwą
    const h = 12, [a, b] = g.plaski ? g.p(x + s / 2, y + 0.14) : g.p(x + s / 2, y + l / 2, h + 6);
    return { klucz: g.glebia(x + s, y + l), html: `<g class="klik miejsce" data-akcja="mapa-miejsce" data-id="${esc(m.id)}" ${DYMEK_MIEJSCA}><title>${esc(m.nazwa)} – ${esc(m.opis)}</title>`
      + kostka(g, x + 0.15, y + 0.15, s - 0.3, l - 0.3, h, "#e4ddd0") + `<text x="${a}" y="${b - 2}" class="miejsce-napis" text-anchor="middle">${esc(m.nazwa)}</text></g>` };
  }
  const [a, b] = g.p(x + s / 2, y + l / 2, { wieza: 82, brama: 58, zamek: 110, dworzec: 66 }[m.ksztalt] || 40);
  return {
    klucz: g.glebia(x + s, y + l),
    html: `<g class="klik miejsce" data-akcja="mapa-miejsce" data-id="${esc(m.id)}" ${DYMEK_MIEJSCA}><title>${esc(m.nazwa)} – ${esc(m.opis)}</title>`
      + (ZABYTKI[m.id] || MIEJSCA[m.ksztalt])(g, x, y, s, l)
      + `<text x="${a}" y="${b}" class="miejsce-napis" text-anchor="middle">${esc(m.nazwa)}</text></g>`,
  };
}

// --- ruch na ziemi: piesi i sieć trakcyjna trolejbusów (SMIL); auta, autobusy i pociągi 3D – mapa_pojazdy.js ---
const PAS = 0.072;   // przesunięcie pasa ruchu od osi drogi (jak w mapa_pojazdy.js)

function pojazd(sciezkaD, dl, czesc, predkosc, wstecz, ksztalt) {
  const dur = dl / predkosc, start = -(czesc % 1) * dur;
  const kier = wstecz ? ` keyPoints="1;0" keyTimes="0;1" calcMode="linear"` : "";
  return `<g>${ksztalt}<animateMotion dur="${dur.toFixed(1)}s" begin="${start.toFixed(2)}s" repeatCount="indefinite" rotate="${wstecz ? "auto-reverse" : "auto"}" path="${sciezkaD}"${kier}/></g>`;
}
const pieszy = (kolor) => `<ellipse rx=".03" ry=".045" fill="${kolor}"/><circle r=".022" fill="#f1c9a5"/>`;

/** Ruch na ziemi w układzie siatki. `natezenie` 0–1 (pora dnia), `strefy` – {strefa: udział popytu 0–1}. */
export function ruch(g, M, natezenie, strefy) {
  const mi = M.miasto;
  if (!mi || g.prosty) return "";   // styl prosty: bez przechodniów i sieci trakcyjnej – tylko auta (mapa_pojazdy.js)
  let html = "";
  const T = trasyMiasta(mi, g.siatka, g.mg);
  for (const d of T.drogi.filter((d) => d.rodzaj === "deptak")) {   // spacerowicze na deptaku
    const p = krzywa(d.punkty), dl = dlugosc(d.punkty), los = losowe(d.id), n = Math.max(2, Math.round(dl * 2.2 * natezenie));
    for (let i = 0; i < n; i++) {
      const kolor = ["#3a3f47", "#6d4c41", "#1e88e5", "#c62828", "#7cb342"][i % 5];
      html += `<g transform="translate(0 ${((i % 3) - 1) * 0.07})">${pojazd(p, dl, i / n, 0.18 + los() * 0.1, i % 2 === 1, pieszy(kolor))}</g>`;
    }
  }
  // sieć trakcyjna trolejbusów nad pasami alej
  for (const d of T.drogi.filter((d) => d.rodzaj === "aleja")) {
    for (const t of [PAS, -PAS]) html += `<path d="${rownolegla(d.punkty, t)}" fill="none" stroke="#455a64" stroke-width=".008" opacity=".55"/>`;
  }
  // piesi: pętle wokół pól dzielnicy, tylu, ile wynika z popytu strefy i pory dnia
  for (const [k, s] of Object.entries(M.strefy)) {
    const los = losowe(k), n = Math.round(7 * (strefy[k] ?? 0.5) * natezenie);
    const pola = s.komorki || [[s.mapa.x, s.mapa.y]];
    for (let i = 0; i < n; i++) {
      const [x1, y1] = pola[Math.floor(los() * pola.length)], x2 = x1 + 1, y2 = y1 + 1;
      const pts = [[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]];
      html += pojazd(sciezka(pts, 0.25), dlugosc(pts), los(), 0.16, los() < 0.5, pieszy(i % 3 ? "#3a3f47" : "#8d6e63"));
    }
  }
  return html;
}

// --- pora dnia według zegara gracza: wysokość słońca nad Lublinem ---
/** Wysokość słońca w stopniach (przybliżenie NOAA, dokładność ok. 1°). */
export function wysokoscSlonca(data, szer, dl) {
  const rad = Math.PI / 180, d = data.getTime() / 864e5 - 10957.5;   // dni od J2000.0
  const g = (357.529 + 0.98560028 * d) * rad, q = 280.459 + 0.98564736 * d;
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad, e = (23.439 - 3.6e-7 * d) * rad;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)), dek = Math.asin(Math.sin(e) * Math.sin(L));
  const gmst = 18.697374558 + 24.06570982441908 * d;   // godziny
  const kat = (gmst * 15 + dl) * rad - ra;
  return Math.asin(Math.sin(szer * rad) * Math.sin(dek) + Math.cos(szer * rad) * Math.cos(dek) * Math.cos(kat)) / rad;
}

/** Pora dnia teraz: ciemność 0 (dzień) – 1 (noc), napis i natężenie ruchu z miasto.yaml. */
export function poraDnia(M, teraz = new Date()) {
  const mi = M.miasto;
  const wys = mi ? wysokoscSlonca(teraz, mi.wspolrzedne.szerokosc, mi.wspolrzedne.dlugosc) : 30;
  const ciemnosc = Math.min(1, Math.max(0, (4 - wys) / 16));
  const godz = teraz.getHours(), min = teraz.getMinutes();
  const godziny = mi?.ruch.godziny || Array(24).fill(1);
  const natezenie = godziny[godz] + (godziny[(godz + 1) % 24] - godziny[godz]) * min / 60;
  const nazwa = ciemnosc <= 0 ? "dzień" : ciemnosc >= 1 ? "noc" : godz < 12 ? "świt" : "zmierzch";
  const zegar = teraz.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  return { ciemnosc, natezenie, nazwa, zegar, ikona: ciemnosc >= 0.6 ? "☾" : ciemnosc > 0 ? "◐" : "☀" };
}

/** Oświetlenie ulic po zmroku (układ siatki): ciepła, rozmyta poświata wzdłuż alej, deptaka i obwodnicy
 * zamiast pojedynczych latarni – rysowane nad nocną nakładką w trybie „screen” (rozjaśnia). */
export function latarnie(M) {
  let poswiata = "", jezdnia = "";
  for (const d of M.miasto?.drogi || []) {
    if (d.rodzaj === "kolej" || !DROGI[d.rodzaj]) continue;
    const p = sciezka(d.punkty, d.rodzaj === "ekspresowa" ? 1.6 : 0.7), w = DROGI[d.rodzaj][1];
    const kolor = d.rodzaj === "ekspresowa" ? "#ffa53a" : "#ffbe5c";
    poswiata += `<path d="${p}" fill="none" stroke="${kolor}" stroke-width="${(w * 2.6).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    jezdnia += `<path d="${p}" fill="none" stroke="${kolor}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return `<g opacity=".4" filter="url(#mapa-rozmycie)">${poswiata}</g><g opacity=".22">${jezdnia}</g>`;
}
