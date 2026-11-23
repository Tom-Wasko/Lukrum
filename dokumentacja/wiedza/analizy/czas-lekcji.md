# Czas lekcji: ile trwa runda i czy wytrzyma 30 uczniów (Z17, Z45)

Pomiary z 23.11.2026, wątek `03/lekcja` (podróż 03). Komputer deweloperski, Windows, SQLite, serwer jak `hostuj`
(Django `runserver`, jeden proces, `DEBUG=0`), ale lokalnie i bez tunelu.
**Co zmierzone, a co oszacowane:** czasy silnika i serwera są **zmierzone** (komendy niżej). Czas namysłu uczniów
i liczba kliknięć to **szacunek** z liczby zadań w `dane/zeszyt.yaml` – nie badano żywej klasy; trzeba go
sprawdzić na prawdziwej lekcji.

## 1. Silnik: przeliczenie tygodnia przy 8 drużynach

`python -X utf8 -m balans.czas_rundy 6 [zestaw]` – 8 drużyn-botów, 6 kolejnych rund, czas samego `przelicz`.

| Zestaw funkcji | mediana | maksimum (1. runda) |
|---|---|---|
| (wszystko odkryte) | 0,60 s | 0,82 s |
| Lekcja 1 – Zakładamy firmę | 0,62 s | 0,86 s |
| Lekcja 2 – Pierwsze rachunki | 0,64 s | 0,83 s |
| Lekcja 3 – Klient i opinia | 0,60 s | 0,82 s |
| Lekcja 4 – Praca i prawo | 0,62 s | 0,84 s |
| Lekcja 5 – Bilans sezonu | 0,60 s | 0,82 s |

Wniosek: przeliczenie tygodnia to **poniżej sekundy** i nie zależy od zestawu. W próbie obciążenia (pkt 3)
„Zamknij rundę” przez API trwało 0,19 s (z 8 drużynami i botami). Czas lekcji nie zależy więc od silnika.

## 2. Lekcja po lekcji (szacunek)

Założenia: jedno zadanie z „zeszytu” (list od wujka) to ok. 5 kliknięć (wejście do budynku, okienko, wpis,
zapis, powrót) i 1,5–2 min namysłu drużyny; tydzień 1 ma 8 zadań, każdy kolejny 3 zadania + cel tygodnia od wujka;
wysłanie decyzji i zamknięcie rundy przez mistrza gry ≈ 1 min z omówieniem „kto nie wysłał”; przeliczenie ≈ 1 s.

| Lekcja | Zestaw | Odkryte funkcje (poza podstawą) | Tygodnie na lekcji | Zadań | Kliknięć na drużynę | Namysł drużyn | Przeliczenie | Razem „gra” (cel 25 min) |
|---|---|---|---|---|---|---|---|---|
| 1 Zakładamy firmę | `lekcja_1_zakladamy_firme` | brak | 1 | 8 | ok. 40 | 12–16 min | ≈ 1 s | ok. 15–18 min – mieści się |
| 2 Pierwsze rachunki | `lekcja_2_pierwsze_rachunki` | Zaopatrzenie | 2 i 3 | 2 × (3 + cel) | ok. 2 × 20 | 2 × 5–7 min | 2 × 1 s | ok. 12–16 min – mieści się |
| 3 Klient i opinia | `lekcja_3_klient_i_opinia` | Zaopatrzenie, Wyposażenie, Marketing, Analiza rynku | 4 (praca z danymi z 4–6) | 3 + cel | ok. 20 | 5–7 min + praca z księgą gości | ≈ 1 s | ok. 12–15 min |
| 4 Praca i prawo | `lekcja_4_praca_i_prawo` | Zaopatrzenie, Rozwój, Urzędy | 7 | 3 + cel | ok. 20 | 5–7 min + liczenie umów | ≈ 1 s | ok. 12–15 min |
| 5 Bilans sezonu | `lekcja_5_bilans_sezonu` | Zaopatrzenie, Wyposażenie, Marketing, Analiza rynku, Rozwój, Urzędy | po 12 | 0–3 (praca z wynikami) | ok. 0–20 | 3 zdania na drużynę | ≈ 1 s | ok. 25 min (czytanie wyników) |

Cel „runda ≤ 15 min”: spełniony dla lekcji 1–4 przy założeniach wyżej; **najwięcej ryzyka ma lekcja 1** (8 zadań,
uczniowie pierwszy raz w grze – realnie 18–22 min). Zalecenie dla prowadzącego: w lekcji 1 zamknąć rundę po
ok. 20 minutach, nawet gdy kilka drużyn nie skończy (panel ostrzega, kto nie wysłał; taka drużyna gra zapisanym).
Lekcja 45 min = 5 min wejście + 25 min gra + 15 min omówienie (jak w scenariuszach) mieści się, gdy nie
przeciąga się wprowadzenie do mapy.

## 3. Próba obciążenia: 30 uczniów w 8 drużynach

`python -X utf8 -m balans.obciazenie 8798 30 8 60 lekcja_3_klient_i_opinia` przy serwerze uruchomionym jak `hostuj`.
Skrypt: logowanie 30 kont przez formularz, wczytanie strony gry i widoku, odpytywanie `stan` co 5–20 s (jak strona),
zapis decyzji (po jednej osobie w drużynie, co 8–15 s), wysłanie decyzji, zamknięcie rundy przez MG, ponowne
wczytanie widoku przez całą klasę. Wynik (60 s „pracy”, 78 s całości):

| zapytanie | liczba | mediana ms | p95 ms | maks. ms | statusy ≠ 200 |
|---|---|---|---|---|---|
| logowanie: strona | 69 | 577 | 1575 | 1608 | – |
| logowanie: wysłanie | 69 | 3361 | 4503 | 4702 | – |
| panel: strona gry | 30 | 2958 | 3199 | 3854 | – |
| panel: widok | 62 | 223 | 2380 | 2411 | – |
| stan (odpytywanie) | 194 | 20 | 69 | 209 | – |
| zapis decyzji | 42 | 25 | 126 | 185 | 409 × 32 |
| wysłanie decyzji | 8 | 177 | 422 | 422 | – |
| MG: zamknięcie rundy | 1 | 191 | 191 | 191 | – |
| widok po zamknięciu rundy (30 naraz) | 30 | 1915 | 2613 | 2700 | – |
| wszystkie | 507 | 104 | 3854 | 4702 | 409 × 32 |

**Błędów serwera i połączeń: 0.** Wszystkie 409 to nie błąd serwera: boty-uczniowie wysyłali te same decyzje,
więc w kilku drużynach kolidowało zatrudnienie tego samego kandydata (zasada „kto pierwszy zapisze, ten
zatrudnia”). Prawdziwa klasa zobaczy to jako zwykły komunikat w grze.

### Co poprawiono (trzy wady, które by wyszły dopiero na lekcji)

Pierwsza wersja próby wykryła trzy realne wady; poprawki mają test (`testy/aplikacja/test_klasa_naraz.py`):

1. **Blokada logowania klasy (HTTP 429).** Cała klasa wychodzi jednym adresem IP szkoły, a domyślne limity
   (30 logowań i 10 błędnych na minutę z IP) blokowały 31. ucznia (i całą klasę po kilku literówkach). W `settings.py`:
   `ACCOUNT_RATE_LIMITS = {login: 300/m/ip, login_failed: 100/m/ip,5/300s/key}`; limit 5 błędów na 5 minut
   **na konto** zostaje (ochrona przed zgadywaniem hasła).
2. **„database is locked” (HTTP 500 przy wysyłaniu decyzji).** SQLite przy wielu zapisach naraz poddawał się po 5 s.
   W `settings.py`: `timeout 30`, `transaction_mode IMMEDIATE`, tryb WAL (`init_command`). Po poprawce 0 błędów.
3. **Odmowa połączenia przy 30 naraz (WinError 10061).** Kolejka połączeń serwera deweloperskiego miała 10 miejsc.
   W `rozgrzewka.py` (wołane tylko przez `graj`/`hostuj`): `request_queue_size = 128`.

### Czego NIE udało się zmieścić w celu „odpowiedź < 1 s” (do decyzji)

- **Start naraz.** Gdy cała klasa loguje się i otwiera grę w tej samej sekundzie, mediana wysłania hasła to 3,4 s,
  strona gry 3 s, a jej największe czasy do 4,7 s (zmierzone: pojedynczy użytkownik 0,17 s). Przyczyna: serwer jest
  jednym procesem, a ciężka praca (haszowanie hasła, budowa strony i widoku) wykonuje się jedna po drugiej
  (blokada interpretera Pythona), więc 30 żądań ustawia się w kolejkę. Po starcie **jest szybko**: `stan` 20 ms,
  zapis decyzji 25 ms (p95 126 ms).
- **Po zamknięciu rundy** 30 osób wczytuje nowy widok naraz: mediana 1,9 s, maks. 2,7 s.

Propozycje (nie wdrażane – wykraczają poza małe poprawki):
1. **Rozłożyć start**: prowadzący prosi „drużyna po drużynie” albo uczniowie logują się z domu/z wyprzedzeniem
   (najtańsze, zero kodu; 3–5 s czekania przy starcie jest do zniesienia, jeśli uczniowie wiedzą, że to normalne).
2. **Pokazać pasek ładowania** na stronie gry i logowaniu, żeby 3 s nie wyglądało na zawieszenie.
3. **Serwer wieloprocesowy** (np. waitress/gunicorn z kilkoma procesami) do `hostuj` – realny zysk przy starcie, ale
   to zmiana sposobu uruchamiania i zależności (decyzja szefa).
4. **Lżejszy widok** po zamknięciu rundy (pamięć podręczna widoku drużyny, wyliczana raz po `przelicz`).

## 4. Kreator lekcji w `/mg/` na zrzutach (bar, jasny, 1366×768)

Zrzuty: `../_robocze/zrzuty-lekcja/` (poza gitem; 01–05 kreator, 06–08 pierwsze kroki po utworzeniu gry).
Droga nauczyciela do gotowej kartki z hasłami:

| Krok | Działanie | Kliknięć |
|---|---|---|
| 1 | Nowa gra → Podstawy (nazwa, rundy) → Dalej → Drużyny → Dalej | 3 |
| 2 | Funkcje gry: kliknięcie zestawu „Lekcja N …” → Dalej → Utwórz grę | 3 |
| 3 | Zakładka Drużyny: wpisać uczniów, „Załóż konta”, w oknie **Drukuj** | 3 + wpisywanie |
| 4 | Przypisać każdego ucznia do drużyny: lista + „Dodaj” | 2 na ucznia (60 dla 30) |

**Wniosek: w 3 krokach da się założyć grę z zestawem lekcji i wydrukować hasła, ale nie da się w 3 krokach mieć
klasy w drużynach.** Zestawy lekcji są widoczne od razu w kroku 3 (zrzut `04`), podsumowanie (zrzut `05`) mówi
„zestaw „Lekcja 3 – Klient i opinia”: odkryte 4, zakryte 4, wyłączone 4”. Okno z hasłami (zrzut `08`) wypisuje
uczeń–login–hasło i drukuje się samo okno (arkusz `@media print`).

Znalezione wady (żadna nie blokuje; nic nie poprawiono w kodzie – to wygląd współdzielony z grą albo większy układ):
- **Przycisk „Utwórz grę” jest poniżej krawędzi ekranu 1366×768** w kroku 4 (trzeba przewinąć). Propozycja:
  przyciski kroków przypiąć do dołu ekranu.
- **Przypisywanie 30 uczniów do drużyn pojedynczo** (60 kliknięć) to największa przeszkoda przed lekcją.
  Propozycja: „Rozlosuj uczniów po drużynach” (albo wklejanie „drużyna: osoby”) w zakładce Drużyny oraz kartki
  z hasłami **w podziale na drużyny** (jedna kartka na drużynę z loginami i hasłami).
- Domyślnie kreator ustawia **18 rund**; przy zestawie lekcji sensowniej 3–6. Propozycja: zestaw lekcji ustawia też
  liczbę rund i tryb lekcyjny.
- W oknie z hasłami „Lublin” nad tytułem skleja się z nim („LublinNowe konta (2)”): okruszek okna gracza
  niewystylowany w panelu MG (`karty.css`, współdzielony – nie ruszano).
- Stan funkcji nie zmienia się po utworzeniu gry, więc **kolejna lekcja = nowa gra** (albo „Pełna gra” na cały
  cykl). Do decyzji szefa: czy gra z lekcji 1 ma przechodzić na zestaw lekcji 2 bez zakładania nowej.
