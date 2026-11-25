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

**Stan: zrobione** (gałąź `worktree-podroz-04-billboardy`, commity 8bbb3e4, 19df57e, 151f9dd; bez pusha).

- **Dane:** 3 billboardy w `gra/dane/mapa/reklama.yaml` (`billboard_dmowskiego`, `billboard_kul`, `billboard_thatcher`, geo przy rondach), schemat `PunktBillboardu` w `silnik/schematy.py`. Bez nowych liczb gry.
- **Widok:** `v.reklama.billboardy` (`silnik/rynek/reklama.py`) niepusty tylko, gdy trwa własna kampania billboardowa albo trwała cudza w poprzedniej rundzie (moja interpretacja „kanał działa w rundzie”).
- **Mapa:** `lublin.js` (żeton `lm-billboard` z ikoną plakatu i plakietką ▤, karta opisu po kliknięciu, wpis w legendzie, waga 8), `mapa.css` (blok `.lm-billboard`). Stan nie samym kolorem (kształt + ▤).
- **Opis dla gracza:** `INSTRUKCJA.md` (akapit przy agencjach reklamowych) i `README.md` (l. 13).
- **Lokale botów:** potwierdzone zrzutami (`.lm-zajety` widoczne); zmian nie było.
- **Uwaga:** billboardy widać dopiero po przybliżeniu mapy; przy pełnym oddaleniu mapa celowo pokazuje tylko własny lokal. Zrzuty „bez billboardów” zrobiono usunięciem węzłów DOM. Zrzuty (bar jasny, wysoka ciemny, telefon 390×844, z/bez, legenda i opis) były w `gra/_robocze/zrzuty/` (poza gitem).

**Dowody**
- `node --check lublin.js` → JS-OK
- `silnik.dane sprawdz` → „Dane w porządku … (wersja 99fa63c690c7)”
- `ruff check .` → All checks passed!
- `pytest testy/rynek/test_reklama.py` → 11 passed (w tym `test_billboardy_na_mapie_tylko_przy_aktywnej_kampanii`, `@pytest.mark.dane_gry`)
- `pytest testy/swiat testy/aplikacja` → 349 passed in 176.00s
- pełne testy → **1 failed, 1027 passed in 388.06s**. Błąd: `testy/pieniadze/test_debet_i_przeglad.py::test_debet_w_rozegranej_grze_oplata_tylko_przy_minusie_na_koniec_tygodnia` (r. 7, bot „agresywny”). **Nie od moich zmian:** ten sam błąd na bazie f9b8726 (sprzed wątku). Do osobnego zadania. `test_mistrz_gry_widzi_klub` nie wrócił.

**Sprzątanie:** `rm` w `_robocze/` zablokowane. Do ręcznego usunięcia (poza gitem): `_robocze/baza/` (tymczasowy worktree bazy; potem `git worktree prune`), `_robocze/billboardy/`, `_robocze/zrzuty-billboardy/`, `gra/_robocze/zrzuty/`. Serwer 8791 zatrzymany.

**Propozycje:** naprawić test debetu (osobne zadanie).
