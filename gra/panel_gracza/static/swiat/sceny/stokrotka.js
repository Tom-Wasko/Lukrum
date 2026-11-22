// Scena wnętrza „stokrotka” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/stokrotka.md.
// TYTUL: Stokrotka (sklep osiedlowy: lada z wagą, surówki na wagę) | Zaopatrzenie
// KOLEJNOSC: 56
// Lubelski sklep przy osiedlu: blisko (odbiór 1 godz.), trochę drożej, ★ i ★★, jedyny dyskont z surówkami; gazetka 2 pozycje −10–25%.
export default function (R) {
  const ID = "stokrotka", YP = 400, MARKA = "var(--g-zielen2)";
  return {
    id: ID, tytul: "Stokrotka", adres: "ul. Braci Wieniawskich, Czechów Południowy", opis: "Mały sklep osiedlowy: lada ze sprzedawczynią i wagą, za nią półki, obok lada chłodnicza z surówkami i skrzynki z warzywami.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana)", YP) + R.lamperia(310, YP, "color-mix(in srgb, var(--g-zielen) 30%, var(--g-sciana2))") + R.podloga("lastryko", YP) + R.kula(300, 20, 18) + R.kula(800, 20, 18);
      s += R.szyld(180, 40, 240, 44, "STOKROTKA", { tlo: MARKA, tekst: "var(--g-biel)", r: 24 }) + R.t(180, 104, "sklep osiedlowy · blisko domu", 13, { f: "tekst", bez: true, op: .85 });
      // drzwi z dzwonkiem i okno wystawowe z prawej
      s += R.drzwi(1060, 130, 110, 270, { typ: "szklo", kolor: MARKA }) + `<path class="k bez" d="M1090 122q10-16 20 0"/><circle class="k" cx="1100" cy="126" r="5" fill="var(--uwaga)"/>` + R.kartka(1076, 180, 78, 44, ["OTWARTE", "6–22"], -2, 13);
      // półki za ladą, sprzedawczyni, lada z wagą i kasą, lada chłodnicza z surówkami
      s += R.regalSklepowy(340, 150, 300, 200, 3, "Pieczywo · sosy · napoje", MARKA) + R.osobaZa("obsluga-kasjerka", 500, 344, 470, 1.0);
      s += R.lada(330, 340, 330, 110) + R.waga(560, 340) + R.ladaChlodnicza(680, 330, 250, 120, true) + R.tabliczka(805, 270, 200, "Surówki", "na wagę, świeże");
      // warzywa w skrzynkach przed ladą, kosz z okazjami, sąsiadka w kolejce
      s += R.skrzynki(60, 470, 3, 90) + R.skrzynki(160, 470, 2, 90) + R.plakat(50, 200, 200, 60, ["WARZYWA", "prosto z giełdy"], "var(--g-tablica)", 16);
      s += R.zamrazarka(60, 600, 180, "FRYTKI") + R.koszOkazji(820, 596, 120, "−20%") + R.osoba("gosc-sasiadka", 460, 606, 0.85, "dobra");
      return s;
    },
    punkty: () => [
      { x: 334, y: 114, w: 320, h: 240, et: "Pieczywo, sosy, napoje", gdzie: "gora", teczka: R.zamow(ID, ["Pieczywo", "Sosy i dodatki", "Napoje"], "półki za ladą") },
      { x: 674, y: 262, w: 262, h: 194, et: "Surówki", stan: "✓", klasa: "zy", opisStanu: "tylko tutaj i w hurtowniach", teczka: R.zamow(ID, "Surówki", "lada chłodnicza") },
      { x: 44, y: 190, w: 216, h: 284, et: "Warzywa", teczka: R.zamow(ID, "Warzywa", "skrzynki") },
      { x: 52, y: 510, w: 196, h: 94, et: "Frytki", gdzie: "gora", teczka: R.zamow(ID, "Mrożonki", "zamrażarka") },
      { x: 810, y: 470, w: 140, h: 130, et: "Gazetka", stan: "✓", klasa: "zy", opisStanu: "2 okazje w tym tygodniu", gdzie: "prawo", teczka: R.gazetka(ID) },
      { x: 340, y: 356, w: 320, h: 100, et: "Koszyk tygodnia", gdzie: "wewn", teczka: R.koszyk(ID, "lada") },
    ],
    osoby: [{ x: 500, stopy: 470, s: 1.0, h: 130, imie: "Sprzedawczyni", tekst: "Surówki dzisiaj robione. Drożej niż w dyskoncie, ale ma się pod nosem.", powitanie: true }],
  };
}
