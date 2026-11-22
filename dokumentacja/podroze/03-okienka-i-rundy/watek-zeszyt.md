# Wątek: zeszyt (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md`. Są tam zasady, makiety, testy i commity.
- **Cel:**
  - Zeszyt wujka wygląda jak stary, zniszczony zeszyt (Z35).
  - Kliknięcie pozycji na liście wujka prowadzi do budynku na mapie (Z5).
- **Decyzje szefa (`dokumentacja/Zadania.md`, Z35 i Z5):**
  - Z35, wygląd zeszytu:
    - stary i zniszczony, **ze skórzaną okładką**;
    - schowany zeszyt leży **przechylony**;
    - lepiej pasująca **odręczna czcionka na wolnej licencji** (OFL albo podobna);
    - plik fontu trafia do repo, licencja leży obok, a wpis idzie do wykazu fontów, jeśli taki wykaz istnieje.
  - Z5, lista wujka:
    - kliknięcie pozycji przesuwa i przybliża mapę do budynku, a budynek pulsuje;
    - przy `prefers-reduced-motion` budynek nie pulsuje, jest tylko wyróżniony.
  - Kartki zeszytu mają się dalej przewijać. To poprawiono w 02.
- **Pliki do zmiany:**
  - `pulpit/zeszyt.js`, `pulpit/zeszyt-warunki.js`, `zakladki/wujek.js`;
  - style zeszytu;
  - plik fontu w `motywy/` albo `grafiki/`;
  - w `mapa/` tylko najmniejsza zmiana potrzebna do przybliżenia:
    - użyj istniejących funkcji przesuwania i przybliżania z `mapa/widok.js` i nie przebudowuj mapy;
    - zdjęcie mapy w ruchu (`mapa/zdjecie.js`) ma dalej działać;
  - testy.
- **Nie ruszaj:**
  - `swiat/rysunek.js`, `zakladki/dostawcy.js`, `zakladki/zdarzenia.js`;
  - `swiat/sceny/park.js`, `swiat/sceny/poczta.js`;
  - `pulpit/pulpit.js`; wyjątek: jedno wywołanie, jeśli bez niego się nie da.
- **Gotowe, gdy:**
  - Nowy wygląd zeszytu działa w 3 paletach, każda w trybie jasnym i ciemnym.
  - W palecie wysokiej zeszyt jest czytelny. Tam font może być zwykły.
  - Kliknięcie pozycji przenosi mapę do budynku, a budynek pulsuje.
  - Pełne testy są zielone.

## Raport

### Zrobione (gałąź `worktree-podroz-03-zeszyt`)
- **Z5:** pozycja listy wujka (`pulpit/zeszyt.js: stronaLista`) używa istniejącej akcji `pp-pokaz`: zeszyt się zamyka, mapa przelatuje
  do budynku z przybliżeniem (`pokazZnak`, k=0,9), budynek pulsuje; przy `prefers-reduced-motion` stała obwódka z napisem „tu” (CSS już był).
  Obok przycisk „wejdź →” do wnętrza (`pp-wejdz`). Pozycje bez budynku na mapie (bazar, wysyłka) działają jak dawniej.
  `mapa/` i `pulpit.js` nie ruszane.
- **Z35:** okładka z dodatkowymi zniszczeniami (pęknięcia, otarcia, plamy), pożółkły papier z zabrudzonymi brzegami i zagiętym rogiem,
  wewnętrzny cień okładki pełnego zeszytu; w palecie wysokiej papier zwykły. Schowany zeszyt dalej przechylony (-8°).
- Test: `testy/aplikacja/test_pulpit.py::test_zeszyt_03_lista_prowadzi_na_mape_a_okladka_jest_zniszczona`.

### Dowód
- `pytest -q -p no:cacheprovider` → `900 passed in 379.75s`; `ruff check .` → `All checks passed!`; `node --check zeszyt.js` → ok.

### Czego nie zrobiłem
- **Nowa czcionka (Z35):** brak sieci, a w repo/na dysku nie ma innej odręcznej czcionki OFL (jest Caveat z polskimi znakami). Zostaje Caveat.
  Decyzja: czy pobrać inną (np. Patrick Hand, Kalam, Marck Script; sprawdzić polskie znaki) do `fonty/` z licencją w `OFL.txt` i `fonty.css`.
- **Zrzuty ekranu:** brak przeglądarki w środowisku (brak playwright), wyglądu nie oglądałem. Potrzebny rzut oka w 3 paletach × jasny/ciemny.

### Propozycje
- `pokazZnak` z k zależnym od bieżącego przybliżenia (nie oddalać, gdy mapa już jest bliżej).
