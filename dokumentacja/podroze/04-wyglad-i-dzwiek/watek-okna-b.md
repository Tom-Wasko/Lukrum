# Wątek: okna-b (podróż 04)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/04-wyglad-i-dzwiek/wspolne.md`, `plan.md`, `dokumentacja/Wyglad.md`,
  **`dokumentacja/wiedza/analizy/spis-okien.md`** (katalog ram i spis okien; wzór z wątku `04/wzor`) oraz
  `gra/panel_gracza/static/swiat/okna.css` (jak zrobiono wzór: reguły `.szk.karta--s2` i `--s4`). Gałąź bazowa: `main`.
  Równolegle pracuje `04/okna-a` (ramy s2 i s4 w `okna.css`, okna podrzędne banku, kadr, urzędu) i `04/dzwieki`.
- **Cel (Z49, decyzja szefa 23.11, wzór zaakceptowany 24.11):** „w środku okien są nadal panele ze starego projektu”.
  Zawartość każdego okna ma pasować do **swojej ramy**; nie jeden szablon dla wszystkich, ale całość spójna.
  Szef obejrzał wzór (Sokole Oko i bank w s2, kadry w s4) i przyjął go bez uwag.
- **Do zrobienia:**
  1. **Rama s1 (teczka kartonowa)**: język z katalogu ram (karton, karty katalogowe z zadrukowaną etykietą, przyciski
     jak zszywki/etykiety; stan znakami, nie kolorem). Wszystkie okna s1 ze spisu 2a (stan stare/mieszane).
  2. **Ramy „inne”** (sklep, auto, lokal; agencja nieruchomości: lokale, licytacje, notariusz, Twoje klucze i inne
     wiersze „inne” w spisie): dobierz język do ramy, którą już mają.
  3. **s3 (czysta apka)**: tylko sprawdź na zrzutach, że stare komponenty pasują (to jej własny język); popraw rażące.
  4. Okna podrzędne (spis 2b) w Twoich modułach: `oferta.js`, `inwestycje.js`, `dostawcy.js`, `handel.js` (giełda w s1:
     sprawdź, czy rama pasuje) – rama rodzica; paragon zostaje.
  5. Spis: stan każdego Twojego okna → „zgodne”, kolumna z nazwą zrzutu.
- **Jak:** style w **nowym pliku `swiat/okna-teczka.css`** (podpięty w `gra.html` zaraz po `swiat/okna.css`), selektory
  zawężone do ramy, tylko zmienne z `motywy/zmienne.css`. Zmiany HTML w modułach tylko gdy CSS nie wystarczy; logika
  i teksty bez zmian. Paleta „wysoka”: bez ozdób obniżających kontrast (≥ 7:1).
- **Nie ruszaj:** `styl.css`, `swiat/okna.css` i moduły `04/okna-a` (`banki`, `finanse`, `harpagon`, `hr`,
  `rynek_pracy`, `urzad`, `wlasciciel`, `zdarzenia`, `mapa`), mechaniki, `dane/*.yaml`, plików dźwięku i radia.
- **Zrzuty:** `gra/narzedzia/zrzuty.py`, port 8783, `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-okna-b/`, każde okno „po”
  (a dla 3 przykładowych też „przed”): bar jasny, pewex ciemny, wysoka ciemny, 1366×768, `<okno>-<paleta>-<tryb>.png`.
  Po pracy zatrzymaj serwer.
- **Gotowe, gdy:** wszystkie Twoje okna w spisie „zgodne” ze zrzutami; `testy/swiat` + `testy/aplikacja` zielone,
  `ruff`, `node --check` zmienionych modułów; na koniec pełne testy (wynik w raporcie).
- **Archi:** archi-lukrum.

## Raport
