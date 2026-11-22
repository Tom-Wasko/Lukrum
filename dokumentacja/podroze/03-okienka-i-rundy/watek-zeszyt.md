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
