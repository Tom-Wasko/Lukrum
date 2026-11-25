# Wątek: billboardy (podróż 04, Z8)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/Mapa.md` (l. 60–150: billboardy, kebaby na mapie), `dokumentacja/Wyglad.md`,
  `gra/dane/mapa/reklama.yaml` (agencja `fala_koziolka`, kanał `billboard`), `gra/dane/mapa/strefy.yaml`,
  `gra/panel_gracza/static/mapa/lublin.js` (rysowanie lokali, ikon, legenda), `mapa/ikony.js`, `gra/api/prezentacja.py`
  (skąd `v.lokale`, kampanie), `gra/dane/boty.yaml`.
- **Cel (Z8):** na mapie widać (1) lokale botów-konkurencji i (2) 3 billboardy „Fali Koziołka” przy rondach, gdy kampania
  billboardowa trwa.
  1. Sprawdź, czy lokale botów są już rysowane jako „lokale innych firm” (kod mówi, że tak): jeśli tak, tylko to potwierdź
     zrzutem i w razie braków popraw; nie przerabiaj.
  2. Billboardy: 3 stałe punkty przy rondach (współrzędne z `lokale.yaml`/mapy OSM, strefy najbliżej kanału billboardu;
     wybierz 3 realne ronda w Lublinie, wpisz geo w danych YAML, nie w kodzie). Widoczne tylko, gdy w tej rundzie
     (albo w aktywnej kampanii gracza) działa kanał billboardu. Mały żeton-ikona w stylu pozostałych (tusz, papier), z opisem
     po kliknięciu/najechaniu (neutralnie płciowo); stan nigdy samym kolorem.
  3. Wpis w legendzie mapy.
- **Granice:** mapa to też strefa majstra (gałąź `maciex`; teraz brak nowych zmian). Zmieniaj minimalnie i tylko to, co brief każe;
  bez przebudowy mapy. Bez mechaniki i liczb gry (tylko prezentacja stanu, który już jest). Bez „Stara mapa”.
- **Testy:** test, że billboardy pojawiają się w widoku tylko przy aktywnej kampanii; `node --check` zmienionych modułów;
  `silnik.dane sprawdz`; `testy/swiat`, `testy/aplikacja`; na koniec pełne testy i `ruff`.
- **Zrzuty:** port 8791, `gra/narzedzia/zrzuty.py`, do `_robocze/zrzuty-billboardy/`: mapa z billboardami i bez (bar jasny, wysoka ciemny,
  telefon 390×844). Po pracy zatrzymaj serwer.
- **Gotowe, gdy:** billboardy i lokale botów widoczne wg powyższego, zrzuty, testy zielone (wyniki w raporcie), opis dla gracza 1–2 zdania.
- **Scalanie:** tryb autonomiczny: do `podroz-04`, nie do `main`. Nie pushuj.
- **Archi:** archi-lukrum.

## Raport
