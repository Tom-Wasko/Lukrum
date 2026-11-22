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
