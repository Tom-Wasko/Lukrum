# Wątek: paragon (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md`. Są tam zasady, makiety, testy i commity.
- **Cel:** okienko zakupów w sklepach i hurtowniach wygląda jak paragon kasowy (Z34, wariant A). Po zakupie ten sam
  format paragonu potwierdza, co kupiono.
- **Ustalone:**
  - Po wątku 02/sklepy każdy sklep ma własną teczkę z filtrem `dostawca` i działem:
    `swiat/rysunek.js` (`R.zamow`, `R.koszyk`) i `zakladki/dostawcy.js`.
  - Hurtownia sprzętu jest w `zakladki/inwestycje.js`.
  - Logika zamówień (decyzja `zamowienia`) zostaje bez zmian. Zmieniasz wygląd i układ okienka.
- **Decyzje szefa (`dokumentacja/Decyzje.md`, 22.11):**
  - Zakupy to **wariant A (paragon kasowy)**.
  - Majster dodał: „też format paragonu”:
    - pozycje w kolumnie jak na paragonie (nazwa, ilość × cena, kwota);
    - suma na dole;
    - data i nazwa sklepu w nagłówku;
    - krój o stałej szerokości.
  - Okienko pokazuje tylko ofertę tego sklepu i działu. Widać w nim, co jest już w koszyku i co już kupione w tej rundzie.
  - Bez porównań z innymi sklepami.
- **Pliki do zmiany:**
  - `swiat/rysunek.js` (części zakupowe), `zakladki/dostawcy.js`, `zakladki/inwestycje.js`;
  - sceny sklepów i hurtowni w `swiat/sceny/`: biedronka, lidl, auchan, stokrotka, makro, selgros, eurocash, bazar,
    piekarnia, sprzet_gastro, park_handlowy;
  - style sklepu;
  - testy w `gra/testy/swiat` i `gra/testy/aplikacja`.
- **Nie ruszaj:**
  - `zakladki/zdarzenia.js`, `swiat/sceny/park.js`, `swiat/sceny/poczta.js`;
  - `pulpit/*`, `zakladki/wujek.js`, `mapa/*`, `swiat/sceny/zana_*`;
  - sceny kebaba (lada, rożen), poza samym okienkiem zakupu.
- **Gotowe, gdy:**
  - Każdy sklep i hurtownia otwiera paragon ze swoją ofertą.
  - Dodawanie i usuwanie pozycji działa.
  - Po zakupie pokazuje się paragon potwierdzenia.
  - Wygląd działa w 3 paletach, każda w trybie jasnym i ciemnym.
  - Pełne testy są zielone.
- **Dokumenty:** README i INSTRUKCJA, jeśli opisują zakupy.

## Raport
**Zrobione** (commit 065eb26 + poprawka INSTRUKCJI):
- `zakladki/dostawcy.js`: `oknoSklepu` przebudowane na paragon (nagłówek LUKRUM, sklep, dział, data; pozycje nazwa ★ / ilość × cena / kwota; wiersz na dzień dostawy; ✓ przy pozycji w koszyku; „w magazynie”; SUMA PLN; próg minimum/dowozu tekstem ✓/!). Logika `zamowienia` bez zmian.
- Nowy przycisk „Kupuję · suma” → paragon potwierdzenia (tylko do odczytu, „Wróć do sklepu” / „Gotowe”). Obsługa przez `data-par` na oknie, bez nowych akcji globalnych.
- `zakladki/inwestycje.js`: `oknoSprzetu` (hurtownia sprzętu, kupno i komis) jako paragon, suma kupna/odsprzedaży.
- Sceny sklepów nie wymagały zmian (wszystkie otwierają `otworzSklep` przez teczki `R.zamow`/`R.koszyk`).
- Style: blok `podróż 03/paragon` na końcu `swiat/swiat.css`; baza `.pp-paragon` z pulpit.css (tylko użyta, nie zmieniana). Kolory tylko `--g-biel`/`--g-czern`.
- Test: `zakladki_zachowanie.mjs` + `test_wnetrza_sceny.py` (paragon oferty i potwierdzenia).
- INSTRUKCJA: wiersz „Hurtownie i sklepy”. README bez opisu zakupów, bez zmian. Notatki `funkcje/Paragon.md` nie pisałem (nie ma szablonu w folderze podróży do sprawdzenia) – do rozważenia.

**Dowód:** `pytest -q` (cały) → `899 passed in 368.48s`; `ruff check .` → `All checks passed!`; `node --check` dostawcy.js, inwestycje.js → OK.

**Nie zrobione / do uwagi:**
- Zrzutów ekranu (3 palety × jasny/ciemny) brak: w środowisku nie ma playwright ani przeglądarki sterowanej z CLI. Wygląd oparty na kolorach papieru paragonu (`--g-biel`/`--g-czern`), jak istniejący paragon na pulpicie; wymaga oka szefa.
- Okno hurtowni sprzętu nie ma testu Node (złożone dane stanowisk); sprawdzone tylko składniowo.
- „Co już kupione w tej rundzie” zinterpretowałem jako pozycje w koszyku (✓), bo zamówienia są zapisywane w decyzjach bieżącej rundy; osobnej historii zakupów nie ma.

**Propozycja:** notatka `dokumentacja/funkcje/Paragon.md`.
