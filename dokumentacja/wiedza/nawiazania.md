# Nawiązania literackie

Zasady i lista nawiązań w grze. Klucz dla prowadzących (postać → utwór → autor, 13 pozycji) jest w instrukcji
mistrza gry: `INSTRUKCJA.md` (repozytorium gry), „Klucz do nawiązań literackich”. Ta notatka mówi, co jest zaplanowane i dlaczego.

## Zasady
- Najwyżej jedno nawiązanie na ekran, subtelnie.
- **W interfejsie nie podpisujemy, z jakiej lektury jest postać ani nazwa.** Gracze zgadują sami. Klucz ma mistrz gry.
- Autorzy w domenie publicznej: wolno cytować. Cytaty sprawdzamy z Wolnymi Lekturami.
- Autorzy jeszcze chronieni (Lem, Herbert, Gombrowicz, Zajdel): tylko aluzje i nazwy, bez cytatów.
- Postacie są własnymi interpretacjami, nie wzorują się na ekranizacjach.
- Stereotypy są dopuszczalne (decyzja autora).
- Nazwy banków i biur: „wszystko albo nic”. Wszystkie poza J.K.Ś. nawiązują do lektur, sensownie, bez przedrostków
  „Bank…” i „Biuro…”.
- Pomysł na zadanie dla klasy: „Znajdź 10 nawiązań literackich”.

## Banki, biura i media
Nazwy banków, ich specjalizacje i nawiązania: [Banki z lektur](../funkcje/banki-z-lektur.md) (w danych jeszcze sześć banków, decyzja: pięć, zob.
[Decyzje](../Decyzje.md)). Biura rachunkowe i media:

| Nazwa | Specjalizacja | Dlaczego |
|---|---|---|
| J.K.Ś. | biuro rachunkowe | życzenie autora, bez nawiązania |
| Józef K. | biuro tanie, ale wszystko trwa | Kafka, *Proces*: biurokracja bez końca |
| Scrooge | biuro najtańsze, zamknięte w święta | Dickens, *Opowieść wigilijna* |
| Asteroida 328 | biuro dokładne i drogie | Saint-Exupéry, *Mały Książę*: Bankier liczący gwiazdy |
| Gazeta Pana Cogito, Radio Tichy | kanały reklamy | Herbert; Lem, *Dzienniki gwiazdowe* |

Szczegóły biur: [Biura rachunkowe – pakiety](../funkcje/biura-rachunkowe-pakiety.md). Do zrobienia kiedyś: krótkie opisy biur z nawiązaniem do lektury.

## Postacie i miejsca
| Gdzie | Nawiązanie | Źródło | Stan |
|---|---|---|---|
| Bywalcy przy ladzie | Rzecki, Zagłoba, Dulska, Judym, Papkin, Józio, Wujek | *Lalka*, *Potop*, *Moralność pani Dulskiej*, *Ludzie bezdomni*, *Zemsta*, *Ferdydurke* | w grze |
| Pożyczki | Harpagon i Mistrz Jakub | Molier, *Skąpiec* | w grze |
| Klub | „Pod Złotym Koziołkiem” | herb Lublina | w grze |
| Dane gry | „Rękopis znaleziony w JSON-ie”, hasło „saragossa” | Potocki, *Rękopis znaleziony w Saragossie* | w grze |
| Zakładanie firmy | „Ja nie mam nic, ty nie masz nic, on nie ma nic. To razem właśnie mamy tyle, żeby założyć wielką fabrykę.” | Reymont, *Ziemia obiecana* | plan |
| Rynek pracy | kandydat Ignacy Rzecki, sumienny subiekt | Prus, *Lalka* | plan |
| Opinie klientów | zła recenzja = „przyprawiona gęba” | Gombrowicz, *Ferdydurke* (aluzja) | plan |
| Sanepid | inspektor Pimko | Gombrowicz, *Ferdydurke* (aluzja) | plan |
| Hurtownia | sepulki na półce („nie pytaj, do czego”) | Lem, *Dzienniki gwiazdowe* (aluzja) | plan |
| Sklep ze sprzętem | „Konstruktorzy T&K” | Lem, *Cyberiada* (aluzja) | plan |
| Hasło przyprawy | „Kto kontroluje przyprawę, kontroluje rynek” | Herbert, *Diuna* (aluzja) | plan |
| Zdarzenie miejskie | Carnaval Sztukmistrzów | Lublin; Singer, *Sztukmistrz z Lublina* | plan |
| Parki | pięć historii z lektur (Z10, 25.11), opisy poniżej | patrz „Historie w parkach” | w grze |
| Do dopisania | Zajdel (np. *Limes inferior*: punkty, klasy), Winnetou, inne lektury | – | pomysł |

Kolumna „Stan” jest wpisana z notatek, a nie z gry. Przy najbliższej pracy nad tekstami trzeba ją sprawdzić w danych.

## Cytaty
Cytaty bywalców są sprawdzone z Wolnymi Lekturami (14.11) i opisane przy zaczepkach: [Dymki przy ladzie](../funkcje/dymki-przy-ladzie.md); w danych pole
`cytat_zrodlo`. Judym: cytat niepewny w brzmieniu, niewstawiony; Rzecki: tylko aluzja do Napoleonów; Józio: bez cytatów.

## Ryzyka (otwarte w [Czeka na szefa](../Stan.md))
Józio (Gombrowicz) i bank „Solaris” (Lem) korzystają z utworów jeszcze chronionych: zostają jako aluzje, dopóki autor
nie zdecyduje inaczej.

## Historie w parkach (Z10, 25.11)
Pięć historii w `gra/dane/zdarzenia/parki.yaml`, wszystkie komiczne, z postaciami fikcyjnymi i bez podpisów w interfejsie.
Lektury z domeny publicznej. Adresy Wolnych Lektur wpisane bez sprawdzenia (praca bez sieci): przy przeglądzie warto
kliknąć każdy.

| Historia (id) | Park | Nawiązanie | Źródło |
|---|---|---|---|
| Bal dobroczynny w altanie (`bal_pozorow`) | Ogród Saski | komitet pań dbający o pozory, kebab jako „sałatka”: Dulska | Zapolska, *Moralność pani Dulskiej*: https://wolnelektury.pl/katalog/lektura/moralnosc-pani-dulskiej/ |
| Spór o murek (`spor_o_murek`) | Błonia | kłótnia sąsiadów o mur, rymowane obelgi, zgoda przez wesele | Fredro, *Zemsta*: https://wolnelektury.pl/katalog/lektura/zemsta/ |
| Kulig z karczmą (`kulig_karczma`) | Zalew | gawędziarz pan Onufry i opowieści rosnące z każdym razem: Zagłoba | Sienkiewicz, *Ogniem i mieczem*: https://wolnelektury.pl/katalog/lektura/ogniem-i-mieczem-tom-pierwszy/ |
| Pan z lornetką i wachlarzem (`wachlarz`) | Park Ludowy | kupiec zakochany w damie, która „nie przyjdzie”: Wokulski | Prus, *Lalka*: https://wolnelektury.pl/katalog/lektura/lalka-tom-pierwszy/ |
| Doktor z walizką (`doktor_z_walizka`) | Ogród Botaniczny | doktor z ideałami higieny, bez dachu nad głową: Judym | Żeromski, *Ludzie bezdomni*: https://wolnelektury.pl/katalog/lektura/ludzie-bezdomni/ |

Cytatów brak (postacie mówią własnymi słowami). Autorzy chronieni (Lem, Herbert, Gombrowicz, Zajdel) nie występują.
