// Powłoka pulpitu (seria pulpit, krok 1; decyzje 18.11.2026): mapa na cały ekran i trzy elementy przy krawędziach.
//  - lewy górny róg: ⚙ (ustawienia z motyw.js) nad pionowym paskiem LUKRUM z ikonami: Wyślij decyzje, konto, Jak grać,
//    zakupy; pod paskiem „Tydzień N” (tylko informacja);
//  - dół: portfel (plik banknotów) – najechanie pokazuje gotówkę i debet, kliknięcie otwiera okno finansów;
//  - prawa krawędź: zeszyt wujka – wystaje z brzegu z następnym krokiem, najechanie wysuwa listę, kliknięcie otwiera zeszyt.
// Stary układ (nagłówek, menu, stopka) jest do obejrzenia pod adresem ?uklad=stary i na wąskim ekranie (telefon – później).
// Kolory tylko ze zmiennych motywy/zmienne.css; wygląd: pulpit.css.
import { esc, kafelkiLiczb, okno, otwarteOkno, toast, zamknijOkno, zl } from "../zakladki/wspolne.js";
import { ikona } from "../zakladki/ikony.js";
import ZAKLADKI from "../zakladki/index.js";
import { listWujka, oznaczCel, planTygodnia } from "../zakladki/wujek.js";

// klasę ustawia skrypt na początku <body> (gra.html), żeby układ nie migał
export const PULPIT = document.body.classList.contains("pulpit");

const T_WYSLIJ = "Wyślij decyzje", T_FINANSE = "Finanse", T_ZESZYT = "Zeszyt wujka", T_KONTO = "Konto";
const IKONY_PASKA = [   // [klucz, ikona, napis]
  ["wyslij", "wyslij", "Wyślij decyzje"], ["konto", "osoba", "Konto"], ["jak", "ksiazka", "Jak grać"], ["koszyk", "sprzedaz", "Zakupy"],
  ["mapa", "mapa", "Mapa miasta"]];
const EKRAN_ZAKUPOW = "zaop_dostawy";   // istniejący ekran zamówień składników (Hurtownie)

let zamontowany = false, oknoRunda = null;
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
    : `<button type="button" class="pp-ik" id="pp-${k}" data-akcja="pp-${k}" aria-label="${napis}" title="${napis}"${k === "mapa" ? " hidden" : ""}>${ikona(ik, 22)}<span>${napis}</span><i class="pp-znak" aria-hidden="true" hidden></i></button>`).join("");
  const rys = document.createElement("div");
  rys.id = "pulpit";
  rys.className = "pp";
  rys.innerHTML = `<div class="pp-lewy"><div id="pp-ust" class="pp-ust"></div>
      <nav class="pp-pasek" aria-label="Pasek LUKRUM"><div class="pp-szyld" aria-hidden="true">LUKRUM</div>${ikonyHtml}</nav>
      <div class="pp-tydzien" id="pp-tydzien" role="status"></div></div>
    <button type="button" class="pp-portfel" id="pp-portfel" data-akcja="pp-portfel">${SVG_PLIK}<span class="pp-kwoty" id="pp-kwoty"></span></button>
    <button type="button" class="pp-zeszyt" id="pp-zeszyt" data-akcja="pp-zeszyt"></button>`;
  document.body.appendChild(rys);
  przeniesUstawienia();
  // Esc chowa wysunięte elementy (WCAG 1.4.13: treść pojawiająca się po najechaniu da się zamknąć bez ruszania myszą)
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !(rys.matches(":hover") || rys.contains(document.activeElement))) return;
    rys.classList.add("pp-schowane");
    if (rys.contains(document.activeElement)) document.activeElement.blur();
  });
  rys.addEventListener("pointerleave", () => rys.classList.remove("pp-schowane"));
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
  } else if (rodzaj === "zeszyt") {
    okno(T_ZESZYT, listWujka(v, c), { srednie: true });
  } else if (rodzaj === "konto") okno(T_KONTO, htmlKonta(), { male: true });
}

const zakupyOd = (c) => c.odRundy(EKRAN_ZAKUPOW);
const zakupyDostepne = (c) => c.jestZakladka(EKRAN_ZAKUPOW) && !c.wylaczona(EKRAN_ZAKUPOW) && (c.zakryta(EKRAN_ZAKUPOW) || c.dostepna(EKRAN_ZAKUPOW));
const opisZakupow = (c) => zakupyOd(c) ? `Zakupy: dostępne od tygodnia ${zakupyOd(c)}` : "Zakupy: jeszcze niedostępne";

export const AKCJE_PULPITU = {
  "pp-wyslij": (e, c) => {
    if (c.v.gra.zakonczona) return toast("Gra zakończona – nie ma już decyzji do wysłania.");
    pokaz("wyslij", c);
  },
  "pp-konto": (e, c) => pokaz("konto", c),
  "pp-koszyk": (e, c) => { if (!zakupyDostepne(c)) return toast(opisZakupow(c)); zamknijOkno(); c.idz(EKRAN_ZAKUPOW); },
  "pp-mapa": (e, c) => { zamknijOkno(); c.idz("mapa"); },
  "pp-portfel": (e, c) => pokaz("finanse", c),
  "pp-zeszyt": (e, c) => pokaz("zeszyt", c),
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
  const k = el("pp-koszyk"), ok = zakupyDostepne(c);
  k.setAttribute("aria-disabled", ok ? "false" : "true");
  k.classList.toggle("pp-wyszarzona", !ok);
  k.title = ok ? "Zakupy: zamówienia składników" : opisZakupow(c);
  k.setAttribute("aria-label", k.title);
  k.querySelector("span").textContent = ok ? "Zakupy" : zakupyOd(c) ? `Zakupy · od tyg. ${zakupyOd(c)}` : "Zakupy · wkrótce";
  el("pp-mapa").hidden = c.zakladka === "mapa";
}

function odswiezTydzien(c) {
  const v = c.v, st = document.getElementById("status-gry");
  // stan gry z dawnego nagłówka: wstrzymanie, oczekiwanie na drużyny, termin (bez nazwy gry, składu i salda)
  const chipy = st ? [...st.children].slice(1).filter((x) => !x.querySelector("svg")).map((x) => `<span class="pp-chip">${x.innerHTML}</span>`).join("") : "";
  el("pp-tydzien").innerHTML = `<b title="Tydzień ${v.runda} z ${v.gra.liczba_rund}">Tydzień ${v.runda}${v.runda < v.gra.runda ? " · podgląd" : ""}</b>
    <small>${esc(v.dashboard?.nazwa || "")}</small>${chipy}`;
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

function odswiezZeszyt(c) {
  const v = c.v;
  let plan = null;
  try { plan = planTygodnia(v); } catch (e) { console.error(e); }
  const z = el("pp-zeszyt");
  if (!plan) { z.hidden = true; return; }
  z.hidden = false;
  const n = plan.nastepny;
  z.setAttribute("aria-label", `Zeszyt wujka. ${n ? `Następny krok: ${n.co}, ${n.gdzie}.` : "Wszystkie kroki tygodnia zrobione."} Otwórz cały zeszyt`);
  z.classList.toggle("pp-zrobiony", !n);
  const poz = plan.lista.map((k, i) => `<li class="${k.ok ? "ok" : k.teraz ? "teraz" : ""}"><span class="pp-lp" aria-hidden="true">${k.ok ? "✓" : k.teraz ? "▶" : i + 1}</span>
      <span>${esc(k.co)}${k.ok ? '<i class="sr"> (zrobione)</i>' : k.teraz ? '<i class="sr"> (następny krok)</i>' : ""}</span></li>`).join("");
  z.innerHTML = `<span class="pp-sprezyna" aria-hidden="true"></span><span class="pp-kartka">
    <span class="pp-zg">Zeszyt wujka · ${plan.zrobione} z ${plan.lista.length}</span>
    <span class="pp-krok"><small>${n ? esc(n.gdzie) : "Gotowe"}</small>${n ? esc(n.co) : "Wszystko odhaczone"}</span>
    <ul class="pp-lista">${poz}</ul></span>`;
}

export function odswiezPulpit(c) {
  if (!PULPIT) return;
  montuj();
  document.body.classList.toggle("na-mapie", c.zakladka === "mapa");
  document.body.classList.toggle("we-wnetrzu-pp", c.zakladka === "miejsce");
  odswiezPasek(c);
  odswiezTydzien(c);
  odswiezPortfel(c);
  odswiezZeszyt(c);
  try { oznaczCel(c.v); } catch (e) { console.error(e); }   // obwódka „teraz” na budynku następnego kroku także na mapie
  // otwarte okna pulpitu aktualizują się w miejscu; okno wysyłania znika, gdy tydzień się przeliczył
  if (otwarteOkno(T_WYSLIJ)) { if (oknoRunda !== c.v.gra.runda) zamknijOkno(); else pokaz("wyslij", c); }
  if (otwarteOkno(T_FINANSE)) pokaz("finanse", c);
  if (otwarteOkno(T_ZESZYT)) pokaz("zeszyt", c);
}
