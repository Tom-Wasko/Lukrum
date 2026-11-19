// Scena wnętrza „ubezpieczyciel” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/ubezpieczyciel.md.
// TYTUL: TUW „Pod Koziołkiem” (parasol nad ladą, szafa na polisy) | Urzędy
// KOLEJNOSC: 73
// Polisy (decyzja `polisy`, funkcja urzedy; od tygodnia 4). Znak firmy: wielki parasol.
export default function (R) {
  const YP = 390;
  return {
    id: "ubezpieczyciel", tytul: "TUW „Pod Koziołkiem”", adres: "ul. Hipoteczna, Śródmieście", opis: "Kantor ubezpieczeniowy: wielki parasol nad ladą agentki, tablica z rodzajami polis, szafa pancerna, makieta kamienicy pod kloszem.",
    rysuj: (R) => {
      let s = R.sciana("color-mix(in srgb, var(--akcent-2) 14%, var(--g-sciana))") + Array.from({ length: 31 }, (_, i) => `<path d="M${i * 40 + 10} 0v290" stroke="var(--akcent-2)" opacity=".12" stroke-width="6" class="efekt"/>`).join("") + R.boazeria(290, YP) + R.podloga("parkiet", YP, "var(--g-podloga)");
      // tablica polis
      s += R.literki(50, 60, 320, 200, "POLISY", [["NA LOKAL", "300 ZŁ/MIES."], ["NA SPRZĘT", "OD 400 ZŁ"], ["OC FIRMY", "60 ZŁ/MIES."], ["", ""], ["OCHRONA OD NAST. TYG.", ""]], 14.5);
      // parasol nad ladą
      s += `<path class="k3" d="M420 200q200-190 400 0q-50-24-100 0q-50-24-100 0q-50-24-100 0q-50-24-100 0z" fill="var(--akcent-2)"/><path class="k" d="M620 30v170" stroke-width="5"/><path d="M520 200q40-110 100-150M720 200q-40-110-100-150" fill="none" stroke="var(--papier)" stroke-width="3" opacity=".7"/>` + R.t(620, 186, "TUW „POD KOZIOŁKIEM”", 15, { fill: "var(--papier)", ls: 1.2, w: 300 });
      s += R.osobaZa("bywalec-dulska", 620, 334, 462, 1.0, "dobra") + R.lada(440, 330, 360, 110, { front: "var(--g-drewno)" }) + `<path class="k" d="M480 330q0-22 16-22t16 22z" fill="var(--uwaga)"/><circle class="k1" cx="496" cy="304" r="4" fill="var(--uwaga)"/>` + R.papiery(700, 330, 4) + R.stemple(560, 330);
      // szafa pancerna, makieta kamienicy pod kloszem, kalendarz z koziołkiem
      s += R.sejf(900, 150, 190, 240) + R.t(995, 140, "POLISY KLIENTÓW", 13, { ls: 1.5, op: .8 });
      s += `<rect class="k" x="1110" y="330" width="90" height="60" fill="var(--g-drewno)"/><path class="k" d="M1120 330v-70q0-30 35-30t35 30v70z" fill="var(--g-szklo)" opacity=".5"/><path class="k" d="M1136 330v-50l19-16 19 16v50z" fill="var(--g-rudy)"/><path class="efekt" d="M1150 262q-10-14 4-22q10 10 0 22" fill="var(--uwaga)"/>`;
      s += `<rect class="k" x="1110" y="90" width="80" height="100" fill="var(--g-biel)"/><rect class="k1" x="1110" y="90" width="80" height="50" fill="var(--akcent)"/>` + R.t(1150, 122, "KOZIOŁEK", 11, { fill: "var(--papier)" }) + R.t(1150, 172, "XI", 22, { fill: "var(--g-czern)", f: "gruby" });
      // pierwszy plan: dwa fotele dla klientów, fikus, klient z teczką
      s += [300, 420].map((x) => `<path class="k" d="M${x} 600v-60q0-16 16-16h60q16 0 16 16v60z" fill="var(--akcent)"/><rect class="k" x="${x - 12}" y="556" width="20" height="44" rx="7" fill="var(--akcent)"/><rect class="k" x="${x + 84}" y="556" width="20" height="44" rx="7" fill="var(--akcent)"/>`).join("") + R.fikus(150, 600, 1.0) + R.osoba("bywalec-rzecki", 860, 606, 0.84, "zwykla");
      return s;
    },
    punkty: [
      { x: 430, y: 240, w: 380, h: 206, et: "Kup polisę", stan: "!", opisStanu: "lokal nie ma żadnej polisy", teczka: { tytul: "Polisy lokalu", okruszek: "lada agentki", wstep: "Trzy polisy. Składka liczona za miesiąc, płatna co tydzień. Polisa chroni od następnego tygodnia; ubezpieczyciel oddaje część szkody ponad franszyzę.",
        pola: [["Polisa na lokal: mury, szyby, instalacje", "nie ▾", "300 zł mies. za lokal · pokrywa 90% ponad 300 zł"], ["Polisa na sprzęt: kradzież, przepięcia, zalanie", "tak ▾", "400 zł mies. + 0,2% wartości sprzętu · pokrywa 85% ponad 200 zł"], ["OC działalności: szkody wyrządzone innym", "nie ▾", "60 zł mies. · pokrywa całość ponad 100 zł"]], decyzje: ["polisy"], ekran: "ubezpieczenia", funkcja: "urzedy" } },
      { x: 44, y: 54, w: 332, h: 212, et: "Co grozi", teczka: { tytul: "Awarie i wypadki: ile kosztują bez polisy", okruszek: "tablica", wstep: "Zdarzenia losowe z ostatnich tygodni w mieście i ich koszt.", pola: [["Awaria rożna (tydz. 5, Rożen Express)", "naprawa bez polisy: cała kwota"], ["Zalanie lokalu (tydz. 4)", "lokal zamknięty 2 dni"]], ekran: "ubezpieczenia (informacja)", funkcja: "urzedy" } },
      { x: 894, y: 124, w: 202, h: 272, et: "Twoje polisy", teczka: { tytul: "Polisy i wypłaty odszkodowań", okruszek: "szafa pancerna", wstep: "Co masz wykupione i co ubezpieczyciel już wypłacił.", pola: [["Awaria sprzętu", "aktywna od tyg. 4"], ["Wypłata: awaria frytownicy", "▲ 1 200 zł"]], ekran: "ubezpieczenia (historia)", funkcja: "urzedy" } },
    ],
    osoby: [{ x: 620, stopy: 462, s: 1.0, h: 120, imie: "Agentka", tekst: "Nieszczęścia chodzą po lokalach. Lepiej, żeby wtedy płacił ktoś inny.", powitanie: true }],
  };
}
