// Zeszyt wujka (seria pulpit, krok 2). Trzy stany: (1) niekliknięty – z prawego dolnego rogu wystaje górna część strony,
// (2) najechanie albo fokus – zeszyt wysuwa się i pokazuje listę zadań (to robi CSS), (3) klik – zeszyt na cały ekran
// (pod półprzezroczystym tłem widać mapę), strony przewraca się z animacją (bez niej przy prefers-reduced-motion).
// Strony: Lista wujka, Rozpiska funkcji, Gdzie co kupić, Samouczek. Zamknięcie: Esc, przycisk, klik poza zeszytem.
// Kartki zamiast przewijania (podróż 03/kartki): treść działów jest dzielona na strony o stałej wysokości, z numerem „3 / 7”.
// Krok 5: zeszyt otwarty to rozkładówka (lewa i prawa strona) z grzbietem i szyciem, stosem kartek po bokach, zakładkami-wstążkami
// i przewracaniem kartki (rotateY z cieniem; tylko transform i opacity). Bez animacji przy prefers-reduced-motion.
// Kolory tylko ze zmiennych palet (wygląd: pulpit.css).
import { esc } from "../zakladki/wspolne.js";
import { budynekZadania, listTygodnia, planTygodnia } from "../zakladki/wujek.js";
import ZAKLADKI, { MENU } from "../zakladki/index.js";
import { MIEJSCA } from "../swiat/swiat.js";

const STRONY = [["lista", "Lista wujka"], ["rozpiska", "Rozpiska funkcji"], ["kupic", "Gdzie co kupić"], ["samouczek", "Samouczek"]];
const Z = { nr: 0, k: 1, sp: 0, str: [], pierwsza: [],  otwarty: false, fokus: null, c: null, anim: null };
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
  <path d="M70 150l18 22-8 18 20 24M300 260l-14 20 12 16-10 22M180 340l26-10 14 14" fill="none" style="stroke:var(--g-czern)" stroke-width="1.2" opacity=".4" vector-effect="non-scaling-stroke"/>
  <path d="M40 300l60-8M250 60l50 14M110 392l90 6M330 170l40 6" fill="none" style="stroke:var(--g-skora)" stroke-width="1.6" stroke-linecap="round" opacity=".55" vector-effect="non-scaling-stroke"/>
  <ellipse cx="300" cy="330" rx="46" ry="30" filter="url(#${id}-r)" style="fill:var(--g-czern)" opacity=".28"/>
  <ellipse cx="90" cy="380" rx="60" ry="26" filter="url(#${id}-r)" style="fill:var(--g-skora3)" opacity=".4"/>
  <circle cx="318" cy="96" r="22" fill="none" style="stroke:var(--g-czern)" stroke-width="3" opacity=".22" vector-effect="non-scaling-stroke"/>
  <path d="M0 360c10-6 14 6 26 0s12 10 20 4M0 430h400" fill="none" style="stroke:var(--g-czern)" stroke-width="1.4" opacity=".35" vector-effect="non-scaling-stroke"/>
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
    <span class="pp-krok"><small>${n ? esc(n.gdzie) : "Gotowe"}</small>${n ? esc(n.kartka || n.co) : "Wszystko odhaczone"}</span>
    <ul class="pp-lista">${poz}</ul></span>`;
}

// --- strony pełnego zeszytu ---------------------------------------------------------------------------------------------
// przycisk „pokaż na mapie”: zeszyt się zamyka, mapa przelatuje do budynku i go pulsuje (pulpit.js: pp-pokaz)
const naMapie = (ids, tekst = "⌖ na mapie", klasa = "pz-mapa") => {
  const l = [].concat(ids || []).filter(Boolean);
  return l.length ? `<button type="button" class="${klasa}" data-akcja="pp-pokaz" data-b="${esc(l.join(","))}" title="Pokaż na mapie" aria-label="${tekst.replace(/<[^>]+>/g, "")}: pokaż na mapie">${tekst}</button>` : "";
};
// Cel tygodnia od wujka (silnik/cele.py): cel na ten tydzień i wynik celu z zeszłego tygodnia (znak, nie sam kolor)
export function celTygodnia(cel) {
  if (!cel) return "";
  const p = cel.poprzedni;
  const wynik = p ? `<p class="pz-cel-wynik ${p.osiagniety ? "ok" : "nie"}"><b>${p.osiagniety ? "✓ Cel z zeszłego tygodnia osiągnięty" : "✗ Cel z zeszłego tygodnia: nie tym razem"}</b>
      <span>${esc(p.tekst)}${p.osiagniety && p.nagroda ? ` · ${esc(p.nagroda)}` : ""}</span></p>` : "";
  return `<section class="pz-cel" aria-label="Cel tygodnia od wujka"><h3>Cel tygodnia</h3>
    <p class="pz-cel-tekst"><b>★ ${esc(cel.tekst)}</b></p>
    <p class="pz-opis">Nagroda: ${esc(cel.nagroda)}. Wynik zobaczycie w zeszycie po zamknięciu tygodnia.</p>${wynik}</section>`;
}
// Od tego tygodnia otwarte: ogłoszenia odblokowań z listu wujka (v.zeszyt.odblokowania, liczone z harmonogramu tej gry);
// „gdzie” przesuwa mapę do budynku jak pozycja listy zadań, bez budynku na mapie (bazar) – sam tekst z miejscem
function odblokowania(v) {
  const l = v.zeszyt?.odblokowania || [];
  if (!l.length) return "";
  const poz = l.map((o) => {
    const b = budynekZadania(v, o), gdzie = b && b !== "bazar" ? naMapie(b, `⌖ ${esc(o.gdzie)}`, "pz-mapa pz-odbl-gdzie") : `<span class="pz-odbl-gdzie">${esc(o.gdzie)}</span>`;
    return `<li><span class="pz-nr" aria-hidden="true">＋</span><span>${esc(o.tekst)}<br>${gdzie}</span></li>`;
  }).join("");
  return `<section class="pz-odbl" aria-label="Od tego tygodnia otwarte"><h3>Od tego tygodnia otwarte</h3><ul class="pz-odbl-lista">${poz}</ul></section>`;
}
function stronaLista(c) {
  const v = c.v, list = listTygodnia(v);
  let plan = null;
  try { plan = planTygodnia(v); } catch (e) { console.error(e); }
  // Z5: klik w pozycję przelatuje mapą do budynku (przybliżenie + pulsowanie, pulpit.js: pp-pokaz); bez budynku na mapie
  // (bazar, wysyłka, ekran bez żetonu) – jak dawniej od razu do wnętrza albo ekranu. „wejdź →” zawsze prowadzi do wnętrza.
  const kroki = (plan?.lista || []).map((k, i) => {
    const b = budynekZadania(v, k), naMapieB = b && b !== "bazar" && k.punkt !== "wyslij";
    const akcja = naMapieB ? `data-akcja="pp-pokaz" data-b="${esc(b)}"` : `data-akcja="pp-wejdz" data-k="${esc(k.klucz)}"`;
    const wejdz = naMapieB ? `<button type="button" class="pz-mapa pz-wejdz" data-akcja="pp-wejdz" data-k="${esc(k.klucz)}" aria-label="Wejdź do środka: ${esc(k.co)}">wejdź →</button>` : "";
    return `<li class="${k.ok ? "ok" : k.teraz ? "teraz" : ""}"><button type="button" class="pz-wiersz" ${akcja}${naMapieB ? ' title="Pokaż na mapie"' : ""}>
    <span class="pz-nr" aria-hidden="true">${k.ok ? "✓" : k.teraz ? "▶" : i + 1}</span><span><small>${esc(k.gdzie)}</small><b>${esc(k.co)}</b> <i>${esc(k.opis)}</i></span>
    <span class="pz-stan">${k.ok ? "zrobione" : k.teraz ? "teraz" : k.szare ? "robi to gra" : ""}</span></button>${wejdz}</li>`;
  }).join("");
  return `<h2>List od wujka · tydzień ${v.zeszyt?.tydzien ?? v.runda}</h2>
    ${list ? `<p class="pz-list"><b>${esc(list.tytul)}</b> ${esc(list.tresc)} <span class="pz-podpis">– Wasz wujek</span></p>` : ""}
    ${odblokowania(v)}
    ${celTygodnia(v.zeszyt?.cel)}
    <h3>Do zrobienia w tym tygodniu${plan ? ` <small>${plan.zrobione} z ${plan.razem}</small>` : ""}</h3>
    <p class="pz-opis">Kliknięcie kroku pokazuje budynek na mapie (mapa się przybliża, a budynek pulsuje); „wejdź →” prowadzi od razu do środka.</p><ol class="pz-kroki">${kroki}</ol>
    ${v.zeszyt?.dopisek ? `<p class="pz-opis"><i>${esc(v.zeszyt.dopisek)}</i></p>` : ""}`;
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

// Gdzie co kupić: strony z v.zeszyt.gdzie_kupic (dane/zeszyt.yaml; liczby z bieżących danych gry wstawia serwer)
const zl = (n) => Number(n).toLocaleString("pl-PL");
const JAKOSCI = ["★", "★★", "★★★"];
function tabelaSprzetu(w) {
  const kom = (o, q) => (o?.[q] == null ? "–" : `${zl(o[q])} zł`);
  return `<table class="pz-tabela" style="grid-column: 1 / -1"><caption>Sprzęt: cena, utrzymanie miesięcznie i koszt całego sezonu</caption><thead><tr><th>Sprzęt</th>${JAKOSCI.map((j) => `<th>${j} cena</th><th>${j} serwis/mies.</th><th>${j} sezon</th>`).join("")}</tr></thead>
    <tbody>${w.map((x) => `<tr><th scope="row">${esc(x.nazwa)}</th>${[1, 2, 3].map((q) => `<td>${kom(x.ceny, q)}</td><td>${kom(x.utrzymanie, q)}</td><td>${kom(x.sezon, q)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
function stronaKupic(c) {
  const lista = c.v.zeszyt?.gdzie_kupic || [];
  const wiersze = lista.map((s) => `<li><b>${esc(s.tytul)}</b><span class="pz-strzalka" aria-hidden="true">→</span><span>${naMapie(s.zeton, esc(s.gdzie), "pz-miejsce")}<br>${esc(s.tekst)}</span>${s.tabela ? tabelaSprzetu(s.tabela) : ""}</li>`).join("");
  return `<h2>Gdzie co kupić</h2><p class="pz-opis">Wujek podpowiada, do którego budynku iść po co. Nazwa miejsca pokazuje je na mapie. Zakupy tygodnia widać pod ikoną koszyka na pasku.</p>
    <ul class="pz-kupic">${wiersze}</ul>`;
}

function stronaSamouczek() {
  const kroki = [["Mapa", "Przeciągnięcie przesuwa mapę, kółko myszy (albo przyciski + i −) przybliża. Kliknięcie budynku wchodzi do środka, a kliknięcie lokalu pokazuje, czy jest wolny."],
    ["Pasek po lewej", "⚙ to ustawienia (wygląd, konto). Poniżej: konto, „Jak grać”, zakupy tygodnia i wydarzenia. Na dole paska leży list: „List z decyzjami”."],
    ["Filtr kategorii", "Rząd ikon u góry po prawej podświetla jeden rodzaj miejsc, na przykład banki, lokale kebab albo miejsca z wydarzeniami tygodnia. Drugie kliknięcie wyłącza filtr."],
    ["Portfel", "Plik banknotów na dole. Najechanie pokazuje gotówkę i debet, kliknięcie otwiera finanse."],
    ["Zeszyt", "Tu jest lista wujka, rozpiska funkcji i podpowiedzi, gdzie co kupić. Strony przewraca się kliknięciem w róg kartki („Dalej ›”, „‹ Wstecz”), zakładkami (wstążkami), klawiszami ← i → albo kółkiem myszy. Esc zamyka zeszyt."],
    ["Tydzień", "Na środku u góry widać numer tygodnia. Gdy wszystko jest gotowe, list na dole paska kończy podejmowanie decyzji. Po przeliczeniu zaczyna się kolejny tydzień."]];
  return `<h2>Samouczek</h2><p class="pz-opis">Krótko, jak się w tym wszystkim poruszać.</p><ol class="pz-kroki pz-samouczek">${kroki.map(([n, o], i) =>
    `<li><span class="pz-nr" aria-hidden="true">${i + 1}</span><span><b>${n}</b> ${o}</span></li>`).join("")}</ol>`;
}

const TRESCI = { lista: stronaLista, rozpiska: stronaRozpiska, kupic: stronaKupic, samouczek: stronaSamouczek };

// --- pełny zeszyt: rozkładówka ------------------------------------------------------------------------------------------------
// Kartki o stałej wysokości (bez przewijania). Treść każdego działu (Lista, Rozpiska, Gdzie co kupić, Samouczek) jest dzielona po
// elementach na strony: Z.str = [{ html, dzial }], numer strony k = 1…N. Boki rozkładówki: k = 0 to pusta okładka po lewej, k > N to
// strona z notatkami (dopełnia parę). Rozkładówka sp ma lewy bok 2·sp i prawy 2·sp + 1; na wąskim ekranie widać jeden bok (Z.k).
const rozkl = (k) => Math.floor(k / 2);                  // numer rozkładówki, na której leży strona k
const CZAS_KARTKI = 860;
const PROG_KOLKA = 40;                                   // tyle „przewinięcia” kółkiem przewraca kartkę
const waski = () => typeof matchMedia === "function" && matchMedia("(max-width: 900px)").matches;   // wąski ekran: jedna strona, bez 3D
const nakladka = () => document.getElementById("pz");
const liczbaStron = () => Z.str.length;
const liczbaRozkl = () => Math.floor(liczbaStron() / 2) + 1;   // pary (0,1), (2,3)…; przy parzystej liczbie stron ostatnią dopełnia strona z notatkami
const jestPusty = (k) => k < 1 || k > liczbaStron();

// --- dzielenie treści na strony -----------------------------------------------------------------------------------------------
// Elementy kładzie się po kolei na niewidzialnej stronie-mierniku (te same wymiary i czcionka co prawdziwa strona). Co się nie mieści,
// ląduje na następnej stronie. Element wyższy niż strona dzieli się na kawałki (pozycje listy, wiersze tabeli z powtórzonym nagłówkiem),
// a gdy się nie da (jeden długi akapit), zmniejsza się go. Nagłówek nigdy nie zostaje na dole strony bez treści pod nim.
const DZIELNE = /^(SECTION|UL|OL|LI|TABLE|DIV)$/;
const naglowek = (e) => !!e && (/^H[23]$/.test(e.tagName) || (e.tagName === "SECTION" && e.children.length === 1 && /^H[23]$/.test(e.firstElementChild.tagName)));
function miesci(m) {
  const e = m.lastElementChild;
  if (!e) return true;
  const r = m.getBoundingClientRect(), skala = r.height / (m.offsetHeight || r.height) || 1;
  const pad = parseFloat(getComputedStyle(m).paddingBottom) || 0;
  return m.scrollHeight <= m.clientHeight + 1 && (e.getBoundingClientRect().bottom - r.top) / skala <= m.clientHeight - pad + 1;
}
function podziel(el) {
  if (!DZIELNE.test(el.tagName)) return null;
  if (el.tagName === "TABLE") {
    const wiersze = [...(el.tBodies[0]?.rows || [])];
    if (wiersze.length < 2) return null;
    return wiersze.map((w, i) => {
      const t = el.cloneNode(false), tb = document.createElement("tbody");
      if (i) t.dataset.dalej = "1"; else if (el.caption) t.append(el.caption.cloneNode(true));
      if (el.tHead) t.append(el.tHead.cloneNode(true));
      tb.append(w.cloneNode(true));
      t.append(tb);
      return t;
    });
  }
  const dz = [...el.children];
  if (!dz.length) return null;
  if (el.tagName === "LI") {   // pozycja listy: dzieli się tylko przez wiersze swojej tabeli (resztę kładzie w całości przy pierwszym kawałku)
    const tab = dz.find((x) => x.tagName === "TABLE"), w = tab && podziel(tab);
    if (!w) return null;
    return w.map((t, i) => {
      const s = el.cloneNode(false);
      if (i) s.dataset.dalej = "1"; else dz.forEach((x) => { if (x !== tab) s.append(x.cloneNode(true)); });
      s.append(t);
      return s;
    });
  }
  if (dz.length === 1) {
    const w = podziel(dz[0]);
    return w && w.map((p) => { const s = el.cloneNode(false); if (p.dataset.dalej) s.dataset.dalej = "1"; s.append(p); return s; });
  }
  return dz.map((ch, i) => { const s = el.cloneNode(false); if (i) s.dataset.dalej = "1"; s.append(ch.cloneNode(true)); return s; });
}
// dokłada kawałek „dalej” do poprzedniego elementu tego samego rodzaju (kawałki jednej listy wracają do jednej listy); zwraca cofnięcie
function wlej(a, b) {
  if (a.tagName === "TABLE") {
    const tb = a.tBodies[0], skad = b.tBodies[0], wiersze = [...skad.rows];
    wiersze.forEach((w) => tb.append(w));
    return () => wiersze.forEach((w) => skad.append(w));
  }
  const dz = [...b.children], ost = a.lastElementChild;
  if (dz.length === 1 && dz[0].dataset.dalej && ost && ost.tagName === dz[0].tagName && ost.className === dz[0].className) return wlej(ost, dz[0]);
  dz.forEach((x) => a.append(x));
  return () => dz.forEach((x) => b.append(x));
}
function paginuj(wezly, m) {
  const strony = [];
  m.replaceChildren();
  const zamknij = () => {
    let r = 0;   // ile elementów od końca to nagłówek (z akapitem pod nim): przechodzą na następną stronę razem z treścią
    const dz = [...m.children];
    for (let i = dz.length - 1; i >= 0; i--) {
      if (naglowek(dz[i]) || (dz[i].tagName === "P" && naglowek(dz[i - 1]))) r++; else break;
    }
    const niesione = r && r < dz.length ? dz.slice(dz.length - r) : [];
    niesione.forEach((e) => e.remove());
    if (m.children.length) strony.push(m.innerHTML);
    m.replaceChildren(...niesione);
  };
  const poloz = (el) => {
    const ost = m.lastElementChild;
    if (el.dataset.dalej && ost && ost.tagName === el.tagName && ost.className === el.className) {
      const cofnij = wlej(ost, el);
      if (miesci(m)) return;
      cofnij();
    }
    m.append(el);
    if (miesci(m)) return;
    el.remove();
    if (m.children.length && /^(UL|OL|TABLE)$/.test(el.tagName) && (el.tagName === "TABLE" || el.children.length > 1)) {   // lista albo tabela wypełnia resztę strony, a nie ucieka na następną
      const czesci = podziel(el);
      if (czesci) { czesci.forEach(poloz); return; }
    }
    if (m.children.length) {
      zamknij();
      m.append(el);
      if (miesci(m)) return;
      el.remove();
    }
    const czesci = podziel(el);
    if (czesci) { czesci.forEach(poloz); return; }
    m.append(el);   // niepodzielny i za wysoki: zmniejszenie, aż się zmieści
    for (let z = 0.94; z >= 0.5 && !miesci(m); z -= 0.06) el.style.zoom = z.toFixed(2);
  };
  wezly.forEach(poloz);
  zamknij();
  return strony;
}
function miernik() {
  const roz = nakladka().querySelector("#pz-roz");
  return roz.querySelector(".pz-mier .pz-strona");
}
function zbudujStrony(c) {
  const m = miernik(), wynik = [];
  STRONY.forEach(([klucz], d) => {
    const korzen = document.createElement("div");
    korzen.innerHTML = TRESCI[klucz](c);
    const strony = paginuj([...korzen.children], m);
    (strony.length ? strony : [""]).forEach((html) => wynik.push({ html, dzial: d }));
  });
  m.replaceChildren();
  Z.str = wynik;
  Z.pierwsza = STRONY.map((_, d) => wynik.findIndex((s) => s.dzial === d) + 1);
}

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
const zawartosc = (k) => (jestPusty(k) ? bokPusty(k) : Z.str[k - 1].html);
const nazwaBoku = (k) => (jestPusty(k) ? (k === 0 ? "Okładka zeszytu, strona wewnętrzna" : "Strona z notatkami")
  : `${STRONY[Z.str[k - 1].dzial][1]}, strona ${k} z ${liczbaStron()}`);
const numerBoku = (k) => (jestPusty(k) ? "" : `${k} / ${liczbaStron()}`);

// Jeden bok rozkładówki: strona o stałej wysokości (bez przewijania). Klasa l/p = lewa/prawa (inne cienie, dziurki po zewnętrznej stronie).
function elementBoku(k, strona, id = "") {
  const b = document.createElement("section");
  b.className = `pz-str pz-str-${strona}${jestPusty(k) ? " pz-pusta" : ""}`;
  if (id) b.id = id;
  b.dataset.k = String(k);
  b.setAttribute("aria-label", nazwaBoku(k));
  b.innerHTML = `<div class="pz-strona">${zawartosc(k)}</div><span class="pz-nr-str" aria-hidden="true">${numerBoku(k)}</span>`;
  return b;
}
const stronaBoku = (b) => b.querySelector(".pz-strona");

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
        <section class="pz-str pz-str-p pz-mier" aria-hidden="true" inert><div class="pz-strona"></div></section>
        <div class="pz-grzbiet" aria-hidden="true"></div>
        <button type="button" class="pz-rog pz-rog-l" data-akcja="pp-zeszyt-strona" data-d="-1" aria-label="Poprzednia strona"><span>‹ Wstecz</span></button>
        <button type="button" class="pz-rog pz-rog-p" data-akcja="pp-zeszyt-strona" data-d="1" aria-label="Następna strona"><span>Dalej ›</span></button></div></div>
    <p class="pz-numer" id="pz-numer" role="status" aria-live="polite" aria-atomic="true"></p></div>`;
  o.addEventListener("click", (e) => { if (e.target === o) zamknijZeszyt(); });
  const roz = o.querySelector("#pz-roz");
  roz.prepend(elementBoku(0, "l", "pz-l"));
  roz.insertBefore(elementBoku(1, "p", "pz-p"), roz.querySelector(".pz-grzbiet"));
  // kółko myszy przewraca kartkę (z progiem, żeby jeden ruch kółka nie przerzucił kilku stron); strony się nie przewijają
  let zebrane = 0, ostatnieKolko = 0;
  roz.addEventListener("wheel", (e) => {
    if (e.ctrlKey) return;
    e.preventDefault();
    const teraz = Date.now();
    if (teraz - ostatnieKolko > 250) zebrane = 0;
    ostatnieKolko = teraz;
    zebrane += e.deltaMode === 1 ? e.deltaY * 34 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
    if (Math.abs(zebrane) < PROG_KOLKA || Z.anim) return;
    krokZeszytu(Z.c, Math.sign(zebrane));
    zebrane = 0;
    ostatnieKolko = teraz + 400;   // chwila przerwy po przewróceniu, żeby rozpęd kółka nie przewrócił kolejnej kartki
  }, { passive: false });
  let czas = 0;
  addEventListener("resize", () => { clearTimeout(czas); czas = setTimeout(() => { if (Z.otwarty) przeladuj(Z.c); }, 120); });
  document.body.appendChild(o);
  return o;
}

const strL = () => document.getElementById("pz-l"), strP = () => document.getElementById("pz-p");
function ustawBok(b, k) {
  b.dataset.k = String(k);
  b.classList.toggle("pz-pusta", jestPusty(k));
  b.setAttribute("aria-label", nazwaBoku(k));
  stronaBoku(b).innerHTML = zawartosc(k);
  b.querySelector(".pz-nr-str").textContent = numerBoku(k);
}
// stan wokół stron: zakładki, podpis dla czytników, rogi, grubość stosu kartek po bokach
function stan() {
  const o = nakladka();
  if (!o) return;
  const szer = waski(), n = liczbaStron(), roz = liczbaRozkl();
  o.querySelectorAll(".pz-wstega").forEach((b, i) => { b.classList.toggle("aktywna", i === Z.nr); b.setAttribute("aria-current", i === Z.nr ? "page" : "false"); });
  o.querySelector("#pz-numer").textContent = `${STRONY[Z.nr][1]} · strona ${Z.k} z ${n}`;
  const wstecz = o.querySelector('.pz-rog[data-d="-1"]'), dalej = o.querySelector('.pz-rog[data-d="1"]');
  wstecz.disabled = szer ? Z.k <= 1 : Z.sp === 0;
  dalej.disabled = szer ? Z.k >= n : Z.sp >= roz - 1;
  const r = o.querySelector("#pz-roz");
  r.dataset.sp = String(Z.sp);
  r.querySelectorAll(":scope > .pz-str[data-k]").forEach((b) => b.classList.toggle("biezaca", Number(b.dataset.k) === Z.k));
  const ulamek = roz > 1 ? Z.sp / (roz - 1) : 0;
  o.style.setProperty("--stos-l", String(0.18 + 0.82 * ulamek));
  o.style.setProperty("--stos-p", String(0.18 + 0.82 * (1 - ulamek)));
}
function wypelnij() {
  ustawBok(strL(), 2 * Z.sp);
  ustawBok(strP(), 2 * Z.sp + 1);
  stan();
}
// ponowny podział na strony (zmiana rozmiaru okna albo pisma, odświeżenie widoku gry); zostajemy przy tej samej stronie, a gdy treść
// się nie zmieniła, nic nie dotykamy (fokus na przyciskach strony zostaje)
function przeladuj(c) {
  Z.anim?.finish?.();
  Z.c = c;
  const stare = JSON.stringify(Z.str), dzial = Z.str[Z.k - 1]?.dzial ?? Z.nr;
  zbudujStrony(c);
  Z.k = Math.min(liczbaStron(), Math.max(1, Z.k));
  if (Z.str[Z.k - 1].dzial !== dzial) Z.k = Z.pierwsza[dzial];
  Z.nr = Z.str[Z.k - 1].dzial;
  Z.sp = rozkl(Z.k);
  if (stare !== JSON.stringify(Z.str) || strL().dataset.k !== String(2 * Z.sp)) wypelnij(); else stan();
}

export function otworzZeszyt(c, nr = 0) {
  Z.fokus = document.activeElement;
  Z.c = c;
  const o = szkielet();
  Z.otwarty = true;
  document.body.classList.add("pz-otwarty");
  o.classList.add("otwarty");
  zbudujStrony(c);
  Z.nr = Math.min(STRONY.length - 1, Math.max(0, nr));
  Z.k = Z.pierwsza[Z.nr];
  Z.sp = rozkl(Z.k);
  wypelnij();
  o.querySelector(".pz-zamknij").focus({ preventScroll: true });
  document.fonts?.ready?.then(() => { if (Z.otwarty) przeladuj(Z.c); });   // po wczytaniu czcionek wysokości mogą się zmienić
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

// odświeżenie treści po zmianie widoku gry (bez przewracania; strony przeliczane tylko, gdy treść się zmieniła)
export function odswiezZeszyt(c) {
  if (!nakladka() || !Z.otwarty) return;
  przeladuj(c);
}

// Przewrócenie kartki. Kartka leży na prawej (wprzód) albo lewej (wstecz) stronie i obraca się wokół grzbietu (rotateY), z lekkim wygięciem
// (skewY), uniesieniem (translateZ) i cieniem. Pod nią od razu leży nowa strona. Animowane są tylko transform i opacity.
function przewroc(c, od, doSp) {
  const o = nakladka(), roz = o.querySelector("#pz-roz"), L = strL(), P = strP(), wprzod = doSp > od;
  const zrodlo = wprzod ? P : L;
  const lico = (k, kl, przod) => {
    const b = elementBoku(k, kl), f = document.createElement("div");
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
  if (wprzod) ustawBok(P, 2 * doSp + 1); else ustawBok(L, 2 * doSp);
  roz.append(lisc);
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
    if (wprzod) ustawBok(L, 2 * doSp); else ustawBok(P, 2 * doSp + 1);
    lisc.remove();
    Z.anim = null;
    poRysowaniu();
  };
  ruch.onfinish = skoncz;
  Z.anim = { finish: () => { ruch.finish(); skoncz(); } };
}

// przejście do strony k (1…N): ta sama rozkładówka – tylko zmiana zakładki; inna – przewrócenie kartki (bez ruchu – zmiana od razu)
function idzDoK(c, k) {
  k = Math.min(liczbaStron(), Math.max(1, k));
  const o = nakladka();
  if (!o || k === Z.k) return;
  Z.anim?.finish?.();
  const od = Z.sp, doSp = rozkl(k);
  Z.k = k;
  Z.nr = Z.str[k - 1].dzial;
  Z.c = c;
  if (doSp === od || waski() || bezRuchu()) {
    Z.sp = doSp;
    if (doSp !== od || waski()) wypelnij(); else stan();
    return;
  }
  przewroc(c, od, doSp);
}
// zakładka: pierwsza strona działu (nr 0…3)
export function idzDoStrony(c, nr) {
  idzDoK(c, Z.pierwsza[Math.min(STRONY.length - 1, Math.max(0, nr))]);
}
// kolejna / poprzednia strona (róg kartki, strzałki, kółko): na szerokim ekranie przewraca rozkładówkę, na wąskim – jedną stronę
export function krokZeszytu(c, d) {
  if (waski()) { idzDoK(c, Z.k + d); return; }
  const cel = Z.sp + d;
  if (cel < 0 || cel >= liczbaRozkl()) return;
  idzDoK(c, cel === 0 ? 1 : Math.min(liczbaStron(), 2 * cel + 1));
}

// klawiatura: Esc zamyka, ← → i PageUp/PageDown przewracają kartki, Tab krąży po zeszycie (fokus nie ucieka na mapę)
document.addEventListener("keydown", (e) => {
  if (!Z.otwarty) return;
  const o = nakladka();
  if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); zamknijZeszyt(); return; }
  const kierunek = { ArrowRight: 1, ArrowLeft: -1, PageDown: 1, PageUp: -1 }[e.key];
  if (kierunek && !e.target.closest?.("input, textarea, select")) {
    e.preventDefault();
    o.querySelector(`.pz-rog[data-d="${kierunek}"]`)?.click();
    return;
  }
  if (e.key !== "Tab") return;
  const f = [...o.querySelectorAll("button:not([disabled]), a[href]")].filter((x) => x.offsetParent !== null && !x.closest(".pz-lisc") && !x.closest(".pz-mier"));
  if (!f.length) return;
  const i = f.indexOf(document.activeElement);
  if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
}, true);
