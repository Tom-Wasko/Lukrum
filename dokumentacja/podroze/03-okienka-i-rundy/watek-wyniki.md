# Wątek: wyniki (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md`. Są tam zasady, makiety, testy i commity.
- **Cel:**
  - Jeden prosty ekran wyników tygodnia w kebabie (Z36).
  - Portiernia w biurowcu przy Zana jako spis pięter (Z38).
- **Decyzje szefa (`dokumentacja/Decyzje.md`, 22.11):**
  - „Czyste wyniki” to **jeden prosty ekran wyników tygodnia w kebabie**. Pokazuje cztery rzeczy:
    - sprzedaż;
    - koszty;
    - zysk;
    - miejsce w rankingu.
  - Ekran ma być łatwy do znalezienia: osobny punkt we wnętrzu kebaba albo wyraźny przycisk przy ladzie.
    Punkt „Lada” zostaje jednym ekranem „Mój lokal”.
  - Porównanie z poprzednim tygodniem pokazujesz znakiem ▲▼, nie samym kolorem.
  - W rundzie 1, zanim minie pierwszy tydzień, ekran mówi, że wyniki pojawią się po pierwszym tygodniu.
  - Portiernia to **spis pięter**: która agencja jest na którym piętrze i przejście do windy albo na piętro.
    Zastępuje listę wszystkich agencji.
  - „Internet” zostaje ekranem reklamy w sieci.
- **Pliki do zmiany:**
  - nowy moduł ekranu wyników, np. `zakladki/wyniki.js`;
  - rejestr w `zakladki/index.js` i wpis w `dane/funkcje.yaml: zakladki` (pilnują tego testy);
  - punkt w scenie kebaba;
  - `swiat/sceny/zana_portiernia.js`;
  - `swiat/sceny/winda_zana.js`, tylko przejście na piętro;
  - testy.
- **Dane:** bierz je z istniejącego widoku `v` (`api/prezentacja.py`). Jeśli trzeba dopisać pole, zrób osobną funkcję,
  bo wątek `03/wydarzenia` też może coś tam dopisać.
- **Nie ruszaj:**
  - części zakupowych `swiat/rysunek.js`;
  - `zakladki/dostawcy.js`, `zakladki/zdarzenia.js`, `zakladki/wujek.js`;
  - `swiat/sceny/park.js`, `swiat/sceny/poczta.js`;
  - `pulpit/*`, `mapa/*`.
- **Gotowe, gdy:**
  - W kebabie jest ekran wyników z czterema liczbami i porównaniem.
  - Portiernia pokazuje spis pięter z przejściem.
  - Test sprawdza dane wyników.
  - Pełne testy są zielone.
  - Jest notatka `dokumentacja/funkcje/Wyniki-tygodnia.md`.

## Raport

**Zrobione (commit 77d4f85, gałąź `worktree-podroz-03-wyniki`):**
- Ekran `wyniki_tygodnia` (`zakladki/wyniki.js`): sprzedaż, koszty, zysk, miejsce w rankingu, każde ze znakiem ▲▼ względem poprzedniego tygodnia. W rundzie 1 komunikat „Wyniki pojawią się po pierwszym tygodniu”.
- Dane: nowa funkcja `wyniki_tygodnia()` w `api/prezentacja.py` → `v.wyniki_tygodnia` (z KPiR i historii rankingu; bez liczb gry w kodzie).
- Kebab: tablica „WYNIKI” nad kasą (`swiat/sceny.js`), punkt w `swiat/miejsca.js`, ekran w `MENU` (Mój kebab ▸ pod) i w rejestrze `index.js`. „Lada” zostaje „Mój lokal”.
- Portiernia: `zana_portiernia.js` ma spis pięter (4 wiersze klikalne na piętra + wiersz „Winda”), bez gabloty kampanii. `winda_zana.js` bez zmian (przejście na piętro już było).
- Test: `testy/aplikacja/test_wyniki_tygodnia.py` (5 testów). Notatka: `dokumentacja/funkcje/Wyniki-tygodnia.md`. INSTRUKCJA i README poprawione.

**Dowody:**
- Pełne testy: `pytest -q -p no:cacheprovider` → `904 passed in 377.08s`.
- `ruff check .` → `All checks passed!`; `node --check` na zmienionych modułach: ok.

**Odstępstwa i uwagi:**
- Nie dopisałem wpisu w `dane/funkcje.yaml: zakladki`: ekran jest zawsze dostępny, a podobne (Mój lokal, ranking) też nie są funkcją. Test `test_funkcje` przechodzi.
- Styl okna dla `wyniki_tygodnia` jest domyślny (nie dopisałem do `pulpit/karty-style.js`, bo to zakazany folder). Archi może przypisać styl.
- Zrzutów ekranu nie zrobiłem (nie uruchamiałem serwera/przeglądarki). Wygląd (tablica w scenie, kafle w 3 paletach) nie jest sprawdzony wzrokowo.
- Zmieniłem cudzy plik tylko minimalnie: `swiat/swiat.css` (blok `/* podróż 03/wyniki */` na końcu), `index.js`, `miejsca.js`, `sceny.js` (po jednej wstawce).

## Propozycje
- Przypisać styl okna w `karty-style.js` i sprawdzić tablicę w scenie na zrzutach.
