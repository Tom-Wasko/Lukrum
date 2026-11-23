# Odblokowania w liście wujka

- **Stan:** w grze (podróż 03, wątek odblokowania, Z15, 23.11.2026)
- **Gdzie w grze:** zeszyt wujka → strona „Lista”: ramka „Od tego tygodnia otwarte” nad celem tygodnia

## Dla ucznia (do instrukcji)
Gra odblokowuje nowe rzeczy z tygodnia na tydzień: nowych dostawców, kanały szukania ludzi, reklamy, ubezpieczenia
i tak dalej. Nie trzeba o tym pamiętać ani liczyć tygodni: wujek ogłasza każdą nowość w liście. W ramce „Od tego tygodnia
otwarte” stoi, co się otworzyło, gdzie to znaleźć (budynek ▸ wnętrze) i po co to jest. Kliknięcie miejsca przybliża
mapę do budynku, tak jak przy zadaniach tygodnia.

## Zasada działania
- Terminy odblokowań zostają w kalendarzu gry (`silnik/harmonogram.py`, `dane/katalog.yaml`, `dane/funkcje.yaml`).
  Nauczyciel jako mistrz gry może je zmienić dla swojej gry.
- Ogłoszenie liczy się z harmonogramu **tej gry**: jeśli mistrz gry przesunie termin, list ogłasza element w nowym
  tygodniu, a nie w starym. Teksty listów nie zapowiadają odblokowań na sztywno.
- Teksty ogłoszeń są w `dane/zeszyt.yaml: odblokowania`, po jednym na element harmonogramu (tekst, żeton budynku,
  wnętrze). Test pilnuje, że żaden element nie jest bez tekstu. Tydzień 1 (przygotowanie) bez ogłoszeń.
- Widok: `api/zeszyt.py` (`odblokowania`), rysuje `panel_gracza/static/pulpit/zeszyt.js`.

## Liczby i źródła
Brak własnych liczb. Tygodnie odblokowań: `dane/katalog.yaml` i dane poszczególnych elementów (źródło tam).

## Czego uczy (do planu zajęć)
- pojęcia: rozwój firmy etapami, planowanie inwestycji, koszt a korzyść nowej możliwości
- pytania do omówienia: po co sklep otwiera nowy dział dopiero po jakimś czasie? Która nowość z listu opłaci się Waszej firmie
  najpierw?
- krótkie zadanie dla drużyn: wybierzcie jedną nowość z listu i zapiszcie, ile mogłaby kosztować i zarobić.

## Do promocji
„Co tydzień wujek ogłasza, co się otworzyło w mieście. Zdążycie pierwsi?”

## Nawiązanie literackie
Lalka (Prus): Wokulski patrzy, jak miasto otwiera nowe sklepy i możliwości, i uczy się, że w handlu liczy się, kto zauważy
je pierwszy.
