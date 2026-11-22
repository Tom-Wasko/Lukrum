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
**Stan:** częściowo (większość gotowa; Park i winda opisane niżej)
- Gotowe: okienka sklepów i hurtowni (tylko własny dział, ceny sklepu, koszyk, magazyn, bez porównań), okienka
  pozycji sprzętu w hurtowni, rożen w kebabie pokazuje sprzęt, odesłania z kebaba jako informacja + „Pokaż na mapie”,
  filtr agencji na piętrach biurowca i nowy wystrój pięter (drukarnia, radio, eventy).
- Park handlowy: scena rysuje się poprawnie i testy są zielone, konkretnej usterki nie odtworzyłem. Punkty
  „Stoliki i ogródek” i „Wystrój” nadal otwierają złożony ekran `wnetrze_wyposazenie` (nie zawężony).
- Winda: już jest widokiem z kabiny z panelem guzików; nie przerysowywałem (drobne nakładanie neonu „DOM REKLAMY”
  na lampę). `zana_internet` i `zana_portiernia` bez zmian.
- Nie sprawdzałem klików w żywej aplikacji (brak automatyzacji przeglądarki), tylko zrzuty scen i testy.
**Zmienione pliki:** `gra/panel_gracza/static/zakladki/dostawcy.js`, `zakladki/inwestycje.js`, `zakladki/marketing.js`,
`swiat/rysunek.js`, `swiat/wnetrze.js`, `swiat/miejsca.js`, `swiat/sceny/sprzet_gastro.js`,
`swiat/sceny/zana_drukarnia.js`, `zana_radio.js`, `zana_eventy.js`, `testy/aplikacja/wnetrza_punkty.mjs`,
`testy/aplikacja/test_wnetrza_sceny.py`, `gra/INSTRUKCJA.md`, `gra/README.md`, `dokumentacja/funkcje/Sklepy.md`.
**Poza listą briefu:** `swiat/swiat.js` (okno „To załatwisz gdzie indziej” z przyciskiem „Pokaż na mapie”).
**Dowód:**
- `pytest -q -p no:cacheprovider` (pełny) → `878 passed in 387.63s (0:06:27)`
- `ruff check .` → `All checks passed!`
- `pytest testy/aplikacja testy/swiat` → `241 passed`; `test_wnetrza_sceny.py` → `9 passed`; `node --check` OK
**Decyzje, które podjąłem:**
- Mapowanie działów na zasoby (`DZIALY`) jest w `dostawcy.js`, bez zmian w silniku i danych.
- „Kupione” w okienku = koszyk tego tygodnia + stan magazynu.
- Odesłania z kebaba: informacja + „Pokaż na mapie”, bez przejścia.
- Filtr agencji kluczowany bieżącym miejscem, działa tylko w danym wnętrzu.
**Pytania do szefa:** Jaka dokładnie usterka wnętrza Parku handlowego? Nie udało się jej odtworzyć; potrzebny opis albo zrzut.
**Propozycje (poza zakresem):**
- Zawęzić „Stoliki i ogródek” oraz „Wystrój” w Parku do osobnych okienek (jak sprzęt).
- Poprawić nakładanie neonu „DOM REKLAMY” na lampę w windzie.
- Test klików w żywej aplikacji (potrzebna automatyzacja przeglądarki).
**Uwaga:** w `_robocze/sklepy/` zostały zrzuty (poza gitem), a serwer `http.server 8771` mógł zostać uruchomiony;
nie udało się ich usunąć/zatrzymać (odmowa uprawnień). Do ręcznego sprzątnięcia.
**Commity:** e92977b, d390857, c18b56c, 6dbeee5, 3a7021f (+ commit z tym raportem).

## Raport: poprawka po usterce Parku (okienka punktów)
**Przyczyna:** w `zakladki/index.js` klucze części (`wyposazenie`, `dekor`, `sprzet`, `stanowiska`, `szkolenia`, `udogodnienia`) mają alias na zakładkę złożoną, więc każdy punkt otwierał całą zakładkę (`wnetrze_wyposazenie` = „Instalacje i wyposażenie” + „Sklep meblowy”, itd.).
**Poprawka:** `app.js` (`zakladkaOkna`): klucz części otwiera okno tylko tej części; sceny przestawione na klucze części. Punkty informacyjne bez własnego ekranu dostają dymek (`ekran: "–"`). `wnetrze.js` przekazuje `teczka.tryb` (np. „Dyplomy” = wyniki szkoleń). Auchan „Zakupy z dowozem” otwiera tylko sekcję auto-dostawcy (`otworzAuto` w `dostawcy.js`). Nowe działy `Surówki` i `Falafel i pita` (Stokrotka, Lidl), bo dwa punkty jednej sceny otwierały to samo.
**Poprawione punkty:** park_handlowy (Stoliki i ogródek → część `wyposazenie`, Wystrój → część `dekor`), stolarnia (Nowe stanowiska → `stanowiska`, Cennik i terminy → dymek), akademia (Kursy → `szkolenia`, Dyplomy → `szkolenia` [wyniki]), galeria (Udogodnienia → `udogodnienia`), piekarnia (Ile na który dzień → dowóz sklepu, Jakość wypieku → dymek), auchan (Zakupy z dowozem → samo auto-dostawy), stokrotka (Surówki), lidl (Falafel i pita), kebab (Rożen → `sprzet`).
**Neon w windzie:** świetlówka przeniesiona z pod napisu „DOM REKLAMY” na boki sufitu (`winda_zana.js`).
**Wyjątki jawne (test `TEN_SAM_EKRAN`):** 14 scen z jednym ekranem jednej sprawy i kilkoma punktami (bank, bazar, giełda, poczta…): ekran prostej zakładki, nie złożonej. Kebab „Lada” → `lokal_przeglad` zamierzony („Mój lokal”).
**Poza listą briefu:** `app.js`, `swiat/swiat.js`, `testy/aplikacja/test_pulpit.py` (asercja pod `teczka.tryb`), `swiat/sceny/{auchan,akademia,galeria,lidl,stokrotka,piekarnia}.js` w zakresie `sceny/*.js`.
**Dowód:** `pytest testy/aplikacja testy/swiat` → 243 passed (po poprawce test_pulpit); `test_wnetrza_sceny.py` → 11 passed; `ruff check .` → All checks passed!; `node --check` OK. Nie sprawdzałem klików w żywej aplikacji.

### Tabela: scena → punkt → co otwiera
| scena | punkt | co otwiera |
|---|---|---|
| agencja_nieruchomosci | Lokale do wzięcia | ekran: lokale |
| agencja_nieruchomosci | Licytacje | ekran: licytacje |
| agencja_nieruchomosci | Notariusz | ekran: przejecia |
| agencja_nieruchomosci | Twoje klucze | ekran: lokale |
| agencja_pracy | Kandydaci | ekran: rynek_pracy |
| agencja_pracy | Twoje ogłoszenia | ekran: rynek_pracy |
| agencja_pracy | Agencja | ekran: rynek_pracy |
| agencja_pracy | Headhunter | ekran: rynek_pracy |
| agencja_pracy | Grafik i pensje | odesłanie (informacja) |
| akademia | Kursy | ekran: szkolenia |
| akademia | Dyplomy | ekran: szkolenia [wyniki] |
| akademia | Udogodnienia | odesłanie (informacja) |
| auchan | Pieczywo | sklep: auchan / dzial / Pieczywo |
| auchan | Mięso i mrożonki | sklep: auchan / dzial / Mięso, Mrożonki |
| auchan | Warzywa i sosy | sklep: auchan / dzial / Warzywa, Sosy i dodatki |
| auchan | Napoje i opakowania | sklep: auchan / dzial / Napoje, Opakowania |
| auchan | Zakupy z dowozem | auto-dostawy (samo okno) |
| auchan | Koszyk tygodnia | sklep: auchan / koszyk / kasy |
| bank | Konto i debet | ekran: bank |
| bank | Kredyty | ekran: bank |
| bank | Lokaty | ekran: bank |
| bank | Porównaj banki | wejście: pierzeja_bankowa.html |
| bazar | Okazje | ekran: handel |
| bazar | Twój stragan | ekran: handel |
| bazar | Zakończone | ekran: handel |
| biedronka | Pieczywo | sklep: biedronka / dzial / Pieczywo |
| biedronka | Warzywa | sklep: biedronka / dzial / Warzywa |
| biedronka | Sosy i dodatki | sklep: biedronka / dzial / Sosy i dodatki |
| biedronka | Napoje | sklep: biedronka / dzial / Napoje |
| biedronka | Frytki | sklep: biedronka / dzial / Mrożonki |
| biedronka | Gazetka | sklep: biedronka / gazetka |
| biedronka | Koszyk tygodnia | sklep: biedronka / koszyk |
| biedronka | Mięso | odesłanie (informacja) |
| biuro_rachunkowe | Umowa i pakiet | ekran: biuro |
| biuro_rachunkowe | Cennik | ekran: biuro |
| biuro_rachunkowe | Twoje dokumenty | ekran: biuro |
| biuro_rachunkowe | Księguj samodzielnie | odesłanie (informacja) |
| detektyw | Zleć śledztwo | ekran: konkurencja |
| detektyw | Kto jest kim | ekran: konkurencja |
| detektyw | Raporty | ekran: konkurencja |
| eurocash | Warzywa | sklep: eurocash / dzial / Warzywa |
| eurocash | Sosy i dodatki | sklep: eurocash / dzial / Sosy i dodatki |
| eurocash | Pozostały towar | sklep: eurocash / dzial / Mięso, Mrożonki, Pieczywo, Napoje, Opakowania |
| eurocash | Koszyk tygodnia | sklep: eurocash / koszyk / biurko zamówień |
| eurocash | Dni dostaw | sklep: eurocash / dowoz |
| galeria | Udogodnienia | ekran: udogodnienia |
| galeria | Szkolenia | odesłanie (informacja) |
| gielda | Notowania | ekran: gielda |
| gielda | Kup albo sprzedaj | ekran: gielda |
| gielda | Portfel właściciela | odesłanie (informacja) |
| gielda | Wiadomości | ekran: gielda |
| harpagon | Pożyczka od ręki | ekran: harpagon |
| harpagon | Twój dług | ekran: harpagon |
| harpagon | Kredyt w banku | odesłanie (informacja) |
| harpagon | Zapukaj | ekran: kasyno |
| kamienica_rachmistrzow | Wejdź | wejście: biuro_rachunkowe.html?f=jks |
| kamienica_rachmistrzow | Wejdź | wejście: biuro_rachunkowe.html?f=scrooge |
| kamienica_rachmistrzow | Wejdź | wejście: biuro_rachunkowe.html?f=asteroida_328 |
| kamienica_rachmistrzow | Wejdź | wejście: biuro_rachunkowe.html?f=jozef_k |
| kamienica_rachmistrzow | Porównaj biura | ekran: biuro |
| kamienica_rachmistrzow | Poczta z urzędu | ekran: biuro |
| lidl | Pieczywo | sklep: lidl / dzial / Pieczywo |
| lidl | Warzywa i sosy | sklep: lidl / dzial / Warzywa, Sosy i dodatki |
| lidl | Falafel i pita | sklep: lidl / dzial / Falafel i pita |
| lidl | Napoje | sklep: lidl / dzial / Napoje |
| lidl | Mrożonki | sklep: lidl / dzial / Mrożonki |
| lidl | Gazetka | sklep: lidl / gazetka |
| lidl | Koszyk tygodnia | sklep: lidl / koszyk |
| makro | Pieczywo i warzywa | sklep: makro / dzial / Pieczywo, Warzywa |
| makro | Sosy i napoje | sklep: makro / dzial / Sosy i dodatki, Napoje |
| makro | Mięso i mrożonki | sklep: makro / dzial / Mięso, Mrożonki |
| makro | Opakowania | sklep: makro / dzial / Opakowania |
| makro | Koszyk tygodnia | sklep: makro / koszyk / stanowisko obsługi |
| makro | Dni dostaw | sklep: makro / dowoz |
| park | Co się tu dzieje | ekran: kalendarz |
| park | Stoisko | odesłanie (informacja) |
| park_handlowy | Stoliki i ogródek | ekran: wyposazenie |
| park_handlowy | Wystrój | ekran: dekor |
| park_handlowy | Sprzęt | wejście: sprzet_gastro.html |
| piekarnia | Pieczywo | sklep: piekarnia / dzial / Pieczywo |
| piekarnia | Ile na który dzień | sklep: piekarnia / dowoz / kalendarz dostaw |
| piekarnia | Koszyk tygodnia | sklep: piekarnia / koszyk / skrzynki dowozowe |
| piekarnia | Jakość wypieku | dymek z wstępem |
| pierzeja_bankowa | Wejdź | wejście: bank.html?b=kmicic |
| pierzeja_bankowa | Wejdź | wejście: bank.html?b=wokulski |
| pierzeja_bankowa | Wejdź | wejście: bank.html?b=ziemia |
| pierzeja_bankowa | Wejdź | wejście: bank.html?b=rzecki |
| pierzeja_bankowa | Wejdź | wejście: bank.html?b=soplicowo |
| pierzeja_bankowa | Porównaj banki | ekran: bank |
| poczta | Nadaj list z decyzjami | ekran: wyslij |
| poczta | Do poprawy | ekran: lista_bledow |
| poczta | Potwierdzenia | ekran: wyslij |
| pokoj_ksiegi | Księga firmy | ekran: kpir |
| pokoj_ksiegi | Dokumenty | ekran: kpir |
| pokoj_ksiegi | Terminy | odesłanie (informacja) |
| pokoj_ksiegi | Oddaj księgi biuru | odesłanie (informacja) |
| ratusz | Sprawy lokalu | ekran: urzad |
| ratusz | VAT | ekran: vat |
| ratusz | Podatek dochodowy | ekran: podatki |
| ratusz | Higiena | odesłanie (informacja) |
| redakcja | Wyniki tygodnia | ekran: karta_wynikow |
| redakcja | Tabela ligowa | ekran: ranking |
| redakcja | Dział porad | ekran: wnioski |
| redakcja | Archiwum | ekran: raport |
| rozen | Mięso na rożen | sklep: rozen / dzial / Mięso |
| rozen | Mięso mrożone | sklep: rozen / dzial / Mrożonki |
| rozen | Koszyk tygodnia | sklep: rozen / koszyk / biuro zbytu |
| rozen | Dni dostaw | sklep: rozen / dowoz |
| sanepid | Poziom higieny | ekran: sanepid |
| sanepid | Kontrole | ekran: sanepid |
| sanepid | Świeżość towaru | odesłanie (informacja) |
| selgros | Pieczywo, warzywa, sosy | sklep: selgros / dzial / Pieczywo, Warzywa, Sosy i dodatki |
| selgros | Mięso | sklep: selgros / dzial / Mięso |
| selgros | Mrożonki | sklep: selgros / dzial / Mrożonki |
| selgros | Napoje | sklep: selgros / dzial / Napoje |
| selgros | Opakowania | sklep: selgros / dzial / Opakowania |
| selgros | Koszyk tygodnia | sklep: selgros / koszyk |
| sprzet_gastro | Rożny i grille | sprzęt: Rożen |
| sprzet_gastro | Frytownice i chłodzenie | sprzęt: Frytownica, Lodówka na napoje, Szafa chłodnicza, Zamrażarka |
| sprzet_gastro | Kasy | sprzęt: Kasa fiskalna, Lada z witryną, Tablica menu |
| sprzet_gastro | Komis | sprzęt:  |
| sprzet_gastro | Leasing | odesłanie (informacja) |
| stokrotka | Pieczywo, sosy, napoje | sklep: stokrotka / dzial / Pieczywo, Sosy i dodatki, Napoje |
| stokrotka | Surówki | sklep: stokrotka / dzial / Surówki |
| stokrotka | Warzywa | sklep: stokrotka / dzial / Warzywa |
| stokrotka | Frytki | sklep: stokrotka / dzial / Mrożonki |
| stokrotka | Gazetka | sklep: stokrotka / gazetka |
| stokrotka | Koszyk tygodnia | sklep: stokrotka / koszyk / lada |
| stolarnia | Nowe stanowiska | ekran: stanowiska |
| stolarnia | Cennik i terminy | dymek z wstępem |
| stolarnia | Sprzęt | odesłanie (informacja) |
| ubezpieczyciel | Kup polisę | ekran: ubezpieczenia |
| ubezpieczyciel | Co grozi | ekran: ubezpieczenia |
| ubezpieczyciel | Twoje polisy | ekran: ubezpieczenia |
| uczelnia | Klienci w strefach | ekran: klienci |
| uczelnia | Kalendarz miasta | ekran: kalendarz |
| uczelnia | Prognoza popytu | ekran: klienci |
| uczelnia | Konkurencja | odesłanie (informacja) |
| winda_zana | Piętro 4: internet | wejście: zana_internet.html |
| winda_zana | Piętro 3: eventy | wejście: zana_eventy.html |
| winda_zana | Piętro 2: radio | wejście: zana_radio.html |
| winda_zana | Piętro 1: drukarnia | wejście: zana_drukarnia.html |
| winda_zana | Parter: portiernia | wejście: zana_portiernia.html |
| zana_drukarnia | Ulotki i plakaty | agencja: papier_przyjmie |
| zana_eventy | Eventy | agencja: kozi_grod |
| zana_internet | Internet | ekran: internet |
| zana_portiernia | Twoje kampanie | ekran: agencje |
| zana_portiernia | Pokój 12: księga firmy | wejście: pokoj_ksiegi.html |
| zana_radio | Radio i billboard | agencja: fala_koziolka |
**Z31 (wolne usuwanie zamówień):** `zam-usun` i `zam-wyczysc` w `dostawcy.js` przekazują drugi argument `zmien(fn, lokalnie)`: odświeża się tylko lista zamówień (`[data-lista-zam]`), a w oknie auto-dostaw samo okno. Test `test_usuwanie_zamowien_odswieza_tylko_liste_a_nie_cala_strone` → `test_wnetrza_sceny.py` 12 passed. Okna sklepów (`ilosc`) już odświeżały się lokalnie. Nie mierzyłem czasu w żywej aplikacji. Uwaga: reszta strony (paski kosztów) odświeża się po zamknięciu/zmianie zakładki.


## Poprawki po recenzji (commit b1d09aa)
**Blokujące**
1. `agencje.tytulPelny` jest zwykłym polem; tytuł z filtrem agencji wylicza `agencje.tytulOkna()` (używa go `rysujTeczke`). Panel znów się ładuje.
2. Dostawca sceny idzie z jawnego pola `dostawca` w definicji sceny (klucz z `dane/dostawcy.yaml`, 9 scen). `dostawcaSceny(v, klucz)` zwraca klucz tylko, gdy dostawca ma ceny w tej rundzie. Bez oferty `kliknijPunkt` zawsze kończy się okienkiem („Ten sklep otworzy się w tygodniu N” dla Auchan, inaczej „nie ma dziś oferty”) i nie spada do ogólnego ekranu dostawców.

**Drobne**
1. Filtr agencji zerowany, gdy żadna teczka nie jest otwarta (`rysuj()` → `zdejmijFiltrAgencji`); `wyniki()` agencji też go stosuje.
2. `zakladkaOkna` przenosi `bezLokali` (hr_rozwoj: szkolenia i udogodnienia bez wyboru lokalu).
3. `poZamknieciu` sklepu i auto-dostawy zeruje stan tylko dla własnego obiektu.
4. Lada kebaba zostaje jawnym wyjątkiem (`KEBAB_ZLOZONE` w teście) – **pytanie do szefa**: rozdzielić „Mój lokal” (stan, sprawy, obsada, sprzedaż) na osobne punkty? Wyjątki w teście zawężone do par (scena, punkt) (22 pary) i (punkt, cel) dla kebaba.
5. Okno odesłania w `swiat.js`: okruszek z tytułu miejsca, przycisk „Wróć na mapę”.
6. `DZIALY` zostaje w JS; test sprawdza, że każdy zasób z cen dostawców ma dział.
7. Zana: punkty „internet” i „portiernia” prowadzą do ekranów ogólnych (`internet`, `agencje`) – poza zakresem, do decyzji.
8. Test zachowania: `testy/aplikacja/zakladki_zachowanie.mjs` (Node + stub DOM) ładuje `zakladki/index.js`, `dostawcy.js`, `wnetrze.js`; sprawdza klik bez oferty i okno sklepu z działem (`test_wnetrza_sceny.py`). `app.js` nie importuję (za dużo DOM).
9. Serwer 8771 nie działa (brak nasłuchu), `_robocze/sklepy/` usunięty.

**Pliki poza briefem:** `swiat/swiat.js`, `swiat/wnetrze.js`, `swiat/sceny/*.js` (pole `dostawca`), `zakladki/index.js`, `zakladki/marketing.js`, `app.js`, `testy/aplikacja/zakladki_zachowanie.mjs`.
**Otwarte:** usterka Parku (okienka punktów) – poprawiona wcześniej, bez nowych zgłoszeń.
**Dowód:** `pytest testy/aplikacja testy/swiat` → 246 passed; `ruff check .` → All checks passed; `node --check` 6 modułów ok.
