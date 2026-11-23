# Wątek: zestawy (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md` (zasady, testy, commity),
  `gra/dokumentacja/SCENARIUSZE_LEKCJI.md`, `dokumentacja/wiedza/analizy/czas-lekcji.md` (wątek 03/lekcja).
  Gałąź bazowa: `podroz-03`. Równolegle pracuje `03/przewodnik` (tylko dokumenty, nie kod).
- **Cel (Z46, decyzja szefa 23.11):** nauczyciel w `/mg/` między rundami przełącza **zestaw funkcji tej samej gry**
  (np. z `lekcja_1_…` na `lekcja_2_…`), więc klasa gra dalej tymi samymi firmami, a z lekcji na lekcję dochodzą funkcje.
  Termin testu na klasie: 07.12 (3–4 drużyny).
- **Jak:**
  - Dziś stan funkcji ustala się przy tworzeniu gry (`silnik/funkcje.py: stany_zestawu`, kreator `panel_mg/widoki.py`).
    Dodaj zmianę stanów w trakcie gry: funkcja w silniku (bez liczb w kodzie) + widok/akcja w panelu MG dostępna tylko
    między rundami (gdy runda nie jest w trakcie liczenia).
  - Zasada: przełączenie **tylko odsłania** funkcje (zakryta/wyłączona → odkryta); funkcji już odkrytych nie chowa
    (gracze mogli już podjąć decyzje). Jeśli nowy zestaw miałby coś schować, pokaż MG ostrzeżenie i zostaw odkryte.
  - Odsłonięte funkcje zapowiada istniejąca ramka „Od tego tygodnia otwarte” w zeszycie (wątek 03/odblokowania);
    sprawdź, że pojawia się po przełączeniu.
  - W `/mg/` przy grze: wybór zestawu (lista z `dane/funkcje.yaml: zestawy`, z opisem dla nauczyciela) i przycisk
    „Zmień zestaw od następnej rundy”, z potwierdzeniem. Wygląd zgodny z resztą panelu MG, 3 palety × jasny/ciemny.
- **Testy:** gra założona z `lekcja_1`, 2 rundy bota, przełączenie na `lekcja_2`, kolejne 2 rundy bez błędu; nowe funkcje
  odkryte, stare nadal odkryte; przełączenie w trakcie liczenia odrzucone; widok MG pokazuje aktualny zestaw.
- **Nie ruszaj:** wartości w `dane/*.yaml` (poza ewentualnym opisem zestawów), `pulpit/zeszyt.js` poza koniecznym.
- **Zrzuty:** `gra/narzedzia/zrzuty.py`, serwer na porcie 8799, zrzuty do `../_robocze/zrzuty-zestawy/`; po pracy zatrzymaj
  serwer. Pokaż panel MG z wyborem zestawu (bar jasny 1366×768, wysoka ciemna) i zeszyt gracza po przełączeniu.
- **Pamięć:** komputer ma mało pamięci przy kilku wyko; jeden serwer naraz, pełne testy raz na koniec.
- **Gotowe, gdy:** testy jak wyżej; INSTRUKCJA („Dla mistrza gry”) i `SCENARIUSZE_LEKCJI.md` mówią, jak przejść do
  następnej lekcji w tej samej grze; notatka `dokumentacja/funkcje/Zestawy-lekcji.md` z szablonu; pełne testy zielone,
  `ruff`, `node --check`, `silnik.dane sprawdz` czyste (wyniki w raporcie).

## Raport
