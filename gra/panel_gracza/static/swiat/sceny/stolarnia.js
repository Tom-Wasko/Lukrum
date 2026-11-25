// Scena wnętrza „stolarnia” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/stolarnia.md.
// TYTUL: Stolarnia „Lada i Syn” (warsztat: lada w budowie, gotowe stanowiska) | Park handlowy
// KOLEJNOSC: 62
// Stanowiska kuchni i kasy (decyzja `stanowiska`: pakiet 0–5 kuchni i 0–5 kas, najwyżej tyle, ile wolnych miejsc w lokalu).
export default function (R) {
  const YP = 400;
  return {
    id: "stolarnia", tytul: "Stolarnia „Lada i Syn”", adres: "ul. Krochmalna, Za Cukrownią", opis: "Warsztat stolarski: lada w budowie na kozłach, ściana z narzędziami, gotowe stanowisko kuchenne z okapem i lada kasowa z metkami.",
    rysuj: (R) => {
      let s = R.sciana("color-mix(in srgb, var(--g-rudy) 35%, var(--g-sciana))") + Array.from({ length: 9 }, (_, r) => `<path d="M0 ${r * 44 + 22}h1220" stroke="var(--tusz)" opacity=".13"/>`).join("") + R.podloga("parkiet", YP, "var(--g-drewno2)") + R.lampa(300, 30) + R.lampa(760, 30);
      // okno warsztatowe, tablica z narzędziami
      s += `<rect class="k3" x="50" y="80" width="250" height="200" fill="var(--g-niebo)"/>` + [1, 2, 3, 4].map((i) => `<path class="k" d="M${50 + i * 50} 80v200"/>`).join("") + [1, 2, 3].map((i) => `<path class="k" d="M50 ${80 + i * 50}h250"/>`).join("");
      s += `<rect class="k3" x="340" y="80" width="230" height="210" fill="var(--g-drewno2)"/>` + `<path class="k" d="M360 110h120l10 20h-130z" fill="var(--g-metal)"/><rect class="k" x="480" y="104" width="40" height="34" rx="4" fill="var(--g-drewno)"/>`
        + `<rect class="k" x="362" y="160" width="90" height="26" rx="4" fill="var(--g-drewno)"/><rect class="k1" x="392" y="186" width="30" height="8" fill="var(--g-metal)"/>` + `<path class="k" d="M480 160v100M480 160h60" stroke-width="5" stroke="var(--g-metal)"/>` + `<path class="k" d="M370 220l60 50M430 220l-60 50" stroke-width="5" stroke="var(--g-metal)"/>` + R.kartka(500, 196, 62, 80, ["2026", "XI"], 2, 14);
      // lada w budowie na kozłach
      s += `<path class="k" d="M420 400l30-60M480 400l-30-60M780 400l30-60M840 400l-30-60" stroke-width="6" stroke="var(--g-drewno)"/>` + `<rect class="k3" x="400" y="280" width="460" height="64" fill="var(--g-drewno2)"/><rect class="k3" x="400" y="280" width="230" height="64" fill="var(--g-drewno)"/><rect class="k" x="392" y="268" width="476" height="14" fill="var(--g-drewno)"/>`
        + `<rect class="k" x="560" y="246" width="70" height="22" rx="4" fill="var(--g-drewno)"/><rect class="k1" x="584" y="264" width="24" height="6" fill="var(--g-metal)"/>` + Array.from({ length: 12 }, (_, i) => `<path class="k1 bez" d="M${440 + i * 34} ${396 + (i % 3) * 5}q8-10 16 0t-6 6" stroke="var(--g-drewno)"/>`).join("");
      // gotowe stanowiska z metkami
      s += `<rect class="k3" x="900" y="250" width="150" height="150" fill="var(--g-metal)"/><rect class="k" x="892" y="240" width="166" height="14" fill="var(--g-metal2)"/><path class="k" d="M920 150h110l24 50h-158z" fill="var(--g-metal2)"/><rect class="k" x="960" y="110" width="30" height="40" fill="var(--g-metal2)"/>` + R.cenowka(912, 300, "STANOWISKO KUCHNI", 128);
      s += R.lada(1080, 290, 110, 110, { panele: false }) + R.cenowka(1076, 330, "STANOWISKO KASY", 118);
      // stolarz, pies na trocinach, sterta desek
      s += R.osoba("budowlaniec", 820, 606, 0.9) + [0, 1, 2, 3].map((i) => `<rect class="k" x="${80 + i * 6}" y="${560 - i * 16}" width="240" height="16" fill="var(--g-drewno)"/>`).join("")
        + `<ellipse class="k" cx="1010" cy="580" rx="60" ry="20" fill="var(--g-skora2)"/><circle class="k" cx="1066" cy="566" r="16" fill="var(--g-skora2)"/><path class="k" d="M1072 552l10-12 2 16z" fill="var(--g-drewno)"/><circle cx="1070" cy="566" r="2" fill="var(--g-czern)"/>`;
      s += R.stosSkrzynek(1100, 604, 3, 80, "var(--g-drewno2)") + R.pojemnik(60, 600);
      return s;
    },
    punkty: [
      { x: 886, y: 104, w: 312, h: 302, et: "Nowe stanowiska", gdzie: "prawy-brzeg", teczka: { tytul: "Zamów stanowiska", okruszek: "gotowe stanowiska", wstep: "Stanowisko to miejsce pracy jednej osoby: blat w kuchni albo lada z kasą. Bez stanowiska nie postawisz sprzętu ani nie zatrudnisz człowieka.",
        pola: [["Stanowiska kuchni", "+1 ▾", "wolne miejsca w lokalu: 1"], ["Stanowiska kasy", "+0 ▾", "wolne miejsca w lokalu: 0"]], decyzje: ["stanowiska"], ekran: "stanowiska" } },
      { x: 334, y: 74, w: 242, h: 222, et: "Cennik i terminy", teczka: { tytul: "Cennik stolarni", okruszek: "tablica z narzędziami", wstep: "Ile kosztuje stanowisko i kiedy będzie gotowe: cena i termin są na ekranie „Nowe stanowiska”, przy zamawianiu.", pola: [["Stanowisko kuchni", "wg katalogu"], ["Stanowisko kasy", "wg katalogu"], ["Montaż", "od następnego tygodnia"]], ekran: "–" } },
      { x: 390, y: 240, w: 480, h: 170, et: "Sprzęt", odsyla: { kto: "Stolarz", tekst: "Ja robię ladę i blat. Rożen i kasę na nie kupuje się w Parku handlowym.", stan: "W lokalu: 1 stanowisko kuchni, 1 kasy", miejsce: "Hurtownia sprzętu" } },
    ],
    osoby: [{ x: 820, stopy: 606, s: 0.9, imie: "Stolarz", tekst: "Lada na wymiar, w tydzień. Tylko proszę najpierw policzyć, ilu ludzi ma przy niej stanąć.", powitanie: true }],
  };
}
