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
