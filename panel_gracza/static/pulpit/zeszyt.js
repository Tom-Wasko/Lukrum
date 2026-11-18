// Zeszyt wujka (seria pulpit, krok 2). Trzy stany: (1) niekliknięty – z prawego dolnego rogu wystaje górna część strony,
// (2) najechanie albo fokus – zeszyt wysuwa się i pokazuje listę zadań (to robi CSS), (3) klik – zeszyt na cały ekran
// (pod półprzezroczystym tłem widać mapę), strony przewraca się z animacją (bez niej przy prefers-reduced-motion).
// Strony: Lista wujka, Rozpiska funkcji, Gdzie co kupić, Samouczek. Zamknięcie: Esc, przycisk, klik poza zeszytem.
// Kolory tylko ze zmiennych palet (wygląd: pulpit.css).
import { esc } from "../zakladki/wspolne.js";
import { listTygodnia, planTygodnia } from "../zakladki/wujek.js";
import { MIEJSCA } from "../swiat/swiat.js";

const STRONY = [["lista", "Lista wujka"], ["rozpiska", "Rozpiska funkcji"], ["kupic", "Gdzie co kupić"], ["samouczek", "Samouczek"]];
const Z = { nr: 0, otwarty: false, fokus: null };
const bezRuchu = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
export const zeszytOtwarty = () => Z.otwarty;

// --- mały zeszyt (stany 1 i 2) -----------------------------------------------------------------------------------------
export function rysujMalyZeszyt(c, btn) {
  let plan = null;
  try { plan = planTygodnia(c.v); } catch (e) { console.error(e); }
  btn.hidden = !plan;
  if (!plan) return;
  const n = plan.nastepny;
  btn.setAttribute("aria-label", `Zeszyt wujka. ${n ? `Następny krok: ${n.co}, ${n.gdzie}.` : "Wszystkie kroki tygodnia zrobione."} Otwórz cały zeszyt`);
  btn.classList.toggle("pp-zrobiony", !n);
  const poz = plan.lista.map((k, i) => `<li class="${k.ok ? "ok" : k.teraz ? "teraz" : ""}"><span class="pp-lp" aria-hidden="true">${k.ok ? "✓" : k.teraz ? "▶" : i + 1}</span>
      <span>${esc(k.co)}${k.ok ? '<i class="sr"> (zrobione)</i>' : k.teraz ? '<i class="sr"> (następny krok)</i>' : ""}</span></li>`).join("");
  btn.innerHTML = `<span class="pp-okladka" aria-hidden="true"></span><span class="pp-kartka">
    <span class="pp-zg">Zeszyt wujka · ${plan.zrobione} z ${plan.lista.length}</span>
    <span class="pp-krok"><small>${n ? esc(n.gdzie) : "Gotowe"}</small>${n ? esc(n.co) : "Wszystko odhaczone"}</span>
    <ul class="pp-lista">${poz}</ul></span>`;
}

// --- strony pełnego zeszytu ---------------------------------------------------------------------------------------------
function stronaLista(c) {
  const v = c.v, list = listTygodnia(v);
  let plan = null;
  try { plan = planTygodnia(v); } catch (e) { console.error(e); }
  const kroki = (plan?.lista || []).map((k, i) => `<li class="${k.ok ? "ok" : k.teraz ? "teraz" : ""}"><a data-zakladka-k="${esc(k.klucz)}" href="#${esc(k.klucz)}">
    <span class="pz-nr" aria-hidden="true">${k.ok ? "✓" : k.teraz ? "▶" : i + 1}</span><span><small>${esc(k.gdzie)}</small><b>${esc(k.co)}</b> <i>${esc(k.opis)}</i></span>
    <span class="pz-stan">${k.ok ? "zrobione" : k.teraz ? "teraz" : ""}</span></a></li>`).join("");
  return `<h2>List od wujka · tydzień ${v.runda}</h2>
    ${list ? `<p class="pz-list"><b>${esc(list[0])}</b> ${esc(list[1])} <span class="pz-podpis">– Wasz wujek</span></p>` : ""}
    <h3>Do zrobienia w tym tygodniu${plan ? ` <small>${plan.zrobione} z ${plan.lista.length}</small>` : ""}</h3><ol class="pz-kroki">${kroki}</ol>`;
}

function stronaRozpiska(c) {
  const widoczny = (p) => !p.cel || (c.jestZakladka(p.cel) && !c.wylaczona(p.cel) && !c.ukryta(p.cel));
  const sekcje = Object.values(MIEJSCA).map((m) => {
    const widziane = new Set();
    const poz = (m.punkty || []).filter((p) => !p.tylkoScena && widoczny(p)).filter((p) => { const k = `${p.cel}|${p.nazwa}`; return widziane.has(k) ? false : (widziane.add(k), true); });
    if (!poz.length) return "";
    return `<h3>${esc(m.tytul)}${m.adres ? ` <small>${esc(m.adres)}</small>` : ""}</h3><ul class="pz-punkty">${poz.map((p) => {
      const gra = p.cel && c.zakryta(p.cel) ? ` <i>(robi to gra, dopóki funkcja zostaje zakryta)</i>` : "";
      return `<li><b>${esc(p.nazwa)}</b> – ${esc(p.opis || p.podpis || "")}${gra}</li>`;
    }).join("")}</ul>`;
  }).join("");
  const poza = [["Poczta", "ikona „Wyślij decyzje” na pasku: wysyłka decyzji tygodnia."], ["Portfel", "plik banknotów przy dolnej krawędzi: gotówka, debet i raport finansowy."],
    ["Wydarzenia", "ikona na pasku: parki i wydarzenia miasta w tym tygodniu."],
    ...(c.jestZakladka("handel") && !c.wylaczona("handel") ? [["Bazar", "handel towarem i sprzętem między drużynami."]] : [])];
  return `<h2>Rozpiska funkcji</h2><p class="pz-opis">Gdzie na mapie co załatwić: budynek, a pod nim to, co się w nim robi. Budynek otwiera się kliknięciem na mapie.</p>${sekcje}
    <h3>Poza budynkami</h3><ul class="pz-punkty">${poza.map(([n, o]) => `<li><b>${n}</b> – ${o}</li>`).join("")}</ul>`;
}

// co kupić → gdzie: miejsce (MIEJSCA), ekran i tydzień, od którego jest dostępny (z widoku gry)
const ZAKUPY = [["Składniki do kuchni: mięso, bułki, warzywa", "hurtownie", "zaop_dostawy"], ["Rożen, ladę i kasę fiskalną (sprzęt kuchenny)", "park_handlowy", "wnetrze_sprzet"],
  ["Stoliki, klimatyzację, telewizor i wystrój sali", "park_handlowy", "wnetrze_wyposazenie"], ["Ludzi do pracy (zatrudnienie)", "miasteczko", "rynek_pracy"],
  ["Szkolenia i udogodnienia dla zespołu", "kebab", "hr_rozwoj"], ["Ulotki, radio i reklamę w internecie", "biurowiec_zana", "agencje"],
  ["Ubezpieczenie lokalu", "biurowiec_zana", "ubezpieczenia"], ["Konto, kredyt, lokatę albo leasing", "kamienica_bankowa", "bank"]];
function stronaKupic(c) {
  const wiersze = ZAKUPY.filter(([, , cel]) => c.jestZakladka(cel) && !c.wylaczona(cel) && !c.ukryta(cel)).map(([co, miejsce, cel]) => {
    const m = MIEJSCA[miejsce], p = (m?.punkty || []).find((x) => x.cel === cel);
    const od = !c.zakryta(cel) && !c.dostepna(cel) ? c.odRundy(cel) : null;
    const stan = c.zakryta(cel) ? "robi to gra" : od ? `od tygodnia ${od}` : !c.dostepna(cel) ? "jeszcze zamknięte" : "";
    return `<li class="${stan ? "szare" : ""}"><b>${esc(co)}</b><span class="pz-strzalka" aria-hidden="true">→</span><span><u>${esc(m?.tytul || miejsce)}</u>${p ? `, ${esc(p.nazwa)}` : ""}
      ${stan ? `<i> (${esc(stan)})</i>` : ""}</span></li>`;
  }).join("");
  return `<h2>Gdzie co kupić</h2><p class="pz-opis">Wujek podpowiada, do którego budynku iść po co. Zakupy tygodnia widać pod ikoną koszyka na pasku.</p>
    <ul class="pz-kupic">${wiersze}</ul>`;
}

function stronaSamouczek() {
  const kroki = [["Mapa", "Przeciągnięcie przesuwa mapę, kółko myszy (albo przyciski + i −) przybliża. Kliknięcie budynku wchodzi do środka, a kliknięcie lokalu pokazuje, czy jest wolny."],
    ["Pasek po lewej", "⚙ to ustawienia (wygląd, konto). Poniżej: wysyłka decyzji, konto, „Jak grać”, zakupy tygodnia, wydarzenia i warstwy mapy (czynsze, popyt, konkurencja)."],
    ["Filtr kategorii", "Rząd ikon u góry po prawej podświetla jeden rodzaj miejsc, na przykład banki. Drugie kliknięcie wyłącza filtr."],
    ["Portfel", "Plik banknotów na dole. Najechanie pokazuje gotówkę i debet, kliknięcie otwiera finanse."],
    ["Zeszyt", "Tu jest lista wujka, rozpiska funkcji i podpowiedzi, gdzie co kupić. Strony przewraca się strzałkami, zakładkami albo klawiszami ← i →. Esc zamyka zeszyt."],
    ["Tydzień", "Na środku u góry widać numer tygodnia. Gdy wszystko jest gotowe, ikona wysyłki kończy podejmowanie decyzji. Po przeliczeniu zaczyna się kolejny tydzień."]];
  return `<h2>Samouczek</h2><p class="pz-opis">Krótko, jak się w tym wszystkim poruszać.</p><ol class="pz-kroki pz-samouczek">${kroki.map(([n, o], i) =>
    `<li><span class="pz-nr" aria-hidden="true">${i + 1}</span><span><b>${n}</b> ${o}</span></li>`).join("")}</ol>`;
}

const TRESCI = { lista: stronaLista, rozpiska: stronaRozpiska, kupic: stronaKupic, samouczek: stronaSamouczek };
const tresc = (c, nr) => TRESCI[STRONY[nr][0]](c);

// --- pełny ekran -----------------------------------------------------------------------------------------------------------
const nakladka = () => document.getElementById("pz");
function szkielet() {
  let o = nakladka();
  if (o) return o;
  o = document.createElement("div");
  o.id = "pz";
  o.className = "pz";
  o.setAttribute("role", "dialog");
  o.setAttribute("aria-modal", "true");
  o.setAttribute("aria-label", "Zeszyt wujka");
  o.innerHTML = `<div class="pz-ksiazka"><div class="pz-grzbiet" aria-hidden="true"></div>
    <div class="pz-karta"><div class="pz-stronicowanie"><div class="pz-strona" id="pz-strona" tabindex="-1" aria-live="polite"></div></div>
      <div class="pz-stopka"><button type="button" class="pz-btn" data-akcja="pp-zeszyt-strona" data-d="-1">‹ Wstecz</button><span class="pz-numer" id="pz-numer"></span>
        <button type="button" class="pz-btn" data-akcja="pp-zeszyt-strona" data-d="1">Dalej ›</button></div></div>
    <nav class="pz-zakladki" aria-label="Strony zeszytu">${STRONY.map(([, n], i) => `<button type="button" class="pz-zakladka" data-akcja="pp-zeszyt-strona" data-n="${i}">${n}</button>`).join("")}</nav>
    <button type="button" class="pz-zamknij" data-akcja="pp-zeszyt-zamknij">✕ Zamknij <small>(Esc)</small></button></div>`;
  o.addEventListener("click", (e) => {
    if (e.target === o) zamknijZeszyt();
    else if (e.target.closest("[data-zakladka-k]")) zamknijZeszyt(false);   // przejście do ekranu z listy – obsługuje je app.js
  });
  document.body.appendChild(o);
  return o;
}

function zaznacz(o) {
  o.querySelectorAll(".pz-zakladka").forEach((b, i) => { b.classList.toggle("aktywna", i === Z.nr); b.setAttribute("aria-current", i === Z.nr ? "page" : "false"); });
  o.querySelector("#pz-numer").textContent = `${STRONY[Z.nr][1]} · ${Z.nr + 1} z ${STRONY.length}`;
  o.querySelector('[data-d="-1"]').disabled = Z.nr === 0;
  o.querySelector('[data-d="1"]').disabled = Z.nr === STRONY.length - 1;
}

export function otworzZeszyt(c, nr = 0) {
  Z.fokus = document.activeElement;
  Z.nr = Math.min(STRONY.length - 1, Math.max(0, nr));
  const o = szkielet();
  o.querySelector("#pz-strona").innerHTML = tresc(c, Z.nr);
  zaznacz(o);
  Z.otwarty = true;
  document.body.classList.add("pz-otwarty");
  o.classList.add("otwarty");
  o.querySelector(".pz-zamknij").focus({ preventScroll: true });
}

export function zamknijZeszyt(oddajFokus = true) {
  const o = nakladka();
  if (!o || !Z.otwarty) return;
  Z.otwarty = false;
  o.classList.remove("otwarty");
  document.body.classList.remove("pz-otwarty");
  o.querySelectorAll(".pz-kartka").forEach((k) => k.remove());
  if (oddajFokus && Z.fokus?.isConnected) Z.fokus.focus({ preventScroll: true });
}

// odświeżenie treści otwartej strony po zmianie widoku gry (bez przewracania)
export function odswiezZeszyt(c) {
  const o = nakladka();
  if (!o || !Z.otwarty) return;
  const s = o.querySelector("#pz-strona"), przew = s.scrollTop;
  s.innerHTML = tresc(c, Z.nr);
  s.scrollTop = przew;
}

// przewrócenie strony: stara strona odchyla się od grzbietu (3D), a pod nią jest już nowa; wstecz – odwrotnie
export function idzDoStrony(c, nr) {
  nr = Math.min(STRONY.length - 1, Math.max(0, nr));
  const o = nakladka();
  if (!o || nr === Z.nr) return;
  const kier = nr > Z.nr ? 1 : -1, s = o.querySelector("#pz-strona"), nowa = tresc(c, nr);
  Z.nr = nr;
  zaznacz(o);
  if (bezRuchu()) { s.innerHTML = nowa; s.scrollTop = 0; return; }
  const klon = s.cloneNode(true);
  klon.removeAttribute("id");
  klon.removeAttribute("aria-live");
  klon.setAttribute("aria-hidden", "true");
  klon.className = `pz-strona pz-kartka ${kier > 0 ? "wprzod" : "wstecz"}`;
  if (kier > 0) { klon.scrollTop = s.scrollTop; s.innerHTML = nowa; s.scrollTop = 0; } else klon.innerHTML = nowa;
  s.parentNode.appendChild(klon);
  if (kier > 0) klon.scrollTop = 0;
  klon.addEventListener("animationend", () => {
    if (kier < 0) { s.innerHTML = nowa; s.scrollTop = 0; }
    klon.remove();
  }, { once: true });
}

// klawiatura: Esc zamyka, ← → przewracają strony, Tab krąży po zeszycie (fokus nie ucieka na mapę)
document.addEventListener("keydown", (e) => {
  if (!Z.otwarty) return;
  const o = nakladka();
  if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); zamknijZeszyt(); return; }
  if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && !e.target.closest?.("input, textarea, select")) {
    e.preventDefault();
    o.querySelector(`[data-d="${e.key === "ArrowRight" ? 1 : -1}"]`)?.click();
    return;
  }
  if (e.key !== "Tab") return;
  const f = [...o.querySelectorAll("button:not([disabled]), a[href], #pz-strona")].filter((x) => x.offsetParent !== null);
  if (!f.length) return;
  const i = f.indexOf(document.activeElement);
  if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
}, true);
