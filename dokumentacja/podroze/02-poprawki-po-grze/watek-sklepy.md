# Wątek: sklepy (podróż 02)

## Brief
- **Cel:** każdy sklep, hurtownia i piętro biurowca pokazuje w okienku tylko swoją ofertę. Rożen i Park handlowy
  działają tak, jak gracz się spodziewa. To uwagi z gier testowych 20 i 22.11 (zadania Z30 i Z1 w `dokumentacja/Zadania.md`).
- **Ustalone (nie sprawdzaj ponownie):**
  - Projekt: gra w `gra/` (przewodnik `gra/AGENTS.md`, zasady `CLAUDE.md` w korzeniu). Ścieżki niżej liczone od
    `gra/panel_gracza/static/`.
  - Przyczyna usterki: wszystkie sklepy dostają wspólną teczkę `ZAMOWIENIA = { ekran: "zaop_dostawy", … }`
    (`swiat/rysunek.js:171`, funkcje `R.zamow`, `R.koszyk`, `R.dowoz`, `R.gazetka`). `kliknijPunkt` w `swiat/wnetrze.js`
    woła `c.teczka(o.ekran)`, czyli otwiera **ogólny ekran wszystkich dostawców** (`zakladki/dostawcy.js`), i tylko
    przewija go do nazwy sklepu (`przewinDo`). Dlatego w piekarni da się kupić mięso.
  - Biurowiec przy Zana (`swiat/sceny/winda_zana.js`, `zana_*.js`, ekran agencji w `zakladki/marketing.js`) działa tak samo:
    piętro otwiera okno z opcjami wszystkich pięter.
  - Park handlowy: `swiat/sceny/park_handlowy.js`, `sprzet_gastro.js`, ekran zakupu sprzętu `zakladki/inwestycje.js`,
    odesłania z kebaba w `swiat/miejsca.js` (`odsyla`).
- **Decyzje szefa (`dokumentacja/Decyzje.md`):**
  - Sklep od nowa („kompletny rebuild”). Każdy sklep pokazuje tylko swoją ofertę: towary z działu, który kliknięto
    (alejka „Pieczywo” to tylko pieczywo), ceny tego sklepu, ilości do zamówienia, a do tego **co jest już w koszyku
    i co już kupione w tej rundzie**.
  - Porównania z innymi sklepami w okienku **nie ma**. Porównanie zostaje tylko w zeszycie wujka („gdzie kupić”).
  - Klik opcji we wnętrzu **zawsze otwiera pop-up (teczkę) nad wnętrzem, nigdy osobną kartę ani ekran**.
  - Hurtownia sprzętu (majster: „wszystko kieruje do tego samego”): każde stanowisko i sprzęt prowadzi do swojej pozycji.
  - Biurowiec przy Zana: zostaje jeden biurowiec, reklama w nim, drukarnia jest piętrem (bez osobnego żetonu).
    Piętro pokazuje tylko swoje opcje. Winda i piętra „wyglądają jak kupa”, więc przerysuj je porządnie: widok ze
    środka kabiny windy z panelem przycisków pięter, każde piętro z własnym wnętrzem i charakterem agencji.
  - Rożen w kebabie (`swiat/sceny/rozen.js`): klik **pokazuje, co jest kupione** (sprzęt, stan), nie przenosi do innego
    budynku i nie każe kupować drugi raz, gdy sprzęt już jest (majster: „niby mam, ale chce, żebym kupił”).
  - Park handlowy: żeton na mapie robi wątek `02/mapa`, Ty tego nie ruszasz. Wnętrze Parku jest zepsute: napraw je.
    Z kebaba **nie ma** przejścia prosto do Parku. Odesłanie pokazuje tylko informację i przycisk „Pokaż na mapie”.
    Gracz idzie tam przez mapę.
- **Jak to zbudować (decyzja Archiego):** nowa teczka sklepu z parametrami `dostawca` i `dzialy`, która korzysta
  z danych i logiki zamówień istniejących w `zakladki/dostawcy.js` (decyzja `zamowienia` bez zmian w silniku), ale rysuje
  tylko ofertę jednego sklepu. Ogólny ekran dostawców zostaje do innych zastosowań (zeszyt, panel), o ile nadal jest
  używany. Ten sam wzór zastosuj do pięter biurowca (filtr agencji lub piętra) i do hurtowni sprzętu (filtr pozycji).
- **Pliki do zmiany:** `swiat/rysunek.js`, `swiat/wnetrze.js`, `swiat/sceny/*.js` (bez `poczta.js`), `swiat/miejsca.js`,
  `zakladki/dostawcy.js`, `zakladki/marketing.js`, `zakladki/inwestycje.js`, `pulpit/karta.js`, `swiat/*.css`,
  testy w `gra/testy/swiat/`, `gra/testy/wnetrza/`, `gra/testy/aplikacja/`.
  **Nie ruszaj** (inne wątki pracują równolegle): `mapa/*`, `zakladki/mapa*.js`, `dane/mapa/budynki.yaml`,
  `pulpit/zeszyt.js`, `pulpit/pulpit.js`, `zakladki/hr.js`, `rynek_pracy.js`, `oferta.js`, `lokal.js`, `zdarzenia.js`,
  `swiat/sceny/poczta.js`. Wspólne pliki CSS (`pulpit/pulpit.css`, `pulpit/karty.css`, `styl.css`) zmieniaj tylko,
  dopisując blok na końcu z komentarzem `/* podróż 02/sklepy */`.
- **Zasady:** liczby gry tylko w `dane/*.yaml`, kwoty w groszach, teksty po polsku, neutralne płciowo, kolory przez
  zmienne z `motywy/zmienne.css`, 3 palety × jasny i ciemny, stan nigdy samym kolorem. Bez nazw i mechanik innych gier
  biznesowych. Testów nie osłabiaj. Do nowej logiki dodaj test.
- **Gotowe, gdy:**
  - w 3 różnych sklepach i w hurtowni okienko pokazuje tylko ich ofertę i to, co w koszyku i kupione;
  - piętro biurowca pokazuje tylko swoje opcje, a winda i piętra są przerysowane;
  - rożen pokazuje kupiony sprzęt;
  - wnętrze Parku działa i nie ma przejścia z kebaba;
  - żaden punkt wnętrza nie otwiera osobnej karty.

  Sprawdź w przeglądarce na serwerze (`manage.py graj --port 8762 --bez-przegladarki`, gra `manage.py gra_pokazowa`),
  potem zatrzymaj serwer. Dowód: `PY -X utf8 -m pytest -q -p no:cacheprovider 2>&1 | tail -5` (pełne, raz na koniec),
  `PY -m ruff check .`, `node --check` każdego zmienionego modułu.
- **Zrzuty ekranu:** nie.
- **Dokumenty do poprawienia:**
  - `gra/INSTRUKCJA.md` i `gra/README.md`, jeśli zmienia się to, co widzi gracz;
  - notatka `dokumentacja/funkcje/Sklepy.md` (szablon: inne pliki w `dokumentacja/funkcje/`; sekcje: dla ucznia, zasada,
    czego uczy, do promocji, nawiązanie).
- **Archi:** archi-lukrum

## Raport
<!-- Pisze wyko na końcu. -->
**Stan:** gotowe | częściowo | zablokowane
**Zmienione pliki:**
**Dowód:** `<komenda>` → `<ostatnie linie wyniku>`
**Decyzje, które podjąłem:**
**Pytania do szefa:**
**Propozycje (poza zakresem):**
**Commity:**
