// Miejsca gry: budynki, do których się wchodzi, i to, co w nich można zrobić (każdy punkt prowadzi do ekranu decyzji).
// Miejsce = jedna scena. Kebab lokalu drużyny ma własną scenę (sceny.js) i punkty niżej; pozostałe miejsca to wnętrza z makiet
// (swiat/sceny/<id>.js, rejestr sceny/index.js), których punkty podaje sama scena. Ekrany budynku (pasek nad treścią) są w MENU
// (zakladki/index.js: pod). `budynki` – żetony z dane/mapa/budynki.yaml (także zespołów), po których mapa trafia tu przez lukrum.otworzWnetrze(id).
// Punkt: { cel: klucz ekranu, nazwa, podpis (krótko na tabliczce), opis (zdanie na liście pod sceną), szukaj?: nazwa firmy,
//          do której ekran ma się przewinąć, postac?: plik z grafiki/postacie }.

import { BUDYNKI_SCENY, SCENY } from "./sceny/index.js";

const SCENY_MAKIET = Object.fromEntries(Object.entries(SCENY).map(([id, s]) => [id, {
  tytul: s.tytul, adres: s.adres, ikona: "lokale", scena: "makieta", punkty: [],
  budynki: Object.keys(BUDYNKI_SCENY).filter((b) => BUDYNKI_SCENY[b].split("?")[0] === id),
}]));

export const MIEJSCA = {
  ...SCENY_MAKIET,
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
};

// żeton budynku z mapy → miejsce (scena); parametr wariantu sceny (np. park „?p=zalew”) osobno
export const BUDYNEK_DO_MIEJSCA = Object.fromEntries(Object.entries(BUDYNKI_SCENY).map(([b, s]) => [b, s.split("?")[0]]));
export const BUDYNEK_PARAMETR = Object.fromEntries(Object.entries(BUDYNKI_SCENY).filter(([, s]) => s.includes("?")).map(([b, s]) => [b, s.split("?")[1]]));
// ekran → miejsce, w którym jest (okruszek nad treścią); listy ekranów ustawia rejestr zakładek (index.js: MENU),
// klucz to scena „główna” grupy z paska, `miejsca` grupy wylicza miejsceEkranu dla ekranów z jej sceny
let EKRANY = {};
export const ustawEkranyMiejsc = (e) => { EKRANY = e || {}; };
export const miejsceEkranu = (k) => Object.keys(EKRANY).find((id) => EKRANY[id].includes(k)) || null;
