# Spis okien i katalog ram (podróż 04, wątek 04/wzor, Z49)

Decyzja szefa (23.11): zawartość każdego okna ma pasować do **własnej ramy** okna (teczka, akta, paragon, list…), a nie
do jednego wspólnego szablonu. Ten plik: (1) katalog ram z „językiem” zawartości, (2) spis okien ze stanem,
(3) co zrobiono we wzorze. Ramy przypisuje `pulpit/karty-style.js`, ich wygląd to `pulpit/karty.css`, a style zawartości
per rama to `swiat/okna.css` (selektory `.szk.karta--sN …`, tylko zmienne z `motywy/zmienne.css`).

## 1. Katalog ram: język zawartości

Zasady wspólne: kształt i krój mówią, w jakim jesteśmy dokumencie; kolory tylko ze zmiennych; stan nigdy samym kolorem
(znaki □ ■ ✓ ✕ ▲ ▼, napis); paleta „wysoka” bez ozdób obniżających kontrast (pismo ręczne i maszynowe zamieniane na
czytelny krój, zakreślenie flamastrem → podkreślenie); żadnych cudzych grafik, tylko CSS i znaki.

| rama | klucz | do czego | język zawartości |
|---|---|---|---|
| teczka kartonowa | `s1` | decyzje do wykonania (oferta, sprzęt, dostawy, reklama, handel) | karton i tektura: kafle jak karty katalogowe z zadrukowaną etykietą, przyciski jak metalowe zszywki/etykiety, pigułka jak naklejka; **w kolejce** (wzór po wdrożeniu s2 i s4) |
| akta urzędowe | `s2` | urzędy, prawo, pieniądze (bank, biuro, giełda, ubezpieczenia, VAT, sanepid, konkurencja) | druk i maszynopis (Courier): nagłówki „§ 1.”, tabele z podwójną linią nagłówka i kropkowanymi liniami, rubryki formularza zamiast kafli, adnotacja urzędnika zamiast białej karty, podsumowanie w podwójnej linii, **przycisk jak odcisk pieczątki** (kwadrat, twardy cień), pieczątka zamiast pigułki, zakładki jako pola □/■ |
| czysta apka | `s3` | wyniki, tabele, ranking, ustawienia | nowoczesna apka: tabele, kafle, pigułki w obecnym kształcie (`styl.css` jest jej własnym językiem), więc **bez zmian** |
| kartka w kratkę | `s4` | notatki, listy, kontrole (kadry, kalendarz, księga, wnioski, udogodnienia) | zeszyt: pismo odręczne (Caveat) w tytułach i liczbach, przerywane linie, wiersze jak linijki notatnika, kafle jak przyklejone karteczki z paskiem taśmy, liczby zakreślone flamastrem, przyciski i pigułki pisane długopisem (zaokrąglone, przerywane gdy nieaktywne) |
| własne | `0` | paragon (`pp-okno-paragon`), list (`pp-okno-koperta`), tablica ogłoszeń, zeszyt wujka, dymki gości | każde ma swój język w `pulpit/pulpit.css` i `app.js`; zawartość tworzona razem z ramą, **zgodne** |
| dymek wnętrza | `.wn-info` | informacje punktu bez decyzji (`odsyla`, `szkic?`) | krótki tekst w dymku sceny, bez rekwizytów |

## 2. Spis okien

Legenda stanu: **zgodne (wzór)**, wzór wdrożony w tym wątku; **zgodne**, brak starych klas w środku;
**mieszane**, kilka starych klas; **stare**, zawartość zbudowana głównie z komponentów `styl.css` (kafel, karta,
pasek, btn, pigułka, komunikat, wiersz) bez dopasowania do ramy; **do sprawdzenia**, ekran nie ma osobnego modułu
(klasy w module złożonym) i wymaga oglądu w przeglądarce; **własne**, rama własna.
Rama i klasy odczytane skryptem z `karty-style.js` i modułów `zakladki/*.js` (klasy w atrybutach `class=` HTML).

### 2a. Punkty scen z oknem (kolumny: scena → punkt → ekran → rama → stare klasy → stan)

| scena | punkt | ekran | rama | stare klasy w środku | stan |
|---|---|---|---|---|---|
| agencja_nieruchomosci | Lokale do wzięcia | lokale | inna (sklep, auto, lokal, dymek) | kafel, pasek, btn, pigulka, komunikat, wiersz | inne |
| agencja_nieruchomosci | Licytacje | licytacje | inna (sklep, auto, lokal, dymek) | kafel, pasek, btn, pigulka, komunikat | inne |
| agencja_nieruchomosci | Notariusz | przejecia | inna (sklep, auto, lokal, dymek) | kafel, pasek, btn, pigulka, komunikat | inne |
| agencja_nieruchomosci | Twoje klucze | lokale (Twoje) | inna (sklep, auto, lokal, dymek) | kafel, pasek, btn, pigulka, komunikat, wiersz | inne |
| agencja_pracy | Kandydaci | rynek_pracy | s4 kratka | pasek, btn, komunikat | zgodne (wzór) |
| agencja_pracy | Twoje ogłoszenia | rynek_pracy (zastępca) | s4 kratka | pasek, btn, komunikat | zgodne (wzór) |
| agencja_pracy | Agencja | rynek_pracy (kanał agencja) | s4 kratka | pasek, btn, komunikat | zgodne (wzór) |
| agencja_pracy | Headhunter | rynek_pracy (headhunter) | s4 kratka | pasek, btn, komunikat | zgodne (wzór) |
| akademia | Kursy | szkolenia | s4 kratka | kafel, pasek, btn, pigulka, oferta-wiersz, komunikat, wiersz | stare |
| akademia | Dyplomy | szkolenia (historia) | s4 kratka | kafel, pasek, btn, pigulka, oferta-wiersz, komunikat, wiersz | stare |
| auchan | Zakupy z dowozem | zaop_dostawy (auto-dostawy) | s1 teczka | pasek, btn, agencja, komunikat, wiersz | stare |
| bank | Konto i debet | bank | s2 akta urzędowe | pasek, btn, przelacznik, komunikat, wiersz | zgodne (wzór) |
| bank | Kredyty | bank | s2 akta urzędowe | pasek, btn, przelacznik, komunikat, wiersz | zgodne (wzór) |
| bank | Lokaty | bank | s2 akta urzędowe | pasek, btn, przelacznik, komunikat, wiersz | zgodne (wzór) |
| bank | Leasing sprzętu | bank | s2 akta urzędowe | pasek, btn, przelacznik, komunikat, wiersz | zgodne (wzór) |
| bazar | Okazje | handel | s1 teczka | karta, pasek, btn | mieszane |
| bazar | Twój stragan | handel | s1 teczka | karta, pasek, btn | mieszane |
| bazar | Zakończone | handel (historia) | s1 teczka | karta, pasek, btn | mieszane |
| biuro_rachunkowe | Umowa i pakiet | biuro | s2 akta urzędowe | kafel, btn, pigulka, przelacznik, komunikat, wiersz | stare |
| biuro_rachunkowe | Cennik | biuro (cennik) | s2 akta urzędowe | kafel, btn, pigulka, przelacznik, komunikat, wiersz | stare |
| biuro_rachunkowe | Twoje dokumenty | biuro (dokumenty) | s2 akta urzędowe | kafel, btn, pigulka, przelacznik, komunikat, wiersz | stare |
| detektyw | Zleć śledztwo | konkurencja | s2 akta urzędowe | kafel, karta, pasek, btn | zgodne (wzór) |
| detektyw | Kto jest kim | konkurencja | s2 akta urzędowe | kafel, karta, pasek, btn | zgodne (wzór) |
| detektyw | Raporty | konkurencja (raporty) | s2 akta urzędowe | kafel, karta, pasek, btn | zgodne (wzór) |
| galeria | Udogodnienia | udogodnienia | s4 kratka | kafel, pasek, btn, pigulka, oferta-wiersz, komunikat, wiersz | stare |
| gielda | Notowania | gielda | s2 akta urzędowe | – | zgodne |
| gielda | Kup albo sprzedaj | gielda | s2 akta urzędowe | – | zgodne |
| gielda | Wiadomości | gielda (wiadomości) | s2 akta urzędowe | – | zgodne |
| harpagon | Pożyczka od ręki | harpagon | s2 akta urzędowe | karta, pasek, btn, komunikat | stare |
| harpagon | Twój dług | harpagon (stan długu) | s2 akta urzędowe | karta, pasek, btn, komunikat | stare |
| harpagon | Zapukaj | kasyno | inna (sklep, auto, lokal, dymek) | kafel, karta, pasek, btn | inne |
| kamienica_rachmistrzow | Porównaj biura | biuro (porównanie) | s2 akta urzędowe | kafel, btn, pigulka, przelacznik, komunikat, wiersz | stare |
| kamienica_rachmistrzow | Poczta z urzędu | biuro (historia błędów) | s2 akta urzędowe | kafel, btn, pigulka, przelacznik, komunikat, wiersz | stare |
| park | Co się tu dzieje | – | inna (sklep, auto, lokal, dymek) | (osobnego modułu brak) | inne |
| park_handlowy | Stoliki i ogródek | wyposazenie | s1 teczka | kafel, pasek, btn, pigulka, oferta-wiersz, komunikat, wiersz | stare |
| park_handlowy | Wystrój | dekor | inna (sklep, auto, lokal, dymek) | btn | inne |
| piekarnia | Jakość wypieku | – | inna (sklep, auto, lokal, dymek) | (osobnego modułu brak) | inne |
| pierzeja_bankowa | Porównaj banki | bank (porównanie) | s2 akta urzędowe | pasek, btn, przelacznik, komunikat, wiersz | zgodne (wzór) |
| poczta | Nadaj list z decyzjami | wyslij | własna | kafel, btn, pigulka, tab-wrap, tabela-tytul, komunikat | własne |
| poczta | Do poprawy | lista_bledow | s4 kratka | kafel, btn, pigulka, tab-wrap, tabela-tytul, komunikat | stare |
| poczta | Potwierdzenia | wyslij (historia) | własna | kafel, btn, pigulka, tab-wrap, tabela-tytul, komunikat | własne |
| pokoj_ksiegi | Księga firmy | kpir | s4 kratka | kafel, btn, pigulka, przelacznik, komunikat, wiersz | stare |
| pokoj_ksiegi | Dokumenty | kpir (dokumenty) | s4 kratka | kafel, btn, pigulka, przelacznik, komunikat, wiersz | stare |
| ratusz | Sprawy lokalu | urzad | s2 akta urzędowe | kafel, karta, pasek, btn, wiersz | stare |
| ratusz | VAT | vat | s2 akta urzędowe | karta, pasek | mieszane |
| ratusz | Podatek dochodowy | podatki | s2 akta urzędowe | karta, pasek | mieszane |
| redakcja | Wyniki tygodnia | karta_wynikow, raport | inna (sklep, auto, lokal, dymek) | (osobnego modułu brak) | inne |
| redakcja | Tabela ligowa | ranking | s3 apka | kafel, btn, pigulka, tab-wrap, tabela-tytul, komunikat | stare |
| redakcja | Dział porad | wnioski | s4 kratka | kafel, btn, pigulka, tab-wrap, tabela-tytul, komunikat | stare |
| redakcja | Archiwum | raport (historia) | s3 apka | kafel, btn, pigulka, przelacznik, komunikat, wiersz | stare |
| sanepid | Poziom higieny | sanepid | s2 akta urzędowe | kafel, karta, pasek, btn, wiersz | stare |
| sanepid | Kontrole | sanepid (historia) | s2 akta urzędowe | kafel, karta, pasek, btn, wiersz | stare |
| sprzet_gastro | Rożny i grille | wnetrze_sprzet | s1 teczka | kafel, pasek, btn, pigulka, oferta-wiersz, komunikat, wiersz | stare |
| sprzet_gastro | Frytownice i chłodzenie | wnetrze_sprzet | s1 teczka | kafel, pasek, btn, pigulka, oferta-wiersz, komunikat, wiersz | stare |
| sprzet_gastro | Kasy | wnetrze_sprzet | s1 teczka | kafel, pasek, btn, pigulka, oferta-wiersz, komunikat, wiersz | stare |
| sprzet_gastro | Komis | wnetrze_sprzet | s1 teczka | kafel, pasek, btn, pigulka, oferta-wiersz, komunikat, wiersz | stare |
| stolarnia | Nowe stanowiska | stanowiska | s1 teczka | kafel, pasek, btn, pigulka, oferta-wiersz, komunikat, wiersz | stare |
| stolarnia | Cennik i terminy | – | inna (sklep, auto, lokal, dymek) | (osobnego modułu brak) | inne |
| ubezpieczyciel | Kup polisę | ubezpieczenia | s2 akta urzędowe | karta, pasek, btn, komunikat, wiersz | stare |
| ubezpieczyciel | Co grozi | ubezpieczenia (informacja) | s2 akta urzędowe | karta, pasek, btn, komunikat, wiersz | stare |
| ubezpieczyciel | Twoje polisy | ubezpieczenia (historia) | s2 akta urzędowe | karta, pasek, btn, komunikat, wiersz | stare |
| uczelnia | Klienci w strefach | klienci | s3 apka | pasek, komunikat | mieszane |
| uczelnia | Kalendarz miasta | kalendarz | s4 kratka | pasek, btn, tab-wrap | mieszane |
| uczelnia | Prognoza popytu | klienci (prognoza) | s3 apka | pasek, komunikat | mieszane |
| zana_drukarnia | Ulotki i plakaty | agencje | s1 teczka | kafel, pasek, btn, pigulka, agencja, wiersz | stare |
| zana_eventy | Eventy | agencje | s1 teczka | kafel, pasek, btn, pigulka, agencja, wiersz | stare |
| zana_internet | Internet | internet | s1 teczka | kafel, pasek, btn, pigulka, agencja, wiersz | stare |
| zana_radio | Radio i billboard | agencje | s1 teczka | kafel, pasek, btn, pigulka, agencja, wiersz | stare |

Punkty bez okna z ramą (nie ma co przerabiać): 54× `szkic?` (punkt-dymek sceny z tekstem, `.wn-info`), 15× `odsyla`
(dymek „To załatwisz gdzie indziej”, `swiat/swiat.js:230`), 6× `wejscie` (przejście do innej sceny). Razem z 2a
to wszystkie 143 punkty scen z `swiat/sceny/*.js` (38 scen).

### 2b. Wywołania `okno(` poza ekranami scen (okna podrzędne i systemowe)

Domyślna rama okna bez wskazanego `styl` to s1. Okna podrzędne dziedziczą rodzaj treści od ekranu-rodzica, więc
powinny dostać ramę rodzica (propozycja w sekcji 4).

| plik | okna | rama dziś | uwagi |
|---|---|---|---|
| `zakladki/banki.js` (3), `finanse.js` (2) | zakładanie lokaty, kredyt, leasing | s1 (domyślna) | formularz banku, powinno być s2 (akta) |
| `zakladki/handel.js` (3) | licytacja, wystawienie towaru i sprzętu na giełdę | s1 | giełda w s1 |
| `zakladki/harpagon.js` (2) | pożyczka, spłata | s1 | rodzic w s2 → s2 |
| `zakladki/hr.js` (6) | zatrudnienie, obsada, przeniesienie, profil pracownika | s1 | rodzic w s1/s4 (zespół) |
| `zakladki/inwestycje.js` (3), `dostawcy.js` (3) | zakup/sprzedaż sprzętu, sklep, paragon | paragon (`styl: 0`) lub s1 | paragon zgodny |
| `zakladki/oferta.js`, `rynek_pracy.js`, `urzad.js`, `wlasciciel.js` (2), `zdarzenia.js`, `mapa.js` | wymagania dania, headhunter, „Bez sprzątania?”, wypłata/wpłata, zdarzenie, lokal na mapie | s1 | do rozpoznania |
| `pulpit/pulpit.js` (4) | ⚙ konto (s3), portfel/finanse (s3), zakupy (paragon), list z decyzjami (koperta) | s3 / własne | **zgodne** |
| `app.js` (3) | funkcje gry (s3), potwierdzenie (s2) | s3 / s2 | zgodne |
| `swiat/swiat.js`, `swiat/wnetrze.js`, `mapa/lublin.js` | dymki sceny i mapy | `.wn-info` / s1 | dymki |

Okna MG (`/mg/`) poza zakresem (decyzja w briefie).

## 3. Wzór: trzy okna przerobione (stan po wątku)

| okno | rama | co zmieniono (tylko CSS, `swiat/okna.css`) |
|---|---|---|
| Sokole Oko ▸ Zleć śledztwo | s2 | tytuły tabel jako „§ n.” z linią kropkowaną; tabela z podwójną linią nagłówka i kropkowanymi liniami; rubryki zamiast kafli; adnotacja urzędnika zamiast białej karty; podsumowanie zamiast czarnego paska; przyciski jak odcisk pieczątki |
| Bank (konto, kredyty, lokaty, leasing) | s2 | karty banków jako druki z podwójną linią i kwadratową pieczęcią znaku; rubryki z napisem „Rubryka:”; zakładki wewnętrzne jako pola □/■; przyciski-pieczątki |
| Kadry (rynek pracy, agencja pracy) | s4 | tytuły jak zakreślone w zeszycie (falista kreska), kandydaci jako linijki notatnika, karty działów jak przyklejone karteczki z paskiem taśmy, liczby zakreślone flamastrem, przyciski i pigułki pisane długopisem; zakładki Decyzje/Wyniki ✓ i przerywana ramka |

Zrzuty przed/po: `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-wzor/<okno>-<paleta>-<tryb>-przed|po.png`
(bar jasny, pewex ciemny, wysoka ciemny; 1366×768; poza gitem).

## 4. Co dalej (propozycje, poza tym wątkiem)

- Ten sam sposób dla s1 (teczka): kafle jak karty katalogowe, przyciski jak etykiety; potem s3 tylko sprawdzić.
- Okna podrzędne (2b) przypisać do ramy rodzica przez `styl: stylEkranu(<ekran rodzica>)`; to zmiana w modułach,
  wymaga osobnego wątku.
- Stan „do sprawdzenia” w 2a wymaga oglądu w przeglądarce (moduły złożone, bez osobnych klas).
- Wnętrza ekranów s2 z klasami `kafel`/`karta` w `urzad`, `harpagon`, `ubezpieczenia` są już pokryte regułami s2
  (selektory ogólne), ale nie były oglądane na zrzutach.
