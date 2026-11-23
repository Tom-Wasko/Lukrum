# Nawiązania i źródła

- **Stan:** w grze (podróż 03, wątek prawo, Z23, 23.11.2026)
- **Gdzie w grze:** strona `/zrodla` (bez logowania); odnośniki: ⚙ → „O grze” → „Nawiązania i źródła”, stopka strony „Jak grać”, stopka `INSTRUKCJA.md`

## Dla ucznia (do instrukcji)
Gra nie podpisuje na ekranach, skąd wzięły się postacie i nazwy, bo zgadywanie jest częścią zabawy. Gdy chcecie
sprawdzić, otwórzcie stronę „Nawiązania i źródła”: jest tam klucz (postać, utwór, autor), informacja, na czym oparto
liczby i prawo, kto jest autorem grafik, krojów pisma i nagrań oraz z jakiej mapy korzysta gra.

## Zasada działania
- Treść leży w `dane/zrodla.yaml`; silnik jej nie czyta. `panel_gracza/zrodla.py` wczytuje plik (nowa wersja pliku bez
  restartu), `widoki.zrodla` renderuje `templates/panel_gracza/zrodla.html`.
- Akapit o liczbach pokazuje, ile parametrów gry jest „potwierdzonych”, „skalibrowanych” i „założeniem” (liczone z `dane/zalozenia.yaml`).
- Nagrania: odsyłacz do `/nagrania-w-radiu` (autor, wykonawca, licencja każdego pliku).
- Test `testy/aplikacja/test_zrodla.py` pilnuje, że klucz w `INSTRUKCJA.md` i w danych jest spójny, a strona i odnośniki istnieją.
- Nowa grafika, font, nagranie albo lektura: dopisz wiersz w `dane/zrodla.yaml` (i w `dokumentacja/wiedza/wykaz-grafik-i-fontow.md`).

## Czego uczy (do planu zajęć)
- pojęcia: źródło, licencja (domena publiczna, SIL OFL, ODbL), prawo autorskie, rzetelność danych
- pytania do omówienia: czym różni się „potwierdzone” od „założenia”? Dlaczego mapa musi mieć podpis OpenStreetMap?
- krótkie zadanie: znajdźcie w grze 5 nawiązań literackich, a potem sprawdźcie się w kluczu.

## Do promocji
„Skąd się wzięła Ziemia Obiecana w bankach? Sprawdźcie w kluczu nawiązań.”

## Nawiązanie literackie
„Lalka” Prusa: autor lubił ukryte aluzje i prawdziwe realia Warszawy; tu aluzje mają klucz, a realia Lublina mają źródła.
