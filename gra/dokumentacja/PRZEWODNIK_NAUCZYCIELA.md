# LUKRUM – przewodnik dla nauczyciela

Ten przewodnik jest dla osoby, która pierwszy raz widzi LUKRUM i ma poprowadzić lekcję. Nie trzeba znać gry:
wystarczy iść po kolei. Dłuższy opis zasad gry jest w instrukcji (`INSTRUKCJA.md`, w grze adres **/jak-grac**,
część „Dla mistrza gry” na końcu). Scenariusze pięciu lekcji: `SCENARIUSZE_LEKCJI.md`.

**Jak czytać liczby czasu.** Czas przeliczenia tygodnia (poniżej 1 s) i działanie klasy 30 osób są **zmierzone**.
Czas namysłu uczniów jest **szacunkiem** z liczby zadań w grze (`../dokumentacja/wiedza/analizy/czas-lekcji.md`).
Nikt jeszcze nie sprawdził tego na żywej klasie. Pierwszy test: 07.12. Po nim warto poprawić czasy w tym pliku.

**Najkrócej.** Nauczyciel jest **mistrzem gry**: zakłada grę i konta, zamyka rundę (jedna runda to tydzień gry) i
prowadzi omówienie. Drużyny (2–4 osoby, jedno urządzenie na drużynę) prowadzą kebaby na mapie Lublina. Gra sama
podpowiada kolejne kroki w **liście od wujka**.

---

## 1. Przed lekcją

### 1.1 Uruchomienie gry
| Sposób | Kiedy | Jak |
|---|---|---|
| Laptop nauczyciela | gra tylko w klasie, uczniowie w tej samej sieci | Windows: dwa razy kliknąć `start.bat`. Gra otwiera się pod `http://127.0.0.1:8765` |
| Gra przez internet z laptopa | uczniowie na swoich urządzeniach | Dwa razy kliknąć `hostuj.bat`. Po minucie pojawia się adres `https://….trycloudflare.com`. **Adres zmienia się przy każdym uruchomieniu**, więc podaj go uczniom dopiero po starcie |
| Stały adres | żeby nie podawać nowego adresu | Raz uruchomić `staly_link.bat` (potrzebny własny hosting WWW z danymi FTP). Potem `hostuj.bat` sam kieruje stały adres na bieżący tunel |
| Serwer szkoły | docelowo | Planowany (adres i opiekun serwera: do ustalenia przez autora). Do tego czasu używaj laptopa |

Laptop musi działać przez całą lekcję: wyłącz usypianie i podłącz zasilacz. Okno z czarną konsolą zostaw otwarte.
Zamknięcie okna wyłącza grę.

### 1.2 Założenie gry (panel mistrza gry, adres `/mg/`)
1. **Nowa gra → Podstawy.** Wpisz nazwę, liczbę rund (**kreator proponuje 18, na lekcje wpisz 3–6**) i zostaw kapitał
   50 000 zł.
2. **Drużyny i boty.** Dodaj drużyny uczniów. Boty to firmy komputerowe: przy 3–4 drużynach warto dodać 2–3 boty, żeby
   rynek nie był pusty.
3. **Funkcje gry.** Kliknij gotowy zestaw **„Lekcja N …”** (np. „Lekcja 1 – Zakładamy firmę”). Zestaw odkrywa tylko to,
   czego uczy lekcja.
4. **Sposób prowadzenia.** Wybierz „Tryb lekcyjny”: pierwsze rundy na żywo na lekcji, kolejne z terminem.
5. **Sprawdź i utwórz.** Przycisk „Utwórz grę” może być pod krawędzią ekranu (przewiń w dół).
6. Zakładka **Drużyny → Nowe konta uczniów**: wpisz uczniów, kliknij „Załóż konta”, potem **Drukuj**. Powstaje
   kartka z loginami i hasłami do pocięcia.
7. Przypisz każdego ucznia do drużyny (lista i „Dodaj”). To najdłuższy krok: ok. 2 kliknięcia na ucznia. **Zrób go dzień
   wcześniej.** Dla 3–4 drużyn (ok. 12 osób) to kilka minut.

**Zmiana zestawu w trakcie.** Autor przygotowuje przycisk zmiany zestawu między rundami tej samej gry: [nazwa przycisku
z 03/zestawy]. Do czasu, gdy będzie dostępny, każda lekcja to osobna gra (krok 1–6 od początku).

### 1.3 Kartki z hasłami
- Wydrukuj okno „Drukuj” z zakładki Drużyny (drukuje się samo okno). Kartki na razie nie są podzielone na drużyny:
  zaznacz długopisem drużynę przy każdym haśle albo potnij i rozdaj po jednej kartce na ucznia.
- Adres logowania: `…/konta/login/`. Napisz go na tablicy.
- Hasło można nadać od nowa (zakładka Drużyny), gdy kartka zginie.

### 1.4 Lista kontrolna (jedna strona, do odhaczenia)
- [ ] Laptop z zasilaczem, usypianie wyłączone
- [ ] Gra uruchomiona, strona `/mg/` otwiera się, logowanie mistrza gry działa
- [ ] Wiem, jaki adres podać uczniom (zapisany na tablicy lub w prezentacji)
- [ ] Gra założona z właściwym zestawem „Lekcja N”, liczba rund 3–6
- [ ] Wszystkie konta założone, uczniowie przypisani do drużyn
- [ ] Kartki z hasłami wydrukowane i pocięte
- [ ] Jedno urządzenie na drużynę (laptop, tablet albo telefon), naładowane
- [ ] Przeglądarka aktualna, ekran co najmniej 1366×768 (na telefonie też działa)
- [ ] Rzutnik lub ekran: do pokazania Kuriera rankingowego albo panelu mistrza gry
- [ ] Kartki papieru na odpowiedź z „wejścia” (pytanie na początek)
- [ ] Wiem, gdzie jest przycisk „Zamknij rundę” (zakładka **Decyzje**)
- [ ] Kopia zapasowa: „Pobierz plik gry” w panelu (po każdej lekcji)
- [ ] Klub „Nocna 13” (gry losowe) ocenione: zablokować, jeśli nie pasuje do klasy (rozdz. 4)

---

## 2. Przebieg pięciu lekcji

Każda lekcja ma ten sam rytm: **5 min wejście, 25 min gra albo praca z wynikami, 15 min omówienie.**
Czasy „gra” to szacunki z `czas-lekcji.md`. Zamknięcie rundy to kilka sekund (silnik liczy tydzień poniżej 1 s).

> **Zasada na każdą lekcję.** Zamknij rundę po ok. 20 min gry, nawet gdy ktoś nie skończył. Panel pokazuje, kto nie
> wysłał decyzji. Taka drużyna gra tym, co zapisała. Start całej klasy naraz bywa wolny (3–5 s przy logowaniu): uprzedź,
> że to normalne, i poproś o logowanie po kolei.

### Lekcja 1. Zakładamy firmę (tydzień 1, na żywo)
Zestaw: „Lekcja 1 – Zakładamy firmę”. Szacunek gry: 15–18 min, przy pierwszym kontakcie realnie 18–22 min.
| Min | Co robi nauczyciel | Co robią drużyny |
|---|---|---|
| 0–5 | Pyta: „Macie 50 000 zł i pomysł na kebab. Ile wydacie, zanim przyjdzie pierwszy gość?” Rozdaje kartki z hasłami, podaje adres | Zapisują jedną liczbę na kartce. Logują się |
| 5–8 | Pokazuje na ekranie mapę i **list od wujka**. Mówi: „Idziecie po kolei listą. Kroki odhaczają się same” | Otwierają Plan tygodnia, czytają list |
| 8–28 | Chodzi między drużynami. Pyta tylko: „Dlaczego ten lokal?” i „Dlaczego ten bank?”. Nie podpowiada odpowiedzi | Lokal (Stare Miasto, biuro „Klucz”), bank (Kamienica bankowa), księgi (Biurowiec przy Zana), menu, stanowiska, ludzie, **List z decyzjami** |
| ok. 25 | Sprawdza w zakładce **Decyzje**, kto wysłał. **Zamyka rundę 1** | Wysyłają decyzje (z krótkim „co zmieniamy i dlaczego”) |
| 30–45 | Prowadzi omówienie: tablica z kolumnami „wydane / zostało”. Wraca do liczby z kartki | Porównują się |

**Pytania do omówienia:** Co jest kosztem stałym, a co jednorazowym? Dlaczego czynsz przy Rynku jest wyższy niż na
osiedlu? Po co firmie rezerwa gotówki? **Do domu:** rozpisać 50 000 zł na lokal, sprzęt, ludzi, towar, rezerwę.

### Lekcja 2. Pierwsze rachunki (tygodnie 2 i 3, na żywo)
Zestaw: „Lekcja 2 – Pierwsze rachunki”. Szacunek gry: 12–16 min na dwa tygodnie.
| Min | Nauczyciel | Drużyny |
|---|---|---|
| 0–5 | „Kebab kosztuje 25 zł. Ile z tego zostaje właścicielowi?” Zbiera typy | Zapisują typ |
| 5–20 | Tydzień 2: pokazuje, gdzie jest Hurtownia i wybór jakości ★ / ★★ / ★★★. **Zamyka rundę 2** | Zamawiają składniki, ustawiają ceny i obsadę kasy |
| 20–30 | Prosi o otwarcie **Kasy: wyniki finansowe** i **Kuriera rankingowego**. Tydzień 3, **zamyka rundę 3** | Czytają wyniki, poprawiają decyzje |
| 30–45 | Każda drużyna podaje: przychód, koszty, dochód i jedną rzecz, która zaskoczyła | |

**Pytania:** Czy najtańsze składniki zawsze dają największy zysk? Co stanie się z kolejką po obniżce ceny? Dlaczego
w pierwszym tygodniu przychodzi mniej gości? **Do domu:** próg rentowności (ile porcji na tydzień pokrywa czynsz i
pensje).

### Lekcja 3. Klient i opinia (praca z danymi z tygodni 4–6)
Zestaw: „Lekcja 3 – Klient i opinia”. Szacunek: 12–15 min.
| Min | Nauczyciel | Drużyny |
|---|---|---|
| 0–5 | „Kiedy ostatnio sprawdziliście gwiazdki, zanim gdzieś weszliście? Co o nich decyduje?” | Odpowiadają ustnie |
| 5–30 | Prosi o **księgę gości** (Mój kebab): „zapiszcie najsłabszy wymiar”. Potem sklep **„Meblościanka”** i pieczęcie stylów. Zamyka rundę, gdy drużyny zdecydują o wystroju | Zapisują najsłabszy wymiar (smak, czekanie, cena, obsługa, wnętrze). Decydują: kupić wystrój czy poprawić coś innego |
| 30–45 | Wywołuje dwie drużyny z różnych okolic: kto do nich przychodzi (Pracownia Analiz) i jaki wybrały styl | |

**Pytania:** Dlaczego ten sam wystrój zarabia przy dworcu, a nie przy akademiku? Co bardziej psuje opinię: cena czy
kolejka? Po ilu tygodniach zwróci się wystrój za 8 300 zł? **Do domu:** jedna decyzja poprawiająca najsłabszy wymiar.

### Lekcja 4. Praca i prawo (tydzień 7)
Zestaw: „Lekcja 4 – Praca i prawo”. Szacunek: 12–15 min.
| Min | Nauczyciel | Drużyny |
|---|---|---|
| 0–5 | „Wolelibyście umowę o pracę czy zlecenie? A gdybyście byli właścicielem?” | Głosują ręką |
| 5–30 | Prosi o **Zaplecze**: „policzcie pełny tygodniowy koszt jednej osoby na każdej umowie”. Pyta, czy ktoś ma ostrzeżenie o kontroli PIP. Prosi jedną drużynę o przeczytanie, co gra mówi o urlopie, okresie próbnym i wypowiedzeniu | Liczą, zmieniają formę zatrudnienia |
| 30–45 | Tablica: co zyskuje firma, co traci pracownik. **Mówi wprost:** w grze zlecenie nie ma składek pracodawcy, a w prawie od zlecenia też się je płaci (wyjątek: uczeń lub student do 26 lat) | |

**Pytania:** Po czym poznać, że zlecenie to w rzeczywistości etat? Dlaczego zadowolenie zespołu wpływa na wynik? Kto
traci, gdy pracownik odchodzi? **Do domu:** prawdziwe ogłoszenie o pracy w gastronomii w Lublinie i porównanie stawki.

### Lekcja 5. Bilans sezonu (po 12 tygodniu)
Zestaw: „Lekcja 5 – Bilans sezonu”. Szacunek: ok. 25 min (czytanie wyników).
| Min | Nauczyciel | Drużyny |
|---|---|---|
| 0–5 | Pokazuje **podium** i ostatni list od wujka | Oglądają |
| 5–30 | Rozdaje zadanie: „trzy zdania: najlepsza decyzja, najgorsza decyzja, co zrobilibyście inaczej”. Wskazuje źródła: punkty tygodnia (pięć działów po 200 pkt), tabela ligowa, księga gości | Piszą |
| 30–45 | Drużyny mówią po kolei, od ostatniego miejsca. Na koniec jedno pytanie do wszystkich | |

**Pytania:** Czy drużyna z największym zyskiem w jednym tygodniu wygrała ligę? Dlaczego nie? Co w grze było łatwiejsze
niż w prawdziwej firmie, a co trudniejsze? Które instytucje (bank, urząd skarbowy, sanepid, PIP) spotkaliście i po co
istnieją? **Na ocenę (propozycja):** „raport dla wujka”: wynik, trzy liczby, dwie decyzje, jeden wniosek.

---

## 3. Blok 07.12: 9:45–12:20 (do 13:00), 3–4 drużyny

To dłuższy blok niż 45 minut: ok. 2,5 godziny (155 min), z możliwością przedłużenia do 13:00 (195 min). Poniżej
propozycja. Wszystkie czasy namysłu to szacunki. Ten test sprawdza, czy są dobre.

**Ustawienia gry:** zestaw „Lekcja 1 – Zakładamy firmę”, potem zestaw „Lekcja 2 – Pierwsze rachunki” (zmiana zestawu
w tej samej grze: [nazwa przycisku z 03/zestawy]; gdyby jej nie było, załóż grę z zestawem lekcji 2 i zacznij od niej
bez lekcji 1 albo użyj „Pełnej gry”), 4–5 rund, tryb lekcyjny z **czterema rundami na żywo**, 3–4 drużyny i 2–3 boty.
Konta załóż i przypisz do drużyn dzień wcześniej.

| Godzina | Min | Co |
|---|---|---|
| 9:45–10:00 | 15 | Wejście: pytanie z lekcji 1 („Ile wydacie, zanim przyjdzie pierwszy gość?”), kartki z hasłami, logowanie po kolei, pokaz mapy i listu od wujka |
| 10:00–10:25 | 25 | **Runda 1** (tydzień 1): lokal, bank, księgi, menu, ludzie. Zamknięcie po ok. 20–22 min |
| 10:25–10:40 | 15 | Omówienie rundy 1 (jak w lekcji 1): wydane i zostało, liczba z kartki |
| 10:40–10:50 | 10 | **Przerwa** (laptop zostaje włączony; „Pobierz plik gry” jako kopia) |
| 10:50–11:10 | 20 | **Runda 2** (tydzień 2): składniki, ceny, obsada kasy. Zmiana zestawu na lekcję 2 przed tą rundą |
| 11:10–11:25 | 15 | Omówienie: Kasa, Kurier rankingowy, przychód, koszty, dochód, jedna niespodzianka |
| 11:25–11:40 | 15 | **Runda 3** (tydzień 3): poprawki cen i zamówień po wnioskach |
| 11:40–11:50 | 10 | **Przerwa** |
| 11:50–12:10 | 20 | Praca z wynikami: trzy zdania na drużynę (najlepsza decyzja, najgorsza decyzja, co inaczej), źródła: Kurier rankingowy i punkty tygodnia |
| 12:10–12:20 | 10 | Podsumowanie: opinia uczniów o grze (co było niejasne, gdzie utknęli), zebranie kartek |
| **12:20** | | **Koniec zasadniczej części (155 min)** |
| 12:20–12:40 | 20 | *Opcjonalnie do 13:00:* **runda 4** (tydzień 4) i krótkie omówienie księgi gości |
| 12:40–13:00 | 20 | *Opcjonalnie:* wynik końcowy, podium, pytanie do wszystkich |

**Uwagi do tego bloku**
- Runda 1 jest najdłuższa, bo to pierwszy kontakt z grą. Lepiej zamknąć ją po 20 minutach niż czekać na ostatnią
  drużynę.
- Zbierz od uczniów uwagi na kartkach: co było niejasne i ile czasu zajął każdy etap. To najcenniejszy wynik testu.
- Przy 3–4 drużynach start nie obciąża serwera (zmierzono 30 uczniów w 8 drużynach bez błędów serwera).
- Po bloku „Pobierz plik gry” jako kopia zapasowa.

---

## 4. Co robić, gdy…

| Sytuacja | Co zrobić |
|---|---|
| Uczeń nie może się zalogować | Sprawdź adres (`…/konta/login/`) i wielkość liter w loginie i haśle z kartki. W zakładce **Drużyny** nadaj hasło od nowa. Po 5 błędnych próbach konto blokuje się na 5 minut: poczekaj |
| Wolno przy starcie (3–5 s) | To normalne, gdy cała klasa loguje się naraz. Poproś o logowanie drużyna po drużynie. Po starcie gra działa szybko |
| Drużyna nie wysłała decyzji | Panel ostrzega przy zamykaniu. Taka drużyna gra tym, co zapisała do tej pory. Decyzje zapisują się same po każdej zmianie |
| Drużyna nie wie, co robić | Wskaż **list od wujka** i krok „teraz”. Otwórz też **Listę błędów** w menu: wypisuje, czego brakuje |
| Uczeń jest na złej drużynie | Zakładka **Drużyny**: usuń ze starej i dodaj do właściwej |
| Gra się zawiesiła albo strona nie odpowiada | Odśwież stronę (decyzje są zapisane). Jeśli nie pomaga, zamknij konsolę gry i uruchom ją od nowa (`start.bat` albo `hostuj.bat`). Gra wczyta się z bazy. Przed lekcją miej kopię: „Pobierz plik gry” |
| Wynik rundy wygląda źle | Sprawdź dziennik zapisów decyzji w zakładce **Decyzje**. W ostateczności **Cofnij rundę** (wraca o jedną rundę) |
| Brak internetu | Gra z `start.bat` na jednym laptopie działa bez internetu (mapa i dźwięki są w plikach). Przy `hostuj.bat` internet jest potrzebny: bez niego uczniowie nie dojdą do gry. Plan awaryjny: jedna drużyna na laptopie nauczyciela albo omówienie z zapisów |
| Brak prądu lub baterii | Zasilacz, czas lekcji planuj z zapasem baterii. Po powrocie uruchom grę od nowa: wczyta się z bazy |
| Spór o wynik lub podkupywanie pracownika | Zasady są jawne: wygrywa najwyższa oferta, pracownik przechodzi tylko przy ofercie o co najmniej 5% wyższej. Podkupywanie można wyłączyć w ustawieniach gry |
| Klub „Nocna 13” nie pasuje do klasy | Panel mistrza gry: *Decyzje* → ustawienia gry → Klub „Nocna 13” → *zablokuj* (tylko ta gra). Albo zmienna `LUKRUM_KASYNO=0` przed uruchomieniem |
| Chcę wstrzymać grę | **Wstrzymaj grę**: drużyny widzą decyzje, ale nie zmienią ich. „Wznów grę” cofa to |

---

## 5. Zasady oceniania (propozycja)

Gra nie ocenia za miejsce w tabeli. Wynik finansowy jest ważny, ale najlepiej oceniać to, co uczeń potrafi wyjaśnić.
Propozycja do własnej korekty (suma 100 punktów):

| Kryterium | Pkt | Na co patrzeć |
|---|---|---|
| Decyzje uzasadnione | 30 | Pole „co zmieniamy i dlaczego” przy wysyłaniu decyzji: czy jest, czy odnosi się do wyników (kosztów, opinii, kolejki) |
| Wnioski z wyników | 25 | Trzy zdania na lekcji 5 albo „raport dla wujka”: wynik, trzy liczby, dwie decyzje, jeden wniosek |
| Praca zespołu | 20 | Obserwacja nauczyciela: kto czyta, kto liczy, kto decyduje. Podział ról w drużynie |
| Udział w omówieniu | 15 | Odpowiedzi na pytania, porównanie z inną drużyną |
| Wynik gry (0–1000 pkt) | 10 | Tylko jako mała część. Wynik zależy też od rozruchu i losu |

Wskazówki: oceniaj proces, nie samo miejsce; drużynie ze słabym startem zalicz dobry wniosek z błędu; wymagaj pola
„co zmieniamy i dlaczego” (ustawienie w kreatorze).

---

## 6. Mechanika a podstawa programowa

**Uwaga.** Ta tabela nie jest jeszcze sprawdzona z tekstem rozporządzenia. Autor przewodnika nie miał dostępu do
internetu, więc **nie wpisał numerów wymagań**. Tam, gdzie piszemy „do sprawdzenia”, trzeba otworzyć rozporządzenie
(spis źródeł niżej) i dopisać numer, np. „WOS ZP, wymaganie …”. Tematy w tabeli to te z `SCENARIUSZE_LEKCJI.md`.

Dokument: rozporządzenie Ministra Edukacji Narodowej z 30 stycznia 2018 r. w sprawie podstawy programowej kształcenia
ogólnego dla liceum ogólnokształcącego, technikum oraz branżowej szkoły II stopnia (Dz.U. 2018 poz. 467 – numer
publikatora do sprawdzenia w źródle [1]). Przedmiot „biznes i zarządzanie” w nowej podstawie: do sprawdzenia
(źródło [2]).

| Mechanika w LUKRUM | Lekcja | Wiedza o społeczeństwie (liceum) | Biznes i zarządzanie / przedsiębiorczość |
|---|---|---|---|
| Kapitał początkowy, koszty stałe i zmienne, rezerwa | 1, 2 | do sprawdzenia | do sprawdzenia |
| Wybór lokalu, rynek lokalny, klient | 1, 3 | do sprawdzenia | do sprawdzenia |
| Bank, konto firmowe, kredyt, debet | 1 | do sprawdzenia | do sprawdzenia |
| Przychód, dochód, marża, próg rentowności | 2 | do sprawdzenia | do sprawdzenia |
| Opinia klientów, marketing, grupa docelowa | 3 | do sprawdzenia | do sprawdzenia |
| Umowa o pracę i zlecenie, Kodeks pracy, PIP | 4 | do sprawdzenia (prawa pracownika) | do sprawdzenia |
| Podatki, biuro rachunkowe, urzędy | 1, 4, 5 | do sprawdzenia | do sprawdzenia |
| Praca zespołowa, podział ról, wspólna decyzja | wszystkie | do sprawdzenia | do sprawdzenia |
| Instytucje państwa (urząd skarbowy, sanepid, PIP) | 5 | do sprawdzenia | do sprawdzenia |

---

## Źródła

1. Internetowy System Aktów Prawnych (ISAP), wyszukiwarka aktów: <https://isap.sejm.gov.pl/> (hasło: „podstawa programowa
   kształcenia ogólnego dla liceum”, rok 2018). Tekst rozporządzenia trzeba tu sprawdzić i wpisać numery wymagań.
2. Ministerstwo Edukacji i Nauki, podstawy programowe: <https://www.gov.pl/web/edukacja/podstawa-programowa> (sprawdzić,
   czy obowiązuje nowa podstawa z przedmiotem „biznes i zarządzanie” i od kiedy).
3. Czasy lekcji i obciążenie: `../dokumentacja/wiedza/analizy/czas-lekcji.md` (w repozytorium).
4. Instrukcja gry: `INSTRUKCJA.md` (część „Dla mistrza gry”); scenariusze: `SCENARIUSZE_LEKCJI.md`.
