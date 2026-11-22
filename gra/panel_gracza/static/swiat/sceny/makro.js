// Scena wnętrza „makro” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/makro.md.
// TYTUL: Makro (hurtownia: regały paletowe, wózek widłowy, rampa) | Zaopatrzenie
// KOLEJNOSC: 50
// Hurt cash & carry: pełny asortyment ★–★★★, dowóz pon. i czw., 79 zł (darmowy od 1000 zł). Dane: dane/dostawcy.yaml → Makro.
export default function (R) {
  const ID = "makro", YP = 430;
  return {
    id: ID, tytul: "Makro", adres: "ul. Chemiczna, Bronowice", opis: "Wysoka hala hurtowni: regały paletowe do sufitu, chłodnia, wózek widłowy, stanowisko obsługi i rampa z ciężarówką.",
    rysuj: (R) => {
      let s = R.sciana("var(--g-sciana2)", YP) + R.podloga("beton", YP) + `<path class="k" d="M0 34h1220M0 34l100-34M200 34l-100-34M200 34l100-34M400 34l-100-34M400 34l100-34M600 34l-100-34M600 34l100-34M800 34l-100-34M800 34l100-34M1000 34l-100-34M1000 34l100-34M1200 34l-100-34" fill="none" stroke-width="3" opacity=".5"/>`;
      s += R.szyld(610, 44, 190, 42, "MAKRO", { tlo: "var(--akcent-2)", tekst: "var(--papier)", r: 24 });
      s += R.regalPaletowy(40, 124, 250, 306, 3, "Pieczywo i warzywa", 0) + R.regalPaletowy(320, 124, 250, 306, 3, "Sosy i napoje", 1);
      // chłodnia: drzwi z kurtyną paskową, termometr
      s += `<rect class="k3" x="610" y="150" width="210" height="280" fill="var(--g-biel)"/><rect class="k" x="630" y="186" width="170" height="244" fill="var(--g-szklo)" opacity=".6"/>` + Array.from({ length: 8 }, (_, i) => `<path d="M${640 + i * 21} 186v244" stroke="var(--g-biel)" stroke-width="12" opacity=".5"/>`).join("") + R.tabliczka(715, 106, 220, "Mięso i mrożonki", "chłodnia −18°C") + `<rect class="k1" x="784" y="158" width="26" height="20" fill="var(--g-czern)"/>` + R.t(797, 173, "−18", 11, { fill: "var(--g-biel)", f: "gruby" });
      // stanowisko obsługi (karta klienta), stos opakowań, rampa
      s += R.osobaZa("sprzedawca", 920, 364, 470, 0.95) + R.lada(850, 360, 150, 80, { panele: false, front: "var(--akcent-2)" }) + R.monitor(870, 360, 0.7) + R.kartka(930, 386, 62, 30, ["KARTA", "KLIENTA"], 0, 10);
      s += R.rampa(1030, 190, 170, 240, "Dowóz: pon. i czw.");
      // pierwszy plan: wózek widłowy z paletą, wózek platformowy, paleta opakowań
      s += R.widlak(380, 590, 1.05) + R.paleta(500, 574, 110, 1, "var(--g-biel)") + R.wozekPlatf(720, 600) + R.paleta(100, 600, 150, 2, "var(--g-biel)");
      return s;
    },
    punkty: () => [
      { x: 30, y: 84, w: 270, h: 350, et: "Pieczywo i warzywa", teczka: R.zamow(ID, ["Pieczywo", "Warzywa"], "regał 1") },
      { x: 310, y: 84, w: 270, h: 350, et: "Sosy i napoje", teczka: R.zamow(ID, ["Sosy i dodatki", "Napoje"], "regał 2") },
      { x: 600, y: 100, w: 230, h: 334, et: "Mięso i mrożonki", stan: "!", opisStanu: "mięsa w lokalu zostało na 2 dni", teczka: R.zamow(ID, ["Mięso", "Mrożonki"], "chłodnia") },
      { x: 90, y: 490, w: 170, h: 116, et: "Opakowania", gdzie: "gora", teczka: R.zamow(ID, "Opakowania", "paleta przy wejściu") },
      { x: 840, y: 250, w: 170, h: 196, et: "Koszyk tygodnia", teczka: R.koszyk(ID, "stanowisko obsługi") },
      { x: 1024, y: 146, w: 182, h: 290, et: "Dni dostaw", teczka: R.dowoz(ID) },
    ],
    osoby: [{ x: 920, stopy: 470, s: 0.95, h: 120, imie: "Obsługa hurtowni", tekst: "U nas wszystko na palety. Zamówienie powyżej tysiąca i dowóz gratis.", powitanie: true, strona: "lewo" }],
  };
}
