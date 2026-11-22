# Wątek: drobne (podróż 02)

## Brief
- **Cel:** naprawić drobne usterki z gier testowych 20 i 22.11 (zadanie Z29 w `dokumentacja/Zadania.md`, bez
  części o mapie, którą robi wątek `02/mapa`).
- **Ustalone (nie sprawdzaj ponownie):**
  - Projekt: gra w `gra/` (przewodnik `gra/AGENTS.md`, zasady `CLAUDE.md` w korzeniu). Ścieżki niżej liczone od
    `gra/panel_gracza/static/`.
  - Zeszyt wujka: `pulpit/zeszyt.js`, `pulpit/zeszyt-warunki.js`, dane `gra/dane/zeszyt.yaml`. Pulpit: `pulpit/pulpit.js`.
  - Pani Halina: zdarzenie `pani_halina` w `gra/dane/zdarzenia/losowe.yaml:116`. Listy i zdarzenia: `zakladki/zdarzenia.js`.
  - Zatrudnianie: `zakladki/hr.js`, `zakladki/rynek_pracy.js`. Menu w lokalu: `zakladki/oferta.js`, `zakladki/lokal.js`.
    Poczta: `swiat/sceny/poczta.js`, list z decyzjami w `pulpit/pulpit.js`.
- **Do zrobienia (uwagi szefa „s” i majstra „m”):**
  1. (s) List od pani Haliny (Bank Żywności) nie znika, jest zawsze widoczny. Po reakcji ma zniknąć.
  2. (s) Reakcja na panią Halinę nie powinna trafiać do zeszytu w „do zrobienia”.
  3. (s) Kartki zeszytu zwykle się nie przewijają. Każda kartka z dłuższą treścią ma się przewijać (kółko, dotyk,
     klawiatura), a wskaźnik „przewiń w dół” ma działać.
  4. (m) Przycisk „Zatrudnij” jest za jasny, a teksty w zatrudnianiu są nieczytelne. Kontrast ≥ 4,5:1, w palecie
     wysokiej ≥ 7:1, we wszystkich 3 paletach × jasny i ciemny.
  5. (m) Menu w lokalu nie działa: wszystkie ceny pokazują 0 zł. Znajdź przyczynę (dane czy widok) i napraw.
  6. (m) Na liście wydarzeń są 4, a po „Zareaguj” widać wszystkie, i tam są tylko 2. Liczby i listy mają się zgadzać.
  7. (m) Poczta: tablica w drugiej rundzie zostaje z pierwszej. Ma się odświeżać co rundę.
  8. (m) Stempel „nadano” zostaje po przejściu rundy. W nowej rundzie list jest znów do nadania.
  9. Sprawdź w grze, bez zmian, jeśli działa: kategorie mapy w rzędzie ikon z mniejszą liczbą ikon (szef: „wróć do tego,
     co było, ale mniej ikonek”) i „Jak grać” w zakładkach zamiast jednego bloku tekstu. Wynik wpisz do raportu.
     Kategorie leżą w plikach mapy (wątek `02/mapa`), więc ich nie zmieniaj, tylko opisz.
- **Pliki do zmiany:** `pulpit/zeszyt.js`, `pulpit/zeszyt-warunki.js`, `pulpit/pulpit.js`, `pulpit/pulpit.css`,
  `zakladki/hr.js`, `zakladki/rynek_pracy.js`, `zakladki/oferta.js`, `zakladki/lokal.js`, `zakladki/zdarzenia.js`,
  `zakladki/wspolne.js` (tylko jeśli konieczne), `swiat/sceny/poczta.js`, `gra/dane/zeszyt.yaml`,
  `gra/dane/zdarzenia/*.yaml`, `gra/api/` i `gra/silnik/` (gdy przyczyna jest po stronie serwera), testy.
  **Nie ruszaj** (inne wątki pracują równolegle): `mapa/*`, `zakladki/mapa*.js`, `swiat/rysunek.js`, `swiat/wnetrze.js`,
  `swiat/sceny/*` (poza `poczta.js`), `swiat/miejsca.js`, `zakladki/dostawcy.js`, `marketing.js`, `inwestycje.js`,
  `pulpit/karta.js`. W `pulpit/pulpit.css`, `pulpit/karty.css` i `styl.css` dopisuj tylko blok na końcu z komentarzem
  `/* podróż 02/drobne */`.
- **Zasady:** liczby gry tylko w `dane/*.yaml`, kwoty w groszach, teksty po polsku, neutralne płciowo, kolory przez
  zmienne z `motywy/zmienne.css`, stan nigdy samym kolorem. Po zmianie `dane/*.yaml` uruchom
  `PY -X utf8 -m silnik.dane sprawdz`. Testy wzorów (`testy/dane_zamrozone/`) zostają bez zmian. Testów nie osłabiaj.
  Do każdej naprawy logiki dodaj test.
- **Gotowe, gdy:** punkty 1–8 naprawione i sprawdzone w przeglądarce na serwerze (`manage.py graj --port 8764
  --bez-przegladarki`, gra `manage.py gra_pokazowa`, zmiana rundy z panelu MG), punkt 9 opisany. Potem zatrzymaj serwer.
  Dowód: `PY -X utf8 -m pytest -q -p no:cacheprovider 2>&1 | tail -5` (pełne, raz na koniec), `PY -m ruff check .`,
  `node --check` każdego zmienionego modułu.
- **Zrzuty ekranu:** nie.
- **Dokumenty do poprawienia:** `gra/INSTRUKCJA.md` i `gra/README.md`, jeśli zmienia się to, co widzi gracz.
- **Archi:** archi-lukrum

## Raport
<!-- Pisze wyko na końcu. -->
**Stan:** gotowe | częściowo | zablokowane
**Zmienione pliki:**
**Dowód:** `<komenda>` → `<ostatnie linie wyniku>`
**Decyzje, które podjąłem:**
**Pytania do szefa:**
**Propozycje (poza zakresem):**
**Commity:**
