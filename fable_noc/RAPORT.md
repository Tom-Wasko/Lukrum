# Raport Fable – LUKRUM, gałąź `fable` (stan 16.11.2026, 12:45; praca trwa do 15:50)

**Uwaga o czasie.** Sesja z 15.11 stanęła o 17:25 na limicie użycia i noc przepadła. Wszystko poniżej (poza pierwszym
krokiem „świata” i katalogami) powstało 16.11 od 06:49. `main` jest nietknięty, nic nie poszło na FTP.

**Jak obejrzeć:** `lukrum\START_FABLE.bat` → http://127.0.0.1:8765. Gry testowe: „Runda 1”, „Runda 2”, „Runda 4”
(tydzień 5, z kupionym wystrojem), zakończona „Pokazowa” (podium).

## Stan względem „gotowej gry”
| # | Warunek | Stan |
|---|---|---|
| 1 | Gra pokazowa przechodzi wszystkie rundy bez błędów | **Tak.** 12 rund, konsola i log serwera czyste; pełny pytest zielony (739 testów, także po poprawkach prawnych), ruff i `silnik.dane sprawdz` czyste. |
| 2 | Każdy budynek mapy coś otwiera | **Tak.** Mapa kolegi (`maciex`) scalona; automat kliknął wszystkie 75 znaczników: budynki → wnętrza, lokale i zabytki → okna. |
| 3 | Instrukcja opisuje obecne mechaniki | **Tak, do przeczytania przez autora.** Gracz + „Dla mistrza gry”; PDF nie przegenerowany. |
| 4 | Trzy palety × jasny/ciemny czytelne | **Tak dla obejrzanych ekranów** (Plan tygodnia, wnętrze, mapa, sklep, menu, kalendarz, wyniki finansowe, giełda, panel MG w 5 z 6 wariantów). Automat przeszedł 39 ekranów w trybie ciemnym bez błędów; nie każdy ekran oglądałem okiem w każdej palecie. |
| 5 | Uczeń wie po 10 minutach, co robić | **Ścieżka działa, niesprawdzona na ludziach.** Przeszedłem tydzień 1 od zera samymi krokami z listu od wujka (lokal → bank → biuro → menu → ludzie → wyślij) i runda się zamknęła; potrzebny test z prawdziwą klasą. |

## Tematy od najbardziej wartych wzięcia (szczegóły i „jak wziąć”: `ZMIANY.md`)
1. **`fable-swiat`** – miejsca z wnętrzami zamiast działów menu. Fundament reszty.
2. **`fable-wyglad`** – cały panel w paletach PRL, wybór w ⚙, fonty lokalne, favicon.
3. **`fable-wujek`** – Plan tygodnia jako lista kroków z listem od wujka i nowościami tygodnia; krok „teraz” zaznaczony też na mapie i we wnętrzu.
4. **Mapa z `maciex`** – działa z wnętrzami bez zmian w plikach kolegi.
5. **`fable-instrukcja`** – instrukcja pod obecną grę.
6. **`fable-dekor` + `fable-sklep`** – wystrój lokalu dopasowany do gości okolicy; sklep „Meblościanka” z wózkiem
   i paragonem. Pomiar: komplet 8 300 zł zwraca się średnio w 10,9 tyg.
7. **`fable-pip`** – panel wreszcie pokazuje PIP, opłatę za zmianę biura i przejęcie debetu.
8. **`fable-kurier`**, **`fable-final`**, **`fable-ksiega`** – gazeta w redakcji, podium na koniec, księga gości
   z oceną w pięciu wymiarach. Same widoki, zero zmian zasad, łatwe do wzięcia albo pominięcia.
9. **`fable-lekcje`** – tryb lekcyjny (rundy na żywo, potem terminy). Wymaga `zamykaj_rundy` na serwerze.
10. **`fable-dymki-mg`** – przełącznik rodzajów dymków w panelu mistrza gry (brakujący kawałek decyzji z 14.11).
11. **`fable-nazwy`** – tytuły ekranów w duchu mapy; kwestia gustu, jedna tabela do poprawek.
12. **`fable-katalogi`** – ceny od zera; zmienia balans (strategia premium traci), do oceny w grze testowej.

13. **`fable-scenariusze`** – projekt pięciu scenariuszy lekcji (sam dokument).

## Niedokończone (dla Opusa)
- Telefon sprawdzony tylko na 2 ekranach (Plan tygodnia, wnętrze); wysoka widoczność tylko na 3 ekranach.
- `fable-pip`: nieobejrzane w przeglądarce w grze z debetem i zleceniami (testy widoku są).
- Wnętrza poza kebabem są schematyczne (drzwi, okienka); pawilon na działce korzysta ze sceny budowy i zwykłego wnętrza.
- Strona startowa pokazuje „Nowe w tej rundzie” starymi nazwami („Zakładki”, „HR”).

## Otwarte decyzje autora
Spisane z wariantami w `notatki/Do decyzji.md` (gałąź `fable` repo notatek), sekcja „Po nocy Fable”: „Nocna 13”
a niepełnoletni, znaki i opisy prawdziwych marek, uproszczenia prawa (zlecenie, debet), Józio i Solaris, numery domów,
nazwa palety „Pewex”, nazwy z nocy, kto uruchamia `zamykaj_rundy`.

## Przegląd prawny (`pozew-2.md`)
Śladów [inna gra] brak; OSM podpisany, fonty z licencją, nic nie ładuje się z zewnątrz. Poprawione od razu: zlecenie i debet
opisane jako uproszczenia, urlop, art. 36 KP, hipoteka/zastaw, „Nocna 13” bez zachęty do ukrywania przed mistrzem gry,
opis biur na mapie, stopka instrukcji. Reszta czeka na decyzje.

## Zrzuty (`_robocze/fable/zrzuty/`)
`52-wujek-r1.png` (Plan tygodnia), `82-kebab-dekor.png` (wnętrze z wystrojem), `41-sklep.png` (sklep meblowy),
`30-mapa-nowa.png` (mapa), `80-kurier.png` (gazeta), `93-final.png` (podium).
