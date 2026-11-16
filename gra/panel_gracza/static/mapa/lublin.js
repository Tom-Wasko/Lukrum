// Nowa mapa Lublina (etap 2, strona [mapa]): prawdziwe granice dzielnic, woda, zieleń i drogi z OpenStreetMap
// (static/mapa/lublin.json, skrypt narzedzia/mapa/pobierz_osm.py), budynki-ikony w miejscach z dane/mapa/budynki.yaml
// (pole geo), płynne przybliżanie (widok.js), pasek skrótów. Kolory i kroje tylko ze static/motywy/zmienne.css.
//
// Wejście do budynku: mapa woła lukrum.otworzWnetrze(id) (umowa w WSPOLPRACA.md). Dopóki strona [mechaniki] nie
// rysuje wnętrza (nie ustawi e.detail.obsluzone = true w zdarzeniu "lukrum:wnetrze"), mapa sama otwiera
// dotychczasową zakładkę albo okno – gra jest grywalna na każdym kroku.
import { esc, kolorFirmy, marka, nazwaFirmy, okno, toast, zamknijOkno } from "../zakladki/wspolne.js";
import { ikona, zeton } from "./ikony.js";
import { utworzWidok } from "./widok.js";

const ADRES = (plik) => new URL(plik, import.meta.url).href;
const POZIOMY = [0.09, 0.3];
const ZANIK = [0.062, 0.1];   // px na metr: poniżej pierwszej żetony są niewidoczne (same nazwy dzielnic), powyżej drugiej pełne   // px na metr: poniżej – całe miasto, pomiędzy – dzielnica, powyżej – ulica i budynek
const PALETY = { bar: "Bar mleczny", pewex: "Pewex", wysoka: "Wysoka widoczność" };
// odcień strefy (4 odcienie z palety; sąsiednie strefy mają różne) – strefę i tak podpisuje nazwa, nie sam kolor
const ODCIEN = { stare_miasto: 1, centrum: 2, akademickie: 3, politechnika: 1, dworzec: 2, zygmuntowskie: 3, lsm_czuby: 4,
  czechow: 4, felin: 3, zemborzyce: 2 };
const SKROTY = [["lokal", "lokal", "Mój lokal"], ["bank", "bank", "Banki"], ["hurt", "dostawca", "Hurtownie i sklepy"],
  ["raport", "raport", "Raport rundy"], ["wyslij", "wyslij", "Wyślij decyzje"]];

// punkty orientacyjne widoczne już na widoku całego miasta (reszta pojawia się po przybliżeniu)
const DALEKO = new Set(["zamek", "arena", "lotnisko", "gorki_czechowskie", "skansen", "dworzec_glowny", "plac_litewski"]);

let DANE = null, BLAD = null, WIDOK = null, widok = null, C = null, P = null, ZNAKI = [], poziom = 0, ulice = false;
let ROZM = 30, ostatnieUlozenie = 0, czekaUlozenie = 0, czysta = false, ULICE = [];

// --- style i dane (raz) ---
(function podlaczStyle() {
  if (typeof document === "undefined" || document.getElementById("lmapa-style")) return;
  // zmienne i dostępność w warstwie kaskady: dotychczasowy panel (rusztowanie) zachowuje swoje kolory
  const st = document.createElement("style");
  st.id = "lmapa-style";
  st.textContent = `@import url("${ADRES("../fonty/fonty.css")}");\n@import url("${ADRES("../motywy/zmienne.css")}") layer(lukrum);\n`
    + `@import url("${ADRES("../motywy/dostepnosc.css")}") layer(lukrum);`;
  const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href: ADRES("./mapa.css") });
  document.head.append(st, link);
})();

const wczytane = fetch(ADRES("./lublin.json")).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
  .then((d) => { DANE = d; }).catch((e) => { BLAD = String(e.message || e); });

// opisy budynków w danych kończą się czasem odsyłaczem dla twórców („(dane/mapa/banki.yaml)”) – graczowi go nie pokazujemy
const opisDla = (s) => String(s ?? "").replace(/\s*\((?:[^()]*dane\/[^()]*|[^()]*decyzja autora[^()]*)\)/g, "");
const xy = (geo) => { const r = DANE.rzut; return [Math.round((geo.lon - r.lon0) * r.m_na_stopien * r.cos0), Math.round(-(geo.lat - r.lat0) * r.m_na_stopien)]; };

// --- wejście do środka: umowa z [mechaniki] + zastępcze otwarcie dotychczasowych okien ---
function zastepczo(id) {
  if (!C || !P) return;
  const M = C.kat.mapa, zesp = (M.zespoly || []).find((z) => z.id === id);
  if (zesp) {   // hol z szyldami – na razie lista firm w oknie
    const firmy = P.budynkiGry(C.v, M.budynki).filter((b) => b.zespol === id);
    return okno(esc(zesp.nazwa), `<p>${esc(zesp.opis)}</p><div class="lm-hol">${firmy.map((b) =>
      `<button class="lm-szyld" data-akcja="lmapa-firma" data-id="${esc(b.id)}"><i class="lm-pionek">${zeton(b.id, b.rodzaj)}</i><span><b>${esc(b.nazwa)}</b><small>${esc(opisDla(b.opis))}</small></span></button>`).join("")}</div>`,
    { srednie: true });
  }
  if (M.budynki.some((b) => b.id === id)) return P.akcje["mapa-budynek"]({ dataset: { id } }, C);
  if (M.lokale.some((l) => l.id === id)) return P.akcje["mapa-lokal"]({ dataset: { id } }, C);
}
if (typeof document !== "undefined") {
  document.addEventListener("lukrum:wnetrze", (e) => setTimeout(() => { if (!e.detail?.obsluzone) zastepczo(e.detail?.id); }));
  document.addEventListener("lukrum:mapa", () => C?.idz("mapa"));
  document.addEventListener("lukrum:wyglad", () => { if (document.getElementById("lmapa")) C?.rysuj(); });
}

// --- rysunek miasta (SVG, w metrach) ---
function strefyDzielnic(M) {
  const s = {};
  for (const [k, st] of Object.entries(M.strefy)) for (const dz of st.dzielnice || []) s[dz] = k;
  return s;
}

function rysunek(M, wart, zakres) {
  const D = DANE, czyja = strefyDzielnic(M);
  const sila = (k) => !wart ? "" : ` style="--w:${wart[k] ? (zakres[1] > zakres[0] ? (wart[k][0] - zakres[0]) / (zakres[1] - zakres[0]) : 0.5).toFixed(2) : 0}"`;
  const dzielnice = D.dzielnice.map((dz) => {
    const k = czyja[dz.nazwa];
    return `<path class="${k ? `lm-strefa lm-t${ODCIEN[k] || 1}` : "lm-tlo"}" d="${dz.d}"${k ? sila(k) : ""}/>`;
  }).join("");
  const zielen = (r) => D.zielen.filter((z) => z.rodzaj === r).map((z) => z.d).join("");
  const klasa = (kl) => D.drogi.filter((x) => x.klasa === kl).map((x) => x.d).join("");
  const drogi = ["lokalna", "zbiorcza", "glowna", "ekspresowa"].map((kl) => { const d = klasa(kl); return `<path class="lm-droga-obrys lm-${kl}" d="${d}"/><path class="lm-droga lm-${kl}" d="${d}"/>`; }).join("");
  const napisy = D.drogi.filter((x) => x.napis).map((x, i) =>
    `<path id="lm-ul-${i}" d="${x.napis}" fill="none"/><text class="lm-ulica-napis${x.dl < 1600 ? " lm-krotka" : ""}" dy=".35em" data-x="${x.sr[0]}" data-y="${x.sr[1]}" data-kx="${x.kier[0]}" data-ky="${x.kier[1]}" data-n="${x.nazwa.length}"><textPath href="#lm-ul-${i}" startOffset="50%">${esc(x.nazwa)}</textPath></text>`).join("");
  return `<g id="lmapa-swiat"><path class="lm-miasto" d="${D.dzielnice.map((dz) => dz.d).join("")}"/>${dzielnice}
    <path class="lm-zielen lm-las" d="${zielen("las")}"/><path class="lm-zielen lm-laka" d="${zielen("laka")}${zielen("cmentarz")}"/><path class="lm-zielen lm-park" d="${zielen("park")}"/>
    <path class="lm-woda" d="${D.woda.map((w) => w.d).join("")}"/><path class="lm-rzeka" d="${D.rzeki.map((r) => r.d).join("")}"/>
    <path class="lm-granice" d="${D.dzielnice.map((dz) => dz.d).join("")}"/>
    <g id="lmapa-ulice"></g><path class="lm-kolej-obrys" d="${D.kolej}"/><path class="lm-kolej" d="${D.kolej}"/>${drogi}<g class="lm-ulice-napisy">${napisy}</g></g>`;
}

// --- znaczniki (HTML nad rysunkiem – prawdziwe przyciski, stały rozmiar na ekranie) ---
// szyld: nazwa bez dopisków w nawiasach; długa łamie się na dwa równe wiersze (tabliczka nie szersza niż napis)
function szyld(nazwa) {
  const n = String(nazwa).replace(/\s*\([^)]*\)\s*$/, "");
  return `<span class="lm-podpis lm-schowany"${n.length > 20 ? ` style="max-width:${(Math.ceil(n.length / 2) * 0.6 + 2.5).toFixed(1)}em"` : ""}>${esc(n)}</span>`;
}
const znak = (x, y, klasa, akcja, id, nazwa, opis, tresc, kolej = 1) =>
  `<button type="button" class="lm-znak ${klasa}" data-akcja="${akcja}" data-id="${esc(id)}" data-x="${x}" data-y="${y}" style="z-index:${kolej}" aria-label="${esc(nazwa)}. ${esc(opis)}" title="${esc(opis)}">${tresc}${szyld(nazwa)}</button>`;

function znakiBudynkow(c) {
  const M = c.kat.mapa, widoczne = P.budynkiGry(c.v, M.budynki), sprawy = P.parkiZeSprawa(c.v), html = [];
  for (const z of M.zespoly || []) {
    if (!z.geo || !widoczne.some((b) => b.zespol === z.id)) continue;
    const n = widoczne.filter((b) => b.zespol === z.id).length;
    html.push(znak(...xy(z.geo), "lm-budynek lm-zespol", "lmapa-wejdz", z.id, z.nazwa, `${z.opis} Kliknij, żeby wejść.`,
      `<span class="lm-kafel">${zeton(z.id)}<i class="lm-ile" aria-hidden="true">${n}</i></span>`, 4));
  }
  for (const b of widoczne) {
    if (b.zespol || !b.geo) continue;
    const zielony = b.rodzaj === "park" || b.rodzaj === "woda", sprawa = sprawy.has(b.id);
    const rada = b.zakladka === "zdarzenia" ? (sprawa ? "W tej rundzie coś się tu dzieje – kliknij." : "Kliknij, żeby zobaczyć, co dzieje się w parku.") : "Kliknij, żeby wejść.";
    html.push(znak(...xy(b.geo), zielony ? "lm-zielony" : "lm-budynek", "lmapa-wejdz", b.id, b.nazwa, `${opisDla(b.opis)} ${rada}`,
      `<span class="lm-kafel">${zeton(b.id, b.rodzaj, zielony ? "kolo" : "kwadrat")}${sprawa ? `<i class="lm-plakietka lm-uwaga" aria-hidden="true">!</i>` : ""}</span>`, sprawa ? 5 : zielony ? 2 : 3));
  }
  return html.join("");
}

function znakiLokali(c) {
  const { v, kat, d } = c, M = kat.mapa;
  if (!v.lokale) return "";
  const wybrany = P.wybranyLokal(d)?.id;
  return M.lokale.filter((l) => (l.od_rundy || 1) <= v.runda && (!v.lokale.na_mapie || v.lokale.na_mapie.includes(l.id)) && l.geo).map((l) => {
    const moje = (v.lokale.moje || []).find((x) => x.id === l.id), kto = v.lokale.zajete[l.id];
    const stan = moje ? (wybrany === l.id ? "wybrany" : "moj") : kto ? "zajety" : "wolny";
    const pilny = stan === "wolny" && !(v.lokale.moje || []).length;   // drużyna bez lokalu: wolne lokale widać nawet z daleka
    const op = (v.lokale.opinie || {})[l.id], dzialka = l.typ === "dzialka" && (stan === "wolny" || (moje && !moje.dziala));
    const opis = stan === "wolny" ? `Wolny ${l.typ === "dzialka" ? "teren pod budowę" : "lokal"} (${l.adres}). Kliknij, żeby wynająć albo kupić.`
      : moje ? `${stan === "wybrany" ? "Lokal wybrany przez Ciebie w tej rundzie" : "Twój lokal"} (${l.adres}). Kliknij, żeby wejść.`
        : `Lokal firmy ${nazwaFirmy(v, kto)} (${l.adres}). Kliknij, żeby obejrzeć lokal i opinie.`;
    const kolor = stan === "zajety" ? marka(v, kto).kolor : moje ? kolorFirmy(v, v.firma) : null;
    const plakietka = stan === "moj" ? "★" : stan === "wybrany" ? "✓" : "";
    const ocena = op && P.UST.opinie ? `<span class="lm-ocena" aria-hidden="true">★ ${op.ocena.toFixed(1).replace(".", ",")}</span>` : "";
    return znak(...xy(l.geo), `lm-lokal lm-${stan}${pilny ? " lm-pilny" : ""}`, moje ? "lmapa-wejdz" : "lmapa-lokal", l.id, l.nazwa, opis,
      `<span class="lm-kafel"${kolor ? ` style="--firma:${esc(kolor)}"` : ""}>${zeton(null, dzialka ? "dzialka" : "lokal", "kolo")}${plakietka ? `<i class="lm-plakietka" aria-hidden="true">${plakietka}</i>` : ""}</span>${ocena}`,
      moje ? 8 : stan === "wolny" ? 6 : 5);
  }).join("");
}

// punkty orientacyjne: miejsca z miasto.yaml i dodatkowe punkty Lublina z danych mapy (lublin.json: dodatkowe)
const miejsce = (xyM, akcja, m) => znak(...xyM, `lm-miejsce${DALEKO.has(m.id) ? " lm-daleko" : ""}`, akcja, m.id, m.nazwa,
  `${m.opis} Punkt orientacyjny – nie wpływa na grę.`, `<span class="lm-kafel">${zeton(m.id, null, "")}</span>`, 1);
const znakiMiejsc = (M) => (M.miasto?.miejsca || []).filter((m) => DANE.miejsca[m.id]).map((m) => miejsce(DANE.miejsca[m.id], "lmapa-miejsce", m)).join("")
  + (DANE.dodatkowe || []).map((m) => miejsce(m.xy, "lmapa-punkt", m)).join("");

function napisy(M, wart) {
  const D = DANE, czyja = strefyDzielnic(M), srodki = {};
  for (const dz of D.dzielnice) if (czyja[dz.nazwa]) (srodki[czyja[dz.nazwa]] ||= []).push(dz.srodek);
  let html = "";
  for (const [k, s] of Object.entries(M.strefy)) {
    const pkty = srodki[k] || [];   // strefa to jedna dzielnica (strefy.yaml: dzielnice); gdyby było ich więcej – średnia środków
    const p = pkty.length ? [0, 1].map((i) => pkty.reduce((a, q) => a + q[i], 0) / pkty.length) : null;
    if (!p) continue;
    const wartosc = wart ? `<small>${esc(wart[k] ? wart[k][1] : "brak danych")}</small>` : "";
    // podpis: prawdziwa nazwa dzielnicy, a pod nią drobniej nazwa strefy z gry (gdy jest inna) – tak łączą się mapa i zakładki
    const dzielnica = (s.dzielnice || []).length === 1 ? s.dzielnice[0] : s.nazwa;
    const wGrze = dzielnica !== s.nazwa ? `<i>${esc(s.nazwa)}</i>` : "";
    html += `<div class="lm-napis lm-schowany lm-strefa-napis" data-x="${p[0]}" data-y="${p[1]}">${esc(dzielnica)}${wGrze}${wartosc}</div>`;
  }
  for (const dz of D.dzielnice) if (!czyja[dz.nazwa]) html += `<div class="lm-napis lm-schowany lm-tlo-napis" data-x="${dz.srodek[0]}" data-y="${dz.srodek[1]}">${esc(dz.nazwa)}</div>`;
  const rzeka = D.woda.find((w) => w.nazwa && /Zalew/.test(w.nazwa));
  if (rzeka) html += `<div class="lm-napis lm-schowany lm-woda-napis" data-x="${rzeka.srodek[0]}" data-y="${rzeka.srodek[1] + 500}">${esc(rzeka.nazwa)}</div>`;
  return html;
}

// --- pasek nad mapą, pasek skrótów, legenda ---
function pasekUstawien(c) {
  const U = P.UST, wyglad = window.lukrum?.wyglad.odczytaj() || { paleta: "bar", tryb: "jasny" };
  const p = (akcja, dane, wl, tekst, tytul = "") => `<button class="btn maly ${wl ? "" : "jasny"}" data-akcja="${akcja}" ${dane} aria-pressed="${wl}" title="${tytul}">${tekst}</button>`;
  return `<div class="mapa-pasek lm-ustawienia">
    <div class="mapa-grupa" role="group" aria-label="Warstwa mapy">${Object.entries(P.WARSTWY).map(([w, n]) => p("mapa-warstwa", `data-w="${w}"`, U.warstwa === w, n)).join("")}</div>
    <div class="mapa-grupa">${p("mapa-opinie", "", U.opinie, "★ Opinie", "Oceny klientów przy lokalach")}</div>
    <div class="mapa-grupa" role="group" aria-label="Paleta kolorów">${Object.entries(PALETY).map(([k, n]) => p("lmapa-wyglad", `data-paleta="${k}"`, wyglad.paleta === k, n)).join("")}</div>
    <div class="mapa-grupa" role="group" aria-label="Tryb">${p("lmapa-wyglad", `data-tryb="jasny"`, wyglad.tryb === "jasny", "Jasny")}${p("lmapa-wyglad", `data-tryb="ciemny"`, wyglad.tryb === "ciemny", "Ciemny")}</div>
    <button class="btn maly jasny lm-stara" data-akcja="mapa-wersja" title="Poprzednia mapa z kratką – działa do czasu, aż nowa ją zastąpi">Stara mapa</button></div>`;
}

const pasekSkrotow = () => `<nav class="lm-pasek" aria-label="Skróty">${SKROTY.map(([k, ik, n]) =>
  `<button type="button" class="lm-skrot" data-akcja="lmapa-skrot" data-s="${k}" aria-label="${n}" title="${n}">${ikona(ik, 22)}<span>${n}</span></button>`).join("")}</nav>`;

const wzor = (klasa, id, rodzaj, znakStanu = "") => `<i class="lm-pionek ${klasa}">${zeton(id, rodzaj, /lm-(budynek|zespol)/.test(klasa) ? "kwadrat" : klasa === "lm-miejsce" ? "" : "kolo")}${znakStanu ? `<b>${znakStanu}</b>` : ""}</i>`;
const legenda = (c) => `<button type="button" class="lm-leg-przycisk" data-akcja="lmapa-legenda" aria-expanded="${!!P.UST.legenda}" aria-controls="lm-legenda" title="Co znaczą żetony">?<span>Legenda</span></button>
<div class="lm-legenda" id="lm-legenda">
  ${c.v.lokale ? `<span>${wzor("lm-moj", null, "lokal", "★")}Twój lokal</span><span>${wzor("lm-wybrany", null, "lokal", "✓")}wybrany w tej rundzie</span>
  <span>${wzor("lm-wolny", null, "lokal")}wolny lokal</span><span>${wzor("lm-wolny", null, "dzialka")}wolna działka</span>
  <span>${wzor("lm-zajety", null, "lokal")}lokal innej firmy (żeton w jej kolorze)</span>` : ""}
  <span>${wzor("lm-budynek", "kamienica_bankowa")}budynek – kliknij, żeby wejść</span><span>${wzor("lm-zielony", null, "park")}park albo woda</span>
  <span>${wzor("lm-miejsce", "zamek")}punkt orientacyjny (nadrukowany na planszy)</span>
  <span class="podpowiedz">Przybliżanie: kółko myszy, dwa palce, dwuklik albo + i −. Przesuwanie: przeciągnij albo strzałki.</span></div>`;

// --- zakładka ---
function zakresWartosci(wart) {
  const x = Object.values(wart).filter(Boolean).map((w) => w[0]);
  return x.length ? [Math.min(...x), Math.max(...x)] : [0, 0];
}

function naZmiane(s) {
  WIDOK = s;
  const ramka = document.getElementById("lmapa");
  if (!ramka) return;
  ramka.querySelector("#lmapa-swiat")?.setAttribute("transform", `matrix(${s.k} 0 0 ${s.k} ${s.x} ${s.y})`);
  ramka.style.setProperty("--k", s.k);
  for (const z of ZNAKI) z.el.style.transform = `translate(${(z.x * s.k + s.x + z.dx + z.ox).toFixed(1)}px, ${(z.y * s.k + s.y + z.dy + z.oy).toFixed(1)}px)`;
  // przy oddalaniu żetony bledną; na pełnym oddaleniu zostają nazwy dzielnic i własny lokal
  const zanik = Math.min(1, Math.max(0, (s.k - ZANIK[0]) / (ZANIK[1] - ZANIK[0])));
  ramka.style.setProperty("--zanik", zanik.toFixed(2));
  czysta = zanik < 0.3;
  ramka.classList.toggle("lm-czysta", czysta);
  const p = s.k < POZIOMY[0] ? 1 : s.k < POZIOMY[1] ? 2 : 3;
  if (p !== poziom) {
    poziom = p;
    ramka.dataset.poziom = p;
    zmierz(ramka);
    if (p === 3 && !ulice) {   // ulice osiedlowe dorysowujemy dopiero z bliska
      ulice = true;
      const g = ramka.querySelector("#lmapa-ulice");
      if (g) g.innerHTML = `<path class="lm-uliczka" d="${Object.values(DANE.ulice).join("")}"/>`;
    }
  }
  // napisy układamy najwyżej co 90 ms i jeszcze raz po zatrzymaniu mapy
  const teraz = performance.now();
  clearTimeout(czekaUlozenie);
  if (teraz - ostatnieUlozenie > 90) { ostatnieUlozenie = teraz; uloz(s, ramka); } else czekaUlozenie = setTimeout(() => { ostatnieUlozenie = performance.now(); uloz(WIDOK, ramka); }, 100);
}

// --- układanie napisów: żaden szyld nie zasłania żetonu ani innego szyldu; ważniejsze wybierają miejsce pierwsze ---
// ważność: 1 Twój lokal, 2 nazwy stref, 3 zespoły, 4 małe strefy, 5 budynki i parki, 6 lokale innych firm, 7 wolne lokale,
// 8 punkty orientacyjne, 9 nazwy dzielnic tła i wody. Na widoku całego miasta biorą udział tylko 1–4 i 9.
function waznosc(el) {
  const k = el.classList;
  return k.contains("lm-moj") || k.contains("lm-wybrany") ? 1 : k.contains("lm-strefa-napis") ? (k.contains("lm-mala") ? 4 : 2) : k.contains("lm-zespol") ? 3
    : k.contains("lm-budynek") || k.contains("lm-zielony") ? 5 : k.contains("lm-zajety") ? 6 : k.contains("lm-wolny") ? 7 : k.contains("lm-miejsce") ? 8 : 9;
}

// na pełnym oddaleniu zostają: Twój lokal i (gdy go nie masz) wolne lokale
const zostaje = (z) => z.waznosc === 1 || z.el.classList.contains("lm-pilny");

function zmierz(ramka) {
  ROZM = parseFloat(getComputedStyle(ramka).getPropertyValue("--rozm")) || 30;
  for (const z of ZNAKI) {
    z.widac = getComputedStyle(z.el).display !== "none";
    const kafel = z.el.querySelector(".lm-kafel");
    z.bok = kafel ? kafel.offsetWidth : 0;
    const n = z.napis || z.el;
    z.w = n.offsetWidth; z.h = n.offsetHeight;
  }
}

const nachodzi = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

// Żetony, które na ekranie leżą na sobie, rozsuwają się na boki (jak pionki postawione obok siebie na jednym polu).
// Własny lokal i budynki zbiorcze stoją prawie w miejscu, reszta ustępuje; nikt nie odjeżdża dalej niż o własną szerokość.
function rozsun(s) {
  const zywe = ZNAKI.filter((z) => z.bok && z.widac && !(czysta && !zostaje(z)));
  for (const z of ZNAKI) if (!zywe.includes(z)) { z.ox = 0; z.oy = 0; }
  const p = zywe.map((z) => [z.x * s.k + s.x, z.y * s.k + s.y - z.bok * 0.36]);
  const start = p.map((q) => [...q]), waga = zywe.map((z) => z.waznosc === 1 || z.waznosc === 3 ? 0.15 : z.waznosc === 8 ? 1.4 : 1);
  for (let krok = 0; krok < 12; krok++) {
    let ruszono = false;
    for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) {
      const blisko = (zywe[i].bok + zywe[j].bok) / 2 * 0.9;
      let dx = p[j][0] - p[i][0], dy = p[j][1] - p[i][1], d = Math.hypot(dx, dy);
      if (d >= blisko) continue;
      if (d < 0.5) { const kat = (i * 2.4 + j) % 6.283; dx = Math.cos(kat); dy = Math.sin(kat); d = 1; }   // ten sam punkt – rozchodzą się w stałą stronę
      const brak = (blisko - d) / d, suma = waga[i] + waga[j];
      p[i][0] -= dx * brak * waga[i] / suma; p[i][1] -= dy * brak * waga[i] / suma;
      p[j][0] += dx * brak * waga[j] / suma; p[j][1] += dy * brak * waga[j] / suma;
      ruszono = true;
    }
    if (!ruszono) break;
  }
  zywe.forEach((z, i) => {
    let ox = p[i][0] - start[i][0], oy = p[i][1] - start[i][1];
    const dl = Math.hypot(ox, oy), maks = z.bok * 1.1;
    if (dl > maks) { ox *= maks / dl; oy *= maks / dl; }
    z.ox = ox; z.oy = oy;
    z.el.style.transform = `translate(${(z.x * s.k + s.x + ox).toFixed(1)}px, ${(z.y * s.k + s.y + oy).toFixed(1)}px)`;
  });
}

// odcinek napisu ulicy (od środka w obie strony) wchodzi w zajęty prostokąt?
function ulicaZaslonieta(u, s, zajete) {
  const dl = u.n * 3.4 + 6, ax = u.x * s.k + s.x, ay = u.y * s.k + s.y;
  for (let t = -1; t <= 1; t += 0.25) {
    const x = ax + u.kx * dl * t, y = ay + u.ky * dl * t;
    if (zajete.some((o) => x > o.pr[0] - 5 && x < o.pr[2] + 5 && y > o.pr[1] - 5 && y < o.pr[3] + 5)) return true;
  }
  return false;
}

function uloz(s, ramka) {
  if (!s || !ramka.isConnected) return;
  const W = ramka.clientWidth, H = ramka.clientHeight, zajete = [];
  rozsun(s);
  const ekran = (z) => [z.x * s.k + s.x + z.ox, z.y * s.k + s.y + z.oy];
  const r0 = ramka.getBoundingClientRect();
  for (const el of ramka.querySelectorAll(".lm-pasek, .lm-zoom, .lm-osm, .lm-leg-przycisk, .lm-z-legenda .lm-legenda")) {   // napisy nie wchodzą pod przyciski mapy
    const r = el.getBoundingClientRect();
    zajete.push({ pr: [r.left - r0.left - 4, r.top - r0.top - 4, r.right - r0.left + 4, r.bottom - r0.top + 4], czyj: null });
  }
  for (const z of ZNAKI) {   // żetony zajmują miejsce pierwsze
    if (!z.bok || !z.widac || (czysta && !zostaje(z))) continue;
    const [ax, ay] = ekran(z);
    zajete.push({ pr: [ax - z.bok / 2, ay - z.bok * 0.86, ax + z.bok / 2, ay + z.bok * 0.14], czyj: z, zeton: true });
  }
  for (const z of ZNAKI.filter((q) => q.w).sort((a, b) => a.waznosc - b.waznosc)) {
    const n = z.napis || z.el, [ax, ay] = ekran(z);
    let gdzie = null;
    if (z.widac && (poziom > 1 || z.waznosc <= 4 || z.waznosc === 9) && !(czysta && z.napis && !zostaje(z)) && ax > -40 && ax < W + 40 && ay > -40 && ay < H + 40) {
      const b = z.bok, w = z.w, h = z.h;
      // szyld żetonu: pod, nad, z prawej, z lewej; napis na planszy: na środku, wyżej, niżej
      const miejsca = z.napis ? [[-w / 2, b * 0.14 + 4], [-w / 2, -b * 0.86 - 4 - h], [b / 2 + 4, -b * 0.36 - h / 2], [-b / 2 - 4 - w, -b * 0.36 - h / 2]]
        : [[-w / 2, -h / 2], [-w / 2, -h * 1.7], [-w / 2, h * 0.7], [-w / 2, -h * 2.9], [-w / 2, h * 1.9]];
      const wolne = (p, tylkoNapisy) => { const pr = [ax + p[0] - 2, ay + p[1] - 1, ax + p[0] + w + 2, ay + p[1] + h + 1]; return pr[0] >= 0 && pr[1] >= 0 && pr[2] <= W && pr[3] <= H && !zajete.some((o) => o.czyj !== z && (!tylkoNapisy || !o.zeton) && nachodzi(pr, o.pr)); };
      gdzie = miejsca.find((p) => wolne(p, false)) || (z.waznosc <= 2 ? miejsca.find((p) => wolne(p, true)) : null);   // strefa i Twój lokal mogą leżeć na żetonach
      if (gdzie) zajete.push({ pr: [ax + gdzie[0], ay + gdzie[1], ax + gdzie[0] + w, ay + gdzie[1] + h], czyj: z });
    }
    n.classList.toggle("lm-schowany", !gdzie);
    if (!gdzie) continue;
    if (z.napis) n.style.transform = `translate(${gdzie[0].toFixed(1)}px, ${gdzie[1].toFixed(1)}px)`;
    else { z.dx = gdzie[0]; z.dy = gdzie[1]; z.el.style.transform = `translate(${(ax + z.dx).toFixed(1)}px, ${(ay + z.dy).toFixed(1)}px)`; }
  }
  if (poziom > 1) for (const u of ULICE) u.el.classList.toggle("lm-schowany", ulicaZaslonieta(u, s, zajete));   // nazwa ulicy nie wchodzi pod żeton ani tabliczkę
}

export const nowaMapa = {
  info: "Mapa Lublina na prawdziwych granicach dzielnic. Dziesięć kolorowych dzielnic to strefy gry – w każdej są inni klienci i inne czynsze; "
    + "szare dzielnice są tłem. Z daleka widać same nazwy dzielnic i Twój lokal, a żetony budynków pojawiają się przy przybliżaniu. "
    + "Kliknij budynek, żeby wejść (banki są w kamienicy przy Krakowskim Przedmieściu, agencje reklamowe w biurowcu przy Zana), "
    + "albo lokal, żeby go obejrzeć i wynająć lub kupić. Mapę przybliżysz kółkiem myszy, dwoma palcami, dwuklikiem albo przyciskami + i −, "
    + "a przesuniesz przeciągając. Pasek skrótów prowadzi do Twojego lokalu, banków, hurtowni, raportu i wysłania decyzji. "
    + "Przyciski nad mapą pokazują czynsze, popyt i konkurencję w strefach oraz zmieniają paletę kolorów. Dane mapy: © autorzy OpenStreetMap.",

  decyzje(c, pomoc) {
    C = c; P = pomoc;
    if (BLAD) return `<div class="komunikat">Nie udało się wczytać danych mapy (${esc(BLAD)}). <button class="btn maly jasny" data-akcja="mapa-wersja">Pokaż starą mapę</button></div>`;
    if (!DANE) { wczytane.then(() => { if (C === c) c.rysuj(); }); return `<div class="ladowanie">Wczytywanie mapy…</div>`; }
    const M = c.kat.mapa, wart = P.wartosciWarstwy(c), zakres = wart ? zakresWartosci(wart) : null;
    const brak = c.v.lokale && !c.v.lokale.moje.length
      ? `<div class="komunikat">Nie masz jeszcze lokalu – kliknij wolny lokal albo działkę (żeton z przerywaną ramką).</div>` : "";
    return `${brak}${P.parkiNaMapie(c.v, c.kat, c.edycja)}${pasekUstawien(c)}
      <div class="lmapa${wart ? " warstwa" : ""}${P.UST.legenda ? " lm-z-legenda" : ""}" id="lmapa" tabindex="0" role="application" aria-label="Mapa Lublina – strzałki przesuwają, plus i minus przybliżają">
        <svg class="lmapa-svg" aria-hidden="true">${rysunek(M, wart, zakres)}</svg>
        <div class="lmapa-nakladka">${napisy(M, wart)}${znakiMiejsc(M)}${znakiBudynkow(c)}${znakiLokali(c)}</div>
        ${pasekSkrotow()}
        <div class="lm-zoom"><button type="button" data-akcja="lmapa-zoom" data-z="1.6" aria-label="Przybliż" title="Przybliż">${ikona("plus", 20)}</button>
          <button type="button" data-akcja="lmapa-zoom" data-z="0.625" aria-label="Oddal" title="Oddal">${ikona("minus", 20)}</button>
          <button type="button" data-akcja="lmapa-zoom" data-z="0" aria-label="Całe miasto" title="Całe miasto">${ikona("calosc", 20)}</button></div>
        ${legenda(c)}
        <a class="lm-osm" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© autorzy OpenStreetMap</a>
      </div>`;
  },

  po(c) {
    const ramka = document.getElementById("lmapa");
    if (!ramka || !DANE) return;
    widok?.zniszcz();
    poziom = 0; ulice = false;
    ULICE = [...ramka.querySelectorAll(".lm-ulica-napis")].map((el) => ({ el, x: +el.dataset.x, y: +el.dataset.y, kx: +el.dataset.kx, ky: +el.dataset.ky, n: +el.dataset.n }));
    ZNAKI = [...ramka.querySelectorAll(".lmapa-nakladka > [data-x]")].map((el) => ({ el, x: +el.dataset.x, y: +el.dataset.y, dx: 0, dy: 0, ox: 0, oy: 0,
      napis: el.querySelector(".lm-podpis"), waznosc: waznosc(el) }));
    ostatnieUlozenie = 0;
    // na początku widać strefy gry (od Czechowa po Zalew), a nie całe granice miasta
    const p = [...ramka.querySelectorAll(".lm-strefa-napis")].map((el) => [+el.dataset.x, +el.dataset.y]);
    const start = p.length ? [Math.min(...p.map((q) => q[0])) - 3200, Math.min(...p.map((q) => q[1])) - 2600, Math.max(...p.map((q) => q[0])) + 3200, Math.max(...p.map((q) => q[1])) + 1800] : null;
    widok = utworzWidok(ramka, { zasieg: DANE.zasieg, start, stan: WIDOK, naZmiane });
  },

  akcje: {
    "lmapa-zoom": (el) => { const z = +el.dataset.z; if (z) widok?.przybliz(z); else widok?.calosc(); },
    "lmapa-wejdz": (el) => window.lukrum.otworzWnetrze(el.dataset.id),
    "lmapa-lokal": (el, c) => P.akcje["mapa-lokal"](el, c),
    "lmapa-miejsce": (el, c) => P.akcje["mapa-miejsce"](el, c),
    "lmapa-legenda": (el) => {
      P.UST.legenda = !P.UST.legenda; P.zapiszUst();
      el.setAttribute("aria-expanded", P.UST.legenda);
      const ramka = document.getElementById("lmapa");
      ramka.classList.toggle("lm-z-legenda", P.UST.legenda);
      ostatnieUlozenie = 0; if (WIDOK) uloz(WIDOK, ramka);
    },
    "lmapa-punkt": (el) => {
      const m = (DANE.dodatkowe || []).find((x) => x.id === el.dataset.id);
      if (m) okno(esc(m.nazwa), `<p>${esc(m.opis)}</p><p class="podpowiedz">Punkt orientacyjny na mapie Lublina – nie wpływa na grę.</p>`);
    },
    "lmapa-firma": (el, c) => { zamknijOkno(); P.akcje["mapa-budynek"](el, c); },
    "lmapa-wyglad": (el) => window.lukrum.wyglad.ustaw({ paleta: el.dataset.paleta, tryb: el.dataset.tryb }),
    "lmapa-skrot": (el, c) => {
      const s = el.dataset.s, M = c.kat.mapa;
      if (s === "raport" || s === "wyslij") return c.dostepna(s) ? c.idz(s) : toast("Ta część gry nie jest jeszcze dostępna w tej rundzie.");
      if (s === "lokal") {
        const moj = (c.v.lokale?.moje || []).map((l) => M.lokale.find((x) => x.id === l.id)?.geo).filter(Boolean).map(xy)[0];
        if (!moj) return toast("Nie masz jeszcze lokalu – wybierz wolny lokal albo działkę (żeton z przerywaną ramką).");
        return widok?.lecDo(moj[0], moj[1], 0.9);
      }
      if (s === "bank") { const z = (M.zespoly || []).find((x) => x.id === "kamienica_bankowa"); if (z?.geo) widok?.lecDo(...xy(z.geo), 0.9); return; }
      const p = P.budynkiGry(c.v, M.budynki).filter((b) => b.rodzaj === "dostawca" && b.geo).map((b) => xy(b.geo));
      if (p.length) widok?.dopasuj([Math.min(...p.map((q) => q[0])), Math.min(...p.map((q) => q[1])), Math.max(...p.map((q) => q[0])), Math.max(...p.map((q) => q[1]))], 90);
    },
  },
};
