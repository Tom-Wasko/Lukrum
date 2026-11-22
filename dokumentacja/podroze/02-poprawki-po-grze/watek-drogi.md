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
**Stan:** gotowe | częściowo | zablokowane
**Zmienione pliki:**
**Dowód:** `<komenda>` → `<ostatnie linie wyniku>`
**Decyzje, które podjąłem:**
**Pytania do szefa:**
**Propozycje (poza zakresem):**
**Commity:**
