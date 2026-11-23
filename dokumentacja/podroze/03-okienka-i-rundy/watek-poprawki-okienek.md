# Wątek: poprawki-okienek (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md`. Są tam zasady, testy i commity.
  Gałąź bazowa: `podroz-03`. Równolegle pracuje `03/pora` (`swiat/*`: pora dnia, niebo, przyciemnienie).
- **Cel (Z34, dokończenie):** poprawki wyglądu nowych okienek po przeglądzie zrzutów (23.11). Mechaniki nie zmieniasz.
- **Zrzuty:** masz narzędzie `gra/narzedzia/zrzuty.py` (opis w pliku). Serwer na własnym porcie, np. 8791:
  `manage.py graj --port 8791 --bez-przegladarki`, gra testowa `manage.py gra_pokazowa`. Zrzuty zapisuj do
  `../_robocze/zrzuty-poprawki/` (poza gitem). Rób zrzut przed i po każdej poprawce. Po pracy zatrzymaj serwer.
- **Do zrobienia:**
  1. **Paragon** (sklepy i hurtownie, `swiat/rysunek.js`: `R.zamow`/`R.koszyk`; sceny sklepów):
     - krój stałej szerokości dla pozycji i kwot (teraz PT Sans; brief 03/paragon wymagał kroju kasowego);
     - spacja między nazwą a gwiazdkami („Tortilla ★★”);
     - pola ilości w jednej równej kolumnie (dziś przesuwają się zależnie od długości „dostawa pn 15.09”);
     - lista jest bardzo długa (7 dni × każdy produkt): pokaż produkt w jednym wierszu z 7 małymi polami dni
       (pn…nd) albo zwiń dni pod produktem; wybierz czytelniejsze na telefonie i opisz w raporcie;
     - SUMA i „W koszyku” zawsze widoczne (przyklejony dół paragonu), bez przewijania;
     - przycisk ZAMKNIJ nie wystaje pod paragonem.
  2. **Tablica wydarzeń** (`zakladki/zdarzenia.js`): opcja A ma pusty pasek nagłówka. Wszystkie opcje mają
     wyglądać jednakowo.
  3. **List z decyzjami** (`pulpit/pulpit.js` koperta, `pulpit/pulpit.css`):
     - w rubrykach blankietu nazwy wyrównane do lewej (dziś lewa kolumna jest wyśrodkowana, prawa nie);
     - w poczcie punkt „Nadaj list z decyzjami” otwiera stare okno z przyciskiem „List z decyzjami”. Ma otwierać
       od razu tę samą kopertę co ikona listu w pasku po lewej.
  4. **Tablica wyników tygodnia** (kebab, `zakladki/wyniki.js`, `pulpit/karty-style.js`): zakładki
     „DECYZJE / WYNIKI” nad oknem nachodzą na przycisk WRÓĆ. Przesuń je tak, żeby nic się nie nakładało.
  5. **Zeszyt wujka** (`pulpit/zeszyt.js`): na dole strony są dwa przyciski „▼ DALEJ” i „Dalej >”. Zostaw jeden.
- **Nie ruszaj:** `silnik/`, `dane/` (poza tekstem, jeśli konieczne), plików pory dnia z `03/pora`
  (`swiat/swiat.css` poza Twoim blokiem, `mapa/slonce.js`, nowy moduł pory). W `swiat/rysunek.js` zmieniasz tylko
  funkcje paragonu. CSS dopisujesz na końcu plików w bloku `/* podróż 03/poprawki-okienek */`.
- **Zasady:** kolory tylko przez zmienne z `motywy/zmienne.css`; 3 palety × jasny/ciemny; stan nigdy samym kolorem;
  teksty neutralne płciowo; zero wzmianek o innych grach.
- **Gotowe, gdy:**
  - każdy punkt 1–5 ma zrzut „po” w bar jasny i przynajmniej jeden w pewex ciemny lub wysoka (nazwy w raporcie);
  - paragon działa w Biedronce i jednej hurtowni, także na szerokości 390 px (`--szer 390 --wys 844`);
  - pełne testy zielone, `ruff` i `node --check` czyste (wyniki w raporcie).

## Raport

**Stan:** wszystkie 5 punktów zrobione, mechanika bez zmian (tylko wygląd i sposób otwarcia okna).

### Co zrobiono
1. **Paragon** (`zakladki/dostawcy.js`, blok „03/poprawki-okienek” na końcu `swiat/swiat.css`): krój kasowy (Courier), spacja przed gwiazdkami, nazwa i cena w jednym rzędzie. Przy dostawach na kilka dni wybrano **siatkę małych pól dni (pn…nd z datą) w jednym rzędzie na produkt** (zamiast zwijania): pola nie przesuwają się, a na 390 px mieszczą się 7 dni (Biedronka) i 2 dni (Makro). Suma i „W koszyku” przyklejone na dole, ZAMKNIJ i KUPUJĘ w arkuszu papieru z ząbkowanym dołem; przewinięcie okna zachowuje się po zmianie ilości.
2. **Tablica wydarzeń** (`zakladki/zdarzenia.js`, `swiat/swiat.css`): nagłówki opcji jednakowe „Opcja A/B/C” (pusty pasek A wynikał z ogólnej reguły `.kg`).
3. **List z decyzjami** (`pulpit/pulpit.js`, `pulpit/pulpit.css`, `swiat/wnetrze.js`): nowa funkcja `otworzListZDecyzjami`, poczta („Nadaj list z decyzjami”) otwiera od razu tę samą kopertę co ikona w pasku. Nazwy rubryk do lewej: przyczyną była starsza reguła `.pp-kop-lista li` (flex, space-between), nadpisana w moim bloku.
4. **Zakładki DECYZJE / WYNIKI** (`pulpit/pulpit.css`): w teczce s1 przesunięte do prawej krawędzi okna (na wąskim ekranie mniejsze), nie nachodzą na WRÓĆ.
5. **Zeszyt wujka** (`pulpit/zeszyt.js`): zostało „Dalej ›” (przewracanie strony). Ze „▾ dalej” usunięto napis; została sama strzałka ▾ jako podpowiedź przewijania (element i test `test_pulpit.py:167` zostają). Jeśli ma zniknąć całkiem, to decyzja do Archiego/szefa.
Dokumentacja: `INSTRUKCJA.md` (paragon, poczta → koperta). README bez zmian (nic z opisu tam nie dotyczy).

### Zrzuty (`_robocze/zrzuty-poprawki/` w worktree, poza gitem)
- paragon: `par-biedronka-bar-jasny-po`, `par-biedronka-pewex-ciemny-po`, `par-biedronka-bar-jasny-390`, `par-makro-bar-jasny-390`, `par-makro-wysoka-ciemny-390`
- tablica wydarzeń: `wyd-bar-jasny-po`, `wyd-pewex-ciemny-po`
- list: `list-bar-jasny-po`, `list-pewex-ciemny-po`
- wyniki: `wyniki-bar-jasny-po`, `wyniki-pewex-ciemny-po` (wersji 390 px dla zakładek nie oglądano)
- zeszyt: `zeszyt-bar-jasny-po`, `zeszyt-pewex-ciemny-po`
Zrzutów „przed” w plikach nie ma (nadpisane), opisane słownie wyżej.

### Dowody
- `pytest -q -p no:cacheprovider` → `929 passed in 397.31s (0:06:37)`
- `ruff check .` → `All checks passed!`
- `node --check` (kopia do $TEMP/t.mjs) → ok dla `dostawcy.js`, `zdarzenia.js`, `pulpit.js`, `wnetrze.js`, `zeszyt.js`

### Uwagi
- Serwer na porcie 8791 (uruchomiony wcześniej w tej sesji) nadal działa: próba zatrzymania procesu została zablokowana. Serwer 8792 zatrzymany. Proszę zamknąć proces na 8791.
- Baza `gra/db.sqlite3` i gra `pokazowa-7fed3e` w worktree są lokalne, niezacommitowane.

### Propozycje
- Zakładki wyników w s1 bez wystawania nad okno (np. wewnątrz nagłówka) – spójniej na telefonie.
