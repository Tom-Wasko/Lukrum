# Wątek: okna (podróż 04)

## Brief
- **Kontynuacja `04/wzor`** (ten sam wyko; wzór scalony do `main` w ae06cae). Szef 24.11: **jeden wyko na wszystkie okna**
  (bez podziału na okna-a i okna-b). Najpierw `git merge main` oraz `git merge worktree-podroz-04-okna-b` (commit 06bab8b:
  `swiat/okna-teczka.css` dla ramy s1, zrobiony przez zatrzymanego wyko okna-b; przejrzyj i kontynuuj albo popraw).
  Równolegle pracuje tylko `04/dzwieki` (pliki dźwięku).
- **Cel (Z49, szef 24.11: wzór „wszystkie są spoko”):** każde okno ze spisu `dokumentacja/wiedza/analizy/spis-okien.md`
  w stanie „zgodne”, językiem swojej ramy, jak we wzorze.
- **Do zrobienia, część A (ramy s2 i s4, `swiat/okna.css`):**
  1. Wszystkie okna s2 i s4 ze spisu 2a o stanie stare/mieszane: obejrzeć na zrzutach, uzupełnić reguły (urząd, harpagon,
     ubezpieczenia, giełda, VAT, sanepid, kalendarz, księga, wnioski, udogodnienia… według spisu). Znana poprawka: w s2
     nagłówki kafli (`.kt`) mają zaokrąglone górne rogi.
  2. Okna podrzędne (spis 2b) z ramą rodzica (`styl: stylEkranu(...)` albo równoważnie); formularze banku → s2.
- **Część B (rama s1, ramy „inne”, s3; `swiat/okna-teczka.css` podpięty po `okna.css`):**
  1. **Rama s1 (teczka kartonowa)**: język z katalogu ram (karton, karty katalogowe z zadrukowaną etykietą, przyciski
     jak zszywki/etykiety; stan znakami, nie kolorem). Wszystkie okna s1 ze spisu 2a (stan stare/mieszane).
  2. **Ramy „inne”** (sklep, auto, lokal; agencja nieruchomości: lokale, licytacje, notariusz, Twoje klucze i inne
     wiersze „inne” w spisie): dobierz język do ramy, którą już mają.
  3. **s3 (czysta apka)**: tylko sprawdź na zrzutach, że stare komponenty pasują (to jej własny język); popraw rażące.
  4. Okna podrzędne (spis 2b) w Twoich modułach: `oferta.js`, `inwestycje.js`, `dostawcy.js`, `handel.js` (giełda w s1:
     sprawdź, czy rama pasuje) – rama rodzica; paragon zostaje.
  5. Spis: stan każdego Twojego okna → „zgodne”, kolumna z nazwą zrzutu.
- **Kolejność:** najpierw dokończ s1 (zaczęte), potem s2/s4, potem „inne”, s3 i okna podrzędne. Commit po każdej ramie.
- **Nie ruszaj:** `styl.css`, mechaniki, tekstów, `dane/*.yaml`, plików dźwięku i radia (`pulpit/dzwiek.js`, `pulpit/radio.js`).
  Zmiany HTML w modułach tylko gdy CSS nie wystarczy; tylko zmienne z `motywy/zmienne.css`; „wysoka” ≥ 7:1, bez ozdób.
- **Zrzuty:** port 8781, `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-okna/`, każde okno „po”: bar jasny, pewex ciemny,
  wysoka ciemny, 1366×768, `<okno>-<paleta>-<tryb>.png`. Archi zrobi z nich galerię dla szefa. Po pracy zatrzymaj serwer.
- **Gotowe, gdy:** wszystkie okna w spisie „zgodne” ze zrzutami; `testy/swiat` + `testy/aplikacja` zielone, `ruff`,
  `node --check` zmienionych modułów; na koniec pełne testy (wynik w raporcie).
- **Archi:** archi-lukrum.

## Raport
