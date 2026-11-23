# Wątek: odblokowania (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md` (zasady, testy, commity).
  Gałąź bazowa: `podroz-03`. Równolegle mogą pracować: `03/poprawki-okienek`, `03/prawo`, `03/tlok`
  (silnik/rynek, wnętrza).
- **Cel (Z15, decyzja szefa 23.11):** terminy odblokowań **zostają** w kalendarzu (`silnik/harmonogram.py`,
  `dane/katalog.yaml: rundy.harmonogram_lokali`, `dane/funkcje.yaml`; MG może je zmieniać). Zmienia się sposób
  ogłoszenia: **każde odblokowanie ogłasza list wujka**: co się otwiera, gdzie na mapie (budynek ▸ wnętrze) i po co
  (jedno zdanie, czego to uczy w praktyce).
- **Jak (decyzja Archiego):**
  - List wujka już jest (zeszyt: „List od wujka · tydzień N”, `dane/zeszyt.yaml: tygodnie`, `pulpit/zeszyt.js`,
    `api/zeszyt.py`). Dodaj do listu tygodnia blok „Od tego tygodnia otwarte”, liczony z harmonogramu **tej gry**
    (z nadpisaniami MG), nie z numerów wpisanych w tekst.
  - Teksty ogłoszeń w danych (np. `dane/zeszyt.yaml: odblokowania: {element: {tekst, gdzie}}`), po jednym na element
    harmonogramu. Test pilnuje, że każdy element ma tekst.
  - Kliknięcie „gdzie” przesuwa mapę do budynku jak lista wujka (Z5, już jest).
  - Usuń z listów wujka zdania, które na sztywno zapowiadają odblokowanie w danym tygodniu (sprzeczne po zmianie MG).
- **Nie ruszaj:** terminów odblokowań (liczb), `silnik/rynek/`, `silnik/wnetrza/`, okienek z `03/poprawki-okienek`.
- **Zasady:** teksty proste, neutralne płciowo, bez żargonu; zero wzmianek o innych grach.
- **Gotowe, gdy:** test: gra z przesuniętym przez MG terminem ogłasza element w nowym tygodniu, nie w starym; każdy
  element ma tekst; zrzut zeszytu w tygodniu z odblokowaniem (`gra/narzedzia/zrzuty.py`, port 8793, zrzuty do
  `../_robocze/zrzuty-odblokowania/`); notatka `dokumentacja/funkcje/Odblokowania.md` z szablonu; pełne testy zielone,
  `ruff`, `node --check`, `silnik.dane sprawdz` czyste.

## Raport
