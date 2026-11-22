// Scena wnętrza „ratusz” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/ratusz.md.
// TYTUL: Urzędy przy Szeligowskiego (sala okienek w stylu PRL) | Urzędy
// KOLEJNOSC: 70
// Jedyna scena z okienkami (krytyka U1–U4): niska lada, postacie od pasa, tabliczki instytucji, numerki, tablica z literkami.
export default function (R) {
  const YP = 400, OK = [
    { x: 130, nazwa: "Urząd miasta", postac: "gosc-sasiadka" }, { x: 470, nazwa: "Skarbowy: VAT", postac: "sprzedawca" }, { x: 810, nazwa: "Skarbowy: PIT", postac: "obsluga-kasjerka" }];
  return {
    id: "ratusz", tytul: "Urzędy przy Szeligowskiego", adres: "ul. Szeligowskiego, Czechów Południowy", opis: "Sala obsługi: trzy okienka z niską ladą (urząd miasta, skarbowy VAT, skarbowy PIT), tablica z literkami, automat z numerkami, poczekalnia.",
    rysuj: (R) => {
      let s = R.sciana() + R.lamperia(250, YP, "color-mix(in srgb, var(--g-zielen) 30%, var(--g-sciana2))", true) + R.podloga("lastryko", YP) + R.kula(80, 16, 16) + R.kula(1140, 16, 16);
      s += R.literki(380, 16, 460, 112, "SPRAWY", [["OKIENKO 1", "LOKAL I ZEZWOLENIA"], ["OKIENKO 2", "VAT"], ["OKIENKO 3", "PODATEK DOCHODOWY"]], 13) + R.zegar(920, 70, 28, 9, 55);
      s += `<circle class="k3" cx="300" cy="72" r="34" fill="var(--akcent)"/>` + R.t(300, 68, "LUBLIN", 12, { fill: "var(--papier)" }) + R.t(300, 86, "herb", 11, { fill: "var(--papier)", f: "tekst", bez: true });
      OK.forEach((o, i) => { const cx = o.x + 130;
        s += R.osobaZa(o.postac, cx, 324, 452, 1.0) + R.szyba(o.x + 10, 190, 240, 130) + R.tabliczka(cx, 150, 236, o.nazwa) + R.lada(o.x, 320, 260, 100) + R.stemple(o.x + 24, 320) + R.papiery(o.x + 190, 320, 4)
          + `<rect class="k1" x="${cx - 36}" y="296" width="72" height="24" fill="var(--g-biel)"/>` + R.t(cx, 313, `OKIENKO ${i + 1}`, 11.5, { fill: "var(--g-czern)" }); });
      s += R.kartka(516, 200, 104, 62, ["PRZERWA", "śniadaniowa", "10:00–10:15"], -3, 11);
      s += R.numerki(1128, 316, "A 017") + R.kwietnik(60, 600, 1.0) + [300, 370, 440].map((x) => R.krzeslo(x, 604, 1.25, "var(--g-drewno2)")).join("") + R.osoba("bywalec-rzecki", 700, 606, 0.86, "zwykla") + R.kosz(1150, 566);
      return s;
    },
    punkty: [
      { x: 120, y: 140, w: 280, h: 286, et: "Sprawy lokalu", teczka: { tytul: "Urząd miasta", okruszek: "okienko 1", wstep: "Rejestracja lokalu, odbiory i zezwolenia.", pola: [["Lokal przy Narutowicza: odbiór", "✓ odebrany"], ["Zezwolenie na ogródek", "złóż wniosek"]], ekran: "urzad", funkcja: "urzedy" } },
      { x: 460, y: 140, w: 280, h: 286, et: "VAT", stan: "!", opisStanu: "termin deklaracji w tym tygodniu", teczka: { tytul: "Deklaracja VAT", okruszek: "okienko 2", wstep: "Podatek należny ze sprzedaży minus naliczony z zakupów. Składasz, gdy księgujesz samodzielnie.", pola: [["VAT należny", "740 zł"], ["VAT naliczony", "512 zł"], ["Do zapłaty", "228 zł"]], decyzje: ["ksiegowosc"], ekran: "vat", funkcja: "ksiegowosc" } },
      { x: 800, y: 140, w: 280, h: 286, et: "Podatek dochodowy", teczka: { tytul: "Forma opodatkowania i zaliczki", okruszek: "okienko 3", wstep: "Zaliczka na podatek dochodowy i składka zdrowotna właściciela.", pola: [["Forma opodatkowania", "skala ▾"], ["Zaliczka za poprzedni tydzień", "310 zł"]], decyzje: ["ksiegowosc"], ekran: "podatki", funkcja: "ksiegowosc" } },
      { x: 1096, y: 250, w: 110, h: 150, et: "Higiena", gdzie: "prawy-brzeg", odsyla: { kto: "Urzędniczka", tekst: "Higiena i kontrole to nie u nas. Sanepid jest przy Uniwersyteckiej.", miejsce: "Sanepid" } },
    ],
    osoby: [{ x: 260, stopy: 452, s: 1.0, h: 120, imie: "Urzędniczka", tekst: "Numerek proszę. Bez numerka nie ma sprawy, z numerkiem też trzeba poczekać.", powitanie: true, strona: "prawo" }],
  };
}
