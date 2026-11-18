// Adapter wnętrz z makiet: scena z sceny/<id>.js (rysunek SVG, klikalne punkty, postacie z dymkami) → { s, h, opis } dla ekranu miejsca
// (swiat.js) oraz obsługa kliknięcia punktu. Punkt otwiera istniejący ekran gry w oknie-teczce nad wnętrzem (wg pola teczka.ekran z makiety), do innej
// sceny (wejscie), albo otwiera okienko z opisem (odsyla, brak ekranu). Dane „na niby” z makiety (stany, plakietki, liczby w teczkach)
// nie są pokazywane: stan punktu pochodzi z gry (lista błędów, odblokowanie rundą, zakrycie funkcji).
import { esc, okno, toast, zamknijOkno } from "../zakladki/wspolne.js";
import { stylEkranu } from "../pulpit/karty-style.js";
import { R, ustawWyglad } from "./rysunek.js";
import { SCENY } from "./sceny/index.js";

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
  const osoby = lista(w.osoby, R).map((o) => {
    const sk = o.s || 1;
    return `<button type="button" class="wn-osoba${o.stale ? " stale" : ""}${o.powitanie ? " powitanie" : ""}${o.strona ? ` w-${o.strona}` : ""}"
      style="${pos(o.x - 46 * sk, o.stopy - 238 * sk, 92 * sk, (o.h || 232) * sk)}" aria-label="${esc(o.imie)} mówi: ${esc(o.tekst)}"><span class="wn-znak" aria-hidden="true">${o.znak || "…"}</span>
      <span class="wn-dymek" aria-hidden="true"><span class="wn-kto">${esc(o.imie)}</span>${esc(o.tekst)}</span></button>`;
  }).join("");
  return { s, h: pkt + osoby, opis: w.opis || w.tytul };
}

/** Pozycje listy „Co tu zrobisz” pod sceną (dla czytników i wąskich ekranów): te same punkty, z opisem z makiety bez liczb „na niby”. */
export function listaPunktow(punkty) {
  return `<ul class="sw-lista">${punkty.map((o, i) => `<li><button data-akcja="sw-wn" data-i="${i}" class="${o.zablokowane ? "zablokowane" : ""}">
    <b>${esc(o.p.nazwa || o.et)}</b><span>${esc(opisPunktu(o.p))}</span>${o.stan ? `<i class="stan ${o.klasa === "zamkniete" ? "szary" : ""}">${esc(o.stan)}</i>` : ""}</button></li>`).join("")}</ul>`;
}
const opisPunktu = (p) => (p.odsyla ? goly(p.odsyla.tekst) : p.wejscie ? "Wejście do środka." : goly(p.teczka?.wstep));

// --- kliknięcie punktu ------------------------------------------------------------------------------------------------------------
/** Przewija ekran do firmy (po przejściu z drzwi banku, sklepu itd.). */
export function przewinDo(tekst) {
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
  if (p.wejscie) { const w = cel(p.wejscie); if (w && SCENY[w.id]) return ctx.wejdz(w.id, w.q); }
  const otworz = () => {
    if (o.ekran) {
      if (!c.zakryta(o.ekran) && !c.dostepna(o.ekran)) { const od = c.odRundy(o.ekran); return toast(od ? `To otworzy się w tygodniu ${od}.` : "To miejsce jest jeszcze zamknięte."); }
      c.teczka(o.ekran);   // ekran decyzji w oknie nad wnętrzem (teczka), nie osobna karta
      // dostawca albo firma, której drzwi kliknięto (bank, biuro rachunkowe): ekran przewija się do jej nazwy
      const szukaj = p.teczka?.dostawca ? ctx.def.tytul : ["bank", "biuro_rachunkowe"].includes(ctx.def.id) ? (/„(.+)”/.exec(ctx.def.tytul) || [])[1] : null;
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
