# Wątek: szyldy (podróż 04, drobne usterki kebabu)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/Wyglad.md`, `gra/panel_gracza/static/swiat/sceny.js` (l. ~47: „PÓŁKA PUSTA”, `napis`),
  `swiat/swiat.js` (l. ~123: punkty kebabu, `dodatki`), `swiat/miejsca.js` (l. ~33: punkt „Okno: ulica i klienci…”), `swiat/nakladka.js`
  (rozkład punktów-szyldów), `swiat/wnetrza.css`, `swiat/swiat.css`.
- **Cel (3 drobne usterki w kebabie, zgłoszone 25.11 po zrzutach):**
  1. Napis „PÓŁKA PUSTA” nachodzi na szyld punktu „Dodatki: wystrój sali”. Rozsuń (przesuń napis albo punkt) tak, by nic na nic nie nachodziło.
  2. Szyld „Okno: ulica i klienci (Pracownia Analiz)” nachodzi na ciemny pasek. Popraw położenie albo skróć opis tak, by był w całości czytelny.
  3. W parku Rury „bloki osiedla” (tło/rekwizyt) wyglądają źle: sprawdź na zrzucie scenę parku Rury (`swiat/sceny/…`), popraw tak, by bloki
     pasowały do planszy (proporcje, kolory ze zmiennych); jeśli to nie usterka, zapisz to w raporcie z uzasadnieniem.
- **Zasady:** kolory tylko ze zmiennych `motywy/zmienne.css`; sprawdź 3 palety × jasny/ciemny (min. bar jasny i wysoka ciemny), 1366×768 i telefon 390×844;
  stan nie samym kolorem. Bez zmian w silniku i danych gry. Nie ruszaj mapy ani nastroju (miny już zrobione).
- **Testy:** `node --check` zmienionych modułów; `testy/swiat`, `testy/wnetrza`; na koniec `ruff`. Pełnych testów nie trzeba (zmiany tylko widok);
  jeśli test niezwiązany pada, zgłoś w raporcie.
- **Zrzuty:** port 8792, `gra/narzedzia/zrzuty.py`, do `_robocze/zrzuty-szyldy/`: przed i po. Po pracy zatrzymaj serwer.
- **Gotowe, gdy:** 3 usterki poprawione, zrzuty przed/po, testy zielone (wyniki w raporcie).
- **Scalanie:** tryb autonomiczny: do `podroz-04`, nie do `main`. Nie pushuj.
- **Archi:** archi-lukrum.

## Raport
**Zrobione (wątek szyldy, gałąź worktree-podroz-04-szyldy):**
- Przyczyna usterek 1 i 2: silnik układu szyldów (`nakladka.js`) uznawał za przeszkody tylko postacie (`.wn-osoba`). Rysowane
  elementy sceny (tabliczka „PÓŁKA PUSTA” z deską `.polka`, ciemny pasek „Tłok” `.tlok-znak`) szyldy punktów mogły przykryć.
- Poprawka (1 linia, `gra/panel_gracza/static/swiat/wnetrze.js`, `ulozNakladke`): przeszkodami są też `.polka` i `.tlok-znak`.
  Szyld „Okno: ulica i klienci (Pracownia Analiz)” przeskoczył nad okno (nie zasłania paska Tłok), „Dodatki” i „Tablica wyników”
  omijają półkę. Bez zmian w silniku, danych, mapie i nastroju; kolory nietknięte (zmienne).
- Usterka 3 (park Rury): **to nie usterka parku** – scena `sceny/park.js` nie rysuje żadnych bloków (tablica ogłoszeń, mostek,
  ławka, drzewa, krzew; zrzut `przed/rury-bar-jasny.png`). „Bloki” istnieją tylko w widoku z okna kebabu
  (`wnetrze/okno-pawilon.svg`) i w tle działki (`tla/dzialka-teren.svg`); wyglądają poprawnie. Jeśli szefowi chodziło o to okno,
  proszę o wskazanie, co jest nie tak (decyzja o wyglądzie).
- Zrzuty (poza gitem): `_robocze/zrzuty-szyldy/przed/` i `po/` (kebab: bar jasny, wysoka ciemny, pewex jasny 1366×768; telefon 390×844
  – na telefonie szyldów punktów na scenie nie ma, bez zmian).

**Dowody:**
- `node --check` (wnetrze.js jako .mjs) → `JS_OK`
- `pytest -q testy/swiat testy/wnetrza` → `160 passed in 33.26s`
- `ruff check .` → `All checks passed!`
- Serwer 8792 zatrzymany.

**Propozycje:** na zrzucie wysoka ciemny szyld „Tablica wyników” leży blisko dolnego rogu tablicy menu – do obejrzenia przy
okazji kolejnej poprawki wyglądu.
