# Wątek: wydajnosc (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md`. Są tam zasady, testy i commity.
  Wątki paragon, wydarzenia, list, zeszyt i wyniki są już scalone. Równolegle pracują tylko `03/rundy` i `03/opisy`.
- **Cel (Z37):** gra wczytuje się szybciej. Dziś panel gracza ładuje około 80 modułów JS osobnymi żądaniami.
- **Ustalone:**
  - Wejście do panelu to `panel_gracza/templates/panel_gracza/gra.html`, który ładuje `{{ statyczne }}app.js` jako moduł.
    Strona startowa ładuje `pulpit_ucznia.js`.
  - Po wątku 02/mapa pierwsze wczytanie trwało 914 ms. Mierz tak samo przed zmianą i po niej, na serwerze lokalnym.
    Do pomiaru nie potrzebujesz przeglądarki: policz żądania i sprawdź, czy ich liczba spadła.
- **Jak (decyzja Archiego):**
  1. Najpierw `<link rel="modulepreload">`: generowana lista modułów (np. polecenie `manage.py` albo skrypt w
     `narzedzia/`, który zbiera importy od `app.js`) wstawiana do szablonu.
  2. Jeśli to za mało, opcjonalnie jeden plik z modułami. Tylko bez nowych zależności npm, które trzeba instalować u
     szefa, i bez kroku budowania, który trzeba pamiętać przed `start.bat`. Jeśli budowanie jest potrzebne,
     `manage.py graj` musi je robić sam.
  3. Zmiana nie może zepsuć trybu deweloperskiego: edycja pliku JS i odświeżenie strony mają nadal działać.
- **Pliki do zmiany:**
  - szablony w `panel_gracza/templates/`;
  - nowe narzędzie w `narzedzia/` albo `panel_gracza/`;
  - w razie potrzeby `lukrum/settings` i widok, który podaje `statyczne`;
  - testy w `gra/testy/aplikacja/`.
- **Nie ruszaj:** treści modułów JS (wolno tylko poprawić importy, jeśli to konieczne), `dane/`, `silnik/`.
- **Gotowe, gdy:**
  - Lista preload obejmuje wszystkie moduły, do których dochodzi `app.js`. Pilnuje tego test: nowy moduł bez preloadu
    nie przejdzie.
  - W raporcie są liczby przed i po: liczba żądań i czas pierwszego wczytania.
  - README i `gra/dokumentacja/STACK.md` mają akapit o wczytywaniu.
  - Pełne testy są zielone.
- **Zrzuty ekranu:** nie.

## Raport
**Zrobione:** `modulepreload` dla wszystkich modułów dochodzących z `app.js`; bez budowania i bez nowych zależności.
- `gra/panel_gracza/moduly.py` zbiera statyczne importy od `app.js` (leniwe `import("…")` pomija). `lista()` liczy
  na nowo przy `DEBUG` (edycja JS + odświeżenie działa), poza `DEBUG` raz na proces.
- `widoki.strona_gry` podaje `moduly` do `gra.html`, który wstawia `<link rel="modulepreload">` przed skryptami.
- Test `gra/testy/aplikacja/test_wczytywanie.py`: lista zgadza się z niezależnym zbieraczem importów, pliki istnieją,
  linki są na stronie gry. Lista jest generowana, więc nowy moduł dostaje preload automatycznie; test pilnuje poprawności grafu.
- README i `gra/dokumentacja/STACK.md`: akapit o wczytywaniu.

**Liczby (z grafu importów, nie stoperem):**
- Przed: 71 modułów w 5 kolejnych „piętrach” (1, 14, 38, 14, 4), czyli 5 sekwencyjnych rund żądań.
- Po: te same 71 żądań, ale wszystkie ogłoszone w HTML, więc 1 runda równolegle. Liczba żądań się nie zmienia
  (to preload, nie paczka); spada głębokość łańcucha 5 → 1.
- Czasu pierwszego wczytania (914 ms) nie zmierzyłem: uruchomienie serwera w tle zostało zablokowane. Na localhost
  zysk jest mały, największy będzie przez Cloudflare/`hostuj` (opóźnienie × 4 piętra).
- Do decyzji: jeśli liczba żądań też ma spaść, trzeba jednego pliku z modułami (krok 2 briefu). Nie robiłem.

**Dowód:** `pytest -q` → `912 passed in 335.91s`; `ruff check .` → `All checks passed!`; `test_wczytywanie.py` + `test_pulpit.py` → `37 passed`.
