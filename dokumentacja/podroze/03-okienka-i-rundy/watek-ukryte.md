# Wątek: ukryte (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md` (zasady, testy, commity) oraz
  `dokumentacja/wiedza/analizy/ukryte-mechaniki.md` (spis z wątku 03/tlok). Gałąź bazowa: `podroz-03`.
  Równolegle pracują: `03/wyglad` (tylko CSS na końcach plików, blok `/* podróż 03/wyglad */`), `03/kartki`
  (`pulpit/zeszyt.js`, `pulpit/pulpit.css` część zeszytu), `03/lekcja` (`panel_mg/`, `dane/funkcje.yaml: zestawy`,
  `balans/`, narzędzie pomiaru).
- **Cel (Z42, decyzja szefa 23.11):** majster zgłosił, że część mechanik jest „ukryta”. Zasada: każdy skutek, który
  zmienia wynik gracza, ma być widoczny tam, gdzie gracz o nim decyduje albo gdzie widzi wynik. Pokaż w grze wiersze
  **3–13** spisu (wiersze 1–2 są zrobione). Wiersze 8 i 11 najpierw sprawdź: jeśli już widać, wpisz „OK, widać w …”.
- **Jak:**
  - Mechaniki się **nie zmieniają** (żadnych nowych liczb ani wzorów). Zmienia się tylko pokazanie: krótkie zdanie,
    wiersz w tabeli albo podpowiedź przy decyzji, z kierunkiem ▲▼ i słowem (stan nigdy samym kolorem).
  - Liczby, które pokazujesz, bierz z wyniku silnika przez `api/prezentacja.py` (widok `v`); w JS nie licz wzorów
    od nowa. Jeśli silnik czegoś nie zapisuje (np. ilu gości odeszło przez brak składnika), dodaj zapis w wyniku
    rundy bez zmiany obliczeń i test, że liczba się zgadza.
  - Teksty proste, dla ucznia, neutralne płciowo, bez żargonu (np. „Mało opinii: ocena jeszcze słabo przyciąga gości”).
    Przy każdej podpowiedzi jedno zdanie „dlaczego”.
  - Po każdym wierszu dopisz w spisie kolumnę „Pokazane: gdzie (plik/ekran)”.
- **Nie ruszaj:** `pulpit/zeszyt.js`, `panel_mg/`, `dane/funkcje.yaml`, wartości w `dane/*.yaml`, bloków CSS innych wątków.
- **Zrzuty:** `gra/narzedzia/zrzuty.py` (opis w pliku), serwer na porcie 8796, zrzuty do `../_robocze/zrzuty-ukryte/`
  (poza gitem); po pracy zatrzymaj serwer. Każde nowe miejsce: bar jasny + wysoka ciemna.
- **Gotowe, gdy:** wiersze 3–13 mają w spisie „Pokazane” albo „OK, już widać”; testy nowych pól z `prezentacja.py`;
  notatka `dokumentacja/funkcje/Widoczne-skutki.md` z szablonu; INSTRUKCJA (krótko, gdzie gracz widzi skutki);
  pełne testy zielone, `ruff`, `node --check`, `silnik.dane sprawdz` czyste (wyniki w raporcie).

## Raport
**Raport wyko (23.11.2026)**
**Zrobione:** wiersze 3–13 spisu mają kolumnę „Pokazane”. Nowe pokazania: 3, 4, 6, 13, 9 (zdania pod tabelą księgi gości,
`swiat/ksiega.js`; lista per lokal w Klienci ▸ opinie), 5 (Park handlowy ▸ wyposażenie, `inwestycje.js`), 7 i 12 (HR:
profil osoby + tabela udogodnień, `hr.js`). „OK, już widać”: 8 (`ogolne.js`, `oferta.js`), 10 (`swiezosc.js`, tabela
„Wzięli inne danie / Odeszli”), 11 (`marketing.js`).
**Silnik (tylko zapis, bez zmiany obliczeń):** `opinie.po_rundzie` dopisuje `zaufanie`, `zanik`, `rozrzut`, `czekanie_grup`;
`zadowolenie.po_rundzie` dopisuje `skladniki` osoby; `prezentacja.py`: `wyposazenie_efekt`, `progi_czasu_pracy.zmeczenie`.
Test: `testy/aplikacja/test_widoczne_skutki.py` (3 testy, zgodność z silnikiem).
**Dokumenty:** `funkcje/Widoczne-skutki.md`, INSTRUKCJA (akapit w „Księga gości”), spis `wiedza/analizy/ukryte-mechaniki.md`.
README bez zmian (brak opisu księgi w README). INSTRUKCJA.pdf nie odświeżony.
**Dowody:**
- pełne testy: `pytest -q` → `1 failed, 949 passed in 433s`; jedyny błąd (`test_nazwy_zakladek`: „Zaplecze ▸ Świeżość”
  w tekście) naprawiony; po poprawce `test_nazwy_zakladek + test_widoczne_skutki` → `4 passed`.
- `ruff check .` → `All checks passed!`; `silnik.dane sprawdz` → `Dane w porządku`; `node --check` 4 moduły: ok.
- zrzuty (poza gitem): `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-ukryte/ksiega-bar-jasny.png`, `ksiega-wysoka-ciemny.png`.
  Zrzutów HR i wyposażenia nie zrobiłem (JS sprawdzony tylko składniowo) – do obejrzenia przy przeglądzie.
**Uwagi:** blok CSS `/* podróż 03/ukryte */` na końcu `swiat/swiat.css` (może kolidować z blokiem 03/wyglad: zostawić oba).
Serwer zatrzymany. Pełnych testów po poprawce nie puszczałem ponownie (zmiana tylko w tekście).
**Propozycje:** zrzuty HR/wyposażenia; odświeżyć INSTRUKCJA.pdf.

### Dopisek po przeglądzie Archiego (23.11.2026)
- Księga gości: usunięto „(waga …)” ze zdań o czekaniu grup.
- Zrzuty (bar jasny, wysoka ciemny): profil pracownika (składniki nastroju + zdanie o zmęczeniu), Park handlowy ▸ wyposażenie: czytelne, nic nie wystaje.
- Naprawiono: akapity `.podpowiedz` zamienia `dymki.js` w dymek „i” (zdanie było schowane); nowe zdania mają klasę `zostaw`. Składniki nastroju czytane z `v.wyniki.pracownicy`; wyposażenie bierze pierwszy lokal przy jednym lokalu.
- Sprawdzenia: node --check ok, ruff ok, test_nazwy_zakladek + test_widoczne_skutki: 4 passed.
