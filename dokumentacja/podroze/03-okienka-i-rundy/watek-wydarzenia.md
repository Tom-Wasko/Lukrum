# Wątek: wydarzenia (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md`. Są tam zasady, makiety, testy i commity.
- **Cel:**
  - Wydarzenia wyglądają jak tablica korkowa z kartkami (Z34, wariant A).
  - Przy opcjach są wskazówki skutków ▲▼ (Z33).
  - Każdy park ma własny wygląd, a przycisk w parku prowadzi do wydarzenia.
- **Decyzje szefa (`dokumentacja/Decyzje.md`, 22.11):**
  - Wydarzenia to **wariant A: tablica korkowa ze wskazówkami ▲▼**.
  - Wskazówki pokazują **kierunek i siłę**: ▲▲, ▲, ▼ albo ▼▼ przy wskaźniku, np. „Opinia ▲▲ · Kasa ▼”.
    Bez dokładnych liczb.
  - Siłę liczysz z danych skutków opcji. Progi trzymasz w `dane/*.yaml`, nie w kodzie.
  - **Każdy park ma własny wygląd** przy tym samym układzie (postać i wydarzenie).
  - Przycisk w parku prowadzi do wydarzenia, nie do kalendarza.
  - Liczba wydarzeń na liście ma się zgadzać z widokiem po „Zareaguj”. To poprawiono w 02, nie zepsuj tego.
- **Pliki do zmiany:**
  - `zakladki/zdarzenia.js`;
  - `swiat/sceny/park.js` i ewentualne nowe pliki z wyglądem parków;
  - dane w `gra/dane/zdarzenia/`;
  - odczyt skutków w `gra/api/prezentacja.py`. Dopisz osobną funkcję, bo wątek `03/wyniki` też może coś tam dopisać;
  - style;
  - testy w `gra/testy/` (zdarzenia, aplikacja, swiat).
- **Nie ruszaj:** `swiat/rysunek.js`, `zakladki/dostawcy.js`, `swiat/sceny/poczta.js`, `pulpit/*`, `zakladki/wujek.js`,
  `mapa/*`, `swiat/sceny/zana_*`.
- **Gotowe, gdy:**
  - W okienku wydarzeń jest tablica korkowa.
  - Przy każdej opcji są wskazówki z siłą. Test sprawdza, że siła wynika z danych przykładowego wydarzenia.
  - Każdy park z `gra/dane/mapa/budynki.yaml` ma wygląd, który da się odróżnić od innych.
  - Przycisk parku otwiera wydarzenie.
  - Pełne testy są zielone.
  - W `dokumentacja/funkcje/` jest notatka o wskazówkach.

## Raport (wyko, 22.11)
**Zrobione**
- Wskazówki ▲▼ (Z33): `api/prezentacja.py` (`wskazowki_opcji`, `wskazowki_zdarzen`) liczy kierunek i siłę z kosztu i skutków opcji;
  progi i nazwy wskaźników (Kasa, Goście, Czas, Kontrola, Kadra) w nowym `dane/zdarzenia/wskazowki.yaml` (schemat `PlikWskazowek`,
  plik opcjonalny). Opcja ma też `ciag` („ciąg dalszy…”). Wskazówki są też przy sprawach w lokalu.
- Tablica korkowa (Z34, wariant A): `zakladki/zdarzenia.js` (`oknoParku` owija wydarzenia w tablicę z nagłówkiem i licznikiem,
  kartki na pinezkach, `wskazowkiHtml`), style w bloku „podróż 03/wydarzenia” w `styl.css` (tylko zmienne motywu).
- Wygląd parków: nowy `swiat/parki_wyglad.js` – 7 parków, każdy ma własne godło, hasło i wzór tła.
- Przycisk parku: `swiat/sceny/park.js` (`parkId`) + `swiat/wnetrze.js` (jedna linia i import) otwiera `oknoParku`, nie kalendarz.
- Licznik zgodny z widokiem „Zareaguj” – logika list nietknięta.
- Notatka `dokumentacja/funkcje/wskazowki-skutkow-tablica-wydarzen.md`; `gra/INSTRUKCJA.md` (akapit Parki).
**Dowody**
- `pytest testy/swiat/test_wskazowki.py test_zdarzenia.py` → 13 passed; `test_parki_wyglad.py` → 2 passed.
- Pełne testy: 903 passed, 1 failed (`test_zamrozona_kopia_ma_wszystkie_pliki_danych` – nowy opcjonalny plik); po dopisaniu
  wyjątku w teście: `test_dane_zamrozone.py` → 5 passed. Pełnego przebiegu po tej poprawce nie powtarzałem (6 min).
- `ruff check .` → All checks passed; `silnik.dane sprawdz` → Dane w porządku; `node --check` na 4 zmienionych modułach → ok.
- Zrzuty (okno parku, bar jasny i pewex ciemny, makieta danych w prawdziwym CSS): `C:/Users/PC/Pulpit/lukrum/_robocze/03-wydarzenia/`.
**Uwagi**
- Zmiana cudzego pliku spoza listy: `testy/rdzen/test_dane_zamrozone.py` (jeden wyjątek dla opcjonalnego pliku) i `swiat/wnetrze.js`.
- Zrzuty zrobiłem na stronie próbnej z danymi udawanymi (nie w żywej grze); nie sprawdzałem ręcznie palety „wysoka”.
- Statyczny serwer `http.server` na porcie 8782 został uruchomiony; zatrzymanie było zablokowane – proszę zamknąć (niegroźny).
- „Opinia” z przykładu szefa nazwałem „Goście” (to popyt w lokalach); do zmiany w `wskazowki.yaml`.
**Propozycje:** kalibracja progów po lekcjach; zrzuty w wysokiej widoczności.
