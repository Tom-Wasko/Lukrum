// Adapter wnętrz z makiet: scena z sceny/<id>.js (rysunek SVG, klikalne punkty, postacie z dymkami) → { s, h, opis } dla ekranu miejsca
// (swiat.js) oraz obsługa kliknięcia punktu. Punkt otwiera istniejący ekran gry w oknie-teczce nad wnętrzem (wg pola teczka.ekran z makiety), do innej
// sceny (wejscie), albo otwiera okienko z opisem (odsyla, brak ekranu). Dane „na niby” z makiety (stany, plakietki, liczby w teczkach)
// nie są pokazywane: stan punktu pochodzi z gry (lista błędów, odblokowanie rundą, zakrycie funkcji).
import { esc, okno, toast, zamknijOkno } from "../zakladki/wspolne.js";
import { stylEkranu } from "../pulpit/karty-style.js";
import { wybierzPozycje } from "../pulpit/uklady.js";
import { R, ustawWyglad } from "./rysunek.js";
import "./rekwizyty.js";
import { kluczDymka, oznaczWidziany, rozlozSzyldy, ulozDymek, widziany } from "./nakladka.js";
import { SCENY } from "./sceny/index.js";
import { filtrAgencji } from "../zakladki/marketing.js";
import { dostawcaSceny, otworzAuto, otworzSklep } from "../zakladki/dostawcy.js";
import { otworzSprzet } from "../zakladki/inwestycje.js";
import { oknoParku } from "../zakladki/zdarzenia.js";
import { otworzListZDecyzjami } from "../pulpit/pulpit.js";

const pos = (x, y, w, h) => `left:${(x / 12.2).toFixed(2)}%;top:${(y / 6.12).toFixed(2)}%;width:${(w / 12.2).toFixed(2)}%;height:${(h / 6.12).toFixed(2)}%`;
const goly = (t) => String(t || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const ruchOgraniczony = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const ZNAK = { uwaga: "!", zamkniete: "🔒" };

// --- wczytanie sceny (leniwie, z pamięcią podręczną na parę id + wariant) -----------------------------------------------------
const CACHE = new Map();
const klucz = (id, q) => `${id}?${q || ""}`;
export const sceneWczytana = (id, q) => CACHE.get(klucz(id, q)) || null;
export async function wczytajScene(id, q = "") {
  const k = klucz(id, q);
  if (CACHE.has(k)) return CACHE.get(k);
  const wpis = SCENY[id];
  if (!wpis) return null;
  const modul = await wpis.wczytaj();
  R.q = new URLSearchParams(q);
  const def = modul.default(R);
  def._q = q;
  CACHE.set(k, def);
  return def;
}

/** Widok sceny (pierwszy z `widoki`, jeśli scena je ma) z domyślnymi polami sceny. */
const widok = (def, nazwa) => (def.widoki ? { ...def, ...(def.widoki[nazwa] || def.widoki[Object.keys(def.widoki)[0]]) } : def);
const lista = (w, R_) => (typeof w === "function" ? w(R_) : w || []);

/** Ekran gry, do którego prowadzi punkt: pierwsze słowo pola `ekran` teczki („zaop_dostawy (filtr…)”, „kpir”, „–” = brak). */
export const ekranPunktu = (p) => { const k = String(p.teczka?.ekran || "").split(/[^a-z0-9_]/i)[0]; return k || null; };

/** Dane gry dla rysunku sceny (np. „od tygodnia N” na drzwiach): ustawiane przed rysowaniem i przed liczeniem punktów. */
const ustawGre = (c) => { R.gra = { tydzien: c.v.runda, odRundy: (k) => c.odRundy(k) }; };

/** Punkty sceny z naniesionym stanem z gry. Zwraca tablicę opisów { p (punkt z makiety), ekran, et, stan, klasa, zablokowane, ogon }. */
export function punktySceny(c, def, nazwaWidoku) {
  ustawWyglad(); ustawGre(c); R.q = new URLSearchParams(def._q || "");
  const w = widok(def, nazwaWidoku);
  const wynik = [];
  for (const p of lista(w.punkty, R)) {
    const ek = ekranPunktu(p), opis = { p, ekran: null, et: p.et, gdzie: p.gdzie || "dol", cichy: !!p.cichy, stan: "", klasa: "", zablokowane: false, ogon: "" };
    if (ek && c.jestZakladka(ek)) {
      if (c.wylaczona(ek) || c.ukryta(ek)) continue;   // funkcja wyłączona: rekwizyt zostaje na rysunku, punktu nie ma
      opis.ekran = ek;
      if (c.zakryta(ek)) { opis.stan = "robi to gra"; opis.klasa = "zamkniete"; }
      else if (!c.dostepna(ek)) { const od = c.odRundy(ek); opis.stan = od ? `od tygodnia ${od}` : "jeszcze zamknięte"; opis.klasa = "zamkniete"; opis.zablokowane = true; }
      else {
        const bledy = (c.v.lista_bledow || []).filter((b) => b.poziom === "czerwony" && c.docelowa(b.zakladka) === c.docelowa(ek)).length;
        if (bledy && c.v.edycja) { opis.stan = `${bledy} do poprawy`; opis.znak = ZNAK.uwaga; }
      }
    } else if (p.odsyla) opis.ogon = `➜ ${p.odsyla.miejsce}`;
    wynik.push(opis);
  }
  return wynik;
}

/** HTML sceny: { s: SVG, h: nakładka (punkty i postacie), opis }. `punkty` – wynik punktySceny (ten sam, co do listy pod sceną). */
export function zbudujScene(c, def, nazwaWidoku, punkty) {
  ustawWyglad(); ustawGre(c); R.q = new URLSearchParams(def._q || "");
  const w = widok(def, nazwaWidoku);
  let s;
  try { s = w.rysuj(R); } catch (e) { console.error(e); s = `<text x="20" y="40" font-size="16" fill="var(--tusz)">Nie udało się narysować wnętrza.</text>`; }
  const pkt = punkty.map((o, i) => {
    const p = o.p, zn = o.znak ? `<span class="wn-zn uw">${o.znak}</span>` : o.klasa === "zamkniete" ? `<span class="wn-zn">${ZNAK.zamkniete}</span>` : "";
    const ogon = o.klasa === "zamkniete" ? ` <i>${esc(o.stan)}</i>` : o.stan ? ` <i>(${esc(o.stan)})</i>` : o.ogon ? ` <i>${esc(o.ogon)}</i>` : "";
    const opisAria = `${p.nazwa ? `${o.et}: ${p.nazwa}` : o.et}${o.stan ? ` (${o.stan})` : ""}${p.odsyla ? `: to załatwisz w miejscu ${p.odsyla.miejsce}` : ""}`;
    return `<button class="wn-pkt${o.klasa ? ` ${o.klasa}` : ""}${o.cichy ? " cichy" : ""}" data-akcja="sw-wn" data-i="${i}" data-gdzie="${esc(o.gdzie)}" style="${pos(p.x, p.y, p.w, p.h)}"
      aria-label="${esc(opisAria)}"><span class="wn-met" aria-hidden="true">${zn}${esc(o.et)}${ogon}</span></button>`;
  }).join("");
  const gadajacy = lista(w.osoby, R);
  const osoby = gadajacy.map((o, i) => {
    const sk = o.s || 1, nowy = !!o.nowy && !widziany(kluczDymka(c.v.runda, def.id, o.imie));
    return `<button type="button" class="wn-osoba${nowy ? " nowy" : ""}${o.strona ? ` w-${o.strona}` : ""}" data-akcja="sw-dymek" data-klucz="${esc(kluczDymka(c.v.runda, def.id, o.imie))}"
      style="${pos(o.x - 46 * sk, o.stopy - 238 * sk, 92 * sk, (o.h || 232) * sk)}" aria-expanded="false" aria-label="${esc(o.imie)} mówi${nowy ? " (nowe)" : ""}: ${esc(o.tekst)}"><span class="wn-znak" aria-hidden="true">${o.znak || "…"}${nowy ? `<b class="wn-nowe">nowe</b>` : ""}</span>
      <span class="wn-dymek" aria-hidden="true"><span class="wn-kto">${esc(o.imie)}</span>${esc(o.tekst)}</span></button>`;
  }).join("");
  const dymki = gadajacy.map((o) => ({ imie: o.imie, tekst: o.tekst, nowy: !!o.nowy && !widziany(kluczDymka(c.v.runda, def.id, o.imie)) }));
  return { s, h: pkt + osoby, opis: w.opis || w.tytul, dymki: listaDymkow(dymki) };
}

/** Pozycje listy „Co tu zrobisz” pod sceną (dla czytników i wąskich ekranów): te same punkty, z opisem z makiety bez liczb „na niby”. */
export function listaPunktow(punkty) {
  return `<ul class="sw-lista">${punkty.map((o, i) => `<li><button data-akcja="sw-wn" data-i="${i}" class="${o.zablokowane ? "zablokowane" : ""}">
    <b>${esc(o.p.nazwa || o.et)}</b><span>${esc(opisPunktu(o.p))}</span>${o.stan ? `<i class="stan ${o.klasa === "zamkniete" ? "szary" : ""}">${esc(o.stan)}</i>` : ""}</button></li>`).join("")}</ul>`;
}
const opisPunktu = (p) => (p.odsyla ? goly(p.odsyla.tekst) : p.wejscie ? "Wejście do środka." : goly(p.teczka?.wstep));

// --- nakładka: dymki zwinięte, szyldy bez nachodzenia (podróż 04/nakladka; logika układu: nakladka.js) ---------------------------------

/** Lista dymków pod sceną (telefon ≤ 600 px: na rysunku nie ma ani punktów, ani dymków). osoby: [{ imie, tekst, nowy, nr?, klik? }] */
export function listaDymkow(osoby) {
  if (!osoby.length) return "";
  return `<section class="sw-dymki" aria-label="Kto co mówi"><h2 class="sw-co">Kto tu co mówi</h2><ul>${osoby.map((o) => {
    const tresc = `<b>${esc(o.imie)}${o.nowy ? ` <i class="wn-nowe">nowe</i>` : ""}</b><span>${esc(o.tekst)}</span>${o.klik ? `<i class="stan">${esc(o.klik)}</i>` : ""}`;
    return o.klik ? `<li><button type="button" data-akcja="sw-osoba" data-nr="${o.nr}">${tresc}</button></li>` : `<li><div>${tresc}</div></li>`;
  }).join("")}</ul></section>`;
}

const rel = (el, B) => { const r = el.getBoundingClientRect(); return { x: r.left - B.left, y: r.top - B.top, w: r.width, h: r.height }; };
const widoczny = (r) => r.w > 0 && r.h > 0;

/** Zamyka otwarte dymki (jeden naraz). Zwraca, czy coś było otwarte. */
export function zamknijDymki(sc = document) {
  let bylo = false;
  for (const o of sc.querySelectorAll(".wn-osoba.otwarty, .osoba.otwarty")) { o.classList.remove("otwarty"); o.setAttribute("aria-expanded", "false"); bylo = true; }
  return bylo;
}

/** Klik w postać: otwiera jej dymek (reszta się zamyka), drugi klik zamyka. Dymek ustawia się tam, gdzie jest miejsce. */
export function przelaczDymek(el) {
  const sc = el.closest(".sw-scena"), byl = el.classList.contains("otwarty");
  zamknijDymki(sc || document);
  if (byl || !sc) return;
  el.classList.add("otwarty"); el.setAttribute("aria-expanded", "true");
  if (el.dataset.klucz) oznaczWidziany(el.dataset.klucz);
  el.classList.remove("nowy"); el.querySelectorAll(".wn-nowe").forEach((n) => n.remove());
  const B = sc.getBoundingClientRect(), d = el.querySelector(".wn-dymek, .dymek"), os = rel(el, B);
  const przeszkody = [...sc.querySelectorAll(".wn-pkt")].flatMap((p) => [rel(p, B), ...[p.querySelector(".wn-met")].filter(Boolean).map((m) => rel(m, B))]).filter(widoczny);
  const u = ulozDymek(os, { w: d.offsetWidth, h: d.offsetHeight }, przeszkody, { w: B.width, h: B.height });
  Object.assign(d.style, { left: `${(u.x - os.x - el.clientLeft).toFixed(1)}px`, top: `${(u.y - os.y - el.clientTop).toFixed(1)}px`, right: "auto", bottom: "auto", margin: "0", transform: "none" });
  d.dataset.strona = u.strona;
}

/** Układa szyldy punktów na gotowej scenie (po wstawieniu do DOM i przy zmianie rozmiaru). Na telefonie punktów na rysunku nie ma (CSS), więc nic się nie dzieje. */
let obserwator = null;
export function ulozNakladke() {
  obserwator?.disconnect(); obserwator = null;
  const sc = document.querySelector(".sw-scena");
  if (!sc || !sc.querySelector(".wn-pkt")) return;
  const uloz = () => {
    const B = sc.getBoundingClientRect();
    if (!B.width) return;
    const pkt = [...sc.querySelectorAll(".wn-pkt")].map((el) => ({ el, met: el.querySelector(".wn-met"), rect: rel(el, B) })).filter((p) => p.met && widoczny(p.rect));
    if (!pkt.length) return;
    const wynik = rozlozSzyldy(pkt.map((p, i) => ({ id: i, rect: p.rect, szyld: { w: p.met.offsetWidth, h: p.met.offsetHeight }, gdzie: p.el.dataset.gdzie })),
      { w: B.width, h: B.height }, [...sc.querySelectorAll(".wn-osoba")].map((o) => rel(o, B)).filter(widoczny));
    for (const w of wynik) {
      const p = pkt[w.id];
      Object.assign(p.met.style, { left: `${(w.x - p.rect.x - p.el.clientLeft).toFixed(1)}px`, top: `${(w.y - p.rect.y - p.el.clientTop).toFixed(1)}px`, right: "auto", bottom: "auto", transform: "none" });
    }
  };
  uloz();
  if (typeof ResizeObserver === "function") {
    let ramka = 0;
    obserwator = new ResizeObserver(() => { cancelAnimationFrame(ramka); ramka = requestAnimationFrame(uloz); });
    obserwator.observe(sc);
  }
}

// Esc zamyka najpierw otwarty dymek (a dopiero kolejny Esc wraca na mapę); w oknie nad sceną Esc należy do okna
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || document.querySelector(".zaslona")) return;
  if (zamknijDymki()) { e.preventDefault(); e.stopImmediatePropagation(); }
}, true);

// --- kliknięcie punktu ------------------------------------------------------------------------------------------------------------
/** Przewija ekran do firmy (po przejściu z drzwi banku, sklepu itd.). */
export function przewinDo(tekst) {
  wybierzPozycje(document.querySelector(".zaslona.teczka"), tekst);   // układ bez powtórzeń: scena wskazuje pozycję w karcie
  setTimeout(() => {
    const kandydaci = [...document.querySelectorAll(".teczka .ot :is(h2, h3, h4, b, strong, th, .nazwa, summary), #karta .tresc :is(h2, h3, h4, b, strong, th, .nazwa, summary)")];
    const el = kandydaci.find((e) => e.textContent.includes(tekst));
    if (el) { el.scrollIntoView({ block: "center" }); el.classList.add("sw-wskazany"); setTimeout(() => el.classList.remove("sw-wskazany"), 2400); }
  }, 60);
}

function dymek(tytul, kto, tekst, przyciski = "") {
  okno(esc(tytul), `<div class="wn-info">${kto ? `<span class="wn-kto">${esc(kto)}</span>` : ""}<p>${tekst}</p></div>`,
    { male: true, przyciski: `${przyciski}<button data-akcja="zamknij-okno">Zostaję</button>`, styl: stylEkranu("potwierdzenie"), okruszek: "Lublin › Wnętrze" });
}

/** Parsuje „bank.html?b=kmicic” z makiety → { id: "bank", q: "b=kmicic" }. */
const cel = (wejscie) => { const m = /^([a-z_]+)(?:\.html)?(?:\?(.*))?$/.exec(wejscie); return m ? { id: m[1], q: m[2] || "" } : null; };

/** Obsługa punktu o numerze i. ctx: { c, punkty, def, widok, wejdz(id, q), ustawWidok(nazwa), rysuj() }. */
export function kliknijPunkt(i, ctx) {
  const o = ctx.punkty[i];
  if (!o) return;
  const { p } = o, c = ctx.c;
  if (p.widok) { ctx.ustawWidok(p.widok); return; }
  if (p.parkId) return oknoParku(c, p.parkId);   // tablica ogłoszeń parku: okienko wydarzeń nad wnętrzem (03/wydarzenia)
  if (p.wejscie) { const w = cel(p.wejscie); if (w && SCENY[w.id]) return ctx.wejdz(w.id, w.q); }
  const otworz = () => {
    if (o.ekran) {
      if (!c.zakryta(o.ekran) && !c.dostepna(o.ekran)) { const od = c.odRundy(o.ekran); return toast(od ? `To otworzy się w tygodniu ${od}.` : "To miejsce jest jeszcze zamknięte."); }
      if (p.teczka?.dostawca) {   // sklep, hurtownia: okienko z ofertą tylko tego sklepu i działu (nie ogólny ekran dostawców)
        // dostawca z jawnego pola sceny (klucz z dane/dostawcy.yaml); bez oferty (runda 1, sklep otwarty później) – tylko krótka informacja,
        // nigdy ogólny ekran dostawców
        const dost = dostawcaSceny(c.v, ctx.def.dostawca);
        if (dost) return otworzSklep(c, { dost, dzialy: p.teczka.dzialy, widok: p.teczka.widok, tytul: `${ctx.def.tytul}: ${p.et}` });
        const od = c.v.auto_dostawca?.zasady?.od_rundy;   // sklep z późniejszym startem (Auchan po przebudowie)
        return dymek(ctx.def.tytul, "Obsługa", od && c.v.runda < od ? `Ten sklep otworzy się w tygodniu ${od}.`
          : "Ten sklep nie ma dziś oferty dla firm. Zajrzyj tu w jednym z następnych tygodni.");
      }
      if (p.teczka?.auto) return otworzAuto(c, { tytul: `${ctx.def.tytul}: ${p.et}`, sklep: ctx.def.tytul });   // auto-dostawy: tylko ta sekcja
      filtrAgencji(p.teczka?.agencja, p.teczka?.tytul);
      if (p.teczka?.sprzet) return otworzSprzet(c, { ...p.teczka.sprzet, tytul: `${ctx.def.tytul}: ${p.et}` });   // hurtownia sprzętu: tylko ta grupa
      if (o.ekran === "wyslij") return otworzListZDecyzjami(c);   // poczta: ta sama koperta co ikona listu w pasku (03/poprawki-okienek)
      c.teczka(o.ekran, p.teczka?.tryb);   // ekran decyzji (albo wyników: teczka.tryb) w oknie nad wnętrzem; klucz części otwiera tylko tę część
      // firma, której drzwi kliknięto (bank, biuro rachunkowe): ekran przewija się do jej nazwy
      const szukaj = ["bank", "biuro_rachunkowe"].includes(ctx.def.id) ? (/„(.+)”/.exec(ctx.def.tytul) || [])[1] : null;
      if (szukaj) przewinDo(szukaj);
      return;
    }
    if (p.odsyla) {
      const przycisk = `<button data-akcja="sw-wn-mapa" class="gl">Pokaż na mapie ➜ ${esc(p.odsyla.miejsce)}</button>`;
      return dymek("To załatwisz gdzie indziej", p.odsyla.kto || "Obsługa", `${esc(p.odsyla.tekst)}${p.odsyla.stan ? `<br><span class="cicho">${esc(p.odsyla.stan)}</span>` : ""}`, przycisk);
    }
    dymek(p.teczka?.tytul || o.et, "", esc(goly(p.teczka?.wstep) || "Tu na razie nie ma osobnej decyzji."));
  };
  if (p.przed && !ruchOgraniczony()) { p.przed(R); setTimeout(otworz, p.opoznienie || 0); } else { p.przed?.(R); otworz(); }
}

export const akcjaMapa = () => { zamknijOkno(); window.lukrum.wrocNaMape(); };
export { cel as celWejscia };
