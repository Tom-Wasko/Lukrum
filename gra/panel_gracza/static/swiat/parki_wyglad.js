// Wygląd tablicy ogłoszeń w oknie parku (podróż 03/wydarzenia). Układ jest wspólny (postać i wydarzenie), a każdy park ma
// własne: godło (rysunek), hasło nad tablicą i wzór tła (klasa `zd-wz-<wzor>` w styl.css). Kolory tylko przez zmienne motywu.
// Park bez wpisu dostaje wygląd domyślny, ale test pilnuje, żeby każdy park z dane/mapa/budynki.yaml miał własny wpis.
const OBRYS = `fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;
const godlo = (ksztalty) => `<svg class="zd-godlo" viewBox="0 0 48 48" width="44" height="44" aria-hidden="true" ${OBRYS}>${ksztalty}</svg>`;

export const WYGLAD = {
  ogrod_saski: { wzor: "kratka", haslo: "Fontanna i szachy", godlo: godlo(`<path d="M24 42V24M14 42h20M24 24c-8 0-10-8-10-8M24 24c8 0 10-8 10-8M24 12v6"/><path d="M12 30q12 8 24 0"/>`) },
  park_ludowy: { wzor: "kropki", haslo: "Karuzela nad Bystrzycą", godlo: godlo(`<path d="M6 20l18-12 18 12zM24 8v34M12 26v10M36 26v10M10 42h28"/>`) },
  ogrod_botaniczny: { wzor: "listki", haslo: "Szklarnia i rośliny", godlo: godlo(`<path d="M8 40c0-20 14-30 32-30 0 18-10 32-30 32M8 40l20-20"/>`) },
  park_bronowicki: { wzor: "pasy", haslo: "Altana na osiedlu", godlo: godlo(`<path d="M8 20l16-12 16 12zM12 20v20M24 20v20M36 20v20M8 40h32"/>`) },
  park_rury: { wzor: "fale", haslo: "Wąwóz i mostek", godlo: godlo(`<path d="M4 34q20-22 40 0M10 31v8M18 25v14M30 25v14M38 31v8M4 40h40"/>`) },
  blonia: { wzor: "cegly", haslo: "Pod Zamkiem", godlo: godlo(`<path d="M8 40V18l4-4 4 4 4-4 4 4 4-4 4 4v22zM20 40v-10h8v10"/>`) },
  zalew: { wzor: "zygzak", haslo: "Plaża i żagle", godlo: godlo(`<path d="M24 6v28M24 8l14 22H24M8 40q4-4 8 0t8 0 8 0 8 0"/>`) },
};

const DOMYSLNY = { wzor: "kratka", haslo: "Ogłoszenia z parku", godlo: godlo(`<circle cx="24" cy="24" r="14"/>`) };
export const wyglad = (id) => WYGLAD[id] || DOMYSLNY;
