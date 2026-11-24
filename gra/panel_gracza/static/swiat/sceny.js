// Sceny wnętrz (1220×612): rysunek SVG z symboli static/grafiki/zestaw.svg i nakładka HTML z klikalnymi miejscami.
// Każda funkcja zwraca { s: wnętrze <svg>, h: nakładka (przyciski .hot, postacie .osoba), opis: tekst dla czytników }.
// Układ wnętrza kebaba pochodzi z podglądu 4 (narzedzia/grafiki/), reszta scen jest rysowana tu z prostych kształtów
// w kolorach palety (motywy/zmienne.css) – żadnych kolorów na sztywno.
import { esc } from "../zakladki/wspolne.js";

let ROZM = {};
export const ustawRozmiary = (r) => { ROZM = r || {}; };
export const rozmiarGrafiki = (n) => ROZM[n] || [0, 0];

// --- cegiełki -----------------------------------------------------------------------------------------------------
const u = (n, x, y, s = 1, extra = "") => {
  const [w, h] = ROZM[n] || [0, 0];
  return `<use href="#g-${n}" x="${x}" y="${y}" width="${w * s}" height="${h * s}" ${extra}/>`;
};
// postać wklejona w całości (nie <use>), żeby każda mogła mieć własną minę (atrybut data-mina)
function osobaSvg(n, cx, stopy, s, mina, i = 0) {
  const sym = document.getElementById(`g-postacie-${n}`);
  return `<g class="wejscie" style="animation-delay:${i * 0.12}s"><svg x="${cx - 60 * s}" y="${stopy - 256 * s}" width="${120 * s}" height="${260 * s}"
    viewBox="0 0 120 260" data-mina="${mina}">${sym ? sym.innerHTML : ""}</svg></g>`;
}
const napis = (x, y, t, rozm, kolor, font, extra = "") =>
  `<text x="${x}" y="${y}" fill="${kolor}" style="font-family:var(--font-${font});font-size:${rozm}px" ${extra}>${esc(t)}</text>`;
const pos = (x, y, w, h) => `left:${(x / 12.2).toFixed(2)}%;top:${(y / 6.12).toFixed(2)}%;width:${(w / 12.2).toFixed(2)}%;height:${(h / 6.12).toFixed(2)}%`;
// napis dopasowany do szerokości pola (długie nazwy firm na szyldach i tabliczkach)
const napisW = (x, y, t, rozm, szer, kolor, font, extra = "") => {
  const dl = String(t).length * rozm * (font === "gruby" ? 0.68 : 0.5);
  return napis(x, y, t, dl > szer ? Math.max(8, rozm * szer / dl) : rozm, kolor, font, `text-anchor="middle" ${extra}`);
};

/** Klikalne miejsce. p: { cel?, miejsce?, karta?, szukaj?, etykieta, stan?, klasaStanu?, zablokowane? } – jedno z cel / miejsce / karta. */
export function hot(p, x, y, w, h) {
  const dane = (p.cel ? ` data-k="${esc(p.cel)}"` : "") + (p.miejsce ? ` data-m="${esc(p.miejsce)}"` : "") + (p.karta ? ` data-karta="${esc(p.karta)}"` : "")
    + (p.szukaj ? ` data-szukaj="${esc(p.szukaj)}"` : "") + (p.miejsce && p.odsyla ? ` data-odsyla="${esc(p.odsyla)}"` : "");
  const stan = p.stan ? `<span class="stan ${p.klasaStanu || ""}">${esc(p.stan)}</span>` : "";
  return `<button class="hot${y < 60 ? " podpis-dol" : ""}${p.zablokowane ? " zablokowane" : ""}" data-akcja="sw-hot"${dane} aria-label="${esc(p.etykieta)}${p.stan ? ` (${esc(p.stan)})` : ""}"
    style="${pos(x, y, w, h)}"><span class="podpis" aria-hidden="true">${esc(p.etykieta)}</span>${stan}</button>`;
}

const tloZwykle = () => u("dekor-sciana-podstawowy", 0, 0) + u("dekor-podloga-podstawowy", 0, 380);
const ZNAK_DYMKU = `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#g-ikony-dymek"/></svg>`;

// --- kebab ----------------------------------------------------------------------------------------------------------
const MINA_KL = (ocena) => (ocena == null ? "zwykla" : ocena >= 4 ? "dobra" : ocena < 3 ? "zla" : "zwykla");
const SZYLD_KOLOR = { podstawowy: "var(--g-czern)", prl: "var(--akcent)", nowoczesny: "var(--papier)", studencki: "var(--g-czern)", rodzinny: "var(--g-biel)" };
const SUFIT = { kamienica: 20, pawilon: 20, dworzec: 18 };
const GOSCIE = { kamienica: ["gosc-turystka", "gosc-student"], pawilon: ["gosc-sasiadka", "gosc-student"], dworzec: ["gosc-podrozny", "gosc-student"] };

/** Poziom tłoku z obciążenia załogi 0–1 (progi jak `tlok_prog` w dane/mapa/klienci.yaml): kolejka gości, napis i znak. */
export function poziomTloku(t) {
  if (t == null || Number.isNaN(Number(t))) return null;
  if (t >= 0.85) return { poziom: "duzy", napis: "duży", znak: "▲", kolejka: 5 };
  if (t >= 0.6) return { poziom: "sredni", napis: "średni", znak: "–", kolejka: 3 };
  return { poziom: "maly", napis: "mały", znak: "✓", kolejka: 1 };
}

/**
 * Wnętrze działającego kebaba.
 * d: { typ, poziom (1–3), dekor {sciany, szyld, dodatki, meble}, szyld (napis), menu [{nazwa, cena, brak}], obsluga [{id, imie, miejsce, mina}],
 *      mowiacy [{kto, imie, tekst, rodzaj, klik}], wujek {tekst}|null, ocena, tlok (0–1), punkty {klucz: {…hot}} }
 */
export function scenaKebabu(d) {
  const p = Math.min(3, Math.max(1, d.poziom || 1)), dk = d.dekor, typ = d.typ;
  let s = u(`dekor-sciana-${dk.sciany}`, 0, 0) + u(`dekor-podloga-${dk.sciany}`, 0, 380) + u(`tla-typ-${typ}`, 0, 0) + u(`wnetrze-okno-${typ}`, 30, 104);
  s += u(`dekor-lampa-${dk.meble}`, 106, SUFIT[typ], 0.8) + u(`dekor-lampa-${dk.meble}`, 606, SUFIT[typ], 0.8);
  s += u(`dekor-szyld-${dk.szyld}`, 300, 60);
  s += napisW(430, 102, d.szyld, 25, 236, SZYLD_KOLOR[dk.szyld] || "var(--g-czern)", "gruby", `letter-spacing="1"${dk.szyld === "prl" ? ' class="neon"' : ""}`);
  s += u("wnetrze-portret-wujka", 310, 150);
  if (dk.dodatki === "podstawowy") s += napis(481, 194, "MIEJSCE NA DODATKI", 13, "var(--tusz)", "szyld", 'text-anchor="middle" letter-spacing="1.5" opacity=".55"');
  else s += u(`dekor-zdjecie-${dk.dodatki}`, 392, 152) + u(`dekor-plakat-${dk.dodatki}`, 505, 140) + u(`dekor-roslina-${dk.dodatki}`, 232, 294);
  // tablica z cenami (najwyżej 4 dania)
  const kreda = p === 3 ? "var(--g-czern)" : "var(--g-biel)";
  s += u(`wnetrze-tablica-${p}`, 680, 44) + napis(810, p === 1 ? 70 : 68, "MENU", 17, p === 1 ? kreda : "var(--papier)", "szyld", 'text-anchor="middle" letter-spacing="5"');
  d.menu.slice(0, 4).forEach((m, i) => {
    const y = p === 1 ? 100 + i * 20 : 104 + i * 22, op = m.brak ? ' opacity=".45"' : "";
    const nazwa = m.nazwa.length > 17 ? `${m.nazwa.slice(0, 16)}…` : m.nazwa;
    s += napis(698, y, nazwa.toUpperCase(), 13, kreda, "szyld", `letter-spacing=".6"${op}`)
      + napis(922, y, m.cena.toFixed(2).replace(".", ","), 15, kreda, "gruby", `text-anchor="end"${op}`);
    if (m.brak) s += `<rect x="826" y="${y - 13}" width="44" height="15" rx="2" fill="var(--akcent)"/>` + napis(848, y - 1.5, "BRAK", 11, "var(--papier)", "szyld", 'text-anchor="middle" letter-spacing=".8"');
  });
  if (!d.menu.length) s += napis(810, 130, "MENU JESZCZE PUSTE", 14, kreda, "szyld", 'text-anchor="middle" letter-spacing="1.5" opacity=".7"');
  // obsługa za ladą, sprzęt
  s += u("wnetrze-drzwi-zaplecze", 1100, 140);
  const kuchnia = d.obsluga.filter((o) => o.miejsce === "kuchnia"), lada = d.obsluga.filter((o) => o.miejsce !== "kuchnia");
  if (kuchnia[0]) s += osobaSvg("obsluga-kucharz", 900, 424, 0.88, kuchnia[0].mina);
  if (lada[0]) s += osobaSvg("obsluga-kasjerka", 775, 424, 0.88, lada[0].mina);
  s += u(`wnetrze-rozen-${p}`, 955, 140) + u(`wnetrze-lada-${p}`, 625, 300) + u(`wnetrze-kasa-${p}`, 640, 276);
  s += u(`dekor-meble-${dk.meble}`, 40, 452);
  // tablica wyników tygodnia (podróż 03/wyniki): wyraźny przycisk między zdjęciami a ladą
  s += `<rect x="610" y="204" width="132" height="50" rx="6" fill="var(--g-tablica)" stroke="var(--g-czern)" stroke-width="2"/>`
    + napis(676, 226, "WYNIKI", 17, "var(--g-biel)", "gruby", 'text-anchor="middle" letter-spacing="2"')
    + napis(676, 245, "▲▼ tydzień", 12, "var(--g-biel)", "szyld", 'text-anchor="middle" opacity=".9"');
  // goście: najwyżej trzech mówiących, do tego wujek przy ważnych okazjach
  const osoby = [];
  let g = 0;
  [545, 425, 305].forEach((cx, i) => {
    const dm = d.mowiacy[i];
    if (!dm && i > 0) return;
    const plik = dm && dm.kto !== "gosc" ? `bywalec-${dm.kto}` : GOSCIE[typ][g++ % 2];
    s += osobaSvg(document.getElementById(`g-postacie-${plik}`) ? plik : GOSCIE[typ][0], cx, 588, 1, dm?.klik === "propozycja" ? "zwykla" : MINA_KL(d.ocena), i);
    osoby.push({ cx, stopy: 588, nazwa: dm?.imie || "Gość", d: dm, nr: i });
  });
  // tłok (podróż 03/tłok): kolejka gości przy ladzie rośnie z obciążeniem załogi, a stan mówi też napis (nie sam kolor)
  const T = poziomTloku(d.tlok);
  if (T) {
    const zajete = new Set(osoby.map((o) => o.cx));
    [545, 425, 305, 185, 95].slice(0, T.kolejka).forEach((cx, i) => {
      if (zajete.has(cx)) return;
      s += osobaSvg(GOSCIE[typ][(i + 1) % 2], cx, 588 - (i % 2) * 6, 1, T.poziom === "duzy" ? "zla" : "zwykla", 4 + i);
    });
    s += `<g class="tlok-znak" data-tlok="${T.poziom}"><rect x="30" y="312" width="164" height="32" rx="6" fill="var(--g-tablica)" stroke="var(--g-czern)" stroke-width="2"/>`
      + napis(112, 334, `Tłok: ${T.napis} ${T.znak}`, 16, "var(--g-biel)", "gruby", 'text-anchor="middle" letter-spacing=".5"') + "</g>";
  }
  if (d.wujek) { s += osobaSvg("wujek", 690, 594, 1, "dobra", 3); osoby.push({ cx: 690, stopy: 594, nazwa: "Wujek", d: { ...d.wujek, rodzaj: "wujek" }, nr: "wujek" }); }
  const P = d.punkty;
  let h = "";
  const dodaj = (k, x, y, w, hh) => { if (P[k]) h += hot(P[k], x, y, w, hh); };
  dodaj("okno", 30, 104, 260, 200); dodaj("szyld", 296, 56, 268, 74); dodaj("wujek", 306, 146, 72, 88); dodaj("dodatki", 388, 136, 186, 104);
  dodaj("menu", 676, 40, 268, 148); dodaj("kasa", 636, 270, 118, 72); dodaj("wyniki", 610, 204, 132, 50); dodaj("lada", 762, 346, 308, 110); dodaj("kuchnia", 951, 136, 128, 206);
  dodaj("zaplecze", 1096, 136, 118, 246); dodaj("stoliki", 36, 474, 228, 132);
  if (lada[0] && P.pracownik) h += hot({ ...P.pracownik, etykieta: `${lada[0].imie}: lada` }, 742, 204, 66, 74);
  if (kuchnia[0] && P.pracownik) h += hot({ ...P.pracownik, etykieta: `${kuchnia[0].imie}: kuchnia` }, 866, 196, 68, 100);
  h += osobyHtml(osoby);
  return { s, h, opis: `Wnętrze kebaba: lada, rożen, tablica z menu${osoby.length ? ", goście przy ladzie" : ""}.` };
}

const RODZAJ_KROTKO = { cena_smak: "opinia", plotki: "plotka", propozycje: "propozycja", wos: "WOS", wujek: "wujek" };
function osobyHtml(osoby) {
  return osoby.map((o) => {
    const d = o.d;
    if (!d) return "";
    const klik = d.klik === "wos" ? "Kliknij: jak to jest z prawem?" : d.klik === "propozycja" ? (d.wybrana ? "Kliknij: zobacz odpowiedź" : "Kliknij: odpowiedz na propozycję") : "";
    const znak = d.klik === "propozycja" ? "!" : d.klik === "wos" ? "§" : ZNAK_DYMKU;
    const strona = o.cx < 180 ? " w-prawo" : o.cx > 1040 ? " w-lewo" : "";
    return `<button class="osoba" ${klik ? `data-akcja="sw-osoba" data-nr="${o.nr}"` : ""} style="${pos(o.cx - 46, o.stopy - 238, 92, 232)}"
      aria-label="${esc(o.nazwa)} mówi: ${esc(d.tekst)}${klik ? ` ${klik}` : ""}">
      <span class="znak${klik && !d.wybrana ? " wazny" : ""}" aria-hidden="true">${znak}</span>
      <span class="dymek r-${d.rodzaj}${strona}" aria-hidden="true"><span class="kto"><span>${esc(o.nazwa)}</span><span class="rodzaj">${RODZAJ_KROTKO[d.rodzaj] || ""}</span></span>${esc(d.tekst)}${klik ? `<span class="kliknij">${klik}</span>` : ""}</span></button>`;
  }).join("");
}

const zastepczy = (x, y, w, h, t) => `<rect class="zastepczy" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/>`
  + napis(x + w / 2, y + h / 2 + 6, t, 17, "var(--tusz)", "szyld", 'text-anchor="middle" letter-spacing="2" opacity=".8"');
const plakat = (tytul, tresc, kroki = "", dol = false) => `<div class="plakat-info${dol ? " dol" : ""}" role="status"><h2>${esc(tytul)}</h2>${kroki}<p>${tresc}</p></div>`;

/** Lokal bez sprzętu albo w urządzaniu. d: { typ, tytul, tekst (HTML), punkty {sprzet, menu, okno, ekipa, zaplecze} } */
export function scenaSurowa(d) {
  const typ = d.typ;
  let s = u("tla-stan-surowy-sciana", 0, 0) + u("tla-stan-surowy-podloga", 0, 380) + u(`tla-typ-${typ}`, 0, 0) + u(`wnetrze-okno-${typ}`, 30, 104)
    + u("wnetrze-zarowka", 236, SUFIT[typ], 0.8) + u("wnetrze-zarowka", 596, SUFIT[typ], 0.8) + u("wnetrze-drzwi-zaplecze", 1100, 140);
  s += zastepczy(680, 44, 260, 140, "TU: TABLICA MENU") + zastepczy(955, 140, 120, 200, "ROŻEN") + zastepczy(625, 340, 450, 120, "TU STANIE LADA I KASA") + zastepczy(300, 60, 260, 66, "SZYLD");
  s += u("wnetrze-drabina", 470, 250) + u("wnetrze-wiadro", 556, 420) + u("wnetrze-karton", 150, 500, 1.2) + u("wnetrze-karton", 250, 520, 1.2) + u("wnetrze-karton", 196, 440, 1.1);
  s += osobaSvg("budowlaniec", 340, 590, 1, "dobra", 0);
  const P = d.punkty;
  let h = plakat(d.tytul, d.tekst, `<div class="postep" aria-hidden="true"><i class="teraz"></i></div>`, true);
  if (P.sprzet) h += hot(P.sprzet, 625, 340, 450, 120) + hot({ ...P.sprzet, etykieta: "Rożen: kup sprzęt" }, 955, 140, 120, 196);
  if (P.menu) h += hot(P.menu, 680, 44, 260, 140);
  if (P.okno) h += hot(P.okno, 30, 104, 260, 200);
  if (P.zaplecze) h += hot(P.zaplecze, 1096, 136, 118, 246);
  return { s, h, opis: "Lokal w urządzaniu: surowe ściany, drabina, kartony." };
}

/** Działka w budowie. d: { etap (1–4), etapow, tekst (HTML), punkty {budowa, raty} } */
export function scenaBudowy(d) {
  const e = Math.min(4, Math.max(1, Math.ceil(d.etap * 4 / Math.max(1, d.etapow))));
  const s = u("tla-dzialka-teren", 0, 0) + u("stany-zuraw", 70, 60) + u(`stany-budowa-etap${e}`, 370, 170) + u("stany-tablica-budowy", 990, 392)
    + u("stany-betoniarka", 250, 470) + u("stany-projekt", 60, 500) + osobaSvg("budowlaniec", 890, 596, 1, "dobra", 0) + (e < 4 ? osobaSvg("budowlaniec", 330, 480, 0.8, "dobra", 1) : "");
  const kroki = Array.from({ length: d.etapow }, (_, i) => `<i class="${i + 1 < d.etap ? "zrobione" : i + 1 === d.etap ? "teraz" : ""}"></i>`).join("");
  let h = plakat(`Budowa: tydzień ${d.etap} z ${d.etapow}`, d.tekst, `<div class="postep" aria-hidden="true">${kroki}</div>`);
  if (d.punkty.budowa) h += hot(d.punkty.budowa, 370, 190, 560, 300);
  if (d.punkty.raty) h += hot(d.punkty.raty, 986, 388, 158, 138);
  return { s, h, opis: `Działka w budowie, etap ${d.etap} z ${d.etapow}.` };
}

/** Drużyna bez lokalu: pusta działka z tablicą. d: { tekst (HTML), punkty {biuro} } */
export function scenaBezLokalu(d) {
  const s = u("tla-dzialka-teren", 0, 0) + u("stany-tablica-budowy", 540, 330) + u("stany-projekt", 760, 470);
  let h = plakat("Jeszcze bez lokalu", d.tekst);
  if (d.punkty.biuro) h += hot(d.punkty.biuro, 536, 326, 158, 138);
  return { s, h, opis: "Pusta działka: drużyna nie ma jeszcze lokalu." };
}

// --- sceny ogólne: hol z drzwiami, okienka, hala -----------------------------------------------------------------------
const tabliczka = (cx, y, w, t1, t2 = "") => `<rect x="${cx - w / 2}" y="${y}" width="${w}" height="${t2 ? 46 : 30}" rx="3" fill="var(--g-tablica)" stroke="var(--tusz)" stroke-width="2"/>`
  + napisW(cx, y + 20, t1.toUpperCase(), 15, w - 12, "var(--g-biel)", "szyld", 'letter-spacing=".8"')
  + (t2 ? napisW(cx, y + 38, t2, 12.5, w - 12, "var(--g-biel)", "tekst", 'opacity=".85"') : "");
const lampa = (x) => `<path d="M${x} 0v38" stroke="var(--tusz)" stroke-width="2"/><path d="M${x - 22} 60q22-34 44 0z" fill="var(--g-tablica)" stroke="var(--tusz)" stroke-width="2"/>
  <ellipse cx="${x}" cy="62" rx="9" ry="5" fill="var(--g-biel)"/>`;
const donica = (x) => `<path d="M${x - 16} 560h32l-5 36h-22z" fill="var(--g-drewno)" stroke="var(--tusz)" stroke-width="2"/>
  <path d="M${x} 560c-4-30-26-40-30-64 16 4 26 18 30 34 0-34 10-52 24-64 6 30-6 60-20 94" fill="var(--g-zielen)" stroke="var(--g-zielen2)" stroke-width="2"/>`;

function drzwi(x, w, d, styl) {
  const y = 190, h = 320, cx = x + w / 2;
  const kolor = d.zablokowane ? "var(--g-sciana2)" : styl === "biurowiec" ? "var(--g-metal)" : "var(--g-drewno)";
  const szyba = styl === "biurowiec" || styl === "pasaz"
    ? `<rect x="${x + 14}" y="${y + 16}" width="${w - 28}" height="${h - 110}" rx="2" fill="var(--g-szklo)" opacity=".75" stroke="var(--tusz)" stroke-width="1.5"/>`
    : `<rect x="${x + 14}" y="${y + 18}" width="${w - 28}" height="${h * 0.36}" rx="3" fill="none" stroke="var(--g-drewno2)" stroke-width="3"/>
       <rect x="${x + 14}" y="${y + h * 0.5}" width="${w - 28}" height="${h * 0.42}" rx="3" fill="none" stroke="var(--g-drewno2)" stroke-width="3"/>`;
  const luk = styl === "kamienica" || styl === "brama" ? `<path d="M${x - 8} ${y}a${w / 2 + 8} 46 0 0 1 ${w + 16} 0" fill="var(--g-sciana2)" stroke="var(--tusz)" stroke-width="2"/>` : "";
  return `${luk}<rect x="${x - 8}" y="${y}" width="${w + 16}" height="${h + 2}" fill="var(--g-sciana2)" stroke="var(--tusz)" stroke-width="2"/>
    <rect x="${x}" y="${y + 8}" width="${w}" height="${h - 6}" fill="${kolor}" stroke="var(--tusz)" stroke-width="2"/>${szyba}
    <circle cx="${x + w - 14}" cy="${y + h * 0.56}" r="5" fill="var(--g-metal)" stroke="var(--tusz)" stroke-width="1.5"/>
    ${d.zablokowane ? `<path d="M${cx - 9} ${y + 150}h18v16h-18zM${cx - 5} ${y + 150}v-7a5 5 0 0 1 10 0v7" fill="none" stroke="var(--tusz)" stroke-width="2.5"/>` : ""}
    ${tabliczka(cx, y - (luk ? 100 : 62), Math.min(w + 22, 190), d.nazwa, d.podpis)}`;
}

/**
 * Hol z drzwiami (kamienica bankowa, biurowiec, brama na Starym Mieście, pasaż parku handlowego).
 * d: { tytul, podtytul, styl: kamienica|biurowiec|brama|pasaz, drzwi: [{ nazwa, podpis, …hot }], postac? }
 */
export function scenaHolu(d) {
  const n = d.drzwi.length, margines = 70, odstep = n > 5 ? 34 : 56;
  const w = Math.min(160, (1220 - 2 * margines - (n - 1) * odstep - (d.postac ? 150 : 0)) / n);
  const start = (1220 - (d.postac ? 150 : 0) - (n * w + (n - 1) * odstep)) / 2;
  let s = tloZwykle();
  if (d.styl === "brama") s += `<rect x="0" y="0" width="1220" height="380" fill="var(--g-rudy)" opacity=".18"/>`
    + Array.from({ length: 9 }, (_, i) => `<path d="M0 ${40 + i * 40}h1220" stroke="var(--tusz)" stroke-width="1" opacity=".12"/>`).join("");
  if (d.styl === "biurowiec") s += `<rect x="0" y="0" width="1220" height="30" fill="var(--g-metal2)" opacity=".5"/>`;
  s += [150, 610, 1070].map(lampa).join("");
  let h = "";
  d.drzwi.forEach((dz, i) => {
    const x = start + i * (w + odstep);
    s += drzwi(x, w, dz, d.styl);
    h += hot(dz, x - 13, 84, w + 26, 432);
  });
  s += donica(28) + (d.postac ? "" : donica(1192));
  if (d.postac) s += osobaSvg(d.postac, 1140, 596, 1, "dobra", 0);
  return { s, h, opis: `${d.tytul}: ${d.drzwi.map((x) => x.nazwa).join(", ")}.` };
}

/**
 * Sala z okienkami (urzędy, poczta, redakcja, miasteczko akademickie).
 * d: { tytul, podtytul, okienka: [{ nazwa, podpis, postac, …hot }] }
 */
export function scenaOkienek(d) {
  const n = d.okienka.length, w = Math.min(250, (1220 - 80 - (n - 1) * 26) / n), start = (1220 - (n * w + (n - 1) * 26)) / 2;
  let s = tloZwykle() + [60, 1160].map(lampa).join(""), h = "";
  d.okienka.forEach((o, i) => {
    const x = start + i * (w + 26), cx = x + w / 2;
    s += `<rect x="${x}" y="150" width="${w}" height="250" rx="4" fill="var(--g-sciana2)" stroke="var(--tusz)" stroke-width="2"/>
      <rect x="${x + 14}" y="164" width="${w - 28}" height="190" rx="3" fill="var(--g-szklo)" opacity=".55" stroke="var(--tusz)" stroke-width="2"/>`;
    s += `<svg x="${x + 14}" y="164" width="${w - 28}" height="190" viewBox="${cx - (w - 28) / 2} 164 ${w - 28} 190">${osobaSvg(o.postac || "sprzedawca", cx, 470, 1.05, o.zablokowane ? "zmeczona" : "dobra", i)}</svg>`;
    s += `<rect x="${x - 8}" y="354" width="${w + 16}" height="150" fill="var(--g-drewno2)" stroke="var(--tusz)" stroke-width="2"/>
      <rect x="${x - 14}" y="344" width="${w + 28}" height="16" rx="3" fill="var(--g-drewno)" stroke="var(--tusz)" stroke-width="2"/>
      <rect x="${cx - 34}" y="318" width="68" height="26" rx="3" fill="var(--g-biel)" stroke="var(--tusz)" stroke-width="1.5"/>`
      + napis(cx, 337, o.zablokowane ? "NIECZYNNE" : `OKIENKO ${i + 1}`, 11.5, "var(--g-czern)", "szyld", 'text-anchor="middle" letter-spacing=".8"')
      + tabliczka(cx, 96, Math.min(w, 230), o.nazwa, o.podpis);
    h += hot(o, x - 14, 90, w + 28, 416);
  });
  s += donica(26) + donica(1194);
  return { s, h, opis: `${d.tytul}: ${d.okienka.map((x) => x.nazwa).join(", ")}.` };
}

/**
 * Hala z regałami albo stoiskami (hurtownie, bazar, sklepy).
 * d: { tytul, podtytul, stoiska: [{ nazwa, podpis, …hot }], postac? }
 */
export function scenaHali(d) {
  const n = d.stoiska.length, miejsce = 1220 - (d.postac ? 220 : 0), odstep = Math.min(70, (miejsce - 72 - n * 230) / Math.max(1, n - 1));
  const start = (miejsce - n * 230 - (n - 1) * odstep) / 2;
  let s = u("tla-sklep-hala", 0, 0), h = "";
  d.stoiska.forEach((st, i) => {
    const rx = start + i * (230 + odstep);
    s += u("sklep-regal", rx, 100) + napisW(rx + 115, 125, st.nazwa.toUpperCase(), 15.5, 200, "var(--papier)", "szyld", 'letter-spacing="1"');
    for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) s += (r + k + i) % 3 === 0
      ? `<g color="var(--akcent${(k + i) % 2 ? "-2" : ""})">${u("sklep-puszka", rx + 26 + k * 66, 100 + 80 + r * 84, 1.1)}</g>` : u("sklep-paczka", rx + 18 + k * 66, 100 + 78 + r * 84, 0.95);
    s += u("wnetrze-karton", rx + 22, 324) + u("wnetrze-karton", rx + 124, 324);
    if (st.podpis) s += napisW(rx + 115, 452, st.podpis, 15, 250, "var(--tusz)", "tekst");
    h += hot(st, rx - 4, 96, 238, 310);
  });
  if (d.postac) s += osobaSvg(d.postac, 1118, 468, 0.95, "dobra", 0) + u("sklep-kasa", 1036, 306);
  s += u("sklep-wozek", 470, 462);
  return { s, h, opis: `${d.tytul}: ${d.stoiska.map((x) => x.nazwa).join(", ")}.` };
}
