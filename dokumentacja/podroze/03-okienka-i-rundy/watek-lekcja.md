# Wątek: lekcja (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md` (zasady, testy, commity),
  `gra/dokumentacja/SCENARIUSZE_LEKCJI.md` (5 lekcji) i sekcję „Trzeci plan” w `plan.md` tej podróży.
  Gałąź bazowa: `podroz-03`. Równolegle pracują: `03/wyglad` (CSS), `03/ukryte` (`api/prezentacja.py`, zakładki
  gracza), `03/kartki` (`pulpit/zeszyt.js`).
- **Cel (Z17 + Z45, decyzja szefa 23.11: „co trzeba zrobić przed testami na klasie”):** gra ma być gotowa na lekcję
  45 minut z klasą ok. 30 osób (6–8 drużyn po 1–4 osoby), prowadzoną przez nauczyciela w `/mg/`.
  1. **Czas rundy.** Zmierz, ile trwa runda: czas przeliczenia tygodnia przez silnik przy 8 drużynach (skrypt
     w `balans/`, np. `balans/czas_rundy.py`) i liczba kliknięć/ekranów, które drużyna musi przejść w każdej lekcji
     ze scenariuszy (z zestawem odsłoniętych funkcji). Wynik: tabela w `dokumentacja/wiedza/analizy/czas-lekcji.md`
     (lekcja → funkcje → kroki → szacowany czas decyzji → przeliczenie). Cel: runda ≤ 15 min, lekcja z omówieniem 45 min.
  2. **Zestawy funkcji pod lekcje.** W `dane/funkcje.yaml: zestawy` dodaj po zestawie na każdą z 5 lekcji
     (np. `lekcja_1_zakladamy_firme`), z nazwą i opisem dla nauczyciela; zestaw odsłania tylko to, czego lekcja uczy.
     Test: każdy zestaw istnieje w kreatorze i daje grę, którą bot może przejść 3 rundy bez błędu.
  3. **Kreator trybu lekcyjnego w `/mg/`.** Sprawdź na zrzutach (bar jasny, 1366×768, rozdzielczość szkolnego
     laptopa), że nauczyciel w ≤ 3 krokach zakłada grę z zestawem lekcji i drukuje kartki z hasłami drużyn.
     Popraw drobne usterki; większe zmiany układu wpisz jako propozycje.
  4. **Próba obciążenia (Z45).** Uruchom serwer tak jak `manage.py hostuj` (bez tunelu, lokalnie) i skryptem
     (biblioteka standardowa albo `requests`, jeśli już jest w `requirements.txt`) zasymuluj 30 graczy w 8 drużynach:
     logowanie, wczytanie panelu, zapis decyzji co kilka sekund, wysłanie, a MG zamyka rundę. Zmierz czasy odpowiedzi
     (mediana, 95. percentyl) i błędy. Wynik w `czas-lekcji.md`. Jeśli coś jest wolne albo pada (np. blokada SQLite
     przy zapisie), opisz przyczynę; drobną poprawkę zrób, większą opisz jako propozycję.
- **Nie ruszaj:** wartości mechaniki w `dane/*.yaml` (poza `funkcje.yaml: zestawy`), `pulpit/zeszyt.js`, plików
  `03/ukryte`. Bez połączeń z internetem (tunel Cloudflare nie jest potrzebny do pomiaru).
- **Zrzuty:** `gra/narzedzia/zrzuty.py`, serwer na porcie 8798, zrzuty do `../_robocze/zrzuty-lekcja/` (poza gitem);
  po pracy zatrzymaj wszystkie serwery i procesy symulacji.
- **Gotowe, gdy:** `czas-lekcji.md` z liczbami (czas rundy, kroki na lekcję, wynik obciążenia); 5 zestawów lekcji
  z testem; zrzuty kreatora; SCENARIUSZE_LEKCJI.md podaje zestaw przy każdej lekcji; INSTRUKCJA (część „Dla mistrza
  gry”) poprawiona; pełne testy zielone, `ruff`, `node --check`, `silnik.dane sprawdz` czyste (wyniki w raporcie).

## Raport
**Stan: gotowe** (gałąź `worktree-podroz-03-lekcja`, bez push). Liczby i wnioski: `dokumentacja/wiedza/analizy/czas-lekcji.md`.

**Zrobione**
- Czas rundy: silnik przelicza tydzień 8 drużyn w 0,6 s (maks. 0,86 s) dla każdego zestawu; tabela lekcja po lekcji
  (zadania, kliknięcia, namysł) to **szacunek**, nie pomiar na żywej klasie. Lekcje 1–4 mieszczą się w 25 min gry,
  najbardziej ryzykowna jest lekcja 1 (8 zadań).
- 5 zestawów `lekcja_1…5` w `dane/funkcje.yaml: zestawy` + test `testy/rdzen/test_zestawy_lekcji.py` (obecność w kreatorze,
  3 rundy bota).
- Próba obciążenia 30 uczniów / 8 drużyn (`balans/obciazenie.py`): 0 błędów serwera. Znalazła 3 realne wady, poprawione
  z testem `testy/aplikacja/test_klasa_naraz.py`: limit logowania z jednego IP (429), „database is locked” (WAL, timeout,
  IMMEDIATE), kolejka połączeń 10→128. Odpowiedzi po starcie: `stan` 20 ms, zapis decyzji 25 ms (p95 126 ms), zamknięcie
  rundy 191 ms. **Nie spełnione „< 1 s” przy starcie całej klasy naraz**: logowanie mediana 3,4 s, strona gry 3 s, widok
  po zamknięciu rundy 1,9 s (jeden proces Pythona, GIL). Nie naprawiałem (duże).
- Kreator `/mg/` (bar jasny 1366×768): zestawy lekcji widoczne w kroku 3, utworzenie gry z zestawem i okno z hasłami do
  druku działają. Zrzuty w `_robocze/zrzuty-lekcja/` (poza gitem).
- `SCENARIUSZE_LEKCJI.md` podaje zestaw przy każdej lekcji; INSTRUKCJA „Dla mistrza gry” poprawiona (lista zestawów,
  „Pierwsza gra” nie jest już polecana na lekcję 1).

**Dowody**
- `pytest -q -p no:cacheprovider` → `956 passed in 438.38s`
- `ruff check .` → `All checks passed!`
- `silnik.dane sprawdz` → `Dane w porządku: … (wersja 62a4fac80df3)`
- `node --check`: nie dotyczy, żaden plik JS nie zmieniony.
- `test_mistrz_gry_widzi_klub` nie zawiódł.

**Pliki poza briefem** (konieczne do poprawek z próby obciążenia): `gra/lukrum/settings.py`, `gra/lukrum/rozgrzewka.py`,
`gra/balans/obciazenie.py`, `gra/balans/czas_rundy.py`, `gra/testy/aplikacja/test_klasa_naraz.py`.

**Decyzje szefa / pytania**
1. Stanu funkcji nie zmienia się po utworzeniu gry, więc zestawy „na lekcję” oznaczają **nową grę na każdą lekcję**.
   Czy gra z lekcji 1 ma móc przejść na zestaw lekcji 2 (zmiana „co i po co”)?
2. Czy wdrażać serwer wieloprocesowy do `hostuj` (zysk przy starcie klasy)?

**Propozycje (nie wdrożone)**
- Kreator: „Rozlosuj uczniów po drużynach” i kartki z hasłami w podziale na drużyny (dziś 2 kliknięcia na ucznia, 60 dla
  30; to największa przeszkoda przed lekcją; w 3 krokach da się tylko założyć grę i wydrukować hasła).
- Przyciski kroków kreatora przypiąć do dołu ekranu („Utwórz grę” jest poniżej krawędzi 1366×768).
- Zestaw lekcji ustawia też liczbę rund (domyślnie 18) i tryb lekcyjny.
- Pasek ładowania przy logowaniu/starcie; prośba o logowanie drużyna po drużynie; pamięć podręczna widoku po `przelicz`.
- Okruszek „Lublin” skleja się z tytułem w oknie MG („LublinNowe konta”) – styl `karty.css`, współdzielony.

**Sprzątanie:** serwery i symulacje zatrzymane (port 8798 wolny). Usunięcie `_robocze/lekcja/` (pliki robocze, poza gitem)
zablokowane przez uprawnienia – do skasowania ręcznie.
