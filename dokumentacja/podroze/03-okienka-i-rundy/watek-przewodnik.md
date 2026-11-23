# Wątek: przewodnik (podróż 03)

## Brief
- **Najpierw przeczytaj:** `dokumentacja/podroze/03-okienka-i-rundy/wspolne.md`, `gra/dokumentacja/SCENARIUSZE_LEKCJI.md`,
  `dokumentacja/wiedza/analizy/czas-lekcji.md`, `gra/INSTRUKCJA.md` (część „Dla mistrza gry”), `dokumentacja/funkcje/`
  (notatki funkcji: „czego uczy”). Gałąź bazowa: `podroz-03`. Równolegle pracuje `03/zestawy` (przełączanie zestawu
  funkcji w `/mg/` między lekcjami): opisz to jako krok, a nazwę przycisku sprawdź na końcu w jego gałęzi albo zostaw
  znacznik „[nazwa przycisku z 03/zestawy]”, który uzupełni Archi.
- **Cel (Z18):** przewodnik dla nauczyciela, z którym ktoś, kto pierwszy raz widzi LUKRUM, poprowadzi lekcję. Pierwszy
  test na klasie: **07.12, 9:45–12:20/13:00, 3–4 drużyny** (to dłuższy blok niż 45 min: zaproponuj jego przebieg).
- **Plik:** `gra/dokumentacja/PRZEWODNIK_NAUCZYCIELA.md` (część gry, idzie do szkoły). Zawartość:
  1. Przed lekcją: uruchomienie (laptop i stały link, `hostuj`), założenie gry w kreatorze z zestawem lekcji, druk kartek
     z hasłami, sprawdzenie sprzętu (lista kontrolna na jedną stronę).
  2. Przebieg każdej z 5 lekcji (z `SCENARIUSZE_LEKCJI.md` i zmierzonych czasów): minuta po minucie, co mówi
     nauczyciel, kiedy zamyka rundę, pytania do omówienia.
  3. Przebieg bloku 07.12 (ok. 2,5–3 h, 3–4 drużyny): ile rund, przerwy, omówienie.
  4. Co robić, gdy… (uczeń nie może się zalogować, drużyna nie wysłała decyzji, gra się zawiesiła, brak internetu).
  5. Zasady oceniania: propozycja kryteriów (nie tylko wynik finansowy: decyzje uzasadnione, praca zespołu, omówienie).
  6. Tabela „mechanika a podstawa programowa”: WOS oraz biznes i zarządzanie, liceum. **Tylko z prawdziwych źródeł**:
     obowiązująca podstawa programowa (rozporządzenie MEN, link i numer wymagania, np. „WOS ZP, wymaganie …”). Gdy nie
     znajdziesz dokładnego wymagania, wpisz „do sprawdzenia” zamiast zgadywać.
- **Zasady:** tekst prosty, bez żargonu, neutralny płciowo, „LUKRUM” się nie odmienia, zero wzmianek o innych grach
  biznesowych. Liczby (czasy) tylko z `czas-lekcji.md`. Kodu gry nie zmieniasz.
- **Gotowe, gdy:** plik jest; README (lista dokumentów) i INSTRUKCJA odsyłają do niego; źródła podstawy programowej
  z linkami na końcu pliku; zrobiony PDF obok (jak `INSTRUKCJA.pdf`, tym samym sposobem, jeśli jest skrypt), wynik
  w raporcie. Testy: `testy/aplikacja` (linki w dokumentach, jeśli taki test jest).

## Raport
**Stan: gotowe z zastrzeżeniami** (gałąź `worktree-podroz-03-przewodnik`, bez push).

**Zrobione**
- `gra/dokumentacja/PRZEWODNIK_NAUCZYCIELA.md` (+ `.pdf` obok, 268 KB): przed lekcją i lista kontrolna, przebieg 5 lekcji
  (tabele minuta po minucie), blok 07.12 (155 min + opcjonalnie do 13:00, 3 rundy + opcjonalnie 4.), „co robić, gdy…”,
  kryteria oceniania (propozycja, 100 pkt), tabela mechanika–podstawa programowa, źródła.
- README (lista dokumentów) i INSTRUKCJA („Dla mistrza gry”) odsyłają do przewodnika. `INSTRUKCJA.pdf` odświeżony.
- PDF zrobiony jednorazowym skryptem (render tej samej strony co `instrukcja_pdf`, ale z innego pliku .md; skrypt
  w katalogu roboczym joba, kodu gry nie zmieniałem). Nie ma stałej komendy na PDF przewodnika.

**Dowody**
- `manage.py instrukcja_pdf` → `Zapisano …INSTRUKCJA.pdf (427 KB).`
- `pytest testy/aplikacja` → `267 passed in 148.89s`. Pełnych testów nie puszczałem (zmieniły się tylko dokumenty).

**Do uzupełnienia / decyzji Archiego**
1. **Podstawa programowa: wszystkie numery wymagań to „do sprawdzenia”.** Sieć jest zablokowana, więc nie sprawdziłem
   rozporządzenia (nie zgaduję numerów). Podałem tylko akt (MEN 30.01.2018, Dz.U. 2018 poz. 467; numer też „do sprawdzenia”)
   i linki do ISAP/gov.pl. Trzeba ręcznie wypełnić tabelę w pkt 6 (WOS, podstawy przedsiębiorczości / biznes i zarządzanie).
2. Znacznik **„[nazwa przycisku z 03/zestawy]”** (2 miejsca: pkt 1.2 i blok 07.12) do uzupełnienia po scaleniu 03/zestawy.
   Wersja bloku zakłada przełączenie zestawu między rundą 1 i 2.
3. Serwer szkoły (Z19): w przewodniku „adres i opiekun do ustalenia”; po decyzji dopisać (też kto uruchamia `zamykaj_rundy`).
4. Po uzupełnieniu 1–3 przegenerować PDF przewodnika.
5. Propozycje: komenda `przewodnik_pdf` zamiast jednorazowego skryptu; kartki z hasłami w podziale na drużyny (Z47).
