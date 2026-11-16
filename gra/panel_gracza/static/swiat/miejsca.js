// Miejsca gry: budynki, do których się wchodzi, i to, co w nich można zrobić (każdy punkt prowadzi do ekranu decyzji).
// Miejsce zastępuje dawną grupę menu: ekrany budynku (pasek nad treścią) są w MENU (zakladki/index.js: pod),
// a `punkty` to klikalne miejsca sceny. `budynki` – id z dane/mapa/budynki.yaml (także zespołów), po których mapa trafia tu przez lukrum.otworzWnetrze(id).
// Punkt: { cel: klucz ekranu, nazwa, podpis (krótko na tabliczce), opis (zdanie na liście pod sceną), szukaj?: nazwa firmy,
//          do której ekran ma się przewinąć, postac?: plik z grafiki/postacie }.

export const MIEJSCA = {
  kebab: {
    tytul: "Mój kebab", ikona: "lokale", scena: "kebab", budynki: [],
    // punkty sceny kebaba mają stałe miejsca na rysunku (sceny.js: scenaKebabu) – tu ich cele i opisy
    punkty: [
      { klucz: "menu", cel: "lokal_menu", nazwa: "Tablica: menu i ceny", opis: "Dania, ceny i prognoza sprzedaży." },
      { klucz: "lada", cel: "lokal_przeglad", nazwa: "Lada: lokal i sprzedaż", opis: "Stan lokalu, obsada stanowisk, sprzedaż z poprzedniego tygodnia." },
      { klucz: "kuchnia", cel: "wnetrze_sprzet", nazwa: "Rożen: stanowiska i sprzęt", opis: "Stanowiska kuchni i kasy, kupno i wynajem sprzętu." },
      { klucz: "zaplecze", cel: "zespol", nazwa: "Zaplecze: zespół i grafik", opis: "Umowy, pensje, grafik i nastroje pracowników." },
      { klucz: "pracownik", cel: "zespol", nazwa: "Pracownik", opis: "", tylkoScena: true },
      { klucz: "kasa", cel: "raport", nazwa: "Kasa: wyniki finansowe", opis: "Przychody, koszty i dochód tygodnia." },
      { klucz: "stoliki", cel: "wnetrze_wyposazenie", nazwa: "Sala: wyposażenie", opis: "Stoliki, ogródek i inne rzeczy dla gości." },
      { klucz: "okno", cel: "klienci", nazwa: "Okno: ulica i klienci", opis: "Kto chodzi po okolicy i ile jest gotów zapłacić." },
      { klucz: "szyld", cel: "promocje", nazwa: "Szyld: promocje", opis: "Promocje i rabaty, które ściągają gości." },
      { klucz: "chlodnia", cel: "zaop_magazyn", nazwa: "Chłodnia: magazyn i świeżość", opis: "Co leży w chłodni i co się kończy.", tylkoLista: true },
      { klucz: "szkolenia", cel: "hr_rozwoj", nazwa: "Pokój socjalny: szkolenia i udogodnienia", opis: "Rozwój i zadowolenie zespołu.", tylkoLista: true },
      { klucz: "czas", cel: "czas_wlasciciela", nazwa: "Biurko: czas właściciela", opis: "Na co idzie Twój tydzień.", tylkoLista: true },
      { klucz: "portfel", cel: "wlasciciel", nazwa: "Szuflada: portfel właściciela", opis: "Wypłaty z firmy i dopłaty do niej.", tylkoLista: true },
    ],
  },
  kamienica_bankowa: {
    tytul: "Kamienica bankowa", adres: "Krakowskie Przedmieście", ikona: "bank", scena: "hol", styl: "kamienica",
    budynki: ["kamienica_bankowa", "bank_1", "bank_2", "bank_3", "bank_4", "bank_5", "bank_6", "gielda"],
    punkty: [
      { cel: "bank", szukaj: "Kmicic", nazwa: "Kmicic", podpis: "kredyt na start", opis: "Szybki kredyt dla firmy bez historii. Drogi." },
      { cel: "bank", szukaj: "Wokulski", nazwa: "Wokulski i S-ka", podpis: "kredyt inwestycyjny", opis: "Duży kredyt pod zastaw na rozwój." },
      { cel: "bank", szukaj: "Ziemia Obiecana", nazwa: "Ziemia Obiecana", podpis: "leasing sprzętu", opis: "Sprzęt bez własnych pieniędzy." },
      { cel: "bank", szukaj: "Rzeckiego", nazwa: "Oszczędności Rzeckiego", podpis: "lokaty", opis: "Najlepsze lokaty: każdy grosz policzony." },
      { cel: "bank", szukaj: "Soplicowo", nazwa: "Soplicowo", podpis: "tanie konto", opis: "Najtańsze konto firmowe i terminal." },
      { cel: "bank", szukaj: "Solaris", nazwa: "Solaris", podpis: "duży debet", opis: "Największy limit debetu w mieście." },
      { cel: "gielda", nazwa: "Byk i Koziołek", podpis: "parkiet maklerski", opis: "Akcje i obligacje za prywatne pieniądze właściciela." },
    ],
  },
  biurowiec_zana: {
    tytul: "Biurowiec przy Zana", adres: "ul. Zana, Rury", ikona: "biuro", scena: "hol", styl: "biurowiec",
    budynki: ["biurowiec_zana", "biura", "agencja_lajk", "fala_koziolka", "kozi_grod_events", "ubezpieczyciel"],
    punkty: [
      { cel: "biuro", nazwa: "Biura rachunkowe", podpis: "pakiety S, M, L", opis: "Kto prowadzi Twoje księgi i za ile." },
      { cel: "kpir", nazwa: "Księga firmy", podpis: "KPiR", opis: "Księga przychodów i rozchodów, gdy liczysz samodzielnie." },
      { cel: "ubezpieczenia", nazwa: "TUW „Pod Koziołkiem”", podpis: "ubezpieczenia", opis: "Polisy od pożaru, zalania i kradzieży." },
      { cel: "agencje", nazwa: "Fala Koziołka", podpis: "ulotki, radio, eventy", opis: "Kampanie reklamowe w strefach miasta." },
      { cel: "internet", nazwa: "Lajk i Spółka", podpis: "reklama w internecie", opis: "Kampanie w sieci i dostawa przez aplikację." },
    ],
  },
  urzedy: {
    tytul: "Urzędy", adres: "ul. Szeligowskiego i ul. Karłowicza", ikona: "urzad", scena: "okienka",
    budynki: ["ratusz", "sanepid"],
    punkty: [
      { cel: "urzad", nazwa: "Urząd miasta", podpis: "sprawy lokalu", opis: "Rejestracja lokalu, odbiory i zezwolenia.", postac: "gosc-sasiadka" },
      { cel: "sanepid", nazwa: "Sanepid", podpis: "higiena i kontrole", opis: "Poziom higieny, kontrole i mandaty.", postac: "bywalec-judym" },
      { cel: "vat", nazwa: "Urząd skarbowy", podpis: "VAT", opis: "Rozliczenie VAT, gdy księgujesz samodzielnie.", postac: "sprzedawca" },
      { cel: "podatki", nazwa: "Urząd skarbowy", podpis: "podatek dochodowy", opis: "Forma opodatkowania i zaliczki.", postac: "bywalec-rzecki" },
    ],
  },
  hurtownie: {
    tytul: "Hurtownie i dyskonty", adres: "ul. Mełgiewska, Tatary i osiedla", ikona: "dostawcy", scena: "hala", postac: "sprzedawca",
    budynki: ["piekarnia", "makro", "selgros", "eurocash", "auchan", "biedronka", "lidl", "stokrotka", "rozen"],
    punkty: [
      { cel: "zaop_dostawy", nazwa: "Zamówienia", podpis: "dostawcy, jakość, dzień dostawy", opis: "Składniki z dostawą do lokalu." },
      { cel: "zaop_przewozy", nazwa: "Rampa", podpis: "przewozy między lokalami", opis: "Przewóz towaru między Twoimi lokalami." },
    ],
  },
  park_handlowy: {
    tytul: "Park handlowy", adres: "Węglin Południowy", ikona: "sprzedaz", scena: "hol", styl: "pasaz",
    budynki: ["sprzet_gastro", "market_budowlany", "stolarnia", "galeria"],
    punkty: [
      { cel: "wnetrze_sprzet", nazwa: "Sprzęt gastronomiczny", podpis: "rożny, frytownice, kasy", opis: "Stanowiska i sprzęt: kupno, wynajem, sprzedaż." },
      { cel: "wnetrze_wyposazenie", nazwa: "Sklep meblowy", podpis: "wyposażenie dla gości", opis: "Stoliki, ogródek, kiosk do zamówień." },
    ],
  },
  miasteczko: {
    tytul: "Miasteczko akademickie", adres: "Sławinek i Rury", ikona: "rynek_pracy", scena: "okienka",
    budynki: ["agencja_pracy", "uczelnia", "detektyw"],
    punkty: [
      { cel: "rynek_pracy", nazwa: "Tablica ogłoszeń", podpis: "rynek pracy", opis: "Kandydaci do pracy i ogłoszenia.", postac: "gosc-student" },
      { cel: "klienci", nazwa: "Pracownia Analiz", podpis: "klienci w strefach", opis: "Kto mieszka w której strefie i co kupuje.", postac: "bywalec-jozio" },
      { cel: "konkurencja", nazwa: "„Sokole Oko”", podpis: "konkurencja", opis: "Co robią inne kebaby w mieście.", postac: "gosc-podrozny" },
      { cel: "kalendarz", nazwa: "Kalendarz miasta", podpis: "wydarzenia", opis: "Juwenalia, jarmarki i mecze, czyli kiedy przyjdą tłumy.", postac: "gosc-turystka" },
    ],
  },
  stare_miasto: {
    tytul: "Stare Miasto", adres: "brama kamienicy przy Grodzkiej", ikona: "klucz", scena: "hol", styl: "brama",
    budynki: ["agencja_nieruchomosci", "harpagon"],
    punkty: [
      { cel: "lokale", nazwa: "Biuro „Klucz”", podpis: "lokale do wzięcia", opis: "Wolne lokale i działki: najem albo kupno." },
      { cel: "licytacje", nazwa: "Sala licytacji", podpis: "licytacje lokali", opis: "Oferta ponad cenę wywoławczą." },
      { cel: "przejecia", nazwa: "Notariusz", podpis: "kupno budynku", opis: "Kupno budynku z najemcą." },
      { cel: "harpagon", nazwa: "Kantor „U Harpagona”", podpis: "pożyczka od ręki", opis: "Pieniądze natychmiast, ale bardzo drogo." },
      { cel: "kasyno", nazwa: "Nocna 13", podpis: "bez szyldu", opis: "Drzwi bez szyldu." },
    ],
  },
  redakcja: {
    tytul: "Kurier rankingowy", adres: "redakcja, Śródmieście", ikona: "karta", scena: "okienka",
    budynki: ["redakcja"],
    punkty: [
      { cel: "karta_wynikow", nazwa: "Dział wyników", podpis: "punkty tygodnia", opis: "Pięć działów po 200 punktów.", postac: "bywalec-rzecki" },
      { cel: "wnioski", nazwa: "Dział porad", podpis: "wnioski", opis: "Co poszło dobrze, a co poprawić.", postac: "bywalec-dulska" },
      { cel: "ranking", nazwa: "Tabela ligowa", podpis: "ranking drużyn", opis: "Miejsca drużyn tydzień po tygodniu.", postac: "bywalec-papkin" },
    ],
  },
};

// budynek mapy → miejsce albo od razu ekran (budynki bez własnego wnętrza)
export const BUDYNEK_DO_MIEJSCA = Object.fromEntries(Object.entries(MIEJSCA).flatMap(([id, m]) => m.budynki.map((b) => [b, id])));
export const BUDYNEK_DO_EKRANU = { poczta: "wyslij", akademia: "hr_rozwoj", drukarnia: "agencje" };
// ekran → miejsce, w którym jest (okruszek nad treścią); listy ekranów ustawia rejestr zakładek (index.js: MENU)
let EKRANY = {};
export const ustawEkranyMiejsc = (e) => { EKRANY = e || {}; };
export const miejsceEkranu = (k) => Object.keys(EKRANY).find((id) => EKRANY[id].includes(k)) || null;
