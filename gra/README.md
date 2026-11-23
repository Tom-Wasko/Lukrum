# LUKRUM

**LUKRUM** (z łac. *lucrum*, czyli zysk) to przeglądarkowa symulacja biznesowa dla szkół średnich. Drużyny uczniów
prowadzą kebaby na wspólnej mapie Lublina. Każda runda to tydzień: drużyny ustalają menu i ceny, zamawiają towar,
zatrudniają ludzi, biorą kredyty, rozliczają podatki i reklamują się. Konkurują przy tym ze sobą i z botami.
Nauczyciel jako mistrz gry prowadzi rundy i może odsłaniać kolejne części gry, dopasowując trudność do klasy.

Gra powstaje jako pomoc do lekcji WOS i podstaw przedsiębiorczości.

## Co jest w grze

- **Mapa Lublina** z danych OpenStreetMap, z płynnym przybliżaniem. Budynki to żetony, kliknięcie otwiera wnętrze.
- **Miejsca zamiast zakładek:** Mój kebab, Stare Miasto, Hurtownie (okienko oferty jednego sklepu i działu), Park handlowy, Miasteczko akademickie, Kamienica
  bankowa, Kamienica rachmistrzów, Biurowiec przy Zana (winda z piętrami, piętro = oferta jednej agencji, portiernia = spis pięter), Urzędy, redakcja „Kuriera rankingowego”.
- **Tłok i opinie:** pełna załoga (obciążenie ponad 85%) wydłuża kolejkę we wnętrzu kebaba („Tłok: duży ▲”) i lekko obniża
  ocenę lokalu; wyposażenie ją podnosi. Skutki widać w księdze gości (`dokumentacja/funkcje/Tlok.md`).
- **Zeszyt wujka:** kartki o stałej wysokości zamiast przewijania (Dalej/Wstecz, numer strony, ←/→, PageUp/PageDown, kółko); list (z ramką „Od tego tygodnia otwarte”, liczoną z harmonogramu gry) i lista kroków na każdy tydzień (treść w `dane/zeszyt.yaml`), strony „Gdzie co kupić” z liczbami
  z bieżących danych gry. Kroki odhacza gra: ze stanu firmy, decyzji i wizyt we wnętrzach (zapisuje serwer). Pierwszy
  niezrobiony krok ma znacznik „teraz”. Od tygodnia 2 zeszyt podaje **cel tygodnia** (`silnik/cele.py`, dane w
  `dane/zeszyt.yaml: cele`): wynik widać w następnym tygodniu, a za udany cel przychodzi +3% gości na tydzień. Zadania
  tygodnia to konkretne ruchy w grze (zmiana ceny, towar, dług…), odhaczane, gdy decyzja różni się od poprzedniej rundy.
- **Wynik 0–1000 pkt** w pięciu działach, gazeta „Kurier rankingowy” co tydzień i podium na koniec gry.
- **Radio „Fala Koziołka”** na pasku: pięć stacji ze starymi nagraniami z domeny publicznej i z wolnych licencji
  (pliki w repozytorium, gra bez internetu), prowadzący czytany syntezatorem mowy. Spis: **/nagrania-w-radiu**.
- **Nawiązania i źródła:** strona **/zrodla** (⚙ → O grze): klucz do nawiązań literackich, źródła liczb i prawa,
  autorzy grafik, krojów pisma, nagrań i mapy (OpenStreetMap, ODbL). Treść: `dane/zrodla.yaml`.
- **Trzy palety** (Bar mleczny, Pewex, wysoka widoczność), każda jasna i ciemna. Stan nigdy samym kolorem (▲ ▼ !).
- **Dla nauczyciela:** panel mistrza gry, zakrywanie funkcji, tryb lekcyjny (pierwsze rundy na żywo, kolejne
  z terminem), projekt pięciu scenariuszy lekcji.

## Stan prac

| Etap | Co | Stan |
|---|---|---|
| 1 | Gra pod nową nazwą, nowa dokumentacja | zrobione |
| 1½ | Wygląd: palety, kroje, grafiki wnętrz | zrobione, do przeglądu autora |
| 2 | Mapa Lublina z przybliżaniem i wejściem do budynków | zrobione, poprawki w toku |
| 3 | Wszystkie miejsca gry z własnymi wnętrzami | w toku (33 wnętrza z makiet wdrożone, punkty otwierają ekrany gry; teczka decyzji w oknie na scenie – dalej) |
| 4 | Lekcje: scenariusze i tryb lekcyjny | projekt gotowy, bez próby w klasie |
| 5 | Audyt i publikacja | do zrobienia |


## Uruchomienie

Potrzebny jest Python 3.12 lub nowszy (3.12, 3.13, 3.14…; zawsze według `requires-python` w `pyproject.toml`). Na Windows wystarczy kliknąć dwa razy **`start.bat`**, na macOS i Linuksie uruchomić `sh start.sh`. Za pierwszym razem
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
- Panel mistrza gry: **/mg/**. Tam zakłada się grę i konta drużyn, prowadzi rundy, wybiera odsłonięte funkcje i przełącza zestaw funkcji na kolejną lekcję (bez zakładania nowej gry).
- Scenariusze lekcji (projekt): [`dokumentacja/SCENARIUSZE_LEKCJI.md`](dokumentacja/SCENARIUSZE_LEKCJI.md).

## Dla programistów i agentów

Panel gracza wczytuje się szybciej: strona od razu podpowiada przeglądarce wszystkie moduły JS (`modulepreload`), więc
pobierają się naraz, a nie piętro po piętrze. Nic nie trzeba budować ani instalować (szczegóły w `dokumentacja/STACK.md`).

| Plik | Co zawiera |
|---|---|
| [`AGENTS.md`](AGENTS.md) | mapa repozytorium, polecenia, zasady kodu |
| [`dokumentacja/STACK.md`](dokumentacja/STACK.md) | technologie i architektura |
| [`dokumentacja/OPIS_GRY.md`](dokumentacja/OPIS_GRY.md) | mechaniki i budowa gry |

Plan, zadania, decyzje, wygląd, opisy funkcji i historia prac są w [`../dokumentacja/`](../dokumentacja/).

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
