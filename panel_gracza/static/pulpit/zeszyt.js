// Zeszyt wujka (seria pulpit, krok 2). Trzy stany: (1) niekliknięty – z prawego dolnego rogu wystaje górna część strony,
// (2) najechanie albo fokus – zeszyt wysuwa się i pokazuje listę zadań (to robi CSS), (3) klik – zeszyt na cały ekran
// (pod półprzezroczystym tłem widać mapę), strony przewraca się z animacją (bez niej przy prefers-reduced-motion).
// Strony: Lista wujka, Rozpiska funkcji, Gdzie co kupić, Samouczek. Zamknięcie: Esc, przycisk, klik poza zeszytem.
// Krok 5: zeszyt otwarty to rozkładówka (lewa i prawa strona) z grzbietem i szyciem, stosem kartek po bokach, zakładkami-wstążkami
// i przewracaniem kartki (rotateY z cieniem; tylko transform i opacity). Bez animacji przy prefers-reduced-motion.
// Kolory tylko ze zmiennych palet (wygląd: pulpit.css).
import { esc } from "../zakladki/wspolne.js";
import { BUDYNEK_KROKU, listTygodnia, planTygodnia } from "../zakladki/wujek.js";
import ZAKLADKI, { MENU } from "../zakladki/index.js";
import { MIEJSCA } from "../swiat/swiat.js";

const STRONY = [["lista", "Lista wujka"], ["rozpiska", "Rozpiska funkcji"], ["kupic", "Gdzie co kupić"], ["samouczek", "Samouczek"]];
const Z = { nr: 0, sp: 0, otwarty: false, fokus: null, c: null, anim: null };
const bezRuchu = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
export const zeszytOtwarty = () => Z.otwarty;

// Okładka starego, zjechanego zeszytu: skóra z ziarnem i przetarciami, wzmocnione narożniki, szew i gumka. Same kształty SVG,
// kolory wyłącznie ze zmiennych palet (--g-*); ziarno i plamy to filtry feTurbulence (bez plików graficznych).
const skora = (id) => `<svg class="pp-skora" viewBox="0 0 400 430" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <defs>
    <filter id="${id}-z" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="11" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .9 -.32" result="a"/><feFlood style="flood-color:var(--g-czern)"/><feComposite in2="a" operator="in"/></filter>
    <filter id="${id}-p" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".022 .04" numOctaves="3" seed="4" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 2.4 -1.05" result="a"/><feFlood style="flood-color:var(--g-skora2)"/><feComposite in2="a" operator="in"/></filter>
    <filter id="${id}-r"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>
  <rect width="400" height="430" style="fill:var(--g-drewno)"/>
  <rect width="400" height="430" filter="url(#${id}-p)" opacity=".75"/>
  <ellipse cx="38" cy="22" rx="46" ry="24" filter="url(#${id}-r)" style="fill:var(--g-skora2)" opacity=".7"/>
  <ellipse cx="372" cy="30" rx="40" ry="18" filter="url(#${id}-r)" style="fill:var(--g-skora2)" opacity=".55"/>
  <ellipse cx="200" cy="10" rx="120" ry="9" filter="url(#${id}-r)" style="fill:var(--g-skora3)" opacity=".5"/>
  <ellipse cx="14" cy="230" rx="10" ry="90" filter="url(#${id}-r)" style="fill:var(--g-skora2)" opacity=".45"/>
  <path d="M120 70c30-10 44 6 78 0M60 120c20 6 30-4 52 2M250 96c22-4 40 8 60 2" fill="none" style="stroke:var(--g-czern)" stroke-width="1.4" opacity=".35" vector-effect="non-scaling-stroke"/>
  <rect width="400" height="430" filter="url(#${id}-z)" opacity=".8"/>
  <rect x="11" y="11" width="378" height="430" rx="9" fill="none" style="stroke:var(--g-skora)" stroke-width="2.2" stroke-dasharray="7 6" opacity=".85" vector-effect="non-scaling-stroke"/>
  <path d="M0 0h64l-64 64z" style="fill:var(--g-drewno2);stroke:var(--g-czern)" stroke-width="2" vector-effect="non-scaling-stroke"/>
  <path d="M400 0h-64l64 64z" style="fill:var(--g-drewno2);stroke:var(--g-czern)" stroke-width="2" vector-effect="non-scaling-stroke"/>
  <path d="M14 36l22-22M20 48l32-32" fill="none" style="stroke:var(--g-skora)" stroke-width="2" stroke-dasharray="4 4" opacity=".9" vector-effect="non-scaling-stroke"/>
  <path d="M386 36l-22-22M380 48l-32-32" fill="none" style="stroke:var(--g-skora)" stroke-width="2" stroke-dasharray="4 4" opacity=".9" vector-effect="non-scaling-stroke"/>
  <rect x="381" y="-4" width="14" height="440" style="fill:var(--g-czern);stroke:var(--g-metal2)" stroke-width="1.6" opacity=".92" vector-effect="non-scaling-stroke"/>
  <path d="M385 0v430M391 0v430" fill="none" style="stroke:var(--g-metal2)" stroke-width="1" opacity=".7" vector-effect="non-scaling-stroke"/>
</svg>`;

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
  btn.innerHTML = `<span class="pp-okladka" aria-hidden="true">${skora("sk-m")}</span><span class="pp-kartka">
    <span class="pp-zg">Zeszyt wujka · ${plan.zrobione} z ${plan.lista.length}</span>
    <span class="pp-krok"><small>${n ? esc(n.gdzie) : "Gotowe"}</small>${n ? esc(n.co) : "Wszystko odhaczone"}</span>
    <ul class="pp-lista">${poz}</ul></span>`;
}

// --- strony pełnego zeszytu ---------------------------------------------------------------------------------------------
// przycisk „pokaż na mapie”: zeszyt się zamyka, mapa przelatuje do budynku i go pulsuje (pulpit.js: pp-pokaz)
const naMapie = (ids, tekst = "⌖ na mapie", klasa = "pz-mapa") => {
  const l = [].concat(ids || []).filter(Boolean);
  return l.length ? `<button type="button" class="${klasa}" data-akcja="pp-pokaz" data-b="${esc(l.join(","))}" title="Pokaż na mapie" aria-label="${tekst.replace(/<[^>]+>/g, "")}: pokaż na mapie">${tekst}</button>` : "";
};
function stronaLista(c) {
  const v = c.v, list = listTygodnia(v);
  let plan = null;
  try { plan = planTygodnia(v); } catch (e) { console.error(e); }
  const kroki = (plan?.lista || []).map((k, i) => `<li class="${k.ok ? "ok" : k.teraz ? "teraz" : ""}"><button type="button" class="pz-wiersz" data-akcja="pp-wejdz" data-k="${esc(k.klucz)}">
    <span class="pz-nr" aria-hidden="true">${k.ok ? "✓" : k.teraz ? "▶" : i + 1}</span><span><small>${esc(k.gdzie)}</small><b>${esc(k.co)}</b> <i>${esc(k.opis)}</i></span>
    <span class="pz-stan">${k.ok ? "zrobione" : k.teraz ? "teraz" : ""}</span></button>${naMapie(BUDYNEK_KROKU[k.klucz])}</li>`).join("");
  return `<h2>List od wujka · tydzień ${v.runda}</h2>
    ${list ? `<p class="pz-list"><b>${esc(list[0])}</b> ${esc(list[1])} <span class="pz-podpis">– Wasz wujek</span></p>` : ""}
    <h3>Do zrobienia w tym tygodniu${plan ? ` <small>${plan.zrobione} z ${plan.lista.length}</small>` : ""}</h3>
    <p class="pz-opis">Kliknięcie kroku prowadzi od razu do właściwego miejsca; „⌖ na mapie” pokazuje budynek na mapie.</p><ol class="pz-kroki">${kroki}</ol>`;
}

// Rozpiska: grupy z dawnego menu (budynki na mapie) i to, co się w nich załatwia (pełne tytuły ekranów); kebab – punkty sceny
function stronaRozpiska(c) {
  const widoczny = (k) => c.jestZakladka(k) && !c.wylaczona(k) && !c.ukryta(k);
  const zakryta = (k) => (c.zakryta(k) ? " <i>(robi to gra, dopóki funkcja zostaje zakryta)</i>" : "");
  const sekcje = MENU.filter((p) => p.miejsce).map((p) => {
    const sceny = (p.miejsca || [p.miejsce]).filter((id) => MIEJSCA[id]);
    let tresc;
    if (p.klucz === "kebab") {
      tresc = (MIEJSCA.kebab.punkty || []).filter((q) => !q.tylkoScena && (!q.cel || widoczny(q.cel)))
        .map((q) => `<li><b>${esc(q.nazwa)}</b> – ${esc(q.opis || "")}${q.cel ? zakryta(q.cel) : ""}</li>`).join("");
    } else {
      tresc = (p.pod || []).filter((k) => ZAKLADKI[k] && widoczny(k)).map((k) => `<li>${esc(ZAKLADKI[k].tytulPelny || ZAKLADKI[k].tytul)}${zakryta(k)}</li>`).join("");
    }
    if (!tresc) return "";
    const przyciski = p.klucz === "kebab" ? "" : `<p class="pz-miejsca">${sceny.map((id) => naMapie(MIEJSCA[id].budynki, esc(MIEJSCA[id].tytul), "pz-miejsce")).join("")}</p>`;
    return `<h3>${esc(p.tytul)}</h3>${przyciski}<ul class="pz-punkty">${tresc}</ul>`;
  }).join("");
  const poza = [["Poczta", "list na dole paska: wysyłka decyzji tygodnia (okno z podsumowaniem)."], ["Portfel", "plik banknotów przy dolnej krawędzi: gotówka, debet i raport finansowy."],
    ["Wydarzenia", "ikona na pasku: wydarzenia tygodnia w parkach i w mieście; ta sama ikona w rzędzie kategorii podświetla miejsca z wydarzeniami."], ["Ustawienia", "⚙ w rogu: wygląd, warstwy mapy, konto."]];
  return `<h2>Rozpiska funkcji</h2><p class="pz-opis">Gdzie na mapie co załatwić. Nazwa miejsca pokazuje je na mapie (przelot i obwódka).</p>${sekcje}
    <h3>Poza budynkami</h3><ul class="pz-punkty">${poza.map(([n, o]) => `<li><b>${n}</b> – ${o}</li>`).join("")}</ul>`;
}

// co kupić → gdzie: nazwa miejsca, żetony na mapie, ekran i tydzień, od którego jest dostępny (z widoku gry)
const ZAKUPY = [["Składniki do kuchni: mięso, bułki, warzywa", "Hurtownie (Makro, Selgros, Biedronka…)", ["makro", "selgros", "eurocash", "auchan", "biedronka", "lidl", "stokrotka"], "zaop_dostawy"],
  ["Rożen, ladę i kasę fiskalną (sprzęt kuchenny)", "Hurtownia sprzętu gastronomicznego", ["sprzet_gastro"], "wnetrze_sprzet"],
  ["Stoliki, klimatyzację, telewizor i wystrój sali", "Park handlowy, Stolarnia, Galeria", ["market_budowlany", "stolarnia", "galeria"], "wnetrze_wyposazenie"],
  ["Ludzi do pracy (zatrudnienie)", "Agencja pracy „Ręce do Rożna”", ["agencja_pracy"], "rynek_pracy"],
  ["Szkolenia dla zespołu", "Lubelska Szkoła Kebabu", ["akademia"], "szkolenia"],
  ["Ulotki, radio i reklamę w internecie", "Biurowiec przy Zana", ["agencja_lajk", "fala_koziolka", "drukarnia"], "agencje"],
  ["Ubezpieczenie lokalu", "TUW „Pod Koziołkiem”", ["ubezpieczyciel"], "ubezpieczenia"], ["Konto, kredyt, lokatę albo leasing", "Pierzeja bankowa", ["kamienica_bankowa"], "bank"]];
function stronaKupic(c) {
  const wiersze = ZAKUPY.filter(([, , , cel]) => c.jestZakladka(cel) && !c.wylaczona(cel) && !c.ukryta(cel)).map(([co, miejsce, ids, cel]) => {
    const od = !c.zakryta(cel) && !c.dostepna(cel) ? c.odRundy(cel) : null;
    const stan = c.zakryta(cel) ? "robi to gra" : od ? `od tygodnia ${od}` : !c.dostepna(cel) ? "jeszcze zamknięte" : "";
    return `<li class="${stan ? "szare" : ""}"><b>${esc(co)}</b><span class="pz-strzalka" aria-hidden="true">→</span><span>${naMapie(ids, esc(miejsce), "pz-miejsce")}${stan ? `<i> (${esc(stan)})</i>` : ""}</span></li>`;
  }).join("");
  return `<h2>Gdzie co kupić</h2><p class="pz-opis">Wujek podpowiada, do którego budynku iść po co. Nazwa miejsca pokazuje je na mapie. Zakupy tygodnia widać pod ikoną koszyka na pasku.</p>
    <ul class="pz-kupic">${wiersze}</ul>`;
}

function stronaSamouczek() {
  const kroki = [["Mapa", "Przeciągnięcie przesuwa mapę, kółko myszy (albo przyciski + i −) przybliża. Kliknięcie budynku wchodzi do środka, a kliknięcie lokalu pokazuje, czy jest wolny."],
    ["Pasek po lewej", "⚙ to ustawienia (wygląd, konto). Poniżej: konto, „Jak grać”, zakupy tygodnia i wydarzenia. Na dole paska leży list: „Wyślij decyzje”."],
    ["Filtr kategorii", "Rząd ikon u góry po prawej podświetla jeden rodzaj miejsc, na przykład banki, lokale kebab albo miejsca z wydarzeniami tygodnia. Drugie kliknięcie wyłącza filtr."],
    ["Portfel", "Plik banknotów na dole. Najechanie pokazuje gotówkę i debet, kliknięcie otwiera finanse."],
    ["Zeszyt", "Tu jest lista wujka, rozpiska funkcji i podpowiedzi, gdzie co kupić. Strony przewraca się kliknięciem w róg kartki, zakładkami (wstążkami) albo klawiszami ← i →. Esc zamyka zeszyt."],
    ["Tydzień", "Na środku u góry widać numer tygodnia. Gdy wszystko jest gotowe, list na dole paska kończy podejmowanie decyzji. Po przeliczeniu zaczyna się kolejny tydzień."]];
  return `<h2>Samouczek</h2><p class="pz-opis">Krótko, jak się w tym wszystkim poruszać.</p><ol class="pz-kroki pz-samouczek">${kroki.map(([n, o], i) =>
    `<li><span class="pz-nr" aria-hidden="true">${i + 1}</span><span><b>${n}</b> ${o}</span></li>`).join("")}</ol>`;
}

const TRESCI = { lista: stronaLista, rozpiska: stronaRozpiska, kupic: stronaKupic, samouczek: stronaSamouczek };
const tresc = (c, nr) => TRESCI[STRONY[nr][0]](c);

// --- pełny zeszyt: rozkładówka ------------------------------------------------------------------------------------------------
// Kartki: [lewa pusta okładka] Lista | Rozpiska, Gdzie co kupić | Samouczek [prawa pusta]. Rozkładówka 0: „Lista wujka” z prawej,
// 1: „Rozpiska” z lewej i „Gdzie co kupić” z prawej, 2: „Samouczek” z lewej. Bok k = 0…5 (k = 0 i 5 to puste strony przy okładce), strona nr = k − 1.
const GLOWNA = [0, 1, 3];                              // strona, którą otwiera się rozkładówkę
const ROZKLADOWKI = GLOWNA.length;
const rozkl = (nr) => (nr <= 0 ? 0 : nr >= 3 ? 2 : 1);   // numer rozkładówki, na której leży strona
const CZAS_KARTKI = 860;
const waski = () => typeof matchMedia === "function" && matchMedia("(max-width: 900px)").matches;   // wąski ekran: jedna strona, bez 3D
const nakladka = () => document.getElementById("pz");

function bokPusty(k) {
  if (k === 0) {
    return `<div class="pz-tytul" aria-hidden="true"><svg viewBox="0 0 120 120" width="150" height="150" focusable="false">
        <path d="M60 10v100" fill="none" style="stroke:var(--g-czern)" stroke-width="3" stroke-linecap="round"/>
        <path d="M34 28h52l-8 66H42z" style="fill:var(--g-mieso);stroke:var(--g-czern)" stroke-width="3" stroke-linejoin="round"/>
        <path d="M40 46h40M42 62h36M44 78h32" fill="none" style="stroke:var(--g-czern)" stroke-width="2" opacity=".55"/>
        <circle cx="60" cy="14" r="5" style="fill:var(--g-metal);stroke:var(--g-czern)" stroke-width="2.5"/>
        <path d="M30 112h60" style="stroke:var(--g-czern)" stroke-width="4" stroke-linecap="round"/></svg>
      <p class="pz-t1">Zeszyt wujka</p><p class="pz-t2">własność wujka · nie czytać!</p><p class="pz-t3">(a jednak czytać – tu jest, co i gdzie)</p></div>`;
  }
  return `<div class="pz-koniec" aria-hidden="true"><p class="pz-t1">Notatki</p><p class="pz-t3">Tu mieści się to, o czym wujek jeszcze nie zdążył napisać.</p></div>`;
}
const zawartosc = (c, k) => (k >= 1 && k <= 4 ? tresc(c, k - 1) : bokPusty(k));
const nazwaBoku = (k) => (k >= 1 && k <= 4 ? STRONY[k - 1][1] : k === 0 ? "Okładka zeszytu, strona wewnętrzna" : "Strona z notatkami");

// Jeden bok rozkładówki: przewijana strona w linię + wskaźnik „dalej”. Klasa l/p = lewa/prawa (inne cienie, dziurki po zewnętrznej stronie).
function elementBoku(k, c, strona, id = "") {
  const b = document.createElement("section");
  b.className = `pz-str pz-str-${strona}${k === 0 || k === 5 ? " pz-pusta" : ""}`;
  if (id) b.id = id;
  b.dataset.k = String(k);
  b.setAttribute("aria-label", nazwaBoku(k));
  b.innerHTML = `<div class="pz-strona" tabindex="-1">${zawartosc(c, k)}</div>
    <button type="button" class="pz-wiecej" data-akcja="pz-dol" hidden aria-label="Są dalsze treści niżej: przewiń w dół">▾<span>dalej</span></button><span class="pz-nr-str" aria-hidden="true">${k >= 1 && k <= 4 ? k : ""}</span>`;
  return b;
}
const stronaBoku = (b) => b.querySelector(".pz-strona");

// wskaźnik „przewiń w dół” przy każdej stronie, dopóki jest co czytać niżej (przycisk – dostępny też z klawiatury i dla czytników)
function wskaznik() {
  const o = nakladka();
  if (!o) return;
  o.querySelectorAll("#pz-roz > .pz-str").forEach((b) => {
    const s = stronaBoku(b), w = b.querySelector(".pz-wiecej");
    if (s && w) w.hidden = !(Z.otwarty && s.scrollHeight - s.scrollTop - s.clientHeight > 12);
  });
}
const poRysowaniu = () => requestAnimationFrame(() => requestAnimationFrame(wskaznik));
export function przewinZeszyt(przycisk) {
  const s = przycisk?.closest?.(".pz-str")?.querySelector(".pz-strona") || nakladka()?.querySelector(".pz-str.biezaca .pz-strona, .pz-strona");
  s?.scrollBy({ top: Math.round(s.clientHeight * 0.8), behavior: bezRuchu() ? "auto" : "smooth" });
}

function szkielet() {
  let o = nakladka();
  if (o) return o;
  o = document.createElement("div");
  o.id = "pz";
  o.className = "pz";
  o.setAttribute("role", "dialog");
  o.setAttribute("aria-modal", "true");
  o.setAttribute("aria-label", "Zeszyt wujka");
  o.innerHTML = `<div class="pz-ksiazka"><span class="pz-skora" aria-hidden="true">${skora("sk-d")}</span>
    <button type="button" class="pz-zamknij" data-akcja="pp-zeszyt-zamknij">✕ Zamknij <small>(Esc)</small></button>
    <nav class="pz-zakladki" aria-label="Zakładki zeszytu">${STRONY.map(([, n], i) => `<button type="button" class="pz-wstega pz-w${i}" data-akcja="pp-zeszyt-strona" data-n="${i}"><span>${n}</span></button>`).join("")}</nav>
    <div class="pz-blok"><i class="pz-stos pz-stos-l" aria-hidden="true"></i><i class="pz-stos pz-stos-p" aria-hidden="true"></i>
      <div class="pz-rozkladowka" id="pz-roz"><i class="pz-cien" aria-hidden="true"></i>
        <div class="pz-grzbiet" aria-hidden="true"></div>
        <button type="button" class="pz-rog pz-rog-l" data-akcja="pp-zeszyt-strona" data-d="-1" aria-label="Poprzednia strona"><span>‹ Wstecz</span></button>
        <button type="button" class="pz-rog pz-rog-p" data-akcja="pp-zeszyt-strona" data-d="1" aria-label="Następna strona"><span>Dalej ›</span></button></div></div>
    <p class="pz-numer" id="pz-numer" role="status"></p></div>`;
  o.addEventListener("click", (e) => { if (e.target === o) zamknijZeszyt(); });
  const roz = o.querySelector("#pz-roz");
  roz.prepend(elementBoku(0, Z.c, "l", "pz-l"));
  roz.insertBefore(elementBoku(1, Z.c, "p", "pz-p"), roz.querySelector(".pz-grzbiet"));
  roz.addEventListener("scroll", wskaznik, { passive: true, capture: true });
  addEventListener("resize", () => { if (Z.otwarty) { stan(); wskaznik(); } });
  document.body.appendChild(o);
  return o;
}

const strL = () => document.getElementById("pz-l"), strP = () => document.getElementById("pz-p");
function ustawBok(b, k, c) {
  b.dataset.k = String(k);
  b.classList.toggle("pz-pusta", k === 0 || k === 5);
  b.setAttribute("aria-label", nazwaBoku(k));
  stronaBoku(b).innerHTML = zawartosc(c, k);
  stronaBoku(b).scrollTop = 0;
  b.querySelector(".pz-nr-str").textContent = k >= 1 && k <= 4 ? String(k) : "";
}
// stan wokół stron: zakładki, podpis dla czytników, rogi, grubość stosu kartek po bokach
function stan() {
  const o = nakladka();
  if (!o) return;
  const szer = waski();
  o.querySelectorAll(".pz-wstega").forEach((b, i) => { b.classList.toggle("aktywna", i === Z.nr); b.setAttribute("aria-current", i === Z.nr ? "page" : "false"); });
  o.querySelector("#pz-numer").textContent = `${STRONY[Z.nr][1]} · strona ${Z.nr + 1} z ${STRONY.length}`;
  const wstecz = o.querySelector('.pz-rog[data-d="-1"]'), dalej = o.querySelector('.pz-rog[data-d="1"]');
  wstecz.disabled = szer ? Z.nr === 0 : Z.sp === 0;
  dalej.disabled = szer ? Z.nr === STRONY.length - 1 : Z.sp === ROZKLADOWKI - 1;
  const roz = o.querySelector("#pz-roz");
  roz.dataset.sp = String(Z.sp);
  roz.querySelectorAll(":scope > .pz-str").forEach((b) => b.classList.toggle("biezaca", Number(b.dataset.k) === Z.nr + 1));
  o.style.setProperty("--stos-l", String(0.18 + 0.82 * (Z.sp / (ROZKLADOWKI - 1))));
  o.style.setProperty("--stos-p", String(0.18 + 0.82 * (1 - Z.sp / (ROZKLADOWKI - 1))));
}
function wypelnij(c) {
  ustawBok(strL(), 2 * Z.sp, c);
  ustawBok(strP(), 2 * Z.sp + 1, c);
  stan();
  poRysowaniu();
}

export function otworzZeszyt(c, nr = 0) {
  Z.fokus = document.activeElement;
  Z.c = c;
  Z.nr = Math.min(STRONY.length - 1, Math.max(0, nr));
  Z.sp = rozkl(Z.nr);
  const o = szkielet();
  wypelnij(c);
  Z.otwarty = true;
  document.body.classList.add("pz-otwarty");
  o.classList.add("otwarty");
  o.querySelector(".pz-zamknij").focus({ preventScroll: true });
  poRysowaniu();
}

export function zamknijZeszyt(oddajFokus = true) {
  const o = nakladka();
  if (!o || !Z.otwarty) return;
  Z.anim?.finish?.();
  Z.otwarty = false;
  o.classList.remove("otwarty");
  document.body.classList.remove("pz-otwarty");
  o.querySelectorAll(".pz-lisc").forEach((k) => k.remove());
  if (oddajFokus && Z.fokus?.isConnected) Z.fokus.focus({ preventScroll: true });
}

// odświeżenie treści otwartych stron po zmianie widoku gry (bez przewracania, z zachowaniem przewinięcia)
export function odswiezZeszyt(c) {
  const o = nakladka();
  if (!o || !Z.otwarty) return;
  Z.c = c;
  Z.anim?.finish?.();
  o.querySelectorAll("#pz-roz > .pz-str").forEach((b) => {
    const k = Number(b.dataset.k);
    if (k < 1 || k > 4) return;
    const s = stronaBoku(b), przew = s.scrollTop;
    s.innerHTML = tresc(c, k - 1);
    s.scrollTop = przew;
  });
  poRysowaniu();
}

// Przewrócenie kartki. Kartka leży na prawej (wprzód) albo lewej (wstecz) stronie i obraca się wokół grzbietu (rotateY), z lekkim wygięciem
// (skewY), uniesieniem (translateZ) i cieniem. Pod nią od razu leży nowa strona. Animowane są tylko transform i opacity.
function przewroc(c, od, doSp) {
  const o = nakladka(), roz = o.querySelector("#pz-roz"), L = strL(), P = strP(), wprzod = doSp > od;
  const zrodlo = wprzod ? P : L, zapas = stronaBoku(zrodlo).scrollTop;
  const lico = (k, kl, przod) => {
    const b = elementBoku(k, c, kl), f = document.createElement("div");
    f.className = `pz-lico ${przod ? "przod" : "tyl"}`;
    f.setAttribute("aria-hidden", "true");
    f.inert = true;
    f.append(b);
    const sk = document.createElement("i");
    sk.className = "pz-polysk";
    f.append(sk);
    return f;
  };
  const przod = lico(Number(zrodlo.dataset.k), wprzod ? "p" : "l", true), tyl = lico(wprzod ? 2 * doSp : 2 * doSp + 1, wprzod ? "l" : "p", false);
  const lisc = document.createElement("div");
  lisc.className = `pz-lisc ${wprzod ? "wprzod" : "wstecz"}`;
  lisc.append(przod, tyl);
  // pod kartką od razu leży nowa strona po stronie, z której kartkę się zdejmuje; druga strona zmieni się po lądowaniu
  if (wprzod) ustawBok(P, 2 * doSp + 1, c); else ustawBok(L, 2 * doSp, c);
  roz.append(lisc);
  stronaBoku(przod.firstChild).scrollTop = zapas;
  Z.sp = doSp;
  stan();
  const z = wprzod ? -1 : 1, opcje = { duration: CZAS_KARTKI, easing: "cubic-bezier(.45, .05, .2, 1)", fill: "forwards" };
  const ruch = lisc.animate([
    { transform: "rotateY(0deg) translateZ(0) skewY(0deg)" },
    { transform: `rotateY(${z * 58}deg) translateZ(22px) skewY(${z * -1.8}deg)`, offset: 0.36 },
    { transform: `rotateY(${z * 122}deg) translateZ(22px) skewY(${z * 1.8}deg)`, offset: 0.68 },
    { transform: `rotateY(${z * 180}deg) translateZ(0) skewY(0deg)` }], opcje);
  const cien = roz.querySelector(".pz-cien");
  cien.className = `pz-cien ${wprzod ? "wprzod" : "wstecz"}`;
  const a2 = cien.animate([{ opacity: 0 }, { opacity: 0.55, offset: 0.5 }, { opacity: 0 }], { duration: CZAS_KARTKI, easing: "ease-in-out" });
  przod.querySelector(".pz-polysk").animate([{ opacity: 0 }, { opacity: 0.5, offset: 0.55 }, { opacity: 0.5 }], opcje);
  tyl.querySelector(".pz-polysk").animate([{ opacity: 0.5 }, { opacity: 0.5, offset: 0.45 }, { opacity: 0 }], opcje);
  let koniec = false;
  const skoncz = () => {
    if (koniec) return;
    koniec = true;
    a2.cancel();
    if (wprzod) ustawBok(L, 2 * doSp, c); else ustawBok(P, 2 * doSp + 1, c);
    lisc.remove();
    Z.anim = null;
    poRysowaniu();
  };
  ruch.onfinish = skoncz;
  Z.anim = { finish: () => { ruch.finish(); skoncz(); } };
}

// przejście do strony nr (0…3): ta sama rozkładówka – tylko zmiana zakładki; inna – przewrócenie kartki (bez ruchu – zmiana od razu)
export function idzDoStrony(c, nr) {
  nr = Math.min(STRONY.length - 1, Math.max(0, nr));
  const o = nakladka();
  if (!o || nr === Z.nr) return;
  Z.anim?.finish?.();
  const od = Z.sp, doSp = rozkl(nr);
  Z.nr = nr;
  Z.c = c;
  if (doSp === od || waski() || bezRuchu()) {
    Z.sp = doSp;
    if (doSp !== od || waski()) wypelnij(c); else stan();
    return;
  }
  przewroc(c, od, doSp);
}
// kolejna / poprzednia strona (róg kartki, strzałki): na szerokim ekranie przewraca rozkładówkę, na wąskim – jedną stronę
export function krokZeszytu(c, d) {
  idzDoStrony(c, waski() ? Z.nr + d : GLOWNA[Math.min(ROZKLADOWKI - 1, Math.max(0, Z.sp + d))]);
}

// klawiatura: Esc zamyka, ← → przewracają strony, Tab krąży po zeszycie (fokus nie ucieka na mapę)
document.addEventListener("keydown", (e) => {
  if (!Z.otwarty) return;
  const o = nakladka();
  if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); zamknijZeszyt(); return; }
  if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && !e.target.closest?.("input, textarea, select")) {
    e.preventDefault();
    o.querySelector(`.pz-rog[data-d="${e.key === "ArrowRight" ? 1 : -1}"]`)?.click();
    return;
  }
  if (e.key !== "Tab") return;
  const f = [...o.querySelectorAll("button:not([disabled]), a[href], .pz-strona")].filter((x) => x.offsetParent !== null && !x.closest(".pz-lisc"));
  if (!f.length) return;
  const i = f.indexOf(document.activeElement);
  if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
}, true);
