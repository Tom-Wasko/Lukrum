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
## Raport (wyko, 23.11.2026)
**Zrobione**
- `dane/zeszyt.yaml: odblokowania`: tekst + żeton + wnętrze dla wszystkich 36 elementów harmonogramu (schemat
  `OdblokowanieZeszytu`, walidacja w `silnik/dane.py: _sprawdz_zeszyt`: brak tekstu albo nieznany element/żeton = błąd).
- `api/zeszyt.py: _odblokowania`: ogłoszenia liczone z harmonogramu tej gry (v.harmonogram, z nadpisaniami MG):
  element, którego tydzień == bieżąca runda. Tydzień 1 bez ogłoszeń.
- `pulpit/zeszyt.js` + `pulpit.css`: ramka „Od tego tygodnia otwarte” w liście; „gdzie” (budynek ▸ wnętrze) przesuwa mapę
  (`pp-pokaz`); bazar bez żetonu – sam tekst.
- Z listów usunięto dwa sztywne zapowiedzi (tydz. 3 „Kurier rankingowy”, tydz. 4 „W Parku handlowym kupicie wyposażenie”).
- Notatka `dokumentacja/funkcje/Odblokowania.md`; README i INSTRUKCJA poprawione.
- Test `testy/aplikacja/test_odblokowania.py` (4): każdy element ma tekst; ogłoszenie w tygodniu z harmonogramu;
  przesunięcie MG (`handel`: 6 → 3) ogłasza w 3, nie w 6; miejsce „▸”.

**Dowody**
- `pytest -q -p no:cacheprovider` → `938 passed in 391.11s`; `ruff check .` → `All checks passed!`;
  `node --check zeszyt.js` → ok; `silnik.dane sprawdz` → `Dane w porządku`.
- Zrzuty (tydzień 3, jasny i ciemny): `_robocze/zrzuty-odblokowania/zeszyt-jasny.png`, `zeszyt-ciemny.png` (poza gitem).
  Po zrzucie dodano CSS zawijający długi przycisk miejsca (nie sprawdzony ponownie na zrzucie).

**Uwagi**
- Teksty ogłoszeń to moja propozycja (Sonnet); szef/Archi mogą poprawić. Miejsca dla `parki` (Ogród Saski) i `wypadki`
  (ubezpieczyciel ▸ polisy) to zgadnięte najbliższe wnętrza; `handel` – bazar bez żetonu.
- Zakryta funkcja nie blokuje ogłoszenia (element jest otwarty, ale drużyna go nie używa); wyłączona ma tydzień
  liczba_rund+1, więc nie jest ogłaszana.
- Zapis do dziennika (zbiór `pracownicy/lista`) odmówił (wersja dokumentu), pominięty; `postep` zapisany.
