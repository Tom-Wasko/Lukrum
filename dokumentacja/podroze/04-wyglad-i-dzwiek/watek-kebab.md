# Wątek: kebab (podróż 04), kontynuacja 04/nakladka

## Brief
- **Najpierw:**
  - zrób rebase swojej gałęzi na `main` (A jest już w `main`, f5a41a8);
  - przeczytaj w `dokumentacja/wiedza/analizy/przeglad-wnetrz.md` P5 i P10 oraz opis kebabu.
  - Kod kebabu: `gra/panel_gracza/static/swiat/sceny.js` (sekcja „kebab”, układ z podglądu 4 w `narzedzia/grafiki/`)
    i postacie w `swiat/rysunek.js`.
- **Cel (Z4, wątek B; szef 24.11 i 25.11):**
  1. **P5:** kebab w nowym stylu, jak pozostałe wnętrza po wątku A:
     - bez przerywanych ramek i niebieskich plusów;
     - „Miejsce na dodatki” jako gablota albo półka z rzeczami, które drużyna kupiła (puste miejsce = pusta półka z tabliczką, nie ramka);
     - punkty kebabu jako szyldy z nakładki.
  2. **P10:** w palecie ciemnej (zwłaszcza wysoka ciemny) postacie i rekwizyty dostają ciemną wersję:
     - nie jasne „wycinanki” na ciemnym tle;
     - kontrast konturu ≥ 7:1 w palecie wysokiej;
     - dotyczy wszystkich scen, ale tylko przez wspólne zmienne i `rysunek.js`, bez ruszania plików `swiat/sceny/*.js`
       (tam równolegle pracuje wyko 04/charakter).
- **Pliki:**
  - Twoje: `swiat/sceny.js` (kebab), `swiat/rysunek.js`, `motywy/*.css`, `swiat/wnetrza.css`;
  - nie ruszaj `swiat/sceny/*.js` ani nowego `swiat/rekwizyty.js` (to wątek C).
- **Zasady:** jak w wątku nakladka (kolory ze zmiennych, 3 palety × jasny/ciemny, stan nie samym kolorem, neutralnie płciowo, bez kopiowania cudzych wnętrz, zero wzmianek o innych grach).
- **Zrzuty:**
  - port 8789, do `_robocze/zrzuty-kebab/`;
  - kebab z gry w toku (jak w poprawce A): bar jasny, dymek, wysoka ciemny, pewex ciemny, telefon;
  - do tego 5 innych scen w wysokiej ciemnej (ratusz, poczta, makro, bank, agencja pracy), żeby pokazać P10;
  - po pracy zatrzymaj serwer.
- **Testy:** test do nowej logiki, `node --check`, `testy/swiat` i `testy/wnetrza`; na koniec pełne testy i `ruff`.
- **Gotowe, gdy:** P5 i P10 zrobione, zrzuty są, testy zielone (wyniki w raporcie), opis dla gracza 1–2 zdania.
- **Dalej:** po akceptacji może przyjść kontynuacja Z14 (nastrój zespołu na twarzach). Nie zaczynaj jej sam.
- **Archi:** archi-lukrum.

## Raport
