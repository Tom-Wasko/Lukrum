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

## Raport
