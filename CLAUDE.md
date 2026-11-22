# LUKRUM
Gra edukacyjna (symulacja biznesowa, Lublin) na lekcje WOS i konkurs „Zwolnieni z Teorii”. Repo `Tom-Wasko/Lukrum`
(prywatne). Kod w `gra/` (przewodnik po kodzie: `gra/AGENTS.md`), wiedza w `dokumentacja/`.
@gra/AGENTS.md

## Polecenia (z folderu `gra/`, `PY = .venv/Scripts/python`)
```
PY -X utf8 -m pytest -q -p no:cacheprovider testy/<plik>.py   # w trakcie: tylko dotknięte testy
PY -X utf8 -m pytest -q -p no:cacheprovider 2>&1 | tail -5    # raz na koniec (ok. 7 min)
PY -m ruff check .                                            # linia ≤ 100 znaków
PY -X utf8 -m silnik.dane sprawdz                             # po każdej zmianie dane/*.yaml
PY -X utf8 manage.py graj --port <PORT> --bez-przegladarki    # serwer w tle; potem go zatrzymaj
```

## Gdzie co jest
- `dokumentacja/`: `Stan.md` (teraz), `Zadania.md`, `Decyzje.md`, `Wyglad.md`, `Mapa.md`, `Plan.md`,
  `funkcje/` (opisy funkcji gry), `wiedza/` (współpraca, nawiązania literackie, analizy), `historia/`, `podroze/`.
- `gra/dokumentacja/`: opis gry, stack, logowanie Microsoft, scenariusze lekcji (część gry).
- `_robocze/` (kopie robocze gałęzi) i `_archiwum/` (stary warsztat, notatki, dokumenty prawne) są poza gitem.

## Ludzie
- **szef**: autor, decyduje o celach, mechanice i wyglądzie.
- **majster**: robi mapę na gałęzi `maciex`; mapę może zmieniać bez ograniczeń.
- **kapitan**: nauczyciel i opiekun ze szkoły; patrzy na stronę lekcyjną gry.

## Zasady projektu
- Zmiany majstra scalamy od razu: przed każdą podróżą i wątkiem `git fetch`, przegląd `origin/maciex`, merge do `main`,
  `node --check` i testy `testy/swiat` + `testy/aplikacja`, push. Po scaleniu wpis dla majstra
  w `dokumentacja/wiedza/wspolpraca.md`.
- Każde miejsce na mapie (`gra/dane/mapa/budynki.yaml`) ma własny żeton i własne wnętrze.
- Nowa albo przerobiona funkcja gry → notatka `dokumentacja/funkcje/<Nazwa>.md` z szablonu (dla ucznia, zasada,
  czego uczy, do promocji, nawiązanie): materiał do instrukcji, scenariuszy lekcji i promocji.
- **Zero wzmianek o innych grach biznesowych** (nazwy, mechaniki) w repo i w commitach. Mechaniki opisujemy realiami.
- Nazwa „LUKRUM” się nie odmienia. Teksty dla gracza neutralne płciowo. Prawdziwe marki tylko z zastrzeżeniem.
- Wygląd: plansza z ilustracjami + czytelna apka + nutka PRL; palety bar, pewex, wysoka (kontrast ≥ 7:1) × jasna/ciemna;
  stan nigdy samym kolorem. Inspiracje wnętrz: tylko pomysł, bez kopiowania. Szczegóły: `dokumentacja/Wyglad.md`.
- Nie commituj `gra/db.sqlite3`, `gra/lokalne.json`, `zapisy/`, `*.log`, zrzutów ekranu ani `_archiwum/`.
- README aktualny w tym samym commicie, który zmienia to, co widzi gracz, albo sposób uruchomienia.
- Pełne testy raz na koniec wątku; `test_kasyno.py::test_mistrz_gry_nie_widzi_klubu` bywa niestabilny (zgłoś).

## Compact instructions
Zachowaj: bieżącą podróż i wątki (stan, sesje wyko), decyzje szefa z tej sesji (są w `Decyzje.md`), pliki w toku,
wyniki testów (liczby), otwarte pytania.
