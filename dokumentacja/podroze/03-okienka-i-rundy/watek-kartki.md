# Wątek: kartki (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md` (zasady, testy, commity).
  Gałąź bazowa: `podroz-03`. Równolegle pracują: `03/wyglad` (tylko CSS, blok `/* podróż 03/wyglad */`),
  `03/ukryte` (księga gości, zakładki, `api/prezentacja.py`), `03/lekcja` (`panel_mg/`, `dane/funkcje.yaml`).
- **Cel (Z44, decyzja szefa 23.11):** „zeszyt ma mieć kartki, a nie scrolla”. Dziś strona zeszytu
  (`panel_gracza/static/pulpit/zeszyt.js`, ok. 440 linii) przewija się w środku (scrollBy, kółko myszy, strzałka ▾).
  Ma być jak prawdziwy zeszyt: treść dzielona na strony o stałej wysokości, przewracane „Dalej ›” i „‹ Wstecz”
  (już są rogi i animacja przewracania), z numerem strony („3 / 7”). Bez paska przewijania i bez przewijania kółkiem.
- **Jak:**
  - Dzielenie po elementach (akapit, pozycja listy, ramka „Od tego tygodnia otwarte”, tabela „Gdzie co kupić”),
    nigdy w połowie zdania. Element wyższy niż strona dostaje własną stronę i się zmniejsza albo dzieli po wierszach
    tabeli. Przeliczenie przy zmianie rozmiaru okna i trybu (jasny/ciemny nie zmienia, ale czcionka i telefon tak).
  - Klawiatura: ←/→ i PageUp/PageDown przewracają kartki; kółko myszy przewraca kartkę (z małym progiem), nie przewija.
  - Zakładki (Lista wujka, Rozpiska, Gdzie co kupić, Samouczek) zostają i skaczą do pierwszej strony działu.
  - Usuń strzałkę ▾ i jej test w `testy/aplikacja/test_pulpit.py` (około linii 167) zastąp testem numeru strony.
  - Na telefonie (390×844) jedna strona naraz zamiast rozkładówki, też bez przewijania.
  - Dostępność: numer strony czytany przez czytnik (`aria-live`), przyciski ≥ 44 px na telefonie, `prefers-reduced-motion`.
- **Nie ruszaj:** `dane/zeszyt.yaml` (treść), `api/zeszyt.py` (chyba że potrzebny podział danych; opisz w raporcie),
  plików wątków `03/ukryte` i `03/lekcja`.
- **Zrzuty:** `gra/narzedzia/zrzuty.py`, serwer na porcie 8797, zrzuty do `../_robocze/zrzuty-kartki/`
  (poza gitem); po pracy zatrzymaj serwer. Pokaż: lista wujka w tygodniu 1 i w tygodniu z ramką odblokowań, „Gdzie co
  kupić”, samouczek; 1366×820 i 390×844; bar jasny + pewex ciemny.
- **Gotowe, gdy:** żadna strona zeszytu nie ma przewijania (test JS/DOM albo test na zrzutach: `scrollHeight ≤
  clientHeight` dla każdej strony w obu rozmiarach, wynik w raporcie); INSTRUKCJA poprawiona (kartki zamiast przewijania);
  pełne testy zielone, `ruff`, `node --check` czyste.

## Raport
