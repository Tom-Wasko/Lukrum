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
const POZIOMY = [0.12, 0.4];   // px na metr: poniżej – całe miasto, pomiędzy – dzielnica, powyżej – ulica i budynek
const PALETY = { bar: "Bar mleczny", pewex: "Pewex", wysoka: "Wysoka widoczność" };
// odcień strefy (4 odcienie z palety; sąsiednie strefy mają różne) – strefę i tak podpisuje nazwa, nie sam kolor
const ODCIEN = { stare_miasto: 1, centrum: 2, akademickie: 3, politechnika: 1, dworzec: 3, zygmuntowskie: 2, lsm_czuby: 4,
  czechow: 4, felin: 2, zemborzyce: 3 };
const SKROTY = [["lokal", "lokal", "Mój lokal"], ["bank", "bank", "Banki"], ["hurt", "dostawca", "Hurtownie i sklepy"],
  ["raport", "raport", "Raport rundy"], ["wyslij", "wyslij", "Wyślij decyzje"]];

// punkty orientacyjne widoczne już na widoku całego miasta (reszta pojawia się po przybliżeniu)
const DALEKO = new Set(["zamek", "arena", "lotnisko", "gorki_czechowskie", "skansen", "dworzec_glowny", "plac_litewski"]);

let DANE = null, BLAD = null, WIDOK = null, widok = null, C = null, P = null, ZNAKI = [], poziom = 0, ulice = false;

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
  // strefy bez własnych dzielnic: kształt wycięty z prawdziwej dzielnicy (pobierz_osm.py: OBSZARY)
  const serca = Object.entries(D.obszary || {}).filter(([k]) => M.strefy[k]).map(([k, s]) =>
    `<path class="lm-strefa lm-obszar lm-t${ODCIEN[k] || 1}" d="${s.d}"${sila(k)}/>`).join("");
  const zielen = (r) => D.zielen.filter((z) => z.rodzaj === r).map((z) => z.d).join("");
  const klasa = (kl) => D.drogi.filter((x) => x.klasa === kl).map((x) => x.d).join("");
  const drogi = ["lokalna", "zbiorcza", "glowna", "ekspresowa"].map((kl) => { const d = klasa(kl); return `<path class="lm-droga-obrys lm-${kl}" d="${d}"/><path class="lm-droga lm-${kl}" d="${d}"/>`; }).join("");
  const napisy = D.drogi.filter((x) => x.napis).map((x, i) =>
    `<path id="lm-ul-${i}" d="${x.napis}" fill="none"/><text class="lm-ulica-napis${x.dl < 900 ? " lm-krotka" : ""}" dy=".35em"><textPath href="#lm-ul-${i}" startOffset="50%">${esc(x.nazwa)}</textPath></text>`).join("");
  return `<g id="lmapa-swiat"><path class="lm-miasto" d="${D.dzielnice.map((dz) => dz.d).join("")}"/>${dzielnice}${serca}
    <path class="lm-zielen lm-las" d="${zielen("las")}"/><path class="lm-zielen lm-laka" d="${zielen("laka")}${zielen("cmentarz")}"/><path class="lm-zielen lm-park" d="${zielen("park")}"/>
    <path class="lm-woda" d="${D.woda.map((w) => w.d).join("")}"/><path class="lm-rzeka" d="${D.rzeki.map((r) => r.d).join("")}"/>
    <path class="lm-granice" d="${D.dzielnice.map((dz) => dz.d).join("")}"/>
    <g id="lmapa-ulice"></g><path class="lm-kolej-obrys" d="${D.kolej}"/><path class="lm-kolej" d="${D.kolej}"/>${drogi}<g class="lm-ulice-napisy">${napisy}</g></g>`;
}

// --- znaczniki (HTML nad rysunkiem – prawdziwe przyciski, stały rozmiar na ekranie) ---
const znak = (x, y, klasa, akcja, id, nazwa, opis, tresc, kolej = 1) =>
  `<button type="button" class="lm-znak ${klasa}" data-akcja="${akcja}" data-id="${esc(id)}" data-x="${x}" data-y="${y}" style="z-index:${kolej}" aria-label="${esc(nazwa)}. ${esc(opis)}" title="${esc(opis)}">${tresc}<span class="lm-podpis">${esc(nazwa)}</span></button>`;

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
      `<span class="lm-kafel">${zeton(b.id, b.rodzaj)}${sprawa ? `<i class="lm-plakietka lm-uwaga" aria-hidden="true">!</i>` : ""}</span>`, sprawa ? 5 : zielony ? 2 : 3));
  }
  return html.join("");
}

function znakiLokali(c) {
  const { v, kat, d } = c, M = kat.mapa;
  if (!v.lokale) return "";
  const wybrany = P.wybranyLokal(d)?.id;
  return M.lokale.filter((l) => (l.od_rundy || 1) <= v.runda && (!v.lokale.na_mapie || v.lokale.na_mapie.includes(l.id)) && DANE.lokale[l.id]).map((l) => {
    const moje = (v.lokale.moje || []).find((x) => x.id === l.id), kto = v.lokale.zajete[l.id];
    const stan = moje ? (wybrany === l.id ? "wybrany" : "moj") : kto ? "zajety" : "wolny";
    const op = (v.lokale.opinie || {})[l.id], dzialka = l.typ === "dzialka" && (stan === "wolny" || (moje && !moje.dziala));
    const opis = stan === "wolny" ? `Wolny ${l.typ === "dzialka" ? "teren pod budowę" : "lokal"} (${l.adres}). Kliknij, żeby wynająć albo kupić.`
      : moje ? `${stan === "wybrany" ? "Lokal wybrany przez Ciebie w tej rundzie" : "Twój lokal"} (${l.adres}). Kliknij, żeby wejść.`
        : `Lokal firmy ${nazwaFirmy(v, kto)} (${l.adres}). Kliknij, żeby obejrzeć lokal i opinie.`;
    const kolor = stan === "zajety" ? marka(v, kto).kolor : moje ? kolorFirmy(v, v.firma) : null;
    const plakietka = stan === "moj" ? "★" : stan === "wybrany" ? "✓" : "";
    const ocena = op && P.UST.opinie ? `<span class="lm-ocena" aria-hidden="true">★ ${op.ocena.toFixed(1).replace(".", ",")}</span>` : "";
    return znak(...DANE.lokale[l.id], `lm-lokal lm-${stan}`, moje ? "lmapa-wejdz" : "lmapa-lokal", l.id, l.nazwa, opis,
      `<span class="lm-kafel"${kolor ? ` style="--firma:${esc(kolor)}"` : ""}>${zeton(null, dzialka ? "dzialka" : "lokal")}${plakietka ? `<i class="lm-plakietka" aria-hidden="true">${plakietka}</i>` : ""}</span>${ocena}`,
      moje ? 8 : stan === "wolny" ? 6 : 5);
  }).join("");
}

// punkty orientacyjne: miejsca z miasto.yaml i dodatkowe punkty Lublina z danych mapy (lublin.json: dodatkowe)
const miejsce = (xyM, akcja, m) => znak(...xyM, `lm-miejsce${DALEKO.has(m.id) ? " lm-daleko" : ""}`, akcja, m.id, m.nazwa,
  `${m.opis} Punkt orientacyjny – nie wpływa na grę.`, `<span class="lm-kafel">${zeton(m.id)}</span>`, 1);
const znakiMiejsc = (M) => (M.miasto?.miejsca || []).filter((m) => DANE.miejsca[m.id]).map((m) => miejsce(DANE.miejsca[m.id], "lmapa-miejsce", m)).join("")
  + (DANE.dodatkowe || []).map((m) => miejsce(m.xy, "lmapa-punkt", m)).join("");

function napisy(M, wart) {
  const D = DANE, czyja = strefyDzielnic(M), srodki = {};
  for (const dz of D.dzielnice) if (czyja[dz.nazwa]) (srodki[czyja[dz.nazwa]] ||= []).push(dz.srodek);
  let html = "";
  for (const [k, s] of Object.entries(M.strefy)) {
    const p = D.obszary?.[k]?.srodek || (srodki[k] && [0, 1].map((i) => srodki[k].reduce((a, q) => a + q[i], 0) / srodki[k].length));
    if (!p) continue;
    const wartosc = wart ? `<small>${esc(wart[k] ? wart[k][1] : "brak danych")}</small>` : "";
    html += `<div class="lm-napis lm-strefa-napis${D.obszary?.[k] ? " lm-mala" : ""}" data-x="${p[0]}" data-y="${p[1]}">${esc(s.nazwa)}${wartosc}</div>`;
  }
  for (const dz of D.dzielnice) if (!czyja[dz.nazwa]) html += `<div class="lm-napis lm-tlo-napis" data-x="${dz.srodek[0]}" data-y="${dz.srodek[1]}">${esc(dz.nazwa)}</div>`;
  const rzeka = D.woda.find((w) => w.nazwa && /Zalew/.test(w.nazwa));
  if (rzeka) html += `<div class="lm-napis lm-woda-napis" data-x="${rzeka.srodek[0]}" data-y="${rzeka.srodek[1] + 500}">${esc(rzeka.nazwa)}</div>`;
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

const wzor = (klasa, id, rodzaj, znakStanu = "") => `<i class="lm-pionek ${klasa}">${zeton(id, rodzaj)}${znakStanu ? `<b>${znakStanu}</b>` : ""}</i>`;
const legenda = (c) => `<div class="lm-legenda">
  ${c.v.lokale ? `<span>${wzor("lm-moj", null, "lokal", "★")}Twój lokal</span><span>${wzor("lm-wybrany", null, "lokal", "✓")}wybrany w tej rundzie</span>
  <span>${wzor("lm-wolny", null, "lokal")}wolny lokal</span><span>${wzor("lm-wolny", null, "dzialka")}wolna działka</span>
  <span>${wzor("lm-zajety", null, "lokal")}lokal innej firmy (markiza w jej kolorze)</span>` : ""}
  <span>${wzor("lm-budynek", "kamienica_bankowa")}budynek – kliknij, żeby wejść</span><span>${wzor("lm-zielony", null, "park")}park albo woda</span>
  <span>${wzor("lm-miejsce", "zamek")}punkt orientacyjny (bez podstawki)</span>
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
  for (const z of ZNAKI) z.el.style.transform = `translate(${(z.x * s.k + s.x).toFixed(1)}px, ${(z.y * s.k + s.y).toFixed(1)}px)`;
  const p = s.k < POZIOMY[0] ? 1 : s.k < POZIOMY[1] ? 2 : 3;
  if (p !== poziom) {
    poziom = p;
    ramka.dataset.poziom = p;
    if (p === 3 && !ulice) {   // ulice osiedlowe dorysowujemy dopiero z bliska
      ulice = true;
      const g = ramka.querySelector("#lmapa-ulice");
      if (g) g.innerHTML = `<path class="lm-uliczka" d="${Object.values(DANE.ulice).join("")}"/>`;
    }
  }
}

export const nowaMapa = {
  info: "Mapa Lublina na prawdziwych granicach dzielnic. Kolorowe pola to strefy gry – w każdej są inni klienci i inne czynsze. "
    + "Kliknij budynek, żeby wejść (banki są w kamienicy przy Krakowskim Przedmieściu, biura i agencje w biurowcu przy Zana), "
    + "albo lokal, żeby go obejrzeć i wynająć lub kupić. Mapę przybliżysz kółkiem myszy, dwoma palcami, dwuklikiem albo przyciskami + i −, "
    + "a przesuniesz przeciągając. Pasek skrótów prowadzi do Twojego lokalu, banków, hurtowni, raportu i wysłania decyzji. "
    + "Przyciski nad mapą pokazują czynsze, popyt i konkurencję w strefach oraz zmieniają paletę kolorów. Dane mapy: © autorzy OpenStreetMap.",

  decyzje(c, pomoc) {
    C = c; P = pomoc;
    if (BLAD) return `<div class="komunikat">Nie udało się wczytać danych mapy (${esc(BLAD)}). <button class="btn maly jasny" data-akcja="mapa-wersja">Pokaż starą mapę</button></div>`;
    if (!DANE) { wczytane.then(() => { if (C === c) c.rysuj(); }); return `<div class="ladowanie">Wczytywanie mapy…</div>`; }
    const M = c.kat.mapa, wart = P.wartosciWarstwy(c), zakres = wart ? zakresWartosci(wart) : null;
    const brak = c.v.lokale && !c.v.lokale.moje.length
      ? `<div class="komunikat">Nie masz jeszcze lokalu – kliknij na mapie wolny lokal albo działkę (znak z przerywaną ramką).</div>` : "";
    return `${brak}${P.parkiNaMapie(c.v, c.kat, c.edycja)}${pasekUstawien(c)}
      <div class="lmapa${wart ? " warstwa" : ""}" id="lmapa" tabindex="0" role="application" aria-label="Mapa Lublina – strzałki przesuwają, plus i minus przybliżają">
        <svg class="lmapa-svg" aria-hidden="true">${rysunek(M, wart, zakres)}</svg>
        <div class="lmapa-nakladka">${napisy(M, wart)}${znakiMiejsc(M)}${znakiBudynkow(c)}${znakiLokali(c)}</div>
        ${pasekSkrotow()}
        <div class="lm-zoom"><button type="button" data-akcja="lmapa-zoom" data-z="1.6" aria-label="Przybliż" title="Przybliż">${ikona("plus", 20)}</button>
          <button type="button" data-akcja="lmapa-zoom" data-z="0.625" aria-label="Oddal" title="Oddal">${ikona("minus", 20)}</button>
          <button type="button" data-akcja="lmapa-zoom" data-z="0" aria-label="Całe miasto" title="Całe miasto">${ikona("calosc", 20)}</button></div>
        <a class="lm-osm" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© autorzy OpenStreetMap</a>
      </div>${legenda(c)}`;
  },

  po(c) {
    const ramka = document.getElementById("lmapa");
    if (!ramka || !DANE) return;
    widok?.zniszcz();
    poziom = 0; ulice = false;
    ZNAKI = [...ramka.querySelectorAll(".lmapa-nakladka > [data-x]")].map((el) => ({ el, x: +el.dataset.x, y: +el.dataset.y }));
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
        const moj = (c.v.lokale?.moje || []).map((l) => DANE.lokale[l.id]).find(Boolean);
        if (!moj) { widok?.calosc(); return toast("Nie masz jeszcze lokalu – wybierz wolny lokal albo działkę (znak z przerywaną ramką)."); }
        return widok?.lecDo(moj[0], moj[1], 0.9);
      }
      if (s === "bank") { const z = (M.zespoly || []).find((x) => x.id === "kamienica_bankowa"); if (z?.geo) widok?.lecDo(...xy(z.geo), 0.9); return; }
      const p = P.budynkiGry(c.v, M.budynki).filter((b) => b.rodzaj === "dostawca" && b.geo).map((b) => xy(b.geo));
      if (p.length) widok?.dopasuj([Math.min(...p.map((q) => q[0])), Math.min(...p.map((q) => q[1])), Math.max(...p.map((q) => q[0])), Math.max(...p.map((q) => q[1]))], 90);
    },
  },
};
