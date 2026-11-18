// Scena wnętrza „auchan” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/auchan.md.
// TYTUL: Auchan (hipermarket: aleje z tablicami, rząd kas, zakupy z dowozem) | Zaopatrzenie
// KOLEJNOSC: 53
// Hipermarket: wszystko pod jednym dachem, drożej (średnia rynku + 12%), bez gazetki, odbiór osobisty 2 godz. bez limitu sztuk.
// Tu robi zakupy auto-dostawca (decyzja auto_dostawy). Dane: dane/dostawcy.yaml → Auchan.
export default function (R) {
  const ID = "auchan", YP = 400;
  return {
    id: ID, tytul: "Auchan", adres: "al. Witosa, Felin", opis: "Hipermarket: cztery długie regały pod wiszącymi tablicami alejek, na pierwszym planie rząd trzech kas i stanowisko zakupów z dowozem.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana)", YP) + R.podloga("plytki", YP) + [80, 380, 680, 980].map((x) => R.swietlowka(x, 14, 160)).join("");
      s += `<rect x="0" y="52" width="1220" height="36" fill="var(--akcent)"/>` + R.t(610, 78, "AUCHAN · wszystko pod jednym dachem", 20, { fill: "var(--papier)", ls: 2 });
      // cztery regały z tablicami alejek
      const AL = [["1", "Pieczywo"], ["2", "Mięso i mrożonki"], ["3", "Warzywa i sosy"], ["4", "Napoje, opakowania"]];
      AL.forEach(([nr, txt], i) => { const x = 40 + i * 236; s += R.alejka(x + 20, 104, nr, txt, 180) + R.regal(x, 180, 220, 220, 3, R.towar, "var(--g-metal)"); });
      // zamrażarka w alejce 2, skrzynki w alejce 3
      s += R.zamrazarka(286, YP + 6, 200, "") + R.skrzynki(520, YP + 8, 2, 80) + R.skrzynki(610, YP + 8, 2, 80);
      // stanowisko „zakupy z dowozem” (auto-dostawy) z prawej: lada, monitor, kosz z zamówieniem, pracownik
      s += R.tabliczka(1090, 110, 210, "Zakupy z dowozem", "stała lista zakupów") + R.osobaZa("sprzedawca", 1090, 304, 420, 0.95) + R.lada(1000, 300, 180, 100, { front: "var(--akcent)", panele: false }) + R.monitor(1020, 300, 0.75) + R.skrzynka(1100, 262, 66, 38, "var(--g-drewno2)", "");
      // pierwszy plan: trzy kasy w rzędzie (numery na masztach), wózek sklepowy, klientka w kolejce
      [150, 420, 690].forEach((x, i) => { s += R.u("sklep-kasa", x, 440, 0.95) + `<path class="k" d="M${x + 150} 452v-70"/><circle class="k" cx="${x + 150}" cy="370" r="15" fill="${i === 1 ? "var(--uwaga)" : "var(--g-biel)"}"/>` + R.t(x + 150, 376, String(i + 1), 16, { fill: "var(--g-czern)", f: "gruby" }); });
      s += R.osobaZa("obsluga-kasjerka", 510, 500, 600, 0.9) + R.u("sklep-wozek", 900, 474, 0.95) + R.osoba("gosc-sasiadka", 1090, 606, 0.78, "zwykla");
      return s;
    },
    punkty: () => [
      { x: 32, y: 100, w: 232, h: 306, et: "Pieczywo", teczka: R.zamow(ID, "Pieczywo", "alejka 1") },
      { x: 268, y: 100, w: 232, h: 306, et: "Mięso i mrożonki", teczka: R.zamow(ID, ["Mięso", "Mrożonki"], "alejka 2") },
      { x: 504, y: 100, w: 232, h: 306, et: "Warzywa i sosy", teczka: R.zamow(ID, ["Warzywa", "Sosy i dodatki"], "alejka 3") },
      { x: 740, y: 100, w: 232, h: 306, et: "Napoje i opakowania", teczka: R.zamow(ID, ["Napoje", "Opakowania"], "alejka 4") },
      { x: 990, y: 100, w: 210, h: 306, et: "Zakupy z dowozem", teczka: { tytul: "Zakupy z dowozem (auto-dostawy)", okruszek: "stanowisko obsługi", wstep: "Zostaw stałą listę: sklep sam kupi składniki na prognozowaną sprzedaż i dowiezie do lokalu. Wygodne, ale z prowizją i bez szukania okazji.",
        pola: [["Auto-dostawy dla lokalu przy Narutowicza", "włączone ▾"], ["Jakość składników", "★★ ▾"], ["Zapas ponad prognozę", "20%"]], decyzje: ["auto_dostawy"], ekran: "zaop_dostawy (auto-dostawy)", funkcja: "zaopatrzenie" } },
      { x: 140, y: 420, w: 730, h: 186, et: "Koszyk tygodnia", gdzie: "wewn", teczka: R.koszyk(ID, "kasy") },
    ],
    osoby: [{ x: 1090, stopy: 420, s: 0.95, h: 110, imie: "Obsługa", tekst: "Mamy wszystko, tylko trochę drożej. Możemy też kupować za Państwa co tydzień.", powitanie: true, strona: "lewo" }],
  };
}
