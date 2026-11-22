// Scena wnętrza „piekarnia” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/piekarnia.md.
// TYTUL: Piekarnia Koziołek (piec, wózek z blachami, lada z koszami) | Zaopatrzenie
// KOLEJNOSC: 58
// Piekarnia na Starym Mieście: bułki, tortille, pita ★–★★★, dowóz codziennie rano (15 zł, darmowy od 150 zł), osobna ilość na każdy dzień.
export default function (R) {
  const ID = "piekarnia", YP = 400;
  const bochenki = (x, y, n, kol = "var(--g-skora2)") => Array.from({ length: n }, (_, i) => `<ellipse class="k1" cx="${x + i * 34}" cy="${y}" rx="15" ry="9" fill="${kol}"/>`).join("");
  return {
    id: ID, tytul: "Piekarnia Koziołek", adres: "Stare Miasto", opis: "Piekarnia: ceglany piec z łopatą, wózek z blachami bułek, lada z koszami pity i tortilli, kalendarz dostaw na każdy dzień tygodnia.",
    rysuj: (R) => {
      let s = R.sciana("color-mix(in srgb, var(--g-skora) 35%, var(--g-sciana))", YP) + R.podloga("plytki", YP, "var(--g-podloga)") + R.lampa(520, 30) + R.lampa(900, 30);
      // piec ceglany z łukiem i żarem, łopata piekarska oparta o ścianę
      s += `<rect class="k3" x="40" y="90" width="300" height="310" fill="var(--g-rudy)"/>` + Array.from({ length: 9 }, (_, r) => `<path d="M40 ${124 + r * 34}h300" stroke="var(--tusz)" opacity=".25"/>`).join("") + `<path class="k3" d="M110 330v-90a80 70 0 0 1 160 0v90z" fill="var(--g-czern)"/><path d="M130 326q20-50 40 0t40 0t40 0" fill="none" stroke="var(--uwaga)" stroke-width="8" class="efekt"/><rect class="k" x="100" y="330" width="180" height="14" fill="var(--g-metal2)"/><rect class="k" x="170" y="40" width="50" height="50" fill="var(--g-rudy)"/>`
        + `<path class="k" d="M366 400l30-300" stroke="var(--g-drewno2)" stroke-width="7"/><ellipse class="k" cx="398" cy="86" rx="24" ry="34" fill="var(--g-drewno2)"/>`;
      // wózek piekarski z blachami
      s += `<path class="k bez" d="M440 400v-250h130v250" stroke-width="4"/>` + [0, 1, 2, 3, 4].map((r) => `<rect class="k1" x="444" y="${176 + r * 44}" width="122" height="7" fill="var(--g-metal)"/>` + bochenki(462, 168 + r * 44, 4, r % 2 ? "var(--g-biel)" : "var(--g-skora2)")).join("") + `<circle class="k" cx="452" cy="406" r="7" fill="var(--g-czern)"/><circle class="k" cx="558" cy="406" r="7" fill="var(--g-czern)"/>`;
      // szyld, kalendarz dostaw: 7 kartek dni z liczbą opakowań
      s += R.szyld(800, 40, 330, 48, "Piekarnia Koziołek", { tlo: "var(--g-drewno)", tekst: "var(--g-biel)", f: "gruby", r: 22 });
      s += ["PN", "WT", "ŚR", "CZ", "PT", "SO", "ND"].map((d, i) => `<rect class="k" x="${624 + i * 52}" y="120" width="46" height="60" fill="var(--g-biel)"/><rect x="${624 + i * 52}" y="120" width="46" height="18" fill="${i > 4 ? "var(--akcent)" : "var(--g-tablica)"}" class="k1"/>` + R.t(647 + i * 52, 134, d, 12, { fill: i > 4 ? "var(--papier)" : "var(--g-biel)" }) + R.t(647 + i * 52, 166, String([4, 4, 4, 5, 7, 8, 6][i]), 20, { fill: "var(--g-czern)", f: "gruby" })).join("") + R.t(806, 204, "opakowań bułek na każdy dzień", 13, { f: "tekst", bez: true, op: .85 });
      // piekarz, lada z koszami, waga; okno na Stare Miasto, rower dostawczy za oknem
      s += R.okno(1040, 110, 140, 170, { firanka: true }) + R.osobaZa("obsluga-kucharz", 800, 334, 470, 1.05) + R.lada(620, 330, 380, 120, { front: "var(--g-drewno2)" });
      s += [["BUŁKI", 640], ["TORTILLE", 760], ["PITA", 880]].map(([n, x], i) => `<path class="k" d="M${x} 330h100l-10-40h-80z" fill="var(--g-drewno)"/>` + bochenki(x + 20, 288, 3, i === 1 ? "var(--g-biel)" : "var(--g-skora2)") + R.cenowka(x + 14, 356, n, 76)).join("");
      // pierwszy plan: skrzynki dowozowe i rower z koszem
      s += R.skrzynka(80, 520, 130, 70, "var(--g-drewno2)", "DOWÓZ 5:30") + R.skrzynka(96, 456, 110, 64, "var(--g-drewno2)", "") + `<circle class="k3 bez" cx="1010" cy="560" r="40"/><circle class="k3 bez" cx="1140" cy="560" r="40"/><path class="k3 bez" d="M1010 560l44-70h60l26 70M1054 490l32 70h-76M1114 490l-10-22h22"/><rect class="k" x="1116" y="470" width="60" height="40" fill="var(--g-drewno2)"/>`;
      return s;
    },
    punkty: () => [
      { x: 612, y: 240, w: 396, h: 216, et: "Pieczywo", teczka: R.zamow(ID, "Pieczywo", "lada") },
      { x: 616, y: 110, w: 376, h: 104, et: "Ile na który dzień", gdzie: "dol", teczka: R.dowoz(ID, "kalendarz dostaw") },
      { x: 70, y: 440, w: 150, h: 156, et: "Koszyk tygodnia", gdzie: "gora", teczka: R.koszyk(ID, "skrzynki dowozowe") },
      { x: 34, y: 84, w: 312, h: 320, et: "Jakość wypieku", teczka: { tytul: "Jakość pieczywa", okruszek: "piec", wstep: "Trzy jakości tego samego pieczywa. Lepsza bułka podnosi ocenę dania, tańsza obniża koszt. Jakość wybierasz przy zamawianiu pieczywa na ladzie.", pola: [["Bułka ★", "35,97 zł"], ["Bułka ★★", "42,32 zł"], ["Bułka ★★★", "55,86 zł"]], ekran: "–" } },
    ],
    osoby: [{ x: 800, stopy: 470, s: 1.05, h: 130, imie: "Piekarz", tekst: "Wstaję o trzeciej, dowożę o wpół do szóstej. Proszę tylko powiedzieć, ile na który dzień.", powitanie: true }],
  };
}
