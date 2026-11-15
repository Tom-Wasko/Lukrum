# LUKRUM

**LUKRUM** (z łac. *lucrum*, czyli zysk) to przeglądarkowa symulacja biznesowa dla szkół średnich. Drużyny uczniów
prowadzą kebaby na wspólnej mapie Lublina. Każda runda to tydzień: drużyny ustalają menu i ceny, zamawiają
towar, zatrudniają ludzi, biorą kredyty, rozliczają podatki i reklamują się. Konkurują przy tym ze sobą i z botami.
Nauczyciel jako mistrz gry prowadzi rundy i może odsłaniać kolejne części gry, dopasowując trudność do klasy.

Gra powstaje jako pomoc do lekcji WOS i podstaw przedsiębiorczości.

## Stan prac

| Etap | Co | Stan |
|---|---|---|
| 1 | Gra pod nową nazwą, nowa dokumentacja | zrobione, przegląd autora |
| 1½ | Planowanie nowego wyglądu | do zrobienia |
| 2 | Prototyp mapy Lublina z przybliżaniem | w toku: nowa mapa na granicach dzielnic z OpenStreetMap, budynki-ikony, pasek skrótów |
| 3 | Wszystkie miejsca w grze na mapie | do zrobienia |
| 4 | Scenariusze lekcji dla nauczyciela | do zrobienia |

Szczegóły i zadania: [`dokumentacja/POSTEP.md`](dokumentacja/POSTEP.md).

## Uruchomienie

Potrzebny jest Python 3.12 lub nowszy. Na Windows wystarczy kliknąć dwa razy **`gra/start.bat`**. Za pierwszym razem
skrypt przygotuje środowisko i zainstaluje pakiety, a potem gra otworzy się w przeglądarce pod adresem
http://127.0.0.1:8765.

Ręcznie:

```
cd gra
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python manage.py graj        # przygotowanie bazy + serwer + przeglądarka
```

Gra z kolegami przez internet: `gra/hostuj.bat`, czyli tymczasowy link przez tunel Cloudflare. Logowanie kontem
szkolnym Microsoft jest opisane w [`gra/LOGOWANIE_MICROSOFT.md`](gra/LOGOWANIE_MICROSOFT.md).

## Dla graczy i nauczycieli

- Instrukcja gry: [`gra/INSTRUKCJA.md`](gra/INSTRUKCJA.md). W grze jest pod adresem **/jak-grac**.
- Panel mistrza gry: **/mg/**. Tam zakłada się grę i konta drużyn, prowadzi rundy i wybiera odsłonięte funkcje.

## Dla programistów

- Przewodnik po kodzie i zasady pracy: [`AGENTS.md`](AGENTS.md).
- Technologie i polecenia: [`dokumentacja/STACK.md`](dokumentacja/STACK.md).
- Jak działa gra (mechaniki): [`dokumentacja/OPIS_GRY.md`](dokumentacja/OPIS_GRY.md).

## Zastrzeżenie

LUKRUM to gra edukacyjna. Nazwy prawdziwych firm i miejsc służą tylko do oddania realiów Lublina. Oferty, ceny,
oprocentowania i zdarzenia w grze są fikcyjne. Gra nie jest związana z tymi firmami ani przez nie wspierana.

Mapa Lublina w grze korzysta z danych © autorzy [OpenStreetMap](https://www.openstreetmap.org/copyright) (licencja ODbL):
granice dzielnic, woda, zieleń, drogi i kolej. Przetworzone dane są w `gra/panel_gracza/static/mapa/lublin.json`,
a skrypt, który je pobiera, to `narzedzia/mapa/pobierz_osm.py`.

## Autor

Tom-Wasko. Kod jest prywatny do czasu publikacji.
