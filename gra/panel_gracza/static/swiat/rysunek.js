// Biblioteka rysunku wnętrz (cegiełki SVG: ściany, podłogi, meble, szyldy, napisy). Wzór: makiety wnętrz z projektu
// (projekt.md rozdz. 7). Kolory tylko przez zmienne palety (motywy/zmienne.css). Sceny: swiat/sceny/<id>.js.
// Rozmiar napisów zależy od palety (wysoka widoczność = szerszy krój): ustawWyglad() czyta ją z <html>.
import { esc } from "../zakladki/wspolne.js";
import { rozmiarGrafiki } from "./sceny.js";

export const R = { q: new URLSearchParams(), esc, sk: 1, pal: "bar", tryb: "jasny" };
/** Odczyt palety i trybu z <html> (data-paleta, data-tryb); wołać przed każdym rysowaniem sceny. */
export function ustawWyglad() {
  const d = document.documentElement.dataset;
  R.pal = d.paleta || "bar"; R.tryb = d.tryb || "jasny"; R.sk = R.pal === "wysoka" ? 1.12 : 1;
}

// ---------- cegiełki ----------
R.u = (n, x, y, s = 1, extra = "") => { const [w, h] = rozmiarGrafiki(n); return `<use href="#g-${n}" x="${x}" y="${y}" width="${w * s}" height="${h * s}" ${extra}/>`; };
/** Postać gry w całości: cx – środek, stopy – y stóp, s – skala, mina: dobra | zwykla | zla | zmeczona */
R.osoba = (n, cx, stopy, s = 1, mina = "dobra") => { const sym = document.getElementById(`g-postacie-${n}`);
  return `<svg x="${cx - 60 * s}" y="${stopy - 256 * s}" width="${120 * s}" height="${260 * s}" viewBox="0 0 120 260" data-mina="${mina}">${sym ? sym.innerHTML : ""}</svg>`; };
/** Postać za ladą: widać ją tylko do wysokości blatu (blatY); stoi na podłodze za ladą (stopy) */
R.osobaZa = (n, cx, blatY, stopy, s = 1, mina = "dobra") => { const sym = document.getElementById(`g-postacie-${n}`), top = stopy - 256 * s, h = blatY - top;
  return `<svg x="${cx - 60 * s}" y="${top}" width="${120 * s}" height="${h}" viewBox="0 0 120 ${h / s}" data-mina="${mina}">${sym ? sym.innerHTML : ""}</svg>`; };
const SZER = { szyld: 0.5, gruby: 0.66, tekst: 0.52 }, SZER_W = { szyld: 0.68, gruby: 0.64, tekst: 0.56 };   // wysoka: Atkinson jest szerszy niż Oswald
/** Napis. o: { f: szyld|gruby|tekst, fill, w: największa szerokość (napis się zmniejszy), kot: start|middle|end, ls, op, extra, bez: true = bez wersalików } */
R.t = (x, y, txt, r, o = {}) => { const f = o.f || "szyld", tekst = f === "szyld" && !o.bez ? String(txt).toUpperCase() : String(txt);
  let rr = r * R.sk; const dl = tekst.length * rr * (R.pal === "wysoka" ? SZER_W[f] : SZER[f]) + (o.ls || 0) * tekst.length; if (o.w && dl > o.w) rr = Math.max(7, rr * o.w / dl);
  return `<text x="${x}" y="${y}" fill="${o.fill || "var(--tusz)"}" text-anchor="${o.kot || "middle"}" style="font-family:var(--font-${f});font-size:${rr.toFixed(1)}px${f === "gruby" ? ";font-weight:var(--waga-gruby,400)" : ""}"${o.ls ? ` letter-spacing="${o.ls}"` : ""}${o.op ? ` opacity="${o.op}"` : ""} ${o.extra || ""}>${esc(tekst)}</text>`; };
const los = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- tło: ściana, lamperia, podłogi ----------
R.sciana = (kolor = "var(--g-sciana)", yp = 380) => `<rect width="1220" height="${yp}" fill="${kolor}"/>`;
/** Lamperia olejna: pas farby od y1 do y2 + ciemniejszy pasek (lub szlaczek od wałka) na górze */
R.lamperia = (y1, y2 = 380, kolor = "var(--g-sciana2)", szlaczek = false) => `<rect x="0" y="${y1}" width="1220" height="${y2 - y1}" fill="${kolor}"/><path d="M0 ${y1}h1220" class="k"/>`
  + (szlaczek ? `<path d="M0 ${y1 - 9}h1220" stroke="var(--akcent-2)" stroke-width="4" stroke-dasharray="14 8" opacity=".7" class="efekt"/>` : "");
R.boazeria = (y1, y2 = 380) => `<rect x="0" y="${y1}" width="1220" height="${y2 - y1}" fill="var(--g-drewno2)"/><path d="M0 ${y1}h1220" class="k"/>` + Array.from({ length: 30 }, (_, i) => `<path d="M${i * 42 + 10} ${y1}v${y2 - y1}" stroke="var(--g-drewno)" stroke-width="2"/>`).join("");
/** Podłoga. typ: lastryko | parkiet | plytki | beton | wykladzina | bruk */
R.podloga = (typ = "lastryko", yp = 380, kolor) => { const H = 612 - yp; let s = `<rect x="0" y="${yp}" width="1220" height="${H}" fill="${kolor || (typ === "parkiet" ? "var(--g-drewno2)" : typ === "wykladzina" ? "var(--g-sciana2)" : "var(--g-podloga)")}"/>`;
  if (typ === "lastryko") { for (let i = 0; i < 150; i++) s += `<path d="M${(los(i) * 1220).toFixed(0)} ${(yp + 6 + los(i + 500) * (H - 10)).toFixed(0)}l${(3 + los(i + 9) * 6).toFixed(0)} ${(los(i + 77) * 4 - 2).toFixed(0)}" stroke="${i % 3 ? "var(--g-podloga2)" : "var(--g-biel)"}" stroke-width="${i % 4 ? 3 : 4.5}" stroke-linecap="round" class="efekt"/>`;
    for (let i = 0; i < 8; i++) s += `<path d="M${i * 190 + 60} ${yp}L${i * 300 - 380} 612" stroke="var(--tusz)" opacity=".16"/>`; s += `<path d="M0 ${yp + H * 0.3}h1220M0 ${yp + H * 0.68}h1220" stroke="var(--tusz)" opacity=".16"/>`; }
  if (typ === "plytki") { for (let i = -6; i <= 18; i++) s += `<path d="M${i * 90 + 70} ${yp}L${i * 150 - 240} 612" stroke="var(--tusz)" opacity=".2"/>`; for (const f of [0.11, 0.27, 0.48, 0.76]) s += `<path d="M0 ${yp + H * f}h1220" stroke="var(--tusz)" opacity=".2"/>`; }
  if (typ === "parkiet") for (let r = 0; r < 6; r++) { const y = yp + H * [0, .1, .23, .4, .6, .82][r]; s += `<path d="M0 ${y}h1220" stroke="var(--g-drewno)" stroke-width="1.5"/>`; for (let i = 0; i < 16; i++) s += `<path d="M${i * 84 + (r % 2) * 42} ${y}v${H * 0.2}" stroke="var(--g-drewno)" stroke-width="1.2" opacity=".7"/>`; }
  if (typ === "beton") s += `<path d="M0 ${yp + H * .45}h1220M400 ${yp}L300 612M860 ${yp}L960 612" stroke="var(--tusz)" opacity=".14"/>`;
  if (typ === "bruk") for (let r = 0; r < 7; r++) for (let i = 0; i < 26; i++) s += `<ellipse cx="${i * 50 + (r % 2) * 25}" cy="${yp + 14 + r * 33}" rx="${21 + r * 0.6}" ry="${9 + r * 1.2}" fill="none" stroke="var(--tusz)" opacity=".2"/>`;
  return s + `<path d="M0 ${yp}h1220" class="k"/>`; };
R.chodnik = (x, y, w, h, kolor = "var(--akcent)") => `<path class="k" d="M${x} ${y}h${w}l${h * 0.5} ${h}h${-w - h}z" fill="${kolor}" opacity=".8"/><path d="M${x + 10} ${y + 6}h${w - 20}M${x - h * 0.4 + 12} ${y + h - 8}h${w + h * 0.8 - 24}" stroke="var(--g-biel)" stroke-width="2.5" opacity=".6"/>`;

// ---------- światło ----------
R.lampa = (x, d = 40) => `<path class="k" d="M${x} 0v${d}"/><path class="k" d="M${x - 24} ${d + 22}q24-36 48 0z" fill="var(--g-tablica)"/><ellipse cx="${x}" cy="${d + 24}" rx="9" ry="4" fill="var(--g-biel)"/>`;
R.kula = (x, d = 34, r = 20) => `<path class="k" d="M${x} 0v${d}"/><rect class="k" x="${x - 7}" y="${d - 4}" width="14" height="8" fill="var(--g-metal2)"/><circle class="k" cx="${x}" cy="${d + r + 2}" r="${r}" fill="var(--g-biel)"/>`;
R.swietlowka = (x, y, w = 150) => `<rect class="k" x="${x}" y="${y}" width="${w}" height="12" rx="3" fill="var(--g-metal)"/><rect x="${x + 8}" y="${y + 12}" width="${w - 16}" height="6" rx="3" fill="var(--g-biel)" class="k1"/>`;
R.snop = (x, y, w = 150, h = 300) => `<path class="efekt" d="M${x - w * 0.2} ${y}h${w * 0.4}l${w * 0.5} ${h}h${-w * 1.4}z" fill="var(--g-biel)" opacity=".1"/>`;

// ---------- rośliny i drobiazgi PRL ----------
R.paprotka = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path class="k" d="M-16 0h32l-5 34h-22z" fill="var(--g-rudy)"/>
  <path class="k" d="M0 0c-4-30-30-36-40-30 14 4 26 14 32 30M0 0c4-34 30-40 42-32-16 4-28 16-34 32M0 0c-2-40-14-56-4-70 12 18 10 44 8 70" fill="var(--g-zielen)" stroke="var(--g-zielen2)"/></g>`;
/** Kwietnik: druciany stojak z paprotką (y = podłoga) */
R.kwietnik = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path class="k bez" d="M-14-70l-10 70M14-70l10 70M0-70v70M-20-30h40" stroke-width="3"/><ellipse class="k" cx="0" cy="-70" rx="20" ry="5" fill="var(--g-metal2)"/></g>` + R.paprotka(x, y - 104 * s, s);
R.fikus = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path class="k" d="M-22 0h44l-6 44h-32z" fill="var(--g-drewno)"/><path class="k" d="M0 0v-120" stroke="var(--g-drewno)" stroke-width="5"/>`
  + [[-4, -40, -30], [6, -60, 35], [-2, -85, -40], [4, -105, 30], [0, -125, -8]].map(([a, b, k]) => `<ellipse class="k1" cx="${a + k * 0.5}" cy="${b}" rx="24" ry="11" transform="rotate(${k} ${a} ${b})" fill="var(--g-zielen)"/>`).join("") + `</g>`;
R.zegar = (cx, cy, r = 30, g = 10, m = 10) => `<circle class="k3" cx="${cx}" cy="${cy}" r="${r}" fill="var(--g-biel)"/>` + Array.from({ length: 12 }, (_, i) => `<path d="M${cx} ${cy - r + 4}v${i % 3 ? 3 : 7}" stroke="var(--g-czern)" stroke-width="2" transform="rotate(${i * 30} ${cx} ${cy})"/>`).join("")
  + `<path d="M${cx} ${cy}v${-r * 0.5}" stroke="var(--g-czern)" stroke-width="4" stroke-linecap="round" transform="rotate(${g * 30 + m / 2} ${cx} ${cy})"/><path d="M${cx} ${cy}v${-r * 0.78}" stroke="var(--g-czern)" stroke-width="2.5" stroke-linecap="round" transform="rotate(${m * 6} ${cx} ${cy})"/><circle cx="${cx}" cy="${cy}" r="3" fill="var(--akcent)"/>`;
/** Tablica z wymiennymi literkami (czarny filc w gablocie): tytuł + wiersze [lewy, prawy] */
R.literki = (x, y, w, h, tytul, wiersze, r = 15) => `<rect class="k3" x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="var(--g-drewno)"/><rect class="k" x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" fill="var(--g-tablica)"/>`
  + Array.from({ length: Math.floor((h - 30) / (r + 7)) + 1 }, (_, i) => `<path d="M${x + 12} ${y + 14 + i * (r + 7)}h${w - 24}" stroke="var(--g-biel)" opacity=".12"/>`).join("")
  + R.t(x + w / 2, y + 12 + r + 4, tytul, r + 1, { fill: "var(--g-biel)", ls: 3, w: w - 30 })
  + wiersze.map(([a, b], i) => R.t(x + 18, y + 16 + (r + 7) * (i + 2), a, r, { fill: "var(--g-biel)", kot: "start", ls: 1.2, w: w - 36 - (b ? String(b).length * r * 0.62 + 12 : 0) }) + (b ? R.t(x + w - 18, y + 16 + (r + 7) * (i + 2), b, r, { fill: "var(--g-biel)", kot: "end", ls: 1 }) : "")).join("");
/** Automat z numerkami + wyświetlacz numeru */
R.numerki = (x, y, nr = "A 017") => `<rect class="k" x="${x}" y="${y}" width="46" height="74" rx="4" fill="var(--akcent)"/><rect class="k1" x="${x + 8}" y="${y + 10}" width="30" height="16" fill="var(--g-biel)"/><path class="k" d="M${x + 14} ${y + 46}h18v22h-18z" fill="var(--g-biel)"/>` + R.t(x + 23, y + 62, "17", 11, { fill: "var(--g-czern)", f: "gruby" })
  + `<rect class="k" x="${x - 12}" y="${y - 58}" width="70" height="36" rx="3" fill="var(--g-czern)"/>` + R.t(x + 23, y - 33, nr, 20, { fill: "var(--uwaga)", f: "gruby" }) + R.t(x + 23, y + 23, "NUMEREK", 7.5, { fill: "var(--g-czern)" });
/** Kartka przypięta do ściany / szyby: linie tekstu, obrót w stopniach */
R.kartka = (x, y, w, h, linie, obrot = -2, r = 12) => `<g transform="rotate(${obrot} ${x + w / 2} ${y + h / 2})"><rect class="k1" x="${x}" y="${y}" width="${w}" height="${h}" fill="var(--g-biel)"/><circle cx="${x + w / 2}" cy="${y + 5}" r="3" fill="var(--akcent)"/>`
  + linie.map((l, i) => R.t(x + w / 2, y + 12 + r + i * (r + 3), l, r, { fill: "var(--g-czern)", f: i ? "tekst" : "szyld", w: w - 8 })).join("") + `</g>`;
// tekst na tle ciemnym (tablica, drewno, zieleń, czerń) jest biały: --papier w trybie ciemnym też jest ciemny
const NA_CIEMNYM = /--g-(tablica|drewno|zielen2|czern|metal)/;
R.plakat = (x, y, w, h, linie, kolor = "var(--akcent)", r = 15, tk = NA_CIEMNYM.test(kolor) ? "var(--g-biel)" : "var(--papier)") => `<rect class="k" x="${x}" y="${y}" width="${w}" height="${h}" fill="${kolor}"/><rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" fill="none" stroke="${tk}" stroke-width="1.5"/>`
  + linie.map((l, i) => R.t(x + w / 2, y + h / 2 - (linie.length - 1) * (r + 3) / 2 + i * (r + 3) + r * 0.36, l, r, { fill: tk, f: i ? "szyld" : "gruby", w: w - 14 })).join("");
R.kaloryfer = (x, y, n = 8) => Array.from({ length: n }, (_, i) => `<rect class="k1" x="${x + i * 13}" y="${y}" width="11" height="62" rx="5" fill="var(--g-biel)"/>`).join("") + `<path class="k" d="M${x - 8} ${y + 54}h8M${x + n * 13} ${y + 8}h8v60" fill="none"/>`;
R.gasnica = (x, y) => `<rect class="k" x="${x}" y="${y}" width="16" height="42" rx="6" fill="var(--strata)"/><path class="k" d="M${x + 4} ${y}v-6h8v6M${x + 12} ${y - 4}q10 0 10 12" fill="none"/>`;
R.kosz = (x, y) => `<path class="k" d="M${x} ${y}h30l-5 36h-20z" fill="var(--g-metal2)"/><path d="M${x + 6} ${y + 4}l3 28M${x + 15} ${y + 4}v28M${x + 24} ${y + 4}l-3 28" stroke="var(--tusz)" opacity=".5"/>`;
R.wieszak = (x, y) => `<path class="k" d="M${x} ${y}v-150M${x - 22} ${y}h44M${x} ${y - 150}l-16 14M${x} ${y - 150}l16 14M${x} ${y - 132}l-14 12M${x} ${y - 132}l14 12" fill="none" stroke-width="4"/><path class="k" d="M${x + 14} ${y - 120}q16 4 14 60h-22q-4-40 8-60z" fill="var(--g-metal2)"/>`;

// ---------- architektura ----------
/** Okno ze szprosami. o: { firanka, widok: kolor, zaluzje, noc } */
R.okno = (x, y, w, h, o = {}) => `<rect class="k3" x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" fill="var(--g-biel)"/><rect class="k" x="${x}" y="${y}" width="${w}" height="${h}" fill="${o.widok || "var(--g-niebo)"}"/>`
  + (o.zaluzje ? Array.from({ length: Math.floor(h / 9) }, (_, i) => `<path d="M${x} ${y + 5 + i * 9}h${w}" stroke="var(--g-biel)" stroke-width="5" opacity=".85"/>`).join("") : "")
  + `<path class="k" d="M${x + w / 2} ${y}v${h}M${x} ${y + h * 0.36}h${w}"/>` + (o.firanka ? `<path d="M${x} ${y}h${w}v${h * 0.3}q${-w / 4} 14 ${-w / 2} 0t${-w / 2} 0z" fill="var(--g-biel)" opacity=".8" class="k1"/>` : "")
  + `<rect class="k" x="${x - 12}" y="${y + h + 6}" width="${w + 24}" height="8" fill="var(--g-sciana2)"/>`;
/** Drzwi. o: { typ: drewno | szklo | metal | matowa | wahadlowe, napis, kolor, klodka } */
R.drzwi = (x, y, w, h, o = {}) => { const typ = o.typ || "drewno", kol = o.kolor || (typ === "metal" ? "var(--g-metal)" : typ === "szklo" ? "var(--g-metal2)" : "var(--g-drewno)"), cx = x + w / 2;
  let s = `<rect class="k" x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 8}" fill="var(--g-sciana2)"/><rect class="k" x="${x}" y="${y}" width="${w}" height="${h}" fill="${kol}"/>`;
  if (typ === "drewno") s += `<rect class="k1 bez" x="${x + 12}" y="${y + 14}" width="${w - 24}" height="${h * 0.38}" stroke="var(--g-drewno2)"/><rect class="k1 bez" x="${x + 12}" y="${y + h * 0.52}" width="${w - 24}" height="${h * 0.4}" stroke="var(--g-drewno2)"/>`;
  if (typ === "szklo") s += `<rect class="k1" x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 60}" fill="var(--g-szklo)" opacity=".8"/>`;
  if (typ === "matowa") s += `<rect class="k1" x="${x + 12}" y="${y + 14}" width="${w - 24}" height="${h * 0.48}" fill="var(--g-biel)" opacity=".7"/>`;
  if (typ === "wahadlowe") s += `<path class="k" d="M${cx} ${y}v${h}"/><circle class="k1" cx="${cx - w / 4}" cy="${y + h * 0.3}" r="${w * 0.13}" fill="var(--g-szklo)"/><circle class="k1" cx="${cx + w / 4}" cy="${y + h * 0.3}" r="${w * 0.13}" fill="var(--g-szklo)"/>`;
  else s += `<circle class="k1" cx="${x + w - 13}" cy="${y + h * 0.55}" r="4.5" fill="var(--g-metal)"/>`;
  if (o.napis) s += R.t(cx, y + h * 0.3, o.napis, 14, { fill: typ === "matowa" ? "var(--g-czern)" : "var(--g-biel)", w: w - 26 });
  if (o.klodka) s += `<path class="k bez" d="M${cx - 9} ${y + h * 0.5}h18v16h-18zM${cx - 5} ${y + h * 0.5}v-7a5 5 0 0 1 10 0v7" stroke-width="2.5"/>`;
  return s; };
R.tabliczka = (cx, y, w, t1, t2 = "") => `<rect class="k" x="${cx - w / 2}" y="${y}" width="${w}" height="${t2 ? 46 : 30}" rx="3" fill="var(--g-tablica)"/>` + R.t(cx, y + 21, t1, 16, { fill: "var(--g-biel)", w: w - 12, ls: .8 }) + (t2 ? R.t(cx, y + 39, t2, 13, { fill: "var(--g-biel)", f: "tekst", w: w - 12, op: .9 }) : "");
/** Szyld. o: { tlo, tekst, ksztalt: prostokat | luk | wstega | owal, t2 (drugi wiersz), znak (monogram), f } */
R.szyld = (cx, y, w, h, t1, o = {}) => { const tlo = o.tlo || "var(--g-tablica)", tk = o.tekst || "var(--g-biel)", x = cx - w / 2, k = o.ksztalt || "prostokat";
  const kszt = k === "luk" ? `<path class="k3" d="M${x} ${y + 10}q${w / 2}-20 ${w} 0v${h - 10}h${-w}z" fill="${tlo}"/>` : k === "wstega" ? `<path class="k3" d="M${x + 14} ${y}h${w - 28}l14 ${h / 2}-14 ${h / 2}h${28 - w}l-14${-h / 2}z" fill="${tlo}"/>`
    : k === "owal" ? `<rect class="k3" x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${tlo}"/>` : `<rect class="k3" x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${tlo}"/>`;
  const zx = o.znak ? x + h * 0.55 + (k === "wstega" ? 8 : 0) : 0, tx = o.znak ? cx + h * 0.32 : cx, tw = w - (o.znak ? h * 1.3 : 24) - (k === "wstega" ? 20 : 0);
  return kszt + (o.znak ? `<circle cx="${zx}" cy="${y + h / 2}" r="${h * 0.3}" fill="none" stroke="${tk}" stroke-width="2"/>` + R.t(zx, y + h / 2 + h * 0.12, o.znak, h * 0.34, { fill: tk, f: "gruby" }) : "")
    + R.t(tx, y + (o.t2 ? h * 0.47 : h * 0.66), t1, o.r || h * (o.t2 ? 0.36 : 0.46), { fill: tk, f: o.f || "szyld", w: tw, ls: o.f === "gruby" ? 0 : 1 }) + (o.t2 ? R.t(tx, y + h * 0.82, o.t2, h * 0.25, { fill: tk, f: "tekst", w: tw, op: .92 }) : ""); };
R.neon = (cx, y, txt, r = 26, w) => `<g class="neon">` + R.t(cx, y, txt, r, { fill: "var(--akcent)", f: "gruby", w }) + `</g>`;
R.markiza = (x, y, w, kolor = "var(--akcent)", h = 26) => { let s = `<path class="k" d="M${x} ${y}h${w}l10 ${h}h${-w - 20}z" fill="var(--g-biel)"/>`; const n = Math.round(w / 28);
  for (let i = 0; i < n; i += 2) { const a = x + i * w / n, b = x + (i + 1) * w / n, da = (a - x - w / 2) / (w / 2) * 10, db = (b - x - w / 2) / (w / 2) * 10; s += `<path d="M${a} ${y}H${b}L${b + db} ${y + h}H${a + da}z" fill="${kolor}"/>`; }
  return s + `<path class="k bez" d="M${x} ${y}h${w}l10 ${h}h${-w - 20}z"/>`; };

// ---------- meble ----------
/** Lada: blat na wysokości y, front do y+h. o: { front, blat, panele } */
R.lada = (x, y, w, h, o = {}) => `<rect class="k" x="${x}" y="${y + 12}" width="${w}" height="${h - 12}" fill="${o.front || "var(--g-drewno2)"}"/>` + (o.panele === false ? "" : Array.from({ length: Math.max(1, Math.round(w / 90)) }, (_, i) => { const n = Math.max(1, Math.round(w / 90)); return `<rect class="k1 bez" x="${x + 10 + i * (w - 10) / n}" y="${y + 24}" width="${(w - 10) / n - 10}" height="${h - 36}" opacity=".45"/>`; }).join(""))
  + `<rect class="k" x="${x - 8}" y="${y}" width="${w + 16}" height="14" rx="3" fill="${o.blat || "var(--g-drewno)"}"/>`;
/** Szyba okienka nad ladą z półokrągłym otworem */
R.szyba = (x, y, w, h) => `<rect class="k" x="${x}" y="${y}" width="${w}" height="${h}" fill="var(--g-szklo)" opacity=".3"/><rect class="k bez" x="${x}" y="${y}" width="${w}" height="${h}"/><path class="k" d="M${x + w / 2 - 30} ${y + h}a30 20 0 0 1 60 0z" fill="var(--g-sciana)"/>`;
R.biurko = (x, y, w, h = 90, o = {}) => `<rect class="k" x="${x}" y="${y + 10}" width="${w}" height="${h - 10}" fill="${o.front || "var(--g-drewno2)"}"/><rect class="k1 bez" x="${x + 10}" y="${y + 22}" width="${w * 0.3}" height="${h - 34}"/><path class="k1" d="M${x + 10} ${y + 22 + (h - 34) / 2}h${w * 0.3}"/><rect class="k" x="${x - 8}" y="${y}" width="${w + 16}" height="12" rx="2" fill="${o.blat || "var(--g-drewno)"}"/>`;
/** Regał: ramy + półki; fn(px, py, pw, ph, nr) dorysowuje zawartość półki */
R.regal = (x, y, w, h, polki = 3, fn = null, kolor = "var(--g-drewno)") => { let s = `<rect class="k" x="${x}" y="${y}" width="${w}" height="${h}" fill="${kolor}"/>`; const ph = (h - 10) / polki;
  for (let i = 0; i < polki; i++) { const py = y + 6 + i * ph; s += `<rect class="k1" x="${x + 6}" y="${py}" width="${w - 12}" height="${ph - 6}" fill="var(--g-sciana2)"/>` + (fn ? fn(x + 8, py, w - 16, ph - 6, i) : ""); } return s; };
const KOL4 = ["var(--akcent)", "var(--g-biel)", "var(--akcent-2)", "var(--g-zielen)", "var(--g-metal2)", "var(--uwaga)"];
R.segregatory = (px, py, pw, ph, nr = 0) => Array.from({ length: Math.floor(pw / 17) }, (_, k) => `<rect class="k1" x="${px + k * 17}" y="${py + ph - (ph - 6) + ((k + nr) % 3) * 3}" width="15" height="${ph - 6 - ((k + nr) % 3) * 3}" fill="${KOL4[(k + nr * 2) % 4]}"/><rect x="${px + k * 17 + 4}" y="${py + ph - 22}" width="7" height="9" fill="var(--g-biel)" opacity=".8"/>`).join("");
R.towar = (px, py, pw, ph, nr = 0) => Array.from({ length: Math.floor(pw / 30) }, (_, k) => (k + nr) % 3 === 0 ? `<rect class="k1" x="${px + k * 30 + 3}" y="${py + ph - 30}" width="22" height="30" rx="4" fill="${KOL4[(k + nr) % 6]}"/>` : (k + nr) % 3 === 1 ? `<rect class="k1" x="${px + k * 30 + 1}" y="${py + ph - 24}" width="27" height="24" fill="${KOL4[(k * 2 + nr) % 6]}"/>` : `<path class="k1" d="M${px + k * 30 + 5} ${py + ph}v-22l6-10h6l6 10v22z" fill="${KOL4[(k + nr + 3) % 6]}"/>`).join("");
R.skrzynka = (x, y, w, h, kolor = "var(--g-drewno2)", napis = "") => `<rect class="k" x="${x}" y="${y}" width="${w}" height="${h}" fill="${kolor}"/><path class="k1" d="M${x} ${y + h / 3}h${w}M${x} ${y + 2 * h / 3}h${w}"/>` + (napis ? R.t(x + w / 2, y + h / 2 + 5, napis, Math.min(13, h * 0.3), { w: w - 8 }) : "");
/** Paleta z kartonami: n warstw, x–lewy brzeg, y–podłoga */
R.paleta = (x, y, w = 150, n = 2, kolor = "var(--g-drewno2)", napis = "") => { let s = `<path class="k" d="M${x} ${y - 12}h${w}v5h${-w}zM${x + 6} ${y - 7}h14v7h-14zM${x + w / 2 - 7} ${y - 7}h14v7h-14zM${x + w - 20} ${y - 7}h14v7h-14z" fill="var(--g-drewno)"/>`; const kw = w / 2 - 4;
  for (let i = 0; i < n; i++) for (let k = 0; k < 2; k++) s += `<rect class="k" x="${x + 3 + k * (kw + 2)}" y="${y - 12 - (i + 1) * 44}" width="${kw}" height="44" fill="${kolor}"/><path d="M${x + 3 + k * (kw + 2) + kw / 2 - 8} ${y - 12 - (i + 1) * 44}v14h16v-14" fill="var(--g-biel)" opacity=".5"/>`;
  return s + (napis ? R.t(x + w / 2, y - 12 - n * 44 + 30, napis, 12, { w: w - 10 }) : ""); };
R.sejf = (x, y, w, h) => `<rect class="k3" x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="var(--g-metal2)"/><rect class="k" x="${x + 14}" y="${y + 14}" width="${w - 28}" height="${h - 28}" rx="4" fill="var(--g-metal)"/><circle class="k3" cx="${x + w / 2}" cy="${y + h / 2}" r="${w * 0.17}" fill="var(--g-metal2)"/><path class="k3" d="M${x + w / 2} ${y + h / 2 - w * 0.17}v${w * 0.34}M${x + w / 2 - w * 0.17} ${y + h / 2}h${w * 0.34}"/><rect class="k1" x="${x + w - 30}" y="${y + h / 2 - 16}" width="8" height="32" fill="var(--g-metal2)"/>`;
R.krzeslo = (x, y, s = 1, kolor = "var(--akcent-2)") => `<g transform="translate(${x} ${y}) scale(${s})"><path class="k bez" d="M-16 0v-34M16 0v-34M-18-70v36" stroke-width="3"/><rect class="k" x="-20" y="-40" width="40" height="9" rx="3" fill="${kolor}"/><rect class="k" x="-22" y="-78" width="9" height="34" rx="3" fill="${kolor}"/></g>`;
R.lawka = (x, y, w = 160) => `<rect class="k" x="${x}" y="${y - 40}" width="${w}" height="10" rx="3" fill="var(--g-drewno2)"/><rect class="k" x="${x}" y="${y - 78}" width="${w}" height="24" rx="3" fill="var(--g-drewno2)"/><path class="k bez" d="M${x + 12} ${y}v-78M${x + w - 12} ${y}v-78" stroke-width="4"/>`;
R.telefon = (x, y, kolor = "var(--akcent)") => `<path class="k" d="M${x} ${y}h36l-6-18h-24z" fill="${kolor}"/><path class="k" d="M${x - 4} ${y - 22}q22-12 44 0v6h-10v-4h-24v4h-10z" fill="${kolor}"/><circle class="k1" cx="${x + 18}" cy="${y - 8}" r="5" fill="var(--g-biel)"/>`;
R.maszyna = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect class="k" x="-6" y="-44" width="52" height="26" fill="var(--g-biel)"/><path class="k" d="M-16 0h72l-8-26h-56z" fill="var(--g-metal2)"/><rect class="k" x="-22" y="-32" width="84" height="8" rx="4" fill="var(--g-czern)"/>`
  + [0, 1, 2].map((r) => Array.from({ length: 7 - r }, (_, i) => `<circle cx="${-6 + i * 9 + r * 4}" cy="${-6 - r * 6}" r="2.6" fill="var(--g-biel)" class="k1"/>`).join("")).join("") + `</g>`;
R.stemple = (x, y) => `<rect class="k" x="${x}" y="${y - 8}" width="38" height="8" fill="var(--akcent-2)"/>` + [0, 1].map((i) => `<path class="k" d="M${x + 46 + i * 20} ${y}h14v-8h-4v-14a3 5 0 0 0-6 0v14h-4z" fill="var(--g-drewno)"/>`).join("");
R.papiery = (x, y, n = 3) => Array.from({ length: n }, (_, i) => `<rect class="k1" x="${x + i * 3}" y="${y - 5 - i * 4}" width="44" height="5" fill="var(--g-biel)"/>`).join("");
R.teczki = (x, y, n = 3) => Array.from({ length: n }, (_, i) => `<rect class="k1" x="${x - i * 2}" y="${y - 7 - i * 7}" width="54" height="7" fill="${KOL4[(i * 3 + 5) % 6 === 1 ? 3 : (i + 5) % 6]}"/>`).join("");
R.waga = (x, y) => `<path class="k" d="M${x} ${y}h60l-8-16h-44z" fill="var(--g-metal2)"/><rect class="k" x="${x + 6}" y="${y - 24}" width="48" height="8" fill="var(--g-metal)"/><path class="k" d="M${x + 30} ${y - 24}v-34" /><circle class="k" cx="${x + 30}" cy="${y - 66}" r="14" fill="var(--g-biel)"/><path d="M${x + 30} ${y - 66}l7-8" stroke="var(--akcent)" stroke-width="2.5"/>`;
R.monitor = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect class="k" x="0" y="-52" width="62" height="42" rx="3" fill="var(--g-czern)"/><rect x="6" y="-46" width="50" height="30" fill="var(--g-szklo)"/><path class="k" d="M24-10h14v8h10v4h-34v-4h10z" fill="var(--g-metal2)"/></g>`;
// ---------- sklepy i hurtownie ----------
const KART = ["var(--g-drewno2)", "var(--g-biel)", "var(--g-sciana2)"];
/** Regał paletowy (hurt): stalowe słupy, belki, palety z kartonami na każdym poziomie, tablica działu nad regałem */
R.regalPaletowy = (x, y, w, h, poziomy = 3, napis = "", kol = 0) => { let s = ""; const ph = h / poziomy, n = Math.max(1, Math.floor((w - 12) / 84)), pw = (w - 12) / n;
  for (let i = 0; i < poziomy; i++) { const by = y + (i + 1) * ph; for (let k = 0; k < n; k++) s += R.paleta(x + 8 + k * pw, by - 8, pw - 6, ph >= 112 ? 2 : 1, KART[(k + i + kol) % 3]); s += `<rect class="k" x="${x}" y="${by - 8}" width="${w}" height="8" fill="var(--uwaga)"/>`; }
  return s + `<rect class="k" x="${x - 6}" y="${y}" width="9" height="${h}" fill="var(--akcent-2)"/><rect class="k" x="${x + w - 3}" y="${y}" width="9" height="${h}" fill="var(--akcent-2)"/>` + (napis ? R.tabliczka(x + w / 2, y - 36, Math.min(w, 230), napis) : ""); };
/** Regał sklepowy z tablicą działu u góry (kolor tablicy = marka sklepu) */
R.regalSklepowy = (x, y, w, h, polki = 3, napis = "", kolor = "var(--g-tablica)", tk = "var(--g-biel)") => `<rect class="k" x="${x}" y="${y - 30}" width="${w}" height="30" fill="${kolor}"/>` + R.t(x + w / 2, y - 9, napis, 16, { fill: tk, w: w - 14, ls: 1 }) + R.regal(x, y, w, h, polki, R.towar, "var(--g-metal)");
/** Rampa: brama rolowana podniesiona do połowy, w środku tył ciężarówki, pasy ostrzegawcze */
R.rampa = (x, y, w, h, napis = "") => { let s = `<rect class="k3" x="${x}" y="${y}" width="${w}" height="${h}" fill="var(--g-czern)"/>`;
  for (let i = 0; i < 5; i++) s += `<rect class="k1" x="${x}" y="${y + i * 12}" width="${w}" height="12" fill="var(--g-metal)"/>`;
  s += `<rect class="k" x="${x + w * 0.14}" y="${y + 76}" width="${w * 0.72}" height="${h - 96}" fill="var(--g-biel)"/><path class="k" d="M${x + w / 2} ${y + 76}v${h - 96}"/><rect class="k1" x="${x + w * 0.2}" y="${y + h - 20}" width="18" height="10" fill="var(--strata)"/><rect class="k1" x="${x + w * 0.8 - 18}" y="${y + h - 20}" width="18" height="10" fill="var(--strata)"/>`;
  for (let i = 0; i < Math.floor(w / 24); i++) s += `<path d="M${x + i * 24} ${y + h}l12-10h12l-12 10z" fill="var(--uwaga)"/>`;
  return s + `<path class="k bez" d="M${x} ${y + h}h${w}"/>` + (napis ? R.tabliczka(x + w / 2, y - 40, Math.min(w + 20, 230), napis) : ""); };
R.zamrazarka = (x, y, w, napis = "") => `<rect class="k" x="${x}" y="${y - 70}" width="${w}" height="70" rx="5" fill="var(--g-biel)"/><path class="k" d="M${x + 6} ${y - 70}l10-12h${w - 32}l10 12z" fill="var(--g-szklo)" opacity=".8"/><path class="k1" d="M${x + w / 2} ${y - 82}v12"/><rect x="${x + 8}" y="${y - 22}" width="${w - 16}" height="6" fill="var(--akcent-2)"/>` + (napis ? R.t(x + w / 2, y - 36, napis, 13, { fill: "var(--g-czern)", w: w - 12 }) : "");
R.cenowka = (x, y, cena, w = 54) => `<rect class="k1" x="${x}" y="${y}" width="${w}" height="22" fill="var(--uwaga)" transform="rotate(-3 ${x + w / 2} ${y + 11})"/>` + R.t(x + w / 2, y + 16.5, cena, 13, { fill: "var(--g-czern)", f: "gruby", w: (w - 6) * 0.82, extra: `transform="rotate(-3 ${x + w / 2} ${y + 11})"` });
/** Kosz druciany z okazjami + żółta cenówka */
R.koszOkazji = (x, y, w, napis = "OKAZJA") => `<path class="k" d="M${x} ${y - 56}h${w}l-8 56h${16 - w}z" fill="var(--g-metal)" opacity=".6"/>` + Array.from({ length: Math.floor(w / 14) }, (_, i) => `<path d="M${x + 6 + i * 14} ${y - 56}l${i * 14 < w / 2 ? 3 : -3} 54" stroke="var(--tusz)" opacity=".5"/>`).join("")
  + Array.from({ length: Math.floor(w / 26) }, (_, i) => `<rect class="k1" x="${x + 6 + i * 26}" y="${y - 74 - (i % 2) * 8}" width="22" height="22" fill="${KOL4[i % 4]}"/>`).join("") + R.cenowka(x + w / 2 - 34, y - 112, napis, 68);
R.wozekPlatf = (x, y) => `<rect class="k" x="${x}" y="${y - 22}" width="150" height="10" fill="var(--g-metal2)"/><circle class="k" cx="${x + 22}" cy="${y - 7}" r="7" fill="var(--g-czern)"/><circle class="k" cx="${x + 128}" cy="${y - 7}" r="7" fill="var(--g-czern)"/><path class="k bez" d="M${x + 150} ${y - 22}v-84h-14" stroke-width="4"/>`
  + `<rect class="k" x="${x + 8}" y="${y - 62}" width="60" height="40" fill="var(--g-drewno2)"/><rect class="k" x="${x + 70}" y="${y - 56}" width="56" height="34" fill="var(--g-biel)"/><rect class="k" x="${x + 26}" y="${y - 94}" width="60" height="32" fill="var(--g-sciana2)"/>`;
/** Stos skrzynek z warzywami: n skrzynek w pionie */
R.skrzynki = (x, y, n = 3, w = 86) => Array.from({ length: n }, (_, i) => `<rect class="k" x="${x + (i % 2) * 4}" y="${y - (i + 1) * 30}" width="${w}" height="30" fill="var(--g-drewno2)"/><path class="k1" d="M${x + (i % 2) * 4} ${y - (i + 1) * 30 + 15}h${w}"/>`).join("")
  + Array.from({ length: Math.floor(w / 16) }, (_, i) => `<circle class="k1" cx="${x + 12 + i * 16 + ((n - 1) % 2) * 4}" cy="${y - n * 30 - 3}" r="8" fill="${[KOL4[3], KOL4[0], "var(--uwaga)"][i % 3]}"/>`).join("");
R.zgrzewki = (x, y, kolumny = 3, rzedy = 3, kolor = "var(--akcent-2)") => Array.from({ length: rzedy }, (_, r) => Array.from({ length: kolumny }, (_, k) => `<rect class="k" x="${x + k * 52}" y="${y - (r + 1) * 36}" width="50" height="36" rx="3" fill="${(r + k) % 2 ? kolor : "var(--g-szklo)"}"/>` + [0, 1, 2].map((i) => `<circle cx="${x + k * 52 + 11 + i * 14}" cy="${y - (r + 1) * 36 + 9}" r="4.5" fill="var(--g-biel)" class="k1"/>`).join("")).join("")).join("");
/** Lada chłodnicza z szybą: w środku miski (surówki) albo tace (mięso) */
R.ladaChlodnicza = (x, y, w, h = 110, miski = true) => `<rect class="k" x="${x}" y="${y + 40}" width="${w}" height="${h - 40}" fill="var(--g-biel)"/><path class="k" d="M${x} ${y + 40}v-28q0-12 14-12h${w - 14}v40z" fill="var(--g-szklo)" opacity=".75"/><rect x="${x + 6}" y="${y + h - 16}" width="${w - 12}" height="6" fill="var(--akcent-2)"/>`
  + Array.from({ length: Math.floor((w - 20) / 46) }, (_, i) => miski ? `<path class="k1" d="M${x + 14 + i * 46} ${y + 26}h36l-5 12h-26z" fill="${[KOL4[3], KOL4[0], "var(--uwaga)", "var(--g-biel)"][i % 4]}"/>` : `<rect class="k1" x="${x + 14 + i * 46}" y="${y + 22}" width="36" height="14" fill="var(--g-mieso)"/>`).join("");
R.alejka = (x, y, nr, txt, w = 150) => `<path class="k1" d="M${x + 20} 0v${y}M${x + w - 20} 0v${y}"/><rect class="k" x="${x}" y="${y}" width="${w}" height="40" fill="var(--g-biel)"/><rect class="k" x="${x}" y="${y}" width="40" height="40" fill="var(--akcent)"/>` + R.t(x + 20, y + 29, nr, 24, { fill: "var(--papier)", f: "gruby" }) + R.t(x + 40 + (w - 40) / 2, y + 26, txt, 15, { fill: "var(--g-czern)", w: w - 50 });
R.widlak = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path class="k" d="M0-28h96v-30h-36l-10-34h-40v64z" fill="var(--uwaga)"/><path class="k bez" d="M14-92v-20h44l6 20" stroke-width="4"/><circle class="k" cx="22" cy="-14" r="15" fill="var(--g-czern)"/><circle class="k" cx="80" cy="-14" r="12" fill="var(--g-czern)"/><path class="k" d="M100-124v124M108-124v124" stroke-width="4"/><path class="k" d="M108-10h62v6h-62z" fill="var(--g-metal2)"/></g>`;
R.KOL = KOL4;

// ---------- teczki sklepów i hurtowni: klik otwiera okienko tego sklepu (zakladki/dostawcy.js: otworzSklep) z jego ofertą ----------
// `dostawca` – scena (nazwa sklepu bierze się z tytułu sceny), `dzialy` – działy z tej alejki, `widok` – dział | koszyk | dowóz | gazetka.
// `ekran` zostaje tylko po to, by gra wiedziała, czy funkcja zaopatrzenia jest dostępna (punkt zamknięty/wyłączony razem z nią).
const ZAMOWIENIA = { ekran: "zaop_dostawy", funkcja: "zaopatrzenie", decyzje: ["zamowienia"] };
R.zamow = (id, dzialy, okruszek) => ({ tytul: `Zamów: ${[].concat(dzialy).join(", ").toLowerCase()}`, okruszek, dostawca: id, dzialy: [].concat(dzialy), widok: "dzial", ...ZAMOWIENIA });
R.koszyk = (id, okruszek = "kasa") => ({ tytul: "Koszyk tygodnia", okruszek, dostawca: id, widok: "koszyk", ...ZAMOWIENIA });
R.dowoz = (id, okruszek = "rampa") => ({ tytul: "Dowóz do lokalu", okruszek, dostawca: id, widok: "dowoz", ...ZAMOWIENIA });
R.gazetka = (id) => ({ tytul: "Gazetka tygodnia", okruszek: "stojak z gazetką", dostawca: id, widok: "gazetka", ...ZAMOWIENIA });
