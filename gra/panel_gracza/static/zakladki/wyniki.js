// Wyniki tygodnia (podróż 03/wyniki, Z36): jeden prosty ekran z czterema liczbami ostatniego tygodnia: sprzedaż, koszty, zysk
// i miejsce w rankingu. Każda liczba ma znak ▲/▼ względem tygodnia wcześniej (nigdy sam kolor). Dane: v.wyniki_tygodnia
// (api/prezentacja.py: wyniki_tygodnia). Szczegóły są dalej: Kasa (raport) i Kurier rankingowy.
import { esc, strzalka, zl } from "./wspolne.js";

/** Cztery kafle ekranu: [{ klucz, etykieta, wartosc (tekst), delta (HTML ze znakiem), ton, opis }]. */
export function kafleWynikow(W) {
  if (!W) return [];
  const t = W.teraz || {}, p = W.przed || {};
  const kasa = (klucz, etykieta, lepiej, opis) => ({ klucz, etykieta, wartosc: t[klucz] == null ? "–" : zl(t[klucz]),
    delta: strzalka(t[klucz], p[klucz], { lepiej, format: zl, prog: 0.5 }), opis,
    ton: klucz === "zysk" && t.zysk != null ? (t.zysk >= 0 ? "plus" : "minus") : "" });
  // miejsce: mniejsza liczba jest lepsza, więc strzałka ▲ oznacza awans (jak w rankingu)
  const m = W.miejsce, mp = W.miejsce_przed;
  const zmiana = m == null || mp == null ? "" : m === mp ? `<span class="delta rowno" title="Tydzień wcześniej: ${mp}. miejsce">= bez zmian</span>`
    : `<span class="delta ${m < mp ? "plus" : "minus"}" title="Tydzień wcześniej: ${mp}. miejsce">${m < mp ? "▲ awans o" : "▼ spadek o"} ${Math.abs(m - mp)}</span>`;
  return [kasa("sprzedaz", "Sprzedaż", 1, "Tyle wpłynęło za sprzedane dania."), kasa("koszty", "Koszty", -1, "Towar, pensje, czynsz i reszta wydatków."),
    kasa("zysk", "Zysk", 1, "Sprzedaż minus koszty i podatek."),
    { klucz: "miejsce", etykieta: "Miejsce w rankingu", wartosc: m == null ? "–" : `${m}. z ${W.liczba_firm}`, delta: zmiana,
      opis: m == null ? "Ranking pojawi się, gdy przeliczy się więcej tygodni." : "Miejsce wśród wszystkich drużyn." }];
}

const kafel = (k) => `<div class="wt-kafel wt-${k.klucz} ${k.ton || ""}"><span class="wt-etykieta">${esc(k.etykieta)}</span>
  <b class="wt-liczba">${esc(k.wartosc)}</b><span class="wt-zmiana">${k.delta || ""}</span><span class="wt-opis">${esc(k.opis)}</span></div>`;

export const wyniki_tygodnia = {
  tytul: "Wyniki tygodnia", tytulPelny: "Tablica wyników – tydzień w czterech liczbach", ikona: "wykres", odblokowanie: () => true,
  info: () => "Cztery liczby z ostatniego tygodnia: sprzedaż, koszty, zysk i miejsce w rankingu. Znak ▲ znaczy lepiej niż tydzień wcześniej, ▼ gorzej.",
  wyniki({ v }) {
    const W = v.wyniki_tygodnia;
    if (!W) {
      return `<div class="wt-pusty"><b>Wyniki pojawią się po pierwszym tygodniu.</b>
        <p>Teraz jest pierwszy tydzień: ułóżcie menu, zatrudnijcie ludzi i wyślijcie decyzje. Gdy mistrz gry zamknie rundę,
        zobaczycie tu sprzedaż, koszty, zysk i miejsce w rankingu.</p></div>`;
    }
    const k = kafleWynikow(W);
    return `<p class="wt-tydzien">Za: <b>${esc(W.tydzien)}</b></p><div class="wt-siatka">${k.map(kafel).join("")}</div>
      <p class="podpowiedz">Szczegóły: <a href="#raport" data-zakladka-k="raport">wyniki finansowe w Kasie</a>${v.runda >= 3
    ? ` oraz <a href="#ranking" data-zakladka-k="ranking">ranking drużyn</a>` : ""}.</p>`;
  },
};
