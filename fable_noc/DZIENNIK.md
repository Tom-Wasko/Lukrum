# Dziennik nocy Fable (15–16.11.2026)

Format: godzina · gałąź/commit · co i dlaczego · „decyzja Fable” albo „ustalone przez autora”.

- 16:55 · – · start: worktree `_robocze/fable`, gałąź `fable` od `main` 00fef41. Konto MG „fable” tylko w lokalnej bazie.
- 17:05 · – · przegląd gry pokazowej, `PLAN.md`. Narzędzie `_robocze/narzedzia/zrzuty.py` (seria zrzutów + błędy konsoli).
- 17:08 · – · **decyzja Fable: gałęzie tematyczne nazywają się `fable-<temat>`, nie `fable/<temat>`.** Git nie pozwala
  mieć jednocześnie gałęzi `fable` i `fable/coś` (kolizja nazw refów). Reszta jak w briefie: tematy scalam do `fable`.
- 17:10 · – · agenci Sonnet: `fable-dekor` (silnik dekoru), `fable-katalogi` (ceny od zera). Ja: `fable-swiat`.
- 17:20 · `fable-swiat` 81bf8d3 · miejsca z wnętrzami zamiast działów menu, wnętrze kebaba z podglądu 4, słuchacz
  `lukrum:wnetrze`. **Decyzja Fable:** scena jest „obrazkowym menu” budynku, a ekrany decyzji zostają te same
  (klik w tablicę → Menu i ceny); dzięki temu nic z mechanik nie trzeba było przepisywać. Sprzęt i wyposażenie kupuje
  się w Parku handlowym, a nie „w kebabie”.
- 17:22 · `fable-katalogi` · praca agenta przejrzana i zacommitowana (same dane, pomiar w `pomiary/katalogi.md`).
- 17:25 (15.11) – 06:49 (16.11) · – · **przerwa**: sesja stanęła na limicie użycia, agent dekoru też. Noc przepadła; wznowienie
  16.11 o 06:49 (godziny dalej wg `date`).
- 06:52 · `fable-wyglad` 9040a57 · cały panel w paletach PRL: `motywy/lukrum.css` podstawia palety pod dawne zmienne panelu,
  kolory wpisane na sztywno zamienione na zmienne, wybór palety i trybu w menu ⚙, fonty lokalne zamiast Google Fonts.
  **Decyzja Fable:** motyw „Grafik zmian” zdjęty z listy wyboru (plik został), bo miał własne kolory spoza palet.
- 06:54 · `fable` · **„mapa odblokowana” (autor, 16.11 rano)**: scalone `fable-swiat`, `fable-wyglad`, `fable-katalogi`
  i `origin/maciex` (mapa kolegi; bez konfliktów). Kliknięcie budynku na nowej mapie otwiera wnętrze (`obsluzone = true`).
- 06:57 · `fable-dekor` 4cba26e · silnik dekoru po agencie: poprawione 2 czerwone testy (liczba 0,5 przeniesiona do
  `dekor.yaml: czesc_efektu`; `mapa/dekor.yaml` dopisany do plików opcjonalnych kopii zamrożonej, jak `klienci.yaml`).
- 07:00 · `fable-instrukcja` ebdc7cc · agent Sonnet: instrukcja gracza i MG pod obecną grę, strona /jak-grac w paletach.
- 07:02 · `fable-sklep` cb1aa66 · sklep meblowy „Meblościanka”: regały stylów z pieczęcią dopasowania, wózek, paragon.
  **Decyzja Fable:** nazwa „Meblościanka” (słowo z epoki, nie marka); w wózku najwyżej jeden styl na grupę elementów;
  sklep jest częścią ekranu „Wyposażenie” w Parku handlowym (ta sama funkcja gry i odblokowanie co wyposażenie).
- 07:06 · `fable-wujek` a2e9efe · list od wujka na Planie tygodnia. **Decyzja Fable:** kroki prowadzą do miejsc, nie do działów;
  list tylko w tygodniach 1–4; ekran „Dashboard” nazywa się „Plan tygodnia”.
- 07:08 · `fable-swiat` a820b39 · pełny pytest wykrył 1 czerwony test (komunikat listy błędów wskazywał już „Biurowiec
  przy Zana”, test szukał starej nazwy działu) – test poprawiony na nową nazwę miejsca.
- 07:09 · – · sprawdzone automatem: wszystkie 75 znaczników nowej mapy coś otwiera (budynki → wnętrza, lokale i zabytki → okna).
- 07:12 · `fable-nazwy` · nazwy ekranów w duchu mapy (ustalone przez autora 14.11; konkretne brzmienia: decyzja Fable).
- 07:14 · `fable-wyglad` · favicon. `pomiary/dekor.md`: zwrot kompletu dekoru 10,9 tyg. (cel 8–12) – liczby zostają.
- 07:18 · `fable-kurier` · pierwsza strona gazety w redakcji (pomysł Fable). `fable-pip` · praca agenta przejrzana i scalona.
- 07:20 · – · próba całej ścieżki dekoru w grze: wózek → zamknięcie rundy → szyld PRL i meble widać w kebabie (zrzut 82).
- 07:22 · `fable-nazwy` · pełny pytest: 1 czerwony test pilnujący, że teksty gry odsyłają do istniejących nazw ekranów –
  poprawione odsyłacze („Strefy” → „Goście w strefach”, „Dostawy” → „Zamówienia”, „Kuchnia” → „Menu i ceny”).
- 07:24 · `fable-lekcje` · praca agenta przejrzana (kreator na zrzucie), opis zmieniony na neutralny, scalona.
- 07:26 · `fable-final` · podium i ostatni list od wujka (pomysł Fable).
- 07:28 · `fable` · pełny pytest 739 zielonych, ruff i `silnik.dane sprawdz` czyste.
- 07:30 · `fable-ksiega` · księga gości (tor B: opinie w wymiarach; **decyzja Fable:** bez nowej mechaniki, pokazuję powody,
  które silnik już liczy; nastrój pracownika 0–100 z toru B zostaje nietknięty – jest jako „zadowolenie” w Zapleczu).
- 07:32 · – · palety: wysoka widoczność ciemna i Bar mleczny ciemny obejrzane na Planie tygodnia, wnętrzu i mapie (zrzuty 96–98).
- 07:34 · `fable` d210108 · przegląd prawny (agent Sonnet, `pozew-2.md`): poprawki pewne od razu, reszta do „Do decyzji”.
- 07:45 · `fable` · dokumenty w `fable_noc/` (kopie bez nazw innych gier, bo repo ich nie dopuszcza), README, `START_FABLE.bat`
  w folderze `lukrum/` (poza repo). Gra uruchomiona autorowi do przeglądu na porcie 8765.
- 07:50 · – · automat przeszedł 39 ekranów w decyzjach i wynikach (paleta Pewex ciemna): bez „undefined”/„NaN”, konsola czysta;
  rzadkie ekrany w trybie ciemnym obejrzane (zrzuty 110–112). PDF instrukcji przegenerowany.
- 07:52 · – · próba zmiany nazw grup „Nowe w tej rundzie” wycofana (łamała 2 testy silnika, mała wartość) – zostaje dla Opusa.
- 07:55 / 12:33 · `fable-dymki-mg` · przełącznik dymków w panelu MG (ustalone przez autora 14.11). Przerwa do 12:33.
- 12:40 · – · **przejście ucznia od zera**: w grze „Runda 1” kroki z listu od wujka po kolei (lokal → bank → biuro → menu →
  ludzie → wyślij), runda zamknęła się sama, w tygodniu 2 list „Otwieramy!” i kolejny krok „Zamów składniki”. Bez błędów.
- 12:45 · `fable` · teksty neutralne płciowo z listy przeglądu prawnego.
