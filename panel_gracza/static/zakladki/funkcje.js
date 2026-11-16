// Funkcje gry w panelu drużyny (seria „funkcje”, raporty/funkcje/plan.md: decyzje 3, 4, 7). Dane: v.funkcje
// (api/prezentacja.py: funkcje_widok). Zakryta funkcja – szara pozycja menu z okiem; kliknięcie otwiera okno
// z opisem i przyciskiem „Odsłoń” (zakładka nie otwiera się bez odsłonięcia). Wyłączona – bez pozycji w menu,
// linków, „Popraw” z listy błędów i budynków mapy. Gra bez funkcji (v.funkcje puste) – wszystko jak dawniej.
import { esc } from "./wspolne.js";
import { ikona } from "./ikony.js";

let ALIAS = {};   // dawny klucz zakładki → zakładka złożona (index.js podaje swoje ALIAS – bez cyklu importów)
export const ustawAliasy = (a) => { ALIAS = a || {}; };

/** Funkcja gry, do której należy zakładka `k` (także dawny klucz z ALIAS): {klucz, …} albo null (podstawa gry). */
export function funkcjaZakladki(v, k) {
  if (!k || !v?.funkcje) return null;
  const cel = ALIAS[k] || k;
  for (const [klucz, f] of Object.entries(v.funkcje)) {
    const z = f.zakladki || [];
    if (z.includes(cel) || z.includes(k)) return { klucz, ...f };
  }
  return null;
}
// zakryta i nieodsłonięta – gra robi ją za drużynę; bot (aktywna zawsze) i odsłonięta – zwykła zakładka
export const zakrytaFunkcja = (f) => !!f && f.stan === "zakryta" && !f.aktywna;
export const zakryta = (v, k) => zakrytaFunkcja(funkcjaZakladki(v, k));
export const wylaczona = (v, k) => funkcjaZakladki(v, k)?.stan === "wylaczona";
export const ukryta = (v, k) => zakryta(v, k) || wylaczona(v, k);
/** Klucze funkcji zakładek (bez powtórzeń, w kolejności zakładek). */
export const funkcjeZakladek = (v, lista) => [...new Set(lista.map((k) => funkcjaZakladki(v, k)?.klucz).filter(Boolean))];
/** Czy mistrz gry coś zakrył (menu ⚙ → Funkcje gry, notka w podglądzie mistrza gry). */
export const saZakryte = (v) => Object.values(v?.funkcje || {}).some((f) => f.stan === "zakryta");

/** Znaczek szarej pozycji (J9): liczba, gdy tekst zaczyna się od liczby, inaczej kropka; tekst – w dymku. */
export function znaczekFunkcji(v, klucze) {
  const teksty = klucze.map((k) => v.funkcje?.[k]).filter(zakrytaFunkcja).map((f) => f.znaczek).filter(Boolean);
  if (!teksty.length) return "";
  const n = teksty.length === 1 ? teksty[0].match(/^\d+/)?.[0] : String(teksty.length);
  return `<span class="znaczek funkcja ${n ? "" : "kropka"}" title="${esc(teksty.join(" · "))}">${n || ""}</span>`;
}

// jedna funkcja w oknie „Odsłoń”: co to, od której rundy, co gra robi teraz za drużynę
function opisFunkcji(v, k, f, przycisk) {
  const od = f.od_rundy && f.od_rundy > v.runda ? `<p class="fn-od">${ikona("klodka", 14)}Zakładki od rundy ${f.od_rundy}.</p>` : "";
  return `<div class="fn-opis">
    <div class="fn-glowa">${ikona(f.ikona, 26)}<div><b>${esc(f.nazwa)}</b><small>${esc(f.krotko)}</small></div>${przycisk}</div>
    <p>${esc(f.opis)}</p>${od}
    <p class="fn-teraz"><b>Teraz gra robi za Was:</b> ${esc(f.zakryta)}</p>
    ${f.znaczek ? `<p class="fn-znaczek">${esc(f.znaczek)}</p>` : ""}</div>`;
}

/** Okno zakrytych funkcji `klucze` (cała grupa menu – kilka funkcji, każda ze swoim „Odsłoń”); `cel` – zakładka po
 * odsłonięciu. Podgląd mistrza gry (`mg`): sam opis – odsłania drużyna (decyzja 7). Zwraca [tytuł, html, przyciski]. */
export function oknoFunkcji(v, klucze, cel, { mg = false } = {}) {
  const lista = klucze.filter((k) => zakrytaFunkcja(v.funkcje?.[k]));
  const jedna = lista.length === 1;
  const odslon = (k) => `<button class="btn pom" data-akcja="funkcja-odslon" data-f="${esc(k)}" data-cel="${esc(cel || "")}">Odsłoń</button>`;
  const html = lista.map((k) => opisFunkcji(v, k, v.funkcje[k], jedna || mg ? "" : odslon(k))).join("")
    + (mg ? `<p class="podpowiedz zostaw">Podgląd mistrza gry: tu drużyna widzi przycisk „Odsłoń”. Funkcję odsłania drużyna
      – w menu albo w ⚙ → Funkcje gry.</p>`
      : `<p class="podpowiedz zostaw">Po odsłonięciu decyzje w tej funkcji podejmujecie sami. Można ją znów zakryć w ⚙ → Funkcje gry.</p>`);
  const przyciski = mg ? `<button class="btn jasny" data-akcja="zamknij-okno">Zamknij</button>`
    : `${jedna ? odslon(lista[0]) : ""}<button class="btn jasny" data-akcja="zamknij-okno">Nie teraz</button>`;
  const tytul = jedna ? `${esc(v.funkcje[lista[0]].nazwa)} – funkcja zakryta` : "Funkcje zakryte";
  return [tytul, html, przyciski];
}

/** Okno ⚙ → Funkcje gry: zakryte przez mistrza gry funkcje z przełącznikiem odsłonięta/zakryta, wyłączone – informacja. */
export function oknoUstawienFunkcji(v, { mg = false } = {}) {
  const wpisy = Object.entries(v.funkcje || {});
  const wiersz = ([k, f]) => {
    // K2: znów zakryć nie zawsze można (np. Harpagon z niespłaconą pożyczką) – przycisk nieaktywny z wyjaśnieniem
    const odsl = f.odslonieta, blokada = odsl && f.zakrycie_zablokowane;
    const przel = (wartosc, napis) => `<button class="${odsl === wartosc ? "aktywny" : ""}"
      data-akcja="funkcja-przelacz" data-f="${esc(k)}" data-o="${wartosc ? 1 : 0}" aria-pressed="${odsl === wartosc}"${mg || (blokada && !wartosc) ? " disabled" : ""}${blokada && !wartosc ? ` title="${esc(blokada)}"` : ""}>${napis}</button>`;
    return `<div class="fn-wiersz">${ikona(f.ikona, 22)}<div class="fn-nazwa"><b>${esc(f.nazwa)}</b><small>${esc(f.krotko)}</small>${blokada ? `<small class="fn-blokada">${esc(blokada)}</small>` : ""}</div>
      <div class="fn-przelacznik" role="group" aria-label="${esc(f.nazwa)}">${przel(false, "Zakryta")}${przel(true, "Odsłonięta")}</div></div>`;
  };
  const zakryte = wpisy.filter(([, f]) => f.stan === "zakryta");
  const wyl = wpisy.filter(([, f]) => f.stan === "wylaczona").map(([, f]) => esc(f.nazwa));
  return `<p>Mistrz gry zakrył te funkcje na początek. Zakryta – gra robi ją za Was z bezpiecznymi ustawieniami;
      odsłonięta – decyzje podejmujecie sami.</p>
    <div class="fn-lista">${zakryte.map(wiersz).join("")}</div>
    <p class="podpowiedz zostaw">Ponowne zakrycie działa od tej rundy: gra znów robi funkcję za Was, a decyzje w niej nie zostaną wykonane.</p>
    ${wyl.length ? `<p class="podpowiedz zostaw">Wyłączone w tej grze (nie ma ich dla nikogo): ${wyl.join(", ")}.</p>` : ""}
    ${mg ? `<p class="podpowiedz zostaw">Podgląd mistrza gry – przełączać może tylko drużyna.</p>` : ""}`;
}

/** K1: ostrzeżenie przed ponownym zakryciem odsłoniętej funkcji `k` – co przepada (funkcje.yaml: zakrycie), pieniądze
 * nie wracają; „Zakryj” zakrywa, „Anuluj” wraca do ⚙ → Funkcje gry. Zwraca [tytuł, html, przyciski]. */
export function oknoZakryciaFunkcji(v, k) {
  const f = v.funkcje?.[k] || {};
  const html = `<div class="fn-opis">
    <div class="fn-glowa">${ikona(f.ikona, 26)}<div><b>${esc(f.nazwa)}</b><small>${esc(f.krotko)}</small></div></div>
    <p>Od tej rundy gra znów zrobi tę funkcję za Was, a Wasze decyzje w niej nie zostaną wykonane.</p>
    <p class="fn-teraz"><b>Co przepada:</b> ${f.zakrycie ? esc(f.zakrycie) : "nic – gra po prostu przejmuje funkcję."}</p>
    <p class="fn-znaczek">Zapłacone pieniądze nie wracają.</p>
    <p class="fn-od">Potem gra robi za Was: ${esc(f.zakryta)}</p></div>`;
  const przyciski = `<button class="btn czarny" data-akcja="funkcja-zakryj" data-f="${esc(k)}">Zakryj</button>
    <button class="btn jasny" data-akcja="funkcje-gry">Anuluj</button>`;
  return [`${esc(f.nazwa)} – zakryć znowu?`, html, przyciski];
}
