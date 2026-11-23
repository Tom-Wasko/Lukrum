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
