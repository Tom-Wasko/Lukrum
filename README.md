# LUKRUM

**LUKRUM** (z łac. *lucrum*, czyli zysk) to przeglądarkowa symulacja biznesowa dla szkół średnich. Drużyny uczniów
prowadzą kebaby na wspólnej mapie Lublina. Każda runda to tydzień: drużyny ustalają menu i ceny, zamawiają towar,
zatrudniają ludzi, biorą kredyty, rozliczają podatki i reklamują się. Konkurują przy tym ze sobą i z botami.
Nauczyciel jako mistrz gry prowadzi rundy i może odsłaniać kolejne części gry, dopasowując trudność do klasy.

Gra powstaje jako pomoc do lekcji WOS i podstaw przedsiębiorczości.

## Co jest w grze

- **Mapa Lublina** z danych OpenStreetMap, z płynnym przybliżaniem. Budynki to żetony, kliknięcie otwiera wnętrze.
- **Miejsca zamiast zakładek:** Mój kebab, Stare Miasto, Hurtownie, Park handlowy, Miasteczko akademickie, Kamienica
  bankowa, Biurowiec przy Zana, Urzędy, redakcja „Kuriera rankingowego”.
- **Plan tygodnia z listem od wujka:** lista kroków po kolei, pierwszy niezrobiony ma znacznik „teraz”.
- **Wynik 0–1000 pkt** w pięciu działach, gazeta „Kurier rankingowy” co tydzień i podium na koniec gry.
- **Trzy palety** (Bar mleczny, Pewex, wysoka widoczność), każda jasna i ciemna. Stan nigdy samym kolorem (▲ ▼ !).
- **Dla nauczyciela:** panel mistrza gry, zakrywanie funkcji, tryb lekcyjny (pierwsze rundy na żywo, kolejne
  z terminem), projekt pięciu scenariuszy lekcji.

## Stan prac

| Etap | Co | Stan |
|---|---|---|
| 1 | Gra pod nową nazwą, nowa dokumentacja | zrobione |
| 1½ | Wygląd: palety, kroje, grafiki wnętrz | zrobione, do przeglądu autora |
| 2 | Mapa Lublina z przybliżaniem i wejściem do budynków | zrobione, poprawki w toku |
| 3 | Wszystkie miejsca gry z własnymi wnętrzami | w toku (pełne wnętrze ma kebab, reszta jest schematyczna) |
| 4 | Lekcje: scenariusze i tryb lekcyjny | projekt gotowy, bez próby w klasie |
| 5 | Audyt i publikacja | do zrobienia |


## Uruchomienie

Potrzebny jest Python 3.12 lub nowszy. Na Windows wystarczy kliknąć dwa razy **`start.bat`**. Za pierwszym razem
skrypt przygotuje środowisko i zainstaluje pakiety, a potem gra otworzy się w przeglądarce pod adresem
http://127.0.0.1:8765.

Ręcznie:

```
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python manage.py graj        # przygotowanie bazy + serwer + przeglądarka
```

Gra z kolegami przez internet: `hostuj.bat`, czyli tymczasowy link przez tunel Cloudflare. Logowanie kontem
szkolnym Microsoft jest opisane w [`dokumentacja/LOGOWANIE_MICROSOFT.md`](dokumentacja/LOGOWANIE_MICROSOFT.md).

## Dla graczy i nauczycieli

- Instrukcja gry: [`INSTRUKCJA.md`](INSTRUKCJA.md). W grze jest pod adresem **/jak-grac**. Część „Dla mistrza
  gry” jest na końcu instrukcji.
- Panel mistrza gry: **/mg/**. Tam zakłada się grę i konta drużyn, prowadzi rundy i wybiera odsłonięte funkcje.
- Scenariusze lekcji (projekt): [`dokumentacja/SCENARIUSZE_LEKCJI.md`](dokumentacja/SCENARIUSZE_LEKCJI.md).

## Dla programistów i agentów

| Plik | Co zawiera |
|---|---|
| [`AGENTS.md`](AGENTS.md) | mapa repozytorium, polecenia, zasady kodu |
| [`dokumentacja/STACK.md`](dokumentacja/STACK.md) | technologie i architektura |
| [`dokumentacja/OPIS_GRY.md`](dokumentacja/OPIS_GRY.md) | mechaniki i budowa gry |

Plan, postęp, decyzje, wygląd, opisy funkcji i raporty serii są w osobnym repozytorium notatek `Tom-Wasko/Lukrum-notatki`.

## Zastrzeżenie

LUKRUM to gra edukacyjna. Nazwy prawdziwych firm i miejsc służą tylko do oddania realiów Lublina. Oferty, ceny,
oprocentowania i zdarzenia w grze są fikcyjne. Gra nie jest związana z tymi firmami ani przez nie wspierana.

Mapa Lublina w grze korzysta z danych © autorzy [OpenStreetMap](https://www.openstreetmap.org/copyright) (licencja ODbL):
granice dzielnic, woda, zieleń, drogi i kolej. Przetworzone dane są w `panel_gracza/static/mapa/lublin.json`,
a skrypt, który je pobiera, to `narzedzia/mapa/pobierz_osm.py`. Fonty (Oswald, PT Sans, Alfa Slab One, Atkinson
Hyperlegible) są w repozytorium na licencji OFL (`panel_gracza/static/fonty/OFL.txt`).

## Autor

Tom-Wasko. Kod jest prywatny do czasu publikacji.

Jak powstał projekt i jak użyto AI: [METODA.md](METODA.md) (szkic).
