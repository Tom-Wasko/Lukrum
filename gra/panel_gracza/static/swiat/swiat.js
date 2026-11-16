// Świat gry: miejsca (budynki) z wnętrzami zamiast listy zakładek. Wejście: pasek z lewej, mapa (lukrum.otworzWnetrze)
// albo okruszki nad ekranem decyzji. Wnętrze to scena z klikalnymi miejscami i lista „co tu zrobisz” pod nią.
// Ekran „miejsce” jest zwykłą zakładką panelu (rejestr: zakladki/index.js), więc korzysta z tego samego stanu gry.
import { esc, nazwaUslugi, toast, zl } from "../zakladki/wspolne.js";
import { ikona } from "../zakladki/ikony.js";
import { cenyLokalu, lokalWybrany, menuLokalu, mojeLokale, opisLokalu, wieleLokali } from "../zakladki/lokal_wybor.js";
import { BUDYNEK_DO_EKRANU, BUDYNEK_DO_MIEJSCA, MIEJSCA, miejsceEkranu, ustawEkranyMiejsc } from "./miejsca.js";
import { scenaBezLokalu, scenaBudowy, scenaHali, scenaHolu, scenaKebabu, scenaOkienek, scenaSurowa, ustawRozmiary } from "./sceny.js";

const M = { id: "kebab", grafiki: null, wn: {}, wnKlucz: "", karta: null, fokusKarty: false };
export const aktualneMiejsce = () => M.id;
export function ustawMiejsce(id) { if (MIEJSCA[id]) { M.id = id; M.karta = null; } return !!MIEJSCA[id]; }
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
const MINA = { wesola: "dobra", zmeczona: "zmeczona", smutna: "zmeczona" };
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
    nazwa: nazwaUslugi(c.kat, k, o.strefa), cena: ceny[k]?.cena ?? 0,
    brak: (sprz[k]?.utracona || 0) > 0 && String(sprz[k]?.przyczyna || "").startsWith("zasoby") }));
  const obsluga = (wn.stan?.pracownicy || []).map((p) => ({ id: p.id, imie: p.imie_nazwisko.split(" ")[0], miejsce: p.miejsce, mina: MINA[p.mina] || "zwykla" }));
  if (!wn.stan) for (const s of (v.stan.stanowiska || [])) if (s.pracownik && (!s.lokal || s.lokal === lok.id)) obsluga.push({ id: s.pracownik, imie: "Pracownik", miejsce: s.typ === "kasa" ? "lada" : "kuchnia", mina: "zwykla" });
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
    menu: dania, obsluga, mowiacy, wujek, ocena: wn.wskazniki?.ocena ?? lok.ocena, punkty };
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
  const punkty = punktyMiejsca(c, m);
  const podtytul = m.adres || "";
  if (m.scena === "hol") return scenaHolu({ tytul: m.tytul, podtytul, styl: m.styl, drzwi: punkty, postac: m.postac });
  if (m.scena === "okienka") return scenaOkienek({ tytul: m.tytul, podtytul, okienka: punkty });
  return scenaHali({ tytul: m.tytul, podtytul, stoiska: punkty, postac: m.postac });
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
  const tytul = kebab && lok ? `Kebab „${esc(v.dashboard.nazwa)}”` : esc(m.tytul);
  const adres = kebab ? (o ? `${esc(o.nazwa)}, ${esc(o.adres || "")}` : "") : esc(m.adres || "");
  const ocena = kebab && lok?.ocena ? wsk("Ocena", `${lok.ocena.toFixed(1).replace(".", ",")} ★`) : "";
  return `<div class="sw-gora"><button class="sw-wroc" data-akcja="sw-mapa" title="Wróć na mapę miasta">${ikona("mapa", 18)}<span>Mapa</span></button>
    <h1>${tytul}</h1><span class="adres">${adres}</span>
    ${wsk("Tydzień", `${Math.min(v.runda, v.gra.liczba_rund)} z ${v.gra.liczba_rund}`)}${wsk("Kasa", zl(v.dashboard.saldo))}${ocena}</div>`;
}

function lista(c, m) {
  const punkty = punktyMiejsca(c, m).filter((p) => !p.tylkoScena);
  const widziane = new Set();
  const poz = punkty.filter((p) => { const k = `${p.cel}|${p.nazwa}`; if (widziane.has(k)) return false; widziane.add(k); return true; });
  return `<ul class="sw-lista">${poz.map((p) => `<li><button data-akcja="sw-hot" data-k="${esc(p.cel)}"${p.szukaj ? ` data-szukaj="${esc(p.szukaj)}"` : ""} class="${p.zablokowane ? "zablokowane" : ""}">
    <b>${esc(p.nazwa)}</b><span>${esc(p.opis || p.podpis || "")}</span>${p.stan ? `<i class="stan ${p.klasaStanu || ""}">${esc(p.stan)}</i>` : ""}</button></li>`).join("")}</ul>`;
}

function wyborLokalu(c, m) {
  if (m.scena !== "kebab" || !wieleLokali(c.v)) return "";
  const akt = lokalWybrany(c.v).id;
  return `<div class="sw-lokale" role="tablist" aria-label="Twoje lokale">${mojeLokale(c.v).map((l) => `<button role="tab" aria-selected="${l.id === akt}"
    class="${l.id === akt ? "aktywny" : ""}" data-akcja="wybierz-lokal" data-id="${esc(l.id)}">${esc(opisLokalu(c.v, l.id)?.nazwa || l.id)}</button>`).join("")}</div>`;
}

export const miejsce = {
  get tytul() { return MIEJSCA[M.id]?.tytul || "Miejsce"; },
  bezGlowy: true,
  hash: () => `miejsce/${M.id}`,
  decyzje(c) {
    const m = MIEJSCA[M.id] || MIEJSCA.kebab;
    if (!gotoweGrafiki) return `<div class="sw">${naglowek(c, m)}<div class="ladowanie">Wczytywanie wnętrza…</div>${lista(c, m)}</div>`;
    const sc = scenaMiejsca(c, m);
    return `<div class="sw">${naglowek(c, m)}${wyborLokalu(c, m)}
      <div class="sw-scena-ramka"><div class="sw-scena"><svg viewBox="0 0 1220 612" role="img" aria-label="${esc(sc.opis)}">${sc.s}</svg>
        <div class="sw-nakladka">${sc.h}</div><div id="sw-karta-miejsce">${kartaHtml(c)}</div></div></div>
      <h2 class="sw-co">Co tu zrobisz</h2>${lista(c, m)}</div>`;
  },
  po(c) {
    const naMiejscu = () => document.querySelector(".sw");
    if (!gotoweGrafiki) wczytajGrafiki().then((ok) => { gotoweGrafiki = !!ok; if (ok && naMiejscu()) c.rysuj(); });
    else if ((MIEJSCA[M.id] || {}).scena === "kebab" && lokalWybrany(c.v)) wczytajWnetrze(c).then((zmiana) => { if (zmiana && naMiejscu()) c.rysuj(); });
    const k = document.querySelector(".sw-karta .zamknij");
    if (k && M.fokusKarty) { k.focus({ preventScroll: true }); M.fokusKarty = false; }
  },
  akcje: {
    "sw-hot": (el, c) => {
      if (el.dataset.karta) { M.karta = el.dataset.karta; M.fokusKarty = true; return c.rysuj(); }
      if (el.dataset.m) return idzDoMiejsca(c, el.dataset.m);
      const k = el.dataset.k;
      if (!k) return;
      if (!c.zakryta(k) && !c.dostepna(k)) { const od = c.odRundy(k); return toast(od ? `To otworzy się w tygodniu ${od}.` : "To miejsce jest jeszcze zamknięte."); }
      M.karta = null;
      c.idz(k);
      if (el.dataset.szukaj) przewinDo(el.dataset.szukaj);
    },
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
    "sw-mapa": () => window.lukrum.wrocNaMape(),
    "sw-miejsce": (el, c) => idzDoMiejsca(c, el.dataset.m),
  },
};

// po przejściu do ekranu: przewiń do firmy, której drzwi kliknięto (np. bank „Kmicic” na ekranie banków)
function przewinDo(tekst) {
  setTimeout(() => {
    const kandydaci = [...document.querySelectorAll("#karta .tresc :is(h2, h3, h4, b, strong, th, .nazwa, summary)")];
    const el = kandydaci.find((e) => e.textContent.includes(tekst));
    if (el) { el.scrollIntoView({ block: "center" }); el.classList.add("sw-wskazany"); setTimeout(() => el.classList.remove("sw-wskazany"), 2400); }
  }, 60);
}

export function idzDoMiejsca(c, id) {
  if (!ustawMiejsce(id)) return false;
  c.idz("miejsce");
  window.scrollTo({ top: 0 });
  return true;
}

/** Mapa prosi o wnętrze budynku (lukrum.otworzWnetrze): własny lokal, miejsce albo ekran. Zwraca true, gdy obsłużone. */
export function otworzBudynek(c, id) {
  const moj = mojeLokale(c.v).find((l) => l.id === id);
  if (moj) { c.wybierzLokal(id); return idzDoMiejsca(c, "kebab"); }
  if (BUDYNEK_DO_MIEJSCA[id]) return idzDoMiejsca(c, BUDYNEK_DO_MIEJSCA[id]);
  if (BUDYNEK_DO_EKRANU[id] && c.jestZakladka(BUDYNEK_DO_EKRANU[id])) { c.idz(BUDYNEK_DO_EKRANU[id]); return true; }
  return false;
}

/** Okruszek nad ekranem decyzji: powrót do wnętrza, w którym jest ten ekran. */
export function okruszek(k) {
  const id = miejsceEkranu(k);
  if (!id) return "";
  return `<a class="sw-okruszek" data-akcja="sw-miejsce" data-m="${id}" title="Wróć do wnętrza: ${esc(MIEJSCA[id].tytul)}">${ikona("lewo", 16)}${esc(MIEJSCA[id].tytul)}</a>`;
}
