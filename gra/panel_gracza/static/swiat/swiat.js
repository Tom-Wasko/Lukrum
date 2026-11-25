// Świat gry: miejsca (budynki) z wnętrzami zamiast listy zakładek. Wejście: pasek z lewej, mapa (lukrum.otworzWnetrze)
// albo okruszki nad ekranem decyzji. Wnętrze to scena z klikalnymi miejscami i lista „co tu zrobisz” pod nią.
// Ekran „miejsce” jest zwykłą zakładką panelu (rejestr: zakladki/index.js), więc korzysta z tego samego stanu gry.
import { esc, nazwaUslugi, okno, toast } from "../zakladki/wspolne.js";
import { ikona } from "../zakladki/ikony.js";
import { cenyLokalu, lokalWybrany, menuLokalu, mojeLokale, opisLokalu, wieleLokali } from "../zakladki/lokal_wybor.js";
import { BUDYNEK_DO_MIEJSCA, BUDYNEK_PARAMETR, MIEJSCA, miejsceEkranu, ustawEkranyMiejsc } from "./miejsca.js";
import { scenaBezLokalu, scenaBudowy, scenaKebabu, scenaSurowa, ustawRozmiary } from "./sceny.js";
import { etykietaPory, poraTeraz, stylPory, warstwaPory } from "./pora.js";
import { akcjaMapa, kliknijPunkt, listaPunktow, przewinDo, przelaczDymek, punktySceny, sceneWczytana, ulozNakladke, wczytajScene, zbudujScene } from "./wnetrze.js";

import { gazeta } from "./kurier.js";
import { ksiegaGosci } from "./ksiega.js";

// dodatek pod sceną miejsca (np. pierwsza strona gazety w redakcji)
const DODATKI = {};
const DODATKI_POD = { kebab: ksiegaGosci, redakcja: gazeta };   // pod sceną

const M = { id: "kebab", q: "", widok: "", def: null, punkty: [], grafiki: null, wn: {}, wnKlucz: "", karta: null, fokusKarty: false };
// ekrany, do których prowadzą punkty wczytanych scen (okruszek nad ekranem wraca do sceny, z której przyszło się do ekranu)
const EKRANY_SCEN = {};
export const aktualneMiejsce = () => M.id;
export const aktualneQ = () => M.q;
export function ustawMiejsce(id, q = "") { if (MIEJSCA[id]) { M.id = id; M.q = q; M.widok = ""; M.def = null; M.blad = false; M.karta = null; } return !!MIEJSCA[id]; }
export { MIEJSCA, miejsceEkranu, ustawEkranyMiejsc };

// --- grafiki: jeden plik symboli wklejony do dokumentu (grafiki widzą wtedy zmienne palety) ---------------------------
export function wczytajGrafiki() {
  M.grafiki ??= (async () => {
    const baza = new URL("../grafiki/", import.meta.url);
    const [svg, rozm] = await Promise.all([fetch(new URL("zestaw.svg", baza)).then((r) => r.text()), fetch(new URL("zestaw.json", baza)).then((r) => r.json())]);
    document.body.insertAdjacentHTML("beforeend", svg);
    ustawRozmiary(rozm);
    return true;
  })().catch((e) => { console.error(e); M.grafiki = null; return false; });
  return M.grafiki;
}
let gotoweGrafiki = false;

// --- stan punktu: wyłączony (znika), zakryty, zablokowany do tygodnia N, z błędami --------------------------------------
function stanPunktu(c, p) {
  if (!p.cel) return p;
  if (c.wylaczona(p.cel) || !c.jestZakladka(p.cel) || c.ukryta(p.cel)) return null;
  if (c.zakryta(p.cel)) return { ...p, stan: "robi to gra", klasaStanu: "szary" };
  if (!c.dostepna(p.cel)) { const od = c.odRundy(p.cel); return { ...p, stan: od ? `od tygodnia ${od}` : "jeszcze zamknięte", klasaStanu: "szary", zablokowane: true }; }
  const bledy = (c.v.lista_bledow || []).filter((b) => b.poziom === "czerwony" && c.docelowa(b.zakladka) === c.docelowa(p.cel)).length;
  return bledy && c.v.edycja ? { ...p, stan: `! ${bledy} do poprawy` } : p;
}
const punktyMiejsca = (c, m) => m.punkty.map((p) => stanPunktu(c, { ...p, etykieta: p.nazwa })).filter(Boolean);

// --- kebab: dane sceny z widoku gry i z API wnętrz (dymki, miny, propozycja) --------------------------------------------
const TYP_STREFY = { stare_miasto: "kamienica", centrum: "kamienica", dworzec: "dworzec" };
const MINA = { wesola: "dobra", zmeczona: "zmeczona", smutna: "zla" };   // mina z silnika (progi w danych) → wariant rysunku
const MINA_OPIS = { dobra: "dobry nastrój w zespole", zwykla: "zwykły nastrój w zespole", zla: "zły nastrój w zespole", zmeczona: "zmęczone osoby w zespole" };
const kluczWnetrza = (c) => `${c.v.runda}|${lokalWybrany(c.v)?.id || ""}|${c.v.gra.runda}`;

async function wczytajWnetrze(c) {
  const klucz = kluczWnetrza(c);
  if (M.wnKlucz === klucz || c.v.gra.zakonczona || c.v.runda !== c.v.gra.runda) return false;
  M.wnKlucz = klucz;
  const lok = lokalWybrany(c.v)?.id;
  try {
    M.wn = await c.api(`/api/gry/${GRA}/wnetrza/${encodeURIComponent(FIRMA)}${lok ? `?lokal=${encodeURIComponent(lok)}` : ""}`);
  } catch { M.wn = {}; }
  return true;
}

function poziomSprzetu(v, idLokalu) {
  const st = (v.stan.stanowiska || []).filter((s) => !s.lokal || s.lokal === idLokalu);
  const jak = st.flatMap((s) => Object.values(s.sprzet || {}));
  return jak.length ? Math.round(jak.reduce((a, b) => a + b, 0) / jak.length) : 0;
}

function daneKebabu(c, punkty) {
  const v = c.v, lok = lokalWybrany(v), o = opisLokalu(v, lok.id) || {}, wn = M.wnKlucz === kluczWnetrza(c) ? M.wn : {};
  const menu = menuLokalu(v, lok) || {}, ceny = cenyLokalu(v, lok) || {}, sprz = v.wyniki?.sprzedaz || {};
  const dania = Object.keys(menu).filter((k) => !["napoj", "dodatek"].includes(k)).sort((a, b) => (menu[b] || 0) - (menu[a] || 0)).map((k) => ({
    nazwa: nazwaUslugi(c.kat, k, o.strefa), cena: ceny[k]?.cena ?? c.kat.uslugi?.[k]?.cena_preferowana ?? 0,   // przed startem sprzedaży ceny są puste: cena preferowana
    brak: (sprz[k]?.utracona || 0) > 0 && String(sprz[k]?.przyczyna || "").startsWith("zasoby") }));
  const obsluga = (wn.stan?.pracownicy || []).map((p) => ({ id: p.id, imie: p.imie_nazwisko.split(" ")[0], miejsce: p.miejsce, mina: MINA[p.mina] || "zwykla" }))
    .map((o) => ({ ...o, opis: `${o.imie}: ${MINA_OPIS[o.mina]}` }));
  if (!wn.stan) for (const s of (v.stan.stanowiska || [])) if (s.pracownik && (!s.lokal || s.lokal === lok.id)) obsluga.push({ id: s.pracownik, imie: "Pracownik", miejsce: s.typ === "kasa" ? "lada" : "kuchnia", mina: "zwykla", opis: `Pracownik: ${MINA_OPIS.zwykla}` });
  const pr = wn.propozycja;
  const mowiacy = [];
  if (pr) mowiacy.push({ kto: pr.kto, imie: pr.imie, tekst: pr.wybrana ? pr.reakcja : pr.tekst, rodzaj: "propozycje", klik: "propozycja", wybrana: pr.wybrana });
  let nrWos = 0;
  for (const d of (wn.dymki || [])) {
    const wos = d.rodzaj === "wos" ? nrWos++ : null;
    if (d.kto === "wujek" || mowiacy.length >= 3) continue;
    if (mowiacy.some((m) => m.kto === d.kto)) continue;
    mowiacy.push({ kto: d.kto, imie: d.imie, tekst: d.tekst, rodzaj: d.rodzaj, klik: wos != null ? "wos" : "", wos });
  }
  const wujek = (wn.dymki || []).find((d) => d.kto === "wujek") || null;
  const dekor = { sciany: "podstawowy", szyld: "podstawowy", dodatki: "podstawowy", meble: "podstawowy", ...(lok.dekor || {}) };
  M.mowiacy = mowiacy;
  return { typ: TYP_STREFY[o.strefa] || "pawilon", poziom: poziomSprzetu(v, lok.id), dekor, szyld: String(v.dashboard.nazwa || "").toUpperCase().slice(0, 22),
    runda: v.runda, menu: dania, obsluga, mowiacy, wujek, ocena: wn.wskazniki?.ocena ?? lok.ocena, tlok: wn.stan?.tlok, punkty };
}

function scenaMiejscaKebab(c, m) {
  const v = c.v, lok = lokalWybrany(v);
  const P = Object.fromEntries(punktyMiejsca(c, m).map((p) => [p.klucz, p]));
  if (!lok) {
    const biuro = stanPunktu(c, { cel: "lokale", etykieta: "Biuro „Klucz”: wybierz lokal" });
    return scenaBezLokalu({ tekst: "Najpierw wybierz lokal: wynajmij gotowy, urządź pusty albo kup działkę i zbuduj własny pawilon.", punkty: { biuro } });
  }
  const o = opisLokalu(v, lok.id) || {}, typ = TYP_STREFY[o.strefa] || "pawilon";
  const zmien = (p, etykieta) => p && { ...p, etykieta };
  if (lok.dziala_od > v.runda) {
    const zostalo = lok.dziala_od - v.runda, ile = zostalo === 1 ? "1 tydzień" : `${zostalo} tyg.`;
    if (o.typ === "dzialka") {
      const etapow = Math.max(1, lok.dziala_od - lok.od_rundy);
      return scenaBudowy({ etap: Math.min(etapow, v.runda - lok.od_rundy + 1), etapow,
        tekst: `Budowa trwa. W tym czasie nie ma sprzedaży, a co tydzień schodzi rata. <b>Otwarcie za ${ile}.</b>`,
        punkty: { budowa: zmien(P.lada, "Plac budowy: stan lokalu"), raty: zmien(P.kasa, "Tablica: raty budowy") } });
    }
    return scenaSurowa({ typ, tytul: "Lokal w urządzaniu", tekst: `Ekipa maluje i kładzie instalacje. <b>Otwarcie za ${ile}.</b> Już teraz kup sprzęt, ułóż menu i zatrudnij ludzi.`,
      punkty: { sprzet: zmien(P.kuchnia, "Lada i kasa: kup sprzęt"), menu: zmien(P.menu, "Tablica: ułóż menu"), okno: P.okno, zaplecze: zmien(P.zaplecze, "Zaplecze: zatrudnij ludzi") } });
  }
  const d = daneKebabu(c, P);
  if (!d.poziom) return scenaSurowa({ typ, tytul: "Lokal bez sprzętu", tekst: "Zanim otworzysz, kup albo wynajmij rożen, ladę i kasę fiskalną.",
    punkty: { sprzet: zmien(P.kuchnia, "Lada i kasa: kup sprzęt"), menu: P.menu, okno: P.okno, zaplecze: P.zaplecze } });
  d.punkty = { wujek: { karta: "wujek", etykieta: "Zdjęcie wujka" }, dodatki: zmien(P.stoliki, "Dodatki: wystrój sali"), ...P };
  return scenaKebabu(d);
}

// --- sceny pozostałych miejsc --------------------------------------------------------------------------------------------
function scenaMiejsca(c, m) {
  if (m.scena === "kebab") return scenaMiejscaKebab(c, m);
  const def = sceneWczytana(M.id, M.q);
  M.def = def;
  M.punkty = punktySceny(c, def, M.widok);
  EKRANY_SCEN[M.id] = new Set(M.punkty.map((o) => o.ekran && c.docelowa(o.ekran)).filter(Boolean));
  return zbudujScene(c, def, M.widok, M.punkty);
}

// --- karty na scenie: zaczepka WOS, propozycja klienta, zdjęcie wujka ---------------------------------------------------
function kartaHtml(c) {
  const k = M.karta, wn = M.wn || {};
  if (!k) return "";
  let h = "", klasa = "z-prawej";
  if (k === "wujek") h = `<h2 id="sw-k-tytul">Zdjęcie wujka</h2><p>Wujek prowadził tu kiedyś bar mleczny. Zagląda, gdy dzieje się coś ważnego.</p>
    <p class="cicho">„Za moich czasów kolejka stała do samego rogu.”</p>`;
  else if (k.startsWith("wos:")) {
    const d = (wn.dymki || []).filter((x) => x.rodzaj === "wos")[+k.slice(4)];
    if (!d) return "";
    h = `<h2 id="sw-k-tytul">Jak to jest z prawem?</h2><p class="cicho">„${esc(d.tekst)}”</p><p>${esc(d.wyjasnienie || "")}</p>
      <div class="zrodlo"><b>Podstawa:</b> ${esc(d.zrodlo_prawne || "")}</div>`;
  } else if (k === "propozycja" && wn.propozycja) {
    const p = wn.propozycja, moze = c.edycja && !p.wybrana;
    klasa = "szeroka";
    h = `<h2 id="sw-k-tytul">Propozycja: ${esc(p.imie)}</h2><p>„${esc(p.tekst)}”</p>
      <p class="cicho">Odpowiada cała drużyna. Skutek poznacie po zamknięciu tygodnia.${p.wybrana ? "" : " Bez odpowiedzi klient uzna, że odmawiacie."}</p>
      <div class="odpowiedzi">${p.odpowiedzi.map((o) => `<button class="odp${p.wybrana === o.id ? " wybrana" : ""}" data-akcja="sw-odp" data-o="${esc(o.id)}" ${moze ? "" : "disabled"}>
        <span>${esc(o.tekst)}</span>${o.wskazowka ? `<span class="cicho">${esc(o.wskazowka)}</span>` : ""}</button>`).join("")}</div>
      ${p.wybrana ? `<p>„${esc(p.reakcja || "")}”</p><div class="pieczatka">Zatwierdzono</div>` : ""}`;
  } else return "";
  return `<aside class="sw-karta ${klasa}" role="dialog" aria-labelledby="sw-k-tytul"><button class="zamknij" data-akcja="sw-zamknij" aria-label="Zamknij kartę">✕</button>${h}</aside>`;
}

// --- ekran miejsca ---------------------------------------------------------------------------------------------------------
const wsk = (etykieta, wartosc) => `<span class="wsk">${etykieta} <b>${wartosc}</b></span>`;
function naglowek(c, m) {
  const v = c.v, kebab = m.scena === "kebab", lok = kebab ? lokalWybrany(v) : null, o = lok ? opisLokalu(v, lok.id) : null;
  const def = m.scena === "makieta" ? sceneWczytana(M.id, M.q) : null;
  const tytul = kebab && lok ? `Kebab „${esc(v.dashboard.nazwa)}”` : esc(def?.tytul || m.tytul);
  const adres = kebab ? (o ? `${esc(o.nazwa)}, ${esc(o.adres || "")}` : "") : esc(def?.adres || m.adres || "");
  const wyzej = def?.wrocDo ? `<button class="sw-wroc wn-wroc-wyzej" data-akcja="sw-wejdz" data-m="${esc(def.wrocDo.replace(/\.html.*/, ""))}" title="Wróć: ${esc(def.wroc || "")}">${ikona("lewo", 18)}<span>${esc(def.wroc || "Wyżej")}</span></button>` : "";
  const ocena = kebab && lok?.ocena ? wsk("Ocena", `${lok.ocena.toFixed(1).replace(".", ",")} ★`) : "";
  return `<div class="sw-gora"><div class="sw-wroty">${wyzej}<button class="sw-wroc" data-akcja="sw-mapa" title="Wróć na mapę miasta">${ikona("mapa", 18)}<span>Mapa</span></button></div>
    <h1>${tytul}</h1><span class="adres">${adres}</span>
    ${wsk("Tydzień", `${Math.min(v.runda, v.gra.liczba_rund)} z ${v.gra.liczba_rund}`)}${ocena}</div>`;
}

function lista(c, m) {
  const punkty = punktyMiejsca(c, m).filter((p) => !p.tylkoScena);
  const widziane = new Set();
  const poz = punkty.filter((p) => { const k = `${p.cel}|${p.nazwa}`; if (widziane.has(k)) return false; widziane.add(k); return true; });
  return `<ul class="sw-lista">${poz.map((p) => `<li><button data-akcja="sw-hot" data-k="${esc(p.cel)}"${p.miejsce ? ` data-m="${esc(p.miejsce)}"` : ""}${p.miejsce && p.odsyla ? ` data-odsyla="${esc(p.odsyla)}"` : ""}${p.szukaj ? ` data-szukaj="${esc(p.szukaj)}"` : ""} class="${p.zablokowane ? "zablokowane" : ""}">
    <b>${esc(p.nazwa)}</b><span>${esc(p.opis || p.podpis || "")}</span>${p.stan ? `<i class="stan ${p.klasaStanu || ""}">${esc(p.stan)}</i>` : ""}</button></li>`).join("")}</ul>`;
}

function wyborLokalu(c, m) {
  if (m.scena !== "kebab" || !wieleLokali(c.v)) return "";
  const akt = lokalWybrany(c.v).id;
  return `<div class="sw-lokale" role="tablist" aria-label="Twoje lokale">${mojeLokale(c.v).map((l) => `<button role="tab" aria-selected="${l.id === akt}"
    class="${l.id === akt ? "aktywny" : ""}" data-akcja="wybierz-lokal" data-id="${esc(l.id)}">${esc(opisLokalu(c.v, l.id)?.nazwa || l.id)}</button>`).join("")}</div>`;
}

let zegarPory = 0;
function odswiezPore(sc, c) {
  const pora = poraTeraz(c.kat.mapa.miasto?.pora), sp = stylPory(pora);
  sc.className = `sw-scena ${sp.klasa}`; sc.setAttribute("style", sp.zmienne);
  const et = sc.querySelector(".sw-pora-etykieta"); if (et) et.innerHTML = etykietaPory(pora);
}
const makieta = (m) => m.scena === "makieta";
export const miejsce = {
  get tytul() { return MIEJSCA[M.id]?.tytul || "Miejsce"; },
  bezGlowy: true,
  hash: () => `miejsce/${M.id}`,
  decyzje(c) {
    const m = MIEJSCA[M.id] || MIEJSCA.kebab;
    M.c = c;
    if (!gotoweGrafiki || (makieta(m) && !sceneWczytana(M.id, M.q))) {
      return `<div class="sw">${naglowek(c, m)}<div class="ladowanie">${M.blad ? "Nie udało się wczytać wnętrza." : "Wczytywanie wnętrza…"}</div>${makieta(m) ? "" : lista(c, m)}</div>`;
    }
    const sc = scenaMiejsca(c, m), pora = poraTeraz(c.kat.mapa.miasto?.pora), sp = stylPory(pora);
    return `<div class="sw">${naglowek(c, m)}${wyborLokalu(c, m)}${DODATKI[M.id] ? DODATKI[M.id](c) : ""}
      <div class="sw-scena-ramka"><div class="sw-scena ${sp.klasa}" style="${sp.zmienne}"><svg viewBox="0 0 1220 612" role="img" aria-label="${esc(sc.opis)}">${sc.s}</svg>
        ${warstwaPory()}<span class="sw-pora-etykieta">${etykietaPory(pora)}</span><div class="sw-nakladka">${sc.h}</div><div id="sw-karta-miejsce">${kartaHtml(c)}</div></div></div>
      ${sc.dymki || ""}${DODATKI_POD[M.id] ? DODATKI_POD[M.id](c) : ""}<h2 class="sw-co">Co tu zrobisz</h2>${makieta(m) ? listaPunktow(M.punkty) : lista(c, m)}</div>`;
  },
  po(c) {
    const naMiejscu = () => document.querySelector(".sw");
    clearInterval(zegarPory);   // co minutę pora wnętrza dogania zegar (albo suwak na mapie), bez przerysowania sceny
    zegarPory = setInterval(() => { const sc = document.querySelector(".sw-scena"); if (!sc) return clearInterval(zegarPory); odswiezPore(sc, c); }, 60000);
    const m = MIEJSCA[M.id];
    if (!gotoweGrafiki) wczytajGrafiki().then((ok) => { gotoweGrafiki = !!ok; if (ok && naMiejscu()) c.rysuj(); });
    else if (m && makieta(m) && !sceneWczytana(M.id, M.q) && !M.blad) {
      const id = M.id;
      wczytajScene(id, M.q).then(() => { if (naMiejscu() && M.id === id) c.rysuj(); }).catch((e) => { console.error(e); M.blad = true; if (naMiejscu()) c.rysuj(); });
    } else if ((MIEJSCA[M.id] || {}).scena === "kebab" && lokalWybrany(c.v)) wczytajWnetrze(c).then((zmiana) => { if (zmiana && naMiejscu()) c.rysuj(); });
    ulozNakladke();
    const k = document.querySelector(".sw-karta .zamknij");
    if (k && M.fokusKarty) { k.focus({ preventScroll: true }); M.fokusKarty = false; }
  },
  akcje: {
    "sw-hot": (el, c) => {
      if (el.dataset.karta) { M.karta = el.dataset.karta; M.fokusKarty = true; return c.rysuj(); }
      if (el.dataset.m) {
        // odesłanie: tylko informacja i „Pokaż na mapie”, bez przejścia prosto do innego budynku
        if (!el.dataset.odsyla) return idzDoMiejsca(c, el.dataset.m);
        return okno("To załatwisz gdzie indziej", `<div class="wn-info"><p>${esc(el.dataset.odsyla)}</p></div>`,
          { male: true, przyciski: `<button data-akcja="sw-wn-mapa" class="gl">Wróć na mapę</button><button data-akcja="zamknij-okno">Zostaję</button>`, okruszek: `Lublin › ${esc((MIEJSCA[M.id] || {}).tytul || "Miejsce")}` });
      }
      const k = el.dataset.k;
      if (!k) return;
      if (!c.zakryta(k) && !c.dostepna(k)) { const od = c.odRundy(k); return toast(od ? `To otworzy się w tygodniu ${od}.` : "To miejsce jest jeszcze zamknięte."); }
      M.karta = null;
      c.teczka(k);   // ekran w oknie nad wnętrzem (teczka), nie osobna karta
      if (el.dataset.szukaj) przewinDo(el.dataset.szukaj);
    },
    "sw-dymek": (el) => przelaczDymek(el),
    "sw-osoba": (el, c) => {
      const o = el.dataset.nr === "wujek" ? null : (M.mowiacy || [])[+el.dataset.nr];
      if (!o) return;
      M.karta = o.klik === "propozycja" ? "propozycja" : o.klik === "wos" ? `wos:${o.wos}` : null;
      M.fokusKarty = true;
      c.rysuj();
    },
    "sw-zamknij": (el, c) => { M.karta = null; c.rysuj(); },
    "sw-odp": async (el, c) => {
      M.wn = await c.api(`/api/gry/${GRA}/wnetrza/${encodeURIComponent(FIRMA)}/odpowiedz`, { method: "POST", body: JSON.stringify({ odpowiedz: el.dataset.o }) });
      c.rysuj();
    },
    "sw-wn": (el, c) => kliknijPunkt(+el.dataset.i, { c, punkty: M.punkty, def: M.def, wejdz: (id, q) => idzDoMiejsca(c, id, q),
      ustawWidok: (nazwa) => { M.widok = nazwa; c.rysuj(); } }),
    "sw-wn-mapa": () => akcjaMapa(),
    "sw-wejdz": (el, c) => idzDoMiejsca(c, el.dataset.m),
    "sw-mapa": () => window.lukrum.wrocNaMape(),
    "sw-miejsce": (el, c) => idzDoMiejsca(c, el.dataset.m, el.dataset.m === M.id ? M.q : ""),
  },
};

export function idzDoMiejsca(c, id, q = "") {
  if (!ustawMiejsce(id, q)) return false;
  c.idz("miejsce");
  window.scrollTo({ top: 0 });
  zapiszWizyte(c, id);
  return true;
}

// Zeszyt wujka odhacza „idźcie do …” po wizycie zapisanej przez serwer (api/wizyty.py). Zapis w tle: błąd sieci nie przeszkadza w grze.
async function zapiszWizyte(c, id) {
  try {
    if (c.v?.tylko_odczyt || !c.v?.zeszyt || c.v.zeszyt.wizyty.includes(id)) return;
    c.v.zeszyt.wizyty = [...c.v.zeszyt.wizyty, id];   // od razu w widoku, serwer potwierdzi listę
    const o = await c.api(`/api/gry/${GRA}/zeszyt/${encodeURIComponent(FIRMA)}/wizyta`, { method: "POST", body: JSON.stringify({ miejsce: id }) });
    if (o?.wizyty && c.v?.zeszyt) c.v.zeszyt.wizyty = o.wizyty;
  } catch (e) { console.warn("zeszyt: nie zapisano wizyty", e); }
}

/** Mapa prosi o wnętrze budynku (lukrum.otworzWnetrze): własny lokal, miejsce albo ekran. Zwraca true, gdy obsłużone. */
export function otworzBudynek(c, id) {
  const moj = mojeLokale(c.v).find((l) => l.id === id);
  if (moj) { c.wybierzLokal(id); return idzDoMiejsca(c, "kebab"); }
  if (BUDYNEK_DO_MIEJSCA[id]) return idzDoMiejsca(c, BUDYNEK_DO_MIEJSCA[id], BUDYNEK_PARAMETR[id] || "");
  return false;
}

/** Okruszek nad ekranem decyzji: powrót do wnętrza, w którym jest ten ekran. */
export function okruszek(k) {
  // ekran otwarty z kebaba wraca do kebaba: z kebaba nie ma przejścia do Parku handlowego (sprzęt kupuje się tylko po wejściu z mapy)
  const zKebaba = M.id === "kebab" && MIEJSCA.kebab.punkty.some((p) => p.cel === k);
  const id = zKebaba ? "kebab" : EKRANY_SCEN[M.id]?.has(k) ? M.id : miejsceEkranu(k);
  if (!id) return "";
  return `<a class="sw-okruszek" data-akcja="sw-miejsce" data-m="${id}" title="Wróć do wnętrza: ${esc(MIEJSCA[id].tytul)}">${ikona("lewo", 16)}${esc(MIEJSCA[id].tytul)}</a>`;
}

// zmiana palety albo trybu: rysunek wnętrza zależy od wyglądu (kroje napisów), więc ekran miejsca rysuje się od nowa
document.addEventListener("lukrum:wyglad", () => { if (M.c && document.querySelector(".sw-scena")) M.c.rysuj(); });
