// Poprawki 3 (uwaga autora 8.11): ikony marek i ról w kwadracie karty (.agencja-znak) zamiast dwóch liter („KA” przy „Kasjer”).
// WLASNE – ikony liniowe 24×24 (kreska currentColor) na kolorze karty (--agencja): dla naszych, wymyślonych marek, ról i spraw
// oraz ogólne ikony branżowe jako zapas dla marek bez logo.
// LOGA – uproszczone znaki marek (nazwy prawdziwych firm – zastrzeżenie w stopce): kafelek 32×32 we własnych barwach.
// Brak ikony – znakMarki (wspolne.js) zostawia litery. Klucz = nazwa dokładnie jak w danych (dane/*.yaml, dane/mapa/*.yaml)
// albo w wywołaniu kartaMarki; test: testy/aplikacja/test_ikony_marek.py.

const kropki = (lista, r = 1.1) => lista.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`).join("");

const KUBEK = '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9zM16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3v3M12 3v3"/>';
// ogólne ikony branżowe (bez cech znaku jakiejkolwiek firmy)
const KOSZYK = '<path d="M3 9h18l-1.8 10.5a1.5 1.5 0 0 1-1.5 1.3H6.3a1.5 1.5 0 0 1-1.5-1.3L3 9z"/><path d="M8 9l3-5.5M16 9l-3-5.5M9 13v4M12 13v4M15 13v4"/>';
const WOZEK = '<path d="M2.5 3.5h3l2.2 11h10.6l2-8H6.2"/><circle cx="9" cy="19.5" r="1.6"/><circle cx="17" cy="19.5" r="1.6"/>';
const PALETA = '<rect x="4" y="9" width="7" height="6"/><rect x="13" y="9" width="7" height="6"/><rect x="8.5" y="3" width="7" height="6"/><path d="M2.5 15h19v2.5h-19zM5 17.5v3.5M12 17.5v3.5M19 17.5v3.5"/>';
const BANK = '<path d="M3 9.5 12 3.5l9 6H3z"/><path d="M5.5 12v6.5M10 12v6.5M14 12v6.5M18.5 12v6.5M3 21h18"/>';
const DOM = '<path d="M3 11 12 3.5 21 11"/><path d="M5.5 9.5V21h13V9.5"/><path d="M10 21v-6h4v6"/>';
const MLOTEK = '<path d="M12 10v11.5"/><rect x="4.5" y="3.5" width="15" height="6.5" rx="1.2"/><path d="M8 3.5V10"/>';
const ROZEN = '<path d="M12 2v20M8 21.5h8"/><path d="M7 5h10l-1.6 13H8.6L7 5z"/><path d="M7.6 9.5h8.8M8.2 14h7.6"/>';

const WLASNE = {
  // zawody i stanowiska (katalog.yaml: oferty.stanowiska, kandydaci.yaml)
  Kucharz: '<path d="M7 14.5a4 4 0 0 1-.7-7.9 5.8 5.8 0 0 1 11.4 0 4 4 0 0 1-.7 7.9"/><path d="M7 13.5V20h10v-6.5M7 17h10"/>',
  Kasjer: '<path d="M4 11h16l1 9.5H3L4 11z"/><path d="M7 11V5h7v6M16 11V8h3.5"/><path d="M9 8h3M3.5 17h17"/>'
    + kropki([[7.5, 14], [10.5, 14], [13.5, 14], [16.5, 14]], 0.9),
  "Stanowiska kuchenne": ROZEN,
  "Stanowiska kasowe": '<rect x="6" y="7" width="12" height="15" rx="2"/><path d="M8.5 7V2.5h7V7M9 10.5h6"/>'
    + kropki([[9, 14.2], [12, 14.2], [15, 14.2], [9, 17.4], [12, 17.4], [15, 17.4]], 0.9),
  // dostawcy (dostawcy.yaml) – nasze
  "Piekarnia Koziołek": '<path d="M3 15c0-5 4-8.5 9-8.5s9 3.5 9 8.5c0 2-1 3.5-3 3.5H6c-2 0-3-1.5-3-3.5z"/><path d="M8 10.5l1.5 3.5M12 9.5v4M16 10.5 14.5 14"/>',
  "Zakłady Mięsne „Rożen” z Łęcznej": '<path d="M13.2 4.2c3.8-1.6 7.6 2.2 6 6-1 2.4-3.4 3.4-5.6 3.6l-3.4 3.4"/><path d="M13.2 4.2c-2.4 1-3.4 3.4-3.6 5.6l-3.4 3.4"/>'
    + '<path d="M6.2 13.2 10.8 17.8M6.2 13.2a2 2 0 1 0-2.6 2.4 2 2 0 1 0 2.4 2.6M10.8 17.8l-4.8.2"/>',
  // biura rachunkowe (mapa/biura.yaml)
  "J.K.Ś.": '<rect x="5" y="2.5" width="14" height="19" rx="2"/><rect x="8" y="5.5" width="8" height="3.5" rx=".5"/><path d="M15.5 15v3.5"/>'
    + kropki([[8.7, 12], [12, 12], [15.3, 12], [8.7, 15.3], [12, 15.3], [8.7, 18.5], [12, 18.5]], 0.95),
  "Józef K.": '<path d="M3 21h18M5 21V11h14v10M10 11V6.5L12 3l2 3.5V11"/><circle cx="12" cy="8" r="1"/><path d="M8 14v4M12 14v4M16 14v4"/>',
  "Scrooge": '<path d="M12 20.5S3.5 15.6 3.5 9.6A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 8.5 2.2c0 6-8.5 10.9-8.5 10.9z"/><path d="M8.5 12.5l2.4 2.4 4.6-4.6"/>',
  "Asteroida 328": '<path d="M12 3v17M7.5 21h9M5 6.5h14"/><path d="M5 6.5 2.5 13a2.5 2.5 0 0 0 5 0L5 6.5zM19 6.5 16.5 13a2.5 2.5 0 0 0 5 0L19 6.5z"/>',
  Samodzielnie: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5z"/><path d="M14.5 5.5l3 3M4 22h16"/>',
  // agencje reklamowe (mapa/reklama.yaml)
  "Drukarnia „Papier Przyjmie”": '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6.5 14h11v7h-11zM9 17h6"/>' + kropki([[17.6, 11.6]], 0.9),
  "Radio i billboardy „Fala Koziołka”": '<path d="M12 11v10M8.5 21 12 11l3.5 10"/><circle cx="12" cy="8.5" r="1.6"/><path d="M8.6 5.2a4.8 4.8 0 0 0 0 6.6M15.4 5.2a4.8 4.8 0 0 1 0 6.6M5.6 2.6a8.6 8.6 0 0 0 0 11.8M18.4 2.6a8.6 8.6 0 0 1 0 11.8"/>',
  "Agencja eventowa „Kozi Gród Events”": '<ellipse cx="9" cy="8" rx="4.2" ry="5.2"/><ellipse cx="16.2" cy="10" rx="3.6" ry="4.6"/><path d="M9 13.2c0 3.5 2.4 4.8 3 8.3M16.2 14.6c0 3-3 4.4-4.2 6.9"/>',
  "Agencja „Lajk i Spółka”": '<path d="M7 10v11H3V10h4z"/><path d="M7 10l4-7.5c1.8 0 2.8 1.4 2.4 3.1L12.7 9H19a2 2 0 0 1 2 2.3l-1.4 7.6A2.5 2.5 0 0 1 17.1 21H7"/>',
  // promocje (mapa/promocje.yaml)
  "2 za 1": '<path d="M2.5 11V4.5H9l8.5 8.5-6.5 6.5-8.5-8.5z"/><path d="M12 4.5h1.5l8 8L15 19"/>' + kropki([[6, 8]], 1.1),
  "Zestaw z napojem": '<path d="M3.5 8.5h7.5l-1 12.5H4.5L3.5 8.5z"/><path d="M7.5 8.5 9 3h2.5"/><path d="M13 13h8.5l-1 8h-6.5l-1-8zM13 13l1.6-3h5.3l1.6 3"/>',
  "Happy hours": '<circle cx="12" cy="13.5" r="8"/><path d="M12 9.5v4l2.8 1.8M9.5 2.5h5M19 5.5l1.5-1.5"/>',
  "Karta stałego klienta": '<rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="17" cy="11" r="1.7"/><path d="M5.5 15.5h7"/>' + kropki([[7, 11], [12, 11]], 1.7),
  "Zniżka studencka": '<path d="M2 8.5 12 4l10 4.5-10 4.5L2 8.5z"/><path d="M6 10.5V15c0 1.4 2.4 2.5 5.5 2.5M22 14l-5 7.5"/>' + kropki([[17.2, 14.6], [21.6, 21]], 1.2),
  // inne karty (hr.js, inwestycje.js, urzad.js, ubezpieczenia – zdarzenia/losowe.yaml)
  "Szkolenia dla zespołu": '<rect x="3" y="3" width="18" height="12.5" rx="1"/><path d="M12 15.5V18M8 21.5l4-3.5 4 3.5M7 11.5l3-3 2.2 2.2L17 6"/>',
  "Higiena lokali": '<path d="M8.5 10h6l1 3v8.5h-8v-8.5l1-3z"/><path d="M10 10V6.5h4.5l3 1.2V10M10 6.5 8 5"/><path d="M19.5 3.5v3M18 5h3M20 11v2M19 12h2"/>',
  "Instalacje i usługi": '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.4-3.4a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.4 3.4z"/>',
  "Udogodnienia dla pracowników": KUBEK,
  "TUW „Pod Koziołkiem”": '<path d="M12 4.5 5.5 7v5c0 4.3 2.8 7.6 6.5 9 3.7-1.4 6.5-4.7 6.5-9V7L12 4.5z"/><path d="M5.5 7C3.5 5.5 3.6 3.4 5 2M18.5 7c2-1.5 1.9-3.6.5-5M9 12.5l2 2 4-4"/>',
  // baza składników (dostawcy.js: miejsca przechowywania)
  Suche: '<path d="M8 7.5 6.5 3.5h11L16 7.5"/><path d="M8 7.5c-2.6 3-3.4 7-2.6 10.5a2.6 2.6 0 0 0 2.5 2h8.2a2.6 2.6 0 0 0 2.5-2c.8-3.5 0-7.5-2.6-10.5H8z"/><rect x="8.5" y="12" width="7" height="4.5" rx=".8"/>',
  "Chłodnia": '<rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M5 9.5h14M8.5 5.2v2M8.5 12.5v3.5M14 14.5h2.5M15.25 13.25v2.5"/>',
  "Zamrażarka": '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7"/><path d="M9.5 3.5 12 6l2.5-2.5M9.5 20.5 12 18l2.5 2.5M3.6 10.4l3.4-.9-.9-3.4M20.4 13.6l-3.4.9.9 3.4M6.1 17.9l.9-3.4-3.4-.9M17.9 6.1l-.9 3.4 3.4.9"/>',
  // sprawy w lokalu (zdarzenia/losowe.yaml, falafel.yaml, magazyn.yaml – karty wyników zakładki Zdarzenia)
  "Gołąb Zenon": '<path d="M3.5 14.5c2.2 0 3.4-1.2 4.4-3.2 1.3-2.8 3.3-4.8 6.1-4.8 2 0 3.4 1 4 2.8l2.8 1-2.8 1.2c0 4.2-3 7-8 7H5.5l2.6-2c-2 0-3.8-.9-4.6-2z"/><path d="M10 18.5V21M13 18.5V21M10 12.5c1.5 1.2 3.5 1.2 5 0"/>'
    + kropki([[16, 9.3]], 0.8),
  "Pani Halina z drugiego piętra": '<circle cx="12" cy="9.5" r="4"/><circle cx="12" cy="3.8" r="1.7"/><path d="M4.5 21.5c.8-4 3.6-6.5 7.5-6.5s6.7 2.5 7.5 6.5"/>',
  "Najazd koziołków": '<path d="M8 6.5C6.5 3.5 4 3 2.5 3.8 4.5 4 5.5 5.5 6.5 8M16 6.5c1.5-3 4-3.5 5.5-2.7-2 .2-3 1.7-4 4.2"/><path d="M7 9.5c0-2.4 2.2-4 5-4s5 1.6 5 4l-1 6c-.5 3-2 5-4 5s-3.5-2-4-5l-1-6z"/><path d="M7.2 10 3.5 11.5 7.6 12.6M16.8 10l3.7 1.5-4.1 1.1M11 20.3l1 2.2 1-2.2"/>'
    + kropki([[10, 11], [14, 11]], 0.9),
  "Zalanie z góry": '<path d="M3 3h18M6 3v2M12 3v2M18 3v2"/><path d="M8 8.5c-1.5 2-2.5 3.5-2.5 4.8a2.5 2.5 0 0 0 5 0c0-1.3-1-2.8-2.5-4.8zM16 11c-1.8 2.4-3 4.2-3 5.8a3 3 0 0 0 6 0c0-1.6-1.2-3.4-3-5.8z"/>',
  "Śpiewająca frytkownica": '<path d="M3 12h11v6.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V12zM14 13.5h4.5M6.5 12v8.5M10.5 12v8.5M3 16h11"/><path d="M5 12l.5-4M8.5 12V7M12 12l-.5-4M21 10V3.2l-3 .9"/><circle cx="19.5" cy="10" r="1.5"/>',
  "Hulajnoga w witrynie": '<circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M7.5 18H15l3.2-13.5M16 4.5h4.5"/>',
  "Kot, który został kierownikiem": '<path d="M5 3.5 8.5 8h7L19 3.5v9a7 7 0 0 1-14 0v-9z"/><path d="M12 14.5v1.5M10.5 16.5c.8.6 2.2.6 3 0M2 13l4 .8M2 16.5l4-.8M22 13l-4 .8M22 16.5l-4-.8"/>'
    + kropki([[9.5, 11.5], [14.5, 11.5]], 1),
  "Ząb pana Ryszarda": '<path d="M7.5 3C5 3 3.5 5 3.5 7.5c0 3 1.5 4.5 2 7.5l1 5c.3 1 1.7 1 2 0l1-4.5c.4-1.6 2.6-1.6 3 0l1 4.5c.3 1 1.7 1 2 0l1-5c.5-3 2-4.5 2-7.5C20.5 5 19 3 16.5 3c-2 0-3 1-4.5 1S9.5 3 7.5 3z"/>',
  "Pożar w kuchni": '<path d="M12 22c4 0 7-2.8 7-6.6 0-3.6-2.4-6-4-8.6-.5 2-1.6 3.2-3 3.6.6-3.2-1-6.6-4-8.4.4 3.6-3 6.6-3 10.6 0 5.2 3 9.4 7 9.4z"/><path d="M12 22c-1.7 0-3-1.3-3-3.1 0-2 1.5-3 3-5 1.5 2 3 3 3 5 0 1.8-1.3 3.1-3 3.1z"/>',
  "Włamanie": '<rect x="4.5" y="11" width="15" height="10.5" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.6-1.8M12 15v2.5"/><path d="M18 2.5l-1 2.5 2 .5-1 2.5"/>',
  "Inwazja biedronek": '<ellipse cx="12" cy="14.5" rx="7" ry="7"/><path d="M12 7.5v14M8.5 8.2a3.5 3.3 0 0 1 7 0M9 3.5l1.3 2.2M15 3.5l-1.3 2.2"/>'
    + kropki([[8.7, 12.5], [15.3, 12.5], [8.5, 17], [15.5, 17]], 1.2),
  "Szkielet Bogdan": '<path d="M12 2.5c-4.7 0-8 3.2-8 7.5 0 2.5 1.2 4.3 3 5.4V19a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3.6c1.8-1.1 3-2.9 3-5.4 0-4.3-3.3-7.5-8-7.5z"/><circle cx="9" cy="11" r="1.8"/><circle cx="15" cy="11" r="1.8"/><path d="M10.2 20v-2.6M13.8 20v-2.6M12 14l-1 1.8h2L12 14z"/>',
  "Bójka o falafel": '<circle cx="7.5" cy="16.5" r="4"/><circle cx="16.5" cy="16.5" r="4"/><circle cx="12" cy="9.5" r="4"/><path d="M3.5 4.5l2 2M20.5 4.5l-2 2M12 1.5v1.8"/>'
    + kropki([[11, 8.5], [13.2, 10.5], [6.5, 15.5], [8.7, 17.6], [15.5, 15.5], [17.6, 17.6]], 0.6),
  "Pani Halina z banku żywności": '<path d="M3 10h18l-2 10.5H5L3 10z"/><path d="M7.5 10l3-6M16.5 10l-3-6"/><path d="M12 18.5s-3-1.8-3-3.8a1.5 1.5 0 0 1 3-.6 1.5 1.5 0 0 1 3 .6c0 2-3 3.8-3 3.8z"/>',
  // prawdziwe firmy: zapas na wypadek braku logo w LOGA (logo ma pierwszeństwo)
  Biedronka: KOSZYK,
  Lidl: KOSZYK,
  Stokrotka: KOSZYK,
  Auchan: WOZEK,
  Makro: PALETA,
  Selgros: PALETA,
  Eurocash: PALETA,
  Kmicic: BANK,
  "Wokulski i S-ka": BANK,
  "Ziemia Obiecana": BANK,
  "Oszczędności Rzeckiego": BANK,
  Soplicowo: BANK,
  Solaris: BANK,
  IKEA: DOM,
  OBI: MLOTEK,
  Castorama: MLOTEK,
  Jula: MLOTEK,
  "Leroy Merlin": MLOTEK,
  // marka drużyny bez logo (ogolne.js)
  kebab: ROZEN,
};

// prawdziwe marki: kafelek 32×32 we własnych barwach (tło rysuje sam znak)
const t = (tlo, srodek) => `<rect width="32" height="32" fill="${tlo}"/>${srodek}`;
const LOGA = {
  // dyskonty, markety, hurtownie (dostawcy.yaml)
  Biedronka: t("#fff", '<path d="M16 4.5v4" stroke="#1d1d1b" stroke-width="1.4" stroke-linecap="round"/>'
    + '<path d="M12.2 5.2c1.2 1.2 2 2.3 2.4 3.4M19.8 5.2c-1.2 1.2-2 2.3-2.4 3.4" fill="none" stroke="#1d1d1b" stroke-width="1.3" stroke-linecap="round"/>'
    + '<circle cx="16" cy="11" r="4.6" fill="#1d1d1b"/><circle cx="14.2" cy="10" r="1" fill="#fff"/><circle cx="17.8" cy="10" r="1" fill="#fff"/>'
    + '<circle cx="16" cy="19.5" r="9.5" fill="#e30613"/><path d="M16 10v19" stroke="#1d1d1b" stroke-width="1.3"/>'
    + '<g fill="#1d1d1b"><circle cx="11.2" cy="16" r="2"/><circle cx="20.8" cy="16" r="2"/><circle cx="10.6" cy="22.4" r="1.7"/><circle cx="21.4" cy="22.4" r="1.7"/><circle cx="14" cy="26.4" r="1.2"/><circle cx="18" cy="26.4" r="1.2"/></g>'),
  Lidl: t("#0050aa", '<circle cx="16" cy="16" r="11.5" fill="#fff000" stroke="#e60a14" stroke-width="2.2"/>'),
  Stokrotka: t("#0cb26c", `<g fill="#fff">${Array.from({ length: 10 }, (_, i) => `<ellipse cx="16" cy="8.3" rx="2.4" ry="5.2" transform="rotate(${i * 36} 16 16)"/>`).join("")}</g>`
    + '<circle cx="16" cy="16" r="4.2" fill="#fcde2c"/>'),
  Auchan: t("#fff", '<path d="M5 20.5c3.5-1 6-4 8.5-8.2C15.6 8.6 18.5 6 22.5 6c2.4 0 4 1.2 4.6 2.6l-3 1.2c-.6 4.8-3.6 9.2-9 11.5-3.5 1.5-7 1.3-10.1-.8z" fill="#e2001a"/>'
    + '<path d="M13 21.2c2.6-2 4.6-4.8 5.4-8.2-3 2.2-6 4.6-9.6 6.4 1.4 1.3 2.8 1.8 4.2 1.8z" fill="#7ab51d"/><circle cx="22.4" cy="8.6" r=".95" fill="#fff"/>'
    + '<path d="M10 25.5h12" stroke="#e2001a" stroke-width="2" stroke-linecap="round"/>'),
  Makro: t("#ffdd00", '<path d="M7 23V13.5a3.3 3.3 0 0 1 6.5 0V23M13.5 13.5a3.3 3.3 0 0 1 6.5 0V23M20 13.5a3.3 3.3 0 0 1 6.5 0V23" fill="none" stroke="#ed1c24" stroke-width="3" stroke-linecap="round" transform="translate(-0.8 -2)"/>'
    + '<path d="M6 26h20" stroke="#003a70" stroke-width="2" stroke-linecap="round"/>'),
  Selgros: t("#d6001c", '<path d="M5.5 8h3.2l2.6 11.5h11.6L25.5 11.5H10" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>'
    + '<circle cx="12.5" cy="24" r="2" fill="#fff"/><circle cx="21" cy="24" r="2" fill="#fff"/>'),
  Eurocash: t("#003a8c", `<g fill="#ffcc00">${Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 - 90) * Math.PI / 180;
    return `<circle cx="${(16 + 9.5 * Math.cos(a)).toFixed(2)}" cy="${(16 + 9.5 * Math.sin(a)).toFixed(2)}" r="1.6"/>`;
  }).join("")}</g><rect x="11" y="11" width="10" height="10" rx="1.5" fill="#fff"/><path d="M11 14.5h10M16 11v3.5" stroke="#003a8c" stroke-width="1.3"/>`),
  // banki (mapa/banki.yaml)
  // sklepy z wyposażeniem (katalog.yaml: wyposazenie.sklep)
  IKEA: t("#0058a3", '<ellipse cx="16" cy="16" rx="13" ry="8.2" fill="#ffdb00"/>'),
  OBI: t("#ff7d00", '<path d="M6.5 25.5 17 15" stroke="#fff" stroke-width="3" stroke-linecap="round"/>'
    + '<path d="M14.5 9.5l4-4 2.5 1.2 4.3 4.3-2.6 2.6-2.4-1.4-3.5 3.5-2.6-2.6 1.7-1.7-1.4-1.9z" fill="#fff"/>'),
  Castorama: t("#0078c8", '<path d="M5 17 16 7.5 27 17" fill="none" stroke="#ffd200" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>'
    + '<path d="M8.5 15.5V25h15v-9.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/><rect x="14" y="18.5" width="4" height="6.5" fill="#fff"/>'),
  Jula: t("#e30613", '<path d="M18.7 9.3a1.2 1.2 0 0 0 0 1.7l2.3 2.3a1.2 1.2 0 0 0 1.7 0l3.6-3.6a7 7 0 0 1-9.3 9.3l-7.2 7.2a2.5 2.5 0 0 1-3.5-3.5l7.2-7.2a7 7 0 0 1 9.3-9.3l-4.1 3.1z" fill="#fff"/>'),
  "Leroy Merlin": t("#78be20", '<path d="M6 25V15L16 6.5 26 15v10z" fill="#fff"/><path d="M11 25v-7h10v7" fill="#78be20"/>'),
};

const PRZEDROSTKI = /^Konto firmowe: /;   // banki.js: karta konta z nazwą „Konto firmowe: Soplicowo”
const klucz = (nazwa) => String(nazwa ?? "").replace(PRZEDROSTKI, "").trim();

// SVG znaku marki albo "" (brak ikony – wtedy litery w znakMarki)
export function ikonaMarki(nazwa) {
  const k = klucz(nazwa);
  if (LOGA[k]) return `<svg class="logo-marki" viewBox="0 0 32 32" aria-hidden="true">${LOGA[k]}</svg>`;
  if (WLASNE[k]) return `<svg class="ikona-marki" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${WLASNE[k]}</svg>`;
  return "";
}
