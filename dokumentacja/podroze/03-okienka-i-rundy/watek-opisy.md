# Wątek: opisy (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md`. Są tam zasady, testy i commity.
  Wątki paragon, wydarzenia, list, zeszyt i wyniki są już scalone. Równolegle pracują `03/rundy` i `03/wydajnosc`.
- **Cel:**
  - Z16: opisy w grze pasują do obecnych mechanik.
  - Z25: dokumentacja gry jest aktualna.
- **Z16: opisy w grze.** Gra przeszła z zakładek na mapę, wnętrza i okienka. Teksty dla gracza wciąż mówią o
  „zakładkach”, „HR” i ekranach, których już nie ma, albo opisują stare zasady. Przejrzyj:
  - teksty w `dane/*.yaml` (opisy, podpowiedzi, `opis` budynków; bez zmiany liczb);
  - podpowiedzi i etykiety w `panel_gracza/static/`;
  - `gra/INSTRUKCJA.md` i stronę `/jak-grac`.
  Popraw tak, żeby gracz wiedział, **gdzie na mapie i w którym wnętrzu** coś zrobić. Teksty mają być proste,
  neutralne płciowo i bez żargonu.
- **Z25: dokumentacja.**
  - `gra/dokumentacja/OPIS_GRY.md`: zakładki, kwota 40 000 zł i inne nieaktualne rzeczy. Sprawdzaj w danych i w kodzie.
  - `gra/dokumentacja/STACK.md`: testy, motywy, `swiat/`, `mapa/`.
  - Martwe odsyłacze w `gra/` i `dokumentacja/`. Sprawdź je skryptem i wypisz w raporcie, co poprawione.
- **Nie ruszaj:**
  - `dane/zeszyt.yaml`, `pulpit/zeszyt*.js` i `silnik/`, bo pracuje tam `03/rundy`;
  - szablonów HTML, bo pracuje tam `03/wydajnosc`;
  - `dokumentacja/historia/`, `dokumentacja/podroze/` i `Decyzje.md`, bo to zapis historii.
- **Zasady:**
  - Nie zmieniasz liczb ani mechaniki. Tam, gdzie tekst i kod się nie zgadzają, poprawiasz tekst, a w raporcie
    zapisujesz miejsca, w których może się mylić kod.
  - Zero wzmianek o innych grach biznesowych.
  - Po każdej zmianie w `dane/` uruchom `python -X utf8 -m silnik.dane sprawdz`.
- **Gotowe, gdy:**
  - `grep -rn "zakładk" gra/dane gra/panel_gracza/static gra/INSTRUKCJA.md` nie znajduje tekstów dla gracza, które
    odsyłają do zakładek. Komentarze w kodzie mogą zostać.
  - OPIS_GRY i STACK zgadzają się z kodem.
  - Martwych odsyłaczy jest 0. Pokaż wynik skryptu.
  - PDF instrukcji jest odświeżony, jeśli repo ma do tego polecenie (sprawdź README).
  - Pełne testy są zielone.
- **Zrzuty ekranu:** nie.

## Raport
