// Rejestr zakładek i układ menu (UF15, 6.11.2026: Miasto · Twój lokal · Firma · Wyniki; każda funkcja ma decyzje i wyniki).
import { dashboard, karta_wynikow, lista_bledow, ranking, wnioski, wyslij } from "./ogolne.js";
import { oferta } from "./oferta.js";
import { sprzet, stanowiska, wyposazenie } from "./inwestycje.js";
import { szkolenia, udogodnienia, zatrudnienie, zespol } from "./hr.js";
import { dostawcy } from "./dostawcy.js";
import { agencje, internet, promocje } from "./marketing.js";
import { sprzedaz } from "./sprzedaz.js";
import { bank, biuro, kpir, raport } from "./finanse.js";
import { lokale } from "./lokale.js";
import { licytacje, przejecia } from "./przejecia.js";
import { mapa } from "./mapa.js";
import { klienci } from "./klienci.js";
import { przewozy, swiezosc } from "./swiezosc.js";
import { czas_wlasciciela } from "./czas.js";
import { rynek_pracy } from "./rynek_pracy.js";
import { harpagon } from "./harpagon.js";
import { podatki, vat } from "./podatki.js";
import { sprawy } from "./zdarzenia.js";
import { ubezpieczenia } from "./ubezpieczenia.js";
import { sanepid, urzad } from "./urzad.js";
import { wlasciciel } from "./wlasciciel.js";
import { kasyno } from "./kasyno.js";
import { handel } from "./handel.js";
import { kalendarz } from "./kalendarz.js";
import { konkurencja } from "./konkurencja.js";
import { stan_lokalu, zlozona } from "./lokal.js";
import { gielda } from "./gielda.js";
import { dekor } from "./dekor.js";
import { ustawAliasy } from "./funkcje.js";
import { miejsce, ustawEkranyMiejsc } from "../swiat/swiat.js";

const ZAKLADKI = { dashboard, mapa, karta_wynikow, wnioski, ranking, lokale, licytacje, przejecia, urzad, sanepid, klienci, kalendarz, konkurencja, oferta,
  stanowiska, sprzet, wyposazenie, dekor, zatrudnienie, zespol, rynek_pracy, udogodnienia, szkolenia, dostawcy, swiezosc, przewozy,
  czas_wlasciciela, sprawy, agencje, internet, promocje, sprzedaz, handel, raport, kpir, vat, podatki, bank, harpagon, biuro, ubezpieczenia,
  wlasciciel, gielda, kasyno, lista_bledow, wyslij, miejsce };

// nazwa ikony (zakladki/ikony.js) dla każdej zakładki
export const IKONY = { hr_rozwoj: "szkolenia", lokal_przeglad: "lokale", lokal_menu: "oferta", zaop_dostawy: "dostawcy", zaop_magazyn: "swiezosc", zaop_przewozy: "dostawcy",
  wnetrze_sprzet: "sprzet", wnetrze_wyposazenie: "wyposazenie", stan_lokalu: "lokale",
  dashboard: "dashboard", mapa: "mapa", wnioski: "ok", lokale: "lokale", licytacje: "lokale", przejecia: "lokale", urzad: "urzad", sanepid: "swiezosc",
  klienci: "klienci", kalendarz: "kalendarz", konkurencja: "analiza", karta_wynikow: "karta", ranking: "wykres", oferta: "oferta", stanowiska: "stanowiska", sprzet: "sprzet",
  wyposazenie: "wyposazenie", dekor: "wyposazenie", zatrudnienie: "zatrudnienie", zespol: "zatrudnienie", rynek_pracy: "rynek_pracy",
  udogodnienia: "udogodnienia", szkolenia: "szkolenia", dostawcy: "dostawcy", swiezosc: "swiezosc", przewozy: "dostawcy", czas_wlasciciela: "zegar",
  sprawy: "zdarzenia", agencje: "tradycyjny", internet: "marketing", promocje: "procent", sprzedaz: "sprzedaz", handel: "handel", raport: "raport", kpir: "kpir",
  vat: "procent", podatki: "podatki", bank: "bank", harpagon: "harpagon", biuro: "biuro", ubezpieczenia: "tarcza", wlasciciel: "portfel",
  gielda: "wykres", kasyno: "klucz", lista_bledow: "bledy", wyslij: "wyslij", miejsce: "lokale" };

// od której rundy zakładka jest dostępna (w menu: szara pozycja z kłódką i „od rundy N”)
export const OD_RUNDY = { karta_wynikow: 3, ranking: 3, agencje: 5, internet: 7, promocje: 3, udogodnienia: 3, wyposazenie: 4, dekor: 4, szkolenia: 7,
  przejecia: 4, sprzet: 2, zatrudnienie: 1, zespol: 1, rynek_pracy: 1, dostawcy: 2, swiezosc: 2, sprzedaz: 2, raport: 2, kpir: 2, vat: 2,
  sprawy: 2, ubezpieczenia: 4, handel: 6 };

// zakładka → element harmonogramu gry z lokalami (silnik/harmonogram.py); tydzień z widoku zastępuje OD_RUNDY
export const ELEMENT = { karta_wynikow: "karta_wynikow", ranking: "karta_wynikow", agencje: "reklama", internet: "internet", promocje: "promocje", udogodnienia: "hr_udogodnienia",
  wyposazenie: "inwestycje_wyposazenie", dekor: "inwestycje_wyposazenie", szkolenia: "hr_szkolenia", przejecia: "przejecia", sprzet: "inwestycje_sprzet",
  zatrudnienie: "hr_zatrudnienie", zespol: "hr_zatrudnienie", dostawcy: "dostawcy", sprzedaz: "sprzedaz", sprawy: "parki", handel: "handel",
  ubezpieczenia: "ubezpieczenia" };

// Twój lokal: zakładki złożone z dawnych zakładek (części działają na wybranym lokalu – lokal_wybor.js; wybór lokalu tylko tu)
const odRundyCzesci = (v, k) => v.harmonogram?.[ELEMENT[k]] ?? OD_RUNDY[k];
// w Moim lokalu zatrudnienie to sama obsada stanowisk (wyniki rynku pracy są w Mój kebab → Zespół)
const obsada = { ...zatrudnienie, tytul: "Obsada stanowisk", tytulPelny: null, wynikiGdy: () => false };
Object.assign(ZAKLADKI, {
  lokal_przeglad: zlozona({ tytul: "Mój lokal", tytulPelny: "Mój lokal – stan, sprzedaż i obsada", odRundy: odRundyCzesci,
    info: "Wszystko o wybranym lokalu: liczby z poprzedniej rundy, braki, umowa, sprawy w lokalu (bank żywności, wypadki), kto stoi na którym stanowisku i jak szła sprzedaż.",
    czesci: { stan_lokalu, sprawy, zatrudnienie: obsada, sprzedaz } }),
  lokal_menu: zlozona({ tytul: "Menu i ceny", tytulPelny: "Tablica – menu i ceny", odRundy: odRundyCzesci,
    info: "Dania w menu wybranego lokalu, prognoza sprzedaży i ceny. Każdy lokal może mieć inne menu i inne ceny.",
    czesci: { oferta } }),
  zaop_dostawy: zlozona({ tytul: "Zamówienia", tytulPelny: "Hurtownie – zamówienia składników", odRundy: odRundyCzesci,
    info: "Zamówienia składników z dostawą do wybranego lokalu: dostawca, jakość, ilość i dzień dostawy.",
    czesci: { dostawcy } }),
  zaop_magazyn: zlozona({ tytul: "Magazyn i świeżość", tytulPelny: "Chłodnia – magazyn i świeżość", odRundy: odRundyCzesci,
    info: "Co leży w chłodni i zamrażarce wybranego lokalu, co się kończy i ile kosztuje wynajęta chłodnia.",
    czesci: { swiezosc } }),
  zaop_przewozy: zlozona({ tytul: "Przewozy", tytulPelny: "Rampa – przewozy między lokalami", odRundy: odRundyCzesci,
    info: "Przewóz towaru z wybranego lokalu do innego Twojego lokalu.", czesci: { przewozy } }),
  wnetrze_sprzet: zlozona({ tytul: "Stanowiska i sprzęt", tytulPelny: "Sprzęt gastronomiczny – stanowiska i sprzęt", odRundy: odRundyCzesci,
    info: "Stanowiska kuchni i kasy oraz sprzęt wybranego lokalu – kupno, wynajem i sprzedaż.",
    czesci: { stanowiska, sprzet } }),
  // Poprawki 2 (sprawa 17): Mój kebab ▸ Szkolenia i udogodnienia – jedna podzakładka całej firmy (bez kafelków lokali;
  // udogodnienia mają swój krótki wybór lokalu)
  hr_rozwoj: zlozona({ tytul: "Szkolenia i udogodnienia", tytulPelny: "Pokój socjalny – szkolenia i udogodnienia", odRundy: odRundyCzesci, bezLokali: true,
    info: "Wszystko, co podnosi zadowolenie pracowników poza pensją: szkolenia dla całego zespołu i udogodnienia w lokalu.",
    czesci: { udogodnienia, szkolenia } }),   // udogodnienia wcześniej dostępne (harmonogram) – na górze
  wnetrze_wyposazenie: zlozona({ tytul: "Wyposażenie", tytulPelny: "Park handlowy – wyposażenie i wystrój", odRundy: odRundyCzesci,
    info: "Stoliki, telewizor, klimatyzacja i inne rzeczy dla klientów wybranego lokalu, a w sklepie meblowym wystrój: ściany, szyld, dodatki i meble.",
    czesci: { wyposazenie, dekor } }),
});
// Nazwy ekranów w duchu mapy (fable-nazwy, 16.11.2026; decyzja autora 14.11: „bez zgadywania”): pełny tytuł mówi, GDZIE
// w mieście jest ekran i CO się tam załatwia, zamiast dawnych działów firmy („HR -”, „Finanse -”, „Inwestycje -”).
const NAZWY = {
  raport: ["Wyniki finansowe", "Kasa – wyniki finansowe tygodnia"],
  kpir: ["Księga firmy", "Księga przychodów i rozchodów (KPiR)"],
  bank: ["Banki", "Kamienica bankowa – konto, kredyty i lokaty"],
  biuro: ["Biura rachunkowe", "Biurowiec przy Zana – biura rachunkowe"],
  gielda: ["Parkiet", "Byk i Koziołek – parkiet maklerski"],
  handel: ["Bazar", "Bazar – handel między drużynami"],
  harpagon: ["Kantor Harpagona", "Kantor „U Harpagona” – pożyczka od ręki"],
  zatrudnienie: ["Zatrudnienie", "Lada – obsada stanowisk"],
  zespol: ["Zespół", "Zaplecze – zespół, umowy i grafik"],
  udogodnienia: ["Udogodnienia", "Pokój socjalny – udogodnienia dla zespołu"],
  szkolenia: ["Szkolenia", "Pokój socjalny – szkolenia"],
  stanowiska: ["Stanowiska", "Rożen – stanowiska kuchni i kasy"],
  sprzet: ["Sprzęt", "Sprzęt gastronomiczny – kupno, wynajem i sprzedaż"],
  wyposazenie: ["Wyposażenie", "Instalacje i wyposażenie dla gości"],
  klienci: ["Goście w strefach", "Pracownia Analiz – goście w strefach miasta"],
  konkurencja: ["Konkurencja", "„Sokole Oko” – co robi konkurencja"],
  agencje: ["Ulotki i radio", "Fala Koziołka – ulotki, radio i eventy"],
  internet: ["Internet", "Lajk i Spółka – reklama w internecie"],
  promocje: ["Promocje", "Szyld – promocje i rabaty"],
  karta_wynikow: ["Punkty tygodnia", "Kurier rankingowy – punkty tygodnia"],
  wnioski: ["Porady", "Kurier rankingowy – dział porad"],
  ranking: ["Tabela ligowa", "Kurier rankingowy – tabela ligowa"],
  lista_bledow: ["Lista błędów", "Notes księgowej – lista błędów przed wysłaniem"],
  wyslij: ["Wyślij decyzje", "Poczta – wyślij decyzje tygodnia"],
  vat: ["VAT", "Urząd skarbowy – VAT"],
  podatki: ["Podatek dochodowy", "Urząd skarbowy – PIT i ZUS"],
  urzad: ["Urząd miasta", "Urząd miasta – sprawy lokalu"],
  sanepid: ["Sanepid", "Sanepid – higiena i kontrole"],
  rynek_pracy: ["Tablica ogłoszeń", "Tablica ogłoszeń – rynek pracy"],
  swiezosc: ["Świeżość", "Chłodnia – magazyn i świeżość"],
  przewozy: ["Przewozy", "Rampa – przewozy między lokalami"],
  dostawcy: ["Dostawcy", "Hurtownie – zamówienia składników"],
  ubezpieczenia: ["Ubezpieczenia", "TUW „Pod Koziołkiem” – ubezpieczenia lokalu"],
  wlasciciel: ["Portfel", "Szuflada – portfel właściciela"],
  czas_wlasciciela: ["Czas właściciela", "Biurko – czas właściciela"],
  kalendarz: ["Kalendarz miasta", "Kalendarz miasta – wydarzenia i święta"],
};
for (const [k, [tytul, tytulPelny]] of Object.entries(NAZWY)) Object.assign(ZAKLADKI[k], { tytul, tytulPelny });


// dawny klucz zakładki → zakładka, w której jest teraz (linki, „Popraw” z listy błędów, adres #…, budynki mapy)
export const ALIAS = { oferta: "lokal_menu", sprzedaz: "lokal_przeglad", zatrudnienie: "lokal_przeglad", stan_lokalu: "lokal_przeglad",
  dostawcy: "zaop_dostawy", swiezosc: "zaop_magazyn", przewozy: "zaop_przewozy",
  stanowiska: "wnetrze_sprzet", sprzet: "wnetrze_sprzet", wyposazenie: "wnetrze_wyposazenie", dekor: "wnetrze_wyposazenie",
  lokal_dostawy: "zaop_dostawy", lokal_sprzet: "wnetrze_sprzet", lokal_ludzie: "zespol", srodki_trwale: "kpir",
  zdarzenia: "mapa", sprawy: "lokal_przeglad", szkolenia: "hr_rozwoj", udogodnienia: "hr_rozwoj" };   // UF13: parki tylko z mapy, sprawy w lokalu – w Moim lokalu
ustawAliasy(ALIAS);   // funkcje gry: dawny klucz (np. „dostawcy” z budynku mapy) należy do funkcji zakładki złożonej

// Układ paska (fable-swiat, 15.11.2026): miejsca zamiast działów. Pozycja z `miejsce` to budynek z wnętrzem (swiat/miejsca.js):
// kliknięcie otwiera scenę, a `pod` to ekrany, które są w tym budynku (pasek nad treścią). { sekcja } – nagłówek grupy.
// Bez pozycji w pasku: parki – klik w park na mapie (UF13). „Nocna 13” jest ukryta w bramie na Starym Mieście.
export const MENU = [
  { klucz: "dashboard", tytul: "Plan tygodnia", ikona: "dashboard" },
  { klucz: "mapa", tytul: "Mapa miasta", ikona: "mapa", klasa: "mapa" },
  { sekcja: "Twoja firma" },
  { klucz: "kebab", tytul: "Mój kebab", ikona: "lokale", miejsce: "kebab",
    pod: ["lokal_przeglad", "lokal_menu", "promocje", "zespol", "hr_rozwoj", "zaop_magazyn", "raport", "czas_wlasciciela", "wlasciciel"] },
  { sekcja: "Miasto" },
  { klucz: "stare_miasto", tytul: "Stare Miasto", ikona: "klucz", miejsce: "stare_miasto", pod: ["lokale", "licytacje", "przejecia", "harpagon", "kasyno"] },
  { klucz: "hurtownie", tytul: "Hurtownie", ikona: "dostawcy", miejsce: "hurtownie", pod: ["zaop_dostawy", "zaop_przewozy"] },
  { klucz: "park_handlowy", tytul: "Park handlowy", ikona: "sprzedaz", miejsce: "park_handlowy", pod: ["wnetrze_sprzet", "wnetrze_wyposazenie"] },
  { klucz: "miasteczko", tytul: "Miasteczko akademickie", ikona: "rynek_pracy", miejsce: "miasteczko", pod: ["rynek_pracy", "klienci", "konkurencja", "kalendarz"] },
  { klucz: "kamienica_bankowa", tytul: "Kamienica bankowa", ikona: "bank", miejsce: "kamienica_bankowa", pod: ["bank", "gielda"] },
  { klucz: "biurowiec_zana", tytul: "Biurowiec przy Zana", ikona: "biuro", miejsce: "biurowiec_zana", pod: ["biuro", "kpir", "ubezpieczenia", "agencje", "internet"] },
  { klucz: "urzedy", tytul: "Urzędy", ikona: "urzad", miejsce: "urzedy", pod: ["urzad", "sanepid", "vat", "podatki"] },
  { klucz: "handel", tytul: "Bazar", ikona: "handel" },
  { sekcja: "Tydzień" },
  { klucz: "redakcja", tytul: "Kurier rankingowy", ikona: "karta", miejsce: "redakcja", pod: ["karta_wynikow", "wnioski", "ranking"] },
  { klucz: "lista_bledow", tytul: "Lista błędów", ikona: "bledy" },
  { klucz: "wyslij", tytul: "Wyślij decyzje", ikona: "wyslij", klasa: "wyslij" },
];
ustawEkranyMiejsc(Object.fromEntries(MENU.filter((p) => p.miejsce).map((p) => [p.miejsce, p.pod])));

export default ZAKLADKI;
