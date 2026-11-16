# Katalog zmian Fable (15–16.11.2026)

Każdy temat to osobna gałąź `fable-<temat>` (nie `fable/<temat>`: git nie pozwala mieć naraz gałęzi `fable` i `fable/x`).
Wszystko razem jest na gałęzi `fable`. Hashe: `git log main..fable-<temat> --no-merges`.

## 1. Świat gry: miejsca zamiast działów menu – `fable-swiat` (81bf8d3)
- **Gracz widzi:** menu z boku to miejsca w mieście (Mój kebab, Stare Miasto, Hurtownie, Park handlowy, Miasteczko
  akademickie, Kamienica bankowa, Biurowiec przy Zana, Urzędy, Kurier rankingowy). Wejście pokazuje scenę z klikalnymi
  punktami i listę „Co tu zrobisz”; kebab ma wnętrze z podglądu 4 (tablica, lada, rożen, zaplecze, bywalcy z dymkami).
- **Zasady:** bez zmian. Ekrany decyzji są te same, zmienia się droga do nich.
- **Pliki:** `panel_gracza/static/swiat/*`, `zakladki/index.js` (MENU), `app.js` (słuchacz `lukrum:wnetrze`), `testy/aplikacja/test_swiat.py`.
- **Zależności:** żadnych. **Ocena:** pewne (testy, zrzuty 10–16).
- **Jak wziąć:** `git merge fable-swiat` (konflikt możliwy tylko w `zakladki/index.js`, jeśli menu zmieniło się w main).

## 2. Wygląd: panel w paletach PRL – `fable-wyglad` (9040a57)
- **Gracz widzi:** cała gra (panel, lista gier, panel MG, logowanie) w palecie Bar mleczny / Pewex / Wysoka widoczność,
  jasnej albo ciemnej; wybór w menu ⚙ („Kolory”, „Tryb”, „Układ”). Ciemna listwa z szyldem LUKRUM, karty z grubą kreską.
- **Zasady:** bez zmian. Fonty tylko lokalne (zniknęło połączenie z Google Fonts).
- **Pliki:** `motywy/lukrum.css` (nowy), `styl.css`, `pulpit.css`, `motyw.js`, 4 szablony, `mg.css`.
- **Zależności:** zbudowane na `fable-swiat` (gałąź zawiera jego commit). **Ocena:** pewne dla głównych ekranów
  (zrzuty 20–23); rzadkie ekrany w trybie ciemnym do przejrzenia.
- **Jak wziąć:** `git merge fable-wyglad` (wciąga też temat 1) albo `git cherry-pick 9040a57` na main ze światem.

## 3. Katalogi przeliczone od zera – `fable-katalogi` (f8f79c8)
- **Gracz widzi:** jakość ★ / ★★ / ★★★ to wybór z kosztem: składniki ★ = 85%, ★★★ = 132% ceny ★★; sprzęt i szkolenia
  z uporządkowanym cennikiem.
- **Zasady:** tylko liczby w `dane/*.yaml` (sprzet, zasoby i in.). **Pomiar:** `pomiary/katalogi.md`
  (3 poziomy × 3 ziarna × 5 botów; średnia gotówka na poziomie łatwym −3,6%, strategia premium traci najwięcej).
- **Zależności:** żadnych. **Ocena:** do sprawdzenia w grze testowej (bot „agresywny” bankrutuje i przed, i po).
- **Jak wziąć:** `git cherry-pick f8f79c8` (same dane; konflikt, jeśli te same yamle zmieniono w main).

## 4. Dekor lokalu: silnik – `fable-dekor` (4cba26e)
- **Zasady (nowa mechanika):** cztery grupy elementów (ściany 2 400 zł, szyld 1 800 zł, dodatki 900 zł, meble 3 200 zł)
  w pięciu stylach. Styl działa, gdy lubi go ≥ 40% gości strefy lokalu (20–40%: połowa efektu). Każda dopasowana grupa:
  +0,8% popytu i +0,07 gwiazdki oceny tygodnia. Kupione zostaje na zawsze, zmiana stylu za darmo.
  Wyłącznik: `dane/mapa/dekor.yaml: wlaczony: false`.
- **Pliki:** `silnik/rynek/dekor.py`, `dane/mapa/dekor.yaml`, `decyzje.py`, `popyt.py`, `opinie.py`, `schematy.py`,
  `model.py`, `funkcje.py`, `prezentacja.py`, `testy/nieruchomosci/test_dekor.py`.
- **Pomiar:** `pomiary/dekor.md` (24 rundy, 3 ziarna × 5 botów średnich): komplet 8 300 zł zwraca się średnio w 10,9 tyg.
  przy pełnej konwersji popytu (cel 8–12; „tani” 17 tyg., „agresywny” 7,5 tyg.); w symulacji botów, gdzie moc kuchni
  ogranicza sprzedaż, przyrost gotówki to średnio 112 zł/tydz.
- **Zależności:** żadnych (bez tematu 5 mechanika działa, ale nie ma ekranu). **Ocena:** pewne co do działania
  (sprawdzone w grze: zakup → zamknięcie rundy → wystrój widać we wnętrzu, zrzut 82); wielkość efektu do oceny autora.
- **Jak wziąć:** `git cherry-pick 4cba26e`.

## 5. Sklep meblowy „Meblościanka” – `fable-sklep` (cb1aa66)
- **Gracz widzi:** Park handlowy → „Meblościanka”: goście okolicy lokalu, pięć regałów stylów z pieczęcią
  („trafia: pełny efekt” / „trafia częściowo” / „nie trafia”), miniatury, wózek i paragon z sumą.
- **Pliki:** `zakladki/dekor.js` (nowy), `zakladki/index.js`, `swiat/miejsca.js`, `swiat/swiat.css`, `dekor.py` (nazwy grup klientów w widoku).
- **Zależności:** tematy 1 i 4 (gałąź zawiera też 2, 3 i mapę, bo wyszła z `fable`). **Ocena:** pewne (zrzut 41).
- **Jak wziąć:** `git cherry-pick cb1aa66` po wzięciu tematów 1 i 4.

## 6. Instrukcja gracza i mistrza gry – `fable-instrukcja` (ebdc7cc)
- **Gracz widzi:** /jak-grac opisuje obecną grę: pierwsze 10 minut, miejsca w mieście, PIP, debet i jego przejęcie,
  biura rachunkowe z opłatą za zmianę, część „Dla mistrza gry”. Strona w paletach gry.
- **Pliki:** `gra/INSTRUKCJA.md`, `templates/panel_gracza/jak_grac.html`. PDF nie przegenerowany.
- **Zależności:** opisuje temat 1 (miejsca). **Ocena:** do przeczytania przez autora (raport agenta:
  `_robocze/fable-raporty/instrukcja.md`; kasyna celowo nie opisuje).
- **Jak wziąć:** `git cherry-pick ebdc7cc`.

## 7. Mapa Lublina kolegi – scalenie `origin/maciex` do `fable` (5ec97f2)
- Bez zmian w plikach kolegi. Po mojej stronie wejście do wnętrz działa przez słuchacz z tematu 1.

## 8. List od wujka: plan tygodnia krok po kroku – `fable-wujek` (a2e9efe + commit „co nowego”)
- **Gracz widzi:** Plan tygodnia zaczyna się od listy kroków po kolei. Każdy krok mówi, dokąd pójść (Stare Miasto,
  Kamienica bankowa, Mój kebab · tablica…) i co zrobić; pierwszy niezrobiony ma znacznik „teraz →”, zrobione się
  odhaczają. W tygodniach 1–4 obok leży krótki list od wujka. Pod listą: „Nowe w tym tygodniu” i „Za tydzień otworzy się”.
  Ściana tekstu o rozruchu lokalu nie pokazuje się w 1. tygodniu. Ekran nazywa się „Plan tygodnia” (był „Dashboard”).
- **Zasady:** bez zmian. **Pliki:** `zakladki/wujek.js` (nowy), `zakladki/ogolne.js`, `swiat/swiat.css`.
- **Zależności:** temat 1 (nazwy miejsc, `wczytajGrafiki`) i 2 (zmienne palet). **Ocena:** pewne (zrzuty 52, 53).
- **Jak wziąć:** `git merge fable-wujek` po tematach 1–2 (gałąź wyszła z `fable`, więc zawiera też 3–6 i mapę) albo
  `git cherry-pick` dwóch commitów tematu.

## 9. Nazwy ekranów w duchu mapy – `fable-nazwy`
- **Gracz widzi:** tytuły ekranów mówią, gdzie i co: „Kamienica bankowa – konto, kredyty i lokaty”, „Zaplecze – zespół,
  umowy i grafik”, „Urząd skarbowy – VAT”, „Poczta – wyślij decyzje tygodnia”. Znikają „HR -”, „Finanse -”, „Inwestycje -”.
- **Zasady:** bez zmian. **Pliki:** tylko `zakladki/index.js` (jedna tabela `NAZWY`, łatwo poprawić pojedynczą nazwę).
- **Zależności:** temat 1. **Ocena:** nazwy do przejrzenia przez autora (decyzja 14.11: „bez zgadywania”).
- **Jak wziąć:** `git cherry-pick` jedynego commitu tematu.

## 10. Kurier rankingowy: pierwsza strona gazety – `fable-kurier`
- **Gracz widzi:** w redakcji (menu „Kurier rankingowy”) co tydzień nowe wydanie: tytuł o liderze, tabela ligowa ze
  zmianami miejsc (▲▼), „Z ostatniej chwili” (skok i zadyszka tygodnia, ile tygodni do końca), „Wasz tydzień
  w liczbach”, „Redakcja radzi” (najważniejszy wniosek). Przed pierwszymi wynikami: „Pierwszy numer jeszcze w drukarni”.
- **Zasady:** bez zmian, same dane, które gra już liczyła. **Pliki:** `swiat/kurier.js` (nowy), `swiat/swiat.js`, `swiat/swiat.css`.
- **Zależności:** temat 1. **Ocena:** pewne (zrzut 80). Pomysł autorski Fable.
- **Jak wziąć:** `git cherry-pick` jedynego commitu tematu.

## 11. Panel pokazuje PIP, opłatę za zmianę biura i przejęcie debetu – `fable-pip`
- **Gracz widzi:** przy osobie na zleceniu pracującej jak na etacie ostrzeżenie o kontroli PIP (tygodnie z rzędu, szansa,
  kara, co zrobić) i wynik kontroli w wynikach zespołu; na karcie każdego innego biura rachunkowego kwotę przejścia;
  na kartach innych banków informację o przejęciu debetu z opłatą i ostrzeżenie, gdy limit jest za niski.
- **Zasady:** bez zmian (silnik liczył to od 14.11, teraz to widać). **Pliki:** `api/prezentacja.py`, `silnik/ksiegowosc/biuro.py`
  (pola widoku), `zakladki/hr.js`, `finanse.js`, `banki.js`, `testy/aplikacja/test_widok_pip_biuro_debet.py`.
- **Zależności:** żadnych. **Ocena:** do sprawdzenia na oko w grze z debetem i zleceniami (agent Sonnet, bez zrzutów;
  raport `_robocze/fable-raporty/pip.md`).
- **Jak wziąć:** `git cherry-pick` jedynego commitu tematu.

## 12. Tryb lekcyjny – `fable-lekcje`
- **Mistrz gry widzi:** w kreatorze gry (krok 3) i w grze wybór „Sposób prowadzenia”: „Na żywo” albo „Tryb lekcyjny”
  (ile pierwszych rund na żywo, domyślnie 3; ile dni na każdą kolejną rundę, domyślnie 7). Panel MG pokazuje etap
  („na żywo: runda 2 z 3”, „między lekcjami: termin …”, „Termin minął – zamknij rundę”). **Drużyna widzi** plakietkę
  „Na żywo, na lekcji” albo „Do: data”.
- **Zasady:** bez zmian w silniku gry. Ustawienie w `konfiguracja["lekcje"]`; brak klucza = jak dotąd. Zamknięcie po
  terminie robi istniejąca komenda `manage.py zamykaj_rundy` (musi być uruchamiana na serwerze, np. z harmonogramu zadań).
- **Pliki:** `gry/lekcje.py` (nowy), `gry/harmonogram.py`, `api/widoki.py`, `panel_mg/*`, `panel_gracza/static/app.js`,
  `pulpit_ucznia.js`, `lukrum/settings.py` (`LUKRUM_TRYB_LEKCYJNY`), `silnik/gra.py` (1 linia), testy w `test_prowadzenie.py`.
- **Zależności:** żadnych. **Ocena:** do sprawdzenia w prawdziwej klasie (agent Sonnet; kreator obejrzany na zrzucie 94;
  raport `_robocze/fable-raporty/lekcje.md`).
- **Jak wziąć:** `git cherry-pick` dwóch commitów tematu (`git log main..fable-lekcje --no-merges -2`).

## 13. Finał sezonu – `fable-final`
- **Gracz widzi:** po zakończeniu gry Plan tygodnia otwiera podium ligi (3 miejsca z punktami), wynik i miejsce drużyny,
  jej najlepszy tydzień i ostatni list od wujka (inny dla zwycięzcy, górnej i dolnej połowy tabeli). W ostatnim tygodniu
  gry wujek pisze list „Ostatni tydzień”. Po końcu gry znika komunikat o rozruchu lokalu.
- **Zasady:** bez zmian. **Pliki:** `zakladki/final.js` (nowy), `ogolne.js`, `wujek.js`, `swiat/swiat.css`.
- **Zależności:** temat 8 (list od wujka). **Ocena:** pewne (zrzut 93). Pomysł autorski Fable.
- **Jak wziąć:** `git cherry-pick` jedynego commitu tematu po temacie 8.

## 14. Księga gości – `fable-ksiega`
- **Gracz widzi:** we wnętrzu kebaba, pod sceną: ocenę lokalu, a pod nią pięć wymiarów (smak, czekanie, cena, obsługa,
  wnętrze) z tym, ile gwiazdek każdy dodał albo zabrał w ostatnim tygodniu (▲▼ i pasek), odsyłaczem do miejsca, gdzie
  to poprawić, i trzema ostatnimi wpisami gości.
- **Zasady:** bez zmian: to powody oceny, które silnik opinii liczył już wcześniej (były tylko w tabeli w „Strefach”).
  Czystość z planu toru B zastąpiona wymiarem „wnętrze” (wyposażenie i wystrój), bo czystości silnik nie liczy.
- **Pliki:** `swiat/ksiega.js` (nowy), `swiat/swiat.js`, `swiat/swiat.css`. **Zależności:** temat 1 (i 5 dla odsyłacza do sklepu).
- **Ocena:** pewne (zrzut 95). **Jak wziąć:** `git cherry-pick` jedynego commitu tematu.

## 15. Dymki gości: przełącznik mistrza gry – `fable-dymki-mg`
- **Mistrz gry widzi:** w panelu gry wiersz „Dymki gości we wnętrzu kebaba” z czterema przełącznikami (opinie, plotki,
  propozycje, zaczepki WOS). Zmiana działa od następnego wejścia drużyny do lokalu. Opis w instrukcji.
- **Zasady:** bez zmian; API (`/wnetrza-ustawienia`) istniało od 14.11, brakowało tylko miejsca w panelu (decyzja autora 14.11).
- **Pliki:** `panel_mg/static/mg/mg.js`, `INSTRUKCJA.md`. **Zależności:** żadnych. **Ocena:** pewne (przełączone w przeglądarce w obie strony).
- **Jak wziąć:** `git cherry-pick` jedynego commitu tematu.

## 16. Poprawki po przeglądzie prawnym – commity bezpośrednio na `fable`
- `d210108`: instrukcja (zlecenie i debet jako uproszczenia, urlop 20/26 dni, art. 36 KP, hipoteka i zastaw, mandaty),
  „Nocna 13” bez zachęty do ukrywania przed mistrzem gry i ze zdaniem o 18 latach, opis czterech biur na mapie,
  stopka /jak-grac, 50 000 zł w AGENTS.md.
- commit „Teksty neutralne płciowo…”: 6 zdań w `reklama.yaml`, `parki.yaml`, `kasyno.yaml`, instrukcji i `hr.js`.
- commit „Instrukcja PDF przegenerowana”.
- **Jak wziąć:** `git cherry-pick` po temacie 6 (instrukcja); poprawki danych i kasyna stosują się też do samego `main`.
