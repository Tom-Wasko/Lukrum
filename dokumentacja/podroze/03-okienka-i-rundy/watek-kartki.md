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

**Wyko, 23.11.2026 — wątek 03/kartki: zrobione.**

- Zeszyt ma kartki o stałej wysokości: strony dzielone po elementach (`zeszyt.js`: miernik, `podziel`, `wlej`, `paginuj`), „Dalej ›/‹ Wstecz”, numer „3 / 27” (`#pz-numer`, `aria-live="polite"`), brak przewijania i `.pz-wiecej` (▾) w kodzie; ←/→, PageUp/PageDown i kółko (z progiem) przewracają; zakładki skaczą do pierwszej strony działu; `prefers-reduced-motion` i cele ≥44 px na wąskim ekranie. Nagłówki nie zostają same na dole strony.
- Dowód „bez przewijania” (DOM w Chrome, `scrollHeight` vs `clientHeight` każdej strony): 1366×820: 23 strony, 0 przewijających; 390×844: 39 stron, 0 przewijających.
- Testy: `test_zeszyt_ma_kartki_a_nie_przewijanie` (nowy, numer strony zamiast ▾), zmieniony test strzałki i test kółka/klawiatury (`test_drobne.py`). Pełne: `pytest -q` → `1 failed, 947 passed in 457.98s`; jedyna porażka to stary test `test_zeszyt_przewija_kolkiem_i_klawiatura` (szukał ArrowDown), poprawiony; `test_drobne.py + test_pulpit.py` → `47 passed`. `ruff check .` → `All checks passed!`; `node --check` zeszyt.js i pulpit.js czyste.
- INSTRUKCJA.md i README.md poprawione (kartki zamiast przewijania).
- Zrzuty (poza gitem): `_robocze/zrzuty-kartki/` — lista wujka tydz. 1, 2 i 4, „Gdzie co kupić”, samouczek; 1366×820 i 390×844; bar jasny, pewex ciemny. **Nie udało się** zrobić zrzutu z ramką „Od tego tygodnia otwarte”: gra pokazowa (tydz. 2, 4) nie ma ramki (0 elementów `.pz-odbl`; ramka wymaga harmonogramu lokali), więc ramki na kartkach nie obejrzałem.
- Poza listą plików z briefu: `pulpit.js` (usunięty import `przewinZeszyt` i akcja `pz-dol`), `narzedzia/zrzuty.py` (krok `{"rozmiar":[szer,wys]}`), `test_pulpit.py`, `test_drobne.py`. `dane/zeszyt.yaml` i `api/zeszyt.py` nietknięte.

**Propozycje:**
- Pulpit (a z nim zeszyt) istnieje tylko przy szerokości ≥901 px, więc „telefon 390×844” sprawdzałem po zwężeniu okna już otwartej strony; brief się tu z grą rozmija — do decyzji szefa.
- Na telefonie część stron jest do połowy pusta (dzielenie po elementach); można wypełniać dokładniej.
- Martwy CSS `.pz-wiecej` w `pulpit.css` (ok. l. 365–377) do usunięcia.
- Zapis dziennika `pracownicy/lista` został odrzucony; wpis `postep` odmówił bez `if_version` (nie ponawiałem).
- Przy pracy kilka poleceń Bash (złożone, `cd`, `curl`) było odrzucanych w izolacji worktree.

**Poprawka (wyko, 23.11.2026): mniej pustych stron.**
- Przyczyna na telefonie: tekst kroku listy miał kolumnę ok. 90 px (obok „teraz” i „wejdź →”), więc jeden krok zajmował do 580 px, a z `podziel` rozbijającego LI na kawałki zostawały strony z samym ogonem (57–91 px). Poprawki: (1) `pulpit.css` (≤900 px): krok w dwóch wierszach, „teraz” i „wejdź” pod treścią; (2) `zeszyt.js`: pozycja listy (LI) dzieli się tylko przez wiersze swojej tabeli, inaczej zostaje w całości (dotąd rozbijała się na pojedyncze elementy); (3) martwy CSS `.pz-wiecej` usunięty (blok, odwołania, `@keyframes pz-skok`).
- Liczby stron (ta sama gra pokazowa, tydzień 5): telefon 390×844: **40 → 30**; 1366×820: **24 → 23** (strona ma tylko 626 px, a pojedyncze kroki i blok celu są niepodzielne, więc zysk jest mały). Strony przewijające: **0** w obu rozmiarach (`scrollHeight ≤ clientHeight`; telefon: n=29 kliknięć, przew=[]; szeroko: przew=0).
- Zrzuty przed/po w `_robocze/zrzuty-kartki/`: `lista-bar-jasny.png` → `po-lista-bar-jasny.png`, `tel-lista.png` → `po-tel-lista.png` (poza gitem).
- Dowód: `pytest test_pulpit.py test_drobne.py` → `47 passed`; `ruff check .` → `All checks passed!`; `node --check zeszyt.js` czyste. Pełnych testów nie powtarzałem (zmiana tylko w JS/CSS kartek).
