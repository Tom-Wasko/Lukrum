# Wątek: okna-a (podróż 04)

## Brief
- **Kontynuacja `04/wzor`** (ten sam wyko; wzór scalony do `main` w ae06cae). Najpierw `git merge main` w swoim worktree.
  Równolegle pracuje `04/okna-b` (rama s1 i ramy „inne”, plik `swiat/okna-teczka.css`) i `04/dzwieki`.
- **Cel (Z49, szef 24.11: wzór „wszystkie są spoko”):** każde okno w ramach **s2 (akta)** i **s4 (kratka)** ze spisu
  `dokumentacja/wiedza/analizy/spis-okien.md` w stanie „zgodne” tym samym językiem co wzór.
- **Do zrobienia:**
  1. Wszystkie okna s2 i s4 ze spisu 2a o stanie stare/mieszane: obejrzeć na zrzutach, uzupełnić reguły w `swiat/okna.css`
     (urząd, harpagon, ubezpieczenia, giełda, VAT, sanepid, kalendarz, księga, wnioski, udogodnienia… według spisu).
     Poprawka znana: w s2 nagłówki kafli (`.kt`) mają zaokrąglone górne rogi.
  2. Okna podrzędne (spis 2b) z ramą rodzica (`styl: stylEkranu(...)` albo równoważnie) w modułach: `banki.js`,
     `finanse.js`, `harpagon.js`, `hr.js`, `rynek_pracy.js`, `urzad.js`, `wlasciciel.js`, `zdarzenia.js`, `mapa.js`.
     Formularze banku (lokata, kredyt, leasing) → s2.
  3. Spis: stan każdego Twojego okna → „zgodne”, kolumna z nazwą zrzutu.
- **Nie ruszaj:** `styl.css`, mechaniki, tekstów, `dane/*.yaml`; plików `04/okna-b` (`swiat/okna-teczka.css`, `oferta.js`,
  `inwestycje.js`, `dostawcy.js`, `handel.js`, `marketing.js`, moduły ram s1 i „inne”); plików dźwięku.
- **Zrzuty:** port 8781, `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-okna-a/`, każde okno „po”: bar jasny, pewex ciemny,
  wysoka ciemny, 1366×768, `<okno>-<paleta>-<tryb>.png`. Archi zrobi z nich galerię dla szefa. Po pracy zatrzymaj serwer.
- **Gotowe, gdy:** wszystkie okna s2/s4 w spisie „zgodne” ze zrzutami; `testy/swiat` + `testy/aplikacja` zielone, `ruff`,
  `node --check` zmienionych modułów; na koniec pełne testy (wynik w raporcie).
- **Archi:** archi-lukrum.

## Raport
