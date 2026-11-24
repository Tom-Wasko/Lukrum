# Wujek przy ladzie

- **Stan:** w grze (podróż 04, wątek wujek, Z13, 24.11.2026)
- **Gdzie w grze:** wnętrze kebabu (przy ladzie, z prawej strony), dymek wujka; zdjęcie wujka na ścianie

## Dla ucznia (do instrukcji)
Wujek prowadził kiedyś bar i zagląda do Waszego kebabu tylko wtedy, gdy dzieje się coś ważnego. Wtedy staje przy ladzie
(w kaszkiecie i z wąsem, ze zwiniętą gazetą) i mówi jedno zdanie: pocieszy, ostrzeże albo pochwali. W zwykłym tygodniu go nie ma.
Okazje to: pierwszy tydzień, pierwszy tydzień na minusie, rekordowy utarg, pierwszy kredyt, wejście w debet, kontrola
sanepidu, otwarcie drugiego lokalu, wyraźny spadek nastroju załogi, połowa gry i ostatni tydzień. Gdy zdarzy się kilka
naraz, wujek mówi o tej najważniejszej. Na każdą okazję ma trzy różne kwestie, więc nie powtarza się co rundę.

## Zasada działania
- Dane: `dane/wnetrza/dymki.yaml` (30 kwestii: po 3 na okazję), progi w `dane/wnetrza/silnik.yaml` (`okazje`).
- Wykrywanie: `silnik/wnetrza/stan.py` z wyników ostatniej rundy. Tylko wskaźniki, które silnik już liczy.
- Pierwszeństwo (od najważniejszej): ostatnia runda, koniec półrocza, pierwsza strata, debet, kontrola sanepidu,
  pierwszy kredyt, pierwsza filia, spadek nastroju, rekord, start. Stała `OKAZJE` w `silnik/wnetrza/schematy.py`.
- Wujek mówi najwyżej raz na rundę i nie podlega przełącznikom rodzajów dymków u mistrza gry.
- Okazje: debet (wejście w debet na koniec rundy, nie każdy kolejny tydzień), pierwszy kredyt (w rundzie po wzięciu
  pierwszego), kontrola sanepidu (była w poprzedniej rundzie), pierwsza filia (drugi lokal wynajęty w poprzedniej rundzie),
  spadek nastroju (średni nastrój załogi spadł o ≥ 10 pkt na skali 0–100), koniec półrocza (runda po połowie rund,
  tylko w grze od 4 rund).

## Czego uczy (do planu zajęć)
- pojęcia: kredyt i raty, debet, kontrola sanepidowska, rozwój firmy (filia), motywacja pracowników, ocena półroczna
- pytanie do omówienia: co wujek zobaczył w liczbach, że powiedział to akurat teraz?
- krótkie zadanie dla drużyn: wypiszcie okazje, przy których wujek stanął u Was przy ladzie, i napiszcie, co zrobiliście po jego słowach.

## Do promocji
„Wujek zagląda do kebabu tylko w ważnych momentach. Zgadnij, co go dziś przyprowadziło.”

## Nawiązanie literackie
Wujek z dawnego baru to głos doświadczenia, jak stary subiekt Rzecki w „Lalce” (Prus): pamięta, jak było, i radzi bez nadęcia.
