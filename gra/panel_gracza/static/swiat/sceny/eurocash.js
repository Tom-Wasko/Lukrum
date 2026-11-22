// Scena wnętrza „eurocash” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/eurocash.md.
// TYTUL: Eurocash (hurtownia: góra skrzynek z warzywami, wiadra sosów, biuro zamówień) | Zaopatrzenie
// KOLEJNOSC: 52
// Hurt: „najtańsze warzywa i sosy, bez dań wege”, dowóz pon., śr., pt., 89 zł (darmowy od 1200 zł). Dane: dane/dostawcy.yaml → Eurocash.
export default function (R) {
  const ID = "eurocash", YP = 420;
  const wiadro = (x, y, kol) => `<path class="k" d="M${x} ${y - 44}h44l-5 44h-34z" fill="${kol}"/><path class="k bez" d="M${x + 2} ${y - 44}q20-22 40 0"/><rect class="k1" x="${x + 10}" y="${y - 30}" width="24" height="14" fill="var(--g-biel)"/>`;
  return {
    id: ID, tytul: "Eurocash", adres: "ul. Łęczyńska, Bronowice", opis: "Prosty magazyn hurtowni: stosy skrzynek z warzywami i waga, regał z wiadrami sosów, okienko biura zamówień i rampa.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana)", YP) + R.lamperia(300, YP, "var(--g-sciana2)") + R.podloga("beton", YP) + R.lampa(240, 30) + R.lampa(640, 30) + R.lampa(1010, 30);
      s += R.szyld(150, 40, 220, 42, "EUROCASH", { tlo: "var(--g-zielen2)", tekst: "var(--g-biel)", r: 24 });
      // warzywa: stosy skrzynek różnej wysokości, tablica z ceną pisaną kredą, waga
      s += R.plakat(50, 110, 210, 70, ["WARZYWA", "najtaniej w mieście"], "var(--g-tablica)", 18) + R.skrzynki(40, YP, 5) + R.skrzynki(140, YP, 7) + R.skrzynki(240, YP, 4) + R.skrzynki(340, YP, 6);
      // sosy: niski regał paletowy z wiadrami
      s += R.tabliczka(560, 100, 200, "Sosy i dodatki", "wiadra 5 kg") + `<rect class="k" x="460" y="150" width="9" height="270" fill="var(--akcent-2)"/><rect class="k" x="651" y="150" width="9" height="270" fill="var(--akcent-2)"/>`
        + [0, 1, 2].map((r) => `<rect class="k" x="460" y="${230 + r * 90}" width="200" height="8" fill="var(--uwaga)"/>` + [0, 1, 2, 3].map((k) => wiadro(470 + k * 46, 230 + r * 90, R.KOL[(k + r) % 4])).join("")).join("");
      // reszta towaru: palety przy ścianie
      s += R.tabliczka(790, 140, 180, "Pozostały towar", "mięso, pieczywo, napoje") + R.paleta(700, YP, 110, 3, "var(--g-drewno2)") + R.paleta(820, YP, 110, 2, "var(--g-biel)") + R.zgrzewki(826, YP - 100, 2, 2);
      // biuro zamówień: okienko w ściance, telefon, magazynier w głębi; rampa z trzema kartkami dni
      s += R.rampa(990, 170, 200, 250, "") + [["PON.", 1000], ["ŚR.", 1064], ["PT.", 1128]].map(([d, x]) => R.kartka(x, 116, 54, 34, [d], 0, 15)).join("");
      // pierwszy plan: waga platformowa, biurko zamówień z telefonem i zeszytem, magazynier
      s += R.waga(430, 560) + R.osoba("sprzedawca", 640, 606, 0.85) + R.biurko(720, 500, 220, 100) + R.telefon(750, 500, "var(--g-czern)") + R.papiery(830, 500, 5) + R.t(830, 566, "ZAMÓWIENIA", 15, { ls: 2 }) + R.wozekPlatf(190, 604);
      return s;
    },
    punkty: () => [
      { x: 30, y: 100, w: 410, h: 324, et: "Warzywa", teczka: R.zamow(ID, "Warzywa", "skrzynki") },
      { x: 450, y: 96, w: 220, h: 328, et: "Sosy i dodatki", teczka: R.zamow(ID, "Sosy i dodatki", "regał z wiadrami") },
      { x: 690, y: 136, w: 256, h: 288, et: "Pozostały towar", teczka: R.zamow(ID, ["Mięso", "Mrożonki", "Pieczywo", "Napoje", "Opakowania"], "palety") },
      { x: 712, y: 460, w: 240, h: 144, et: "Koszyk tygodnia", gdzie: "gora", teczka: R.koszyk(ID, "biurko zamówień") },
      { x: 984, y: 110, w: 212, h: 314, et: "Dni dostaw", teczka: R.dowoz(ID) },
    ],
    osoby: [{ x: 640, stopy: 606, s: 0.85, imie: "Magazynier", tekst: "Warzywa i sosy mamy najtańsze. Falafela nie prowadzimy, proszę nie pytać.", powitanie: true }],
  };
}
