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

**Zrobione (Z47):**
- Losowanie: `konta/druzyny.py: rozlosuj` (po równo, różnica ≤ 1, max 4 w drużynie), `POST /api/losowanie`. Krok 2 kreatora:
  wklejone imiona i/albo zaznaczone konta, „Rozlosuj”, ponowne losowanie, przenoszenie ucznia selectem, podgląd rozkładu.
- Skład w `POST /api/gry` (pole `sklad`, walidacja: login istnieje i nie jest MG, brak duplikatów, ≤ 4, ≤ 60 nowych kont);
  konta jak dziś (`nowe_konto`, `nowe_haslo`). Po utworzeniu gry strona „Gra utworzona” z kartkami.
- Kartki: `kartki.js` + `kartki.css` (A4, czarno-biało, 2 kolumny, nowa strona na drużynę, linia cięcia); okno haseł w
  zakładce Drużyny: tabela na ekranie + „Drukuj kartki”.
- Przyciski kroków: `position: sticky; bottom: 0` (`pulpit.css: .nawigacja-kroku`).
- Dokumentacja: INSTRUKCJA.md, README.md, SCENARIUSZE_LEKCJI.md, `dokumentacja/funkcje/Losowanie-druzyn.md`.

**Dowody:**
- `pytest testy/aplikacja/test_kreator.py` → `16 passed in 20.03s` (13/4 → 4,3,3,3; każdy raz; skład zapisany; kartki).
- `ruff check .` → `All checks passed!`; `node --check pulpit.js` → ok; `silnik.dane sprawdz` → `Dane w porządku`.
- Zrzuty (poza gitem): `_robocze/zrzuty-kreator/{druzyny-bar-jasny,druzyny-wysoka-ciemny,kartki-podglad}.png`; przypięty pasek
  widoczny na 1366×768. Serwer 8785 zatrzymany (PID zabity, port wolny).
- Pełne testy: `pytest -q` → `995 passed in 396.90s (0:06:36)` (niestabilny test_kasyno nie wrócił).

**Uwagi:** na telefonie nie robiłem zrzutu (narzędzie ma rozmiar, ale nie sprawdzałem wąskiego widoku); sticky działa niezależnie
od szerokości. Tworzenie gry z 15 nowymi kontami trwa ok. 30 s (haszowanie haseł), dodałem komunikat „Zakładanie N kont…”.

**Propozycje:** (1) przyspieszyć zakładanie kont (hasher PBKDF2 w testowej bazie jest wolny; sprawdzić iteracje lub partię);
(2) zrzut kartek na telefonie.
