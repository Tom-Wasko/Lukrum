# Wątek: list (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md`. Są tam zasady, makiety, testy i commity.
- **Cel:** nowy wygląd listu z decyzjami rundy, który gracz wysyła na Poczcie (Z34). To rubryki z wariantu B w kopercie
  z wariantu A.
- **Decyzje szefa (`dokumentacja/Decyzje.md`, 22.11):**
  - Rubryki decyzji jak w wariancie **B**:
    - kwoty;
    - znaki ✓ ! ○;
    - przy rubryce odnośnik „popraw”, który prowadzi do miejsca, gdzie tę decyzję się zmienia.
  - Koperta jak w wariancie **A**: list wysuwa się z koperty, po nadaniu pojawia się stempel.
  - Poprawione w 02, nie zepsuj tego:
    - stempel „nadano” znika po przejściu rundy;
    - tablica Poczty odświeża się w nowej rundzie.
- **Pliki do zmiany:**
  - `swiat/sceny/poczta.js`;
  - w `pulpit/pulpit.js` tylko część z listem i nadawaniem;
  - `zakladki/zadania.js`, jeśli tam jest podsumowanie decyzji;
  - style;
  - testy w `gra/testy/swiat` i `gra/testy/aplikacja`.
- **Nie ruszaj:** `swiat/rysunek.js`, `zakladki/dostawcy.js`, `zakladki/zdarzenia.js`, `swiat/sceny/park.js`,
  `pulpit/zeszyt.js`, `zakladki/wujek.js`, `mapa/*`.
- **Gotowe, gdy:**
  - List jest w kopercie i wysuwa się z animacją. Przy `prefers-reduced-motion` pojawia się bez animacji.
  - Rubryki mają kwoty i znaki.
  - Odnośnik „popraw” działa.
  - Po nadaniu jest stempel.
  - Pełne testy są zielone.

## Raport
Stan: gotowe do przeglądu (22.11).

**Co zrobione**
- `pulpit/pulpit.js`: blankiet (rubryki z wariantu B) w kopercie A. Rubryki z tabeli `RUBRYKI` (✓ jest, ○ pusto, ! błąd z odnośnikiem
  „popraw ➜”), kwoty z `v.koszty_decyzji` przypisane po prefiksie opisu pozycji, reszta jako „Pozostałe wydatki” (suma się zgadza),
  „Razem wydatki” i „Na koncie po wydatkach” (`v.stan.gotowka`). Nowa akcja `pp-kop-popraw` zamyka okno i robi `c.idz(zakladka, "decyzje")`.
  Przycisk Wyślij i stempel NADANO bez zmian (stempel pojawia się z `v.wyslane`, więc znika w nowej rundzie jak w 02).
- `pulpit/pulpit.css`: blok `podróż 03/list`; list wysuwa się z koperty (`pp-list-wysun`, tylko w `prefers-reduced-motion: no-preference`),
  bez ruchu pojawia się od razu. Tylko zmienne kolorów.
- `testy/aplikacja/test_pulpit.py`: test `test_list_blankiet_rubryki_popraw_i_animacja`.
- `INSTRUKCJA.md` (jedno zdanie), notatka `dokumentacja/funkcje/list-z-decyzjami-blankiet.md`.

**Nie zrobione / decyzje własne**
- `swiat/sceny/poczta.js` i `zakladki/zadania.js` bez zmian: scena pokazuje już „✓ NADANO” z `v.wyslane` (odświeża się co rundę), a
  podsumowanie decyzji było tylko w `pulpit.js`.
- Przypisanie kwot po prefiksach opisów jest umowne (np. „Koszt zakupu” trafia do sprzętu/wystroju razem). Lepsze byłoby pole `rubryka`
  w pozycjach kosztów (silnik), ale to poza zakresem.
- Zrzutów ekranu nie zrobiłem (brak przeglądarki w tej sesji); układ sprawdzony tylko testami i `node --check`. Proszę o rzut oka.

**Dowód**
- `pytest -q -p no:cacheprovider` → `899 passed in 383.90s (0:06:23)`
- `ruff check .` → `All checks passed!`
- `node --check pulpit.js` → OK; `testy/aplikacja/test_pulpit.py` → 34 passed
