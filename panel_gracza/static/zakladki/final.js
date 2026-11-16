// Finał sezonu (fable-final, 16.11.2026): po zakończeniu gry Plan tygodnia otwiera podium ligi, miejsce drużyny,
// jej najlepszy tydzień i ostatni list od wujka. Same dane, które gra już liczy (ranking, karta skumulowana, historia).
import { esc, licz, nazwaFirmy, nazwaRundy } from "./wspolne.js";
import { wczytajGrafiki } from "../swiat/swiat.js";

const pkt = (x) => (x == null ? "–" : licz(Math.round(x)));

export function finalHtml(v) {
  const R = v.ranking;
  if (!v.gra.zakonczona || !R?.rundy?.length) return "";
  const ost = R.miejsca[R.rundy[R.rundy.length - 1]], skum = v.karta_skumulowana || {};
  const firmy = Object.keys(ost).sort((a, b) => ost[a] - ost[b]);
  const moje = ost[v.firma], ile = firmy.length;
  const stopien = (m) => {
    const f = firmy[m - 1];
    if (!f) return "";
    return `<li class="fn-m${m} ${f === v.firma ? "ja" : ""}"><span class="fn-nazwa">${esc(nazwaFirmy(v, f))}${f === v.firma ? " (Wy)" : ""}</span>
      <span class="fn-pkt">${pkt(skum[f]?.punkty)} pkt</span><span class="fn-blok" aria-label="miejsce ${m}">${m}</span></li>`;
  };
  // najlepszy tydzień drużyny wg punktów karty wyników
  const hist = (v.historia || []).filter((h) => h.karta?.punkty != null);
  const naj = hist.reduce((a, h) => (!a || h.karta.punkty > a.karta.punkty ? h : a), null);
  const tytul = moje === 1 ? "Mistrzostwo ligi kebabów!" : moje && moje <= 3 ? `Podium! ${moje}. miejsce w lidze kebabów` : moje ? `Koniec sezonu: ${moje}. miejsce na ${ile}` : "Koniec sezonu";
  const list = moje === 1 ? "Mówiłem, że w tej rodzinie umie się karmić ludzi. Nie zmarnowaliście ani lokalu, ani nazwiska. Teraz najtrudniejsze: nie spocząć."
    : moje && moje <= Math.ceil(ile / 2) ? "Dobry sezon. Lokal stoi, ludzie wracają, rachunki się zgadzają. Za moich czasów to już był sukces. Zobaczcie, co zrobili ci przed Wami, i za rok ich wyprzedźcie."
      : "Nie wyszło tak, jak chcieliście, ale lokal żyje, a Wy wiecie dziś więcej niż we wrześniu. Sprawdźcie w „Kurierze”, gdzie uciekły punkty. Ja pierwszego sezonu też nie wygrałem.";
  wczytajGrafiki();
  return `<section class="fn" aria-label="Finał sezonu"><div class="fn-glowa"><p>Koniec sezonu · ${v.gra.liczba_rund} tygodni</p><h2>${esc(tytul)}</h2></div>
    <div class="fn-uklad"><ol class="fn-podium">${stopien(2)}${stopien(1)}${stopien(3)}</ol>
      <div class="fn-bok">
        <dl class="fn-liczby"><div><dt>Wasz wynik gry</dt><dd>${pkt(skum[v.firma]?.punkty)} pkt</dd></div>
          <div><dt>Miejsce</dt><dd>${moje ?? "–"} z ${ile}</dd></div>
          ${naj ? `<div><dt>Najlepszy tydzień</dt><dd>${esc(nazwaRundy(naj.runda))}: ${pkt(naj.karta.punkty)} pkt</dd></div>` : ""}</dl>
        <div class="lw-kartka"><svg class="lw-portret" viewBox="0 0 64 80" aria-hidden="true"><use href="#g-wnetrze-portret-wujka" width="64" height="80"/></svg>
          <div><p class="lw-naglowek">Ostatni list od wujka</p><p>${esc(list)}</p><p class="lw-podpis">Wasz wujek</p></div></div>
        <p><a class="btn czarny" data-zakladka-k="ranking" href="#ranking">Pełna tabela ligowa</a> <a class="btn jasny" data-zakladka-k="karta_wynikow" href="#karta_wynikow">Skąd wzięły się punkty</a></p>
      </div></div></section>`;
}
