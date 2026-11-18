// Powłoka pulpitu (seria pulpit, krok 1; decyzje 18.11.2026): mapa na cały ekran i trzy elementy przy krawędziach.
// Krok 2: „Tydzień N” na środku u góry, szuflada „Wydarzenia”, ikona „Warstwy” (czynsze, popyt…), rząd ikon kategorii (6 grup) wzdłuż górnej krawędzi, zeszyt w prawym dolnym rogu na trzy stany (zeszyt.js), karta miejsca (karta.js).
//  - lewy górny róg: ⚙ (ustawienia z motyw.js) nad pionowym paskiem LUKRUM z ikonami: Wyślij decyzje, konto, Jak grać,
//    zakupy (tylko do odczytu: co zamówiono i kupiono w tym tygodniu); pod paskiem „Tydzień N” (tylko informacja);
//  - dół: portfel (plik banknotów) – najechanie pokazuje gotówkę i debet, kliknięcie otwiera okno finansów;
//  - prawa krawędź: zeszyt wujka – wystaje z brzegu z następnym krokiem, najechanie wysuwa listę, kliknięcie otwiera zeszyt.
// Stary układ (nagłówek, menu, stopka) jest do obejrzenia pod adresem ?uklad=stary i na wąskim ekranie (telefon – później).
// Kolory tylko ze zmiennych motywy/zmienne.css; wygląd: pulpit.css.
import { esc, kafelkiLiczb, nazwaUslugi, okno, otwarteOkno, toast, zamknijOkno, zl } from "../zakladki/wspolne.js";
import { ikona } from "../zakladki/ikony.js";
import ZAKLADKI from "../zakladki/index.js";
import { oznaczCel } from "../zakladki/wujek.js";
import { nazwaStrefy } from "../zakladki/lokale.js";
import { idzDoStrony, krokZeszytu, odswiezZeszyt, otworzZeszyt, przewinZeszyt, rysujMalyZeszyt, zamknijZeszyt, zeszytOtwarty } from "./zeszyt.js";
import { dokadWroc, mozeWrocic, pokazNaMapie, wejdzDoKroku, wroc, zapamietajWidok } from "./nawigacja.js";

// klasę ustawia skrypt na początku <body> (gra.html), żeby układ nie migał
export const PULPIT = document.body.classList.contains("pulpit");

const T_WYSLIJ = "Wyślij decyzje", T_FINANSE = "Finanse", T_KONTO = "Konto", T_ZAKUPY = "Zakupy tygodnia";
const IKONY_PASKA = [   // klucz, ikona, napis (osobny przycisk „Wyślij decyzje” leży na dole paska: LIST_PASKA)
  ["konto", "osoba", "Konto"], ["jak", "ksiazka", "Jak grać"], ["koszyk", "sprzedaz", "Zakupy"],
  ["wydarzenia", "zdarzenia", "Wydarzenia"], ["mapa", "mapa", "Mapa miasta"]];
let filtr = null;   // wybrana kategoria miejsc na mapie (filtr w prawym górnym rogu) albo null

let zamontowany = false, oknoRunda = null, ostatniC = null;
const el = (id) => document.getElementById(id);

// --- budowa elementów (raz) ------------------------------------------------------------------------------------------
function nota(x, y, obrot) {   // jeden banknot pliku: tło, obwódka, medalion i cyfry w kolorach palety (--g-*)
  return `<g transform="translate(${x} ${y}) rotate(${obrot} 75 36)">
    <rect width="150" height="72" rx="5" style="fill:color-mix(in srgb, var(--g-zielen) 30%, var(--g-biel));stroke:var(--g-czern)" stroke-width="2.5"/>
    <rect x="6" y="6" width="138" height="60" rx="3" fill="none" style="stroke:var(--g-zielen2)" stroke-width="1.5"/>
    <circle cx="75" cy="36" r="19" style="fill:color-mix(in srgb, var(--g-zielen) 18%, var(--g-biel));stroke:var(--g-zielen2)" stroke-width="2"/>
    <text x="75" y="43" text-anchor="middle" font-size="19" style="fill:var(--g-zielen2);font-family:var(--font-gruby)">100</text>
    <path d="M14 18c10-8 18 8 28 0M14 54c10-8 18 8 28 0M108 18c10-8 18 8 28 0M108 54c10-8 18 8 28 0" fill="none" style="stroke:var(--g-zielen2)" stroke-width="1.2"/></g>`;
}
const SVG_PLIK = `<svg class="pp-plik" viewBox="0 0 240 150" aria-hidden="true" focusable="false">
  ${nota(34, 30, -11)}${nota(46, 22, -4)}${nota(58, 18, 4)}${nota(72, 26, 10)}
  <rect x="104" y="14" width="46" height="120" rx="3" transform="rotate(-1 127 74)" style="fill:var(--akcent);stroke:var(--g-czern)" stroke-width="2.5"/>
  <path d="M112 44h30M112 60h30M112 76h30" style="stroke:var(--papier)" stroke-width="3" stroke-linecap="round"/></svg>`;

// „Wyślij decyzje” na dole paska: duży list w kopercie (z listem wystającym w rogu); po wysłaniu dostaje stempel (CSS: .pp-list.wyslana)
const LIST_PASKA = `<svg class="pp-list-svg" viewBox="0 0 64 48" aria-hidden="true" focusable="false">
  <g class="pp-list-kartka"><path d="M30 20 L40 3 L58 9 L50 26z" style="fill:var(--papier);stroke:var(--tusz)" stroke-width="2" stroke-linejoin="round"/>
    <path d="M38 9l14 4.600M36 14l14 4.600" fill="none" style="stroke:var(--tusz)" stroke-width="1.400" opacity=".55"/></g>
  <rect x="4" y="16" width="52" height="29" rx="3" style="fill:var(--papier);stroke:var(--tusz)" stroke-width="2.500"/>
  <path d="M5 18l25 17l25-17" fill="none" style="stroke:var(--tusz)" stroke-width="2.500" stroke-linejoin="round"/>
  <path d="M5 44l17-14M55 44L38 30" fill="none" style="stroke:var(--tusz)" stroke-width="1.600" opacity=".6"/>
  <rect x="42" y="22" width="9" height="11" rx="1" style="fill:var(--akcent);stroke:var(--tusz)" stroke-width="1.400"/></svg>`;

function montuj() {
  if (zamontowany) return;
  zamontowany = true;
  stosujRozmiar(odczytajRozmiar());
  const listHtml = `<button type="button" class="pp-ik pp-list" id="pp-wyslij" data-akcja="pp-wyslij" aria-label="${T_WYSLIJ}" title="${T_WYSLIJ}">${LIST_PASKA}<span>${T_WYSLIJ}</span>
    <i class="pp-znak" aria-hidden="true" hidden></i><b class="pp-list-stempel" aria-hidden="true">WYSŁANO</b></button>`;
  const ikonyHtml = IKONY_PASKA.map(([k, ik, napis]) => k === "jak"
    ? `<a class="pp-ik" id="pp-jak" href="/jak-grac" target="_blank" rel="noopener" aria-label="${napis} (nowa karta)" title="${napis}">${ikona(ik, 22)}<span>${napis}</span></a>`
    : `<button type="button" class="pp-ik" id="pp-${k}" data-akcja="pp-${k}" aria-label="${napis}" title="${napis}"${k === "mapa" ? " hidden" : ""}>${ikona(ik, 22)}<span>${napis}</span><i class="pp-znak" aria-hidden="true" hidden></i></button>`).join("");
  const rys = document.createElement("div");
  rys.id = "pulpit";
  rys.className = "pp";
  rys.innerHTML = `<div class="pp-lewy"><div id="pp-ust" class="pp-ust"></div>
      <nav class="pp-pasek" aria-label="Pasek LUKRUM"><div class="pp-szyld" aria-hidden="true">LUKRUM</div>${ikonyHtml}${listHtml}</nav>
      <div class="pp-druzyna" id="pp-druzyna"></div></div>
    <button type="button" class="pp-wroc" id="pp-wroc" data-akcja="pp-wroc" hidden>← Wróć <small>(Esc)</small></button>
    <div class="pp-tydzien" id="pp-tydzien" role="status"></div>
    <nav class="pp-filtr" id="pp-filtr" aria-label="Filtr kategorii miejsc na mapie" hidden></nav>
    <aside class="pp-szuflada" id="pp-szuflada" aria-label="Wydarzenia tygodnia" hidden></aside>
    <button type="button" class="pp-portfel" id="pp-portfel" data-akcja="pp-portfel">${SVG_PLIK}<span class="pp-kwoty" id="pp-kwoty"></span></button>
    <button type="button" class="pp-zeszyt" id="pp-zeszyt" data-akcja="pp-zeszyt"></button>`;
  document.body.appendChild(rys);
  przeniesUstawienia();
  document.addEventListener("lukrum:wyglad", odswiezUstawienia);
  // Esc: najpierw chowa to, co wysunięte (WCAG 1.4.13), a na ekranie poza mapą – wraca do poprzedniego widoku
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (podreczneOtwarte()) { zamknijPodreczne(); return; }
    if (rys.matches(":hover") || rys.contains(document.activeElement)) {
      rys.classList.add("pp-schowane");
      if (rys.contains(document.activeElement)) document.activeElement.blur();
      return;
    }
    const lista = document.getElementById("ustawienia-lista");
    if ((lista && !lista.hidden) || document.querySelector(".zaslona, #pk, #pz.otwarty") || e.target.closest?.("input, textarea, select")) return;
    if (ostatniC && mozeWrocic(ostatniC)) { e.preventDefault(); wroc(ostatniC); }
  });
  rys.addEventListener("pointerleave", () => rys.classList.remove("pp-schowane"));
  document.addEventListener("click", (e) => {   // klik poza szufladą i kategoriami je zamyka
    if (!e.target.closest("#pp-szuflada, #pp-wydarzenia")) zamknijPodreczne();
  });
}

// --- ustawienia (⚙): sekcje zamiast długiej listy. Menu ⚙ buduje motyw.js (do nagłówka), a pulpit przenosi je w lewy górny róg
// i składa od nowa: Wygląd (kolory, tryb, rozmiar pisma), Mapa (warstwy), Dźwięk (radio – na razie nieaktywne), Konto, Gra.
const PALETY = [["bar", "Bar mleczny"], ["pewex", "Pewex"], ["wysoka", "Wysoki kontrast"]];
const TRYBY = [["jasny", "Jasny"], ["ciemny", "Ciemny"]];
const ROZMIARY = [["normalny", "Normalny"], ["duzy", "Duży"], ["najwiekszy", "Największy"]];
const WARSTWY = [["", "Strefy"], ["czynsze", "Czynsze"], ["popyt", "Popyt"], ["konkurencja", "Konkurencja"]];
const KLUCZ_ROZMIARU = "lukrum-rozmiar";
function odczytajRozmiar() {
  try { const r = localStorage.getItem(KLUCZ_ROZMIARU); return ROZMIARY.some(([k]) => k === r) ? r : "normalny"; } catch { return "normalny"; }
}
function stosujRozmiar(r) {
  if (r === "normalny") document.documentElement.removeAttribute("data-rozmiar"); else document.documentElement.setAttribute("data-rozmiar", r);
  try { localStorage.setItem(KLUCZ_ROZMIARU, r); } catch { /* bez zapisu */ }
}
const ustMapy = () => { try { return JSON.parse(localStorage.getItem("lukrum-mapa") || "{}"); } catch { return {}; } };
const seg = (nazwa, lista, atrybut, akcja = "pp-wyglad") => `<div class="pp-seg" role="group" aria-label="${nazwa}">${lista.map(([k, n]) =>
  `<button type="button" class="pp-opcja" data-akcja="${akcja}" data-${atrybut}="${k}" aria-pressed="false">${n}</button>`).join("")}</div>`;

function budujUstawienia(ust) {
  const lista = ust.querySelector(".ustawienia-lista");
  if (!lista || lista.dataset.pp) return;
  lista.dataset.pp = "1";
  const wez = (sel) => lista.querySelector(sel);
  const konto = [wez(".uzytkownik"), wez('a[href="/"]'), wez('a[href="/mg/"]'), wez('a[href="/admin/"]'), wez(".wyloguj")].filter(Boolean);
  const funkcje = document.getElementById("ustawienia-funkcje"), stopka = document.querySelector(".stopka");
  lista.innerHTML = `<section class="pp-us"><h3>Wygląd</h3><p class="pp-et">Kolory</p>${seg("Paleta kolorów", PALETY, "paleta")}
      <p class="pp-et">Tryb</p>${seg("Tryb jasny albo ciemny", TRYBY, "tryb")}<p class="pp-et">Rozmiar pisma</p>${seg("Rozmiar pisma", ROZMIARY, "rozmiar")}</section>
    <section class="pp-us"><h3>Mapa</h3><p class="pp-et">Warstwa mapy</p>${seg("Warstwa mapy", WARSTWY, "w", "mapa-warstwa")}
      <button type="button" class="pp-opcja pp-opinie" data-akcja="mapa-opinie" aria-pressed="false">★ Oceny klientów przy lokalach</button></section>
    <section class="pp-us"><h3>Dźwięk</h3><button type="button" class="pp-opcja" disabled aria-disabled="true">Radio: wkrótce</button>
      <p class="pp-nota">Tu pojawi się radio z muzyką z epoki.</p></section>
    <section class="pp-us" id="pp-sek-konto"><h3>Konto</h3></section>
    <section class="pp-us" id="pp-sek-gra" hidden><h3>Gra</h3></section>
    ${stopka ? `<p class="pp-nota pp-o-grze">${esc(stopka.textContent.trim())}</p>` : ""}`;
  const sk = lista.querySelector("#pp-sek-konto");
  for (const n of konto) sk.appendChild(n);
  if (!konto.length) sk.hidden = true;
  if (funkcje) { const g = lista.querySelector("#pp-sek-gra"); g.hidden = false; g.appendChild(funkcje); }
  odswiezUstawienia();
}
function przeniesUstawienia() {
  const cel = el("pp-ust");
  const przenies = () => {
    const ust = document.querySelector(".naglowek .ustawienia") || cel.querySelector(".ustawienia");
    if (!ust) return false;
    if (!cel.contains(ust)) cel.appendChild(ust);
    budujUstawienia(ust);
    return true;
  };
  if (!przenies()) document.addEventListener("DOMContentLoaded", () => setTimeout(przenies));
}
function odswiezUstawienia() {
  const lista = document.getElementById("ustawienia-lista");
  if (!lista?.dataset.pp) return;
  const w = window.lukrum?.wyglad?.odczytaj() || { paleta: "bar", tryb: "jasny" }, m = ustMapy(), r = odczytajRozmiar();
  const ustaw = (b, tak) => { b.setAttribute("aria-pressed", String(tak)); b.classList.toggle("aktywny", tak); };
  lista.querySelectorAll("[data-paleta]").forEach((b) => ustaw(b, b.dataset.paleta === w.paleta));
  lista.querySelectorAll("[data-tryb]").forEach((b) => ustaw(b, b.dataset.tryb === w.tryb));
  lista.querySelectorAll("[data-rozmiar]").forEach((b) => ustaw(b, b.dataset.rozmiar === r));
  lista.querySelectorAll("[data-akcja='mapa-warstwa']").forEach((b) => ustaw(b, b.dataset.w === (m.warstwa || "")));
  const o = lista.querySelector(".pp-opinie");
  if (o) ustaw(o, m.opinie !== false);
}

// --- okna ------------------------------------------------------------------------------------------------------------
function htmlFinansow(c) {
  const v = c.v, st = v.stan || {}, d = v.dashboard || {};
  const debet = st.debet_wlaczony ? st.debet || 0 : 0;
  let html = kafelkiLiczb([{ etykieta: "Gotówka", wartosc: zl(st.gotowka ?? d.saldo), ton: (st.gotowka ?? d.saldo) < 0 ? "minus" : "" },
    { etykieta: "Debet", wartosc: debet > 0 ? `! ${zl(debet)}` : zl(0), ton: debet > 0 ? "minus" : "" },
    d.lokaty > 0 && { etykieta: "Lokaty", wartosc: zl(d.lokaty) },
    d.zadluzenie - debet > 0.005 && { etykieta: "Kredyty do spłaty", wartosc: zl(d.zadluzenie - debet), ton: "minus" }]);
  let raport = "";
  try { if (v.wyniki && c.dostepna("raport")) raport = ZAKLADKI.raport.wyniki(c); } catch (e) { console.error(e); }
  html += raport || `<p class="podpowiedz">Pełny raport finansowy pojawi się po pierwszym przeliczonym tygodniu.</p>`;
  return html;
}
const przyciskiFinansow = (c) => ["bank", "kpir", "raport"].filter((k) => c.dostepna(k) && !c.zakryta(k))
  .map((k) => `<a class="btn jasny" href="#${k}" data-zakladka-k="${k}">${esc(c.tytulZakladki(k))}</a>`).join("");

function htmlKonta() {
  const u = document.querySelector(".ustawienia-lista .uzytkownik"), wyl = document.querySelector(".ustawienia-lista .wyloguj");
  const mg = document.querySelector('.ustawienia-lista a[href="/mg/"]');
  return `<p>${u ? `Zalogowano jako <b>${esc(u.textContent.trim())}</b>.` : "Gra lokalna – bez logowania."}</p>
    <p class="pp-konto-linki"><a class="btn jasny" href="/">Moje gry</a>${mg ? ` <a class="btn jasny" href="/mg/">Panel mistrza gry</a>` : ""}</p>
    ${wyl ? `<div class="pp-konto-wyloguj">${wyl.outerHTML}</div>` : ""}`;
}

// wszystkie okna pulpitu rysują się tą samą drogą – przy odświeżeniu widoku otwarte okno aktualizuje się w miejscu
function pokaz(rodzaj, c) {
  const v = c.v;
  if (rodzaj === "wyslij") {
    oknoRunda = v.gra.runda;
    okno(T_WYSLIJ, htmlKoperty(c), { srednie: true, klasa: "pp-okno-koperta" });
  } else if (rodzaj === "finanse") {
    okno(T_FINANSE, htmlFinansow(c), { srednie: true, przyciski: przyciskiFinansow(c) });
    try { if (v.wyniki && c.dostepna("raport")) ZAKLADKI.raport.po?.(c); } catch (e) { console.error(e); }
  } else if (rodzaj === "zakupy") okno(T_ZAKUPY, htmlZakupow(c), { male: true, klasa: "pp-okno-paragon" });
  else if (rodzaj === "konto") okno(T_KONTO, htmlKonta(), { male: true });
}


// --- zakupy tygodnia (tylko do odczytu): to, co jest w decyzjach bieżącego tygodnia -------------------------------------
const DNI = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"];
const gw = (q) => (q ? ` ${"★".repeat(+q)}` : "");
function zakupyTygodnia(c) {
  const d = c.d || {}, zas = c.kat?.zasoby || {};
  const skladniki = (d.zamowienia || []).map((x) => `${esc(x.dostawca)}: ${esc(x.zasob)}${gw(x.jakosc)}, ${x.ilosc} × ${esc(zas[x.zasob]?.typ_opakowania || "opakowanie")}`
    + `, dostawa: ${DNI[+x.dzien || 0]}`);
  const sprzet = (d.sprzet_kup || []).map((x) => `${esc(x.nazwa)}${gw(x.jakosc)} (${esc(x.typ)})`);
  const reszta = [...(d.wyposazenie_kup || []), ...(d.udogodnienia_kup || [])].map((x) => esc(typeof x === "string" ? x : x.nazwa || ""))
    .concat((d.dekor_kup || []).map(([g, st]) => `wystrój: ${esc(g)} – ${esc(st)}`));
  const uslugi = (d.kampanie || []).map((k) => `reklama: ${esc(k.agencja)}, ${esc(k.kanal)}${k.emisje ? ` (${k.emisje} emisji)` : ""}`)
    .concat((d.szkolenia || []).map((x) => `szkolenie: ${esc(x.szkolenie)} (${esc(x.firma)})`))
    .concat((d.leasing_wez || []).map((x) => `leasing: ${esc(x.nazwa)} (${esc(x.bank)})`));
  return [["Składniki z dostaw", skladniki], ["Sprzęt", sprzet], ["Wyposażenie i wystrój", reszta], ["Usługi", uslugi]];
}
const liczbaZakupow = (c) => zakupyTygodnia(c).reduce((s, [, l]) => s + l.length, 0);
// Paragon: długa wstęga papieru – nagłówek firmy, pozycje tygodnia (z decyzji), kwoty z widoku (v.koszty_decyzji), suma i ząbkowany dół.
function htmlZakupow(c) {
  const v = c.v, grupy = zakupyTygodnia(c).filter(([, l]) => l.length);
  const koszty = (v.koszty_decyzji || []).filter((p) => p.pozostale);
  const suma = koszty.reduce((s, p) => s + p.pozostale, 0);
  const naglowek = `<header class="pp-par-gora"><b class="pp-par-szyld">LUKRUM</b><span>PARAGON – ZAKUPY TYGODNIA</span><span>${esc(v.dashboard?.nazwa || "")}</span>
    <span>${esc(v.miesiac || `Tydzień ${v.runda}`)}</span></header>`;
  const pozycje = grupy.length
    ? grupy.map(([n, l]) => `<section class="pp-par-grupa"><h3>${n} <span class="licznik">${l.length}</span></h3><ul>${l.map((x) => `<li>${x}</li>`).join("")}</ul></section>`).join("")
    : `<p class="pp-par-pusty">Nie ma nowych zamówień ani zakupów w decyzjach tego tygodnia.</p>
       <p class="pp-par-nota">Składniki zamawia się w Hurtowniach, sprzęt i wyposażenie w Parku handlowym, a usługi w biurowcu, akademii i banku.</p>`;
  const rozliczenie = koszty.length ? `<section class="pp-par-grupa"><h3>Rozliczenie z widoku gry</h3><ul class="pp-par-kwoty">${koszty.map((p) =>
    `<li><span>${esc(p.opis)}</span><b>${zl(p.pozostale)}</b></li>`).join("")}</ul></section>` : "";
  return `<div class="pp-paragon" role="document">${naglowek}${pozycje}${rozliczenie}
    <div class="pp-par-suma"><span>SUMA DO ZAPŁATY</span><b>${zl(suma)}</b></div>
    <p class="pp-par-nota">Tylko podgląd: niczego tu nie zamawia się. Zmiany robi się w budynkach na mapie. Dziękujemy – prosimy o paragon!</p>
    <div class="pp-par-zab" aria-hidden="true"></div></div>`;
}

// --- „Wyślij decyzje” jako koperta: adres, podsumowanie decyzji tygodnia, przycisk Wyślij (z zakładki „wyslij”) i stempel WYSŁANO ----
let bylyWyslane = false;
function podsumowanieDecyzji(c) {
  const d = c.d || {}, v = c.v, n = (x) => (Array.isArray(x) ? x.length : x && typeof x === "object" ? Object.keys(x).length : 0);
  const wiersze = [["Zamówienia składników", n(d.zamowienia)], ["Ceny dań w menu", n(d.sprzedaz)], ["Sprzęt do kupienia", n(d.sprzet_kup)],
    ["Wyposażenie i wystrój", n(d.wyposazenie_kup) + n(d.udogodnienia_kup) + n(d.dekor_kup)], ["Zatrudnienia", n(d.zatrudnij)], ["Zwolnienia", n(d.zwolnij)],
    ["Reklamy", n(d.kampanie)], ["Szkolenia", n(d.szkolenia)], ["Kredyty i lokaty", n(d.kredyty_wez) + n(d.lokaty_zaloz)]].filter(([, k]) => k > 0);
  const bledy = (v.lista_bledow || []).filter((b) => b.poziom === "czerwony").length, uwagi = (v.lista_bledow || []).filter((b) => b.poziom === "zolty").length;
  const kosz = (v.koszty_decyzji || []).reduce((s, p) => s + (p.pozostale || 0), 0);
  return `<section class="pp-kop-lista" aria-label="Podsumowanie decyzji"><h3>W kopercie: decyzje tygodnia ${v.runda}</h3>
    ${wiersze.length ? `<ul>${wiersze.map(([nz, k]) => `<li><span>${nz}</span><b>${k}</b></li>`).join("")}</ul>` : `<p class="podpowiedz">Bez zmian względem poprzedniego tygodnia.</p>`}
    <p class="pp-kop-uwagi">${bledy ? `<span class="pp-kop-znak">! ${bledy} poważnych uwag na liście błędów</span>` : `<span>✓ Brak poważnych uwag</span>`}${uwagi ? ` · <span>▼ ${uwagi} drobnych</span>` : ""}
      ${kosz ? ` · <span>Koszty decyzji: <b>${zl(kosz)}</b></span>` : ""}</p></section>`;
}
function htmlKoperty(c) {
  const v = c.v, swiezo = !!v.wyslane && !bylyWyslane;
  bylyWyslane = !!v.wyslane;
  return `<div class="pp-koperta${v.wyslane ? " wyslana" : ""}"><div class="pp-kop-klapa" aria-hidden="true"></div>
    <p class="pp-kop-adres"><small>Od:</small> ${esc(v.dashboard?.nazwa || "Drużyna")}<br><small>Do:</small> Mistrz gry · tydzień ${v.runda}</p>
    ${v.wyslane ? `<div class="pp-stempel${swiezo ? " swiezy" : ""}" role="img" aria-label="Stempel: wysłano"><b>✓ WYSŁANO</b><small>tydzień ${v.runda}</small></div>` : ""}
    ${podsumowanieDecyzji(c)}<div class="pp-kop-wyslij">${ZAKLADKI.wyslij.decyzje(c)}</div></div>`;
}

// --- wydarzenia tygodnia (szuflada na pasku): wszystko, co dzieje się w tym tygodniu, z widoku gry ----------------------
// Parki: v.zdarzenia (aktywne, oczekujące, trwające skutki). Miasto: v.kalendarz_miasta.biezacy.wydarzenia (nazwa, rodzaj, dni, opis,
// mnożniki puli klientów w strefach, dania). Widok nie podaje konkretnego budynku wydarzeń miejskich – tylko strefy (dzielnice).
const dataKrotka = (iso) => { const [, m, d] = String(iso).split("-"); return `${+d}.${m}`; };
const kiedy = (dni) => (!dni?.length ? "" : dni.length === 1 ? dataKrotka(dni[0]) : `${dataKrotka(dni[0])}–${dataKrotka(dni[dni.length - 1])}`);
const procent = (m) => `${m > 1 ? "▲ +" : "▼ −"}${Math.round(Math.abs(m - 1) * 100)}%`;
// kartka na tablicy: pinezka u góry i znak kierunku skutku (▲ korzystny, ▼ niekorzystny, ▲▼ mieszany – nigdy samym kolorem)
const mnozniki = (w) => [...Object.values(w.strefy || {}), ...Object.values(w.dania || {})].filter((m) => typeof m === "number" && m !== 1);
const kierunek = (w) => { const m = mnozniki(w), g = m.some((x) => x > 1), d = m.some((x) => x < 1); return g && d ? "▲▼" : g ? "▲" : d ? "▼" : "•"; };
const kierunekOpis = (w) => ({ "▲": "korzystne dla popytu", "▼": "niekorzystne dla popytu", "▲▼": "skutki mieszane", "•": "bez wpływu na popyt" })[kierunek(w)];
const pinezka = (znak, opis) => `<span class="pp-pin" aria-hidden="true"></span><span class="pp-ogl-znak" title="${opis}" role="img" aria-label="${opis}">${znak}</span>`;
function wydarzenia(c) {
  const v = c.v, Z = v.zdarzenia, K = v.kalendarz_miasta, budynek = (id) => c.kat?.mapa?.budynki?.find((b) => b.id === id);
  const parki = (Z && v.runda >= Z.od_rundy ? Z.aktywne : []).filter((s) => s.park).map((s) => `<li class="pp-ogl pp-ogl-park">${pinezka("!", "wymaga reakcji")}<b>${esc(s.tytul)}</b>
    <small>Park: ${esc(budynek(s.park)?.nazwa || s.park)} · w tym tygodniu</small>
    <span class="pp-sz-akcje"><button type="button" class="pp-lnk" data-akcja="pp-pokaz" data-b="${esc(s.park)}">⌖ Pokaż na mapie</button>
    <button type="button" class="pp-lnk" data-akcja="zd-park" data-id="${esc(s.park)}">Otwórz i zareaguj</button></span></li>`);
  const dalej = (Z?.oczekujace || []).map((o) => `<li class="pp-ogl pp-sz-szare">${pinezka("…", "ciąg dalszy")}<b>${esc(o.tytul)}</b> <small>ciąg dalszy w tygodniu ${o.runda}${o.park ? `, park: ${esc(budynek(o.park)?.nazwa || o.park)}` : ""}</small></li>`);
  const trwa = (Z?.efekty || []).map((e) => `<li class="pp-ogl pp-sz-szare">${pinezka("…", "trwa")}<b>${esc(e.opis)}</b> <small>jeszcze trwa, do tygodnia ${e.do_rundy}</small></li>`);
  const strefy = (w) => Object.entries(w.strefy || {}).filter(([k]) => k !== "wszystkie").map(([k, m]) => {
    const d = c.kat?.mapa?.strefy?.[k]?.dzielnice?.[0];
    return `<button type="button" class="pp-lnk" data-akcja="pp-dzielnica" data-d="${esc(d || "")}" ${d ? "" : "disabled"} title="Pokaż na mapie: ${esc(nazwaStrefy(c.kat, k))}">⌖ ${esc(nazwaStrefy(c.kat, k))} ${procent(m)}</button>`;
  }).join("");
  const miasto = (K?.biezacy?.wydarzenia || []).map((w) => {
    const wsz = w.strefy?.wszystkie, dania = Object.entries(w.dania || {}).filter(([, m]) => m !== 1).slice(0, 3).map(([u, m]) => `${esc(nazwaUslugi(c.kat, u))} ${procent(m)}`).join(", ");
    return `<li class="pp-ogl">${pinezka(kierunek(w), kierunekOpis(w))}<b>${esc(w.nazwa)}</b> <small>${esc(K.rodzaje?.[w.rodzaj] || w.rodzaj || "")} · ${kiedy(w.dni)}</small>
      ${w.opis ? `<span>${esc(w.opis)}</span>` : ""}
      <span class="pp-sz-skutek">Klienci: ${wsz ? `cała reszta miasta ${procent(wsz)}` : ""}${strefy(w) || (wsz ? "" : "bez zmian")}${dania ? `<br>Popyt na dania: ${dania}` : ""}</span></li>`;
  });
  const lista = (l, pusto) => (l.length ? `<ul class="pp-sz-lista">${l.join("")}</ul>` : `<p class="podpowiedz">${pusto}</p>`);
  const kal = c.jestZakladka("kalendarz") && !c.wylaczona("kalendarz") && !c.ukryta("kalendarz")
    ? `<p><button type="button" class="pp-lnk" data-akcja="pp-kalendarz">Kalendarz miejski: cały miesiąc →</button></p>` : "";
  const html = `<div class="pp-sz-gora"><h2>Tablica ogłoszeń · wydarzenia tygodnia</h2><button type="button" class="pp-sz-x" data-akcja="pp-wydarzenia" aria-label="Zamknij wydarzenia">✕</button></div>
    <div class="pp-sz-kolumny"><section><h3>W parkach</h3>${lista(parki, "W tym tygodniu w parkach spokojnie.")}${dalej.length || trwa.length ? `<ul class="pp-sz-lista">${dalej.concat(trwa).join("")}</ul>` : ""}</section>
    <section><h3>W mieście</h3>${lista(miasto, "W tym tygodniu nic szczególnego.")}${kal}</section></div>`;
  return { html, n: parki.length + miasto.length };
}
function odswiezSzuflade(c) {
  const sz = el("pp-szuflada"), w = wydarzenia(c);
  if (!sz.hidden) { const przew = sz.scrollTop; sz.innerHTML = w.html; sz.scrollTop = przew; } else sz.innerHTML = w.html;
  znak("pp-wydarzenia", w.n ? String(w.n) : "", "");
  const b = el("pp-wydarzenia");
  b.setAttribute("aria-expanded", String(!sz.hidden));
  b.title = w.n ? `Wydarzenia tygodnia: ${w.n}` : "Wydarzenia tygodnia";
  b.setAttribute("aria-label", b.title);
}
const podreczneOtwarte = () => !el("pp-szuflada").hidden;
function zamknijPodreczne() {
  const sz = el("pp-szuflada");
  if (sz) sz.hidden = true;
  el("pp-wydarzenia")?.setAttribute("aria-expanded", "false");
}

// --- filtr kategorii miejsc (rząd ikon wzdłuż górnej krawędzi): 5 grup rodzajów + „Kebab” i „Wydarzenia”; podświetla pasujące znaki, resztę przygasza ---
// JEDNO miejsce, które mówi, do której grupy należy rodzaj żetonu (`rodzaj` z dane/mapa/*.yaml → klasa lm-r-<rodzaj>). Rodzaj spoza listy
// (ulica, kolej, punkt orientacyjny…) nie należy do żadnej grupy (przy włączonym filtrze jest przygaszony). „Kebab” = lokale kebab na mapie
// (własny z ★ i cudze), „Wydarzenia” = miejsca z wydarzeniami tygodnia (parki ze zdarzeniami z widoku gry), bez rodzajów: pasują po id / klasie.
const GRUPY = [   // [klucz, nazwa, ikona, rodzaje]
  ["jedzenie", "Jedzenie i zaopatrzenie", "dostawcy", ["dostawca", "sklep"]],
  ["finanse", "Finanse", "bank", ["bank", "lichwiarz", "gielda", "ubezpieczenia", "szkody"]],
  ["urzedy", "Urzędy i prawo", "urzad", ["urzad", "poczta", "biuro"]],
  ["ludzie", "Praca i ludzie", "rynek_pracy", ["praca", "pracownik", "szkola", "uczelnia", "klienci", "detektyw"]],
  ["reklama", "Reklama i media", "marketing", ["reklama", "media", "druk", "radio_billboard", "internet"]],
  ["kebab", "Kebab", "kebab", []],
  ["wydarzenia", "Wydarzenia", "kalendarz", []]];
const GRUPA_DOMYSLNA = null;
const RODZAJ_NA_GRUPE = Object.fromEntries(GRUPY.flatMap(([k, , , r]) => r.map((x) => [x, k])));
export const grupaRodzaju = (rodzaj) => RODZAJ_NA_GRUPE[rodzaj] || GRUPA_DOMYSLNA;
// rożen z mięsem (jak żeton lokalu na mapie), kreskami jak ikony interfejsu 24 × 24
const IKONY_FILTRA = { kebab: '<path d="M12 2.500v19"/><path d="M7 7h10l-1.800 10H8.800z"/><path d="M8 11h8M8.500 14h7"/><path d="M8 21.500h8"/>' };
const ikonaFiltra = (nazwa) => (IKONY_FILTRA[nazwa]
  ? `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IKONY_FILTRA[nazwa]}</g></svg>` : ikona(nazwa, 22));
// id miejsc z wydarzeniami w tym tygodniu: parki, w których trwa zdarzenie (widok gry: zdarzenia.aktywne)
const miejscaWydarzen = (v) => new Set((v.zdarzenia && v.runda >= v.zdarzenia.od_rundy ? v.zdarzenia.aktywne : []).map((s) => s.park).filter(Boolean));
function kategorieZnaku(zn, zespoly, wydarzenia) {
  const k = new Set();
  for (const cls of zn.classList) { const m = /^lm-r-(.+)$/.exec(cls); if (m && grupaRodzaju(m[1])) k.add(grupaRodzaju(m[1])); }
  if (zn.classList.contains("lm-zespol")) for (const r of zespoly[zn.dataset.id] || []) if (grupaRodzaju(r)) k.add(grupaRodzaju(r));
  if (zn.classList.contains("lm-lokal")) k.add("kebab");
  if (wydarzenia.has(zn.dataset.id)) k.add("wydarzenia");
  return k;
}
function odswiezFiltr(c) {
  const nav = el("pp-filtr"), znaki = [...document.querySelectorAll("#lmapa .lmapa-nakladka > .lm-znak")];
  nav.hidden = c.zakladka !== "mapa" || !znaki.length;
  if (nav.hidden) return;
  const zespoly = {}, wydarzenia = miejscaWydarzen(c.v);
  for (const b of c.kat?.mapa?.budynki || []) if (b.zespol) (zespoly[b.zespol] ||= []).push(b.rodzaj);
  const dostepne = new Set();
  const dane = znaki.map((zn) => { const k = kategorieZnaku(zn, zespoly, wydarzenia); k.forEach((x) => dostepne.add(x)); return [zn, k]; });
  if (filtr && !dostepne.has(filtr)) filtr = null;
  // „Wydarzenia” bez miejsc w tym tygodniu zostaje w rzędzie, ale jest wyszarzone z podpowiedzią
  nav.innerHTML = GRUPY.filter(([k]) => dostepne.has(k) || k === "wydarzenia").map(([k, nazwa, ik]) => {
    const brak = !dostepne.has(k), akt = filtr === k;
    const opis = brak ? `${nazwa}: w tym tygodniu brak wydarzeń w miejscach na mapie` : `${nazwa}${akt ? " – kliknij, żeby wyłączyć filtr" : ""}`;
    return `<button type="button" class="pp-f${akt ? " aktywny" : ""}${brak ? " szare" : ""}" data-akcja="pp-filtr" data-k="${k}"${brak ? ' aria-disabled="true"' : ""}
    aria-pressed="${filtr === k}" aria-label="${nazwa}${akt ? " (włączony)" : brak ? " (brak wydarzeń w tym tygodniu)" : ""}" title="${opis}">${ikonaFiltra(ik)}</button>`;
  }).join("");
  for (const [zn, k] of dane) {
    zn.classList.toggle("pp-pasuje", !!filtr && k.has(filtr));
    zn.classList.toggle("pp-przygaszony", !!filtr && !k.has(filtr));
  }
}

export const AKCJE_PULPITU = {
  "pp-wyslij": (e, c) => {
    if (c.v.gra.zakonczona) return toast("Gra zakończona – nie ma już decyzji do wysłania.");
    pokaz("wyslij", c);
  },
  "pp-konto": (e, c) => pokaz("konto", c),
  "pp-koszyk": (e, c) => pokaz("zakupy", c),
  "pp-mapa": (e, c) => { zamknijOkno(); c.idz("mapa"); },
  "pp-wroc": (e, c) => wroc(c),
  "pp-portfel": (e, c) => pokaz("finanse", c),
  "pp-zeszyt": (e, c) => { zamknijPodreczne(); otworzZeszyt(c, 0); },
  "pp-zeszyt-zamknij": () => zamknijZeszyt(),
  "pp-zeszyt-strona": (e, c) => (e.dataset.n != null ? idzDoStrony(c, +e.dataset.n) : krokZeszytu(c, +(e.dataset.d || 0))),
  "pz-dol": (e) => przewinZeszyt(e),
  // klik w nazwę miejsca (zeszyt, wydarzenia): zeszyt i szuflada się chowają, mapa przelatuje do budynku i go pulsuje
  "pp-pokaz": (e, c) => { zamknijZeszyt(false); zamknijPodreczne(); filtr = null; pokazNaMapie(c, e.dataset.b.split(",")); },
  "pp-dzielnica": (e, c) => { zamknijPodreczne(); if (e.dataset.d) pokazNaMapie(c, null, { dzielnica: e.dataset.d }); },
  // krok z listy wujka: od razu do właściwego wnętrza albo ekranu
  "pp-wejdz": (e, c) => {
    zamknijZeszyt(false);
    if (e.dataset.k === "wyslij") return AKCJE_PULPITU["pp-wyslij"](e, c);
    wejdzDoKroku(c, e.dataset.k);
  },
  "pp-kalendarz": (e, c) => { zamknijPodreczne(); c.idz("kalendarz"); },
  "pp-wydarzenia": (e, c) => {
    const sz = el("pp-szuflada"), otwieramy = sz.hidden;
    zamknijPodreczne();
    if (!otwieramy) return;
    odswiezSzuflade(c);
    sz.hidden = false;
    el("pp-wydarzenia").setAttribute("aria-expanded", "true");
  },
  "pp-filtr": (e, c) => { if (e.getAttribute("aria-disabled") === "true") return; filtr = filtr === e.dataset.k ? null : e.dataset.k; odswiezFiltr(c); el("pp-filtr").querySelector(`[data-k="${filtr || e.dataset.k}"]`)?.focus({ preventScroll: true }); },
  "pp-wyglad": (e) => {
    const d = e.dataset;
    if (d.rozmiar) stosujRozmiar(d.rozmiar);
    else window.lukrum?.wyglad?.ustaw(d.paleta ? { paleta: d.paleta } : { tryb: d.tryb });
    odswiezUstawienia();
  },
};

// --- odświeżanie po każdym przerysowaniu widoku (app.js: rysuj) -----------------------------------------------------
function znak(id, tekst, stan) {
  const i = el(id)?.querySelector(".pp-znak");
  if (!i) return;
  i.textContent = tekst;
  i.hidden = !tekst;
  if (stan) i.dataset.stan = stan; else delete i.dataset.stan;
}

function odswiezPasek(c) {
  const v = c.v, bledy = (v.lista_bledow || []).filter((b) => b.poziom === "czerwony").length;
  const w = el("pp-wyslij");
  const sent = !!v.wyslane, zak = v.gra.zakonczona;
  w.setAttribute("aria-disabled", zak ? "true" : "false");
  w.classList.toggle("pp-wyszarzona", zak);
  w.classList.toggle("wyslana", sent);
  w.title = zak ? "Gra zakończona" : sent ? "Decyzje wysłane – kliknij, żeby wrócić do poprawiania" : "Wyślij decyzje tygodnia";
  w.setAttribute("aria-label", w.title);
  znak("pp-wyslij", sent ? "✓" : bledy && v.edycja ? "!" : "", sent ? "ok" : "uwaga");
  const n = liczbaZakupow(c), k = el("pp-koszyk");
  k.title = n ? `Zakupy tygodnia: ${n} pozycji (tylko podgląd)` : "Zakupy tygodnia: na razie nic (tylko podgląd)";
  k.setAttribute("aria-label", k.title);
  znak("pp-koszyk", n ? String(n) : "", "");
  el("pp-mapa").hidden = c.zakladka === "mapa";
  const wr = el("pp-wroc");
  wr.hidden = !mozeWrocic(c);
  wr.setAttribute("aria-label", `Wróć: ${dokadWroc()} (Esc)`);
  wr.title = `Wróć: ${dokadWroc()} (Esc)`;
}

function odswiezTydzien(c) {
  const v = c.v, st = document.getElementById("status-gry");
  // „Tydzień N” na środku u góry – tylko informacja; nazwa drużyny i stan gry z dawnego nagłówka (wstrzymanie, „Czekamy na…”,
  // termin; bez nazwy gry, składu i salda) zostają przy pasku po lewej
  const chipy = st ? [...st.children].slice(1).filter((x) => !x.querySelector("svg")).map((x) => `<span class="pp-chip">${x.innerHTML}</span>`).join("") : "";
  el("pp-tydzien").innerHTML = `<b title="Tydzień ${v.runda} z ${v.gra.liczba_rund}">Tydzień ${v.runda}${v.runda < v.gra.runda ? " · podgląd" : ""}</b>`;
  // nazwa gry (np. „testowa”) i firma: na mapie leżą nad przyciskiem Legenda (pulpit.css), poza mapą – pod paskiem
  const gra = v.gra?.nazwa || "", firma = v.dashboard?.nazwa || "";
  el("pp-druzyna").innerHTML = `${gra ? `<small class="pp-gra-n"><i>Gra</i> ${esc(gra)}</small>` : ""}${firma ? `<span class="pp-chip pp-firma">Firma: ${esc(firma)}</span>` : ""}${chipy}`;
  el("pp-druzyna").hidden = !(gra || firma || chipy);
  document.documentElement.style.setProperty("--pp-gra-h", `${el("pp-druzyna").hidden ? 0 : Math.ceil(el("pp-druzyna").getBoundingClientRect().height) + 8}px`);
}

function odswiezPortfel(c) {
  const v = c.v, st = v.stan || {}, d = v.dashboard || {};
  const gotowka = st.gotowka ?? d.saldo, debet = st.debet_wlaczony ? st.debet || 0 : 0;
  const w = el("pp-portfel");
  const opis = `Portfel: gotówka ${zl(gotowka)}, ${debet > 0 ? `debet ${zl(debet)}` : "bez debetu"}. Otwórz finanse`;
  w.setAttribute("aria-label", opis);
  w.classList.toggle("pp-debet", debet > 0);
  el("pp-kwoty").innerHTML = `<span class="pp-kw"><small>Gotówka</small><b>${gotowka < 0 ? "▼ " : ""}${zl(gotowka)}</b></span>
    <span class="pp-kw ${debet > 0 ? "zle" : ""}"><small>Debet</small><b>${debet > 0 ? "! " + zl(debet) : "brak"}</b></span>`;
}

export function odswiezPulpit(c) {
  if (!PULPIT) return;
  montuj();
  ostatniC = c;
  zapamietajWidok(c);
  document.body.classList.toggle("na-mapie", c.zakladka === "mapa");
  document.body.classList.toggle("we-wnetrzu-pp", c.zakladka === "miejsce");
  odswiezPasek(c);
  odswiezTydzien(c);
  odswiezPortfel(c);
  rysujMalyZeszyt(c, el("pp-zeszyt"));
  odswiezSzuflade(c);
  odswiezFiltr(c);
  odswiezUstawienia();
  try { oznaczCel(c.v); } catch (e) { console.error(e); }   // obwódka „teraz” na budynku następnego kroku także na mapie
  // otwarte okna pulpitu aktualizują się w miejscu; okno wysyłania znika, gdy tydzień się przeliczył
  if (otwarteOkno(T_WYSLIJ)) { if (oknoRunda !== c.v.gra.runda) zamknijOkno(); else pokaz("wyslij", c); }
  if (otwarteOkno(T_FINANSE)) pokaz("finanse", c);
  if (zeszytOtwarty()) odswiezZeszyt(c);
  if (otwarteOkno(T_ZAKUPY)) pokaz("zakupy", c);
}
