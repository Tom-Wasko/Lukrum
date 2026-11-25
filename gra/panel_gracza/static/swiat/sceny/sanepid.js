// Scena wnętrza „sanepid” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/sanepid.md.
// TYTUL: Sanepid (gabinet inspektora: próbki, tablica poziomów higieny) | Urzędy
// KOLEJNOSC: 71
// Poziom higieny (decyzja `higiena`, dane/zdarzenia/urzad.yaml: brak, podstawowa, firma, haccp) i kontrole. Inspektor Pimko (aluzja).
export default function (R) {
  const YP = 400;
  return {
    id: "sanepid", tytul: "Sanepid", adres: "ul. Uniwersytecka, róg Karłowicza", opis: "Gabinet inspektora sanitarnego: białe kafle, plakat o myciu rąk, umywalka, szafka z próbkami, biurko z protokołami i tablica czterech poziomów higieny.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-biel)") + Array.from({ length: 9 }, (_, i) => `<path d="M0 ${i * 44 + 20}h1220" stroke="var(--tusz)" opacity=".1"/>`).join("") + Array.from({ length: 28 }, (_, i) => `<path d="M${i * 44 + 10} 0v${YP}" stroke="var(--tusz)" opacity=".1"/>`).join("") + R.podloga("plytki", YP) + R.swietlowka(200, 10, 180) + R.swietlowka(820, 10, 180);
      // plakat, umywalka z mydłem
      s += R.plakat(50, 70, 170, 150, ["MYJ RĘCE", "przed pracą", "i po każdej", "przerwie"], "var(--akcent-2)", 20) + `<path class="k" d="M250 300h110v20q0 30-55 30t-55-30z" fill="var(--g-biel)"/><path class="k bez" d="M305 300v-40h-24" stroke-width="5"/><rect class="k" x="340" y="276" width="18" height="24" rx="4" fill="var(--uwaga)"/><path class="k" d="M305 350v50" stroke-width="6"/>`;
      // szafka z próbkami, mikroskop
      s += `<rect class="k3" x="410" y="110" width="230" height="290" fill="var(--g-metal)"/>` + [0, 1, 2].map((r) => `<rect class="k" x="420" y="${120 + r * 92}" width="210" height="84" fill="var(--g-szklo)" opacity=".6"/>` + [0, 1, 2, 3, 4].map((k) => `<rect class="k1" x="${432 + k * 40}" y="${150 + r * 92}" width="26" height="50" rx="4" fill="${R.KOL[(k + r) % 6]}" opacity=".85"/><rect x="${432 + k * 40}" y="${144 + r * 92}" width="26" height="8" fill="var(--g-czern)"/>`).join("")).join("") + R.t(525, 100, "PRÓBKI", 14, { ls: 3, op: .8 });
      // inspektor za biurkiem, protokół, pieczątka, lupa
      s += R.osobaZa("bywalec-judym", 800, 404, 540, 1.05, "zwykla") + R.biurko(660, 400, 320, 130, { front: "var(--g-metal)", blat: "var(--g-metal2)" }) + R.papiery(690, 400, 5) + R.stemple(880, 400) + `<circle class="k3 bez" cx="790" cy="388" r="13"/><path class="k" d="M800 396l16 8" stroke-width="5"/>`;
      s += `<rect class="k1" x="712" y="200" width="20" height="60" fill="var(--g-biel)"/><rect x="718" y="224" width="8" height="32" fill="var(--strata)"/>` + R.t(722, 194, "+4°C", 12, { op: .8 });
      // tablica poziomów higieny
      s += R.literki(1010, 70, 190, 190, "HIGIENA", [["BRAK", "!"], ["PODSTAWOWA", "✓"], ["FIRMA", ""], ["HACCP", ""]], 14);
      s += R.wieszak(1130, YP) + R.osoba("gosc-sasiadka", 180, 606, 0.82, "zwykla") + R.kosz(380, 566);
      s += R.doniczka(1150, 596, 1.1) + R.wycieraczka(60, 596, 120) + R.krzeslaRzad(900, 598, 2);
      return s;
    },
    punkty: [
      { x: 1004, y: 64, w: 202, h: 202, et: "Poziom higieny", teczka: { tytul: "Wybierz poziom higieny", okruszek: "tablica", wstep: "Wyższy poziom kosztuje co tydzień, ale zmniejsza ryzyko mandatu i zatrucia. <b class=\"strata\">! Poziom „brak”: sanepid nie odbierze lokalu.</b>",
        pola: [["Brak: sprzątamy, jak się pobrudzi", "0 zł", "mandat 400 zł przy prawie każdej kontroli; lokal nie przejdzie odbioru"], ["Podstawowa: mop i grafik na lodówce", "wybrana ✓"], ["Firma sprzątająca", "koszt tygodniowy"], ["HACCP: procedury i szkolenie", "koszt tygodniowy"]], decyzje: ["higiena"], ekran: "sanepid", funkcja: "urzedy" } },
      { x: 650, y: 280, w: 340, h: 256, et: "Kontrole", stan: "!", opisStanu: "mandat w poprzednim tygodniu", teczka: { tytul: "Protokoły kontroli i mandaty", okruszek: "biurko inspektora", wstep: "Co inspektor znalazł i ile to kosztowało.", pola: [["Tydzień 5: kontrola planowa", "! mandat 400 zł", "przeterminowany towar w chłodni"], ["Tydzień 4: odbiór lokalu", "✓ bez uwag"]], ekran: "sanepid (historia)", funkcja: "urzedy" } },
      { x: 404, y: 84, w: 242, h: 322, et: "Świeżość towaru", odsyla: { kto: "Inspektor", tekst: "Co leży w chłodni i do kiedy jest ważne, zobaczą Państwo u siebie, na zapleczu.", stan: "Przeterminowane w tym tygodniu: 2 opakowania", miejsce: "Mój kebab" } },
    ],
    osoby: [{ x: 800, stopy: 540, s: 1.05, h: 130, imie: "Inspektor Pimko", tekst: "Czysto? To się okaże. Zapowiadam się rzadko, przychodzę częściej.", powitanie: true }],
  };
}
