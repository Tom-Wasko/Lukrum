// Dźwięki gry (podróż 04, wątek dzwieki; decyzje szefa 23.11.2026). Dane: dane/dzwieki.yaml (adres /dzwieki.json).
//  - krótkie dźwięki (dzwonek drzwi, kasa, stempel, kartka zeszytu, teczka) i odgłosy tła zależne od miejsca (gwar, ulica, biuro);
//    tło to tylko odgłosy, prawdziwa muzyka jest wyłącznie w radiu (radio.js);
//  - domyślnie krótkie dźwięki grają cicho, odgłosy tła są wyłączone; gracz zmienia to w ⚙ → Dźwięk (dwa suwaki + „wycisz wszystko”),
//    stan w localStorage; mistrz gry może wyciszyć całą klasę (flaga gry: ustawMG(true));
//  - nic nie gra przed pierwszym kliknięciem albo klawiszem (zasady przeglądarek);
//  - brak pliku = cisza, bez błędu (plik, którego nie ma w /dzwieki.json albo nie da się pobrać, jest pomijany).
// Umowa dla reszty gry (window.lukrum.dzwiek):
//   zagraj(nazwa)     krótki dźwięk po nazwie pliku („kasa”) albo zdarzeniu z dzwieki.yaml („zakup”)
//   tlo(miejsce)      odgłos tła miejsca (id z budynki.yaml, „mapa” albo „lokal”) z płynnym przejściem; null – cisza
//   przycisz(tak)     radio przycisza odgłosy tła, gdy gra (04/radio)
//   ustawMG(tak)      flaga „wyciszone przez prowadzącego”
// Podpięcia bez zmian w cudzych plikach: zdarzenia lukrum:wnetrze / lukrum:mapa oraz obserwacja drzewa dokumentu
// (nowa teczka albo paragon, świeży stempel NADANO, przewracana kartka zeszytu).
const KLUCZ = "lukrum-dzwiek";
const PRZYCISZENIE = 0.25;   // tyle zostaje z głośności tła, gdy gra radio

let dane = null, ladowanie = null, ctx = null, odblokowany = false, mg = false, przyciszone = false;
const bufory = new Map();   // nazwa → AudioBuffer | null (null: nie ma pliku albo nie da się go odczytać)
let tlo = { nazwa: null, zrodlo: null, gain: null };
let zadaneTlo = null;       // ostatnio zamówione miejsce (do wznowienia po odblokowaniu, włączeniu suwaka itp.)
const st = wczytaj();

function wczytaj() {
  const dom = { krotkie: null, tlo: null, krotkieWl: null, tloWl: null, wszystko: false };
  try { return { ...dom, ...JSON.parse(localStorage.getItem(KLUCZ) || "{}") }; } catch { return dom; }
}
function zapisz() { try { localStorage.setItem(KLUCZ, JSON.stringify(st)); } catch { /* bez zapisu */ } }

const wartosc = (v, dom) => (v == null ? dom : v);
const glosnosc = (rodzaj) => wartosc(st[rodzaj], dane?.glosnosc?.[rodzaj] ?? 0);
const wlaczone = (rodzaj) => wartosc(st[rodzaj === "krotkie" ? "krotkieWl" : "tloWl"], dane?.wlaczone?.[rodzaj] ?? false);
const cicho = () => mg || st.wszystko;

async function pobierz() {
  if (dane) return dane;
  ladowanie ||= fetch("/dzwieki.json").then((r) => (r.ok ? r.json() : null)).catch(() => null);
  dane = (await ladowanie) || { glosnosc: {}, wlaczone: {}, przejscie: 1, pliki: {}, zdarzenia: {}, miejsca: {}, domyslne: "cisza" };
  return dane;
}

function kontekst() {
  if (ctx || !odblokowany) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

async function bufor(nazwa) {
  if (bufory.has(nazwa)) return bufory.get(nazwa);
  const p = dane?.pliki?.[nazwa], c = kontekst();
  if (!p || !c) return null;   // bez pliku w spisie: cisza (nie zapamiętujemy, bo spis może się zmienić)
  let b = null;
  try {
    const r = await fetch(p.url);
    if (r.ok) b = await c.decodeAudioData(await r.arrayBuffer());
  } catch { b = null; }
  bufory.set(nazwa, b);
  return b;
}

/** Krótki dźwięk: nazwa pliku albo zdarzenie z dzwieki.yaml. */
async function zagraj(nazwa) {
  await pobierz();
  const n = dane.zdarzenia[nazwa] || nazwa;
  if (cicho() || !wlaczone("krotkie") || !odblokowany) return;
  const p = dane.pliki[n];
  if (!p || p.rodzaj !== "krotki") return;
  const b = await bufor(n), c = ctx;
  if (!b || !c) return;
  if (c.state === "suspended") c.resume();
  const g = c.createGain();
  g.gain.value = glosnosc("krotkie") / 100;
  const z = c.createBufferSource();
  z.buffer = b;
  z.connect(g).connect(c.destination);
  z.start();
}

const poziomTla = () => (cicho() || !wlaczone("tlo") ? 0 : (glosnosc("tlo") / 100) * (przyciszone ? PRZYCISZENIE : 1));

function wygasTlo(t) {
  if (!t.zrodlo || !ctx) return;
  const koniec = ctx.currentTime + (dane?.przejscie ?? 1);
  t.gain.gain.cancelScheduledValues(ctx.currentTime);
  t.gain.gain.setValueAtTime(t.gain.gain.value, ctx.currentTime);
  t.gain.gain.linearRampToValueAtTime(0, koniec);
  t.zrodlo.stop(koniec + 0.05);
}

/** Odgłos tła miejsca z płynnym przejściem. `miejsce` – id budynku, „mapa”, „lokal” albo null (cisza). */
async function ustawTlo(miejsce) {
  zadaneTlo = miejsce;
  await pobierz();
  const o = miejsce == null ? "cisza" : dane.miejsca[miejsce] || dane.miejsca.lokal || dane.domyslne;
  if (!odblokowany || !kontekst()) return;
  if (o === tlo.nazwa) return odswiezTlo();
  const stare = tlo;
  tlo = { nazwa: o, zrodlo: null, gain: null };
  wygasTlo(stare);
  if (o === "cisza" || dane.pliki[o]?.rodzaj !== "tlo") return;
  const b = await bufor(o);
  if (!b || tlo.nazwa !== o) return;   // brak pliku albo w międzyczasie inne miejsce
  const c = ctx, g = c.createGain(), z = c.createBufferSource();
  g.gain.value = 0;
  z.buffer = b;
  z.loop = true;
  z.connect(g).connect(c.destination);
  z.start();
  tlo.zrodlo = z; tlo.gain = g;
  odswiezTlo(dane.przejscie);
}

/** Dopasowuje głośność działającego tła (suwak, wyciszenie, radio) bez zmiany odgłosu. */
function odswiezTlo(czas = 0.25) {
  if (!tlo.gain || !ctx) { if (poziomTla() > 0 && zadaneTlo !== null && !tlo.zrodlo) ustawTlo(zadaneTlo); return; }
  const g = tlo.gain.gain, t = ctx.currentTime;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(poziomTla(), t + czas);
}

function odblokuj() {
  if (odblokowany) return;
  odblokowany = true;
  kontekst();
  if (ctx?.state === "suspended") ctx.resume();
  if (zadaneTlo !== null) { const m = zadaneTlo; tlo = { nazwa: null, zrodlo: null, gain: null }; ustawTlo(m); }
}

// --- ustawienia (⚙ → Dźwięk): odczyt i zapis, wywoływane z pulpit.js ----------------------------------------------------------
export function ustawienia() {
  return { krotkie: glosnosc("krotkie"), tlo: glosnosc("tlo"), krotkieWl: wlaczone("krotkie"), tloWl: wlaczone("tlo"),
    wszystko: st.wszystko, mg };
}
export async function zmien(zmiana) {
  await pobierz();
  Object.assign(st, zmiana);
  zapisz();
  odswiezTlo();
  if (!tlo.zrodlo && zadaneTlo !== null) ustawTlo(zadaneTlo);
}
export function ustawMG(tak) { const z = !!tak; if (z !== mg) { mg = z; odswiezTlo(); } }
export function przycisz(tak) { przyciszone = !!tak; odswiezTlo(0.6); }
export const wczytajDane = pobierz;   // do ustawień: domyślne głośności muszą być wczytane

// --- podpięcia ---------------------------------------------------------------------------------------------------------------
const dzwiek = { zagraj, tlo: ustawTlo, przycisz, ustawMG, ustawienia, zmien };
window.lukrum.dzwiek = dzwiek;
for (const z of ["pointerdown", "keydown"]) document.addEventListener(z, odblokuj, { capture: true, passive: true });
document.addEventListener("lukrum:wnetrze", (e) => { zagraj("wejscie_do_lokalu"); ustawTlo(e.detail?.id ?? null); });
document.addEventListener("lukrum:mapa", () => ustawTlo("mapa"));

// świeżo otwarta teczka albo paragon, stempel NADANO i przewracana kartka zeszytu: bez zmian w plikach tych okien
function klasyDodane(w) {
  if (!(w instanceof Element)) return;
  if (w.matches(".zaslona.nowa")) zagraj(w.matches(".pp-okno-paragon") ? "zakup" : "otwarcie_okna");
  else if (w.matches(".pp-stempel.swiezy") || w.querySelector?.(".pp-stempel.swiezy")) zagraj("nadanie_listu");
  else if (w.matches(".pz-lico")) zagraj("kartka_zeszytu");
}
function obserwuj() {
  if (typeof MutationObserver === "undefined" || typeof Element === "undefined") return;   // np. test bez przeglądarki
  new MutationObserver((lista) => { for (const m of lista) for (const w of m.addedNodes) klasyDodane(w); })
    .observe(document.body, { childList: true, subtree: true });
}
if (document.body) obserwuj(); else document.addEventListener("DOMContentLoaded", obserwuj);
pobierz();
