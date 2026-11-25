# Wątek: punkty-zrodla (podróż 04)

## Brief
- **Najpierw przeczytaj:** `CLAUDE.md`, `gra/AGENTS.md`, w `gra/panel_gracza/static/mapa/lublin.json` klucz `dodatkowe` (11 punktów:
  trybunal, katedra, brama_grodzka, nowy_ratusz, teatr, centrum_kultury, skansen, dworzec_glowny, most, kosciol_czwartek,
  cmentarz_lipowa) i `miejsca`; `gra/dane/mapa/budynki.yaml` (wpisy `auchan`, `blonia`, `lidl*`, `kamienica_bankowa`).
  Gałąź bazowa: `podroz-04`.
- **Cel (Z7, część do zrobienia bez szefa):** sprawdzić w źródłach (OpenStreetMap/Nominatim, Wikipedia, strony miasta i
  instytucji; z odnośnikiem) i poprawić:
  1. opisy 11 punktów `dodatkowe` (fakty: daty, nazwy, krótko, po polsku, bez żargonu; max 2 zdania, jak dziś);
  2. położenia (`xy` w układzie mapy z `rzut` w lublin.json) tych 11 punktów oraz Auchan, Błoni i Lidla (`geo` w budynki.yaml)
     względem współrzędnych z OSM. Przelicz współrzędne tak, jak robi to `xy()` w `lublin.js` (rzut w lublin.json).
     Przesuwaj tylko, gdy błąd > ok. 80 m; żeton nieikoniczny może być przesunięty, ikony ratusza, parków, zalewu, kamienicy
     bankowej, uczelni i giełdy zostają (Decyzje 18.11). Nie nachodzić na inne żetony.
  3. w raporcie tabela: punkt, co sprawdzono, źródło (URL), zmiana lub „bez zmian”.
- **Zasady:** zero wzmianek o innych grach; prawdziwe marki (Auchan, Lidl) tylko neutralnie, bez ocen; wiedza ze źródeł, nic
  z pamięci; gdy źródła się różnią albo nie ma pewności, zostaw dotychczasowe i zapisz w raporcie.
- **Nie ruszaj:** mapy poza wskazanymi punktami (strefa majstra: minimalne zmiany), silnika, ikon lokalu i
  `podglad_lokali.html` (czeka na decyzję szefa), INSTRUKCJI i README.
- **Testy:** `python -X utf8 -m silnik.dane sprawdz`; `pytest -q -p no:cacheprovider testy/swiat testy/aplikacja`; `ruff check .`.
  Pełnych testów nie uruchamiaj (zajmuje się tym Archi).
- **Gotowe, gdy:** wszystkie punkty sprawdzone i zapisane w tabeli raportu, zmiany w plikach, testy zielone (wynik w raporcie).
- **Archi:** archi-lukrum.

## Raport
**Ograniczenie:** Nominatim/OSM niedostępny (curl zablokowany; WebSearch nie podaje współrzędnych poza jednym przypadkiem).
Nie da się więc sprawdzić położeń z dokładnością 80 m. Zgodnie z briefem („brak pewności → zostaw”) **żadnych `xy` ani `geo` nie ruszano.**

| Punkt | Co sprawdzono | Źródło | Zmiana |
|---|---|---|---|
| trybunal | Sejm ustanowił Trybunał 1578, pierwsza sesja w Lublinie 1579; Rynek 1, dziś Trasa Podziemna | zabytek.pl/en/obiekty/lublin-trybunal-(d-stary-ratusz)-ob-palac-slubow-oraz-lubelsk; umcs.pl/pl/crown-tribunal-old-town-hall,22082.htm | opis: „Od 1578” → „Od 1579 roku”. Położenie: niesprawdzone |
| katedra | budowa jezuitów 1586–1604/1606, katedra od 1805 | lublin.eu/en/what-to-see-do/attractions-sights/monuments/archcathedral,8415,w.html | opis bez zmian. „Zakrystia akustyczna”: brak potwierdzenia w źródłach, do weryfikacji |
| brama_grodzka | Wikipedia: 51,24944 N 22,56972 E; nasze xy ≈ 51,24965 / 22,56987 (≈ 25 m) | en.wikipedia.org/wiki/Grodzka_Gate_–_NN_Theatre | bez zmian |
| nowy_ratusz | klasycyzm 1827–1828, pl. Łokietka; hejnał w południe (balkon vs taras: źródła różnie) | lublin.eu/en/what-to-see-do/attractions-sights/monuments/the-new-city-hall,8434,w.html | bez zmian |
| teatr | gmach Narutowicza 17, 1884–1886 (XIX w.) | zabytek.pl/en/obiekty/lublin-budynek-teatru-im-juliusza-osterwy | bez zmian |
| centrum_kultury | dawny klasztor wizytek, Peowiaków 12 | ck.lublin.pl/en/about-us-buildings-history/ | bez zmian |
| skansen | al. Warszawska 96 | skansen.lublin.pl | bez zmian; współrzędnych nie znaleziono |
| dworzec_glowny | gmach XIX w. (linia 1877), obok Dworca Metropolitalnego | lublin.eu/en/what-to-see-do/attractions-sights/monuments/railway-station,8444,w.html | bez zmian |
| most | Hennebique, 1909 (początek XX w.); źródła mieszają dwa mosty Lutosławskiego (Kalinowszczyzna i Zamojska) | structurae.net/en/structures/marian-lutoslawski-bridge | bez zmian; do weryfikacji, o który most chodzi |
| kosciol_czwartek | „targ” niepotwierdzony; Czwartek to jedno z najstarszych miejsc osadnictwa | ph.pollub.pl/index.php/teka/article/view/2611 | opis: „Tu, przy dawnym targu, zaczynał się Lublin.” → „Wzgórze Czwartek to jedno z najstarszych miejsc osadnictwa w Lublinie.” |
| cmentarz_lipowa | koniec XVIII w. (grunt 1794; zakaz pochówków przy kościołach 1792); części kat., ew., praw., wojskowa | zabytek.pl/en/obiekty/lublin-cmentarz-rzymskokatolicki-ewangelicki-prawoslawny-oraz- | bez zmian |
| auchan, blonia, lidl | nie sprawdzano (brak współrzędnych OSM) | – | bez zmian |

**Testy:** `silnik.dane sprawdz` → „Dane w porządku”; `pytest testy/swiat testy/aplikacja` → 349 passed; `ruff check .` → All checks passed.

**Do dokończenia (wymaga sieci):** współrzędne z Nominatim dla 10 punktów + Auchan, Błonia, Lidl; porównanie z xy (próg 80 m).
Plik wątku istniał tylko w głównym checkoucie (niescommitowany); skopiowałem go do worktree.
