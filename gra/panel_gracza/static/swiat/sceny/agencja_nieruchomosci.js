// Scena wnętrza „agencja_nieruchomosci” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/agencja_nieruchomosci.md.
// TYTUL: Biuro nieruchomości „Klucz” (witryna z ogłoszeniami, licytacje, notariusz) | Lokale
// KOLEJNOSC: 90
// Trzy sprawy, trzy meble: witryna z kartami lokali (najem, kupno), mównica licytatora (licytacje), biurko notariusza (kupno budynku).
export default function (R) {
  const YP = 400, L = [["Narutowicza", "Śródmieście", "2 900"], ["Zana", "LSM", "1 900"], ["Szeligowskiego", "Czechów", "1 700"], ["Dworcowa", "Dworzec", "2 400"], ["Felin", "działka", "54 000"], ["Grodzka", "Stare Miasto", "3 600"]];
  return {
    id: "agencja_nieruchomosci", tytul: "Biuro nieruchomości „Klucz”", adres: "Śródmieście, poza deptakiem", opis: "Biuro nieruchomości: witryna z kartami wolnych lokali, mównica licytatora z młotkiem, biurko notariusza i tablica kluczy.",
    rysuj: (R) => {
      let s = R.sciana() + Array.from({ length: 24 }, (_, i) => `<path d="M${i * 52 + 20} 0v300" stroke="var(--g-zielen)" opacity=".12" stroke-width="10" class="efekt"/>`).join("") + R.boazeria(300, YP) + R.podloga("parkiet", YP, "var(--g-podloga)") + R.lampa(620, 26) + R.lampa(1000, 26);
      // witryna z kartami lokali (od środka)
      s += `<rect class="k3" x="40" y="60" width="440" height="330" fill="var(--g-niebo)"/>` + R.t(260, 88, "LOKALE DO WZIĘCIA", 16, { fill: "var(--g-czern)", ls: 2 });
      L.forEach(([ul, st, c], i) => { const x = 58 + (i % 3) * 138, y = 104 + Math.floor(i / 3) * 138;
        s += `<rect class="k" x="${x}" y="${y}" width="124" height="124" fill="var(--g-biel)"/><rect class="k1" x="${x + 8}" y="${y + 8}" width="108" height="54" fill="${["var(--g-sciana2)", "var(--g-rudy)", "var(--g-zielen)"][i % 3]}"/><path class="k1" d="M${x + 44} ${y + 62}v-26h36v26" fill="var(--g-szklo)"/>`
          + R.t(x + 62, y + 80, ul, 13, { fill: "var(--g-czern)", f: "gruby", w: 112 }) + R.t(x + 62, y + 96, st, 12, { fill: "var(--g-czern)", f: "tekst", bez: true }) + R.t(x + 62, y + 114, `${c} zł${i === 4 ? "" : " / mies."}`, 12.5, { fill: "var(--g-czern)", f: "tekst", bez: true }); });
      s += `<rect class="k3 bez" x="40" y="60" width="440" height="330"/>`;
      // mównica licytatora z młotkiem
      s += R.tabliczka(640, 120, 200, "Licytacje", "sala") + R.osobaZa("bywalec-zagloba", 640, 304, 430, 1.0) + `<path class="k3" d="M560 300h160l14 100h-188z" fill="var(--g-drewno)"/><rect class="k" x="550" y="290" width="180" height="14" fill="var(--g-drewno2)"/><path class="k" d="M690 290l40-34" stroke-width="5" stroke="var(--g-drewno2)"/><rect class="k" x="722" y="240" width="34" height="20" rx="4" fill="var(--g-drewno)" transform="rotate(-40 739 250)"/>`
        + [540, 620, 700].map((x) => R.krzeslo(x, 560, 1.1, "var(--g-drewno2)")).join("");
      // biurko notariusza, tablica kluczy
      s += `<rect class="k3" x="850" y="80" width="330" height="150" fill="var(--g-drewno)"/>` + R.t(1015, 104, "KLUCZE", 14, { fill: "var(--g-biel)", ls: 3 }) + Array.from({ length: 14 }, (_, i) => `<circle class="k1" cx="${880 + (i % 7) * 45}" cy="${134 + Math.floor(i / 7) * 46}" r="4" fill="var(--g-metal)"/>` + (i === 2 ? `<path class="k" d="M${880 + 2 * 45} 138v26" stroke="var(--uwaga)" stroke-width="4"/><circle class="k" cx="${880 + 2 * 45}" cy="170" r="7" fill="var(--uwaga)"/>` : "")).join("");
      s += R.osobaZa("bywalec-rzecki", 1010, 344, 470, 1.0) + R.biurko(860, 340, 320, 110, { front: "var(--g-drewno)" }) + `<rect class="k" x="880" y="318" width="110" height="22" fill="var(--uwaga)"/>` + R.t(935, 334, "NOTARIUSZ", 12.5, { fill: "var(--g-czern)" }) + `<path class="k bez" d="M1120 340v-36" stroke-width="4"/><path class="k" d="M1094 304q26-22 52 0z" fill="var(--g-zielen2)"/>` + R.stemple(1040, 340);
      // makieta kamienic na stoliku, agentka
      s += `<rect class="k" x="130" y="500" width="230" height="12" fill="var(--g-drewno)"/><path class="k" d="M150 512v92M340 512v92" stroke-width="5"/>` + [0, 1, 2, 3].map((i) => `<path class="k1" d="M${150 + i * 48} 500v-${36 + (i % 2) * 14}l22-14 22 14v${36 + (i % 2) * 14}z" fill="${R.KOL[i]}"/>`).join("") + R.osoba("gosc-turystka", 440, 606, 0.84);
      return s;
    },
    punkty: [
      { x: 34, y: 54, w: 452, h: 342, et: "Lokale do wzięcia", stan: "!", opisStanu: "firma nie ma jeszcze lokalu", teczka: { tytul: "Wolne lokale i działki", okruszek: "witryna", zakladki: ["Najem", "Kupno", "Działki"], wstep: "Od okolicy zależy, kto przyjdzie. Najem to czynsz i kaucja za 2 miesiące, kupno to duży wydatek, ale własny majątek.",
        pola: [["ul. Zana (LSM): 2 stanowiska kuchni, 1 kasy", "1 900 zł / mies."], ["Forma", "najem ▾"], ["Kaucja", "2 × czynsz"]], decyzje: ["lokal"], ekran: "lokale" } },
      { x: 534, y: 110, w: 252, h: 300, et: "Licytacje", teczka: { tytul: "Licytacje lokali", okruszek: "mównica", wstep: "Gdy lokal chce kilka drużyn, wygrywa najwyższa oferta (najwyżej 3 × cena wywoławcza).", pola: [["Narutowicza (Śródmieście)", "wywoławcza 2 900 zł"], ["Twoja oferta", "3 200 zł"]], decyzje: ["lokal"], ekran: "licytacje", funkcja: "siec" } },
      { x: 844, y: 240, w: 346, h: 216, et: "Notariusz", teczka: { tytul: "Kupno budynku z najemcą", okruszek: "biurko notariusza", zakladki: ["Kup budynek", "Wypowiedz najem"], wstep: "Kupujesz budynek, w którym ktoś wynajmuje lokal. Najemca płaci czynsz Tobie albo dostaje wypowiedzenie.", pola: [["Budynek", "wybierz ▾"], ["Oferta", "kwota"]], decyzje: ["przejecie", "wypowiedz"], ekran: "przejecia", funkcja: "siec" } },
      { x: 844, y: 74, w: 342, h: 162, et: "Twoje klucze", teczka: { tytul: "Lokale firmy", okruszek: "tablica kluczy", wstep: "Lokale, które masz: forma, czynsz, do kiedy trwa najem.", pola: [["ul. Zana (LSM)", "najem · 1 900 zł / mies."]], ekran: "lokale (Twoje)" } },
    ],
    osoby: [{ x: 440, stopy: 606, s: 0.84, imie: "Agentka", tekst: "Lokal jest jak małżeństwo: liczy się położenie i ile trzeba za to płacić co miesiąc.", powitanie: true }],
  };
}
