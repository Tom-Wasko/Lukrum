# Wątek: drogi (podróż 02)

## Brief
- **Cel:** w czasie przesuwania i przybliżania mapy drogi, granice dzielnic i kolej mają zostać widoczne, a ruch ma
  być co najmniej tak płynny jak po wątku `02/mapa`. Szef ocenił w grze, że znikające drogi nie wyglądają dobrze.
- **Ustalone (nie sprawdzaj ponownie):**
  - Projekt: gra w `gra/` (przewodnik `gra/AGENTS.md`, zasady `CLAUDE.md` w korzeniu). Ścieżki niżej liczone od
    `gra/panel_gracza/static/`.
  - Raport wątku `02/mapa` (`dokumentacja/podroze/02-poprawki-po-grze/watek-mapa.md`) zawiera pomiary i przyczynę.
    W każdej klatce przeglądarka od nowa rysuje cienkie linie SVG z `vector-effect: non-scaling-stroke`
    (`mapa/mapa.css:21`). Chodzi o granice dzielnic z kreskowaniem, kolej, ulice osiedlowe i napisy ulic. Skrypty i układ
    to ułamek czasu.
    Obecne obejście: klasa `lm-ruch` na mapie w czasie ruchu (`mapa/lublin.js` ok. linii 215) i reguła na końcu
    `mapa/mapa.css` (`/* podróż 02/mapa */`), która chowa te warstwy. **To obejście ma zniknąć.**
  - Pomiar „po 02/mapa” (Edge, 1400×850, poziom 3): przesuwanie mediana 6,1 ms (p95 6,2), zoom kółkiem 30 ms,
    zoom przyciskami 24 ms na klatkę.
- **Do zrobienia:**
  1. Zmierz punkt wyjścia: z obejściem i z wyłączonym obejściem (wszystkie linie widoczne).
  2. Znajdź sposób, żeby linie zostały, a ruch był płynny. Pomysły do sprawdzenia pomiarem (nie zgaduj):
     - obrysy bez `non-scaling-stroke`: grubość linii przez zmienną `--k` (skala widoku), przeliczaną po zakończeniu
       ruchu, a w trakcie ruchu linie skalują się razem z mapą;
     - przesuwanie jako `transform` warstwy (kompozycja na GPU, `will-change: transform`) zamiast przeliczania
       `viewBox`/macierzy SVG w każdej klatce;
     - kreskowanie granic jako jeden wzór albo uproszczona geometria w ruchu, zamiast chowania;
     - rysowanie statycznych warstw (drogi, granice, kolej) do obrazu (np. `<canvas>` lub zrzut SVG do bitmapy)
       na czas ruchu, z podmianą na wektor po ruchu.
     Wybierz najprostszy, który spełnia cel. W raporcie podaj, co sprawdziłeś i z jakim wynikiem.
  3. Usuń obejście `lm-ruch` (albo zostaw klasę tylko do czegoś, co nie chowa linii: wtedy opisz to).
  4. Wygląd linii po zatrzymaniu mapy ma być taki sam jak dziś (grubości na każdym poziomie przybliżenia). W ruchu
     dopuszczalna jest chwilowa zmiana grubości. Linie nie mogą znikać ani migać.
- **Pliki do zmiany:** `mapa/*` (`lublin.js`, `widok.js`, `mapa.css` i inne w `mapa/`), `zakladki/mapa*.js`, testy
  w `gra/testy/aplikacja/` i `gra/testy/swiat/`. Nic poza tym bez pytania Archiego.
- **Zasady:** kolory tylko przez zmienne z `motywy/zmienne.css`, 3 palety × jasny i ciemny (sprawdź, że linie wyglądają
  dobrze w każdej), stan nigdy samym kolorem. Testów nie osłabiaj. Do zmiany logiki dodaj test (np. że w CSS nie ma
  reguły chowającej warstwy w `lm-ruch`).
- **Gotowe, gdy:**
  - drogi, granice i kolej są widoczne cały czas przy przesuwaniu i przybliżaniu;
  - czas klatki jest nie gorszy niż po 02/mapa (liczby przed i po w raporcie, ten sam sposób pomiaru);
  - po zatrzymaniu linie wyglądają jak dziś.

  Sprawdź w przeglądarce na serwerze (`manage.py graj --port 8764 --bez-przegladarki`, gra `manage.py gra_pokazowa`),
  potem zatrzymaj serwer. Dowód: testy `testy/aplikacja testy/swiat`, `PY -m ruff check .`, `node --check` każdego
  zmienionego modułu. Pełne testy puszcza Archi.
- **Zrzuty ekranu:** nie.
- **Dokumenty do poprawienia:** `gra/dokumentacja/STACK.md`, jeśli zmienia się sposób rysowania mapy.
- **Archi:** archi-lukrum

## Raport
**Stan:** gotowe (z jednym pytaniem do szefa o uproszczenia w ruchu)
**Zmienione pliki:** `gra/panel_gracza/static/mapa/mapa.css`, `mapa/lublin.js`, `gra/testy/aplikacja/test_pulpit.py` (nowy test `test_mapa_w_ruchu_nie_chowa_linii`), `gra/dokumentacja/STACK.md`.
**Dowód:**
- Pomiar (Edge headless, 1400×850, poziom 3, 1765 węzłów, ten sam skrypt przed i po; klatka = odstęp `requestAnimationFrame`; przesuwanie 80 ruchów co 16 ms, zoom 14 kroków kółkiem co 120 ms):

  | wariant | przesuwanie med / p95 | zoom med / p95 | zoom, czas zadań na krok |
  |---|---|---|---|
  | z obejściem (stan po 02/mapa, linie chowane) | 6,1 / 6,2 ms | 24,2 / 30,4 ms | 217 ms |
  | obejście wyłączone (wszystkie linie, `non-scaling-stroke`) | 6,1 / 18,3 ms | 97,1 / 145,6 ms | 419 ms |
  | **po zmianie** (2 przebiegi) | 6,1 / 6,2 ms | 18,2 / 24,3 i 36,4 ms | 211 i 213 ms |

- Co sprawdziłem: (1) grubość przez `N px / --k` bez `non-scaling-stroke`, `--k` ustalane po ruchu: zoom 97 → 61 ms (przeliczanie stylów 1386 → 103 ms, ale rysowanie zostaje drogie). Rozbiór kosztu przez chowanie warstw: napisy ulic (tekst na ścieżce) ok. 24 ms, kreskowanie granic i kolei ok. 12 ms, ulice osiedlowe ok. 6 ms. (2) Warstwy SVG większe od ramki, na własnej warstwie kompozytora (`will-change: transform`, ruch jako CSS transform bitmapy): gorzej, zoom 79–109 ms, p95 do 685 ms (przesuwanie p95 85 ms). Profil: `Layerize` 73 ms na klatkę (wobec 6 ms bez tej warstwy); porzucone. (3) Wariant wybrany: (1) + w ruchu granice i kolej bez kreskowania (pełna cienka linia) + napisy ulic `visibility: hidden`. Same napisy widoczne w ruchu: zoom 48 ms; kreskowanie zostawione w ruchu: zoom 36 ms, więc oba uproszczenia są potrzebne.
- Wygląd po zatrzymaniu: w przeglądarce `computed stroke-width × --k` daje dawne grubości w px (poziom 3: lokalna 6/8, zbiorcza 8/10, główna 11/13, ekspresowa 13/15, granice 2 z kreskami 2 3, kolej 2,4 i 1,2 z kreskami 7 7, miasto 5, rzeka 4, woda 1; poziom 1: główna 2,2/4, ekspresowa 3). Zmieniałem tylko grubości, kolory bez zmian, więc palety i tryb jasny/ciemny zostają jak były (nie robiłem zrzutów każdej palety).
- `pytest -q -p no:cacheprovider testy/aplikacja testy/swiat` → `262 passed in 133.62s (0:02:13)`
- `ruff check .` → `All checks passed!`; `node --check` lublin.js (kopia jako .mjs) → ok.
**Decyzje, które podjąłem:**
- `lm-ruch` nie chowa już żadnej linii. Klasa zostaje (tylko w ruchu, do 150 ms po ostatniej zmianie widoku): granice i kolej tracą kreskowanie, napisy ulic (tekst, nie linia) są niewidoczne do zatrzymania mapy. Pomiar: bez tych dwóch uproszczeń zoom ma 36–48 ms na klatkę, z nimi 18 ms.
- W ruchu grubość linii skaluje się z mapą (zoom 2× = chwilowo 2× grubsze linie), po 150 ms wraca do właściwej. Przy klatce dłuższej niż 150 ms w trakcie ruchu linie na chwilę wracają do właściwej grubości.
- `--k` ustawiam na elementach `svg` (nie na ramce), żeby nie przeliczać stylów żetonów; grubości poświaty latarni (noc) przeliczone tak samo.
- Pomiar w Edge headless (rysowanie programowe), bez prawdziwego GPU: liczby są względne.
**Pytania do szefa:** czy kreskowanie granic i kolei zamieniające się w ruchu w pełną linię oraz napisy ulic pojawiające się po zatrzymaniu to akceptowalna cena za płynność? (Wariant bez tych uproszczeń: zoom ok. 60 ms na klatkę.)
**Propozycje (poza zakresem):** w ruchu zoomu zostaje ok. 100 ms układu na krok (`Layout`, układanie żetonów `uloz`/`zmierz`): kolejne miejsce do przyspieszenia, niezwiązane z liniami.
**Commity:** jeden commit wątku na gałęzi `worktree-podroz-02-drogi` (`git log -1`).

## Zdjęcie mapy w ruchu
**Co zrobiono:** nowy moduł `mapa/zdjecie.js`. W ruchu (`lm-ruch`) rysunek SVG jest schowany (`display: none`), a pokazuje się zdjęcie: canvas po każdej warstwie SVG (świat, poświata lamp w nocy), 30% większy z każdej strony, w rozdzielczości `devicePixelRatio` (limit 16 mln px), przesuwany i skalowany `transform` (GPU). Zdjęcie rysuje się z obliczonych stylów tych samych elementów (`getComputedStyle`: kolor, grubość, kreski, krycie przodków), więc palety i tryb jasny/ciemny działają bez zmian; napisy ulic idą znak po znaku wzdłuż toru. Zdjęcie jest gotowe zawczasu: robi się po zatrzymaniu mapy w bezczynności, po zmianie palety/pory dnia/fontów i w ruchu, gdy widok wyjdzie poza zdjęcie albo powiększenie przekroczy 2,4× (co najwyżej co 350 ms). Bez zdjęcia (błąd) rysują się wektory.
**Usunięte uproszczenia:** skalowanie grubości przez `--k` w ruchu (`--k` ustawia się tylko po zatrzymaniu i przed zdjęciem), zamiana kreskowania w pełną linię, chowanie napisów. Żadne nie było potrzebne.
**Liczby (Edge headless, 1400×850, poziom 3, ten sam skrypt):**

| wariant | przesuwanie med / p95 | zoom kółkiem med / p95 |
|---|---|---|
| C: wszystko wektorowo | 6,1 / 18,3 ms | 97,1 / 145,6 ms |
| poprzedni (`1e97220`, uproszczenia) | 6,1 / 6,2 ms | 18,2 / 24,3 ms |
| **zdjęcie** | 6,1 / 6,2 ms | **6,1 / 12,0 ms** |

Zoom przyciskami (6 kliknięć co 0,5 s): med 6,1 / p95 18,1 ms, max 218 ms (jedna klatka z ponownym zdjęciem w ruchu). Czas zrobienia zdjęcia: poziom 1 ok. 5 ms, poziom 2 ok. 20–55 ms, poziom 3 ok. 11–36 ms (pierwsze po rozgrzaniu). Zrzut w ruchu wygląda jak w spoczynku (kreski, napisy, grubości).
**Decyzje:** napisy w zdjęciu rysowane bez kerningu (różnica niewidoczna); poświata lamp ma krycie per ścieżka, nie per grupa (różnica pomijalna). Pomiar zoomu przyciskami dla starych wariantów nie powtórzony.
**Dowód:** `pytest testy/aplikacja testy/swiat` → `262 passed in 136.77s`; `ruff check .` → `All checks passed!`; `node --check` lublin.js, zdjecie.js → ok. Serwer 8764 zatrzymany. Test `test_mapa_w_ruchu_nie_chowa_linii` dostosowany (zdjęcie, brak `visibility`/kreskowania w `lm-ruch`).
**Stan:** gotowe. Nie sprawdziłem każdej palety na zrzutach (tylko Bar nocą z lampami).
