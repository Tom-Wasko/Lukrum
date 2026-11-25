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
