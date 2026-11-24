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
**Gałąź:** `worktree-podroz-04-wujek` (2 commity: bb9b56a okazje + kwestie + testy, 4f8905a notatka). Bez pusha.

**Co zrobione**
1. **Postać przy ladzie:** już była w kodzie (`sceny.js`: rysowana tylko gdy `d.wujek`, czyli w rundzie okazji; `postacie/wujek.svg`
   z tych samych cegiełek co bywalcy: kaszkiet, wąs, kamizelka, gazeta). Nic nie zmieniałem w JS. Dodałem test API
   (`test_wujek_tylko_w_rundzie_okazji`). Zrzuty w `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-wujek/`.
2. **Okazje: 10 (było 4).** Nowe: `pierwszy_kredyt` (nowe kredyty w poprzedniej rundzie, a wcześniej żadnych, z `bank.poczatek.nowe_kredyty`),
   `kontrola_sanepidu` (`urzad.kontrola.kontrola`), `pierwsza_filia` (drugi lokal z `od_rundy` = poprzednia runda), `debet` (wejście w debet,
   nie każdy kolejny tydzień), `spadek_nastroju` (średni nastrój załogi spadł o ≥ progu), `koniec_polrocza` (runda `liczba_rund//2 + 1`,
   tylko gdy gra ma ≥ 4 rund). Wszystko ze wskaźników, które silnik już liczy. Nic pominięte.
3. **Progi w danych:** `dane/wnetrza/silnik.yaml: okazje` (`spadek_nastroju: 10` pkt na skali 0–100, `polrocze_min_rund: 4`); schemat w `schematy.py`.
4. **30 kwestii** (po 3 na okazję) w `dane/wnetrza/dymki.yaml`, losowane jak dotąd; ton jak w zeszycie, bez WOS.
5. **Pierwszeństwo** (stała `OKAZJE` w `schematy.py`, używa jej `dymki.py`): ostatnia_runda, koniec_polrocza, pierwsza_strata, debet, kontrola_sanepidu,
   pierwszy_kredyt, pierwsza_filia, spadek_nastroju, rekord, start. Wujek mówi najwyżej raz na rundę. `sprawdz` wymaga dymku na każdą okazję.
6. Notatka `dokumentacja/funkcje/Wujek-przy-ladzie.md`.

**Dowody**
- `pytest -q -p no:cacheprovider` (pełne, gra/) → `1007 passed in 437.77s (0:07:17)`
- `ruff check .` → `All checks passed!`
- `silnik.dane sprawdz` → `Dane w porządku: ... (wersja 4a5d79194971).`
- `node --check`: pominięte, nie zmieniałem żadnego JS.
- Nowe testy: `testy/wnetrza/test_wnetrza_okazje.py` (11: każda okazja w swojej rundzie, próg z danych, pierwszeństwo wszystkich 10, 3 kwestie na okazję
  i wszystkie wypadają, najwyżej 1 dymek wujka), plus API w `test_wnetrza_api.py`. Zmieniłem też dane testowe `testy/wnetrza/dane_testowe/{dymki,silnik}.yaml`.
- Zrzuty 1366×768: `wujek-bar-jasny.png`, `wujek-wysoka-ciemny.png` (gra pokazowa, runda 4 z 6 = koniec półrocza). Serwer 8786 zatrzymany.

**Uwagi**
- Na zrzucie wujka częściowo zasłania „Zeszyt wujka” (prawy dolny róg przy 1366×768): widać głowę w kaszkiecie, nogi pod zeszytem. To układ zeszytu, nie ruszałem. Może do wątku wyglądu.
- W rundzie 1 (okazja `start`) drużyna nie ma jeszcze lokalu, więc wujka przy ladzie w kebabie widać dopiero od rundy z lokalem.
- Zakres: `debet` jest tylko przy wejściu w debet; jeśli szef woli przy każdym tygodniu na minusie, to zmiana jednego warunku.

**Opis dla instrukcji (wpisze Archi):** „Wujek zagląda do kebabu tylko w ważnych momentach: pierwszy tydzień, pierwsza strata, rekord, pierwszy kredyt, debet, kontrola sanepidu, drugi lokal, spadek nastroju załogi, połowa gry i ostatni tydzień. Staje przy ladzie i mówi jedno zdanie, a gdy okazji jest kilka, wybiera najważniejszą.”

**Propozycje:** zeszyt wujka warto przesunąć albo zwinąć, gdy w kebabie stoi wujek.
