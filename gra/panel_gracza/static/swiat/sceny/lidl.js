// Scena wnętrza „lidl” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/lidl.md.
// TYTUL: Lidl (dyskont: wyspa „tydzień śródziemnomorski”, wypiek na miejscu, zamrażarki) | Zaopatrzenie
// KOLEJNOSC: 55
// Dyskont jak Biedronka (★ i ★★, odbiór 1,5 godz., limit 4 opakowań, gazetka 3 pozycje), ale ma falafel i pitę mrożoną:
// „tydzień kuchni śródziemnomorskiej co tydzień”. Dane: dane/dostawcy.yaml → Lidl.
export default function (R) {
  const ID = "lidl", YP = 400, MARKA = "var(--akcent-2)";
  return {
    id: ID, tytul: "Lidl", adres: "ul. Romantyczna, Czuby", opis: "Dyskont z wyspą tematyczną pośrodku: tydzień śródziemnomorski z falafelem i pitą; z lewej piec i półki z pieczywem, z prawej zamrażarki i kasa.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana)", YP) + R.podloga("plytki", YP) + [100, 520, 940].map((x) => R.swietlowka(x, 12, 180)).join("");
      s += R.szyld(130, 44, 150, 44, "LIDL", { tlo: MARKA, tekst: "var(--papier)", r: 26 });
      // wypiek na miejscu: piec w ścianie i skośne półki z pieczywem
      s += R.tabliczka(190, 106, 220, "Wypiek na miejscu", "bułki, tortille, pita") + `<rect class="k3" x="50" y="160" width="120" height="240" fill="var(--g-metal2)"/><rect class="k" x="62" y="176" width="96" height="70" fill="var(--g-czern)"/><path d="M70 236q20-30 40 0t40 0" fill="none" stroke="var(--uwaga)" stroke-width="5" class="efekt"/><rect class="k1" x="62" y="262" width="96" height="10" fill="var(--g-metal)"/>`
        + [0, 1, 2].map((r) => `<path class="k" d="M190 ${220 + r * 62}h150l8 16h-166z" fill="var(--g-drewno2)"/>` + [0, 1, 2, 3].map((k) => `<ellipse class="k1" cx="${212 + k * 36}" cy="${214 + r * 62}" rx="15" ry="9" fill="${r === 1 ? "var(--g-biel)" : "var(--g-skora2)"}"/>`).join("")).join("") + `<rect class="k" x="184" y="190" width="8" height="210" fill="var(--g-drewno)"/><rect class="k" x="340" y="190" width="8" height="210" fill="var(--g-drewno)"/>`;
      // regały: warzywa i sosy, napoje
      s += R.regalSklepowy(390, 190, 200, 210, 3, "Warzywa i sosy", MARKA, "var(--papier)") + R.regalSklepowy(1000, 190, 180, 210, 3, "Napoje", MARKA, "var(--papier)");
      // wyspa tygodnia: podest, baner z chorągiewkami, falafel i pita, oliwki
      s += `<path class="k1 bez" d="M620 150q170 30 340 0"/>` + Array.from({ length: 9 }, (_, i) => `<path class="k1" d="M${636 + i * 37} ${154 + Math.sin(i / 2.6) * 10}l9 16 9-16z" fill="${[R.KOL[0], "var(--g-biel)", R.KOL[3]][i % 3]}"/>`).join("")
        + R.plakat(660, 186, 260, 70, ["TYDZIEŃ", "ŚRÓDZIEMNOMORSKI"], "var(--akcent)", 19) + `<rect class="k3" x="640" y="330" width="300" height="100" fill="var(--g-drewno2)"/><rect class="k" x="630" y="318" width="320" height="16" fill="var(--g-drewno)"/>`
        + [0, 1, 2, 3, 4].map((i) => `<path class="k1" d="M${650 + i * 58} 318h44l-6-22h-32z" fill="${[R.KOL[3], "var(--g-skora2)", "var(--uwaga)", R.KOL[3], "var(--g-biel)"][i]}"/>`).join("") + R.cenowka(668, 348, "FALAFEL 64,89", 110) + R.cenowka(800, 366, "PITA MROŻ. 33,59", 126);
      // pierwszy plan: zamrażarki skrzyniowe, stojak z gazetką, kasa
      s += R.zamrazarka(420, 600, 190, "MROŻONKI") + R.zamrazarka(620, 600, 190, "FRYTKI");
      s += `<path class="k" d="M110 604v-140M84 604h52" stroke-width="5"/><rect class="k" x="64" y="456" width="92" height="104" fill="var(--g-biel)"/><rect x="64" y="456" width="92" height="28" fill="${MARKA}" class="k"/>` + R.t(110, 476, "GAZETKA", 13.5, { fill: "var(--papier)" }) + [0, 1, 2].map((i) => `<rect class="k1" x="${72 + i * 28}" y="494" width="22" height="26" fill="${R.KOL[i + 1]}"/>`).join("");
      s += R.osobaZa("obsluga-kasjerka", 1110, 500, 600, 0.9) + R.u("sklep-kasa", 1010, 440, 1.0) + R.osoba("gosc-student", 900, 606, 0.8, "dobra") + R.kosz(250, 566);
      return s;
    },
    punkty: () => [
      { x: 44, y: 100, w: 316, h: 306, et: "Pieczywo", teczka: R.zamow(ID, "Pieczywo", "wypiek na miejscu") },
      { x: 384, y: 156, w: 212, h: 250, et: "Warzywa i sosy", teczka: R.zamow(ID, ["Warzywa", "Sosy i dodatki"], "regał") },
      { x: 624, y: 140, w: 332, h: 296, et: "Falafel i pita", stan: "✓", klasa: "zy", opisStanu: "w gazetce w tym tygodniu", teczka: R.zamow(ID, "Falafel i pita", "wyspa tygodnia") },
      { x: 994, y: 156, w: 192, h: 250, et: "Napoje", teczka: R.zamow(ID, "Napoje", "regał") },
      { x: 412, y: 504, w: 406, h: 100, et: "Mrożonki", gdzie: "gora", teczka: R.zamow(ID, "Mrożonki", "zamrażarki") },
      { x: 54, y: 446, w: 112, h: 160, et: "Gazetka", stan: "✓", klasa: "zy", opisStanu: "3 okazje w tym tygodniu", gdzie: "prawo", teczka: R.gazetka(ID) },
      { x: 1004, y: 420, w: 196, h: 186, et: "Koszyk tygodnia", gdzie: "wewn", teczka: R.koszyk(ID) },
    ],
    osoby: [{ x: 1110, stopy: 600, s: 0.9, h: 110, imie: "Kasjerka", tekst: "W tym tygodniu Grecja: falafel i pita taniej. Mięsa na rożen nie prowadzimy.", powitanie: true, strona: "lewo" }],
  };
}
