# Cel tygodnia

- **Stan:** w grze (podróż 03, wątek rundy, Z32, 22.11.2026)
- **Gdzie w grze:** zeszyt wujka → strona „Lista”: ramka „Cel tygodnia” nad zadaniami tygodnia

## Dla ucznia (do instrukcji)
Od drugiego tygodnia wujek zapisuje w zeszycie jeden cel na tydzień, na przykład „Sprzedajcie 300 dań”. Gdy tydzień
się zamknie, gra sprawdza, czy się udało. Wynik zobaczycie w zeszycie w następnym tygodniu: „✓ Cel osiągnięty”
albo „✗ Nie tym razem”. Za udany cel wujek poleca Was znajomym i w następnym tygodniu przychodzi trochę więcej gości.
Nie ma kary za porażkę. Obok celu zeszyt podaje 2–3 zadania tygodnia, które zrobicie w grze (na przykład „zmieńcie cenę
jednego dania”); zeszyt odhacza je sam, gdy Wasza decyzja w tym tygodniu różni się od poprzedniej.

## Zasada działania
- Cel sprawdza się po zamknięciu tygodnia, na wynikach tej rundy (`silnik/cele.py`). Wynik trafia do wyników firmy
  (`cel`) i jest widoczny w zeszycie w następnej rundzie.
- Typy celów: sprzedane dania (próg), obsłużony popyt (procent gości, którzy chcieli kupić), więcej dań albo większy
  przychód niż tydzień wcześniej, dochód na plusie.
- Nagroda za sukces to mały mnożnik popytu (+3%) na jeden następny tydzień (ten sam mechanizm co skutki zdarzeń).
- Cel nie ma losowości. Tydzień 1 bez celu. Ostatni tydzień gry ma własny cel.
- Zadania „zmiana” (cena, menu, zespół, towar, dług, koszty stałe) odhaczają się, gdy decyzja różni się od poprzedniej
  rundy. Brak długu to „zrobione od razu”. „Mniej towaru” wymaga zamówienia mniejszego niż poprzednie, ale niezerowego.

## Liczby i źródła
| Parametr | Wartość | Pewność | Plik | Źródło |
|---|---|---|---|---|
| nagroda: mnożnik popytu | 1,03 na 1 tydzień | założenie | `dane/zeszyt.yaml` (`cele.nagroda`) | Z32; boty: średnia gotówka 64 229 → 65 985 zł (3 ziarna), bez zmiany układu sił |
| progi dań (150, 300, 600, 800, 900, 1000) | wg tygodnia | skalibrowane / założenie | `dane/zeszyt.yaml` (`cele.tygodnie`) | statystyki botów poziomu średniego; próg niżej niż boty, bo drużyna zaczyna ostrożnie |
| progi realizacji popytu | 80–90% | skalibrowane / założenie | `dane/zeszyt.yaml` | boty: realizacja popytu 60–100% |

## Czego uczy (do planu zajęć)
- pojęcia: cel mierzalny (SMART), popyt a sprzedaż, przychód a dochód, rentowność, planowanie krótkoterminowe
- pytania do omówienia: czemu cel „więcej niż tydzień temu” bywa trudniejszy od celu z progiem? Co lepiej mierzyć:
  przychód czy dochód?
- krótkie zadanie dla drużyn: wybierzcie cel na tydzień i zapiszcie, które trzy decyzje pomogą go osiągnąć.

## Do promocji
„Wujek zapisał cel na tydzień. Uda się? Sprawdzimy w poniedziałek.”

## Nawiązanie literackie
Mistrz i Małgorzata (Bułhakow): „rękopisy nie płoną”, a cele zapisane w zeszycie wracają w wynikach. Mała nagroda
za dotrzymanie umowy.
