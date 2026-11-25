// Scena wnętrza „pokoj_ksiegi” (dawniej „biurowiec_zana”; z makiet: archiwum/fable-17.11/fable-wnetrza). Pokój z księgą na parterze Domu reklamy.
// TYTUL: Biurowiec przy Zana (pokój z księgą firmy, KPiR) | Księgowość
// KOLEJNOSC: 32
// Wynajęty pokój biurowy: tu leży księga przychodów i rozchodów, gdy drużyna księguje sama (decyzja szefa 9: KPiR zostaje przy Zana).
export default function (R) {
  return {
    id: "pokoj_ksiegi", tytul: "Biurowiec przy Zana", adres: "ul. Zana 39, pokój 12", wroc: "Portiernia", wrocDo: "zana_portiernia.html", opis: "Pokój biurowy z księgą przychodów i rozchodów na biurku, pudełkiem paragonów i kalendarzem terminów.",
    rysuj: (R) => {
      let s = R.sciana() + R.podloga("wykladzina", 400, "color-mix(in srgb, var(--akcent-2) 25%, var(--g-podloga))") + `<rect x="0" y="0" width="1220" height="26" fill="var(--g-metal2)" opacity=".5"/>` + R.swietlowka(260, 26, 170) + R.swietlowka(760, 26, 170);
      // okno z żaluzjami i widokiem na bloki, kaloryfer, drzwi z numerem
      s += R.okno(60, 90, 260, 200, { zaluzje: true }) + R.kaloryfer(110, 318, 12) + R.drzwi(1040, 120, 120, 280, { typ: "matowa", napis: "POK. 12" });
      // regał z segregatorami „FAKTURY”, kalendarz terminów, dyplom
      s += R.regal(380, 80, 250, 320, 4, R.segregatory, "var(--g-metal2)") + R.t(505, 72, "FAKTURY 2026", 14, { op: .75, ls: 1.5 });
      s += `<rect class="k" x="700" y="80" width="250" height="170" fill="var(--g-biel)"/><rect class="k" x="700" y="80" width="250" height="34" fill="var(--akcent)"/>` + R.t(825, 104, "TERMINY", 17, { fill: "var(--papier)", ls: 3 })
        + [["7.", "zaliczka PIT"], ["20.", "ZUS"], ["25.", "VAT"]].map(([a, b], i) => R.t(722, 142 + i * 34, a, 22, { fill: "var(--g-czern)", f: "gruby", kot: "start" }) + R.t(778, 140 + i * 34, b, 17, { fill: "var(--g-czern)", f: "tekst", kot: "start", bez: true })).join("") + `<circle class="bez" cx="738" cy="204" r="19" stroke="var(--strata)" stroke-width="3"/>`;
      // biurko na pierwszym planie: otwarta księga, pudełko po butach z paragonami, kalkulator, lampka, kubek
      s += R.biurko(250, 440, 640, 150);
      s += `<path class="k3" d="M430 440l20-70h130v70zM580 440v-70h130l20 70z" fill="var(--g-biel)"/><path class="k" d="M580 370v70"/>` + [0, 1, 2, 3, 4].map((i) => `<path d="M${458 - i * 2} ${384 + i * 11}h${114 + i * 2}M${588} ${384 + i * 11}h${116 + i * 3}" stroke="var(--g-czern)" opacity=".45"/>`).join("");
      s += `<path class="k" d="M280 440v-44h110v44z" fill="var(--g-drewno2)"/><path class="k" d="M274 396h122v-10h-122z" fill="var(--g-drewno)"/>` + [0, 1, 2, 3].map((i) => `<rect class="k1" x="${290 + i * 24}" y="${366 - (i % 2) * 6}" width="18" height="${30 + (i % 2) * 6}" fill="var(--g-biel)" transform="rotate(${i * 5 - 8} ${299 + i * 24} 386)"/>`).join("") + R.t(335, 428, "PARAGONY", 12, { ls: 1 });
      s += `<rect class="k" x="760" y="414" width="60" height="26" rx="3" fill="var(--g-metal2)"/><rect class="k1" x="766" y="418" width="48" height="8" fill="var(--g-szklo)"/>` + `<path class="k bez" d="M850 440v-70q0-20-30-14" stroke-width="4"/><path class="k" d="M832 350l-34 10 14 22z" fill="var(--uwaga)"/>` + R.krzeslo(580, 606, 1.5, "var(--g-metal2)");
      s += R.fikus(1180, 590, 1.0) + R.kosz(930, 566);
      s += R.doniczka(80, 596, 1.2) + R.krzeslaRzad(1000, 600, 2);
      return s;
    },
    punkty: [
      { x: 424, y: 340, w: 312, h: 108, et: "Księga firmy", stan: "!", opisStanu: "6 dokumentów do zaksięgowania", gdzie: "gora", teczka: { tytul: "Księga przychodów i rozchodów", okruszek: "biurko", zakladki: ["Do zaksięgowania", "Księga", "Podsumowanie"], wstep: "Każdy dokument z poprzedniego tygodnia trafia do właściwej kolumny ze stawką VAT. Za błędy grożą kary.",
        pola: [["Faktura: mięso, Zakłady „Rożen”", "kolumna 10 ▾ · VAT 5% ▾"], ["Faktura: czynsz lokalu", "kolumna 13 ▾ · VAT 23% ▾"], ["Raport kasy: sprzedaż tygodnia", "kolumna 7 ▾ · VAT 8% ▾"]], decyzje: ["ksiegowosc"], ekran: "kpir", funkcja: "ksiegowosc" } },
      { x: 268, y: 350, w: 134, h: 96, et: "Dokumenty", gdzie: "dol", teczka: { tytul: "Pudełko z dokumentami", okruszek: "biurko", wstep: "Wszystko, co przyszło w tym tygodniu: faktury, paragony, wyciągi.", pola: [["Faktury kosztowe", "4"], ["Raporty kasy", "1"], ["Wyciąg bankowy", "1"]], ekran: "kpir (dokumenty)", funkcja: "ksiegowosc" } },
      { x: 694, y: 74, w: 262, h: 182, et: "Terminy", gdzie: "dol", odsyla: { kto: "Kartka na kalendarzu", tekst: "Deklaracje VAT i zaliczkę na podatek składa się w okienkach urzędu skarbowego.", stan: "Najbliższy termin: 25., VAT", miejsce: "Urzędy (ratusz)" } },
      { x: 1026, y: 106, w: 148, h: 300, et: "Oddaj księgi biuru", gdzie: "prawy-brzeg", odsyla: { kto: "Tabliczka na drzwiach", tekst: "Za dużo papierów? Biuro rachunkowe zrobi to za Ciebie, za opłatą.", stan: "Dziś księgujesz samodzielnie.", miejsce: "Kamienica rachmistrzów" } },
    ],
    plakietki: [{ x: 20, y: 548, html: "Księgowość: <b>samodzielnie</b>. Oszczędność na biurze: ok. 160 zł tygodniowo." }],
  };
}
