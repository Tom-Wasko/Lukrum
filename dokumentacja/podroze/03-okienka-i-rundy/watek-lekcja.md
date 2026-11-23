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
