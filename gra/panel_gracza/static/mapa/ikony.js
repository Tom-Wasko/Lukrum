// Grafiki nowej mapy. Dwa zestawy, oba własne (żadna nie odtwarza cudzego logo – marki rozróżnia podpis):
//   ikona(nazwa)  – kreskowe ikony interfejsu 24×24 w `currentColor` (pasek skrótów, przyciski), jak static/grafiki/ikony/;
//   zeton(nazwa)  – żetony 40×40 jak z planszówki z PRL-u: tekturowy krążek albo kwadrat z grubym brzegiem,
//                   na nim piktogram budynku w płaskim druku w kilku kolorach (kolory w mapa.css ze zmiennych
//                   palety): m mur, j jasny, d dach, n dach 2, b cegła, k ochra, w szyba, z zieleń, u żółty,
//                   c czarny, f kolor firmy, x sama kreska; tektura: zb bok, zf lico, zr ramka druku.
//                   Punkty orientacyjne nie mają tektury – są „nadrukowane” wprost na planszy.

// --- ikony interfejsu ---
const K = {
  bank: "M3 10l9-6l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18",
  dostawca: "M2 7h11.5v9H2zM13.5 10h4l3.5 3.5V16h-7.5M4.6 18.6a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0M15.4 18.6a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0",
  lokal: "M3.5 9l1.5-5h14l1.5 5M3.5 9a2.85 2.85 0 0 0 5.67 0a2.85 2.85 0 0 0 5.66 0a2.85 2.85 0 0 0 5.67 0M5 12.5V20h14v-7.5M10 20v-4.5h4V20",
  raport: "M4 20.5V4M4 20.5h16M8 16v-4M12 16V8M16 16v-6",
  wyslij: "M3 11l18-8l-7 18l-3-7z",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  calosc: "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5",
};

export function ikona(nazwa, rozmiar = 24) {
  return `<svg viewBox="0 0 24 24" width="${rozmiar}" height="${rozmiar}" aria-hidden="true" focusable="false"><path d="${K[nazwa] || K.lokal}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// --- pionki ---
const R = (x, y, w, h, k, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"${rx ? ` rx="${rx}"` : ""} class="${k}"/>`;
const P = (pkt, k) => `<polygon points="${pkt}" class="${k}"/>`;
const C = (x, y, r, k) => `<circle cx="${x}" cy="${y}" r="${r}" class="${k}"/>`;
const D = (d, k = "x") => `<path d="${d}" class="${k}"/>`;
const LUK = (x, w, y, k = "c") => D(`M${x} 35v-${35 - y - w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0v${35 - y - w / 2}z`, k);   // brama z łukiem do ziemi

const Z = {
  // finanse i urzędy
  bank: P("4,17 20,6 36,17", "d") + R(4, 17, 32, 3, "m") + [7, 14, 22, 29].map((x) => R(x, 20, 4, 12, "j")).join("") + R(3, 32, 34, 3, "m") + C(20, 12.5, 2.2, "u"),
  kamienica: R(3, 14, 11, 21, "m") + P("3,14 8.5,7 14,14", "d") + R(14, 11, 12, 24, "j") + P("14,11 16.5,11 16.5,7 23.5,7 23.5,11 26,11", "n")
    + R(26, 15, 11, 20, "m") + P("26,15 31.5,9 37,15", "d") + R(5.5, 18, 6, 4, "w") + R(5.5, 26, 6, 5, "w") + R(17, 14, 6, 4, "w") + R(17, 21, 6, 4, "w")
    + R(28.5, 19, 6, 4, "w") + LUK(17.5, 5, 28) + R(27.5, 27, 8, 4, "u"),
  biurowiec: R(10, 4, 16, 31, "w") + D("M10 10h16M10 16h16M10 22h16M10 28h16M15.3 4v31M20.6 4v31M18 4V1") + R(26, 20, 10, 15, "m") + R(28.5, 23, 5, 3, "w") + R(28.5, 29, 5, 6, "c"),
  urzad: R(5, 18, 30, 17, "m") + R(15, 9, 10, 9, "m") + P("13,9 20,4 27,9", "d") + C(20, 13.5, 2.4, "j") + D("M20 12.2v1.3h1.1") + R(8, 22, 4, 5, "w") + R(28, 22, 4, 5, "w")
    + R(17, 26, 6, 9, "c") + D("M20 4V0.8") + P("20,0.8 25,2 20,3.2", "d"),
  sanepid: R(6, 14, 28, 21, "m") + P("4,14 20,7 36,14", "n") + D("M18 16h4v3.5h3.5v4H22V27h-4v-3.5h-3.5v-4H18z", "d") + R(16.5, 29.5, 7, 5.5, "c"),
  poczta: R(5, 15, 30, 20, "u") + P("3,15 20,8 37,15", "d") + R(12, 18.5, 16, 10, "j") + D("M12 18.5l8 6l8-6") + R(17, 30, 6, 5, "c"),
  nieruchomosci: R(6, 18, 20, 17, "m") + P("3,19 16,7 29,19", "d") + R(13, 26, 6, 9, "k") + R(8, 22, 3.5, 3.5, "w") + R(21, 22, 3.5, 3.5, "w") + D("M33 35V18") + R(28, 12, 10, 7, "j") + D("M30.5 15.500h5"),
  praca: D("M8 35V10M32 35V10") + R(5, 8, 30, 19, "k") + R(8, 11, 7, 8, "j") + R(17, 10.5, 6, 6, "u") + R(25, 12, 7, 9, "j") + R(17, 19, 6, 6, "j") + P("3,8 20,3 37,8", "d"),
  lichwiarz: R(6, 10, 28, 25, "b") + P("4,10 20,4 36,10", "d") + LUK(12, 16, 14) + C(20, 27, 3.5, "u") + D("M20 25.3v3.4"),
  detektyw: R(11, 12, 18, 23, "m") + P("9,12 20,3 31,12", "c") + R(15, 16, 10, 7, "u") + C(19, 27, 3.2, "w") + D("M21.300 29.300l3.200 3.200"),
  // zaopatrzenie i sklepy
  hurt: R(4, 17, 32, 18, "m") + P("4,17 4,11 12,17 12,11 20,17 20,11 28,17 28,11 36,17", "n") + R(8, 23, 13, 12, "c") + R(25, 27, 8, 8, "k") + D("M25 31h8M29 27v8"),
  dyskont: R(5, 16, 30, 19, "m") + P("3,16 6,9 34,9 37,16", "d") + D("M11 9l-1.500 7M17 9l-.800 7M23 9l.800 7M29 9l1.500 7") + R(8, 20, 10, 8, "w") + R(22, 20, 8, 15, "c"),
  piekarnia: R(26, 7, 4, 8, "m") + D("M28 5c-1.500-1.500 1.500-2.500 0-4") + R(7, 17, 26, 18, "m") + P("4,18 20,6 36,18", "d") + D("M12 31v-3c0-4.500 16-4.500 16 0v3z", "u") + D("M16 25.500l1 2.500M20 25l1 2.500M24 25.500l1 2.500"),
  mieso: R(27, 7, 6, 28, "b") + D("M30 5c-2-1.500 2-2.500 0-4.200") + R(4, 20, 23, 15, "m") + P("4,20 4,14 11.500,20 11.500,14 19,20 19,14 27,20", "n") + R(8, 26, 8, 9, "c") + R(19, 25, 5, 4, "w"),
  sprzet: R(5, 15, 30, 20, "m") + R(3, 10, 34, 6, "n") + D("M13 22h14v4.500a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4z", "j") + D("M11 22h18M18 19.500h4"),
  meble: R(3, 12, 34, 23, "u") + R(3, 12, 34, 5, "n") + D("M17 26v-3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3", "j") + D("M12.500 32v-6a2.200 2.200 0 0 1 4.400 0v1.500h6.200V26a2.200 2.200 0 0 1 4.400 0v6z", "j"),
  stolarnia: R(6, 17, 28, 18, "k") + P("4,17 20,8 36,17", "d") + C(20, 26, 5.5, "j") + C(20, 26, 1.2, "c") + D("M20 19v1.500M20 31.500V33M13 26h1.500M25.500 26H27M15.100 21.100l1 1M23.900 29.900l1 1M24.900 21.100l-1 1M15.100 30.900l1-1"),
  galeria: R(4, 14, 32, 21, "m") + R(15, 5, 10, 9, "m") + C(20, 9.5, 3, "j") + D("M20 8v1.500h1.300") + R(4, 14, 32, 2.5, "d") + R(7, 19, 26, 9, "w") + D("M13.500 19v9M20 19v9M26.500 19v9") + R(16, 28, 8, 7, "c"),
  // usługi, nauka, reklama
  szkola: R(17.5, 4, 5, 5, "m") + P("16,4 20,1 24,4", "d") + R(6, 17, 28, 18, "m") + P("4,17 20,8 36,17", "d") + R(9, 21, 5, 5, "w") + R(26, 21, 5, 5, "w") + R(17, 25, 6, 10, "k"),
  reklama: D("M11 35V24M29 35V24M12 7V4M28 7V4") + R(4, 7, 32, 17, "j") + D("M11 13.500v4h3l7 3.500V10l-7 3.500z", "d") + D("M24 13a3.500 3.500 0 0 1 0 5"),
  uczelnia: R(4, 18, 32, 17, "m") + D("M12 18a8 8 0 0 1 16 0z", "n") + D("M20 10V6") + [9, 15.5, 21.5, 28].map((x) => R(x, 22, 3, 11, "j")).join("") + R(3, 33, 34, 2, "m"),
  media: R(7, 13, 26, 22, "m") + P("5,13 20,6 35,13", "n") + R(12, 17, 16, 11, "j") + D("M14.500 20h11M14.500 23h6M14.500 25.500h6M23 22.500h2.500v3H23z") + R(17, 30, 6, 5, "c"),
  // zieleń i woda
  park: R(10.5, 24, 3, 10, "k") + C(12, 17.5, 7.5, "z") + R(25.5, 26, 2.5, 8, "k") + C(27, 21, 6, "z") + D("M16 31h8M16 33.500h8M17.500 33.500v1.500M22.500 33.500v1.500"),
  szklarnia: D("M6 35V22a14 14 0 0 1 28 0v13z", "w") + D("M20 8v27M6 24h28M12.500 11.500v23.500M27.500 11.500v23.500") + D("M20 20c-3-5-7-4-7-4c0 4 3 6 7 4zM20 20c3-5 7-4 7-4c0 4-3 6-7 4z", "z"),
  woda: D("M9 26h22l-4 5H13z", "k") + D("M20 26V6") + P("21.5,8 21.5,23 32,23", "j") + P("18.5,11 18.5,23 11,23", "d") + D("M4 34.500c2.700-2 5.300-2 8 0s5.300 2 8 0s5.300-2 8 0s5.300 2 8 0"),
  // lokale drużyn
  lokal: R(7, 18, 26, 17, "m") + P("4,18 8,10 32,10 36,18", "f") + D("M13 10l-2 8M20 10v8M27 10l2 8") + R(10, 21, 13, 8, "w") + D("M16.500 21.500v7") + P("14,23 19,23 17.6,28 15.4,28", "k") + R(25, 22, 6, 13, "c"),
  dzialka: D("M3 34h34M7 34V24M13 34V24M19 34V24M25 34V24M5 27h22M5 31h22M33 34V15") + R(24, 9, 14, 8, "j") + D("M27 13h8"),
  // punkty charakterystyczne Lublina
  zamek: P("4,35 4,17 8,17 8,20 12,20 12,17 16,17 16,20 24,20 24,17 28,17 28,20 32,20 32,17 36,17 36,35", "m")
    + P("14,20 14,3 17,3 17,5.5 19,5.5 19,3 21,3 21,5.5 23,5.5 23,3 26,3 26,20", "j") + D("M20 9v4") + LUK(17, 6, 26),
  brama_krakowska: R(12, 16, 16, 19, "b") + R(14, 9, 12, 7, "m") + D("M15 9c0-4.500 10-4.500 10 0z", "n") + D("M20 5.600V2") + C(20, 12.5, 1.8, "j") + LUK(16, 8, 24),
  wieza: R(6, 26, 9, 9, "b") + R(25, 26, 9, 9, "b") + R(15, 10, 10, 25, "m") + P("14,10 20,0.5 26,10", "n") + D("M20 14v5M20 22.500v4") + LUK(17.5, 5, 29),
  ruiny: R(4, 29, 32, 6, "j") + D("M8 32h7v-3h10v3h7") + R(8, 20, 3.5, 9, "m") + R(28.5, 23, 3.5, 6, "m") + R(18, 17, 3.5, 12, "m") + D("M7 20h5.500M17 17h5.500"),
  fontanna: D("M20 30V11M20 14c-5-4-9.500 1-9.500 8M20 14c5-4 9.500 1 9.500 8M20 11c-1.500-3.500-4.500-3-5.500.500M20 11c1.500-3.500 4.500-3 5.500.500", "s") + D("M5 29h30l-3 6H8z", "m"),
  csk: R(4, 12, 32, 23, "n") + R(7, 15, 26, 5, "w") + R(7, 23, 26, 9, "w") + D("M13.500 23v9M20 23v9M26.500 23v9M6 12c1-3.500 3-3.500 4 0M13 12c1-3.500 3-3.500 4 0M30 12c1-3.500 3-3.500 4 0"),
  dworzec_bus: P("3,14 37,9 37,13 3,18", "n") + D("M8 17.500V35M32 13.500V35") + R(11, 22, 19, 10, "u", 2) + R(13, 24, 4, 3.5, "w") + R(18.5, 24, 4, 3.5, "w") + R(24, 24, 4, 3.5, "w") + C(15, 33, 1.8, "c") + C(26, 33, 1.8, "c"),
  dworzec_pkp: R(4, 18, 32, 17, "m") + R(6, 10, 7, 8, "m") + P("5,10 9.5,5 14,10", "d") + R(27, 10, 7, 8, "m") + P("26,10 30.5,5 35,10", "d") + C(20, 22.5, 2.5, "j") + LUK(8, 5, 27) + LUK(17.5, 5, 27) + LUK(27, 5, 27),
  stadion: D("M3 22v5a17 8 0 0 0 34 0v-5", "n") + D("M3 22a17 8 0 1 0 34 0a17 8 0 1 0-34 0", "m") + D("M10 22a10 4 0 1 0 20 0a10 4 0 1 0-20 0", "z") + D("M6 17V8M34 17V8") + R(4, 5, 4, 3, "u") + R(32, 5, 4, 3, "u"),
  lotnisko: R(6, 14, 5, 21, "m") + R(4, 9, 9, 5, "w") + D("M14 24l20-6c2.200-.500 3 1.500 1 2.500l-6 3l1 7l-2.500 1l-3-6l-5 2.500l.500 3l-2 1l-2-4l-3-2z", "j"),
  gorki: D("M2 35c4-12 9-14 14-6c3-9 9-12 13-3c3-3 6-1 9 9z", "z") + D("M9 27v-4M26 22v-4") + C(9, 21.5, 2.2, "z") + C(26, 16.5, 2.4, "z"),
  trybunal: R(6, 16, 28, 19, "m") + P("4,16 20,7 36,16", "j") + C(20, 12, 2, "d") + R(9, 19, 4, 5, "w") + R(18, 19, 4, 5, "w") + R(27, 19, 4, 5, "w") + R(12, 26, 16, 2, "d") + R(17, 28, 6, 7, "c") + D("M6 35l6-4M34 35l-6-4"),
  katedra: R(5, 9, 7, 26, "m") + P("4,9 8.5,2 13,9", "n") + R(28, 9, 7, 26, "m") + P("27,9 31.5,2 36,9", "n") + R(12, 15, 16, 20, "j") + P("12,15 20,9 28,15", "j") + C(20, 20, 2.5, "w") + LUK(17, 6, 26) + D("M20 9V4.500M18.300 6.200h3.400"),
  brama_grodzka: R(4, 16, 32, 19, "m") + P("2,16 6,10 34,10 38,16", "d") + LUK(14, 12, 19) + R(7.5, 20, 3.5, 4.5, "w") + R(29, 20, 3.5, 4.5, "w"),
  ratusz: R(5, 17, 30, 18, "m") + R(16, 6, 8, 11, "m") + P("15,6 20,1 25,6", "n") + C(20, 11, 2.5, "j") + D("M20 9.500V11h1.200") + R(14, 22, 12, 2, "d") + R(8, 21, 4, 5, "w") + R(28, 21, 4, 5, "w") + R(17, 27, 6, 8, "c"),
  teatr: R(5, 16, 30, 19, "m") + P("3,16 20,7 37,16", "d") + R(12, 21, 16, 14, "c") + P("12,21 18,21 13.5,31 12,31", "d") + P("28,21 22,21 26.5,31 28,31", "d") + R(7, 20, 3, 15, "j") + R(30, 20, 3, 15, "j"),
  klasztor: R(18, 4, 4, 5, "m") + P("17,4 20,1 23,4", "n") + R(4, 14, 32, 21, "m") + P("2,14 5,9 35,9 38,14", "d") + LUK(7, 6, 25) + LUK(17, 6, 25) + LUK(27, 6, 25) + R(8.5, 17, 3, 4, "w") + R(18.5, 17, 3, 4, "w") + R(28.5, 17, 3, 4, "w"),
  wiatrak: P("14,35 16,16 24,16 26,35", "k") + P("14,16 20,9 26,16", "d") + P("7,4 11,3 15.5,8.5 12,10", "j") + P("33,4 29,3 24.5,8.5 28,10", "j") + D("M20 13L7 4M20 13l13-9M20 13L8 24M20 13l12 11") + R(18, 28, 4, 7, "c"),
  most: R(2, 18, 36, 4, "m") + D("M4 18v-3h32v3M10 15v3M16 15v3M22 15v3M28 15v3M4 22c4 0 6 3 6 9M36 22c-4 0-6 3-6 9M10 31c0-7 4-9 10-9s10 2 10 9M3 34.500c2.800-2 5.700-2 8.500 0s5.700 2 8.500 0s5.700-2 8.500 0s5.700 2 8.500 0"),
  kosciol: R(14, 18, 20, 17, "m") + P("14,18 24,11 34,18", "d") + R(6, 11, 8, 24, "m") + P("5,11 10,3 15,11", "n") + D("M21 24v5M27.500 24v5M10 3V.800M8.800 1.800h2.400") + LUK(8, 4, 28),
  cmentarz: C(33, 11, 4.5, "z") + D("M33 15.500V35") + R(6, 16, 5, 19, "m") + R(27, 16, 5, 19, "m") + D("M11 20c5-6 11-6 16 0M19 15V6M15.500 9.500h7M14 35V22M17.500 35V19.500M20.500 35V19.500M24 35V22"),
};

// id budynku albo miejsca → pionek; potem rodzaj; na końcu zwykły dom (nieznane rzeczy też dostają budynek)
const WG_ID = { kamienica_bankowa: "kamienica", biurowiec_zana: "biurowiec", sanepid: "sanepid", agencja_nieruchomosci: "nieruchomosci", agencja_pracy: "praca",
  piekarnia: "piekarnia", makro: "hurt", selgros: "hurt", eurocash: "hurt", rozen: "mieso", sprzet_gastro: "sprzet", market_budowlany: "meble", stolarnia: "stolarnia",
  galeria: "galeria", ogrod_botaniczny: "szklarnia", zalew: "woda",
  zamek: "zamek", brama_krakowska: "brama_krakowska", wieza_trynitarska: "wieza", plac_po_farze: "ruiny", plac_litewski: "fontanna", csk: "csk", umcs: "uczelnia",
  kul: "uczelnia", politechnika_lubelska: "uczelnia", dworzec_metropolitalny: "dworzec_bus", arena: "stadion", lotnisko: "lotnisko", gorki_czechowskie: "gorki",
  trybunal: "trybunal", katedra: "katedra", brama_grodzka: "brama_grodzka", nowy_ratusz: "ratusz", teatr: "teatr", centrum_kultury: "klasztor", skansen: "wiatrak",
  dworzec_glowny: "dworzec_pkp", most: "most", kosciol_czwartek: "kosciol", cmentarz_lipowa: "cmentarz" };
const WG_RODZAJU = { bank: "bank", urzad: "urzad", poczta: "poczta", biuro: "biurowiec", nieruchomosci: "nieruchomosci", praca: "praca", dostawca: "dyskont", sklep: "sprzet",
  szkola: "szkola", reklama: "reklama", uczelnia: "uczelnia", media: "media", lichwiarz: "lichwiarz", ubezpieczenia: "biurowiec", detektyw: "detektyw", gielda: "bank",
  park: "park", woda: "woda", lokal: "lokal", dzialka: "dzialka" };

// kształt tektury: kwadrat (budynki), koło (lokale drużyn), brak (punkty orientacyjne nadrukowane na planszy)
const TEKTURA = {
  kwadrat: `<rect class="zb" x="1.5" y="5" width="37" height="34" rx="5"/><rect class="zf" x="1.5" y="1.500" width="37" height="34" rx="5"/><rect class="zr" x="4" y="4" width="32" height="29" rx="3"/>`,
  kolo: `<circle class="zb" cx="20" cy="21.500" r="17.500"/><circle class="zf" cx="20" cy="18.500" r="17.500"/><circle class="zr" cx="20" cy="18.500" r="15"/>`,
};
const MIESCI = { kwadrat: "translate(5.200 4.500) scale(.74)", kolo: "translate(7 5.500) scale(.65)" };

/** Żeton budynku, zespołu, lokalu albo miejsca: `id` z danych, `rodzaj` jako zapas; ksztalt: "kwadrat" | "kolo" | "" (bez tektury). */
export function zeton(id, rodzaj, ksztalt = "kwadrat") {
  const rys = Z[WG_ID[id]] || Z[WG_RODZAJU[rodzaj]] || Z[id] || Z.nieruchomosci;
  return `<svg class="zt" viewBox="0 0 40 40" aria-hidden="true" focusable="false">${TEKTURA[ksztalt] || ""}<g class="zd"${MIESCI[ksztalt] ? ` transform="${MIESCI[ksztalt]}"` : ""}>${rys}</g></svg>`;
}
