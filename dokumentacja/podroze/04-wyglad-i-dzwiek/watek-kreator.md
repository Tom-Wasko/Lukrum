# Wątek: kreator (podróż 04)

## Brief
- **Najpierw przeczytaj:** `gra/dokumentacja/SCENARIUSZE_LEKCJI.md`, początek `panel_mg/static/mg/pulpit.js` (kreator
  w 4 krokach), `mg.js` (`pokazHasla`, skład drużyn), `konta/druzyny.py`. Gałąź bazowa: `podroz-04` (tryb
  autonomiczny). Równolegle nikt nie pracuje. Panel `/mg/` jest poza wyglądem okien gracza z tej podróży.
- **Cel (Z47, szef 23.11, przed testem na klasie 07.12, 3–4 drużyny):** szybsze przygotowanie lekcji w `/mg/`:
  1. **„Rozlosuj uczniów po drużynach”** w kreatorze (krok drużyn): nauczyciel ma listę uczniów (istniejące konta
     uczniów albo wklejone imiona, po jednym w linii – sprawdź, jak dziś trafiają uczniowie do drużyn, i podepnij się
     pod to), klik rozdziela ich losowo i po równo (różnica ≤ 1) między drużyny; wynik widać przed utworzeniem gry,
     można losować ponownie i ręcznie przenieść ucznia. Nowe konta tworzą się jak dziś (hasła z `nowe_haslo`).
  2. **Kartki z hasłami w podziale na drużyny:** widok do druku: dla każdej drużyny nagłówek z nazwą, pod nim kartki
     do wycięcia (uczeń, login, hasło, adres logowania), linia cięcia; drukuje się czytelnie na A4 (czarno-biało).
     Dotychczasowa tabela haseł zostaje jako widok na ekranie.
  3. **Przyciski kroków kreatora przypięte do dołu** (Wstecz / Dalej / Utwórz), widoczne bez przewijania na 1366×768
     i na telefonie.
- **Nie ruszaj:** silnika, `dane/*.yaml` (poza ewentualnym tekstem), panelu gracza. Wygląd zgodny z resztą `/mg/`,
  kolory tylko ze zmiennych, 3 palety × jasny/ciemny, stan nie samym kolorem; teksty neutralne płciowo.
- **Testy:** losowanie po równo (np. 13 uczniów / 4 drużyny → 4,3,3,3), każdy uczeń dokładnie raz; utworzenie gry
  z rozlosowanym składem zapisuje skład; widok kartek zawiera każdą drużynę i każdego ucznia.
- **Zrzuty:** port 8785, `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-kreator/`: krok drużyn po losowaniu (bar jasny,
  wysoka ciemny, 1366×768), podgląd wydruku kartek. Po pracy zatrzymaj serwer (jeśli zatrzymanie jest zablokowane,
  napisz w raporcie).
- **Gotowe, gdy:** jak wyżej; INSTRUKCJA („Dla mistrza gry”) i `SCENARIUSZE_LEKCJI.md` (przygotowanie lekcji)
  uzupełnione; notatka `dokumentacja/funkcje/Losowanie-druzyn.md` z szablonu; pełne testy zielone, `ruff`,
  `node --check`, `silnik.dane sprawdz` (wyniki w raporcie).
- **Archi:** archi-lukrum.

## Raport
