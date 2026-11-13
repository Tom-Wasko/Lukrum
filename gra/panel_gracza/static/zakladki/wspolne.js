// Wspólne funkcje interfejsu: formatowanie, okna dialogowe, wykresy.
import { zwinPodpowiedzi } from "./dymki.js";
import { ikonaMarki } from "./ikony_marek.js";

// Kalendarz rund (katalog.yaml: rundy.kalendarz) – ustawiany z widoku gry (v.gra.kalendarz) przy każdym wczytaniu.
// Kwoty miesięczne z danych (utrzymanie, czynsz) silnik księguje na rundę: naRunde.
export const OKRES = { mianownik: "miesiąc", dopelniacz: "miesiąca", miejscownik: "miesiącu", skrot: "mies.",
  przymiotnik: "Miesięczny", mnoga: "miesiące", rund_w_roku: 12 };
let KAL = null;
export function ustawKalendarz(k) {
  if (!k) return;
  KAL = k;
  Object.assign(OKRES, k.okres, { rund_w_roku: k.rund_w_roku });
}
export const nazwaRundy = (r) => KAL?.nazwy[r - 1] ?? `Runda ${r}`;
export const skrotRundy = (r) => KAL?.skroty[r - 1] ?? `R${r}`;
export const miesiacRundy = (r) => KAL?.miesiace[r - 1] ?? (r - 1) % 12;
export const naRunde = (kwotaMiesieczna) => OKRES.rund_w_roku === 12 ? kwotaMiesieczna : kwotaMiesieczna * 12 / OKRES.rund_w_roku;
export const naOkres = () => ` / ${OKRES.skrot}`;

// N5 (Poprawki 3): separator tysięcy zawsze (także 4806 → 4 806, jak w tekstach silnika); Intl daje go jako twardą spację
const fmt = (min, max) => new Intl.NumberFormat("pl-PL", { minimumFractionDigits: min, maximumFractionDigits: max, useGrouping: "always" });
const F0 = fmt(0, 0), F2 = fmt(2, 2), F3 = fmt(0, 3);

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const zl = (x, grosze = false) => x == null ? "–" : (grosze ? F2 : F0).format(x) + "\u00a0zł";

// U13: jedno zdanie „dlaczego” pod rankingiem (uczeń i mistrz gry) – miejsce to nie stan konta
export const RANKING_DLACZEGO = "Ranking liczy średnią kartę wyników ze wszystkich tygodni sprzedaży (od tygodnia 2) – liczy się zarabianie "
  + "co tydzień, zadowolenie klientów i pracowników oraz rozwój, a nie sam stan konta.";

// U11: inwestor ratunkowy (silnik/pieniadze/inwestor.py) – ile wpłacił, jaki udział i do kiedy, ile już wziął
export function inwestorHtml(v) {
  const I = v.inwestor;
  if (!I) return "";
  const zostalo = Math.max(0, I.do_rundy - v.runda + 1), udz = `${Math.round(I.udzial * 100)}%`;
  const rund = (n) => n === 1 ? "1 rundę" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? `${n} rundy` : `${n} rund`;
  return `<div class="komunikat"><b>Inwestor ratunkowy</b> wpłacił ${zl(I.kwota)} w rundzie ${I.od_rundy}. ${zostalo
    ? `Bierze ${udz} dodatniego dochodu netto jeszcze przez ${rund(zostalo)} (do rundy ${I.do_rundy})`
    : `Umowa skończyła się w rundzie ${I.do_rundy}`}; dotąd wziął ${zl(I.wyplacone)}.
    ${I.dlug > 0 ? `Niezwrócone ${zl(I.dlug)} liczy się jak dług (wskaźnik zadłużenia, majątek netto).` : "Wpłata już wróciła do inwestora."}</div>`;
}
export const zl2 = (x) => zl(x, true);

// UF27/UF28: małe słupki (Strefy miasta – dni tygodnia, Menu – sezonowość dania): wysokość wg wartości względem
// najwyższej, wyróżniony słupek ciemny, dymek „wtorek – popyt: × 1,1” (wspólny dymek z dymki.js – tabela go nie utnie)
const mnoznik = (x) => `× ${fmt(0, 2).format(x)}`;
export function slupki(lista, opis = "") {
  const max = Math.max(...lista.map((s) => s.x));
  if (!lista.length || !(max > 0)) return "–";
  return `<div class="slupki"${opis ? ` role="img" aria-label="${esc(opis)}"` : ""}>${lista.map((s) =>
    `<i class="ma-dymek${s.ten ? " ten" : ""}"><b style="height:${Math.max(1, Math.round((s.x / max) * 22))}px"></b><span class="dymek-tresc">${esc(s.etykieta)} – popyt: ${mnoznik(s.x)}${s.dopisek ? `<br>${esc(s.dopisek)}` : ""}</span></i>`).join("")}</div>`;
}
export const licz = (x, max = 0) => x == null ? "–" : fmt(0, max).format(x);
export const ulamek = (x) => x == null ? "–" : F3.format(x);
export const proc = (x, miejsca = 1) => x == null ? "–" : fmt(miejsca, miejsca).format(x * 100) + "%";
export const wsk = (x) => x == null ? "–" : fmt(3, 3).format(x);
export const gw = (n) => {
  const g = Math.round(n || 0);
  return `<span class="gwiazdki">${"★".repeat(g)}<span class="p">${"★".repeat(Math.max(0, 3 - g))}</span></span>`;
};
// godzina z czasu ISO (zapis decyzji przez kogoś z drużyny)
export const godzina = (iso) => iso ? new Date(iso).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }) : "";
// limit nowych pracowników na rundę (silnik/limity.py): czy po dodaniu jeszcze jednego będzie przekroczony
export const ponadLimitPracownikow = (v, zatrudnij, podkup) => !!v.agencja && zatrudnij.length + podkup.length >= v.agencja.limit;
export const tekstLimituPracownikow = (v) => `W jednej rundzie możesz przyjąć najwyżej ${v.agencja.limit} nowych pracowników
  (zatrudnienia i oferty podkupienia razem). Zrezygnuj z któregoś albo poczekaj do następnej rundy.`;
// termin zamknięcia rundy z harmonogramu mistrza gry, np. „środa, 28 października, 08:00”
export const termin = (iso) => iso ? new Date(iso).toLocaleString("pl-PL",
  { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "";
export const inicjaly = (imie) => esc(String(imie || "?").split(" ").map((x) => x[0]).join("").slice(0, 2));

// pasek z opisem (panel mistrza gry; panel gracza ma kółka „i” – dymki.js)
export function info(tekst) {
  return `<div class="info"><span class="i">i</span><span>${tekst}</span></div>`;
}


// --- sortowanie tabel: klik w nagłówek – rosnąco, malejąco, kolejność pierwotna. Stan per tabela (tytuł + nagłówki)
// zostaje po przerysowaniu widoku; w oknach (np. baza składników) wiersze układa się od razu w DOM.
const _sort = {};
const _tekst = (h) => String(h ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();

// wartość komórki do porównania: liczba („1 234,56 zł”, „−3%”, „≈ 120”, „★★”), tekst albo null (pusta, „–”)
export function kluczSortu(html) {
  const t = _tekst(html);
  if (!t || t === "–" || t === "-") return null;
  if (/^★+$/.test(t)) return t.length;
  const m = t.replace(/[\s\u00a0\u202f≈~]/g, "").replace(/^−/, "-").match(/^[-+]?\d+(?:,\d+)?/);
  return m ? parseFloat(m[0].replace(",", ".")) : t.toLowerCase();
}

function porownaj(a, b, kier) {
  if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1;   // puste zawsze na końcu
  if (typeof a !== typeof b) return typeof a === "number" ? -kier : kier;
  return (typeof a === "number" ? a - b : a.localeCompare(b, "pl", { numeric: true })) * kier;
}

function ulozone(lista, komorka, s) {
  if (!s) return lista;
  return lista.map((x, i) => [x, kluczSortu(komorka(x)), i])
    .sort(([, ka, ia], [, kb, ib]) => porownaj(ka, kb, s.kier) || ia - ib).map(([x]) => x);
}

export function przelaczSortowanie(th) {
  const klucz = th.dataset.sort, k = +th.dataset.k, s = _sort[klucz];
  const nowy = _sort[klucz] = !s || s.k !== k ? { k, kier: 1 } : s.kier === 1 ? { k, kier: -1 } : null;
  const tab = th.closest("table"), tb = tab.tBodies[0];
  tab.querySelectorAll("th[data-sort]").forEach((h) => h.classList.remove("rosnaco", "malejaco"));
  if (nowy) th.classList.add(nowy.kier === 1 ? "rosnaco" : "malejaco");
  const rzedy = [...tb.rows].sort((a, b) => a.dataset.i - b.dataset.i);
  ulozone(rzedy, (r) => r.cells[k]?.innerHTML, nowy).forEach((r) => tb.appendChild(r));
}

export function tabela(tytul, naglowki, wiersze, { stopka = null, klasy = [], sortuj = true } = {}) {
  const klucz = sortuj && wiersze.length > 1 ? _tekst(`${tytul || ""}|${naglowki.join("|")}`) : null;
  const s = klucz ? _sort[klucz] : null;
  const th = naglowki.map((h, i) => {
    const kier = s && s.k === i ? (s.kier === 1 ? " rosnaco" : " malejaco") : "";
    return klucz ? `<th class="${klasy[i] || ""}${kier}" data-sort="${esc(klucz)}" data-k="${i}" title="Kliknij, aby posortować">${h}</th>`
      : `<th class="${klasy[i] || ""}">${h}</th>`;
  }).join("");
  const wi = ulozone(wiersze.map((w, i) => [w, i]), ([w]) => s && w[s.k], s);
  const tr = wi.map(([w, n]) => `<tr data-i="${n}">${w.map((c, i) => `<td class="${klasy[i] || ""}">${c ?? ""}</td>`).join("")}</tr>`).join("");
  const tf = stopka ? `<tfoot><tr>${stopka.map((c, i) => `<td class="${klasy[i] || ""}">${c ?? ""}</td>`).join("")}</tr></tfoot>` : "";
  const brak = wiersze.length ? "" : `<tr><td colspan="${naglowki.length}">Brak danych</td></tr>`;
  return `${tytul ? `<div class="tabela-tytul">${tytul}</div>` : ""}<div class="tab-wrap"><table class="t"><thead><tr>${th}</tr></thead><tbody>${tr}${brak}</tbody>${tf}</table></div>`;
}

// --- UF23: redakcja wyników – zdanie-podsumowanie na górze widoku, kafelki najważniejszych liczb (ze strzałką
// względem poprzedniej rundy), szczegóły (tabele) zwijane. Stan zwinięcia pamiętany per sekcja (app.js: toggle).
export function podsumowanie(zdania, ton = "") {
  const z = (Array.isArray(zdania) ? zdania : [zdania]).filter(Boolean);
  return z.length ? `<div class="podsumowanie ${ton}">${z.join(" ")}</div>` : "";
}
// ▲/▼ i różnica; lepiej = 1 – więcej znaczy lepiej, −1 – mniej (koszty, straty), 0 – bez oceny (szara)
export function strzalka(teraz, przed, { lepiej = 1, format = licz, prog = 0.5 } = {}) {
  if (teraz == null || przed == null) return "";
  const d = teraz - przed;
  if (Math.abs(d) < prog) return `<span class="delta rowno" title="Tydzień wcześniej: ${format(przed)}">= bez zmian</span>`;
  const ton = !lepiej ? "rowno" : d * lepiej > 0 ? "plus" : "minus";
  return `<span class="delta ${ton}" title="Tydzień wcześniej: ${format(przed)}">${d > 0 ? "▲" : "▼"} ${format(Math.abs(d))}</span>`;
}
// kafelki: [{etykieta, wartosc (HTML), delta (HTML ze strzalka), opis, ton: "plus"|"minus"|""}]; puste pozycje pomijane
export function kafelkiLiczb(lista) {
  const l = lista.filter(Boolean);
  return l.length ? `<div class="liczby-wynikow">${l.map((x) => `<div class="lw ${x.ton || ""}"><span class="etykieta">${x.etykieta}</span>
    <b>${x.wartosc}</b>${x.delta || ""}${x.opis ? `<span class="opis">${x.opis}</span>` : ""}</div>`).join("")}</div>` : "";
}
const _zwiniecia = {};   // klucz sekcji → otwarta (true/false) – zmienione ręcznie przez gracza
export function zapamietajZwiniecie(d) { if (d?.dataset?.zwin) _zwiniecia[d.dataset.zwin] = d.open; }
export function zwin(tytul, html, { otwarte = false, klucz = null, licznik = null } = {}) {
  const k = klucz || _tekst(tytul), o = _zwiniecia[k] ?? otwarte;
  return `<details class="szczegoly" data-zwin="${esc(k)}" ${o ? "open" : ""}><summary>${tytul}${licznik != null
    ? ` <span class="licznik">${licznik}</span>` : ""}</summary><div class="szczegoly-tresc">${html}</div></details>`;
}
// tabela szczegółów w zwijanej sekcji (tytuł tabeli staje się nagłówkiem sekcji; liczba wierszy obok)
export function zwinTabela(tytul, naglowki, wiersze, opcje = {}) {
  const { otwarte = false, ...reszta } = opcje;
  return zwin(tytul, tabela(tytul, naglowki, wiersze, reszta), { otwarte, licznik: wiersze.length || null });
}
// „Wyniki pojawią się po pierwszej rundzie” – jednakowo we wszystkich zakładkach
export const brakWynikow = (tekst = "Wyniki pojawią się po przeliczeniu pierwszej rundy.") => `<p class="podpowiedz">${tekst}</p>`;

// N6 (Poprawki 3): kwota nie łamie się w środku („14 445,91 zł”). Teksty z silnika mają zwykłe spacje, więc po
// wyrysowaniu karty zamieniamy w węzłach tekstowych spację między cyframi grup tysięcy i przed „zł”/„gr” na twardą.
const SPACJA_TYSIECY = /(\d) (?=\d{3}(?!\d))/g, SPACJA_WALUTY = /(\d) (?=(?:zł|gr|tys\.|mln|%)(?![\p{L}]))/gu;
export function twardeSpacje(korzen) {
  if (!korzen) return;
  const w = document.createTreeWalker(korzen, NodeFilter.SHOW_TEXT, { acceptNode: (n) =>
    n.parentElement && n.parentElement.closest("textarea, script, style") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (!/\d /.test(n.data)) continue;
    const t = n.data.replace(SPACJA_TYSIECY, "$1\u00a0").replace(SPACJA_WALUTY, "$1\u00a0");
    if (t !== n.data) n.data = t;
  }
}

// P4 (poprawki 4): wartość pola przy ostatnim zatwierdzeniu (zdarzenie change) – Enter nie zapisuje drugi raz tego samego,
// a odświeżane okno wie, które pole ma jeszcze niezatwierdzony wpis
document.addEventListener("change", (e) => { if (e.target?.matches?.("input, textarea")) e.target._zatwierdzone = e.target.value; }, true);
export const niezatwierdzone = (el) => !!el?.matches?.("input:not([type=checkbox]):not([type=radio]), textarea")
  && el.value !== (el._zatwierdzone ?? el.defaultValue);
// klucz pola (atrybuty data-*, id) – to samo pole po przerysowaniu
export function kluczPola(el) {
  if (!el || !el.dataset || !el.matches("input, select, textarea")) return null;
  return JSON.stringify({ t: el.tagName, ...el.dataset, id: el.id || "" });
}

let _okno = null, _poZamknieciu = null;
// `poZamknieciu` (opcjonalnie): wywoływane po zamknięciu okna (np. odświeżenie karty pod oknem po zmianach w nim)
export function okno(tytul, html, { male = false, srednie = false, przyciski = "", poZamknieciu = null } = {}) {
  const tresc = `<div class="okno ${male ? "male" : srednie ? "srednie" : ""}"><div class="og"><span>${tytul}</span><span class="x" data-akcja="zamknij-okno">✕</span></div>
    <div class="ot">${html}</div>${przyciski ? `<div class="ost">${przyciski}</div>` : ""}</div>`;
  if (_okno && _okno._tytul === tytul) return odswiezOkno(_okno, tresc, poZamknieciu);
  zamknijOkno();
  const z = document.createElement("div");
  z.className = "zaslona";
  z.innerHTML = tresc;
  z._tytul = tytul;
  z.addEventListener("click", (e) => { if (e.target === z) zamknijOkno(); });
  document.body.appendChild(z);
  twardeSpacje(z);
  zwinPodpowiedzi(z);
  _okno = z;
  _poZamknieciu = poZamknieciu;
  return z;
}
// P4: to samo okno otwarte ponownie (np. „Baza składników” po zapisie ilości) odświeża się w miejscu – bez zamykania
// i animacji, z tym samym przewinięciem, polem z kursorem i niezatwierdzonym wpisem (gracz po Enter/Tab pisze dalej)
function odswiezOkno(z, tresc, poZamknieciu) {
  const przewiniecie = z.scrollTop, a = z.contains(document.activeElement) ? document.activeElement : null;
  const fokus = kluczPola(a), wpis = niezatwierdzone(a) ? a.value : null;
  z.innerHTML = tresc;
  twardeSpacje(z);
  zwinPodpowiedzi(z);
  const pole = fokus && [...z.querySelectorAll("input, select, textarea")].find((el) => kluczPola(el) === fokus);
  if (pole) {
    if (wpis !== null) {   // wpis przeniesiony do nowego pola – przeglądarka nie uzna go za zmianę, więc zatwierdzamy przy wyjściu
      pole.value = wpis;   // (pole usunięte kolejnym odświeżeniem – wpis przenosi się dalej, bez zapisu)
      pole.addEventListener("blur", () => setTimeout(() => {
        if (pole.isConnected && niezatwierdzone(pole)) pole.dispatchEvent(new Event("change", { bubbles: true }));
      }), { once: true });
    }
    pole.focus({ preventScroll: true });
  }
  z.scrollTop = przewiniecie;
  if (poZamknieciu) _poZamknieciu = poZamknieciu;
  return z;
}
export const otwarteOkno = (tytul) => !!_okno && _okno._tytul === tytul;
export function zamknijOkno() {
  if (!_okno) return;
  const f = _poZamknieciu;
  _okno.remove(); _okno = null; _poZamknieciu = null;
  if (f) f();
}

export function toast(tekst) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = tekst;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

const wykresy = [];
export function wyczyscWykresy() { while (wykresy.length) wykresy.pop().destroy(); }
export const KOLORY = ["#1e9e5a", "#2d73d6", "#e45f26", "#9b51e0", "#f2b705", "#e5333f", "#17a2b8", "#795548"];
// kolory wykresów z bieżącego motywu (zmienne CSS --wykres-*); kolor serii może być nazwą zmiennej, np. "--wykres-linia"
const zmienna = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function paleta() {
  const p = zmienna("--wykres-paleta");
  return p ? p.split(",").map((x) => x.trim()) : KOLORY;
}
export function wykres(id, typ, etykiety, serie, opcje = {}) {
  const el = document.getElementById(id);
  if (!el || !window.Chart) return;
  const kolory = paleta(), tekst = zmienna("--wykres-tekst"), siatka = zmienna("--wykres-siatka"), font = zmienna("--wykres-font");
  if (tekst) Chart.defaults.color = tekst;
  if (siatka) Chart.defaults.borderColor = siatka;
  Chart.defaults.font.family = font || "Montserrat, sans-serif";
  // N7 (Poprawki 3): polski format liczb na osiach i w dymkach wszystkich wykresów (60 000 zamiast 60,000; 4 806)
  Chart.defaults.locale = "pl-PL";
  if (Chart.defaults.scales.linear) Chart.defaults.scales.linear.ticks.format = { useGrouping: "always" };
  const kolor = (s, i) => Array.isArray(s.kolor) ? s.kolor : (s.kolor && s.kolor.startsWith("--") ? zmienna(s.kolor) : s.kolor) || kolory[i % kolory.length];
  wykresy.push(new Chart(el, {
    type: typ,
    data: { labels: etykiety, datasets: serie.map((s, i) => ({ ...s, backgroundColor: kolor(s, i), borderColor: s.obrys || kolor(s, i),
      borderWidth: s.borderWidth ?? ((s.type || typ) === "line" ? 2 : 0), borderRadius: (s.type || typ) === "bar" ? 3 : 0 })) },
    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: "top" } }, ...opcje },
  }));
}

// sprawa 4 (Poprawki 3): dania specjalne strefy mają w każdej strefie własną nazwę (widok: nazwy_dan – tylko strefy lokali
// drużyny). strefa – nazwa w lokalu tej strefy; bez niej – nazwa w raportach firmy (strefa, gdy wszystkie lokale w jednej).
let NAZWY_DAN = { firma: {}, strefy: {} };
export const ustawNazwyDan = (n) => { NAZWY_DAN = n || { firma: {}, strefy: {} }; };
export const nazwaUslugi = (kat, u, strefa) => (strefa ? NAZWY_DAN.strefy?.[strefa]?.[u] : NAZWY_DAN.firma?.[u]) ?? kat.uslugi[u]?.nazwa ?? u;
export const nazwaOgolna = (kat, u) => kat.uslugi[u]?.nazwa ?? u;   // menu rywali – bez nazw stref
export const danieSpecjalne = (u) => u in (NAZWY_DAN.firma || {});
// od której rundy danie wolno dodać do menu: tydzień z harmonogramu gry (mistrz gry może go przesunąć), inaczej z danych
export const odRundyDania = (v, kat, u) => v.harmonogram?.[`danie_${u}`] ?? kat.uslugi[u]?.od_rundy ?? 1;
export const nazwaFirmy = (v, f) => v.marki?.[f]?.nazwa ?? v.rynek?.firmy?.[f] ?? f;

// kolory firm na mapie (bez zielonego i pomarańczowego – to Twój lokal i lokal wybrany w tej rundzie)
export const KOLORY_FIRM = ["#2d73d6", "#e5333f", "#9b51e0", "#f2b705", "#17a2b8", "#d63384", "#34495e", "#795548"];

// N12 (Poprawki 3): jeden stały kolor każdej drużyny w całej grze (mapa, karta wyników, ranking, wykresy porównawcze,
// panel MG) – kolor wybrany w rundzie 1 (marki), a bez wyboru – kolejny wolny kolor palety w kolejności firm w grze
export function kolorFirmy(v, f) {
  const wybrany = (n) => v.marki?.[n]?.kolor;
  if (wybrany(f)) return wybrany(f);
  const firmy = (v.gra?.firmy || []).map((x) => x.nazwa);
  const zajete = new Set(firmy.map(wybrany).filter(Boolean).map((k) => k.toLowerCase()));
  const wolne = KOLORY_FIRM.filter((k) => !zajete.has(k));
  const pula = wolne.length ? wolne : KOLORY_FIRM;
  return pula[Math.max(0, firmy.filter((n) => !wybrany(n)).indexOf(f)) % pula.length];
}

// seria wykresu jednej firmy: jej stały kolor; Twoja firma – grubsza linia albo obrys słupków i dopisek „(Ty)”
export function seriaFirmy(v, f, data, typ = "line") {
  const ja = f === v.firma;
  return { label: nazwaFirmy(v, f) + (ja ? " (Ty)" : ""), data, kolor: kolorFirmy(v, f),
    ...(ja ? (typ === "line" ? { borderWidth: 4 } : { borderWidth: 2, obrys: "#1b1b1b" }) : {}) };
}

// kolorowa kropka drużyny przed nazwą w tabelach (ten sam kolor co na mapie i wykresach)
export const kropkaFirmy = (v, f) => `<span class="kropka" style="background:${esc(kolorFirmy(v, f))}"></span> `;

// marka firmy (runda 1: nazwa, slogan, kolor, logo – api/prezentacja.py: marki); bez wybranego koloru – z palety
export function marka(v, f) {
  const m = v.marki?.[f] || {};
  return { nazwa: m.nazwa || f, slogan: m.slogan || "", logo: m.logo || "", kolor: kolorFirmy(v, f) };
}

// Opis dydaktyczny (P7): zwijana ramka „jak to działa naprawdę”; punkty to gotowy HTML (bez danych gracza).
export function lekcja(tytul, punkty) {
  return `<details class="lekcja"><summary>${esc(tytul)}</summary><ul>${punkty.map((p) => `<li>${p}</li>`).join("")}</ul></details>`;
}

// sprawa 21 (poprawki 2): karta „marki” jak w Ulotkach i radiu (UF14) – znak w kolorze, nazwa, rodzaj, opis i suma po prawej,
// w środku kafelki ofert. Style: .agencja/.kanal/.progi/.kalkulator w styl.css (kolor z --agencja).
// poprawki 3: znak = ikona marki/roli (ikony_marek.js), bez ikony – dwie litery jak dawniej
export const znakMarki = (nazwa) => {
  const ikona = ikonaMarki(nazwa);
  if (ikona) return ikona;
  const w = (String(nazwa).match(/„([^”]+)”/)?.[1] || String(nazwa)).split(/[\s-]+/).filter((x) => x.length > 1);
  return esc((w.length > 1 ? w[0][0] + w[1][0] : (w[0] || "?").slice(0, 2)).toUpperCase());
};
export function kartaMarki({ kolor, nazwa, rodzaj = "", opis = "", suma = "", tresc = "", znak = null }) {
  return `<section class="agencja" style="--agencja:${kolor || "var(--pom)"}">
    <div class="agencja-glowa"><span class="agencja-znak" aria-hidden="true">${ikonaMarki(nazwa) || (znak ?? znakMarki(nazwa))}</span>
      <div class="agencja-opis"><b>${esc(nazwa)}</b>${rodzaj ? ` <span class="pigulka">${esc(rodzaj)}</span>` : ""}
        ${opis ? `<p>${opis}</p>` : ""}</div>
      ${suma ? `<div class="agencja-suma">${suma}</div>` : ""}</div>${tresc}</section>`;
}
// kafelek oferty w karcie marki: tytuł, duża liczba z podpisem, potem dowolne wiersze
export const kafelOferty = ({ tytul, pigulka = "", duza, podpis = "", tresc = "", stopka = "", klasa = "" }) =>
  `<div class="kafel kanal ${klasa}"><div class="kg">${tytul}${pigulka ? ` <span class="pigulka inf">${pigulka}</span>` : ""}</div><div class="kt">
    <div class="kanal-cena"><b>${duza}</b><span>${podpis}</span></div>${tresc}</div>${stopka ? `<div class="kd">${stopka}</div>` : ""}</div>`;
// pasek „ile z ilu” (np. zamówienie do progu darmowego dowozu)
export const pasekDo = (ile, z, tekst) => `<div class="pasek-do" title="${esc(tekst)}"><span style="width:${Math.min(100, z > 0 ? (ile / z) * 100 : 100).toFixed(0)}%"></span></div>
  <div class="pasek-do-opis">${tekst}</div>`;
