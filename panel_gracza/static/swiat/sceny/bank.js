// Scena wnętrza „bank” (wdrożenie z makiet: archiwum/fable-17.11/fable-wnetrza). Układ i opis: projekt.md, sceny/bank.md.
// TYTUL: Wnętrze banku (wzór dla 5 banków, parametr ?b=) | Banki i giełda
// KOLEJNOSC: 11
// SYMBOLE: wnetrze-rozen-2
// Sala operacyjna: tablica z literkami (oprocentowanie), okienko KASA (konto, terminal, debet), okienko KREDYTY (doradca),
// skarbiec (lokaty) i jeden rekwizyt banku. Liczby: dane/mapa/banki.yaml.
export default function (R) {
  const B = {
    kmicic: { nazwa: "Kmicic", znak: "K", marka: "var(--akcent)", tk: "var(--papier)", ksztalt: "wstega", lamp: "color-mix(in srgb, var(--akcent) 30%, var(--g-sciana2))", konto: "35 zł", term: "59 zł + 1,3%", debet: "8 000 zł", debOpl: "40 zł + 15%",
      tab: [["KREDYT NA START", "14,9%"], ["LOKATA 1 TYDZ.", "0,8%"], ["LOKATA 4 TYG.", "1,5%"], ["LOKATA 13 TYG.", "2,0%"], ["KONTO / MIES.", "35 ZŁ"]], kredyty: [["Kredyt na start (bez historii firmy)", "14,9%", "prowizja 1%, do 60 000 zł, spłata do 52 tygodni"]], lok: ["0,8%", "1,5%", "2,0%"],
      doradca: "Kredyt? Od ręki. O historię firmy nie pytam, ale tanio nie będzie." },
    wokulski: { nazwa: "Wokulski i S-ka", znak: "W", marka: "var(--g-tablica)", ksztalt: "prostokat", lamp: "var(--g-drewno2)", konto: "25 zł", term: "49 zł + 1,2%", debet: "10 000 zł", debOpl: "45 zł + 14%",
      tab: [["KREDYT INWESTYCYJNY", "6,9%"], ["KREDYT OBROTOWY", "10,9%"], ["LOKATA 4 TYG.", "2,0%"], ["LOKATA 13 TYG.", "2,5%"], ["KONTO / MIES.", "25 ZŁ"]], kredyty: [["Kredyt inwestycyjny pod zastaw lokalu albo sprzętu", "6,9%", "prowizja 1,5%, do 400 000 zł, do 104 tygodni, zastaw liczony po 70% wartości"], ["Kredyt obrotowy (firma z historią 4 tygodni)", "10,9%", "prowizja 2%, do 40 000 zł"]], lok: ["1,0%", "2,0%", "2,5%"],
      doradca: "Duży interes wymaga dużego kapitału. Proszę pokazać, co dają Państwo w zastaw." },
    ziemia: { nazwa: "Ziemia Obiecana", znak: "Z", marka: "var(--g-drewno)", ksztalt: "luk", lamp: "color-mix(in srgb, var(--g-mieso) 40%, var(--g-sciana2))", konto: "25 zł", term: "49 zł + 1,2%", debet: "10 000 zł", debOpl: "50 zł + 15%",
      tab: [["LEASING SPRZĘTU", "7,5%"], ["WPŁATA WŁASNA", "5%"], ["KREDYT OBROTOWY", "11,5%"], ["LOKATA 13 TYG.", "2,4%"], ["KONTO / MIES.", "25 ZŁ"]], kredyty: [["Kredyt obrotowy (firma z historią 4 tygodni)", "11,5%", "prowizja 2%, do 40 000 zł"]], lok: ["0,9%", "1,9%", "2,4%"], leasing: true,
      doradca: "Nie mają Państwo nic? To razem mamy akurat tyle, żeby wziąć rożen w leasing." },
    rzecki: { nazwa: "Oszczędności Rzeckiego", znak: "R", marka: "var(--akcent-2)", tk: "var(--papier)", ksztalt: "owal", lamp: "color-mix(in srgb, var(--akcent-2) 28%, var(--g-sciana2))", konto: "20 zł", term: "59 zł + 1,3%", debet: "5 000 zł", debOpl: "55 zł + 15%",
      tab: [["LOKATA 1 TYDZ.", "2,0%"], ["LOKATA 4 TYG.", "3,6%"], ["LOKATA 13 TYG.", "4,2%"], ["KREDYT OBROTOWY", "11,2%"], ["KONTO / MIES.", "20 ZŁ"]], kredyty: [["Kredyt obrotowy (firma z historią 4 tygodni)", "11,2%", "prowizja 2%, do 40 000 zł"]], lok: ["2,0%", "3,6%", "4,2%"],
      doradca: "Grosz do grosza. Co tydzień odłożone to co tydzień policzone." },
    soplicowo: { nazwa: "Soplicowo", znak: "S", marka: "var(--g-zielen2)", ksztalt: "prostokat", lamp: "color-mix(in srgb, var(--g-zielen) 40%, var(--g-sciana2))", konto: "0 zł", term: "0 zł + 0,79%", debet: "20 000 zł", debOpl: "80 zł + 15%",
      tab: [["KONTO / MIES.", "0 ZŁ"], ["TERMINAL / MIES.", "0 ZŁ"], ["PROWIZJA OD KART", "0,79%"], ["DEBET DO", "20 000 ZŁ"], ["KREDYT OBROTOWY", "11,8%"]], kredyty: [["Kredyt obrotowy (firma z historią 4 tygodni)", "11,8%", "prowizja 2,5%, do 40 000 zł"]], lok: ["0,8%", "1,8%", "2,2%"],
      doradca: "Gość w dom, konto bez opłat. A zabraknie grosza? Zastaw się, a postaw się – tylko każdy tydzień na minusie kosztuje." },
  };
  const id = B[R.q.get("b")] ? R.q.get("b") : "kmicic", b = B[id];
  const rekwizyt = () => id === "kmicic" ? R.plakat(990, 420, 150, 150, ["KREDYT", "w 5 minut", "bez pytań"]) + `<path class="k bez" d="M1000 570l-14 36M1130 570l14 36" stroke-width="4"/>` + `<path class="k" d="M60 30q130-26 250 4l-4 8q-120-26-244-4z" fill="var(--g-metal)"/><path class="k" d="M52 26l14 14-6 6-14-14z" fill="var(--uwaga)"/>`
    : id === "wokulski" ? `<circle class="k3" cx="1060" cy="470" r="46" fill="var(--g-szklo)"/><path class="k1" d="M1030 450q20-16 40 0t26 8M1024 484q30 12 60-4" fill="none" stroke="var(--g-zielen2)" stroke-width="5"/><path class="k bez" d="M1060 416v-10M1060 516v40M1030 600l30-44 30 44" stroke-width="4"/><path class="k bez" d="M1012 470a48 48 0 0 0 96 0" stroke-width="3"/>` + R.waga(600, 330)
    : id === "ziemia" ? `<rect class="k" x="960" y="560" width="200" height="30" fill="var(--g-metal2)"/>` + R.u("wnetrze-rozen-2", 1004, 410, 0.78) + R.kartka(1096, 470, 76, 44, ["W LEASINGU", "od 5% wpłaty"], 6, 11)
    : id === "rzecki" ? `<path class="k" d="M1010 600v-70h70v70" fill="none" stroke-width="4"/><path class="k" d="M1026 540v-90M1046 536v-70M1064 540v-84" stroke-width="4"/><path class="k" d="M1016 452q10-14 20 0M1054 458q10-14 20 0" fill="none" stroke-width="4"/>`
      + `<ellipse class="k" cx="610" cy="314" rx="26" ry="17" fill="var(--g-skora)"/><circle cx="628" cy="308" r="2.5" fill="var(--g-czern)"/><path class="k" d="M604 297h12" stroke-width="3"/><path class="k" d="M596 328v6M622 328v6"/>`
    : `<rect class="k" x="990" y="520" width="150" height="12" fill="var(--g-drewno)"/><path class="k" d="M1004 532v70M1126 532v70" stroke-width="5"/><path class="k" d="M1040 520v-22h-10q-6-40 34-44q40 4 34 44h-10v22z" fill="var(--uwaga)"/><rect class="k" x="1052" y="436" width="24" height="18" fill="var(--uwaga)"/><path class="k" d="M1098 500h14v8"/>`
      + `<path class="k bez" d="M70 36q60 50 120 0" stroke-width="8" stroke="var(--g-drewno)"/><path class="k" d="M186 30l22 4-12 16z" fill="var(--uwaga)"/>`;
  return {
    id: "bank", tytul: `Bank „${b.nazwa}”`, adres: "Pierzeja bankowa, Krakowskie Przedmieście", wroc: "Pierzeja", wrocDo: "pierzeja_bankowa.html",
    opis: `Sala operacyjna banku ${b.nazwa}: tablica oprocentowania, okienko kasy, okienko kredytów, skarbiec.`,
    warianty: [["b=kmicic", "Kmicic (kredyt na start)"], ["b=wokulski", "Wokulski i S-ka (kredyt inwestycyjny)"], ["b=ziemia", "Ziemia Obiecana (leasing, Twoje konto)"], ["b=rzecki", "Oszczędności Rzeckiego (lokaty)"], ["b=soplicowo", "Soplicowo (tanie konto, debet)"]],
    rysuj: (R) => {
      let s = R.sciana() + R.lamperia(250, 400, b.lamp, true) + R.podloga("lastryko", 400) + R.kula(250, 20, 18) + R.kula(960, 20, 18);
      s += R.literki(40, 56, 300, 178, "OPROCENTOWANIE", b.tab, 15) + R.zegar(388, 96, 30, 10, 12);
      s += R.szyld(660, 44, 400, 62, b.nazwa, { tlo: b.marka, tekst: b.tk, ksztalt: b.ksztalt, znak: b.znak });
      // skarbiec
      s += `<rect class="k3" x="940" y="130" width="240" height="270" fill="var(--g-sciana2)"/>` + R.sejf(960, 150, 200, 250) + R.tabliczka(1060, 96, 150, "Skarbiec", "lokaty");
      // obsługa za ladą, szyby, lada
      s += R.osobaZa("obsluga-kasjerka", 500, 334, 452, 1.05) + R.osobaZa("sprzedawca", 780, 334, 452, 1.05);
      s += R.szyba(410, 170, 180, 160) + R.szyba(690, 170, 180, 160) + `<rect class="k" x="590" y="170" width="100" height="160" fill="var(--g-sciana2)"/>` + R.kartka(606, 196, 68, 50, ["PRZERWA", "10:00–10:15"], -3, 11);
      s += R.tabliczka(500, 132, 150, "Kasa") + R.tabliczka(780, 132, 150, "Kredyty");
      s += R.lada(390, 330, 500, 150, { front: "var(--g-drewno2)" }) + R.stemple(430, 330) + R.papiery(820, 330, 4);
      // pierwszy plan: stolik z drukami i długopisem na łańcuszku, kwietnik, słupki ze sznurem
      s += `<rect class="k" x="70" y="470" width="190" height="12" fill="var(--g-drewno)"/><path class="k" d="M86 482v120M244 482v120" stroke-width="5"/>` + R.papiery(90, 470, 5) + `<path class="k1 bez" d="M200 470q20-40 40-10"/><path class="k" d="M236 458l8 12" stroke-width="3"/>` + R.t(165, 505, "DRUKI", 13, { op: .7 });
      s += R.kwietnik(330, 600, 1.1) + `<path class="k" d="M470 606v-74M700 606v-74" stroke-width="5"/><circle class="k" cx="470" cy="528" r="7" fill="var(--uwaga)"/><circle class="k" cx="700" cy="528" r="7" fill="var(--uwaga)"/><path class="bez" d="M470 540q115 34 230 0" stroke="var(--akcent)" stroke-width="6"/>`;
      return s + rekwizyt();
    },
    punkty: () => [
      { x: 404, y: 124, w: 192, h: 220, et: "Konto i debet", teczka: { tytul: `Konto firmowe w banku „${b.nazwa}”`, okruszek: "okienko Kasa", zakladki: ["Konto", "Terminal", "Debet"], wstep: b.moje ? "Tu jest konto Twojej firmy." : "Konto Twojej firmy jest w banku „Ziemia Obiecana”. Możesz je przenieść tutaj.",
        pola: [["Opłata za konto", `${b.konto} miesięcznie`], ["Terminal płatniczy", b.term, "abonament miesięczny + prowizja od płatności kartą"], ["Zgoda na debet", "nie ▾", `limit ${b.debet}; za tydzień na minusie: ${b.debOpl} rocznie. Bez zgody: opłata 120 zł i 19%.`], [b.moje ? "Bank konta" : "Przenieś konto do tego banku", b.moje ? "ten ✓" : "Przenieś"]], decyzje: ["bank", "debet"], ekran: "bank" } },
      { x: 684, y: 124, w: 192, h: 220, et: "Kredyty", stan: b.moje ? "!" : "", opisStanu: "rata w tym tygodniu", teczka: { tytul: "Kredyty", okruszek: "okienko Kredyty", zakladki: b.leasing ? ["Weź kredyt", "Twoje kredyty", "Leasing"] : ["Weź kredyt", "Twoje kredyty"], wstep: b.moje ? "" : "<b class=\"uwaga\">! Kredyt weźmiesz tylko w banku, w którym masz konto.</b> Najpierw przenieś konto (okienko Kasa).",
        pola: b.kredyty.concat([["Kwota", "20 000 zł"], ["Spłata", "26 tygodni", "rata co tydzień: ok. 800 zł"]]), decyzje: ["kredyty_wez", "kredyty_splac"].concat(b.leasing ? ["leasing_wez"] : []), ekran: "bank" } },
      { x: 950, y: 144, w: 220, h: 262, et: "Lokaty", gdzie: "gora", teczka: { tytul: "Lokaty", okruszek: "skarbiec", wstep: "Wolna gotówka może pracować. Zerwanie lokaty przed terminem oznacza utratę odsetek.", pola: [["Lokata na 1 tydzień", b.lok[0]], ["Lokata na 4 tygodnie", b.lok[1]], ["Lokata na 13 tygodni", b.lok[2]], ["Kwota nowej lokaty", "5 000 zł"]], decyzje: ["lokaty_zaloz", "lokaty_zerwij"], ekran: "bank" } },
      { x: 34, y: 50, w: 312, h: 190, et: "Porównaj banki", gdzie: "dol", wejscie: "pierzeja_bankowa.html" },
    ].concat(b.leasing ? [{ x: 960, y: 414, w: 220, h: 190, et: "Leasing sprzętu", gdzie: "wewn", teczka: { tytul: "Leasing sprzętu", okruszek: "stoisko leasingu", wstep: "Sprzęt kuchenny w ratach. Raty idą w koszty, a po ostatniej wykup za 1% ceny.", pola: [["Wpłata własna", "5%"], ["Oprocentowanie", "7,5%"], ["Okres", "26 albo 52 tygodnie"], ["Sprzęt", "Rożen ★★ ▾", "wybór z katalogu Parku handlowego"]], decyzje: ["leasing_wez"], ekran: "bank" } }] : []),
    osoby: [{ x: 780, stopy: 452, s: 1.05, h: 140, imie: "Doradca", tekst: b.doradca, powitanie: true, strona: "prawo" }],
    plakietki: [{ x: 20, y: 548, html: b.moje ? "<b>✓ Masz tu konto firmowe.</b>" : "Konto firmy: <b>„Ziemia Obiecana”</b> (dwie kamienice dalej)." }],
  };
}
