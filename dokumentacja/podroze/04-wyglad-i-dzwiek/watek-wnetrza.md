# Wątek: wnetrza (podróż 04)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/Wyglad.md`, `dokumentacja/wiedza/analizy/krytyka-wnetrz-16-11.md`,
  `dokumentacja/wiedza/analizy/spis-okien.md`, `_archiwum/fable-17.11/fable-wnetrza/projekt.md` (zasady, rozdz. 7–8;
  folder jest poza gitem: czytaj z głównego repo `C:/Users/PC/Pulpit/lukrum/_archiwum/...`), uwagi majstra
  w `dokumentacja/wiedza/wspolpraca.md`. Gałąź bazowa: `main`. Równolegle: `04/wujek` (może dodać postać w kebabie)
  i `04/prawo`.
- **Cel (Z4, start; szef 24.11):** przegląd i krytyka wszystkich wnętrz, żeby szef wybrał poprawki. Majster: „wnętrza
  wyglądają źle”. **Kodu gry nie zmieniasz.**
  1. **Zrzuty** każdej sceny z `swiat/sceny/index.js` z wariantami (banki `?b=`, parki `?p=` itd.): bar jasny i wysoka
     ciemny, 1366×768; dla 5 najczęściej odwiedzanych (kebab, bank, hurtownia, ratusz, agencja pracy) także telefon
     390×844. Narzędzie `gra/narzedzia/zrzuty.py`, port 8788, do `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-wnetrza/`.
  2. **Krytyka** → `dokumentacja/wiedza/analizy/przeglad-wnetrz.md`: dla każdej sceny 2–4 konkretne usterki (kompozycja,
     czytelność punktów, puste miejsca, niespójność z PRL i z makietą, kontrast, telefon) oraz co działa.
  3. **Lista poprawek:** tabela poprawka → sceny → waga (duża/średnia/mała) → koszt (godziny wyko) → rekomendacja;
     zgrupuj wspólne (np. hole PRL, lady, oświetlenie) i zaproponuj kolejność na 2–3 wątki.
  4. **Galeria:** `_robocze/zrzuty-wnetrza/index.html` (jak `_robocze/galeria-okien/index.html`: przełącznik palety,
     kliknięcie powiększa), przy każdej scenie jej usterki.
- **Gotowe, gdy:** zrzuty, krytyka z listą i galeria są; serwer zatrzymany. Testów nie trzeba (bez zmian w kodzie).
- **Archi:** archi-lukrum.

## Raport (wyko, 24.11)
**Zrobione (kodu gry nie zmieniano):**
- Zrzuty: `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-wnetrza/` (poza gitem): 52 widoki sceny (wszystkie sceny z `index.js`
  z wariantami banków, parków i biur): bar jasny, wysoka ciemny, „pełna” (okno 1366×1000, widać akcje), plus telefon
  390×844 dla 5 scen (kebab, bank-kmicic, sprzet_gastro, ratusz, agencja_pracy). Razem 166 plików PNG.
- Krytyka: `dokumentacja/wiedza/analizy/przeglad-wnetrz.md`: wnioski ogólne, usterki i „co działa” dla każdej sceny,
  tabela 15 poprawek (waga, koszt, rekomendacja), zgrupowania i kolejność na 3 wątki (A „nakładka” ok. 10–12 h,
  B „kebab i ciemna paleta” ok. 5–7 h, C „charakter scen” ok. 14–18 h).
- Galeria: `C:/Users/PC/Pulpit/lukrum/_robocze/zrzuty-wnetrza/index.html` (przełącznik palety w sekcji i globalny,
  kliknięcie powiększa, usterki przy każdej scenie, telefon przy 5 scenach). Otwarcie: dwuklik na pliku.

**Dowody:**
- `python galeria.py` → `bez opisu: []` / `52 71790` (52 sceny, każda ma opis usterek).
- Serwer 8788: `netstat | grep ":8788" LISTENING` → PID 13184; `taskkill /PID 13184 /F` → `SUCCESS`. Serwer zatrzymany.
- `git status --short` → puste (nic poza commitem krytyki; `_robocze/` poza gitem).

**Ograniczenia:** zrzuty na grze pokazowej w tygodniu 10 (Zeszyt wujka, portfel i radio zasłaniają dół każdej sceny);
pewex nie oglądany; wysoka ciemny oglądana wybiórczo; opisy kilku scen skrótowe (patrz sekcja 5 przeglądu).
**Blokada:** sprzątanie roboczego `_robocze/wnetrza/` w worktree (skrypty `gen.py`, `galeria.py`, kroki JSON,
logi) zablokowane (`rm -rf` i `shutil.rmtree` odmówione). Folder jest poza gitem, można go usunąć ręcznie.

## Propozycje (poza zakresem)
- Zeszyt wujka, portfel i radio nakładają się na dół sceny: sprawdzić, czy mogą się zwijać w scenach.
- P1 (dymki startowo zamknięte) daje największy efekt najmniejszym kosztem: warto zacząć od niego.
- Decyzja szefa: który z wątków A/B/C uruchamiać i w jakiej kolejności (A zalecany jako pierwszy).
