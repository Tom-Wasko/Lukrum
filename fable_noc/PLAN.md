# Plan nocy Fable (15.11 wieczór → 16.11 15:50)

## Przegląd (15.11, 16:55–17:35) – co zastałem
Gra pokazowa (12 rund, ziarno 7) przechodzi bez błędów serwera i konsoli (poza brakiem `favicon.ico`).
- **Wygląd to wciąż rusztowanie z [poprzedniej gry]**: zielony panel, menu z boku z 20 pozycjami, zakładki. Palety PRL
  (`zmienne.css`) istnieją, ale panel ich nie używa. Strona startowa i panel MG tak samo.
- **Wnętrz w grze nie ma.** `lukrum.otworzWnetrze(id)` wysyła zdarzenie, którego nikt nie słucha. Grafiki z podglądu 4
  leżą w `static/grafiki/`, silnik dymków i propozycji ma API (`/wnetrza/…`), ale żaden ekran ich nie pokazuje.
- **Mapa**: w `main` stara kratka; nowa mapa OSM kolegi na `origin/maciex` woła `lukrum.otworzWnetrze(id)` i czeka na
  `e.detail.obsluzone = true`.
- **Pierwsza runda**: pulpit zaczyna od ściany tekstu („Rozruch nowego lokalu…”) i 9 kafli z liczbami. Brak prowadzenia.
- **Instrukcja**: opisuje stare mechaniki (40 000 zł, kredyt odnawialny).
- Widok rundy: 340 kB, 0,2 s (pierwsze wczytanie 4 s – zimny start serwera).

## Kolejność (wartość dla ucznia × koszt)
| # | Temat (gałąź `fable/…`) | Wartość | Koszt | Kto | Stan |
|---|---|---|---|---|---|
| 1 | **swiat** – miejsca zamiast zakładek: pasek ikon, wnętrza budynków (kebab z podglądu 4, hol kamienicy, biurowiec, okienka, hale), słuchacz `lukrum:wnetrze` | 5 | 5 | Fable | |
| 2 | **wyglad** – panel w paletach PRL (bar / pewex / wysoka × jasny / ciemny), wybór w ustawieniach | 5 | 3 | Fable | |
| 3 | **dekor** – sklep meblowy: style, wózek, kasa, paragon; dopasowanie stylu do klientów strefy | 4 | 4 | agent (silnik) + Fable (sklep) | |
| 4 | **katalogi** – ceny od zera: każdy poziom ★ to wybór z kosztem, pomiar przed/po | 4 | 3 | agent | |
| 5 | **wujek** – listy wujka: prowadzenie przez pierwsze rundy, odblokowania zamiast „od rundy N” | 5 | 4 | Fable | |
| 6 | **nazwy** – „Kurier rankingowy”, „Notes błędów księgowej”, „Nadaj decyzje na poczcie” | 3 | 1 | Fable | |
| 7 | **instrukcja** – gracz i MG od nowa pod obecne mechaniki, PIP, opłaty za zmianę biura, przejęcie debetu | 5 | 3 | agent + Fable | |
| 8 | **pawilon** – działka po budowie: własne wnętrze (budowa etapami, potem pawilon) | 3 | 2 | Fable (w #1) | |
| 9 | **lekcje** – tryb 2–3 rundy na żywo, potem między lekcjami; panel MG | 4 | 3 | agent | |
| 10 | **gwiazdki / nastrój** (tor B) – opinie 1–5 w pięciu wymiarach, nastrój pracownika na twarzy | 4 | 5 | jeśli starczy czasu | |
| 11 | start i panel MG w nowym wyglądzie, favicon | 3 | 2 | Fable | |
| 12 | 9:00 – zespół pozywający (pozew-2.md) | – | 2 | agent + Fable | |

Zasada: #1 i #2 blokują „gotową grę” (punkty 2, 4, 5 z briefu), więc idą pierwsze. Agenci dostają tematy z rozłącznymi
plikami (dane i silnik), ja robię front.

## Pomysły na później (nie blokują)
- dźwięki (dzwonek, stempel), pora dnia za oknem, wizyta wujka przy ladzie w ważnych momentach
- boty i konkurencja widoczne we wnętrzu („u konkurencji kolejka”)
- telefon: scena przewijana w poziomie

## Stan 16.11, 07:05 (po wznowieniu)
Zrobione i scalone do `fable`: #1 swiat, #2 wyglad, #3 dekor (silnik + sklep), #4 katalogi, #7 instrukcja, mapa kolegi.
Kolejka na dziś (do 15:00): #5 wujek (pierwsza runda za rękę) → #6 nazwy ekranów → przegląd każdego budynku nowej mapy
→ pawilon i hole → harmonogram odblokowań → #9 lekcje → #11 start i favicon → pozew-2 → raport.
