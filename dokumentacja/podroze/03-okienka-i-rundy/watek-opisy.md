# Wątek: opisy (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md`. Są tam zasady, testy i commity.
  Wątki paragon, wydarzenia, list, zeszyt i wyniki są już scalone. Równolegle pracują `03/rundy` i `03/wydajnosc`.
- **Cel:**
  - Z16: opisy w grze pasują do obecnych mechanik.
  - Z25: dokumentacja gry jest aktualna.
- **Z16: opisy w grze.** Gra przeszła z zakładek na mapę, wnętrza i okienka. Teksty dla gracza wciąż mówią o
  „zakładkach”, „HR” i ekranach, których już nie ma, albo opisują stare zasady. Przejrzyj:
  - teksty w `dane/*.yaml` (opisy, podpowiedzi, `opis` budynków; bez zmiany liczb);
  - podpowiedzi i etykiety w `panel_gracza/static/`;
  - `gra/INSTRUKCJA.md` i stronę `/jak-grac`.
  Popraw tak, żeby gracz wiedział, **gdzie na mapie i w którym wnętrzu** coś zrobić. Teksty mają być proste,
  neutralne płciowo i bez żargonu.
- **Z25: dokumentacja.**
  - `gra/dokumentacja/OPIS_GRY.md`: zakładki, kwota 40 000 zł i inne nieaktualne rzeczy. Sprawdzaj w danych i w kodzie.
  - `gra/dokumentacja/STACK.md`: testy, motywy, `swiat/`, `mapa/`.
  - Martwe odsyłacze w `gra/` i `dokumentacja/`. Sprawdź je skryptem i wypisz w raporcie, co poprawione.
- **Nie ruszaj:**
  - `dane/zeszyt.yaml`, `pulpit/zeszyt*.js` i `silnik/`, bo pracuje tam `03/rundy`;
  - szablonów HTML, bo pracuje tam `03/wydajnosc`;
  - `dokumentacja/historia/`, `dokumentacja/podroze/` i `Decyzje.md`, bo to zapis historii.
- **Zasady:**
  - Nie zmieniasz liczb ani mechaniki. Tam, gdzie tekst i kod się nie zgadzają, poprawiasz tekst, a w raporcie
    zapisujesz miejsca, w których może się mylić kod.
  - Zero wzmianek o innych grach biznesowych.
  - Po każdej zmianie w `dane/` uruchom `python -X utf8 -m silnik.dane sprawdz`.
- **Gotowe, gdy:**
  - `grep -rn "zakładk" gra/dane gra/panel_gracza/static gra/INSTRUKCJA.md` nie znajduje tekstów dla gracza, które
    odsyłają do zakładek. Komentarze w kodzie mogą zostać.
  - OPIS_GRY i STACK zgadzają się z kodem.
  - Martwych odsyłaczy jest 0. Pokaż wynik skryptu.
  - PDF instrukcji jest odświeżony, jeśli repo ma do tego polecenie (sprawdź README).
  - Pełne testy są zielone.
- **Zrzuty ekranu:** nie.

## Raport

**Stan: gotowe** (gałąź `worktree-podroz-03-opisy`, 4 commity).

### Co zrobiono
- **Z16 – teksty dla gracza:** „zakładka” zastąpione nazwą miejsca/wnętrza w `dane/mapa/budynki.yaml` (też usunięte odsyłacze do plików yaml), `app.js`, `api/prezentacja.py` i ekranach `zakladki/{funkcje,czas,finanse,klienci,lekcje,mapa,dostawcy,hr,kasyno,oferta,przejecia,swiezosc,podatki,rynek_pracy}.js`. `INSTRUKCJA.md` była już aktualna (poprawione jedno zdanie, rozdz. o miejscach). Sekcje o panelu MG zostają z „zakładką”, bo panel MG ma prawdziwe zakładki.
- **Z25:** `OPIS_GRY.md` (przebieg rundy po mapie i wnętrzach, wygląd, testy) i `STACK.md` (motywy/palety, swiat/, mapa/, pulpit, liczba testów, czas pełnego przebiegu) zgodne z kodem. Martwe odsyłacze naprawione w `STACK.md`, `Plan.md`, `METODA.md`, `wiedza/analizy/{README,sprawozdanie-zespol-agentow,krytyka-wnetrz-16-11}.md`.
- `INSTRUKCJA.pdf` odświeżony (`manage.py instrukcja_pdf`).
- Po pełnych testach poprawiona podpowiedź w `hr.js:92` (test nazw miejsc wymaga formy „Park handlowy ▸ …”).

### Dowody
- Skrypt martwych odsyłaczy (pliki .md w `gra/` i `dokumentacja/`, bez `historia/` i `podroze/`; pomija `_archiwum/` poza gitem i generowany `podglad4.html`): przed 34 → po `MARTWYCH: 0`.
- `pytest -q -p no:cacheprovider` (pełny): `1 failed, 909 passed in 334.79s` – jedyny błąd `test_nazwy_zakladek.py` (hr.js:92); po poprawce `test_nazwy_zakladek.py`: `1 passed`. Pełnego przebiegu nie powtarzałem (zmiana to jedno zdanie tekstu); `test_kasyno` nie padł.
- `ruff check .` → `All checks passed!`; `silnik.dane sprawdz` → `Dane w porządku`; `node --check` ok.
- Końcowy grep „zakładk” w `dane`, `static`, `INSTRUKCJA.md`: zostały tylko komentarze, `INSTRUKCJA.md:514` (panel MG), literalne wstążki w `zeszyt.js:138` (nie ruszać) oraz pola `zrodlo`/komentarze w yaml (`katalog.yaml`, `zalozenia.yaml:716`, `funkcje.yaml:8`, `budynki.yaml:4-5`); `reklama.yaml:15` to komentarz.

### Miejsca, w których kod może mylić się z tekstem / poza zakresem
- `silnik/wyniki/wnioski.py:21` „sprawdźcie zakładki” – widoczne dla gracza, `silnik/` zakazany → do 03/rundy.
- `inwestor_ratunkowy.max_kwota: 40000` a kapitał startowy 50 000 zł – rozbieżność opisu 40 000 zł z danymi; liczb nie ruszałem.
- Klucz `zakladki` w `funkcje.yaml` i nazwa folderu `static/zakladki/` są historyczne (nazwy techniczne, bez zmian).

### Propozycje
- Zmienić nazwy `static/zakladki/` i klucza `zakladki` (osobny wątek, dotyka testów).
