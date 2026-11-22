# LUKRUM – opis gry

Mechaniki i budowa gry dla programistów. Ścieżki plików liczą się od korzenia repozytorium.
Instrukcja dla graczy jest w `INSTRUKCJA.md`.

## Jak się gra

Instrukcja dla graczy: [`INSTRUKCJA.md`](../INSTRUKCJA.md), w grze strona **/jak-grac** (link „Jak grać”
w nagłówku, dostępna bez logowania) i `INSTRUKCJA.pdf`. Po zmianie instrukcji PDF
odświeża `.venv\Scripts\python manage.py instrukcja_pdf` (drukuje Edge albo Chrome).

Strona startowa → „Nowa gra”: firmy graczy (na tym komputerze) i boty (zrównoważony, tani, premium,
agresywny marketing, naśladowca). Gracz porusza się po **mapie Lublina** i **wnętrzach** budynków (kebab, banki, hurtownie, urzędy, agencje…); każdy
punkt wnętrza otwiera okienko z decyzją. Typowa runda: menu i ceny w Mój kebab → sprzęt i obsada → zakupy
w hurtowniach → reklama → **Lista błędów** → **List z decyzjami** na poczcie. Przełącznik **Decyzje / Wyniki**
pokazuje wyniki poprzedniej rundy, nawigator rund pozwala podejrzeć wcześniejsze tygodnie. Limity (`silnik/limity.py`): najwyżej
3 nowych pracowników na rundę (zatrudnienia i oferty podkupienia razem) i kolejny lokal co 3 rundy – zapis
decyzji z przekroczeniem jest odrzucony. **Zdarzenia** (`silnik/swiat/zdarzenia.py`, `dane/zdarzenia/parki.yaml`):
od rundy 2 co tydzień w jednym z parków zaczyna się historia, ta sama dla wszystkich drużyn; reakcja kosztuje czas
właściciela, gotówkę albo porcje, ciąg dalszy przychodzi w kolejnych rundach. **Magazyn** (`silnik/kuchnia/magazyn.py`,
`dane/zdarzenia/magazyn.yaml`, `zalozenia.yaml` → `magazyn`): w grze z lokalami nie ma kosztu magazynowania ani zwrotów
do dostawcy – co nie zmieści się w chłodni i zamrażarce lokalu, jedzie do wynajętej chłodni (za litr, krótszy termin), a towar we własnej szafie
chłodniczej ★★★ ma termin dłuższy o `sprzet.yaml: dluzszy_termin_dni` (liczy się najsłabsza szafa);
towar w wynajmie i przeterminowane jedzenie zwiększają szansę kontroli sanepidu (mandat poza KPiR, mniej klientów),
a duży zapas z krótkim terminem może wywołać telefon z banku żywności. **Agencje reklamowe** (`silnik/rynek/reklama.py`,
`dane/mapa/reklama.yaml`): w grze z lokalami cztery agencje na
mapie (druk, internet, radio i billboardy, wydarzenia), kampania = agencja × kanał × strefa; poszerza pulę klientów
strefy i przyciąga jej mieszkańców do firmy, kampanie tego samego rodzaju w strefie się zagłuszają, powtórka zaraz
po poprzedniej działa słabiej, po końcu efekt wygasa. **Promocje** (`silnik/rynek/promocje.py`, `dane/mapa/promocje.yaml`):
2 za 1, zestaw z napojem, happy hours, karta stałego klienta i zniżka studencka z własną, ozdobną nazwą drużyny;
przyciągają objętych klientów (dni tygodnia, strefy), ale obcinają cenę (rabat, porcje gratis), trwają do
wyłączenia, a ich siła z czasem słabnie albo (karta) rośnie. **Licytacje i przejęcia** (`silnik/nieruchomosci/przejecia.py`): o lokal
wybrany w jednej rundzie przez kilka drużyn decyduje najwyższa oferta (remis – losowanie), budynek wynajmowany przez
inną drużynę można kupić (najemca płaci czynsz nowemu właścicielowi) albo wykupić własny, a właściciel może
wypowiedzieć najem – po 4 rundach najemca się wyprowadza, nakłady rozlicza się wg KC art. 676. **Wypadki
i ubezpieczenia** (`silnik/swiat/awarie.py`, `dane/zdarzenia/losowe.yaml`): od rundy 4 w lokalu drużyny może zacząć się
wypadek – zwykle komiczna historia w kilku scenach, która kończy się szkodą; polisy TUW „Pod Koziołkiem” (lokal,
sprzęt, OC; do kupienia od rundy 4 – `ubezpieczyciel.od_rundy`) po karencji zwracają część szkody. **Urząd i sanepid** (`silnik/ksiegowosc/urzad.py`, `dane/zdarzenia/urzad.yaml`):
sanepid odbiera każdy lokal przed pierwszą rundą działania (kontrole – od rundy `magazyn.sanepid.od_rundy`: 4) – bez sprzątania odmawia i lokal rusza później; poziom
higieny kosztuje co rundę za lokal i zmienia szansę oraz wynik kontroli, a skargi z historii ściągają sanepid
częściej. **Analiza** liczy przewidywany wynik rundy
dla zapisanych wariantów decyzji. W treningu można cofnąć ostatnią rundę.

**Panel mistrza gry** – http://127.0.0.1:8765/mg/ (tylko rola mistrza gry): nowa gra
(drużyny, liczba rund, kapitał startowy, boty tak/nie i które strategie), a w grze zakładki panelu: **Decyzje** (które
drużyny wysłały decyzje, *Zamknij rundę* – także bez decyzji wszystkich, *Cofnij rundę*, strona każdej firmy,
plik gry), **Wyniki** (ranking według średniej karty wyników, dochód netto, gotówka, zadłużenie, wykresy rund)
i **Drużyny** (skład drużyn, nowe konta uczniów, nowe hasło). Runda zamyka się sama, gdy wszystkie drużyny
wyślą decyzje. Przy zakładaniu gry każdy bot dostaje poziom (łatwy / średni / trudny / niemożliwy – ten ostatni
oszukuje: klienci bez powodu wolą jego lokale; albo „jak człowiek” – słaby / średni / dobry: prognozuje tylko z tego,
co widzi drużyna na ekranach gry), poziom można zmienić w trakcie gry (od następnej rundy).

**Prowadzenie gry** (zakładka *Decyzje* panelu mistrza gry):

- *Wstrzymaj grę* – drużyny widzą decyzje, ale ich nie zmieniają ani nie wysyłają, runda się nie zamyka
  (cofnięcie rundy działa); *Wznów grę* liczy następny termin od chwili wznowienia,
- *Zamykanie rund o stałej porze* – tygodniowe terminy (np. wtorek 8:00 i czwartek 8:00). Runda zamyka się
  w pierwszym terminie po zamknięciu poprzedniej, jak po kliknięciu *Zamknij rundę*; drużyny widzą termin na
  pasku i w liście z decyzjami. Terminy zamyka komenda uruchamiana co kilka minut:

  ```
  .venv\Scripts\python manage.py zamykaj_rundy              # raz – np. w Harmonogramie zadań Windows co 5 min
  .venv\Scripts\python manage.py zamykaj_rundy --petla 60   # albo w osobnym oknie: sprawdza co 60 s
  ```

  (Linux: `*/5 * * * * cd /sciezka/gra && .venv/bin/python manage.py zamykaj_rundy` w crontab),
- **gra pokazowa** – `.venv\Scripts\python manage.py gra_pokazowa` usuwa starą grę „Pokazowa” i zakłada nową:
  18 rund, 4 boty (poziom średni) i drużyna „Pokazowa”, za którą decyduje dobry bot (zrównoważony, trudny), cała
  rozegrana tak jak przy zamykaniu rund (ok. 10 s). Drużyna jest przypisana do kont mistrzów gry (albo
  `--konto LOGIN`), więc gra jest w „Twoich grach” – można obejrzeć każde miejsce po każdej rundzie. Opcje:
  `--rund`, `--ziarno`, `--strategia`, `--poziom`, `--rywale`. Odtwarzać po każdej większej zmianie gry,
- strony drużyn uczniów mistrz gry ogląda **tylko do odczytu** (decyzje zmieniają i wysyłają uczniowie);
  drużynę bez uczniów prowadzi sam,
- *Wyniki* → eksport do arkusza: **Ranking (CSV)** i **Wyniki firm w rundach (CSV)** (średnik, przecinek
  dziesiętny – otwiera się wprost w Excelu),
- **podpowiedzi** (*Ustawienia gry*, domyślnie wyłączone, eksperyment) – przez 3 pierwsze rundy Plan tygodnia
  drużyny pokazuje „3 rzeczy do sprawdzenia w tej rundzie” z odnośnikami do miejsc w grze; teksty
  (`api/prezentacja.py: PODPOWIEDZI`) pochodzą z rad w INSTRUKCJA rozdz. 13,
- **refleksja drużyn** (*Ustawienia gry*: nieobowiązkowa / wymagana / wyłączona) – przy liście z decyzjami
  drużyna pisze 1–2 zdania „co zmieniamy i dlaczego”; mistrz gry widzi je w tabeli *Refleksje drużyn* obok
  dochodu rundy i w kolumnie CSV wyników,
- **dziennik zapisów** – link *dziennik* przy statusie decyzji: kto i kiedy zapisywał
  decyzje w bieżącej rundzie. Gdy ta sama przeglądarka (ciasteczko ze strony gry, przetrwa przelogowanie)
  zapisuje decyzje dwóch drużyn, panel pokazuje ostrzeżenie (eksperyment – wspólny komputer w pracowni
  też je wywoła).

**Drużyny.** Drużyna to 1–4 uczniów prowadzących jedną firmę; uczeń gra w jednej drużynie danej gry (w innej
grze może być w innej). Mistrz gry wpisuje w zakładce *Drużyny* listę imion i nazwisk – powstają konta z loginem
`imie.nazwisko` (bez polskich znaków, `ala.nowak2`, gdy zajęty) i losowym 8-znakowym hasłem, pokazanym raz
(okno można wydrukować); zapomniane hasło – „hasło” przy uczniu. Każdy z drużyny zmienia i wysyła decyzje za
całą drużynę; strona pokazuje, kto ostatnio zapisał i kto wysłał. Gdy dwie osoby zmieniają decyzje naraz, zapis
na starszej wersji jest odrzucany (409) i strona wczytuje decyzje kolegi – nic się nie nadpisuje po cichu.
Strona drużyny co 20 s sprawdza zmiany (`GET /api/gry/<id>/stan/<firma>`) i sama się odświeża, także po
przeliczeniu rundy. Drużynę bez uczniów prowadzi mistrz gry.

### Konta i role

Każda strona wymaga logowania (`/konta/login/`, django-allauth). Role:

- **mistrz gry** – grupa `mistrz_gry` albo superużytkownik: zakłada gry, prowadzi rundy, widzi wszystkie
  drużyny, zakłada konta uczniów i dopisuje ich do drużyn w zakładce **Drużyny** gry (albo w panelu **Konta**
  `/admin/`: Użytkownicy; Gry → gra → drużyny – ten sam limit 4 osób),
- **uczeń** – każde inne konto: widzi tylko gry i firmy swoich drużyn (strona i API: 403 dla cudzej firmy),
  nie zamyka ani nie cofa rund.

Konta z własnym loginem zakłada mistrz gry (samodzielna rejestracja wyłączona, `LUKRUM_REJESTRACJA=1` ją
włącza):

```
.venv\Scripts\python manage.py konto pani-ania --mg --imie "Anna Kowalska"   # mistrz gry (hasło z pytania)
.venv\Scripts\python manage.py konto ala --imie "Ala Nowak"                  # uczeń
```

**Konto Microsoft (szkolne)** – krok po kroku w [`LOGOWANIE_MICROSOFT.md`](LOGOWANIE_MICROSOFT.md):
aplikacja w Microsoft Entra ID (adres przekierowania `http(s)://<serwer>/konta/microsoft/login/callback/`),
dane w `lokalne.json` (`"microsoft": {"client_id", "tenant", "secret"}`) albo w zmiennych `LUKRUM_MS_CLIENT_ID`,
`LUKRUM_MS_TENANT`, `LUKRUM_MS_SECRET`. Bez nich przycisk Microsoft się nie pokazuje. Pierwsze logowanie zakłada
konto ucznia; rola mistrza gry: `manage.py konto <e-mail> --mg`. Serwer pod innym adresem: `LUKRUM_HOSTY`
(albo `"hosty"`), za https: `LUKRUM_HTTPS=1` (albo `"https": true`).

**Gra na własnym komputerze** (`start.bat`, `manage.py graj`) loguje się sama na lokalne konto mistrza gry
`lokalny` – tylko z tego komputera. Sam `runserver` wymaga logowania.

**Gra z kolegami przez internet** (`hostuj.bat`, `manage.py hostuj`): serwer na tym komputerze i darmowy
tunel Cloudflare – okno pokazuje link `https://<losowe-slowa>.trycloudflare.com` dla kolegów (nowy przy każdym
uruchomieniu, działa, dopóki okno jest otwarte). Bez konta Cloudflare i ustawień routera; `cloudflared.exe`
pobiera się raz do `narzedzia/`. Logowanie wymagane także z tego komputera (przez tunel każde zapytanie
przychodzi z 127.0.0.1, więc konta `lokalny` nie ma) – za pierwszym razem okno zakłada konto mistrza gry
z hasłem. Kolegom zakłada się konta w zakładce *Drużyny*.

**Stały link** (`staly_link.bat`, `manage.py staly_link`, `panel_gracza/staly_link.py`): gdy masz zwykły hosting
WWW (np. subdomenę `lukrum.szkola.pl` na hostingu z samym PHP), uruchom raz `staly_link.bat` i podaj adres strony
oraz dane konta FTP jej katalogu – trafiają do `lokalne.json` (poza gitem). Od tej pory `hostuj.bat` przy starcie
wgrywa tam przez FTP z TLS `.htaccess` i `index.html` z przekierowaniem na bieżący adres tunelu, a po zakończeniu
gry klawiszami Ctrl+C – stronę „gra wyłączona” (po zamknięciu okna krzyżykiem link prowadzi do martwego tunelu,
do następnego startu). Na hostingu nie trzeba Pythona. Wyłączenie: `staly_link.bat --usun`.

**Wygląd** (⚙ w nagłówku): układ menu – z boku (domyślnie) albo u góry (`static/motyw.js`); paleta – Bar mleczny,
Pewex albo Wysoka widoczność – i tryb jasny lub ciemny (`static/motywy/zmienne.css`: zmienne kolorów, `dostepnosc.css`:
znaki ▲ ▼ ! zamiast samego koloru; `bok.css`, `lukrum.css`: układ menu).

## Budowa

| Folder | Co zawiera |
|---|---|
| `silnik/` | silnik gry (czysty Python, bez Django): rdzeń (`gra`, `runda`, `decyzje`, `dane`, `schematy`, `boty`…) i podpakiety mechanik: `kuchnia/` (menu, dostawcy, magazyn, świeżość), `rynek/` (popyt, konkurencja, reklama, promocje, handel), `ludzie/`, `nieruchomosci/`, `ksiegowosc/`, `pieniadze/` (banki, Harpagon, kasyno), `swiat/` (zdarzenia, awarie), `wyniki/` (karta, wnioski) |
| `dane/*.yaml` | dane gry (kebab) i założenia (niepewne parametry), każdy z `zrodlo`; sprawdzenie: `python -m silnik.dane sprawdz` |
| `lukrum/` | projekt Django (ustawienia, adresy) |
| `gry/` | modele `Gra`, `Runda`, `Decyzja` (event sourcing: konfiguracja + decyzje, stan liczy silnik) i `serwisy.py` |
| `api/` | widoki JSON dla panelu gracza (`widoki.py`) i budowa widoku rundy (`prezentacja.py`) |
| `panel_gracza/` | strony gracza w czystym JS: mapa (`static/mapa/`), wnętrza (`static/swiat/`), ekrany decyzji i wyników (`static/zakladki/`), pulpit z zeszytem wujka (`static/pulpit/`), Chart.js, komenda `graj` |
| `konta/` | logowanie (django-allauth: własny login, konto Microsoft), role uczeń / mistrz gry (`role.py`), komenda `konto` |
| `panel_mg/` | panel mistrza gry (`/mg/`): nowa gra, prowadzenie rund, wyniki drużyn; dane z `GET /api/gry/<id>/mg` |
| `testy/` | pytest w podfolderach jak podpakiety silnika (`rdzen/`, `kuchnia/`…), `aplikacja/` (API, panele, konta), `swiat/` (zdarzenia w parkach, awarie) i `wnetrza/` (dymki, bywalcy); wspólne funkcje pomocnicze w `pomocnicze.py` |

### Kalendarz rund

`katalog.yaml` → `rundy.kalendarz`: okres (`tydzien` / `miesiac`), rund w roku, data startu. Kebab: runda = tydzień,
18 rund od poniedziałku 1.09.2025 (do 4.01.2026), 50 000 zł. Kwoty w danych są **miesięczne** (pensje, czynsz,
utrzymanie) – silnik księguje je na rundę przez `Dane.na_runde` (× 12 / rund w roku); oprocentowanie roczne dzieli
się przez rundy w roku, okresy lokat i kredytów liczą się w rundach, sezonowość – według miesiąca rundy
(`Dane.miesiac_rundy`, tydzień należy do miesiąca swojego czwartku). Koszty jednorazowe (zakupy, rekrutacja,
reklama, księgowość za dokument) się nie skalują. Runda 1 to przygotowanie – sprzedaż od rundy 2. Strona gracza
dostaje kalendarz w `v.gra.kalendarz` (`wspolne.js`: `nazwaRundy`, `naRunde`, `OKRES`).

### Słownik: nazwy w kodzie a kebab

Silnik i klucze danych mają nazwy ogólne, bo branża siedzi w danych:

| W kodzie i danych | W grze |
|---|---|
| usługa (`uslugi`, `oferta`) | danie |
| zasób (`zasoby`) | składnik |
| prowadzący, `godziny_prowadzacego` | kucharz, czas kuchni na porcję |
| `grupa` | porcji naraz (w kebabie 1) |
| stanowisko typu `kuchnia` / `kasa` | stanowisko kuchenne / kasowe (nazwy i zawody: `katalog.yaml` → `stanowiska.typy`) |
