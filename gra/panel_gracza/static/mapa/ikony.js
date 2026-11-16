// Grafiki nowej mapy. Dwa zestawy, oba własne (żadna nie odtwarza cudzego logo – marki rozróżnia podpis):
//   ikona(nazwa)  – kreskowe ikony interfejsu 24×24 w `currentColor` (pasek skrótów, przyciski), jak static/grafiki/ikony/;
//   zeton(nazwa)  – żetony 40×40 jak z planszówki z PRL-u: tekturowy krążek albo kwadrat z grubym brzegiem,
//                   na nim piktogram (przedmiot mówiący, co się tam załatwia; budynek tylko dla punktów orientacyjnych) w płaskim druku w kilku kolorach (kolory w mapa.css ze zmiennych
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
const E = (x, y, rx, ry, k) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" class="${k}"/>`;
const LUK = (x, w, y, k = "c") => D(`M${x} 35v-${35 - y - w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0v${35 - y - w / 2}z`, k);   // brama z łukiem do ziemi

const Z = {
  // Miejsca, w których coś się załatwia, rysujemy jako przedmiot mówiący, co tam jest (moneta, pieczątka, koszyk…);
  // budynki zostają tylko dla punktów orientacyjnych Lublina. Przedmioty stoją na planszy bez tektury, więc są pełne
  // i krępe (bez cienkich kresek), wypełniają pole 40×40 i opierają się o dół (y ≈ 36), gdzie leży ich cień.
  // pieniądze
  monety: R(2, 7, 26, 16, "z", 2) + C(15, 15, 4.5, "j") + D("M5.5 10.5h3.5M21 19.5h3.5") + D("M16 21v12a10 3.3 0 0 0 20 0V21z", "u")
    + D("M16 25a10 3.3 0 0 0 20 0M16 29a10 3.3 0 0 0 20 0") + E(26, 21, 10, 3.3, "u") + E(26, 21, 5.5, 1.6, "k"),
  worek: D("M14.5 12C4 17 2 35 12.5 36h15c10.5-1 8.5-19-2-24z", "k") + D("M14.5 12L11.5 4c3 1.5 5.5-1 8.5 0c3-1 5.5 1.5 8.5 0L25.5 12z", "k")
    + R(12.5, 10.5, 15, 3.5, "c", 1.7) + C(20, 25.5, 6.5, "u") + C(20, 25.5, 3.8, "x"),
  wykres: R(2, 4, 36, 25, "c", 2.5) + R(5, 7, 30, 19, "j") + D("M10.5 9.5v14M17 11.5v12M23.5 10v12M30 8.5v9")
    + R(9, 13, 3.5, 7, "z") + R(15.25, 15, 3.5, 5.5, "d") + R(21.75, 13, 3.5, 6.5, "d") + R(28.25, 10.5, 3.5, 5.5, "z") + R(16.5, 29, 7, 4, "m") + R(10, 33, 20, 3.5, "m", 1.5),
  parasol: D("M18.6 20h2.8v11.5c0 5.5-9 5.5-9 0v-1h2.8v1c0 2 3.4 2 3.4 0z", "c")
    + D("M2 21C2 11 10 4 20 4s18 7 18 17c-2.900-2.400-6.100-2.400-9 0c-2.900-2.400-6.100-2.400-9 0c-2.900-2.400-6.100-2.400-9 0c-2.900-2.400-6.100-2.400-9 0z", "d")
    + D("M20 4c-5 4-7 11-9 17M20 4c5 4 7 11 9 17") + R(18.8, 1, 2.4, 3.5, "c", 1),
  lupa: P("22,26.5 26.5,22 37.5,33 33,37.5", "b") + C(16, 16, 13, "c") + C(16, 16, 9.5, "w") + D("M9.5 13a7 7 0 0 1 5.5-5.5", "s"),
  // urzędy i papiery
  pieczatka: P("1,36 7,24 39,24 33,36", "m") + E(12, 30, 6, 2.5, "d") + R(17, 18.5, 18, 5, "d", 1.5) + R(19.5, 13, 13, 6, "k", 1.5)
    + R(23.5, 7.5, 5, 6, "k") + E(26, 5.5, 6.5, 4, "k"),
  lista: R(5, 5, 30, 32, "k", 3) + R(8.5, 9, 23, 25, "m") + R(14, 2.5, 12, 5.5, "c", 2)
    + [12.5, 19.5, 26.5].map((y) => R(11.5, y, 5, 5, "j")).join("") + D("M12.3 15l1.7 1.7l3.300-4M12.3 22l1.7 1.7l3.300-4", "s")
    + R(19.5, 13.5, 9.5, 2.6, "c", 1) + R(19.5, 20.5, 9.5, 2.6, "c", 1) + R(19.5, 27.5, 9.5, 2.6, "c", 1),
  koperta: R(2, 8, 36, 27, "j", 2) + D("M2 34l14-11M38 34L24 23") + D("M2.5 9l17.5 14l17.5-14", "m") + C(20, 23.5, 5, "d") + R(17.5, 22.3, 5, 2.4, "u", 1),
  klucz: R(16, 10.5, 22, 6.5, "u", 1) + D("M28.5 16.5v7.5h4.5v-7.5zM21.5 16.5v5h4.5v-5z", "u") + C(11, 14, 9.5, "u") + C(11, 14, 3.6, "m")
    + P("4,24.5 15.5,23 17,35.5 5.5,37", "j") + C(8.3, 27.7, 1.4, "c") + D("M10 22.5l-1.7 5.2"),
  // praca, nauka, media, reklama
  kalkulator: R(7, 2, 26, 35, "n", 3.5) + R(10.5, 5.5, 19, 7.5, "w", 1.2) + R(19, 8, 8, 2.5, "c", .8)
    + [16, 21, 26].map((y) => [10.5, 17.5, 24.5].map((x) => R(x, y, 5, 3.6, "j", 1)).join("")).join("")
    + R(10.5, 31, 12, 3.6, "j", 1) + R(24.5, 31, 5, 3.6, "d", 1),
  czapka: R(9.5, 23, 21, 12, "n", 1.5)
    + D("M10.5 24c-8 0-9-11.5-1.500-12.500c-.5-7.500 10.5-10 13-3.5c3.500-6.500 13.500-3.500 12.500 4c7 1 6.500 12-1.500 12z", "m")
    + D("M15.5 24v11M20 24v11M24.5 24v11"),
  dyplom: R(6, 7, 28, 17, "m") + E(6, 15.5, 3, 8.5, "j") + E(34, 15.5, 3, 8.5, "j") + R(10.5, 11, 16, 2.6, "c", 1) + R(10.5, 16, 11, 2.6, "c", 1)
    + P("21,27 18,37 22,34.5 24.5,37.5 24.5,29", "d") + P("31,27 34,37 30,34.5 27.5,37.5 27.5,29", "d") + C(26, 24.5, 6, "d") + C(26, 24.5, 3, "u"),
  biret: D("M9 18v9c0 5 22 5 22 0v-9", "c") + P("20,5 39,12.5 20,20 1,12.5", "n") + D("M20 12.5L32 16.5v8.5") + R(30.5, 24, 3.2, 8, "u", 1.2),
  gazeta: R(3, 3, 34, 33, "m", 1.5) + R(6.5, 6.5, 27, 7, "d") + D("M6.5 16.5h27") + R(6.5, 19.5, 12, 9.5, "w")
    + R(21.5, 19.5, 12, 2.6, "c", 1) + R(21.5, 24, 12, 2.6, "c", 1) + R(6.5, 31.5, 27, 2.4, "c", 1),
  megafon: R(2, 14, 9, 12, "j", 1.5) + P("11,14 30,4 30,36 11,26", "d") + R(30, 2.5, 5, 35, "c", 2) + D("M13 26l2.5 10h6l-2-8.5", "j")
    + R(15, 17.5, 9, 5, "m", 1),
  plakat: R(10, 9, 20, 26, "m") + P("7,9 33,9 29,4 11,4", "d") + C(20, 2.5, 2, "d") + R(7.5, 34, 25, 3, "d", 1)
    + R(12, 11.5, 9, 11, "u") + R(17, 22.5, 11, 10, "w") + R(13.5, 14, 6, 2.2, "c", .8) + R(18.5, 25, 8, 2.2, "c", .8),
  smartfon: R(8.5, 1.5, 23, 36, "c", 4) + R(11, 5.5, 18, 26.5, "w", 1.2) + C(20, 34.8, 1.3, "j")
    + D("M20 27c-6.5-4.5-7.5-7.5-7.5-10a3.800 3.800 0 0 1 7.5-1.300a3.800 3.800 0 0 1 7.5 1.300c0 2.500-1 5.500-7.500 10z", "d"),
  radio: R(26.5, 3, 2.6, 13, "c", 1) + C(27.8, 3, 2, "c") + R(2, 13, 36, 23, "k", 4) + C(13, 24.5, 8, "j") + C(13, 24.5, 4.5, "c")
    + R(24, 17, 11, 6, "w", 1) + R(28.5, 17, 2.2, 6, "d") + C(26.5, 30, 2.6, "c") + C(33, 30, 2.6, "c"),
  balony: D("M20 37l-7-15M20 37v-17M20 37l7-17") + P("18,35 22,35 20,38", "c") + E(20, 11, 7.5, 9.5, "z") + E(10.5, 15, 7.5, 9.5, "d") + E(29.5, 13, 7.5, 9.5, "u")
    + D("M7 12a4 4 0 0 1 3-3M26 10a4 4 0 0 1 3-3M16.5 8a4 4 0 0 1 3-3", "j"),
  // zaopatrzenie i sklepy
  paleta: R(1.5, 31, 37, 3.5, "j") + R(1.5, 34.5, 5, 2.5, "j") + R(17.5, 34.5, 5, 2.5, "j") + R(33.5, 34.5, 5, 2.5, "j")
    + R(2.5, 17.5, 17, 13.5, "k") + R(20.5, 17.5, 17, 13.5, "k") + R(11.5, 4, 17, 13.5, "k") + R(9.5, 17.5, 3, 4.5, "u") + R(27.5, 17.5, 3, 4.5, "u") + R(18.5, 4, 3, 4.5, "u"),
  koszyk: R(12, 3, 7, 11, "z", 1) + C(25.5, 8.5, 5, "d") + P("8,11 38.5,11 33.5,27 12,27", "j")
    + D("M15 11l1.700 16M22.5 11v16M30 11l-1.700 16M9.700 19h27") + D("M10.2 27.5h23.300v3H9.500L4.200 6.500H.800v-3h5.700z", "c")
    + C(14, 34, 3.2, "c") + C(30, 34, 3.2, "c"),
  chleb: R(13, 3, 2.6, 6, "u", 1.3) + R(18.7, 2, 2.6, 6, "u", 1.3) + R(24.4, 3, 2.6, 6, "u", 1.3)
    + D("M2 28c0-10 8-17 18-17s18 7 18 17c0 3.500-2.500 6-6 6H8c-3.500 0-6-2.500-6-6z", "k") + D("M10 16.500l3.500 6M18 13.500l3.500 6M26 14l3.500 6", "j"),
  szynka: D("M12 26l-6.5 6.5l2.5 2.5l6.5-6.5z", "j") + C(4, 31.5, 2.6, "j") + C(8.5, 36, 2.6, "j")
    + D("M9.500 28.500C3 21.500 6 9 16.500 5c10-3.500 19 1 20.500 9c1 7-5 11-11 14c-5 2.500-10 6.500-16.500 .500z", "b") + D("M26 7.500c5 2 7 7 5.500 11.500", "j"),
  frytki: R(7.5, 8.5, 4.2, 13, "u") + R(12.5, 5, 4.2, 17, "u") + R(17.5, 7.5, 4.2, 14.5, "u") + R(22.5, 4.5, 4.2, 17.5, "u")
    + D("M3 20h26l-3 16H6z", "j") + D("M9.300 20l.700 16M16 20v16M22.700 20l-.700 16M4.200 28h23.600") + R(29, 18.5, 10, 4.5, "c", 2),
  meble: R(19.5, 4, 18, 12.5, "c", 1.5) + R(21.5, 6, 14, 8.5, "w") + R(26.5, 16.5, 4, 2.5, "c") + R(17, 19, 22, 4, "k", 1)
    + R(19, 23, 4, 14, "k") + R(33, 23, 4, 14, "k") + R(1.5, 4, 4.5, 33, "k", 1) + R(1.5, 21, 14.5, 4, "k", 1)
    + R(12, 25, 4, 12, "k") + R(6, 9, 7, 3.5, "k") + R(6, 15, 7, 3.5, "k"),
  pila: P("1.5,20 25,12 25,28 1.5,28", "j")
    + D("M1.500 28l2.200 2.600l2.200-2.600l2.200 2.600l2.200-2.600l2.200 2.600l2.200-2.600l2.200 2.600l2.200-2.600l2.200 2.600l2.200-2.600l2.200 2.600z", "j")
    + D("M24 9.500h10c2.500 0 4 1.500 4 4v14c0 2.500-1.500 4-4 4H24z", "b") + R(28, 14.5, 6, 12, "m", 2.5) + C(6, 23.5, 1.3, "c"),
  kawa: E(19, 34, 18, 3.6, "j") + D("M6 15h26v10c0 5.500-4.500 9.500-10 9.500h-6c-5.500 0-10-4-10-9.500z", "m")
    + D("M31.500 17.500h3c4.500 0 4.500 10 0 10h-4v-3h3.500c1.300 0 1.300-4 0-4h-3z", "m") + E(19, 15, 13, 2.6, "k")
    + R(11.5, 3, 2.6, 8, "u", 1.3) + R(17.7, 1.5, 2.6, 8, "u", 1.3) + R(23.9, 3, 2.6, 8, "u", 1.3),
  // zapas dla nieznanych rzeczy i budynek kampusu (uczelnie jako punkty orientacyjne)
  dom: R(6, 18, 20, 17, "m") + P("3,19 16,7 29,19", "d") + R(13, 26, 6, 9, "k") + R(8, 22, 3.5, 3.5, "w") + R(21, 22, 3.5, 3.5, "w"),
  uczelnia: R(4, 18, 32, 17, "m") + D("M12 18a8 8 0 0 1 16 0z", "n") + D("M20 10V6") + [9, 15.5, 21.5, 28].map((x) => R(x, 22, 3, 11, "j")).join("") + R(3, 33, 34, 2, "m"),
  // zieleń i woda
  park: R(10.5, 24, 3, 10, "k") + C(12, 17.5, 7.5, "z") + R(25.5, 26, 2.5, 8, "k") + C(27, 21, 6, "z") + D("M16 31h8M16 33.500h8M17.500 33.500v1.500M22.500 33.500v1.500"),
  szklarnia: D("M6 35V22a14 14 0 0 1 28 0v13z", "w") + D("M20 8v27M6 24h28M12.500 11.500v23.500M27.500 11.500v23.500") + D("M20 20c-3-5-7-4-7-4c0 4 3 6 7 4zM20 20c3-5 7-4 7-4c0 4-3 6-7 4z", "z"),
  woda: D("M9 26h22l-4 5H13z", "k") + D("M20 26V6") + P("21.5,8 21.5,23 32,23", "j") + P("18.5,11 18.5,23 11,23", "d") + D("M4 34.500c2.700-2 5.300-2 8 0s5.300 2 8 0s5.300-2 8 0s5.300 2 8 0"),
  // lokale drużyn
  lokal: R(7, 18, 26, 17, "m") + P("4,18 8,10 32,10 36,18", "f") + D("M13 10l-2 8M20 10v8M27 10l2 8") + R(10, 21, 13, 8, "w") + D("M16.500 21.500v7") + P("14,23 19,23 17.6,28 15.4,28", "k") + R(25, 22, 6, 13, "c"),
  // warianty ikony lokalu do wyboru (podgląd: static/mapa/podglad_lokali.html); na mapie używany jest IKONA_LOKALU
  lokal_pita: D("M5 20a15 15 0 0 0 30 0z", "u") + D("M7 20c1.500-5 5-6.500 8-3c2-5.500 6.500-5.500 8.500-1c3-4 7.500-2 9.500 4z", "z") + C(13.5, 17.5, 3, "d") + C(27, 17, 3, "d")
    + P("17,20 18.500,10 23,11 22,20", "b") + D("M9 25c3 2.500 7 4 11 4M5 20h30"),
  lokal_rozen: R(30, 9, 4, 20, "n") + D("M32 12v14") + R(9, 31, 22, 4, "c") + D("M20 3.500V31") + P("12.5,9 27.5,9 24,29 16,29", "b") + D("M13.500 14h13M14.500 19h11M15.300 24h9.400") + C(20, 4.5, 1.6, "c"),
  lokal_okienko: R(5, 9, 30, 26, "m") + P("3,15 6,8 34,8 37,15", "f") + D("M12 8l-1.500 7M20 8v7M28 8l1.500 7") + R(9, 18, 22, 9, "c") + P("18,19 22,19 21.300,26 18.700,26", "b") + R(7, 27, 26, 3, "k") + D("M11 33h18"),
  lokal_neon: R(6, 17, 28, 18, "m") + R(3, 5, 34, 12, "c", 2) + `<text x="20" y="14" class="t">KEBAB</text>` + R(9, 22, 6, 6, "w") + R(25, 22, 6, 6, "w") + R(16.5, 25, 7, 10, "c"),
  lokal_rolka: D("M10 30L24.500 8a5 5 0 0 1 8.500 5.500L18.500 35.500z", "u") + C(27, 9.5, 2.3, "z") + C(30.8, 12.3, 2, "d") + D("M10 30l5.500-8.300l8.500 5.500l-5.500 8.300z", "j") + D("M14 26.500l8.500 5.500M21 15l8 5.200"),
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
const WG_ID = { kamienica_bankowa: "monety", biurowiec_zana: "kalkulator", sanepid: "lista", agencja_nieruchomosci: "klucz", agencja_pracy: "czapka",
  piekarnia: "chleb", makro: "paleta", selgros: "paleta", eurocash: "paleta", rozen: "szynka", sprzet_gastro: "frytki", market_budowlany: "meble",
  stolarnia: "pila", galeria: "kawa", drukarnia: "plakat", agencja_lajk: "smartfon", fala_koziolka: "radio", kozi_grod_events: "balony",
  akademia: "dyplom", uczelnia: "biret", ubezpieczyciel: "parasol", ogrod_botaniczny: "szklarnia", zalew: "woda",
  zamek: "zamek", brama_krakowska: "brama_krakowska", wieza_trynitarska: "wieza", plac_po_farze: "ruiny", plac_litewski: "fontanna", csk: "csk", umcs: "uczelnia",
  kul: "uczelnia", politechnika_lubelska: "uczelnia", dworzec_metropolitalny: "dworzec_bus", arena: "stadion", lotnisko: "lotnisko", gorki_czechowskie: "gorki",
  trybunal: "trybunal", katedra: "katedra", brama_grodzka: "brama_grodzka", nowy_ratusz: "ratusz", teatr: "teatr", centrum_kultury: "klasztor", skansen: "wiatrak",
  dworzec_glowny: "dworzec_pkp", most: "most", kosciol_czwartek: "kosciol", cmentarz_lipowa: "cmentarz" };
const WG_RODZAJU = { bank: "monety", urzad: "pieczatka", poczta: "koperta", biuro: "kalkulator", nieruchomosci: "klucz", praca: "czapka", dostawca: "koszyk",
  sklep: "frytki", szkola: "dyplom", reklama: "megafon", uczelnia: "biret", media: "gazeta", lichwiarz: "worek", ubezpieczenia: "parasol", detektyw: "lupa",
  gielda: "wykres", park: "park", woda: "woda", dzialka: "dzialka" };

// ikona lokalu: sześć wariantów do wyboru; IKONA_LOKALU to ten, który rysuje mapa
export const WARIANTY_LOKALU = { lokal: "Budka z markizą", lokal_pita: "Kebab w bułce", lokal_rozen: "Rożen z mięsem", lokal_okienko: "Okienko z ladą",
  lokal_neon: "Neon nad wejściem", lokal_rolka: "Kebab zawijany" };
export const IKONA_LOKALU = "lokal_rozen";   // wybór z 15.11 (na ten moment): wariant 3, rożen z mięsem
WG_RODZAJU.lokal = IKONA_LOKALU;

// kształt tektury: kwadrat, koło (lokale drużyn, parki), przedmiot (budynki: sam przedmiot z cieniem na planszy),
// brak (punkty orientacyjne nadrukowane na planszy)
const TEKTURA = {
  kwadrat: `<rect class="zb" x="1.5" y="5" width="37" height="34" rx="5"/><rect class="zf" x="1.5" y="1.500" width="37" height="34" rx="5"/><rect class="zr" x="4" y="4" width="32" height="29" rx="3"/>`,
  przedmiot: `<ellipse class="zc" cx="20" cy="37" rx="16" ry="2.8"/>`,
  kolo: `<circle class="zb" cx="20" cy="21.500" r="17.500"/><circle class="zf" cx="20" cy="18.500" r="17.500"/><circle class="zr" cx="20" cy="18.500" r="15"/>`,
};
const MIESCI = { kwadrat: "translate(5.200 4.500) scale(.74)", kolo: "translate(7 5.500) scale(.65)" };

// kolor tektury wg rodzaju miejsca (barwa lica w mapa.css: .zt[data-k=…] .zf) – żetony różnią się od razu, jeszcze przed rozpoznaniem piktogramu
const KATEGORIA = {};
[["pieniadze", "monety worek wykres parasol lupa"],
  ["urzedy", "pieczatka lista koperta trybunal ratusz"],
  ["handel", "paleta koszyk chleb szynka frytki meble pila kawa"],
  ["praca", "kalkulator czapka klucz dzialka gazeta megafon plakat smartfon radio balony"],
  ["nauka", "dyplom biret uczelnia"],
  ["zielen", "park szklarnia woda gorki cmentarz"],
  ["kultura", "teatr klasztor katedra kosciol zamek brama_krakowska brama_grodzka wieza ruiny fontanna wiatrak most"],
  ["transport", "dworzec_bus dworzec_pkp lotnisko stadion csk"]]
  .forEach(([k, lista]) => lista.split(" ").forEach((n) => { KATEGORIA[n] = k; }));

/** Żeton budynku, zespołu, lokalu albo miejsca: `id` z danych, `rodzaj` jako zapas; ksztalt: "kwadrat" | "kolo" | "przedmiot" | "" (bez tektury). */
export function zeton(id, rodzaj, ksztalt = "kwadrat") {
  const klucz = Z[WG_ID[id]] ? WG_ID[id] : Z[WG_RODZAJU[rodzaj]] ? WG_RODZAJU[rodzaj] : Z[id] ? id : "dom";
  const rys = Z[klucz], kat = KATEGORIA[klucz];
  return `<svg class="zt"${kat ? ` data-k="${kat}"` : ""} viewBox="0 0 40 40" aria-hidden="true" focusable="false">${TEKTURA[ksztalt] || ""}<g class="zd"${MIESCI[ksztalt] ? ` transform="${MIESCI[ksztalt]}"` : ""}>${rys}</g></svg>`;
}
