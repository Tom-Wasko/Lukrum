# Wątek: prawo (podróż 04)

## Brief
- **Najpierw przeczytaj:** wiersz Z23 w `dokumentacja/Zadania.md` (sekcja „W toku”), `dokumentacja/wiedza/lista-kontrolna-przegladu.md`,
  `dokumentacja/funkcje/Nawiazania-i-zrodla.md`, raport wątku `dokumentacja/podroze/03-okienka-i-rundy/watek-przeglad-prawny.md`
  (jeśli jest), `gra/INSTRUKCJA.md`. Gałąź bazowa: `main`. Równolegle: `04/wujek` (dymki, scena kebabu) i `04/wnetrza`.
- **Cel (Z23, reszta; szef 24.11):** część Z23 zrobiono 23.11 (strona `/zrodla`, lista kontrolna, część notek).
  Najpierw porównaj listę Z23 ze stanem repo i w raporcie wypisz: zrobione / robię teraz / zostaje. Potem zrób brakujące:
  1. **Notki edukacyjne w INSTRUKCJI** (krótko, przy właściwej mechanice, każda ze źródłem: ustawa z isap.sejm.gov.pl
     albo gov.pl): progi kontroli PIP, staż z urzędu pracy, ZUS (zlecenie, student do 26 lat), odsetki ustawowe
     i maksymalne, lichwa (art. 304 kk), CEIDG / PIS, daty roku szkolnego 2026/27. Wiedza tylko ze źródeł, z odnośnikiem.
  2. **Strona „Nawiązania i źródła”** (`/zrodla`, `dane/zrodla.yaml`): uzupełnij braki, w tym nagrania dźwięków
     z podróży 04 (`dane/dzwieki.yaml`) i radio; odnośniki ze stopek.
  3. **Drobne:** stopki, PDF instrukcji zgodny z `.md` (sprawdź, jak go dziś budujemy), ODbL mapy, User-Agent narzędzi
     pobierających (bez danych osobowych), autorstwo grafik (`wiedza/wykaz-grafik-i-fontow.md`), informacja o klubie
     (kasyno) w instrukcji MG.
  4. **Lista kontrolna:** uaktualnij `lista-kontrolna-przegladu.md` (przebieg poleceń dziś, ✓ / !).
- **Bez:** wyszukiwania prawdziwych nazwisk i firm (szef wyłączył) i bez oceny prawnej (rozmowa z prawnikiem to szef).
- **Nie ruszaj:** silnika, mechaniki, `dane/wnetrza/`, scen. INSTRUKCJĘ i README w tej podróży zmieniasz tylko Ty.
- **Testy:** jeśli zmieniasz `/zrodla` albo dane: testy strony i `silnik.dane sprawdz`.
- **Zrzuty:** port 8787, `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-prawo/`: `/zrodla` (bar jasny, wysoka ciemny).
  Po pracy zatrzymaj serwer.
- **Gotowe, gdy:** jak wyżej; pełne testy zielone, `ruff`, `silnik.dane sprawdz` (wyniki w raporcie).
- **Archi:** archi-lukrum.

## Raport

**Raport wyko (24.11.2026)**

**Porównanie listy Z23 ze stanem repo**
- *Zrobione wcześniej (03):* strona `/zrodla`, lista kontrolna, wykaz grafik i fontów, ikony bez logo marek, PDF, podpis OSM, tabela nazwisk (brak trafień).
- *Zrobione teraz:* notki prawne w INSTRUKCJI (podrozdział „Prawo za mechanikami”: PIP, staż, ZUS i student do 26 lat, odsetki ustawowe i maksymalne, lichwa art. 304 kk, CEIDG i sanepid, rok szkolny 2026/27), „Ukryty klub” w części dla MG, dźwięki gry w `dane/zrodla.yaml`, odnośniki do `/zrodla` w stopkach (start, gra), stopka `/zrodla`, uaktualniona lista kontrolna i wykaz, PDF zbudowany na nowo.
- *Zostaje:* sprawdzenie notek przez prawnika (szef); punkty 1–3 listy kontrolnej (hasła w archiwum) nie powtórzone dziś; 7 dźwięków w stanie „oczekuje” nie ma jeszcze nagrań (wątek dźwięków); przejście po wszystkich postaciach i firmach w `dane/` (szef wyłączył wyszukiwanie nazwisk).

**Dowody**
- `silnik.dane sprawdz` → „Dane w porządku … (wersja f22c54a3f294)”
- `ruff check .` → „All checks passed!”
- `pytest testy/aplikacja/test_zrodla.py` → „5 passed”
- pełne `pytest -q` → „995 passed in 403.72s (0:06:43)”
- `manage.py instrukcja_pdf` → „Zapisano … INSTRUKCJA.pdf (457 KB)” po ostatniej zmianie `.md`
- zrzuty `/zrodla` (bar jasny, wysoka ciemny): `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-prawo/`; serwer zatrzymany.

**Źródła notek** (WebSearch 24.11): odsetki: [Monitor Polski 2026 poz. 368](https://eli.gov.pl/eli/MP/2026/368/ogl/pol/pdf) (ustawowe 7,25% od 5.03.2026, maksymalne 14,5%); rok szkolny: komunikat MEN (prasa, gov.pl); CEIDG i sanepid: biznes.gov.pl, gov.pl (PSSE).
**Do sprawdzenia:** notki o PIP (art. 281 KP), stażu (ustawa o promocji zatrudnienia) i ZUS/PIT studenta do 26 lat napisałem z własnej wiedzy, z odnośnikami do stron ogólnych (ISAP, zus.pl, praca.gov.pl), bez numerów Dz.U.; art. 304 kk potwierdzony tylko ogólnie (nowelizacja 2020, §2–3); numeracji paragrafów art. 359 KC w ISAP nie sprawdzałem, więc podałem sam artykuł.

**Decyzja szefa:** czy notki mają przejść przez prawnika przed pokazem (zalecane).
**Propozycje:** test, że PDF nie jest starszy od `.md`; w worktree brak `.venv` i `db.sqlite3` (użyłem venv z głównego repo i migracji), warto dopisać do przewodnika.
