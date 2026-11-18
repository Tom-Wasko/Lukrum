// Powłoka pulpitu (seria pulpit, krok 1; decyzje 18.11.2026): mapa na cały ekran i trzy elementy przy krawędziach.
// Krok 2: „Tydzień N” na środku u góry, szuflada „Wydarzenia”, ikona „Warstwy” (czynsze, popyt…), filtr kategorii miejsc w prawym
// górnym rogu, zeszyt w prawym dolnym rogu na trzy stany (zeszyt.js), karta miejsca (karta.js).
//  - lewy górny róg: ⚙ (ustawienia z motyw.js) nad pionowym paskiem LUKRUM z ikonami: Wyślij decyzje, konto, Jak grać,
//    zakupy (tylko do odczytu: co zamówiono i kupiono w tym tygodniu); pod paskiem „Tydzień N” (tylko informacja);
//  - dół: portfel (plik banknotów) – najechanie pokazuje gotówkę i debet, kliknięcie otwiera okno finansów;
//  - prawa krawędź: zeszyt wujka – wystaje z brzegu z następnym krokiem, najechanie wysuwa listę, kliknięcie otwiera zeszyt.
// Stary układ (nagłówek, menu, stopka) jest do obejrzenia pod adresem ?uklad=stary i na wąskim ekranie (telefon – później).
// Kolory tylko ze zmiennych motywy/zmienne.css; wygląd: pulpit.css.
import { esc, kafelkiLiczb, okno, otwarteOkno, toast, zamknijOkno, zl } from "../zakladki/wspolne.js";
import { ikona } from "../zakladki/ikony.js";
import ZAKLADKI from "../zakladki/index.js";
import { oznaczCel } from "../zakladki/wujek.js";
import { parkiNaMapie } from "../zakladki/zdarzenia.js";
import { idzDoStrony, odswiezZeszyt, otworzZeszyt, rysujMalyZeszyt, zamknijZeszyt, zeszytOtwarty } from "./zeszyt.js";

// klasę ustawia skrypt na początku <body> (gra.html), żeby układ nie migał
export const PULPIT = document.body.classList.contains("pulpit");

const T_WYSLIJ = "Wyślij decyzje", T_FINANSE = "Finanse", T_KONTO = "Konto", T_ZAKUPY = "Zakupy tygodnia";
const IKONY_PASKA = [   // [klucz, ikona, napis]
  ["wyslij", "wyslij", "Wyślij decyzje"], ["konto", "osoba", "Konto"], ["jak", "ksiazka", "Jak grać"], ["koszyk", "sprzedaz", "Zakupy"],
  ["wydarzenia", "zdarzenia", "Wydarzenia"], ["warstwy", "warstwy", "Warstwy mapy"], ["mapa", "mapa", "Mapa miasta"]];
let filtr = null;   // wybrana kategoria miejsc na mapie (filtr w prawym górnym rogu) albo null

let zamontowany = false, oknoRunda = null;
const zeszytNr = () => Number(document.querySelector(".pz-zakladka.aktywna")?.dataset.n || 0);
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

function montuj() {
  if (zamontowany) return;
  zamontowany = true;
  const ikonyHtml = IKONY_PASKA.map(([k, ik, napis]) => k === "jak"
    ? `<a class="pp-ik" id="pp-jak" href="/jak-grac" target="_blank" rel="noopener" aria-label="${napis} (nowa karta)" title="${napis}">${ikona(ik, 22)}<span>${napis}</span></a>`
    : `<button type="button" class="pp-ik" id="pp-${k}" data-akcja="pp-${k}" aria-label="${napis}" title="${napis}"${k === "mapa" || k === "warstwy" ? " hidden" : ""}>${ikona(ik, 22)}<span>${napis}</span><i class="pp-znak" aria-hidden="true" hidden></i></button>`).join("");
  const rys = document.createElement("div");
  rys.id = "pulpit";
  rys.className = "pp";
  rys.innerHTML = `<div class="pp-lewy"><div id="pp-ust" class="pp-ust"></div>
      <nav class="pp-pasek" aria-label="Pasek LUKRUM"><div class="pp-szyld" aria-hidden="true">LUKRUM</div>${ikonyHtml}</nav>
      <div class="pp-druzyna" id="pp-druzyna"></div></div>
    <div class="pp-tydzien" id="pp-tydzien" role="status"></div>
    <nav class="pp-filtr" id="pp-filtr" aria-label="Filtr kategorii miejsc na mapie" hidden></nav>
    <aside class="pp-szuflada" id="pp-szuflada" aria-label="Wydarzenia tygodnia" hidden></aside>
    <button type="button" class="pp-portfel" id="pp-portfel" data-akcja="pp-portfel">${SVG_PLIK}<span class="pp-kwoty" id="pp-kwoty"></span></button>
    <button type="button" class="pp-zeszyt" id="pp-zeszyt" data-akcja="pp-zeszyt"></button>`;
  document.body.appendChild(rys);
  przeniesUstawienia();
  // Esc chowa wysunięte elementy (WCAG 1.4.13: treść pojawiająca się po najechaniu da się zamknąć bez ruszania myszą)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && (document.body.classList.contains("pp-warstwy") || !el("pp-szuflada").hidden)) { zamknijPodreczne(); return; }
    if (e.key !== "Escape" || !(rys.matches(":hover") || rys.contains(document.activeElement))) return;
    rys.classList.add("pp-schowane");
    if (rys.contains(document.activeElement)) document.activeElement.blur();
  });
  rys.addEventListener("pointerleave", () => rys.classList.remove("pp-schowane"));
  document.addEventListener("click", (e) => {   // klik poza szufladą i warstwami je zamyka
    if (!e.target.closest("#pp-szuflada, #pp-wydarzenia, #pp-warstwy, .lm-ustawienia")) zamknijPodreczne();
  });
}

// ⚙ buduje motyw.js po załadowaniu strony (do nagłówka); w pulpicie przenosimy go w lewy górny róg
function przeniesUstawienia() {
  const cel = el("pp-ust");
  const przenies = () => {
    const ust = document.querySelector(".naglowek .ustawienia");
    if (!ust || cel.contains(ust)) return !!ust;
    cel.appendChild(ust);
    const lista = ust.querySelector(".ustawienia-lista"), stopka = document.querySelector(".stopka");
    if (lista && stopka && !lista.querySelector(".pp-nota")) {   // nota o fikcyjnych firmach: stopka znika z widoku, tekst zostaje tu
      const p = document.createElement("p");
      p.className = "pp-nota";
      p.textContent = stopka.textContent.trim();
      lista.appendChild(p);
    }
    return true;
  };
  if (!przenies()) document.addEventListener("DOMContentLoaded", () => setTimeout(przenies));
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
    okno(T_WYSLIJ, ZAKLADKI.wyslij.decyzje(c), { srednie: true });
  } else if (rodzaj === "finanse") {
    okno(T_FINANSE, htmlFinansow(c), { srednie: true, przyciski: przyciskiFinansow(c) });
    try { if (v.wyniki && c.dostepna("raport")) ZAKLADKI.raport.po?.(c); } catch (e) { console.error(e); }
  } else if (rodzaj === "zakupy") okno(T_ZAKUPY, htmlZakupow(c), { srednie: true });
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
function htmlZakupow(c) {
  const grupy = zakupyTygodnia(c).filter(([, l]) => l.length);
  if (!grupy.length) {
    return `<p>Nic jeszcze nie zamówiono ani nie kupiono w tym tygodniu.</p>
      <p class="podpowiedz">Składniki zamawia się w Hurtowniach, sprzęt i wyposażenie w Parku handlowym, a usługi (reklamy, szkolenia, leasing) w biurowcu, akademii i banku. Ta lista tylko pokazuje, co już jest w decyzjach.</p>`;
  }
  return `<p class="podpowiedz">Lista tylko do odczytu: to, co jest w decyzjach tego tygodnia. Zmienia się ją w budynkach na mapie.</p>`
    + grupy.map(([n, l]) => `<h3 class="pp-grupa">${n} <span class="licznik">${l.length}</span></h3><ul class="pp-zakupy">${l.map((x) => `<li>${x}</li>`).join("")}</ul>`).join("");
}

// --- wydarzenia tygodnia (szuflada na pasku): parki i wydarzenia miasta z widoku gry -----------------------------------
const dataKrotka = (iso) => { const [, m, d] = String(iso).split("-"); return `${+d}.${m}`; };
function wydarzenia(c) {
  const v = c.v;
  let parki = "";
  try { parki = parkiNaMapie(v, c.kat, c.edycja); } catch (e) { console.error(e); }
  const K = v.kalendarz_miasta, miasto = (K?.biezacy?.wydarzenia || []).map((w) => `<li><b>${esc(w.nazwa)}</b> <small>${esc(K.rodzaje?.[w.rodzaj] || w.rodzaj || "")}, ${(w.dni || []).map(dataKrotka).join(", ")}</small>
    ${w.opis ? `<span>${esc(w.opis)}</span>` : ""}</li>`);
  const kal = c.jestZakladka("kalendarz") && !c.wylaczona("kalendarz") && !c.ukryta("kalendarz")
    ? `<p><a class="pp-link" href="#kalendarz" data-zakladka-k="kalendarz">Kalendarz miejski →</a></p>` : "";
  const html = `<div class="pp-sz-gora"><h2>Wydarzenia tygodnia</h2><button type="button" class="pp-sz-x" data-akcja="pp-wydarzenia" aria-label="Zamknij wydarzenia">✕</button></div>
    ${parki ? `<section>${parki}</section>` : ""}
    <section><h3>W mieście</h3>${miasto.length ? `<ul class="pp-sz-lista">${miasto.join("")}</ul>` : `<p class="podpowiedz">W tym tygodniu nic szczególnego.</p>`}${kal}</section>`;
  return { html, n: (parki.match(/data-akcja="zd-park"/g) || []).length + miasto.length };
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
function zamknijPodreczne() {
  const sz = el("pp-szuflada");
  if (sz) sz.hidden = true;
  document.body.classList.remove("pp-warstwy");
  el("pp-wydarzenia")?.setAttribute("aria-expanded", "false");
  el("pp-warstwy")?.setAttribute("aria-expanded", "false");
}

// --- filtr kategorii miejsc (prawy górny róg): podświetla pasujące znaki na mapie, resztę przygasza -----------------------
const KATEGORIE = { bank: ["Banki", "bank"], urzad: ["Urzędy", "urzad"], poczta: ["Poczta", "wyslij"], biuro: ["Biura rachunkowe", "biuro"],
  nieruchomosci: ["Nieruchomości", "lokale"], praca: ["Praca", "rynek_pracy"], dostawca: ["Hurtownie", "dostawcy"], sklep: ["Sklepy", "sprzedaz"],
  szkola: ["Szkoły i uczelnie", "szkolenia"], reklama: ["Reklama", "marketing"], media: ["Media", "karta"], lichwiarz: ["Lichwiarz", "harpagon"],
  ubezpieczenia: ["Ubezpieczenia", "tarcza"], detektyw: ["Detektyw", "analiza"], gielda: ["Giełda", "wykres"], park: ["Parki", "zdarzenia"],
  lokal: ["Lokale kebabów", "klucz"], zabytek: ["Zabytki i punkty orientacyjne", "oko"] };
const RODZAJ_NA_KAT = { uczelnia: "szkola" };
function kategorieZnaku(zn, zespoly) {
  const k = new Set();
  for (const cls of zn.classList) { const m = /^lm-r-(.+)$/.exec(cls); if (m) k.add(RODZAJ_NA_KAT[m[1]] || m[1]); }
  if (zn.classList.contains("lm-zespol")) for (const r of zespoly[zn.dataset.id] || []) k.add(RODZAJ_NA_KAT[r] || r);
  if (zn.classList.contains("lm-lokal")) k.add("lokal");
  if (zn.classList.contains("lm-miejsce")) k.add("zabytek");
  return k;
}
function odswiezFiltr(c) {
  const nav = el("pp-filtr"), znaki = [...document.querySelectorAll("#lmapa .lmapa-nakladka > .lm-znak")];
  nav.hidden = c.zakladka !== "mapa" || !znaki.length;
  if (nav.hidden) return;
  const zespoly = {};
  for (const b of c.kat?.mapa?.budynki || []) if (b.zespol) (zespoly[b.zespol] ||= []).push(b.rodzaj);
  const dostepne = new Set();
  const dane = znaki.map((zn) => { const k = kategorieZnaku(zn, zespoly); k.forEach((x) => dostepne.add(x)); return [zn, k]; });
  if (filtr && !dostepne.has(filtr)) filtr = null;
  nav.innerHTML = Object.entries(KATEGORIE).filter(([k]) => dostepne.has(k)).map(([k, [nazwa, ik]]) => `<button type="button" class="pp-f${filtr === k ? " aktywny" : ""}" data-akcja="pp-filtr" data-k="${k}"
    aria-pressed="${filtr === k}" aria-label="${nazwa}" title="${nazwa}${filtr === k ? " – kliknij, żeby wyłączyć filtr" : ""}">${ikona(ik, 20)}</button>`).join("");
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
  "pp-portfel": (e, c) => pokaz("finanse", c),
  "pp-zeszyt": (e, c) => { zamknijPodreczne(); otworzZeszyt(c, 0); },
  "pp-zeszyt-zamknij": () => zamknijZeszyt(),
  "pp-zeszyt-strona": (e, c) => idzDoStrony(c, e.dataset.n != null ? +e.dataset.n : zeszytNr() + +(e.dataset.d || 0)),
  "pp-wydarzenia": (e, c) => {
    const sz = el("pp-szuflada"), otwieramy = sz.hidden;
    zamknijPodreczne();
    if (!otwieramy) return;
    odswiezSzuflade(c);
    sz.hidden = false;
    el("pp-wydarzenia").setAttribute("aria-expanded", "true");
  },
  "pp-warstwy": () => {
    const otwieramy = !document.body.classList.contains("pp-warstwy");
    zamknijPodreczne();
    document.body.classList.toggle("pp-warstwy", otwieramy);
    el("pp-warstwy").setAttribute("aria-expanded", String(otwieramy));
  },
  "pp-filtr": (e, c) => { filtr = filtr === e.dataset.k ? null : e.dataset.k; odswiezFiltr(c); },
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
  w.title = zak ? "Gra zakończona" : sent ? "Decyzje wysłane – kliknij, żeby wrócić do poprawiania" : "Wyślij decyzje tygodnia";
  w.setAttribute("aria-label", w.title);
  znak("pp-wyslij", sent ? "✓" : bledy && v.edycja ? "!" : "", sent ? "ok" : "uwaga");
  const n = liczbaZakupow(c), k = el("pp-koszyk");
  k.title = n ? `Zakupy tygodnia: ${n} pozycji (tylko podgląd)` : "Zakupy tygodnia: na razie nic (tylko podgląd)";
  k.setAttribute("aria-label", k.title);
  znak("pp-koszyk", n ? String(n) : "", "");
  el("pp-mapa").hidden = c.zakladka === "mapa";
  el("pp-warstwy").hidden = c.zakladka !== "mapa";
  if (c.zakladka !== "mapa") document.body.classList.remove("pp-warstwy");
}

function odswiezTydzien(c) {
  const v = c.v, st = document.getElementById("status-gry");
  // „Tydzień N” na środku u góry – tylko informacja; nazwa drużyny i stan gry z dawnego nagłówka (wstrzymanie, „Czekamy na…”,
  // termin; bez nazwy gry, składu i salda) zostają przy pasku po lewej
  const chipy = st ? [...st.children].slice(1).filter((x) => !x.querySelector("svg")).map((x) => `<span class="pp-chip">${x.innerHTML}</span>`).join("") : "";
  el("pp-tydzien").innerHTML = `<b title="Tydzień ${v.runda} z ${v.gra.liczba_rund}">Tydzień ${v.runda}${v.runda < v.gra.runda ? " · podgląd" : ""}</b>`;
  el("pp-druzyna").innerHTML = `<small>${esc(v.dashboard?.nazwa || "")}</small>${chipy}`;
  el("pp-druzyna").hidden = !(v.dashboard?.nazwa || chipy);
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
  document.body.classList.toggle("na-mapie", c.zakladka === "mapa");
  document.body.classList.toggle("we-wnetrzu-pp", c.zakladka === "miejsce");
  odswiezPasek(c);
  odswiezTydzien(c);
  odswiezPortfel(c);
  rysujMalyZeszyt(c, el("pp-zeszyt"));
  odswiezSzuflade(c);
  odswiezFiltr(c);
  try { oznaczCel(c.v); } catch (e) { console.error(e); }   // obwódka „teraz” na budynku następnego kroku także na mapie
  // otwarte okna pulpitu aktualizują się w miejscu; okno wysyłania znika, gdy tydzień się przeliczył
  if (otwarteOkno(T_WYSLIJ)) { if (oknoRunda !== c.v.gra.runda) zamknijOkno(); else pokaz("wyslij", c); }
  if (otwarteOkno(T_FINANSE)) pokaz("finanse", c);
  if (zeszytOtwarty()) odswiezZeszyt(c);
  if (otwarteOkno(T_ZAKUPY)) pokaz("zakupy", c);
}
