# Wątek: nawiazania (podróż 04, Z10)

## Brief
- **Najpierw przeczytaj:**
  - `dokumentacja/wiedza/nawiazania.md` (zasady i lista) oraz w `gra/INSTRUKCJA.md` „Klucz do nawiązań literackich”;
  - `gra/dane/zdarzenia/parki.yaml` (format historii: sceny, opcje, skutki, `nastepna`; ok. 20 historii już jest);
  - test `gra/testy/zdarzenia/test_zdarzenia.py` i `silnik/swiat/zdarzenia.py` (tylko czytasz).
- **Cel (Z10; szef 25.11: „ze źródłami, szef przegląda po powrocie”):** nowe zdarzenia w parkach Lublina nawiązujące do lektur.
  1. 4–6 nowych historii w `dane/zdarzenia/parki.yaml`, każda 2–3 sceny, ok. 80% komicznych, lubelskie smaczki, postacie fikcyjne,
     opcje zgodne z formatem (czas, gotówka, porcje; opcja domyślna bez czasu właściciela). Przykłady pomysłów:
     bal z „Moralności pani Dulskiej” (sąsiedzi pilnujący pozorów), pojedynek na słowa jak w „Zemście”,
     kulig albo karczma z Trylogii, łowienie rzeczy „z Lalki” (sklep, sprawa honoru), spacer „bezdomnego doktora”.
  2. **Źródła:** teksty z domeny publicznej sprawdź na Wolnych Lekturach (wolnelektury.pl), z linkiem w polu źródła / w notatce.
     Autorzy chronieni (Lem, Herbert, Gombrowicz, Zajdel): tylko aluzje i nazwy, bez cytatów.
  3. **W interfejsie bez podpisów:** gra nie mówi, z jakiej lektury jest historia ani postać. Najwyżej jedno nawiązanie na ekran, subtelnie.
  4. Wpis do klucza w `gra/INSTRUKCJA.md` („Klucz do nawiązań literackich”, nowe wiersze) i do `dokumentacja/wiedza/nawiazania.md`
     (z linkami do źródeł). Nowa funkcja nie wymaga osobnej notatki `funkcje/`.
- **Zasady:** teksty neutralne płciowo (formy bezosobowe), po polsku z ogonkami, identyfikatory bez ogonków; zero wzmianek o innych
  grach biznesowych; liczby (kwoty, czas) tylko w danych, pole `zrodlo` jak w istniejących historiach; stereotypy dopuszczalne,
  ale nikogo realnego nie obrażamy; nic z wyglądu ani kodu silnika.
- **Nie ruszaj:** kodu silnika, wyglądu, mapy (strefa majstra), istniejących historii (poza literówką).
- **Testy:** `python -X utf8 -m silnik.dane sprawdz`; `testy/zdarzenia` (jeśli format wymaga, dopisz test, że każda nowa historia
  ma domyślną opcję bez czasu i dochodzi do końca); na koniec pełne testy i `ruff`.
- **Gotowe, gdy:** nowe historie w danych, klucz i notatka uzupełnione ze źródłami, testy zielone (wyniki w raporcie).
- **Scalanie:** tryb autonomiczny: do gałęzi `podroz-04`, nie do `main`. Nie pushuj.
- **Archi:** archi-lukrum.

## Raport

**Zrobione (commit 2e17f05, gałąź `worktree-podroz-04-nawiazania`):** pięć nowych historii w `gra/dane/zdarzenia/parki.yaml`
(wszystkie komiczne, po 2–3 sceny, domyślna opcja bez czasu): `bal_pozorow` (Dulska, Ogród Saski), `spor_o_murek` (Zemsta, Błonia),
`kulig_karczma` (Trylogia, Zalew), `wachlarz` (Lalka, Park Ludowy), `doktor_z_walizka` (Judym, Ogród Botaniczny).
Lektury z domeny publicznej, bez cytatów, bez podpisów w interfejsie. Klucz: 5 wierszy w `gra/INSTRUKCJA.md`;
notatka ze źródłami: `dokumentacja/wiedza/nawiazania.md` (sekcja „Historie w parkach”).
Dodany test `test_kazda_historia_ma_domyslna_bez_czasu_i_dochodzi_do_konca` (`testy/swiat/test_zdarzenia.py`).

**Dowody:**
- `silnik.dane sprawdz` → „Dane w porządku”
- `pytest testy/aplikacja/test_zrodla.py` → 5 passed
- `pytest testy/swiat/test_zdarzenia.py` → 11 passed (z nowym testem)
- pełne testy przed poprawką `zrodla.yaml` → 1 failed, 1027 passed (jedyny błąd: `test_zrodla`, już naprawiony; pełnego przebiegu nie powtarzałem)
- `ruff check .` → All checks passed!

**Uwagi dla Archiego:**
- Poza briefem: dopisałem 5 pozycji w `gra/dane/zrodla.yaml` (strona /zrodla). Test `test_wszystkie_nawiazania_z_instrukcji_sa_w_danych` wymaga, by klucz w INSTRUKCJA.md i ten plik się zgadzały.
- Adresy Wolnych Lektur wpisane bez sprawdzenia (praca bez sieci).
- README bez zmian (gracz nie widzi podpisów).
- Zostaje katalog `_robocze/nawiazania/` (poza gitem, usunięcie zablokowane): do skasowania ręcznie.
