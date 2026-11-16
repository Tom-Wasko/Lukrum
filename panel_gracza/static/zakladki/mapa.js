// Mapa Lublina (M1–M6): schematyczne miasto w lekkiej izometrii – strefy, drogi, Bystrzyca, punkty orientacyjne,
// budynki i lokale; warstwy (czynsze, popyt, konkurencja, opinie), ruch, pora dnia według zegara, przybliżanie.
// Kliknięcie budynku otwiera jego zakładkę, lokalu – opis i najem/kupno, własnego lokalu – zakładki firmy.
import { esc, kolorFirmy, licz, marka, nazwaFirmy, okno, toast, zamknijOkno } from "./wspolne.js";
import { nazwaStrefy, opisLokalu, przyciskiLokalu, wybranyLokal } from "./lokale.js";
import { AKCJE_ZDARZEN, oknoParku, parkiNaMapie, parkiZeSprawa } from "./zdarzenia.js";
import { drzewa, geometria, kostka, latarnie, maskaTuneli, miejsce, pkt, polnocStopni, scianyTuneli, poraDnia, romb, ruch, tabliceObwodnicy, teren } from "./mapa_teren.js";
import { budynekProsty, lokalBudynek, rysujBudynek, trasyMiasta, zabudowa, zbiornik } from "./mapa_budynki.js";
import { uruchomPojazdy } from "./mapa_pojazdy.js";
import { zastosujUklad } from "./mapa_uklad.js";
import { wylaczona } from "./funkcje.js";
import { nowaMapa } from "../mapa/lublin.js";

const BUDYNKI = {  // rodzaj → kolor w legendzie (wygląd budynków: mapa_budynki.js)
  bank: ["#2d73d6", 30], urzad: ["#9b51e0", 40], poczta: ["#f2b705", 22], biuro: ["#17a2b8", 26], nieruchomosci: ["#e5333f", 24],
  praca: ["#795548", 24], dostawca: ["#c0703a", 18], sklep: ["#5c6bc0", 20], szkola: ["#26a69a", 26], reklama: ["#ec407a", 22],
  uczelnia: ["#3f51b5", 34], media: ["#455a64", 28], lichwiarz: ["#3b2f2f", 16],
  ubezpieczenia: ["#43a047", 26], detektyw: ["#5d4037", 18], gielda: ["#131722", 36],
};
// widok 2D: ikonka rodzaju budynku na dachu
const IKONY = { bank: "🏦", urzad: "🏛", poczta: "✉", biuro: "📊", nieruchomosci: "🏠", praca: "👷", dostawca: "🚚", sklep: "🛒",
  szkola: "🎓", reklama: "📣", uczelnia: "🎓", media: "📰", lichwiarz: "💰", ubezpieczenia: "🛡", detektyw: "🔍", gielda: "📈" };
const LOKAL = { moj: "#1e9e5a", wybrany: "#e45f26", wolny: "#ffffff", zajety: "#9aa0a8" };
const FIRMA = ["oferta", "stanowiska", "sprzet", "zatrudnienie", "sprzedaz", "kpir"];

// --- ustawienia widoku (tylko w tej przeglądarce) ---
const KLUCZ = "lukrum-mapa";
const WARSTWY = { "": "Strefy", czynsze: "Czynsze", popyt: "Popyt", konkurencja: "Konkurencja" };
const bezRuchu = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const UST = (() => {
  const u = { warstwa: "", opinie: true, ruch: !bezRuchu(), plaska: false, nowa: true };   // plaska – widok 2D z góry; nowa – mapa z OSM (static/mapa/)
  try { Object.assign(u, JSON.parse(localStorage.getItem(KLUCZ) || "{}")); } catch { /* prywatne okno – domyślne */ }
  if (!(u.warstwa in WARSTWY)) u.warstwa = "";
  return u;
})();
const zapiszUst = () => { try { localStorage.setItem(KLUCZ, JSON.stringify(UST)); } catch { /* bez zapisu */ } };

// decyzja autora 8.11.2026: na razie na mapie zawsze dzień (noc z zegara gracza wyłączona, kod zostaje)
const ZAWSZE_DZIEN = true;
const poraTeraz = (M) => {
  const p = poraDnia(M);
  return ZAWSZE_DZIEN ? { ...p, ciemnosc: 0, nazwa: "dzień", ikona: "☀" } : p;
};
const NOC = 0.7;    // krycie niebieskiej nakładki w środku nocy (mnożenie kolorów) – mapa ma zostać czytelna
const NOC_KOLOR = [0x2a, 0x42, 0x90];
// to samo przyciemnienie dla budynków jako macierz filtru (budynki stoją nad poświatą dróg, więc nie mogą
// leżeć pod nakładką): kanał × (1 − a + a·kolor)
const nocMacierz = (ciemnosc) => {
  const a = NOC * ciemnosc, [r, g, b] = NOC_KOLOR.map((k) => (1 - a + a * k / 255).toFixed(3));
  return `${r} 0 0 0 0 0 ${g} 0 0 0 0 0 ${b} 0 0 0 0 0 1 0`;
};

// ostatnio narysowana mapa: geometria i trasy dla pętli pojazdów 3D (uruchamianej po wstawieniu SVG)
let OSTATNIA = null;

// przybliżenie i przesunięcie – viewBox mapy, zostaje między rysowaniami zakładki
const WIDOK = { vb: null, baza: null };

const ocena = (x) => x.toFixed(1).replace(".", ",");

function liczbaOpinii(n) {
  const r10 = n % 10, r100 = n % 100;
  return `${n} ${n === 1 ? "opinia" : r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14) ? "opinie" : "opinii"}`;
}

/** Ciemny odcień tego samego koloru (ten sam odcień, jasność 30%) – czytelne nazwy dzielnic w ich kolorze. */
function ciemny(hex) {
  const n = parseInt(hex.slice(1), 16), [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  const h = !d ? 0 : mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return `hsl(${Math.round(h * 60)} ${d ? 70 : 0}% 30%)`;
}

function kebaby(n) {
  const r10 = n % 10, r100 = n % 100;
  return `${n} ${n === 1 ? "kebab" : r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14) ? "kebaby" : "kebabów"}`;
}

/** U24: ocena klientów i ostatnie komentarze przy lokalu (okno lokalu na mapie). */
function opinieHtml(op) {
  if (!op) return "";
  const gw = (n) => "★".repeat(n) + "☆".repeat(5 - n);
  return `<div class="opinie"><p><b class="gwiazdki">★ ${ocena(op.ocena)}</b> / 5 · ${liczbaOpinii(op.liczba)} klientów</p>`
    + (op.komentarze || []).map((k) => `<blockquote><span class="gwiazdki">${gw(k.gwiazdki)}</span> „${esc(k.tekst)}”<br><small>– ${esc(k.podpis)}</small></blockquote>`).join("")
    + `</div>`;
}

function budynek(g, b, sprawa = false) {
  const { x, y, szer: s, gl: l } = b.mapa;
  const tytul = `<title>${esc(b.nazwa)} – ${esc(b.opis)}</title>`;
  let ksztalt;
  if (g.prosty && g.plaski) {   // 2D: płytka w kolorze rodzaju z ikonką; parki i woda – tylko pole do kliknięcia
    const [kolor, wys] = BUDYNKI[b.rodzaj] || ["#8a929c", 20], h = Math.round(wys * 0.6), [a, c] = g.p(x + s / 2, y + l / 2, h);
    ksztalt = ["park", "woda"].includes(b.rodzaj) ? `<polygon points="${pkt(romb(g, x, y, s, l))}" fill="transparent"/>`
      : kostka(g, x + 0.14, y + 0.14, s - 0.28, l - 0.28, h, kolor)
        + `<text x="${a}" y="${c + 4}" text-anchor="middle" font-size="11">${IKONY[b.rodzaj] || ""}</text>`;
  }
  // parki i woda leżą w terenie (mapa_teren.js) – tu tylko drzewa i pole do kliknięcia
  else if (b.rodzaj === "park") ksztalt = `<polygon points="${pkt(romb(g, x, y, s, l))}" fill="transparent"/>` + drzewa(g, x, y, s, l);
  else if (b.rodzaj === "woda") ksztalt = `<polygon points="${pkt(romb(g, x + 0.2, y + 0.2, s - 0.4, l - 0.4))}" fill="transparent"/>` + zbiornik(g, b, UST.ruch);
  else {
    // styl prosty w 3D: zabawkowa bryła w kolorze rodzaju; inaczej pełny wygląd (kamienice z attyką, banki, hale…)
    ksztalt = g.prosty && BUDYNKI[b.rodzaj] ? budynekProsty(g, b, ...BUDYNKI[b.rodzaj], IKONY[b.rodzaj]) : rysujBudynek(g, b);
  }
  if (sprawa) {   // UF13: w parku coś się dzieje w tej rundzie
    const [a, c] = g.p(x + s / 2, y + l / 2, 30);
    ksztalt += `<circle cx="${a}" cy="${c}" r="9" fill="#e45f26" stroke="#fff" stroke-width="2"/>`
      + `<text x="${a}" y="${c + 4}" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">!</text>`;
  }
  // dymek po najechaniu: ikonka w kolorze rodzaju i podpowiedź, co da kliknięcie
  const ikona = b.rodzaj === "park" ? "🌳" : b.rodzaj === "woda" ? "💧" : IKONY[b.rodzaj] || "🏢";
  const rada = b.zakladka === "zdarzenia" ? "Kliknij, żeby zobaczyć, co dzieje się w parku"
    : b.zakladka ? "Kliknij, żeby przejść do jego zakładki" : "Kliknij, żeby przeczytać więcej";
  const dane = `data-ikona="${ikona}" data-kolor="${BUDYNKI[b.rodzaj]?.[0] || (b.rodzaj === "woda" ? "#5aa6d2" : "#5aa955")}" data-rada="${rada}"`;
  return { klucz: g.glebia(x + s, y + l), html: `<g class="klik" data-akcja="mapa-budynek" data-id="${esc(b.id)}" ${dane}>${tytul}${ksztalt}</g>` };
}

function lokal(g, v, d, kat, lok) {
  const { x, y } = lok.mapa;
  const moje = (v.lokale.moje || []).find((l) => l.id === lok.id);
  const wyb = wybranyLokal(d)?.id === lok.id;
  const kto = v.lokale.zajete[lok.id];
  const stan = moje ? (wyb ? "wybrany" : "moj") : kto ? "zajety" : "wolny";
  // N12: lokal firmy – w stałym kolorze drużyny (Twój także, z ciemną obwódką znaku)
  const kolor = stan === "zajety" ? marka(v, kto).kolor : moje ? kolorFirmy(v, v.firma) : LOKAL[stan];
  const ktoNapis = moje ? (wyb ? "wybrany przez Ciebie w tej rundzie" : "Twój lokal") : kto ? `zajęty: ${nazwaFirmy(v, kto)}` : "wolny";
  const op = (v.lokale.opinie || {})[lok.id];
  const tytul = `<title>${esc(lok.nazwa)} (${esc(nazwaStrefy(kat, lok.strefa))}) – ${esc(ktoNapis)}${op ? ` – ★ ${ocena(op.ocena)} (${liczbaOpinii(op.liczba)})` : ""}</title>`;
  let ksztalt;
  if (g.prosty && g.plaski) {   // 2D: płytka w kolorze stanu albo firmy (wolny – biała, przerywany brzeg), kebab pośrodku
    const pusty = stan === "wolny" || (lok.typ === "dzialka" && moje && !moje.dziala), h = pusty ? 3 : 12;
    ksztalt = kostka(g, x + 0.1, y + 0.1, 0.8, 0.8, h, pusty ? "#ffffff" : kolor, { cien: !pusty, obrys: pusty ? "#8a929c" : undefined, przerywany: pusty });
  } else if (lok.typ === "dzialka" && (stan === "wolny" || (moje && !moje.dziala))) {
    ksztalt = `<polygon points="${pkt(romb(g, x + 0.1, y + 0.1, 0.8, 0.8))}" fill="${stan === "wolny" ? "#e2cc9c" : kolor}"
      stroke="#9c7d45" stroke-dasharray="3 2" stroke-width="1.1"/>`;
  } else {
    const wBudowie = !!(moje && !moje.dziala);
    ksztalt = lokalBudynek(g, x + 0.2, y + 0.2, { h: wBudowie ? 8 : 18, kolor, wolny: stan === "wolny", wBudowie });
  }
  // M11: podkład i pinezka z kebabem nad każdym lokalem – lokale widać z daleka (kolor: stan albo firma)
  const pin = stan === "wolny" ? "#ffffff" : kolor;
  const pod = `<polygon points="${pkt(romb(g, x + 0.05, y + 0.05, 0.9, 0.9))}" fill="${stan === "wolny" ? "#ffffff" : kolor}" fill-opacity=".5" stroke="${stan === "wolny" ? "#8a929c" : kolor}" stroke-width="1.8" stroke-dasharray="${stan === "wolny" ? "3 2" : "none"}"/>`;
  const [pa, pb] = g.p(x + 0.5, y + 0.5, lok.typ === "dzialka" && (stan === "wolny" || (moje && !moje.dziala)) ? 4 : 18);
  // wyraźny znak kebaba: duże kółko w kolorze stanu albo firmy z 🥙, biała obwódka; Twój i wybrany lokal – pulsująca
  // aureola (gdy ruch włączony); w 3D na szpilce wbitej w dach, w 2D na środku płytki
  const plasko = g.prosty && g.plaski, R = plasko ? 9 : 10, [sa, sb] = plasko ? g.p(x + 0.5, y + 0.5) : [pa, pb - 22];
  const puls = (stan === "moj" || stan === "wybrany") && UST.ruch
    ? `<circle r="${R}" fill="none" stroke="${kolor}" stroke-width="2.5"><animate attributeName="r" values="${R};${R + 8}" dur="1.6s" repeatCount="indefinite"/>`
      + `<animate attributeName="opacity" values=".8;0" dur="1.6s" repeatCount="indefinite"/></circle>` : "";
  let znacznik = (plasko ? "" : `<ellipse cx="${pa}" cy="${pb}" rx="4" ry="2" fill="#1b2433" opacity=".25"/>`
      + `<line x1="${pa}" y1="${pb}" x2="${pa}" y2="${sb + R - 1}" stroke="#4b3a66" stroke-width="1.6" stroke-linecap="round"/>`)
    + `<g transform="translate(${sa.toFixed(1)} ${sb.toFixed(1)})" class="lokal-pin">${puls}`
    + `<circle r="${R}" fill="${pin}" stroke="${stan === "wolny" ? "#5f6b7a" : moje ? "#111" : "#ffffff"}" stroke-width="2"/>`
    + `<text y="${(R * 0.42).toFixed(1)}" text-anchor="middle" font-size="${(R * 1.25).toFixed(1)}"${stan === "wolny" ? ` opacity=".6"` : ""}>🥙</text></g>`;
  if (op && UST.opinie) {   // U24: ocena klientów nad znakiem kebaba
    const [a, b] = [sa, sb - R - 3];
    znacznik += `<text x="${a}" y="${b}" text-anchor="middle" class="ocena-napis">★${ocena(op.ocena)}</text>`;
  }
  // po zmroku działające lokale świecą (warstwa świateł – patrz rysujMape)
  const swieci = (moje && moje.dziala) || (!moje && kto);
  return { klucz: g.glebia(x + 1, y + 1), swieci, x, y, html: `<g class="klik lokal-${stan}" data-akcja="mapa-lokal" data-id="${esc(lok.id)}" data-ikona="🥙" data-kolor="${stan === "wolny" ? "#8a929c" : kolor}" data-rada="${
    stan === "wolny" ? "Kliknij, żeby wynająć albo kupić" : moje ? "Kliknij, żeby nim zarządzać" : "Kliknij, żeby obejrzeć lokal i opinie"}">${tytul}${g.prosty && g.plaski ? "" : pod}${ksztalt}${znacznik}</g>` };
}

// --- warstwy: wartość strefy → kolor od jasnego do czerwonego i napis na strefie ---
function wartosciWarstwy(c) {
  const { v, kat } = c, M = kat.mapa;
  if (UST.warstwa === "czynsze") {
    return Object.fromEntries(Object.entries(M.strefy).map(([k, s]) => [k, s.czynsz_m2 != null ? [s.czynsz_m2, `${licz(s.czynsz_m2)} zł/m²`] : null]));
  }
  if (UST.warstwa === "popyt") {
    const P = v.popyt?.strefy || {};
    return Object.fromEntries(Object.keys(M.strefy).map((k) => [k, P[k] ? [P[k].pula, `${licz(P[k].pula)} klientów / tydz.`] : null]));
  }
  if (UST.warstwa === "konkurencja") {
    const n = Object.fromEntries(Object.keys(M.strefy).map((k) => [k, 0]));
    const zajete = new Set([...Object.keys(v.lokale?.zajete || {}), ...(v.lokale?.moje || []).map((l) => l.id)]);
    for (const lok of M.lokale) if (zajete.has(lok.id)) n[lok.strefa] += 1;
    return Object.fromEntries(Object.entries(n).map(([k, x]) => [k, [x, kebaby(x)]]));
  }
  return null;
}

const SKALA = [[247, 244, 217], [246, 178, 75], [217, 67, 43]];
function barwa(t) {
  const i = t < 0.5 ? 0 : 1, u = t < 0.5 ? t * 2 : (t - 0.5) * 2;
  return `rgb(${SKALA[i].map((a, j) => Math.round(a + (SKALA[i + 1][j] - a) * u)).join(",")})`;
}

function zakres(wart) {
  const liczby = Object.values(wart).filter(Boolean).map(([x]) => x);
  return liczby.length ? [Math.min(...liczby), Math.max(...liczby)] : [0, 0];
}

/** Udział popytu stref (0–1 względem największej) – gęstość pieszych. */
function udzialyPopytu(c) {
  const P = c.v.popyt?.strefy || c.kat.mapa.popyt?.strefy || {};
  const max = Math.max(1e-9, ...Object.values(P).map((s) => s.pula || 0));
  return Object.fromEntries(Object.entries(P).map(([k, s]) => [k, (s.pula || 0) / max]));
}

// funkcje gry: budynki wyłączonych funkcji (bank Harpagona, giełda…) znikają z mapy – pole zabudowuje dzielnica
const budynkiGry = (v, budynki) => budynki.filter((b) => !b.zakladka || !wylaczona(v, b.zakladka));

function rysujMape(c) {
  const { v, kat, d } = c;
  const M0 = zastosujUklad(kat.mapa), M = { ...M0, budynki: budynkiGry(v, M0.budynki) }, mi = M.miasto, g = geometria(M.siatka, mi?.margines || 0, UST.plaska);   // M11: wygląd z uklad
  const wart = wartosciWarstwy(c), [lo, hi] = wart ? zakres(wart) : [0, 0];
  const kolorStrefy = (k, s) => !wart ? s.kolor : wart[k] ? barwa(hi > lo ? (wart[k][0] - lo) / (hi - lo) : 0.5) : "#e3e3e3";
  const pora = poraTeraz(M);
  let napisy = "";
  for (const [k, s] of Object.entries(M.strefy)) {
    const { x, y, szer, gl } = s.mapa, [sx, sy] = s.srodek || [x + szer / 2, y + gl / 2];
    const [a, b] = s.srodek ? g.p(sx + 0.5, sy + 0.5) : g.p(x + szer / 2, y + gl);
    // nazwa w ciemnym odcieniu koloru dzielnicy (przy warstwach – szara, bo kolory stref znaczą wtedy co innego)
    napisy += `<text x="${a}" y="${b - 5}" class="strefa-napis"${wart ? "" : ` style="fill:${ciemny(s.kolor)}"`}>${esc(s.nazwa)}</text>`;
    if (wart) {
      const [ax, by] = g.p(sx, sy);
      const tekst = wart[k] ? wart[k][1] : "brak danych";
      const pol = tekst.length * 2.9 + 8;   // pigułka z wartością, zmniejszana przy przybliżeniu (styl.css: --zn)
      napisy += `<g transform="translate(${ax.toFixed(1)} ${by.toFixed(1)})"><g class="warstwa-napis"><rect x="${-pol}" y="-9" width="${2 * pol}" height="18" rx="9"/>`
        + `<text y="3.5" text-anchor="middle">${esc(tekst)}</text></g></g>`;
    }
  }
  const sprawy = parkiZeSprawa(v);
  const obiekty = M.budynki.map((b) => budynek(g, b, sprawy.has(b.id)));
  obiekty.push(...(mi?.miejsca || []).map((m) => miejsce(g, m)));
  const lokale = v.lokale ? M.lokale.filter((l) => (l.od_rundy || 1) <= v.runda && (!v.lokale.na_mapie || v.lokale.na_mapie.includes(l.id))).map((l) => lokal(g, v, d, kat, l)) : [];
  obiekty.push(...lokale);
  // wolne pola: zabudowa dzielnic (bloki, kamienice, domki…) – pola budynków, zabytków i wszystkich lokali zostają wolne
  const zajete = new Set();
  for (const o of [...M.budynki, ...(mi?.miejsca || []), ...M.lokale]) {
    const { x, y, szer = 1, gl = 1 } = o.mapa;
    for (let i = 0; i < szer; i++) for (let j = 0; j < gl; j++) zajete.add(`${x + i},${y + j}`);
  }
  obiekty.push(...zabudowa(g, M, zajete), ...scianyTuneli(g, M));   // 3D: ściany czołowe tuneli
  obiekty.sort((a, b) => a.klucz - b.klucz);
  const okna = lokale.filter((l) => l.swieci).map((l) => { const [a, b] = g.p(l.x + 0.5, l.y + 0.5, 12); return `<circle cx="${a}" cy="${b}" r="14" fill="url(#mapa-blask-okna)"/>`; }).join("")
    + (mi?.miejsca || []).filter((m) => !["gorki", "lotnisko", "plac"].includes(m.ksztalt)).map((m) => {
      const [a, b] = g.p(m.mapa.x + m.mapa.szer / 2, m.mapa.y + m.mapa.gl / 2, 14); return `<circle cx="${a}" cy="${b}" r="18" fill="url(#mapa-blask-okna)"/>`;
    }).join("");
  const ruchHtml = UST.ruch && mi ? ruch(g, M, pora.natezenie, udzialyPopytu(c)) : "";
  OSTATNIA = { g, trasy: mi ? trasyMiasta(mi, g.siatka, g.mg).drogi : [], natezenie: pora.natezenie };   // dla pojazdów 3D (po)
  WIDOK.baza = [0, 0, g.szer, g.wys];
  if (!WIDOK.vb || WIDOK.vb.zrodlo !== `${g.szer}x${g.wys}`) WIDOK.vb = Object.assign([0, 0, g.szer, g.wys], { zrodlo: `${g.szer}x${g.wys}`, nowy: true });
  const vb = WIDOK.vb.map((n) => n.toFixed(1)).join(" ");
  return `<svg class="mapa-svg${wart ? " warstwa" : ""}${UST.ruch ? "" : " bez-ruchu"}" id="mapa-svg" viewBox="${vb}" role="img" aria-label="Mapa Lublina"
      style="aspect-ratio:${g.szer}/${g.wys}">
    <defs><filter id="mapa-noc-budynki" color-interpolation-filters="sRGB"><feColorMatrix id="mapa-noc-macierz" type="matrix" values="${nocMacierz(pora.ciemnosc)}"/></filter>
      <filter id="mapa-rozmycie" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation=".25"/></filter>
      <radialGradient id="mapa-blask-okna"><stop offset="0" stop-color="#ffd36b" stop-opacity=".75"/><stop offset="1" stop-color="#ffd36b" stop-opacity="0"/></radialGradient>
      ${maskaTuneli(g, M)}</defs>
    <g transform="${g.macierz}">${teren(g, M, kolorStrefy)}<g class="mapa-ruch">${ruchHtml}</g></g>
    <g id="mapa-pojazdy" pointer-events="none"></g>
    <rect id="mapa-noc" x="-2000" y="-2000" width="${g.szer + 4000}" height="${g.wys + 4000}" fill="rgb(${NOC_KOLOR})" opacity="${(NOC * pora.ciemnosc).toFixed(3)}" style="mix-blend-mode:multiply" pointer-events="none"/>
    <g class="mapa-swiatla" opacity="${pora.ciemnosc.toFixed(3)}" style="mix-blend-mode:screen" pointer-events="none"><g transform="${g.macierz}">${latarnie(M)}</g></g>
    <g ${pora.ciemnosc > 0 ? 'filter="url(#mapa-noc-budynki)"' : ""} id="mapa-budynki">${obiekty.map((o) => o.html).join("")}</g>
    <g class="mapa-swiatla" opacity="${pora.ciemnosc.toFixed(3)}" style="mix-blend-mode:screen" pointer-events="none">${okna}</g>
    <g pointer-events="none">${tabliceObwodnicy(g, M)}${napisy}</g></svg>`;
}

// lokale innych firm – w kolorze firmy (marka z rundy 1)
const firmyNaMapie = (v) => [...new Set(Object.values(v.lokale.zajete))].filter((f) => f !== v.firma)
  .map((f) => `<span><i style="background:${esc(marka(v, f).kolor)}"></i>${esc(marka(v, f).nazwa)}</span>`).join("");

function legendaWarstwy(c) {
  const wart = wartosciWarstwy(c);
  if (!wart) return "";
  const [lo, hi] = zakres(wart);
  const opis = { czynsze: "czynsz za m² w strefie (miesięcznie)", popyt: "klienci strefy w ostatnim tygodniu", konkurencja: "zajęte lokale z kebabem w strefie" }[UST.warstwa];
  const f = (x) => UST.warstwa === "czynsze" ? `${licz(x)} zł/m²` : UST.warstwa === "popyt" ? licz(x) : kebaby(x);
  return `<div class="mapa-skala"><span>${esc(opis)}:</span><b>${f(lo)}</b><i style="background:linear-gradient(90deg, ${barwa(0)}, ${barwa(0.5)}, ${barwa(1)})"></i><b>${f(hi)}</b></div>`;
}

const legenda = (c) => `${legendaWarstwy(c)}<div class="mapa-legenda">
  ${c.v.lokale ? Object.entries({ moj: "Twój lokal", wybrany: "wybrany w tej rundzie", wolny: "wolny lokal" })
    .map(([k, n]) => `<span><i style="background:${k === "moj" ? esc(kolorFirmy(c.v, c.v.firma)) : LOKAL[k]}"></i>${n}</span>`).join("") + `<span><i style="background:#e2cc9c"></i>wolna działka</span>` + firmyNaMapie(c.v) : ""}
  ${Object.entries({ bank: "bank", urzad: "ratusz", dostawca: "dostawcy", sklep: "sklepy", reklama: "reklama", szkola: "szkolenia", gielda: "giełda" })
    .filter(([k]) => budynkiGry(c.v, c.kat.mapa.budynki).some((b) => b.rodzaj === k)).map(([k, n]) => `<span><i style="background:${BUDYNKI[k][0]}"></i>${n}</span>`).join("")}
  ${c.kat.mapa.miasto ? `<span class="podpowiedz">Zabytki i miejsca (Zamek, Brama Krakowska, Arena…) – kliknij, żeby przeczytać, co to.</span>` : ""}</div>`;

function pasek(c) {
  const pora = poraTeraz(c.kat.mapa);
  const wl = (akcja, wlaczony, tekst, tytul) => `<button class="btn maly ${wlaczony ? "" : "jasny"}" data-akcja="${akcja}" aria-pressed="${wlaczony}" title="${tytul}">${tekst}</button>`;
  return `<div class="mapa-pasek">
    <div class="mapa-grupa" role="group" aria-label="Warstwa mapy">${Object.entries(WARSTWY).map(([w, n]) =>
      `<button class="btn maly ${UST.warstwa === w ? "" : "jasny"}" data-akcja="mapa-warstwa" data-w="${w}" aria-pressed="${UST.warstwa === w}">${n}</button>`).join("")}</div>
    <div class="mapa-grupa">${wl("mapa-opinie", UST.opinie, "★ Opinie", "Oceny klientów nad lokalami")}${wl("mapa-ruch", UST.ruch, "Ruch", "Auta, pociągi i przechodnie – im więcej klientów w strefie i ruchliwsza pora, tym gęściej")}${wl("mapa-2d", UST.plaska, "2D", "Płaski plan miasta z góry zamiast widoku 3D")}</div>
    <button class="btn maly jasny" data-akcja="mapa-wersja" title="Mapa na prawdziwych granicach dzielnic Lublina">Nowa mapa</button>
    <span class="mapa-pora" id="mapa-pora" title="${ZAWSZE_DZIEN ? "Godzina w Lublinie – ruch na ulicach zależy od pory dnia" : "Pora dnia w Lublinie według zegara Twojego komputera – po zachodzie słońca mapa ciemnieje"}">${pora.ikona} ${esc(pora.zegar)} · ${pora.nazwa}</span>
  </div>`;
}

// --- przybliżanie i przesuwanie: kółko z Ctrl, przyciski, przeciąganie, dwa palce, dwuklik ---
const MAKS = 5;

// widok ma proporcje ramki (na telefonie ramka jest wyższa niż mapa); poza mapą – teren tła, środek mapy w środku
const wPrzedziale = (v, dl, D) => dl >= D ? (D - dl) / 2 : Math.min(D - dl, Math.max(0, v));

function ustawWidok(svg, vb) {
  const [, , W, H] = WIDOK.baza, r = svg.getBoundingClientRect();
  const w = Math.min(W, Math.max(W / MAKS, vb[2])), h = w * (r.width ? r.height / r.width : H / W);
  WIDOK.vb = Object.assign([wPrzedziale(vb[0], w, W), wPrzedziale(vb[1], h, H), w, h], { zrodlo: WIDOK.vb.zrodlo, nowy: false });
  svg.setAttribute("viewBox", WIDOK.vb.map((n) => n.toFixed(1)).join(" "));
  svg.classList.toggle("przyblizona", W / w >= 1.6);
  svg.style.setProperty("--zn", (1 / Math.pow(W / w, 0.8)).toFixed(3));   // napisy rosną wolniej niż mapa
  clearTimeout(ROZSUN);
  ROZSUN = setTimeout(() => rozsunNapisy(svg), 150);   // po skończonym przybliżaniu
}

/** Nazwy dzielnic nie zasłaniają znaków kebabów ani siebie nawzajem: każda próbuje miejsca na swoim miejscu, potem
 * coraz wyżej i niżej (o swoją wysokość), i zostaje w pierwszym wolnym; gdy wolnego nie ma – na swoim miejscu. */
let ROZSUN = 0;
function rozsunNapisy(svg) {
  if (!svg.isConnected) return;
  const r = svg.getBoundingClientRect(), skala = r.width ? svg.viewBox.baseVal.width / r.width : 1;
  const zajete = [...svg.querySelectorAll(".lokal-pin")].map((el) => el.getBoundingClientRect());
  const nachodzi = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  for (const el of svg.querySelectorAll(".strefa-napis")) {
    el.removeAttribute("transform");
    const p = el.getBoundingClientRect(), krok = p.height + 3;
    const dy = [0, -1, 1, -2, 2, -3].map((k) => k * krok).find((d) => {
      const q = { left: p.left - 2, right: p.right + 2, top: p.top + d, bottom: p.bottom + d };
      return !zajete.some((z) => nachodzi(q, z));
    }) ?? 0;
    if (dy) el.setAttribute("transform", `translate(0 ${(dy * skala).toFixed(1)})`);
    zajete.push({ left: p.left, right: p.right, top: p.top + dy, bottom: p.bottom + dy });
  }
}

function przybliz(svg, razy, cx, cy) {
  const [x, y, w, h] = WIDOK.vb;
  const px = cx ?? x + w / 2, py = cy ?? y + h / 2;   // punkt, który zostaje w miejscu
  ustawWidok(svg, [px - (px - x) / razy, py - (py - y) / razy, w / razy, h / razy]);
}

function punktMapy(svg, e) {
  const r = svg.getBoundingClientRect(), [x, y, w, h] = WIDOK.vb;
  return [x + (e.clientX - r.left) / r.width * w, y + (e.clientY - r.top) / r.height * h];
}

function podepnijPrzyblizanie(svg) {
  const pierwszy = WIDOK.vb.nowy;
  ustawWidok(svg, WIDOK.vb);
  // start bliżej miasta (okolica i pola wokół zostają przy oddaleniu); telefon – jeszcze bliżej centrum
  if (pierwszy) przybliz(svg, svg.getBoundingClientRect().width < 600 ? 1.8 : 1.3);
  const wskazniki = new Map();
  let start = null, przeciagnieto = false, podpowiedz = null;
  svg.addEventListener("wheel", (e) => {
    if (!e.ctrlKey && !e.metaKey) {   // zwykłe kółko przewija stronę – podpowiedź jak w mapach internetowych
      const ramka = svg.closest(".mapa-ramka");
      ramka?.classList.add("podpowiedz-zoom");
      clearTimeout(podpowiedz);
      podpowiedz = setTimeout(() => ramka?.classList.remove("podpowiedz-zoom"), 1200);
      return;
    }
    e.preventDefault();
    przybliz(svg, Math.exp(-e.deltaY * 0.002), ...punktMapy(svg, e));
  }, { passive: false });
  svg.addEventListener("dblclick", (e) => { e.preventDefault(); przybliz(svg, 1.6, ...punktMapy(svg, e)); });
  svg.addEventListener("pointerdown", (e) => {
    wskazniki.set(e.pointerId, [e.clientX, e.clientY]);
    start = { vb: [...WIDOK.vb], pkt: [...wskazniki.values()].map((p) => [...p]), sr: null };
    przeciagnieto = false;
  });
  svg.addEventListener("pointermove", (e) => {
    if (!wskazniki.has(e.pointerId) || !start) return;
    wskazniki.set(e.pointerId, [e.clientX, e.clientY]);
    const r = svg.getBoundingClientRect(), skala = start.vb[2] / r.width;
    const teraz = [...wskazniki.values()];
    if (teraz.length >= 2 && start.pkt.length >= 2) {   // dwa palce: odległość → przybliżenie, środek → przesunięcie
      const odl = (p) => Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]);
      const razy = odl(teraz) / Math.max(1, odl(start.pkt));
      const sx = (start.pkt[0][0] + start.pkt[1][0]) / 2 - r.left, sy = (start.pkt[0][1] + start.pkt[1][1]) / 2 - r.top;
      const tx = (teraz[0][0] + teraz[1][0]) / 2 - r.left, ty = (teraz[0][1] + teraz[1][1]) / 2 - r.top;
      const [x, y, w, h] = start.vb, px = x + sx * skala, py = y + sy * skala, nw = w / razy;
      ustawWidok(svg, [px - tx * nw / r.width, py - ty * nw / r.width, nw, h / razy]);
      przeciagnieto = true;
      return;
    }
    const [x0, y0] = start.pkt[0], dx = e.clientX - x0, dy = e.clientY - y0;
    if (!przeciagnieto && Math.hypot(dx, dy) < 5) return;
    if (!przeciagnieto) { przeciagnieto = true; svg.setPointerCapture?.(e.pointerId); svg.classList.add("przesuwana"); }
    ustawWidok(svg, [start.vb[0] - dx * skala, start.vb[1] - dy * skala, start.vb[2], start.vb[3]]);
  });
  const koniec = (e) => {
    wskazniki.delete(e.pointerId);
    svg.classList.remove("przesuwana");
    start = wskazniki.size ? { vb: [...WIDOK.vb], pkt: [...wskazniki.values()].map((p) => [...p]) } : null;
  };
  svg.addEventListener("pointerup", koniec);
  svg.addEventListener("pointercancel", koniec);
  // po przeciągnięciu mapy kliknięcie nie otwiera budynku ani lokalu
  svg.addEventListener("click", (e) => { if (przeciagnieto) { e.stopPropagation(); e.preventDefault(); przeciagnieto = false; } }, true);
}

// dymek nad budynkiem, lokalem albo zabytkiem pod myszą: nazwa i opis z <title> („nazwa – opis”)
function podepnijDymek(svg) {
  const ramka = svg.closest(".mapa-ramka");
  if (!ramka) return;
  let dymek = ramka.querySelector(".mapa-dymek");
  if (!dymek) {
    dymek = document.createElement("div");
    dymek.className = "mapa-dymek";
    dymek.setAttribute("role", "tooltip");
    ramka.append(dymek);
  }
  const ukryj = () => dymek.classList.remove("widoczny");
  svg.addEventListener("pointerover", (e) => {
    if (e.pointerType === "touch" || svg.classList.contains("przesuwana")) return;
    const el = e.target.closest?.(".klik");
    if (!el || !svg.contains(el)) { ukryj(); return; }
    const t = el.querySelector(":scope > title");
    if (t) { el.dataset.dymek = t.textContent; t.remove(); }   // bez podwójnej, systemowej podpowiedzi
    const [nazwa, ...reszta] = (el.dataset.dymek || "").split(" – ");
    if (!nazwa) { ukryj(); return; }
    const { ikona, kolor, rada } = el.dataset;
    dymek.innerHTML = `<b>${ikona ? `<i style="background:${esc(kolor || "#5f6b7a")}">${ikona}</i>` : ""}${esc(nazwa)}</b>`
      + (reszta.length ? `<span>${esc(reszta.join(" – "))}</span>` : "") + (rada ? `<small>${esc(rada)}</small>` : "");
    const r = el.getBoundingClientRect(), R = ramka.getBoundingClientRect(), w = dymek.offsetWidth, h = dymek.offsetHeight;
    const pod = r.top - R.top < h + 12;   // brak miejsca nad budynkiem – dymek pod nim
    dymek.classList.toggle("pod", pod);
    dymek.style.left = `${Math.min(R.width - w / 2 - 6, Math.max(w / 2 + 6, r.left + r.width / 2 - R.left))}px`;
    dymek.style.top = `${(pod ? r.bottom : r.top) - R.top}px`;
    dymek.classList.add("widoczny");
  });
  for (const zd of ["pointerleave", "pointerdown", "wheel"]) svg.addEventListener(zd, ukryj, { passive: true });
}

// pora dnia odświeżana co minutę bez przerysowania mapy
let zegar = null;
function podepnijZegar(c) {
  clearInterval(zegar);
  zegar = setInterval(() => {
    const noc = document.getElementById("mapa-noc");
    if (!noc) { clearInterval(zegar); return; }
    const pora = poraTeraz(c.kat.mapa);
    noc.setAttribute("opacity", (NOC * pora.ciemnosc).toFixed(3));
    document.querySelectorAll(".mapa-swiatla").forEach((e) => e.setAttribute("opacity", pora.ciemnosc.toFixed(3)));
    document.getElementById("mapa-noc-macierz")?.setAttribute("values", nocMacierz(pora.ciemnosc));
    const bud = document.getElementById("mapa-budynki");
    if (pora.ciemnosc > 0) bud?.setAttribute("filter", "url(#mapa-noc-budynki)"); else bud?.removeAttribute("filter");
    const napis = document.getElementById("mapa-pora");
    if (napis) napis.textContent = `${pora.ikona} ${pora.zegar} · ${pora.nazwa}`;
  }, 60000);
}

// nowa mapa (static/mapa/lublin.js) bierze stąd warstwy, ustawienia i dotychczasowe okna budynków i lokali
const POMOC = { UST, zapiszUst, WARSTWY, wartosciWarstwy, budynkiGry, parkiZeSprawa, parkiNaMapie, wybranyLokal, get akcje() { return mapa.akcje; } };

export const mapa = {
  tytul: "Mapa miasta", ikona: "mapa",
  get info() { return UST.nowa ? nowaMapa.info : this.infoStarej; },
  infoStarej: "Mapa Lublina: najedź myszą na budynek, żeby zobaczyć, co to; kliknij budynek, żeby przejść do jego zakładki (bank, ratusz, dostawcy, agencje…), albo lokal, żeby go obejrzeć i wynająć lub kupić. "
    + "Gwiazdki przy lokalach to ocena z opinii klientów. Przyciski nad mapą pokazują warstwy: czynsze, popyt i konkurencję w strefach. "
    + "Mapę przybliżysz przyciskami +/−, kółkiem myszy z Ctrl, dwuklikiem albo dwoma palcami, a przesuniesz przeciągając. "
    + "Po zachodzie słońca w Lublinie (według zegara Twojego komputera) mapa ciemnieje. Menu po lewej działa jak dotąd.",
  decyzje(c) {
    if (UST.nowa) return nowaMapa.decyzje(c, POMOC);
    const brak = c.v.lokale && !c.v.lokale.moje.length
      ? `<div class="komunikat">Nie masz jeszcze lokalu – kliknij wolny lokal (biały) albo działkę na mapie.</div>` : "";
    return brak + parkiNaMapie(c.v, c.kat, c.edycja) + pasek(c)
      + `<div class="mapa-ramka"><div class="mapa-kompas" title="Północ – w Lublinie Czechów i Al. Andersa" aria-hidden="true">
          <svg viewBox="-20 -20 40 40" width="40" height="40"><circle r="18" fill="rgba(255,255,255,.88)" stroke="#c9ced6"/>
          <g transform="rotate(${polnocStopni(UST.plaska).toFixed(1)})"><path d="M0 -9L4 1H-4Z" fill="#d32f2f"/><path d="M0 9L4 1H-4Z" fill="#9aa3ad"/></g>
          <text x="${(Math.sin(polnocStopni(UST.plaska) * Math.PI / 180) * 13).toFixed(1)}" y="${(-Math.cos(polnocStopni(UST.plaska) * Math.PI / 180) * 13 + 3.5).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="800" fill="#d32f2f" transform="translate(0 -1)">N</text></svg></div>
        <div class="mapa-zoom">
          <button class="btn maly jasny" data-akcja="mapa-zoom" data-z="1.5" title="Przybliż" aria-label="Przybliż">+</button>
          <button class="btn maly jasny" data-akcja="mapa-zoom" data-z="0.6667" title="Oddal" aria-label="Oddal">−</button>
          <button class="btn maly jasny" data-akcja="mapa-zoom" data-z="0" title="Cała mapa" aria-label="Cała mapa">⤢</button></div>
        <div class="mapa-podpowiedz">Przybliżanie: Ctrl + kółko myszy</div>${rysujMape(c)}</div>${legenda(c)}`;
  },
  po(c) {
    if (UST.nowa) return nowaMapa.po(c);
    const svg = document.getElementById("mapa-svg");
    if (!svg) return;
    podepnijPrzyblizanie(svg);
    podepnijDymek(svg);
    requestAnimationFrame(() => rozsunNapisy(svg));
    if (UST.ruch && OSTATNIA) uruchomPojazdy(svg, OSTATNIA.g, OSTATNIA.trasy, OSTATNIA.natezenie);
    podepnijZegar(c);
  },
  akcje: {
    "mapa-budynek": (el, c) => {
      const b = c.kat.mapa.budynki.find((x) => x.id === el.dataset.id);
      if (b.zakladka === "zdarzenia") return oknoParku(c, b.id);   // UF13: parki tylko z mapy
      if (!b.zakladka) return toast(`${b.nazwa}: ${b.opis}`);
      if (c.zakryta(b.zakladka)) return c.idz(b.zakladka);   // funkcje gry: okno „Odsłoń”
      if (!c.dostepna(b.zakladka)) return toast(`${b.nazwa} – ta zakładka nie jest jeszcze dostępna w tej rundzie.`);
      c.idz(b.zakladka);
    },
    "mapa-miejsce": (el, c) => {
      const m = (c.kat.mapa.miasto?.miejsca || []).find((x) => x.id === el.dataset.id);
      if (m) okno(esc(m.nazwa), `<p>${esc(m.opis)}</p><p class="podpowiedz">Punkt orientacyjny na mapie Lublina – nie wpływa na grę.</p>`);
    },
    "mapa-lokal": (el, c) => {
      const lok = c.kat.mapa.lokale.find((x) => x.id === el.dataset.id);
      const moje = c.v.lokale.moje.find((l) => l.id === lok.id);
      const oferta = c.v.lokale.oferta.find((l) => l.id === lok.id);
      const kto = c.v.lokale.zajete[lok.id];
      let html = opisLokalu(c.kat, lok) + opinieHtml((c.v.lokale.opinie || {})[lok.id]), przyciski = "";
      if (oferta) {
        przyciski = przyciskiLokalu(c.v, c.d, oferta, c.edycja);
        if (c.v.runda < c.v.lokale.nowy_od) html += `<p class="podpowiedz">${esc(c.v.lokale.odpoczynek || `Kolejny lokal możesz wziąć od rundy ${c.v.lokale.nowy_od}.`)}</p>`;
      }
      if (moje && !oferta) {
        html += `<p><b>Twój lokal</b> (${moje.forma === "najem" ? "najem" : "własność"}) – ${moje.dziala ? "działa" : `zacznie działać w rundzie ${moje.dziala_od}`}.</p>`;
        przyciski = FIRMA.filter((k) => c.dostepna(k)).map((k) => `<button class="btn jasny maly" data-akcja="mapa-idz" data-z="${k}">${esc(c.tytulZakladki(k))}</button>`).join("");
      } else if (kto && !oferta) html += `<p class="podpowiedz">Lokal zajmuje firma ${esc(nazwaFirmy(c.v, kto))}.</p>`;
      okno(esc(lok.nazwa), html, { przyciski });
    },
    "mapa-idz": (el, c) => { zamknijOkno(); c.idz(el.dataset.z); },
    "mapa-warstwa": (el, c) => { UST.warstwa = el.dataset.w; zapiszUst(); c.rysuj(); },
    "mapa-opinie": (el, c) => { UST.opinie = !UST.opinie; zapiszUst(); c.rysuj(); },
    "mapa-ruch": (el, c) => { UST.ruch = !UST.ruch; zapiszUst(); c.rysuj(); },
    "mapa-2d": (el, c) => { UST.plaska = !UST.plaska; zapiszUst(); c.rysuj(); },
    "mapa-wersja": (el, c) => { UST.nowa = !UST.nowa; zapiszUst(); c.rysuj(); },
    ...nowaMapa.akcje,
    "mapa-zoom": (el) => {
      const svg = document.getElementById("mapa-svg"), z = +el.dataset.z;
      if (!svg) return;
      if (z) przybliz(svg, z); else ustawWidok(svg, [...WIDOK.baza]);
    },
    ...AKCJE_ZDARZEN,
  },
};
