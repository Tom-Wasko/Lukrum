# Etap 2 – nowa mapa Lublina (strona [mapa], 15.11.2026)

Gałąź `mapa-osm`. Nowa mapa jest domyślna w zakładce „Mapa miasta”; przycisk „Stara mapa” wraca do mapy z kratką.

## Co weszło
- **Adresy i współrzędne** (`gra/dane/mapa/budynki.yaml`): `geo` dla 31 samodzielnych budynków i obu zespołów,
  `adres` dla 30 z nich. Źródło: OSM (Nominatim, Overpass).
- **Dane terenu** (`narzedzia/mapa/pobierz_osm.py` → `gra/panel_gracza/static/mapa/lublin.json`, 340 kB): 27 dzielnic,
  woda, rzeki, zieleń, drogi w czterech klasach, ulice osiedlowe, kolej; położenia 38 lokali, 13 punktów
  orientacyjnych i „serc” trzech stref bez dzielnic. Współrzędne w metrach od placu Litewskiego.
- **Silnik** (`gra/panel_gracza/static/mapa/`): `widok.js` (kółko, przeciąganie, dwa palce, dwuklik, klawisze, płynne
  dojście), `lublin.js` (rysunek, znaczniki, pasek skrótów, warstwy), `ikony.js`, `mapa.css`.
- **Poziomy szczegółów**: miasto (strefy, główne drogi, małe znaki) → dzielnica (drogi zbiorcze, ikony, nazwy
  głównych ulic) → ulica (ulice osiedlowe, podpisy wszystkich znaków).
- **Wejście do budynku**: `lukrum.otworzWnetrze(id)`; dla zespołu id zespołu.
- **Wygląd**: kolory i kroje tylko z `motywy/zmienne.css`; stan lokalu rozróżnia ramka i znak (★ ✓), nie sam kolor.

## Sprawy na granicy z [mechaniki] (propozycje do WSPOLPRACA.md – nie wpisane, czekają na zgodę autora)
1. **Zastępcze otwieranie okien.** Nikt jeszcze nie słucha `lukrum:wnetrze`, więc mapa sama otwiera dotychczasową
   zakładkę albo okno (zespół: lista firm). Wnętrze wyłącza to, ustawiając w swoim słuchaczu
   `e.detail.obsluzone = true`. Propozycja: dopisać to pole do umowy.
2. **Położenia lokali.** `Lokal` w `schematy.py` nie ma `geo`, więc 38 położeń leży w `lublin.json` (klucz `lokale`).
   Propozycja: pole `geo` w `lokale.yaml`, wtedy mapa czyta je z danych gry. Dwa lokale nad Zalewem
   (`zemborzyce_1`, `zemborzyce_3`) mają położenie wpisane z ręki – ul. Żeglarska wypada w OSM poza miastem.
3. **Strefy bez dzielnic** (pytanie autora z 14.11): zamiast kół mają kształt wycięty z prawdziwej dzielnicy.
   Politechnika to pas Rur do 400 m od ul. Nadbystrzyckiej (124 ha). Dzielnicę Za Cukrownią dzielą Zygmuntowskie
   (202 ha) i Dworzec (39 ha): każdy punkt należy do strefy, której ulica, „serce” albo lokal jest bliżej.
4. **`miejsce` sklepów sieciowych** poprawione na prawdziwe położenia z OSM (Makro – Chemiczna, Eurocash –
   Łęczyńska, Selgros – Jana Pawła II, Auchan – Witosa, Biedronka – Nałęczowska, Lidl – Romantyczna, Stokrotka –
   Braci Wieniawskich, Rożen – Turystyczna, stolarnia – Krochmalna). `strefa` bez zmian. Do sprawdzenia przez autora:
   Auchan (w Zygmuntowskich nie ma żadnego), błonia pod Zamkiem (współrzędne z ręki), Lidl (dzielnica niesprawdzona).
5. **Zmienne wyglądu.** `zmienne.css` i `dostepnosc.css` mapa wczytuje w warstwie kaskady `lukrum`, żeby nie zmieniać
   kolorów dotychczasowego panelu; mapa nie używa `--ramka`, bo tę nazwę ma też `motywy/grafik.css`.
   W palecie wysokiej widoczności `dostepnosc.css` pogrubia ramki także w starym panelu.
6. **Opisy budynków** w `budynki.yaml` kończą się odsyłaczami dla twórców („(dane/mapa/banki.yaml)”). Mapa je wycina
   przy wyświetlaniu; lepiej usunąć je z danych.

## Pionki i punkty charakterystyczne (15.11 wieczorem)
- Znaczniki to ilustrowane pionki na podstawkach (`ikony.js: zeton`), 45 rysunków: osobne dla banku, kamienicy,
  biurowca, urzędu, sanepidu, poczty, hurtowni, dyskontu, piekarni, zakładów mięsnych, sklepów, parku, szklarni,
  żaglówki na Zalewie, lokalu i działki oraz dla każdego zabytku.
- 11 nowych punktów Lublina poza danymi gry (`lublin.json: dodatkowe`, lista w `pobierz_osm.py: DODATKOWE`):
  Trybunał Koronny, Archikatedra, Brama Grodzka, Nowy Ratusz, Teatr im. Osterwy, Centrum Kultury, Muzeum Wsi
  Lubelskiej, Dworzec Lublin Główny, most Lutosławskiego, kościół na Czwartku, cmentarz przy Lipowej.
  Opisy są moje i **wymagają sprawdzenia przez autora** (daty i fakty pisałem z pamięci). Majdanka nie ma,
  zgodnie z decyzją z 8.11. Nowy Ratusz i Dworzec Główny mają współrzędne wpisane z ręki.

## Styl PRL i napisy (15.11, po uwagach kolegi)
- Znaczniki to tekturowe żetony: kwadratowe dla budynków, okrągłe dla lokali, parków i wody. Piktogram jest
  w płaskim druku w kilku kolorach palety, z grubym konturem i lekko przesuniętym kolorem. Punkty orientacyjne
  nie mają tektury, są narysowane tuszem wprost na planszy.
- Nazwy są na emaliowanych tabliczkach. Miejsce każdej wybiera `lublin.js: uloz`: pod, nad albo z boku żetonu,
  tak żeby nie zasłaniała żetonu, innej tabliczki, przycisków mapy ani nie wychodziła za ramkę. Ważniejsze
  wybierają pierwsze (Twój lokal, strefy, zespoły, budynki, lokale, punkty orientacyjne, nazwy dzielnic).
  Tabliczka, która się nie mieści, znika do czasu przybliżenia; po najechaniu pokazuje się zawsze.
- Progi poziomów: 0,09 i 0,3 px na metr.

## Czego nie ma
- wnętrz (strona mechanik), botów i billboardów na mapie, ruchu ulicznego i pory dnia ze starej mapy;
- rozsuwania znaków, które na widoku całego miasta nachodzą na siebie w Śródmieściu;
- testów automatycznych modułów JS (w repo nie ma narzędzia do testów przeglądarkowych).
