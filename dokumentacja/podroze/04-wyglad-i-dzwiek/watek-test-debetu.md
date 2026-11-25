# Wątek: test-debetu (podróż 04)

## Brief
Brief (Z52): znaleźć i naprawić u źródła porażkę testu
`test_debet_w_rozegranej_grze_oplata_tylko_przy_minusie_na_koniec_tygodnia` w pełnym przebiegu `pytest`.
Bez osłabiania testu i bez zmian liczb/danych. Pełna treść briefu: plik wątku w głównym checkoucie (nieskomitowany).

## Raport
**Przyczyna (Z52):** realny błąd silnika, nie kolejność testów (w tym drzewie test padał też osobno, deterministycznie:
runda 7, `agresywny`, debet 119,27). W `runda.py` opłata za tydzień na minusie liczyła się w `bk.koniec_rundy`, a minus
mógł powstać dopiero po niej (podatki, biuro, drugie `wyrownaj_gotowke`), więc debet zostawał bez opłaty i odsetek.

**Naprawa:** blok opłaty wydzielony do `banki.oplata_debetu`; `runda.py` wywołuje go ponownie po ostatnim wyrównaniu,
gdy `f.debet > 0` i bank nie naliczył opłaty. Test i dane bez zmian.

**Dowód:**
- `pytest testy/pieniadze` → `57 passed in 16.19s`
- pełny przebieg `pytest -q -p no:cacheprovider` → `1027 passed in 391.24s (0:06:31)`
- `ruff check .` → `All checks passed!`

**Uwagi:** worktree nie ma `.venv`, użyłem tego z głównego checkoutu. Plik wątku był tylko w głównym checkoucie
(nieskomitowany), więc tu jest skrócona kopia z raportem. Zmiana wpływa na grę: firmy, które kończą tydzień na minusie
przez podatki/biuro, płacą teraz opłatę i odsetki za debet (wcześniej uchodziły).
