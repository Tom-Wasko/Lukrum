# Wspólne dla wszystkich wątków podróży 04 (nie sprawdzaj ponownie)

## Projekt i makiety
- Gra jest w `gra/`. Przewodnik po kodzie: `gra/AGENTS.md`. Zasady: `CLAUDE.md` w korzeniu.
- Ścieżki JS liczone są od `gra/panel_gracza/static/`.
- Wzór okien z wątku 04/wzor (po akceptacji szefa): `dokumentacja/wiedza/analizy/spis-okien.md` i `swiat/okna.css`.

## Zasady
- **Ta podróż zmienia tylko wygląd i dźwięk.** Mechanika, liczby i treść tekstów bez zmian.
- Liczby gry tylko w `dane/*.yaml`.
- Teksty dla gracza po polsku: neutralne płciowo, proste.
- Kolory tylko przez zmienne.
- Każdy ekran działa w 3 paletach (bar, pewex, wysoka z kontrastem co najmniej 7:1), każda w trybie jasnym i ciemnym.
- Stan nigdy samym kolorem: zawsze znak (▲ ▼ ✓ !).
- **Zero wzmianek o innych grach biznesowych.**
- Okienko otwierasz przez `okno(...)` z `zakladki/wspolne.js`.
- Kliknięcie we wnętrzu zawsze otwiera okienko nad wnętrzem, nigdy osobną kartę.

## Inne wątki
- Wątki podróży 04: `04/wzor`, `04/okna-a`, `04/okna-b`, `04/dzwieki`, `04/radio` (patrz `plan.md`).
- Trzymaj się swoich plików. Swoje reguły CSS dopisuj na końcu pliku w bloku `/* podróż 04/<wątek> */`.
- Jeśli musisz dotknąć cudzego pliku, zrób najmniejszą możliwą zmianę i opisz ją w raporcie.

## Testy i serwer
- Python bierz z `C:/Users/PC/Pulpit/lukrum/gra/.venv/Scripts/python`, bo w worktree nie ma venv.
- Do nowej logiki dopisz test pytest w `gra/testy/`.
- W trakcie pracy uruchamiaj tylko dotknięte testy. Na koniec raz:
  - pełne testy: `python -X utf8 -m pytest -q -p no:cacheprovider 2>&1 | tail -5`;
  - `ruff check .`;
  - `node --check` na zmienionych modułach.
- Serwer: `manage.py graj --port <własny z zakresu 8781–8789> --bez-przegladarki`. Gra testowa: `manage.py gra_pokazowa`.
  Portu 8765 nie zajmuj. Po pracy zatrzymaj serwer.

## Commity i dokumentacja
- Commity tylko jako `git -c user.name=Tom-Wasko commit`, bez dopisków o AI. Nie rób push.
- Rób commit po każdym większym kroku.
- Gdy zmienia się to, co widzi gracz, popraw README i INSTRUKCJA.
- Przy nowej albo przerobionej funkcji napisz notatkę `dokumentacja/funkcje/<Nazwa>.md` według szablonu z tego folderu.

## Pytania i zrzuty
- Szef śpi i odpowie rano. Pytanie „co i po co” wyślij do Archiego, a w tym czasie rób resztę.
  W spornym miejscu wybierz wariant najbliższy makiecie i opisz go w raporcie.
- Zrób 2–4 zrzuty ekranu (tryb jasny i ciemny) do `C:/Users/PC/Pulpit/lukrum/_robocze/03-<wątek>/`. Nie dodawaj ich do gita.
