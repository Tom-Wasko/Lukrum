// Scena wnętrza „poczta” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/poczta.md.
// TYTUL: Poczta Główna (okienko nadawcze: wysłanie decyzji tygodnia) | Urzędy
// KOLEJNOSC: 72
// Wysłanie decyzji = nadanie listu poleconego do mistrza gry. Tablica „Do poprawy” to lista błędów, regał to potwierdzenia nadania.
export default function (R) {
  const YP = 400;
  // dane z widoku gry (pulpit.js ustawia window.lukrum.widok); bez widoku zostaje pusta poczta. Scena rysuje się przy każdym wejściu,
  // więc tablica i stempel odświeżają się co rundę (podróż 02/drobne).
  const widok = () => { try { return window.lukrum?.widok?.() || null; } catch { return null; } };
  const dane = () => {
    const v = widok();
    return { v, czerw: (v?.lista_bledow || []).filter((b) => b.poziom === "czerwony"), wyslane: !!v?.wyslane, tydz: v?.runda ?? R.gra?.tydzien ?? 1 };
  };
  return {
    id: "poczta", tytul: "Poczta Główna", adres: "Krakowskie Przedmieście", opis: "Sala pocztowa: okienko nadawcze z wagą i datownikiem, na ladzie koperta z decyzjami tygodnia, tablica z listą błędów, czerwona skrzynka, budka telefoniczna, regał potwierdzeń.",
    rysuj: (R) => {
      const { v, czerw, wyslane, tydz } = dane();
      const wiersze = czerw.slice(0, 4).map((b) => ["!", b.tekst.length > 46 ? b.tekst.slice(0, 45) + "…" : b.tekst]);
      if (!wiersze.length) wiersze.push(["✓", v ? "Nic do poprawy" : "Brak danych"]);
      let s = R.sciana() + R.boazeria(280, YP) + R.podloga("lastryko", YP) + R.kula(380, 16, 16) + R.kula(840, 16, 16);
      s += R.szyld(610, 36, 300, 46, "POCZTA", { tlo: "var(--akcent)", tekst: "var(--papier)", f: "gruby", r: 28 }) + R.zegar(840, 130, 26, 11, 40);
      // tablica „Do poprawy przed nadaniem”
      s += `<rect class="k3" x="50" y="80" width="310" height="230" fill="var(--g-drewno)"/><rect class="k" x="60" y="90" width="290" height="210" fill="var(--g-biel)"/>` + R.t(205, 116, "DO POPRAWY PRZED NADANIEM", 13.5, { fill: "var(--g-czern)", ls: 1, w: 270 })
        + wiersze.map(([z, t], i) => R.t(78, 150 + i * 34, z, 20, { fill: z === "!" ? "var(--strata)" : "var(--zysk)", f: "gruby", kot: "start" }) + R.t(104, 148 + i * 34, t, 14.5, { fill: "var(--g-czern)", f: "tekst", kot: "start", bez: true, w: 236 })).join("");
      // okienko nadawcze: naczelnik, waga, datownik, koperta drużyny
      s += R.osobaZa("gosc-podrozny", 610, 324, 452, 1.0, "dobra") + R.szyba(460, 180, 300, 140) + R.tabliczka(610, 140, 240, "Nadawanie", "listy polecone") + R.lada(440, 320, 340, 110);
      s += R.waga(690, 320) + R.stemple(470, 320) + `<path class="k3" d="M540 320h110v-56h-110z" fill="var(--g-biel)"/><path class="k" d="M540 264l55 30 55-30"/>` + R.t(595, 312, `DECYZJE TYG. ${tydz}`, 11, { fill: "var(--g-czern)" })
        + (wyslane ? R.t(595, 286, "✓ NADANO", 13, { fill: "var(--zysk)", f: "gruby" }) : "") + `<rect class="k1" x="626" y="268" width="18" height="20" fill="var(--akcent)"/>`;
      // skrzynka, budka telefoniczna, regał potwierdzeń
      s += `<rect class="k3" x="850" y="230" width="90" height="130" rx="6" fill="var(--akcent)"/><rect class="k" x="864" y="254" width="62" height="10" fill="var(--g-czern)"/>` + R.t(895, 300, "LISTY", 15, { fill: "var(--papier)" }) + `<path class="k" d="M895 360v40" stroke-width="8"/>`;
      s += `<rect class="k3" x="970" y="120" width="100" height="280" fill="var(--g-drewno2)"/><rect class="k" x="982" y="134" width="76" height="150" fill="var(--g-szklo)" opacity=".6"/>` + R.telefon(1002, 330, "var(--g-czern)") + R.t(1020, 112, "TELEFON", 12, { ls: 1.5, op: .8 });
      s += R.regal(1090, 150, 110, 250, 4, (px, py, pw, ph, nr) => Array.from({ length: 5 - nr }, (_, k) => `<rect class="k1" x="${px + 4 + k * 17}" y="${py + 8}" width="14" height="${ph - 8}" fill="var(--g-biel)"/>`).join("")) + R.t(1145, 142, "NADANE", 12, { ls: 1.5, op: .8 });
      // pierwszy plan: stolik do pisania z długopisem na łańcuszku, kolejka
      s += `<rect class="k" x="120" y="480" width="210" height="12" fill="var(--g-drewno)"/><path class="k" d="M136 492v112M314 492v112" stroke-width="5"/>` + R.papiery(150, 480, 4) + `<path class="k1 bez" d="M260 480q20-34 40-8"/>` + R.osoba("gosc-sasiadka", 520, 606, 0.82, "zwykla") + R.osoba("gosc-student", 800, 606, 0.82, "zwykla") + R.kwietnik(1150, 604, 0.9);
      return s;
    },
    punkty: () => {
      const { czerw, wyslane, tydz } = dane();
      return [
      { x: 434, y: 130, w: 352, h: 306, et: "Nadaj list z decyzjami", stan: wyslane ? "✓" : czerw.length ? "!" : "", opisStanu: wyslane ? "nadano w tym tygodniu" : czerw.length ? `${czerw.length} do poprawy` : "gotowe do nadania", teczka: { tytul: "Nadaj list z decyzjami", okruszek: "okienko nadawcze", wstep: "Podsumowanie wszystkiego, co postanowione w tym tygodniu. Po nadaniu można jeszcze poprawiać, aż mistrz gry zamknie tydzień.",
        pola: [["Tydzień", String(tydz)], ["Stan listu", wyslane ? "✓ nadano" : "do nadania"], ["Do poprawy", czerw.length ? `! ${czerw.length}` : "brak", "lista na tablicy z lewej"], ["Nadaj list polecony", "Wyślij"]], ekran: "wyslij" } },
      { x: 44, y: 74, w: 322, h: 242, et: "Do poprawy", stan: czerw.length ? "!" : "", opisStanu: czerw.length ? `${czerw.length} błędy czerwone` : "brak błędów", teczka: { tytul: "Lista błędów", okruszek: "tablica", wstep: "Każdy wiersz prowadzi do miejsca, w którym da się to poprawić.", pola: czerw.length ? czerw.map((b) => [`! ${b.tekst}`, "➜ popraw"]) : [["Nic do poprawy", "✓"]], ekran: "lista_bledow" } },
      { x: 1084, y: 130, w: 122, h: 276, et: "Potwierdzenia", gdzie: "prawy-brzeg", teczka: { tytul: "Wysłane tygodnie", okruszek: "regał", wstep: "Potwierdzenia nadania z poprzednich tygodni.", pola: Array.from({ length: Math.max(0, tydz - 1) }, (_, i) => [`Tydzień ${tydz - 1 - i}`, "nadano"]).slice(0, 6), ekran: "wyslij (historia)" } },
      ];
    },
    osoby: [{ x: 610, stopy: 452, s: 1.0, h: 120, imie: "Naczelnik poczty", tekst: "Polecony do mistrza gry? Proszę najpierw sprawdzić tablicę z błędami.", powitanie: true }],
  };
}
