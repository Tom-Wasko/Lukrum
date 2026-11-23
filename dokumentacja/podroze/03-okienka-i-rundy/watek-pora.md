# Wątek: pora (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md`. Są tam zasady, testy i commity.
  Gałąź bazowa: `podroz-03`. Wątki nocne są scalone. Równolegle pracuje tylko `03/przeglad-prawny`.
- **Cel (Z12):** pora dnia we wnętrzach i za oknem zgadza się z prawdziwą godziną, tak jak na mapie. Zgłosił to majster.
- **Ustalone:**
  - Mapa ma już porę dnia: `panel_gracza/static/mapa/slonce.js` i ustawienia w `dane/mapa/miasto.yaml`.
    Użyj tego samego źródła godziny i tych samych progów. Nie rób drugiego zegara.
  - Pora dnia **nie zależy od trybu jasny/ciemny**. Tryb to kolory interfejsu. Pora to światło w scenie: niebo
    za oknem, lampy, przyciemnienie ilustracji.
  - Liczby (godziny przejść, siła przyciemnienia) trzymaj w `dane/*.yaml`, nie w kodzie.
  - Wnętrza rysują `panel_gracza/static/swiat/` (`wnetrze.js`, `sceny.js`, `swiat/sceny/*`).
- **Jak (decyzja Archiego):**
  - Wspólny moduł, który podaje porę: świt, dzień, zmierzch albo noc, plus stopień 0–1.
  - Sceny dostają klasę albo zmienną CSS. Okna w scenach pokazują niebo według pory: noc to ciemne niebo i światło
    w oknie, dzień to jasne.
  - Bez przerysowywania każdej sceny z osobna. Wystarczy warstwa przyciemnienia i niebo w oknach.
  - Kolory tylko przez zmienne z `motywy/zmienne.css`. Działa w 3 paletach × jasny/ciemny. Stan nigdy samym kolorem.
- **Pliki do zmiany:** `swiat/*`, nowy moduł pory, `mapa/slonce.js` (tylko wydzielenie wspólnej części),
  `swiat/swiat.css` (blok `/* podróż 03/pora */` na końcu), dane w `dane/mapa/miasto.yaml` albo nowym pliku, testy.
- **Nie ruszaj:** `zakladki/*`, `pulpit/*`, `silnik/`, treści tekstów.
- **Gotowe, gdy:**
  - O 22:00 i o 12:00 według zegara wnętrze kebaba i jedno inne wnętrze wyglądają inaczej.
  - Test sprawdza wyliczenie pory dla kilku godzin, w tym przejść, na danych z yaml.
  - Zmiana trybu jasny/ciemny nie zmienia pory.
  - Pełne testy są zielone, a `node --check` czysty.
  - INSTRUKCJA ma jedno zdanie o porze dnia, jeśli opisuje wnętrza.
- **Zrzuty ekranu:** nie ma przeglądarki. Opisz w raporcie, co się zmienia o której godzinie.

## Raport

### Zrobione (wyko)
- **Wspólne źródło:** `mapa/slonce.js` dostał `ustawUstawieniaPory` (etapy i lampy z yaml), `stopienLamp` i wspólną godzinę ręczną z suwaka mapy
  (`ustawCzasReczny`/`czasReczny`). `mapa/lublin.js` używa ich zamiast własnej liczby lamp. Jeden zegar, jedne progi.
- **Dane:** blok `pora` w `dane/mapa/miasto.yaml` (etapy nakładki, lampy, progi pór: noc −8°, dzień 6°, pełna noc −18°, siła przyciemnienia wnętrza).
- **Moduł:** `swiat/pora.js` – `porzeDnia(h, minuty, ust)` daje świt/dzień/zmierzch/noc, ciemność 0–1, lampy, nakładkę; `poraTeraz`.
- **Sceny:** `swiat/swiat.js` nakłada na każde wnętrze klasę `pora-*` i zmienne CSS, warstwę przyciemnienia, poświatę lamp i napis pory
  (☀ dzień, ◐ świt, ◑ zmierzch, ☾ noc); co minutę odświeża bez przerysowania sceny. Bez przerysowywania scen z osobna.
- **CSS** (blok `/* podróż 03/pora */` w `swiat.css`): niebo za oknem (`--g-niebo` mieszane z `--g-tablica`), nakładka, lampy; w palecie „wysoka” połowa siły; bez `data-tryb`.
- INSTRUKCJA: jedno zdanie o porze dnia we wnętrzach. (`INSTRUKCJA.pdf` nie przebudowywany.)
- Test: `testy/swiat/test_pora.py` (5 testów: progi w yaml, pora dla 3/7/12/16/22 h przez node na danych z yaml, noc ciemniejsza od dnia, brak zależności od trybu).

### Co się zmienia o której godzinie (bez zrzutów, brak przeglądarki)
- Dzień (wysokość Słońca ≥ 6°, np. 12:00): jasne niebo za oknem, brak nakładki i lamp, napis „☀ dzień”.
- Świt i zmierzch (−8…6°, rano/wieczorem): niebo ciepłe i coraz ciemniejsze, złocista nakładka, lampy zaczynają się od 4°; napis „◐ świt” / „◑ zmierzch”.
- Noc (< −8°, np. 22:00): ciemnogranatowe niebo, nakładka ok. 0,4 krycia, pełna poświata lamp przy suficie; napis „☾ noc”.
- Suwak pory na mapie zmienia też wnętrza (po wejściu / po minucie). Tryb jasny/ciemny pory nie zmienia.
- Uwaga: sceny rysujące niebo stałym kolorem zamiast `--g-niebo` (część fasad) pociemnieją tylko od nakładki.

### Dowód
- `pytest -q -p no:cacheprovider` (pełne) → `934 passed in 374.68s`
- `ruff check .` → czysto; `node --check` na pora.js, swiat.js, slonce.js, lublin.js → ok; `silnik.dane sprawdz` → „Dane w porządku”.
- Do ustalenia przez Archiego: INSTRUKCJA.pdf nie przebudowany.
