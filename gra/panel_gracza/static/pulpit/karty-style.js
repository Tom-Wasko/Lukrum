// Jedno miejsce, w którym ustala się wygląd okien gry (seria pulpit, krok 6): klucz ekranu → styl karty.
// Style: 1 = teczka kartonowa (decyzje do wykonania), 2 = akta urzędowe (urzędy, prawo, pieniądze),
//        3 = czysta apka (tabele i wyniki), 4 = kartka w kratkę (notatki, listy, kontrole).
// 0 = „własny styl” (paragon, list, tablica, zeszyt, dymki): okno nie dostaje szablonu 1–4.
// Źródło: notatki/Serie/pulpit/pulpit – okna do wyboru stylu.md (kolumna „Propozycja”, zaakceptowana przez szefa).
// Wygląd stylów: pulpit/karty.css (klasy karta--s1…s4). Nieprzypisane ekrany dostają STYL_DOMYSLNY.

export const STYL_DOMYSLNY = 1;

export const STYL_EKRANU = {
  // kebab i zaopatrzenie
  oferta: 1, lokal_menu: 1, lokal_przeglad: 1, zatrudnienie: 1, zespol: 4, udogodnienia: 4, szkolenia: 4, hr_rozwoj: 4,
  stanowiska: 1, sprzet: 1, wnetrze_sprzet: 1, wyposazenie: 1, wnetrze_wyposazenie: 1, dostawcy: 1, swiezosc: 4, przewozy: 4,
  promocje: 1, czas_wlasciciela: 4,
  // klucze zakładek złożonych i dawne klucze z punktów wnętrz (ALIAS w zakladki/index.js)
  zaop_dostawy: 1, zaop_magazyn: 4, zaop_przewozy: 4, lokal_dostawy: 1, lokal_sprzet: 1, srodki_trwale: 4,
  // reklama i rynek
  agencje: 1, internet: 1, klienci: 3, konkurencja: 2, handel: 1, rynek_pracy: 4,
  // pieniądze, banki, księgowość
  bank: 2, biuro: 2, kpir: 4, lista_bledow: 4, gielda: 2, harpagon: 2, ubezpieczenia: 2, wlasciciel: 4,
  // urzędy i prawo
  vat: 2, podatki: 2, urzad: 2, sanepid: 2,
  // wyniki i informacje
  raport: 3, karta_wynikow: 3, wnioski: 4, ranking: 3, kalendarz: 4,
  // okna systemowe
  wyslij: "wlasny",      // list z podsumowaniem (pulpit.js, klasa pp-okno-koperta)
  zakupy: "wlasny",      // paragon
  wydarzenia: "wlasny",  // tablica ogłoszeń w szufladzie
  zeszyt: "wlasny",      // zeszyt wujka
  dymki: "wlasny",       // dymki gości przy ladzie
  karta_miejsca: 4, ustawienia: 3, jak_grac: 4, potwierdzenie: 2,
};

/** Styl 1–4 dla klucza ekranu (kilka kluczy: pierwszy znany wygrywa); 0 = własny styl. */
export function stylEkranu(...klucze) {
  for (const k of klucze) {
    if (k == null || !(k in STYL_EKRANU)) continue;
    const s = STYL_EKRANU[k];
    return s === "wlasny" ? 0 : s;
  }
  return STYL_DOMYSLNY;
}

// „Układ bez powtórzeń” – okna, w których scena pokazuje te same opcje co karta:
//   a – jedna pozycja pełna + miniatury pozostałych; b – nawigacja 1/4 (jedna pozycja naraz); c – tabela porównawcza.
// `pozycje`: selektor jednej opcji w karcie (domyślnie karta marki `.agencja`); `pierwsza`: tylko pierwsza lista w oknie.
export const UKLAD_EKRANU = {
  sprzet: { uklad: "b" }, wnetrze_sprzet: { uklad: "b" }, lokal_sprzet: { uklad: "b" },
  dostawcy: { uklad: "b" }, zaop_dostawy: { uklad: "b" }, lokal_dostawy: { uklad: "b" },
  handel: { uklad: "b", pozycje: "table tbody tr", pierwsza: true },   // oferty na giełdzie to wiersze tabeli – jeden naraz
  bank: { uklad: "a" }, agencje: { uklad: "a" },
  biuro: { uklad: "c" }, ubezpieczenia: { uklad: "c", pozycje: ".kafel.kanal" },
};

/** Układ okna dla klucza (pierwszy znany klucz rozstrzyga: część „stanowiska” złożonego ekranu nie dostaje układu ze „sprzętu”). */
export const ukladEkranu = (...klucze) => {
  for (const k of klucze) if (k in STYL_EKRANU || k in UKLAD_EKRANU) return UKLAD_EKRANU[k] || null;
  return null;
};
