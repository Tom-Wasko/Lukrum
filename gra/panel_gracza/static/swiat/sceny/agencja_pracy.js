// Scena wnętrza „agencja_pracy” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/agencja_pracy.md.
// TYTUL: Agencja pracy „Ręce do Rożna” (tablica korkowa z kandydatami) | Ludzie
// KOLEJNOSC: 80
// Krytyka M2: tablica ogłoszeń to prawdziwa tablica. Kartka = kandydat (imię, zawód, gwiazdki, pensja), paski do odrywania.
export default function (R) {
  const YP = 400, K = [["Mehmet Y.", "Kucharz", 3, "6 975"], ["Ola W.", "Kasjerka", 2, "5 530"], ["Staszek B.", "Kucharz", 2, "5 560"], ["Iga N.", "Kasjerka", 1, "4 900"],
    ["Tomek R.", "Kucharz", 1, "4 950"], ["Basia K.", "Kasjerka", 3, "6 400"], ["Wojtek P.", "Kucharz", 2, "5 700"]];
  return {
    id: "agencja_pracy", tytul: "Agencja pracy „Ręce do Rożna”", adres: "Miasteczko akademickie, Sławinek", opis: "Hol uczelni z tablicą korkową pełną kartek z kandydatami, gablotą ogłoszeń drużyny, okienkiem agencji i drzwiami headhuntera.",
    rysuj: (R) => {
      let s = R.sciana() + R.lamperia(300, YP, "color-mix(in srgb, var(--uwaga) 30%, var(--g-sciana2))") + R.podloga("lastryko", YP) + R.lampa(350, 20) + R.lampa(990, 20);
      // tablica korkowa: kartki kandydatów
      s += `<rect class="k3" x="50" y="60" width="600" height="300" fill="var(--g-drewno)"/><rect class="k" x="62" y="72" width="576" height="276" fill="var(--g-drewno2)"/>` + R.t(350, 96, "KANDYDACI TEGO TYGODNIA", 15, { ls: 2 });
      K.forEach(([imie, zaw, gw, p], i) => { const x = 78 + (i % 4) * 140, y = 108 + Math.floor(i / 4) * 118, ob = [-2, 1.5, -1, 2, 1, -2, 1.5][i];
        s += `<g transform="rotate(${ob} ${x + 60} ${y + 52})"><rect class="k1" x="${x}" y="${y}" width="124" height="104" fill="var(--g-biel)"/><circle cx="${x + 62}" cy="${y + 6}" r="4" fill="${i % 2 ? "var(--akcent)" : "var(--akcent-2)"}"/>`
          + R.t(x + 62, y + 28, imie, 14, { fill: "var(--g-czern)", f: "gruby", w: 112 }) + R.t(x + 62, y + 46, zaw, 12.5, { fill: "var(--g-czern)", w: 112 }) + R.t(x + 62, y + 63, "★".repeat(gw) + "☆".repeat(3 - gw), 14, { fill: "var(--g-czern)", f: "tekst" }) + R.t(x + 62, y + 80, `${p} zł`, 13, { fill: "var(--g-czern)", f: "tekst", bez: true })
          + Array.from({ length: 7 }, (_, k) => `<path d="M${x + 15.5 + k * 15.5} ${y + 86}v18" stroke="var(--g-czern)" opacity=".5"/>`).join("") + (i === 3 ? `<path d="M${x + 6} ${y + 20}l112 60" stroke="var(--strata)" stroke-width="3"/>` + R.t(x + 62, y + 60, "ZAJĘTE", 16, { fill: "var(--strata)", f: "gruby" }) : "") + `</g>`; });
      // gablota „Praca od zaraz” (ogłoszenia drużyny)
      s += `<rect class="k3" x="690" y="90" width="170" height="250" fill="var(--g-metal2)"/><rect class="k" x="700" y="124" width="150" height="206" fill="var(--g-szklo)" opacity=".6"/>` + R.t(775, 114, "PRACA OD ZARAZ", 13, { fill: "var(--g-biel)", ls: 1 })
        + R.kartka(712, 140, 126, 70, ["SZUKAMY", "kucharza ★★", "Wasz kebab"], -2, 12) + R.kartka(716, 230, 120, 60, ["KASJER", "na weekendy"], 2, 12);
      // okienko agencji i drzwi headhuntera
      s += R.osobaZa("bywalec-dulska", 985, 324, 452, 0.98) + R.szyba(900, 196, 170, 124) + R.tabliczka(985, 148, 196, "Agencja", "szukamy za Ciebie") + R.lada(890, 320, 190, 100) + R.telefon(1030, 320, "var(--g-czern)");
      s += R.drzwi(1104, 170, 90, 230, { typ: "matowa" }) + R.tabliczka(1149, 132, 112, "HEADHUNTER");
      // pierwszy plan: studenci czytają ogłoszenia, ławka, rower
      s += R.osoba("gosc-student", 210, 606, 0.8, "zwykla") + R.osoba("bywalec-jozio", 470, 606, 0.8, "dobra") + R.lawka(640, 604, 150) + R.kosz(830, 566);
      return s;
    },
    punkty: [
      { x: 44, y: 54, w: 612, h: 312, et: "Kandydaci", stan: "!", opisStanu: "w lokalu brakuje kasjera", teczka: { tytul: "Kandydaci tygodnia", okruszek: "tablica ogłoszeń", zakladki: ["Kandydaci", "Twoje oferty"], wstep: "Kto pierwszy złoży ofertę, ten ma pracownika. Pensja poniżej oczekiwań psuje nastrój.",
        pola: [["Mehmet Y., kucharz ★★★", "6 975 zł", "umowa ▾ · stanowisko: kuchnia 1 ▾"], ["Ola W., kasjerka ★★", "5 530 zł"], ["Staszek B., kucharz ★★", "5 560 zł"]], decyzje: ["zatrudnij"], ekran: "rynek_pracy" } },
      { x: 684, y: 84, w: 182, h: 262, et: "Twoje ogłoszenia", teczka: { tytul: "Kogo szukasz", okruszek: "gablota", wstep: "Gdy wybrany kandydat pójdzie do innej firmy, gra zatrudni najbardziej podobnego do tego wzoru.", pola: [["Zawód", "Kucharz ▾"], ["Gwiazdki", "★★ ▾"]], decyzje: ["zatrudnij"], ekran: "rynek_pracy (zastępca)" } },
      { x: 884, y: 140, w: 202, h: 286, et: "Agencja", teczka: { tytul: "Zleć szukanie agencji", okruszek: "okienko agencji", wstep: "Agencja znajdzie pracownika spoza tablicy, za prowizję.", pola: [["Kogo szukać", "Kasjer ★★ ▾"], ["Prowizja agencji", "wg cennika"]], decyzje: ["zatrudnij"], ekran: "rynek_pracy (kanał agencja)" } },
      { x: 1094, y: 160, w: 110, h: 246, et: "Headhunter", gdzie: "prawy-brzeg", teczka: { tytul: "Podkup pracownika", okruszek: "drzwi headhuntera", wstep: "Oferta dla pracownika innej firmy. Rywal może odpowiedzieć kontrofertą.", pola: [["Pracownik rywala", "wybierz ▾"], ["Twoja oferta", "7 200 zł"]], decyzje: ["podkup", "kontroferty"], ekran: "rynek_pracy (headhunter)" } },
      { x: 600, y: 520, w: 230, h: 86, et: "Grafik i pensje", gdzie: "gora", odsyla: { kto: "Pracownica agencji", tekst: "Grafik i pensje zatrudnionych ustawia się u siebie, na zapleczu lokalu.", stan: "W zespole: 3 osoby", miejsce: "Mój kebab" } },
    ],
    osoby: [{ x: 985, stopy: 452, s: 0.98, h: 120, imie: "Pracownica agencji", tekst: "Dobrych rąk do rożna jest mało. Kto pierwszy zerwie pasek, ten ma pracownika.", powitanie: true, strona: "lewo" }],
  };
}
