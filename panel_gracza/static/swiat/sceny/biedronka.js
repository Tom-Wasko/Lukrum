// Scena wnętrza „biedronka” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/biedronka.md.
// TYTUL: Biedronka (dyskont: towar w kartonach na paletach, gazetka, jedna kasa) | Zaopatrzenie
// KOLEJNOSC: 54
// Dyskont: ★ i ★★, bez mięsa, odbiór osobisty 1,5 godz., najwyżej 4 opakowania składnika dziennie, gazetka: 3 pozycje −15–35%.
// Dane: dane/dostawcy.yaml → Biedronka.
export default function (R) {
  const ID = "biedronka", YP = 400, MARKA = "var(--uwaga)";
  // paleta dyskontowa: kartony z wyciętym frontem, w środku towar, nad nią żółta cenówka
  const stoisko = (x, napis, cena, kol) => R.paleta(x, YP + 60, 170, 2, "var(--g-drewno2)") + [0, 1].map((r) => [0, 1].map((k) => `<rect class="k1" x="${x + 12 + k * 84}" y="${YP + 60 - 12 - (r + 1) * 44 + 12}" width="62" height="26" fill="${R.KOL[(kol + r + k) % 4]}"/>`).join("")).join("")
    + `<path class="k" d="M${x + 85} ${YP - 44}v-40"/>` + `<rect class="k" x="${x + 20}" y="${YP - 150}" width="130" height="66" fill="${MARKA}"/>` + R.t(x + 85, YP - 126, napis, 15, { fill: "var(--g-czern)", w: 118 }) + R.t(x + 85, YP - 96, cena, 24, { fill: "var(--g-czern)", f: "gruby", w: 118 });
  return {
    id: ID, tytul: "Biedronka", adres: "ul. Nałęczowska, Konstantynów", opis: "Niska sala dyskontu: towar w kartonach prosto na paletach, żółte tablice z cenami, kosz z okazjami, stojak z gazetką i jedna kasa z kolejką.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana)", YP) + `<rect x="0" y="0" width="1220" height="70" fill="var(--g-sciana2)"/><path class="k" d="M0 70h1220"/>` + R.podloga("plytki", YP) + [140, 500, 860].map((x) => R.swietlowka(x, 70, 200)).join("");
      s += R.szyld(140, 12, 220, 44, "BIEDRONKA", { tlo: MARKA, tekst: "var(--g-czern)", r: 24 }) + R.t(700, 44, "codziennie niskie ceny · towar przywozisz sam", 15, { f: "tekst", bez: true, op: .85 });
      // cztery stoiska paletowe pod ścianą
      s += stoisko(40, "PIECZYWO", "od 18,39", 0) + stoisko(240, "WARZYWA", "27,27", 3) + stoisko(440, "SOSY, SER", "od 35,86", 1) + stoisko(640, "NAPOJE", "44,43", 2);
      // zamrażarka z frytkami, kosz z okazjami, stojak z gazetką
      s += R.zamrazarka(850, YP + 56, 170, "FRYTKI") + R.koszOkazji(330, 590, 130, "−30%") ;
      s += `<path class="k" d="M596 600v-150M570 600h52" stroke-width="5"/><rect class="k" x="550" y="440" width="92" height="110" fill="var(--g-biel)"/><rect x="550" y="440" width="92" height="30" fill="${MARKA}" class="k"/>` + R.t(596, 461, "GAZETKA", 14, { fill: "var(--g-czern)" }) + [0, 1, 2].map((i) => `<rect class="k1" x="${558 + i * 28}" y="480" width="22" height="26" fill="${R.KOL[i]}"/>` + R.t(569 + i * 28, 530, ["−25%", "−18%", "−30%"][i], 10.5, { fill: "var(--g-czern)", f: "gruby" })).join("");
      // jedna kasa, kasjerka, kolejka dwóch osób z koszykami; kartka o limicie
      s += R.kartka(790, 106, 130, 60, ["MIĘSA NA ROŻEN", "nie prowadzimy"], -2, 13);
      s += R.osobaZa("obsluga-kasjerka", 1130, 480, 580, 0.9) + R.u("sklep-kasa", 1030, 420, 1.0) + R.kartka(1050, 300, 140, 62, ["LIMIT", "4 opakowania", "na osobę dziennie"], 2, 13);
      s += R.osoba("gosc-student", 890, 606, 0.8, "zwykla") + R.osoba("gosc-sasiadka", 780, 608, 0.8, "zwykla");
      return s;
    },
    punkty: () => [
      { x: 34, y: 240, w: 182, h: 226, et: "Pieczywo", teczka: R.zamow(ID, "Pieczywo", "paleta 1") },
      { x: 234, y: 240, w: 182, h: 226, et: "Warzywa", teczka: R.zamow(ID, "Warzywa", "paleta 2") },
      { x: 434, y: 240, w: 182, h: 226, et: "Sosy i dodatki", teczka: R.zamow(ID, "Sosy i dodatki", "paleta 3") },
      { x: 634, y: 240, w: 182, h: 226, et: "Napoje", teczka: R.zamow(ID, "Napoje", "paleta 4") },
      { x: 842, y: 364, w: 186, h: 96, et: "Frytki", gdzie: "gora", teczka: R.zamow(ID, "Mrożonki", "zamrażarka") },
      { x: 540, y: 430, w: 112, h: 174, et: "Gazetka", stan: "✓", klasa: "zy", opisStanu: "3 okazje w tym tygodniu", gdzie: "prawo", teczka: R.gazetka(ID) },
      { x: 1024, y: 290, w: 186, h: 300, et: "Koszyk tygodnia", teczka: R.koszyk(ID) },
      { x: 770, y: 96, w: 170, h: 84, et: "Mięso", gdzie: "dol", odsyla: { kto: "Kasjerka", tekst: "Mięsa na rożen u nas nie ma. Proszę jechać do hurtowni albo do Zakładów „Rożen”.", stan: "W lokalu: mięsa na 2 dni", miejsce: "Selgros" } },
    ],
    osoby: [{ x: 1130, stopy: 580, s: 0.9, h: 120, imie: "Kasjerka", tekst: "Tanio, ale wozi się samemu. I najwyżej cztery opakowania, żeby starczyło dla wszystkich.", powitanie: true, strona: "lewo" }],
  };
}
