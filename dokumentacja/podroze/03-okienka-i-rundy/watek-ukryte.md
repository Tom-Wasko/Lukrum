# Wątek: ukryte (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md` (zasady, testy, commity) oraz
  `dokumentacja/wiedza/analizy/ukryte-mechaniki.md` (spis z wątku 03/tlok). Gałąź bazowa: `podroz-03`.
  Równolegle pracują: `03/wyglad` (tylko CSS na końcach plików, blok `/* podróż 03/wyglad */`), `03/kartki`
  (`pulpit/zeszyt.js`, `pulpit/pulpit.css` część zeszytu), `03/lekcja` (`panel_mg/`, `dane/funkcje.yaml: zestawy`,
  `balans/`, narzędzie pomiaru).
- **Cel (Z42, decyzja szefa 23.11):** majster zgłosił, że część mechanik jest „ukryta”. Zasada: każdy skutek, który
  zmienia wynik gracza, ma być widoczny tam, gdzie gracz o nim decyduje albo gdzie widzi wynik. Pokaż w grze wiersze
  **3–13** spisu (wiersze 1–2 są zrobione). Wiersze 8 i 11 najpierw sprawdź: jeśli już widać, wpisz „OK, widać w …”.
- **Jak:**
  - Mechaniki się **nie zmieniają** (żadnych nowych liczb ani wzorów). Zmienia się tylko pokazanie: krótkie zdanie,
    wiersz w tabeli albo podpowiedź przy decyzji, z kierunkiem ▲▼ i słowem (stan nigdy samym kolorem).
  - Liczby, które pokazujesz, bierz z wyniku silnika przez `api/prezentacja.py` (widok `v`); w JS nie licz wzorów
    od nowa. Jeśli silnik czegoś nie zapisuje (np. ilu gości odeszło przez brak składnika), dodaj zapis w wyniku
    rundy bez zmiany obliczeń i test, że liczba się zgadza.
  - Teksty proste, dla ucznia, neutralne płciowo, bez żargonu (np. „Mało opinii: ocena jeszcze słabo przyciąga gości”).
    Przy każdej podpowiedzi jedno zdanie „dlaczego”.
  - Po każdym wierszu dopisz w spisie kolumnę „Pokazane: gdzie (plik/ekran)”.
- **Nie ruszaj:** `pulpit/zeszyt.js`, `panel_mg/`, `dane/funkcje.yaml`, wartości w `dane/*.yaml`, bloków CSS innych wątków.
- **Zrzuty:** `gra/narzedzia/zrzuty.py` (opis w pliku), serwer na porcie 8796, zrzuty do `../_robocze/zrzuty-ukryte/`
  (poza gitem); po pracy zatrzymaj serwer. Każde nowe miejsce: bar jasny + wysoka ciemna.
- **Gotowe, gdy:** wiersze 3–13 mają w spisie „Pokazane” albo „OK, już widać”; testy nowych pól z `prezentacja.py`;
  notatka `dokumentacja/funkcje/Widoczne-skutki.md` z szablonu; INSTRUKCJA (krótko, gdzie gracz widzi skutki);
  pełne testy zielone, `ruff`, `node --check`, `silnik.dane sprawdz` czyste (wyniki w raporcie).

## Raport
