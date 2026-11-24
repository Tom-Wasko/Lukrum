# Wątek: dzwieki (podróż 04)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/04-wyglad-i-dzwiek/wspolne.md`, `plan.md` tej podróży,
  `dokumentacja/funkcje/radio-fala-koziolka.md`, początek `panel_gracza/static/pulpit/radio.js` (opis w komentarzu).
  Gałąź bazowa: `main`. Równolegle pracuje `04/wzor` (wygląd okien: `swiat/okna.css`, `zakladki/*.js`).
- **Cel (Z11, decyzje szefa 23.11):** krótkie dźwięki gry i odgłosy tła zależne od miejsca.
  - Tło to **tylko odgłosy** (gwar w kebabie, szum ulicy na mapie, stukot w biurze, cisza w banku itp.). Prawdziwa
    muzyka jest wyłącznie w radiu.
  - Krótkie dźwięki: dzwonek drzwi przy wejściu do lokalu, kasa przy zakupie, stempel przy nadaniu listu, przewracana
    kartka zeszytu, szelest teczki przy otwarciu okna (lista w danych, łatwa do zmiany).
  - **Domyślnie:** krótkie dźwięki włączone (cicho), odgłosy tła wyłączone; gracz włącza w ⚙ → Dźwięk (dwa suwaki
    i „wycisz wszystko”); stan w localStorage. Mistrz gry w `/mg/` może wyciszyć całą klasę (flaga gry, gracz widzi
    „Dźwięk wyciszony przez prowadzącego”).
  - Nagrania: **prawdziwe nagrania CC0 / domena publiczna** (decyzja szefa). Pliki pobiera Archi po akceptacji listy
    przez szefa; Ty robisz kod i dane tak, żeby brak pliku = cisza bez błędu.
- **Jak:**
  - `pulpit/dzwiek.js` (nowy): Web Audio, `lukrum.dzwiek.zagraj(nazwa)`, `lukrum.dzwiek.tlo(miejsce)` z płynnym
    przejściem (fade) przy wejściu do wnętrza i powrocie na mapę; nic nie gra przed pierwszym kliknięciem (zasady
    przeglądarek); `prefers-reduced-motion` nie dotyczy, ale szanuj wyciszenie. Funkcja `przycisz(tak/nie)` dla radia
    (wątek `04/radio` użyje jej, żeby gwar cichł, gdy gra radio).
  - `dane/dzwieki.yaml` (nowy): `pliki` {nazwa: {plik, zrodlo, autor, licencja}}, `zdarzenia` {zdarzenie: nazwa},
    `miejsca` {id miejsca z `dane/mapa/budynki.yaml` albo rodzaj: nazwa | "cisza"}, głośności domyślne. Endpoint jak
    `/radio.json` (sprawdź, jak radio wystawia dane) i walidacja w `silnik.dane sprawdz`, jeśli radio tak ma.
  - Strona nagrań: dopisz dźwięki do istniejącej strony `/nagrania-w-radiu` albo zrób wspólną „Nagrania i dźwięki”
    (autor, źródło, licencja każdego pliku).
  - Podpięcia: wejście do wnętrza / powrót na mapę (`lukrum.otworzWnetrze`, `lukrum.wrocNaMape`), zakup (paragon),
    nadanie listu, kartka zeszytu, otwarcie teczki – najmniejsze możliwe zmiany w cudzych plikach (opisz w raporcie).
- **Nie ruszaj:** wyglądu okien (`swiat/okna.css`, style zakładek), mechaniki, `pulpit/radio.js` (to `04/radio`),
  plików MP3 radia.
- **Testy:** `dzwieki.yaml` – każdy plik ma źródło, autora i licencję z listy {CC0, domena publiczna}; każde miejsce
  z `budynki.yaml` ma odgłos albo „cisza”; endpoint zwraca dane; flaga MG wyciszenia działa w API.
- **Zrzuty:** ⚙ → Dźwięk (bar jasny, wysoka ciemny) i panel MG z wyciszeniem; port 8782,
  `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-dzwieki/`. Po pracy zatrzymaj serwer.
- **Gotowe, gdy:** jak wyżej; INSTRUKCJA (krótko: dźwięk w ⚙, wyciszenie przez MG) i README; notatka
  `dokumentacja/funkcje/Dzwieki.md` z szablonu; pełne testy zielone, `ruff`, `node --check`, `silnik.dane sprawdz`.
  Potem ten sam wątek dostanie kontynuację `04/radio`.
- **Archi:** archi-lukrum.

## Raport

**Wyko, 24.11.2026. Status: gotowe do przeglądu (kod, dane, testy, dokumentacja, zrzuty).**

### Co zrobione
- `dane/dzwieki.yaml`: 10 plików (5 krótkich, 5 tła), wszystkie `status: oczekuje` (robocze nazwy `.ogg`), zdarzenia → dźwięk, miejsca → odgłos albo „cisza” (każdy budynek i zespół z `budynki.yaml`), głośności domyślne 40 %/30 %, krótkie włączone, tło wyłączone.
- `panel_gracza/dzwieki.py` + `/dzwieki.json` (bez logowania); do panelu trafiają tylko pliki „gotowe” i istniejące, brak pliku = cisza. Strona `/nagrania-w-radiu` ma sekcję „Dźwięki gry”.
- `static/pulpit/dzwiek.js` (Web Audio, `lukrum.dzwiek.{zagraj,tlo,przycisz,ustawMG}`): nic nie gra przed pierwszym kliknięciem, tło z płynnym przejściem, localStorage `lukrum-dzwiek`.
- ⚙ → Dźwięk (2 włączniki, 2 suwaki, „Wycisz wszystko”); MG: wiersz „Dźwięki gry w klasie” w `/mg/`, flaga `dzwiek_wyciszony`, gracz widzi „Dźwięk wyciszony przez prowadzącego”.
- INSTRUKCJA, README, `dokumentacja/funkcje/Dzwieki.md`, test `testy/aplikacja/test_dzwieki.py` (10 testów).

### Zmiany w cudzych plikach (minimalne)
`pulpit/pulpit.js` (import, sekcja ⚙, `ustawMG` w `odswiezTydzien`), `pulpit/pulpit.css` (blok na końcu), `panel_mg/static/mg/mg.js`, `api/widoki.py` (flaga w `api_prowadzenie`), `api/prezentacja.py`, `konta/middleware.py` (`/dzwieki.json` w WOLNE), `panel_gracza/widoki.py` + `urls.py` + szablon nagrań, `testy/rdzen/test_dane_zamrozone.py` (dzwieki.yaml na liście wyjątków jak radio.yaml). Dźwięki paragonu, stempla, zeszytu i teczki podpięte przez MutationObserver w `dzwiek.js`, bez edycji `wspolne.js`, `zeszyt.js` ani okien.

### Dowody
- Pełne testy, pierwszy przebieg: `4 failed, 971 passed in 391.69s`. Naprawione: brak `opis`/`zrodlo` w dzwieki.yaml, wyjątek w kopii zamrożonej, `MutationObserver` w teście węzłowym (strażnik w `dzwiek.js`). Po poprawkach osobno zielone: `test_dane`, `test_dane_zamrozone`, `test_wnetrza_sceny`, `test_dzwieki` (`10 passed`). Pełnego przebiegu po poprawkach nie powtarzałem (7 min); niestabilny `test_mistrz_gry_widzi_klub` nie wystąpił.
- `ruff check .` → `All checks passed!`; `node --check dzwiek.js` ok; `silnik.dane sprawdz` → `Dane w porządku`.
- Zrzuty: `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-dzwieki/` (ust-dzwiek-bar-jasny, ust-dzwiek-wysoka-ciemny, mg-dzwiek). Serwer 8782 zatrzymany.

### Uwaga
W worktree leży obcy, niezacommitowany plik `gra/panel_gracza/static/dzwieki/lokal.ogg` (2 MB, 06:52; nie mój, brak go w spisie). Przez niego pada `test_w_paczce_nie_ma_plikow_spoza_spisu` (bez niego 10 passed). Zostawiony na miejscu, nie w commicie: trzeba go wpisać do `dzwieki.yaml` (autor, licencja) albo usunąć.

### Propozycje
- `04/radio`: wołać `lukrum.dzwiek.przycisz(true)`, gdy gra radio.

### Dopisek 24.11.2026 (nagrania, scalenie, pełne testy)
- `lokal.ogg` to nagranie od Archiego (szef zaakceptował listę), nie obcy plik. Pod kluczami w `dzwieki.yaml` są teraz 4 pliki `gotowe`: `dzwonek.flac` (CC0), `kartka.ogg`, `lokal.ogg`, `urzad.ogg` (domena publiczna), wszystkie z Wikimedia Commons. Sześć pozostałych (kasa, ulica, kuchnia, sklep, biuro, szkola) ma `oczekuje` = cisza; stempel bez nagrania.
- **Autor, licencja i źródło pochodzą z listy podanej przez Archiego, nie z API Commons:** mam zakaz sieci, więc nie sprawdziłem `imageinfo extmetadata`. Archi powinien zweryfikować te cztery wpisy (dzwonek: qubodup/CC0; kartka: planish; lokal: stephan; urzad: ezwa).
- Teczka (`otwarcie_okna`) gra szelest kartki; kasyno (`harpagon`) i parki/woda grają odgłos na 50 % (`glosnosc_miejsc`). Klucza `kuchnia` żadne miejsce nie używa (kuchnia to punkt w lokalu).
- `git merge main` (04/wzor) bez konfliktów.
- Dowody: `pytest -q` (pełne) → `976 passed in 366.75s`; `test_dzwieki.py` → `11 passed`; `ruff check .` → `All checks passed!`; `silnik.dane sprawdz` → `Dane w porządku`. `test_mistrz_gry_widzi_klub` nie wystąpił.
