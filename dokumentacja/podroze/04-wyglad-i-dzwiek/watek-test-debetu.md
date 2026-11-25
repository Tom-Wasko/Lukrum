# Wątek: test-debetu (podróż 04)

## Brief
- **Najpierw przeczytaj:** `CLAUDE.md`, `gra/AGENTS.md`, `gra/testy/pieniadze/test_debet_i_przeglad.py` (test
  `test_debet_w_rozegranej_grze_oplata_tylko_przy_minusie_na_koniec_tygodnia`) i kod debetu w `gra/silnik/` (grep „debet”).
  Gałąź bazowa: `podroz-04`.
- **Cel (Z52):** test pada w pełnym przebiegu `pytest` (zgłosili to wyko `nastroj` i `billboardy`, także na bazie sprzed
  zmian), a osobno przechodzi. Znajdź przyczynę (zależność od kolejności testów, wspólny stan, losowość, ziarno, pamięć
  podręczna modułu itp.) i napraw **u źródła** (w teście albo w kodzie, jeśli to realny błąd). Nie osłabiaj testu ani nie
  usuwaj asercji; nie zmieniaj liczb gry ani danych.
- **Jak badać:** pełny przebieg trwa ok. 7 min, więc zawężaj: uruchom plik, potem folder `testy/pieniadze`, potem pary
  (`-p no:randomly`, `--lf`, `-x`), by zlokalizować test, który psuje stan. Wyniki długich poleceń do `_robocze/`
  (`| tail -5`).
- **Zasady:** zero wzmianek o innych grach; zmiana minimalna; jeśli przyczyną jest realny błąd silnika, opisz go w raporcie.
- **Nie ruszaj:** mapy, panelu gracza, INSTRUKCJI i README.
- **Testy:** dotknięte pliki; na koniec jeden pełny przebieg `pytest -q -p no:cacheprovider 2>&1 | tail -5` i `ruff check .`.
- **Gotowe, gdy:** pełny przebieg bez tej porażki (wynik w raporcie), przyczyna opisana w 2–3 zdaniach.
  (`test_kasyno::test_mistrz_gry_widzi_klub` bywa niestabilny: zgłoś, jeśli wróci, nie naprawiaj.)
- **Archi:** archi-lukrum.

## Raport
