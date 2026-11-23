# Wątek: wzor (podróż 04)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/04-wyglad-i-dzwiek/wspolne.md`, `plan.md` tej podróży,
  `dokumentacja/Wyglad.md`. Gałąź bazowa: `main`. Równolegle pracuje `04/dzwieki` (pliki dźwięku, nie wygląd okien).
- **Cel (Z49, decyzja szefa 23.11):** „w niektórych oknach (np. Sokole Oko – zleć śledztwo) styl jest już PRL-owy,
  ALE w środku tego okna są nadal panele wzięte ze starego projektu (w nowoczesnym stylu)”. Zawartość każdego okna ma
  pasować do **jego własnej ramy**. Szef: „poszczególne karty mają już swoje style (teczka/paragon/list/itd.), nie
  wciskaj jednego template do wszystkich, chcę aby wszystko wyglądało spójnie”.
- **Ustalone (nie sprawdzaj ponownie):**
  - Punkt sceny (`swiat/sceny/<id>.js`, pole `teczka`) otwiera okno-teczkę (`swiat/wnetrze.js` → `c.teczka(ekran)`,
    styl ramy `swiat/wnetrza.css` `.teczka-okno`), a w środku renderuje się stary ekran z `zakladki/<ekran>.js`.
  - Stare komponenty są w `styl.css` (`.karta`, `.kafel` z `.kg/.kt/.kd`, `.btn`, `.pole`, `.pigulka`, `.komunikat`,
    `.podpowiedz`, `.wiersz`, `.pasek`, `.siatka`, tabele, `.wykres`) i używają starych zmiennych (`--biel`, `--pom`,
    `--zielony`, `--karta`, `--cien`, `--linia`). Okna już przerobione na własny rekwizyt: paragon (zakupy w sklepach,
    `swiat/rysunek.js` R.zamow/R.koszyk), tablica korkowa (wydarzenia, `zakladki/zdarzenia.js`), list w kopercie
    (poczta), zeszyt wujka (`pulpit/zeszyt.js`), wyniki tygodnia.
- **Do zrobienia:**
  1. **Spis wszystkich okien gry** → `dokumentacja/wiedza/analizy/spis-okien.md`: tabela scena → punkt („et”) → ekran
     (`zakladki/…`) → rama (teczka, paragon, list, tablica, okienko urzędu, `okno()` z `wspolne.js`, inne) → co w środku
     jest stare (klasy) → stan (stare / mieszane / zgodne). Także okna spoza scen (pulpit: ⚙, portfel, wyniki, MG nie).
     Przejdź WSZYSTKIE sceny z `swiat/sceny/index.js` i wszystkie wywołania `okno(`.
  2. **Katalog ram**: dla każdego rodzaju ramy krótko „język” zawartości (np. teczka akt: maszynopis, rubryki
     z kropkami, pieczątka zamiast pigułki, przycisk jak stempel/pieczątka; okienko urzędu: druk urzędowy, pola
     formularza; paragon: już jest). Bez kopiowania cudzych grafik; nutka PRL, czytelność jak apka (`Wyglad.md`).
  3. **Wzór na 3 oknach:** Sokole Oko ▸ „Zleć śledztwo” (`zakladki/konkurencja.js`, scena `detektyw.js`), bank
     (`zakladki/banki.js`, sceny banków), kadry (`zakladki/hr.js`, agencja pracy / zaplecze kebaba). Style zawartości
     per rama w **nowym pliku `swiat/okna.css`** (podpięty tam, gdzie `wnetrza.css`), selektory zawężone do ramy
     (np. `.teczka-okno .kafel`), tylko zmienne z `motywy/zmienne.css`. Zmiany HTML w modułach tylko gdy CSS nie
     wystarczy; logika i teksty bez zmian.
- **Nie ruszaj:** `styl.css` (stare ekrany poza oknami muszą działać), mechaniki, `dane/*.yaml`, pliki `04/dzwieki`
  (`pulpit/dzwiek.js`, `pulpit/radio.js`, `dane/dzwieki.yaml`).
- **Zrzuty:** `gra/narzedzia/zrzuty.py`, port 8781, do `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-wzor/`. Dla 3 okien
  **przed i po**: bar jasny, pewex ciemny, wysoka ciemny, 1366×768; nazwy `<okno>-<paleta>-<tryb>-przed|po.png`.
  Po pracy zatrzymaj serwer.
- **Gotowe, gdy:** spis i katalog ram są; 3 okna przerobione, zrzuty przed/po; testy `testy/swiat` i `testy/aplikacja`
  zielone, `ruff`, `node --check` zmienionych modułów. Pełnych testów jeszcze nie (Archi pokaże wzór szefowi; po
  akceptacji ten sam wątek dostanie resztę okien jako kontynuację).
- **Archi:** archi-lukrum.

## Raport
