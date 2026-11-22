// Scena wnętrza „selgros” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/selgros.md.
// TYTUL: Selgros (hurtownia: masarnia i ściana napojów) | Zaopatrzenie
// KOLEJNOSC: 51
// Hurt: „dobre mięso i napoje”, dowóz wt. i pt., 69 zł (darmowy od 900 zł). Dane: dane/dostawcy.yaml → Selgros.
export default function (R) {
  const ID = "selgros", YP = 430;
  return {
    id: ID, dostawca: "Selgros", tytul: "Selgros", adres: "al. Jana Pawła II, Węglin Południowy", opis: "Hala hurtowni z masarnią pośrodku: lada z mięsem, haki, obok ściana zgrzewek z napojami, zamrażarki i kasa.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana)", YP) + R.podloga("plytki", YP) + R.swietlowka(150, 20, 180) + R.swietlowka(520, 20, 180) + R.swietlowka(890, 20, 180);
      s += R.szyld(130, 40, 200, 42, "SELGROS", { tlo: "var(--akcent)", tekst: "var(--papier)", r: 24 });
      s += R.regalPaletowy(40, 150, 240, 280, 2, "Pieczywo, warzywa, sosy", 2);
      // masarnia: kafelki, drążek z hakami i wiszącym mięsem, rzeźnik, lada chłodnicza z tacami
      s += `<rect class="k" x="320" y="110" width="330" height="320" fill="var(--g-biel)"/>` + Array.from({ length: 7 }, (_, i) => `<path d="M320 ${150 + i * 40}h330" stroke="var(--tusz)" opacity=".15"/>`).join("") + Array.from({ length: 8 }, (_, i) => `<path d="M${360 + i * 40} 110v320" stroke="var(--tusz)" opacity=".15"/>`).join("");
      s += R.tabliczka(485, 62, 200, "Masarnia", "mięso świeże") + `<path class="k" d="M340 142h290" stroke-width="5"/>` + [370, 440, 520, 590].map((x, i) => `<path class="k bez" d="M${x} 142v16q0 8 8 8"/><path class="k" d="M${x - 16} 168q16-8 32 0l-6 ${70 + (i % 2) * 20}q-10 12-20 0z" fill="var(--g-mieso)"/>`).join("");
      s += R.osobaZa("obsluga-kucharz", 485, 322, 470, 1.0) + R.ladaChlodnicza(330, 320, 310, 110, false) + R.waga(560, 320);
      // ściana napojów: zgrzewki do sufitu + tablica; stos opakowań
      s += R.tabliczka(790, 106, 200, "Napoje", "zgrzewki 24 szt.") + R.zgrzewki(690, 430, 4, 7) + R.paleta(910, 430, 110, 2, "var(--g-biel)");
      // kasa z taśmą i kasjerką, tablica dni dostaw
      s += R.osobaZa("obsluga-kasjerka", 1130, 400, 500, 0.95) + R.u("sklep-kasa", 1040, 330, 1.0) + R.kartka(1050, 180, 140, 70, ["DOWÓZ", "wtorek i piątek", "69 zł"], -2, 14);
      // pierwszy plan: zamrażarki skrzyniowe z mrożonkami, wózek platformowy
      s += R.zamrazarka(120, 600, 180, "MROŻONKI") + R.zamrazarka(310, 600, 180, "FRYTKI · FALAFEL") + R.wozekPlatf(640, 604);
      return s;
    },
    punkty: () => [
      { x: 30, y: 110, w: 260, h: 324, et: "Pieczywo, warzywa, sosy", teczka: R.zamow(ID, ["Pieczywo", "Warzywa", "Sosy i dodatki"], "regał") },
      { x: 316, y: 100, w: 338, h: 336, et: "Mięso", stan: "!", opisStanu: "mięsa w lokalu zostało na 2 dni", teczka: R.zamow(ID, "Mięso", "masarnia") },
      { x: 110, y: 500, w: 390, h: 104, et: "Mrożonki", gdzie: "gora", teczka: R.zamow(ID, "Mrożonki", "zamrażarki") },
      { x: 684, y: 150, w: 220, h: 286, et: "Napoje", teczka: R.zamow(ID, "Napoje", "ściana zgrzewek") },
      { x: 906, y: 320, w: 120, h: 116, et: "Opakowania", teczka: R.zamow(ID, "Opakowania", "paleta") },
      { x: 1034, y: 166, w: 176, h: 340, et: "Koszyk tygodnia", teczka: R.koszyk(ID) },
    ],
    osoby: [{ x: 485, stopy: 470, s: 1.0, h: 130, imie: "Rzeźnik", tekst: "Mięso mam najlepsze w mieście. Dowóz we wtorki i piątki, proszę liczyć z zapasem.", powitanie: true }],
  };
}
