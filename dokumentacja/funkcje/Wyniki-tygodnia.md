# Wyniki tygodnia

- **Stan:** w grze (podróż 03, wątek `03/wyniki`, Z36 i Z38; decyzja szefa 22.11.2026)
- **Gdzie w grze:** wnętrze kebaba, tablica „Wyniki” nad kasą (punkt „Tablica wyników”); spis pięter w portierni biurowca przy Zana

## Dla ucznia (do instrukcji)
Po każdym tygodniu możesz od razu zobaczyć, jak poszło, bez wchodzenia w tabele. Na tablicy „Wyniki” w kebabie są cztery liczby:
sprzedaż, koszty, zysk i miejsce w rankingu. Przy każdej stoi znak: ▲ znaczy lepiej niż tydzień wcześniej, ▼ gorzej,
„= bez zmian” bez zmiany. Przy kosztach ▲ oznacza, że wydaliście więcej, więc znak i kolor mówią, czy to dobrze, czy źle
(stan nigdy nie jest oznaczony samym kolorem). W pierwszym tygodniu tablica mówi, że wyniki pojawią się po tygodniu.
Szczegóły są dalej: w Kasie (wyniki finansowe) i w rankingu.
W portierni biurowca przy Zana wisi **spis pięter**: która agencja jest na którym piętrze (drukarnia 1, radio 2, eventy 3,
internet 4). Kliknięcie wiersza prowadzi na piętro, ostatni wiersz do windy.

## Zasada działania
- Ekran `wyniki_tygodnia` (`zakladki/wyniki.js`) czyta `v.wyniki_tygodnia` z `api/prezentacja.py: wyniki_tygodnia`:
  sprzedaż = przychody KPiR, koszty = koszty KPiR, zysk = dochód netto, miejsce = miejsce z historii rankingu. Do tego te same
  liczby sprzed tygodnia i poprzednie miejsce. W rundzie 1 pole jest puste.
- Żadnych liczb gry w kodzie: tylko to, co policzył silnik.
- „Internet” zostaje ekranem reklamy w sieci; portiernia nie zawiera już listy agencji ani gabloty kampanii.

## Czego uczy (do planu zajęć)
- przychód, koszt i zysk: czym się różnią i dlaczego duża sprzedaż nie zawsze daje zysk
- czytanie wskaźników w czasie: porównanie z poprzednim okresem, a nie sama wartość
- pytanie do omówienia: sprzedaż poszła w górę, a zysk w dół. Co mogło się stać?

## Do promocji
- Jeden prosty ekran „jak wyszedł tydzień”: cztery liczby i strzałki, bez księgowego żargonu.

## Nawiązanie
- brak (ekran własny gry)
