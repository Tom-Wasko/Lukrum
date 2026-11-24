# Wątek: wujek (podróż 04)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/funkcje/dymki-przy-ladzie.md`, `gra/silnik/wnetrza/dymki.py` (okazje wujka,
  `PIERWSZENSTWO_OKAZJI`), `gra/dane/wnetrza/dymki.yaml` (wpisy `kto: wujek`), scena kebabu i rysowanie bywalców
  (`swiat/sceny.js`, `swiat/wnetrze.js`, `swiat/rysunek.js`), `dokumentacja/Decyzje.md` (zeszyt wujka, 16.11).
  Gałąź bazowa: `main`. Równolegle: `04/prawo` (INSTRUKCJA, README, strona `/zrodla`) i `04/wnetrza` (tylko zrzuty).
- **Cel (Z13, szef 24.11):**
  1. **Postać przy ladzie:** w rundzie, w której wujek ma okazję, stoi narysowany przy ladzie w kebabie (te same
     cegiełki i warstwy co bywalcy, rozpoznawalny, np. kaszkiet i wąs; bez kopiowania cudzych postaci) i mówi swój
     dymek. W pozostałych rundach go nie ma.
  2. **Więcej okazji** (dziś 4: start, pierwsza_strata, rekord, ostatnia_runda). Dodaj: pierwszy kredyt, kontrola
     sanepidu, pierwsza filia, debet, wyraźny spadek nastroju zespołu, koniec półrocza (połowa liczby rund). Użyj
     tylko wskaźników, które silnik już liczy. Okazję, której nie da się wykryć bez nowej mechaniki, pomiń i opisz
     w raporcie. Progi (np. „wyraźny spadek”) w danych, nie w kodzie.
  3. **3 kwestie na każdą okazję** (losowane jak dziś). Wujek mówi najwyżej raz na rundę; ustal pierwszeństwo
     wszystkich okazji (dane albo stała) i pokryj testem.
- **Teksty:** ciepłe, krótkie, ton wujka jak w zeszycie; bez pojęć z WOS (decyzja 16.11); neutralne płciowo wobec
  gracza; bez prawdziwych marek; zero wzmianek o innych grach.
- **Nie ruszaj:** `INSTRUKCJA.md`, `README.md` (robi je `04/prawo`; opis dla instrukcji daj w raporcie, wpisze go
  Archi), mechaniki poza wykrywaniem okazji, `dane/zeszyt.yaml`.
- **Testy:** każda okazja wykrywana w swojej rundzie; po 3 kwestie; najwyżej 1 dymek wujka na rundę; postać widoczna
  tylko w rundzie okazji (test widoku albo API sceny).
- **Zrzuty:** port 8786, `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-wujek/`: kebab z wujkiem (bar jasny, wysoka
  ciemny, 1366×768). Po pracy zatrzymaj serwer (jeśli zablokowane, napisz w raporcie).
- **Gotowe, gdy:** jak wyżej; notatka `dokumentacja/funkcje/Wujek-przy-ladzie.md` z szablonu; pełne testy zielone,
  `ruff`, `node --check`, `silnik.dane sprawdz` (wyniki w raporcie).
- **Archi:** archi-lukrum.

## Raport
