# Dźwięki

- **Stan:** kod w grze (podróż 04, wątek dzwieki, Z11, 24.11.2026); pliki nagrań czekają na akceptację listy przez szefa
- **Gdzie w grze:** ⚙ → Dźwięk (suwaki, „wycisz wszystko”), wejście do lokalu, paragon, list z decyzjami, zeszyt, teczki;
  panel mistrza gry `/mg/` (wyciszenie klasy); spis licencji: strona `/nagrania-w-radiu`

## Dla ucznia (do instrukcji)
Gra ma krótkie dźwięki: dzwonek nad drzwiami lokalu, kasę przy zakupie, stempel na liście z decyzjami, szelest kartki
w zeszycie i teczki przy otwarciu okna. Są włączone, ale ciche. Do tego w każdym miejscu można włączyć odgłosy tła:
gwar w lokalu, szum ulicy na mapie, stukot w biurze, ciszę w banku. Odgłosy są domyślnie wyłączone. Muzyki tu nie ma,
muzyka jest tylko w radiu. W ⚙ → Dźwięk ustawia się głośność obu rodzajów albo wycisza wszystko. Nauczyciel może
wyciszyć dźwięk całej klasy, wtedy widać napis „Dźwięk wyciszony przez prowadzącego”.

## Zasada działania
- Dane: `dane/dzwieki.yaml` (pliki z autorem, źródłem i licencją; zdarzenie → dźwięk; miejsce → odgłos albo „cisza”;
  głośności domyślne). Silnik gry ich nie czyta. `panel_gracza/dzwieki.py` daje `/dzwieki.json` (bez logowania).
- Panel (`static/pulpit/dzwiek.js`, Web Audio): nic nie gra przed pierwszym kliknięciem; tło przechodzi płynnie przy
  wejściu do wnętrza i powrocie na mapę; brak pliku = cisza bez błędu; stan w localStorage (`lukrum-dzwiek`).
- Odgłos miejsca: najpierw id budynku, potem jego rodzaj, na końcu `domyslne`. Własny lokal drużyny: `lokal`.
- Wyciszenie przez prowadzącego: flaga `dzwiek_wyciszony` w konfiguracji gry (`POST /api/gry/<id>/prowadzenie`),
  widoczna w widoku gracza (`gra.dzwiek_wyciszony`).
- Radio (wątek `04/radio`) woła `lukrum.dzwiek.przycisz(true)`, żeby gwar cichł, gdy gra radio.
- Test `testy/aplikacja/test_dzwieki.py` pilnuje, że:
  - każdy gotowy plik ma autora, źródło i licencję CC0 albo domenę publiczną i leży w paczce;
  - każde miejsce z `budynki.yaml` ma odgłos albo „cisza”;
  - brak pliku daje pusty spis, a wyciszenie przez prowadzącego działa w API.

## Liczby i źródła
| Parametr | Wartość | Pewność | Plik | Źródło |
|---|---|---|---|---|
| Głośność krótkich dźwięków | 40 % | założenie | `dane/dzwieki.yaml` | do odsłuchu w grze testowej |
| Głośność odgłosów tła | 30 % | założenie | `dane/dzwieki.yaml` | do odsłuchu w grze testowej |
| Czas przejścia tła | 1,2 s | założenie | `dane/dzwieki.yaml` | do odsłuchu |
| Przyciszenie tła przy radiu | 25 % głośności | założenie | `dzwiek.js` | do odsłuchu (wątek `04/radio`) |
| Licencje | CC0, domena publiczna | potwierdzone | `panel_gracza/dzwieki.py` | decyzja szefa 23.11.2026 |

## Czego uczy (do planu zajęć)
- pojęcia: domena publiczna i licencja CC0 (a nagrania na wolnych licencjach i prawa autorskie)
- pytanie do omówienia na lekcji: dlaczego lokal może użyć nagrania CC0, a przeboju z radia nie, i po czym poznać licencję?
- krótkie zadanie dla drużyn: znaleźć na stronie „Nagrania w radiu” dźwięk, który zagrał w grze, i odczytać jego licencję.

## Do promocji
W LUKRUM drzwi kebaba dzwonią, kasa dzwoni, a każdy dźwięk ma wpisane źródło i licencję.

## Nawiązanie literackie
Brak (dźwięki to tło miejsc, bez odniesienia do konkretnej lektury).

## Otwarte
Lista nagrań do zaakceptowania przez szefa; nazwy plików w danych są robocze. Sprawy do decyzji: [Czeka na szefa](../Stan.md).
