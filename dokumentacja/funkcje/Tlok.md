# Tłok

- **Stan:** w grze (podróż 03, wątek tłok, Z21 + Z42, 23.11.2026)
- **Gdzie w grze:** wnętrze kebaba (kolejka gości i napis „Tłok: …”), księga gości pod sceną, Klienci ▸ opinie

## Dla ucznia (do instrukcji)
Gdy załoga przez cały tydzień pracuje na pełnych obrotach, goście stoją w kolejce przy ladzie. Część poczeka i kupi,
ale będzie zła, że czekała, i wystawi niższą ocenę. We wnętrzu kebaba widać to na własne oczy: im większy tłok, tym
dłuższa kolejka, a obok jest napis „Tłok: mały ✓”, „średni –” albo „duży ▲”. W księdze gości wiersz „Czekanie” pokazuje,
ile gwiazdek kosztował Was tłok. Lekarstwo: więcej rąk do pracy, drugie stanowisko, lepszy sprzęt. Z drugiej strony
dobre wyposażenie lokalu (WiFi, parking, wystrój) podnosi ocenę, bo goście chętniej siedzą i chwalą.

## Zasada działania
- Każdego dnia liczone jest obciążenie lokalu: najbardziej zajęte stanowisko (kasa albo kuchnia), godziny potrzebne
  przez godziny dostępne, ucięte do 1 (to, czego zabrakło ponad 100%, to już „Kolejka”, goście odeszli).
- Średnia z dni tygodnia ponad progiem `tlok_prog` daje karę: `kara = tlok × czekanie grup × (średnia − próg)/(1 − próg)`.
  Grupy, które nie znoszą czekania (biurowi), karzą mocniej niż imprezowicze. Pełny tłok cały tydzień ≈ −0,3 ★.
- Wyposażenie i wystrój podnoszą ocenę osobnym składnikiem „wyposażenie” (`klienci.yaml`: `opinie.wyposazenie` × (mnożnik − 1)
  + gwiazdki z dekoru). Udogodnienia dla załogi (benefity) **nie** wchodzą do oceny wprost: działają tylko przez
  nastrój załogi, więc nic nie jest liczone dwa razy. Karty sprzętu z `boty.yaml` to wynik firmy, nie ocena gości.
- Napis we wnętrzu: z `tlok` ze stanu wnętrza (średnie wykorzystanie załogi): ≥ 0,85 duży, ≥ 0,6 średni, reszta mały.
  Stan zawsze ze znakiem (✓ – ▲), nie samym kolorem.

## Liczby i źródła
| Parametr | Wartość | Pewność | Plik | Źródło |
|---|---|---|---|---|
| próg tłoku | 0,85 | założenie | `dane/mapa/klienci.yaml` (`opinie.tlok_prog`) | brak publicznego pomiaru czasu oczekiwania w gastronomii dla tej skali; próg dobrany tak, by wolne stanowiska nie karały |
| siła tłoku | 0,3 ★ przy pełnym tłoku | założenie | `dane/mapa/klienci.yaml` (`opinie.tlok`) | boty `sredni 7`: gotówka −1,2% … +3,0%, wynik ±0,4%, układ sił bez zmiany |

Domyślnie (gdy parametrów brak w pliku) tłok nie obniża oceny (`tlok_prog` 1, `tlok` 0), więc zamrożone dane testowe
są bez zmian.

## Czego uczy (do planu zajęć)
- pojęcia: wąskie gardło, wykorzystanie zdolności produkcyjnych, jakość obsługi, reputacja, koszt zaniechania
- pytania do omówienia: czy opłaca się zatrudnić osobę, która przez pół tygodnia nie ma co robić? Ile kosztuje
  gwiazdka oceny?
- krótkie zadanie dla drużyn: znajdźcie dzień, w którym załoga jest najbardziej obciążona, i zaproponujcie, jak ten
  szczyt rozłożyć.

## Do promocji
„Kolejka za długa? Goście to widzą i piszą w księdze gości.”

## Nawiązanie literackie
Lalka (Prus): sklep Wokulskiego żyje opinią klientów i subiektów; kto każe czekać, traci pochwały.
