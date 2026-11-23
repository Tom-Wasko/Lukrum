# Wątek: dzwieki (podróż 04)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/04-wyglad-i-dzwiek/wspolne.md`, `plan.md` tej podróży,
  `dokumentacja/funkcje/radio-fala-koziolka.md`, początek `panel_gracza/static/pulpit/radio.js` (opis w komentarzu).
  Gałąź bazowa: `main`. Równolegle pracuje `04/wzor` (wygląd okien: `swiat/okna.css`, `zakladki/*.js`).
- **Cel (Z11, decyzje szefa 23.11):** krótkie dźwięki gry i odgłosy tła zależne od miejsca.
  - Tło to **tylko odgłosy** (gwar w kebabie, szum ulicy na mapie, stukot w biurze, cisza w banku itp.). Prawdziwa
    muzyka jest wyłącznie w radiu.
  - Krótkie dźwięki: dzwonek drzwi przy wejściu do lokalu, kasa przy zakupie, stempel przy nadaniu listu, przewracana
    kartka zeszytu, szelest teczki przy otwarciu okna (lista w danych, łatwa do zmiany).
  - **Domyślnie:** krótkie dźwięki włączone (cicho), odgłosy tła wyłączone; gracz włącza w ⚙ → Dźwięk (dwa suwaki
    i „wycisz wszystko”); stan w localStorage. Mistrz gry w `/mg/` może wyciszyć całą klasę (flaga gry, gracz widzi
    „Dźwięk wyciszony przez prowadzącego”).
  - Nagrania: **prawdziwe nagrania CC0 / domena publiczna** (decyzja szefa). Pliki pobiera Archi po akceptacji listy
    przez szefa; Ty robisz kod i dane tak, żeby brak pliku = cisza bez błędu.
- **Jak:**
  - `pulpit/dzwiek.js` (nowy): Web Audio, `lukrum.dzwiek.zagraj(nazwa)`, `lukrum.dzwiek.tlo(miejsce)` z płynnym
    przejściem (fade) przy wejściu do wnętrza i powrocie na mapę; nic nie gra przed pierwszym kliknięciem (zasady
    przeglądarek); `prefers-reduced-motion` nie dotyczy, ale szanuj wyciszenie. Funkcja `przycisz(tak/nie)` dla radia
    (wątek `04/radio` użyje jej, żeby gwar cichł, gdy gra radio).
  - `dane/dzwieki.yaml` (nowy): `pliki` {nazwa: {plik, zrodlo, autor, licencja}}, `zdarzenia` {zdarzenie: nazwa},
    `miejsca` {id miejsca z `dane/mapa/budynki.yaml` albo rodzaj: nazwa | "cisza"}, głośności domyślne. Endpoint jak
    `/radio.json` (sprawdź, jak radio wystawia dane) i walidacja w `silnik.dane sprawdz`, jeśli radio tak ma.
  - Strona nagrań: dopisz dźwięki do istniejącej strony `/nagrania-w-radiu` albo zrób wspólną „Nagrania i dźwięki”
    (autor, źródło, licencja każdego pliku).
  - Podpięcia: wejście do wnętrza / powrót na mapę (`lukrum.otworzWnetrze`, `lukrum.wrocNaMape`), zakup (paragon),
    nadanie listu, kartka zeszytu, otwarcie teczki – najmniejsze możliwe zmiany w cudzych plikach (opisz w raporcie).
- **Nie ruszaj:** wyglądu okien (`swiat/okna.css`, style zakładek), mechaniki, `pulpit/radio.js` (to `04/radio`),
  plików MP3 radia.
- **Testy:** `dzwieki.yaml` – każdy plik ma źródło, autora i licencję z listy {CC0, domena publiczna}; każde miejsce
  z `budynki.yaml` ma odgłos albo „cisza”; endpoint zwraca dane; flaga MG wyciszenia działa w API.
- **Zrzuty:** ⚙ → Dźwięk (bar jasny, wysoka ciemny) i panel MG z wyciszeniem; port 8782,
  `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-dzwieki/`. Po pracy zatrzymaj serwer.
- **Gotowe, gdy:** jak wyżej; INSTRUKCJA (krótko: dźwięk w ⚙, wyciszenie przez MG) i README; notatka
  `dokumentacja/funkcje/Dzwieki.md` z szablonu; pełne testy zielone, `ruff`, `node --check`, `silnik.dane sprawdz`.
  Potem ten sam wątek dostanie kontynuację `04/radio`.
- **Archi:** archi-lukrum.

## Raport
