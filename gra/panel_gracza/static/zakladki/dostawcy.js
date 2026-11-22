// Dostawcy: zakup składników i magazyn (bez zwrotów). Zamówienie ma dzień dostawy (świeżość – zakładka
// „Magazyn i świeżość”, silnik/kuchnia/swiezosc.py), a dostawcy mają swoje zasady (silnik/kuchnia/dostawcy.py: zasady_dostaw):
// dni dostaw, opłata za dowóz, minimalne zamówienie, odbiór osobisty w dyskontach i gazetki.
import { esc, OKRES, gw, kafelkiLiczb, kafelOferty, kartaMarki, KOLORY, licz, pasekDo, nazwaFirmy, okno, otwarteOkno, podsumowanie, tabela, toast, seriaFirmy, ulamek, wykres, zl, zl2, zwin, zwinTabela } from "./wspolne.js";
import { IG_AUTO } from "./infografiki.js";
import { glownyLokal, idWybranego, lokalPartii, lokalWybrany, menuLokalu, nazwaLokalu, zapiszWLokalu } from "./lokal_wybor.js";
import { znakMarki } from "./wspolne.js";

// przy kilku lokalach magazyn i zamówienia wybranego lokalu (zamówienie bez pola "lokal" – lokal główny)
function stan(v, z, q) {
  const id = idWybranego(v);
  if (!id) return v.stan_przed.magazyn[`${z}|${q}`] || 0;
  return (v.stan_przed.partie || []).filter((p) => p.zasob === z && +p.jakosc === q && lokalPartii(v, p) === id).reduce((s, p) => s + p.ilosc, 0);
}
const lokalZam = (v, x) => x.lokal || glownyLokal(v);
const mojeZam = (v) => { const id = idWybranego(v); return (v.decyzje.zamowienia || []).filter((x) => !id || lokalZam(v, x) === id); };
const tenLokal = (v, x) => { const id = idWybranego(v); return !id || lokalZam(v, x) === id; };
const zamowienia = (v, d, z, q) => mojeZam(v).filter((x) => x.dostawca === d && x.zasob === z && +x.jakosc === q);
const zamowione = (v, d, z, q, dz) => zamowienia(v, d, z, q).filter((x) => dz === undefined || (+x.dzien || 0) === dz).reduce((s, x) => s + x.ilosc, 0);
const dniDostaw = (v) => (v.lokale && v.swiezosc?.dni) || null;
const DNI = ["pn", "wt", "śr", "czw", "pt", "sob", "nd"];
const RODZAJ = { dyskont: "Dyskont", hurtownia: "Hurtownia", producent: "Producent", piekarnia: "Piekarnia", hipermarket: "Hipermarket" };
const info = (v, d) => (v.dostawcy_info || {})[d] || { dni_dostaw: [0, 1, 2, 3, 4, 5, 6], koszt_dostawy: 0, minimalne_zamowienie: 0 };
const dzienTyg = (iso) => (new Date(iso).getUTCDay() + 6) % 7;
// indeksy dni rundy, w które dostawca dowozi (null – gra bez lokali)
const dniDostawcy = (v, d) => { const dni = dniDostaw(v); return dni && dni.map((x, i) => i).filter((i) => info(v, d).dni_dostaw.includes(dzienTyg(dni[i].data))); };
const rabat = (v, d, z) => (v.gazetki || {})[d]?.[z];

// Podział zamówienia na dostawy (jak planowanie._dostawy w silniku): co `krok` dni – krótki termin albo chłodnia /
// zamrażarka; każda dostawa na dni do następnej, zapas z magazynu zmniejsza pierwszą. dozwolone – dni dostaw
// dostawcy: dostawa przesuwa się na ostatni dzień dostaw przed planowanym (albo pierwszy).
function dostawy(kat, z, potrzeba, stan, udzialy, dozwolone) {
  const zas = kat.zasoby[z], n = udzialy.length;
  const termin = zas.termin_dni || n;
  let krok = Math.min(termin, n);
  if ((zas.przechowywanie || "suche") !== "suche") krok = Math.min(krok, 3);
  const suma = udzialy.reduce((s, x) => s + x, 0) || 1, wynik = [];
  let punkty = [];
  for (let j = 0; j < n; j += krok) punkty.push(j);
  if (dozwolone && dozwolone.length) {
    punkty = [...new Set(punkty.map((j) => { const p = dozwolone.filter((d) => d <= j); return p.length ? p[p.length - 1] : dozwolone[0]; }))].sort((a, b) => a - b);
  }
  const granice = [0, ...punkty.slice(1), n];
  let zapas = stan;
  punkty.forEach((j, i) => {
    const ile = potrzeba * udzialy.slice(granice[i], granice[i + 1]).reduce((s, x) => s + x, 0) / suma - zapas;
    const k = Math.ceil(Math.max(0, ile) - 1e-9);
    zapas = krok < termin ? Math.max(0, k - ile) : 0;
    if (k > 0) wynik.push([j, k]);
  });
  return wynik;
}

// Udziały dni rundy w sprzedaży do rozłożenia dostaw: wagi dni stref lokali firmy, a bez lokali – po równo.
// null – gra bez dni dostaw.
function udzialyDni(v) {
  const dni = dniDostaw(v);
  if (!dni) return null;
  const id = idWybranego(v);
  const wagi = (v.lokale?.moje || []).filter((l) => !id || l.id === id).map((l) => v.popyt?.strefy?.[l.strefa]?.dni).filter((w) => w?.length === dni.length);
  return wagi.length ? dni.map((_, i) => wagi.reduce((s, w) => s + w[i], 0)) : dni.map(() => 1);
}

// Zamówienia na prognozę u najtańszych (jak planowanie.zamowienie_zasobow): z podziałem na dni bez dyskontów
// i bez dostawców, u których któraś dostawa nie osiąga minimalnego zamówienia.
function planZamowien(c, q, zapas) {
  const pot = zapotrzebowanie(c.v, c.kat), ceny = c.v.ceny_dostawcow;
  const udzialy = udzialyDni(c.v);
  const pomin = new Set(udzialy ? Object.keys(ceny).filter((d) => info(c.v, d).odbior_osobisty) : []);
  for (;;) {
    const tanie = najtansze(ceny, pomin), nowe = [];
    for (const [z, p] of Object.entries(pot)) {
      const mag = [1, 2, 3].reduce((s, j) => s + stan(c.v, z, j), 0);
      let jq = q;
      while (!tanie[`${z}|${jq}`] && jq > 1) jq--;
      if (!tanie[`${z}|${jq}`]) continue;
      const d = tanie[`${z}|${jq}`].d;
      if (udzialy) {
        for (const [dzien, ilosc] of dostawy(c.kat, z, p * zapas, mag, udzialy, dniDostawcy(c.v, d))) nowe.push({ dostawca: d, zasob: z, jakosc: jq, ilosc, dzien });
        continue;
      }
      const brak = Math.ceil(Math.max(0, p * zapas - mag) - 1e-9);
      if (brak > 0) nowe.push({ dostawca: d, zasob: z, jakosc: jq, ilosc: brak });
    }
    if (!udzialy) return nowe;
    const wartosc = {};
    for (const x of nowe) { const k = `${x.dostawca}|${x.dzien}`; wartosc[k] = (wartosc[k] || 0) + x.ilosc * ceny[x.dostawca][x.zasob][x.jakosc]; }
    const zaMale = Object.entries(wartosc).filter(([k, w]) => w < (info(c.v, k.split("|")[0]).minimalne_zamowienie || 0) - 1e-9).map(([k]) => k.split("|")[0]);
    if (!zaMale.length) return nowe;
    for (const d of zaMale) pomin.add(d);
  }
}

// sprawa 21 (poprawki 2): dostawca jako karta marki – kafelki: dni dostaw i dowóz, zamówienie z progiem, gazetka i zasady zakupu
const KOLOR_DOSTAWCY = { hurtownia: KOLORY[1], producent: KOLORY[5], piekarnia: KOLORY[7], dyskont: KOLORY[2], hipermarket: KOLORY[3] };
// kategorie dostawców (rozwijane): [nagłówek, rodzaje z dane/dostawcy.yaml]
const KATEGORIE = [["Dyskonty i markety", ["dyskont", "hipermarket"]], ["Hurtownie", ["hurtownia"]], ["Specjaliści", ["producent", "piekarnia"]]];
function kartaDostawcy(v, d, wartosc) {
  const x = info(v, d), g = Object.entries((v.gazetki || {})[d] || {});
  const w = (a, b) => `<div class="wiersz"><span>${a}</span><span>${b}</span></div>`;
  const dni = `<div class="podpis-progow">Dni dostaw</div><div class="progi dni">${DNI.map((n, i) => `<span class="${x.dni_dostaw.includes(i) ? "tu" : ""}">${n}</span>`).join("")}</div>`;
  const dowoz = x.odbior_osobisty ? kafelOferty({ tytul: "Zakupy", pigulka: "odbiór osobisty", duza: `${licz(x.godziny_odbioru)} h`,
    podpis: "czasu właściciela za dzień zakupów", tresc: dni + (x.limit_opakowan ? w("Limit na klienta", `${licz(x.limit_opakowan)} opak. dziennie`) : "") })
    : kafelOferty({ tytul: "Dostawa", duza: x.koszt_dostawy ? zl2(x.koszt_dostawy) : "gratis", podpis: x.koszt_dostawy ? `za dowóz${x.darmowa_od ? `, darmowy od ${zl(x.darmowa_od)}` : ""}` : "dowóz w cenie",
      tresc: dni + (x.minimalne_zamowienie ? w("Minimalne zamówienie", `${zl(x.minimalne_zamowienie)} / dostawa`) : "") });
  const prog = x.minimalne_zamowienie || x.darmowa_od || 0;
  const zam = kafelOferty({ tytul: "Zamówienie w tej rundzie", duza: zl(wartosc), podpis: wartosc ? "netto, wszystkie dni dostaw" : "nic jeszcze nie zamówiono",
    tresc: prog ? pasekDo(wartosc, prog, wartosc >= prog ? `próg ${zl(prog)} osiągnięty` : `do ${x.minimalne_zamowienie ? "minimum" : "darmowego dowozu"} brakuje ${zl(prog - wartosc)}`) : "",
    stopka: `<button class="btn czarny" data-akcja="baza" data-d="${esc(d)}">Baza składników</button>`, klasa: wartosc ? "wybrany" : "" });
  const gazetka = g.length ? kafelOferty({ tytul: "Gazetka", pigulka: "w tym tygodniu", duza: `−${Math.round(Math.max(...g.map(([, r]) => r)) * 100)}%`, podpis: "najwyższy rabat",
    tresc: g.map(([z, r]) => w(esc(z), `−${Math.round(r * 100)}%`)).join("") }) : "";
  return kartaMarki({ kolor: KOLOR_DOSTAWCY[x.rodzaj], nazwa: d, rodzaj: RODZAJ[x.rodzaj] || "", opis: esc(x.opis || ""),
    suma: wartosc ? `zamówienie · <b>${zl(wartosc)}</b>` : "", tresc: `<div class="siatka trojka">${dowoz}${zam}${gazetka}</div>` });
}

function planDostaw(P, tytul) {
  if (!P || (!P.dostawy.length && !P.uwagi.length)) return "";
  const godziny = Object.values(P.czas_wlasciciela).reduce((s, x) => s + x, 0);
  return tabela(tytul, ["Dzień", "Dostawca", "Wartość", "Opłata za dowóz", "Czas właściciela"],
    P.dostawy.map((x) => [`${DNI[dzienTyg(x.data)]} <span class="podpowiedz">${+x.data.slice(8)}.${x.data.slice(5, 7)}</span>`, esc(x.dostawca), zl2(x.wartosc),
      x.oplata ? `<span class="minus">${zl2(x.oplata)}</span>` : "0", x.godziny ? `${licz(x.godziny)} h` : "–"]),
    { klasy: ["l", "l"], stopka: ["Razem", "", zl2(P.dostawy.reduce((s, x) => s + x.wartosc, 0)), zl2(P.dostawy.reduce((s, x) => s + x.oplata, 0)), godziny ? `${licz(godziny)} h` : "–"] })
    + P.uwagi.map((u) => `<div class="komunikat">${esc(u)}</div>`).join("");
}

// Zamówienia rundy – każda pozycja z przyciskiem usunięcia (pozycja = dostawca, składnik, jakość i dzień dostawy).
function listaZamowien(v, edycja) {
  const ceny = v.ceny_dostawcow, dni = dniDostaw(v), zam = mojeZam(v), id = idWybranego(v);
  if (!zam.length) return "";
  const dzien = (x) => { const d = dni && dni[+x.dzien || 0]; return d ? `${DNI[dzienTyg(d.data)]} <span class="podpowiedz">${+d.data.slice(8)}.${d.data.slice(5, 7)}</span>` : "–"; };
  const wartosc = (x) => (ceny[x.dostawca]?.[x.zasob]?.[x.jakosc] || 0) * x.ilosc;
  const usun = (i) => `<button class="btn jasny maly" data-akcja="zam-usun" data-i="${i}" title="Usuń pozycję" ${edycja ? "" : "disabled"}>✕ Usuń</button>`;
  return tabela(`Twoje zamówienia w tej rundzie${id ? ` – dostawa do lokalu ${esc(nazwaLokalu(v, id))}` : ""} (${zam.length})`, ["Dostawca", "Składnik", "Jakość", ...(dni ? ["Dostawa"] : []), "Ilość (opak.)", "Wartość", ""],
    zam.map((x, i) => [esc(x.dostawca), esc(x.zasob), gw(+x.jakosc), ...(dni ? [dzien(x)] : []), licz(x.ilosc), zl2(wartosc(x)), usun(i)]),
    { klasy: ["l", "l"], stopka: ["Razem", "", "", ...(dni ? [""] : []), "", zl2(zam.reduce((s, x) => s + wartosc(x), 0)),
      edycja ? `<button class="btn jasny maly" data-akcja="zam-wyczysc">Usuń wszystkie</button>` : ""] });
}

function zapotrzebowanie(v, kat) {
  const wynik = {};
  for (const [u, p] of Object.entries(menuLokalu(v, lokalWybrany(v)))) {
    for (const [z, ile] of Object.entries(kat.uslugi[u].zasoby)) wynik[z] = (wynik[z] || 0) + (p || 0) * ile / kat.zasoby[z].opakowanie;
  }
  return wynik;
}

function najtansze(ceny, pomin = new Set()) {
  const w = {};
  for (const [d, zas] of Object.entries(ceny)) for (const [z, jak] of Object.entries(zas)) for (const [q, c] of Object.entries(jak)) {
    if (pomin.has(d)) continue;
    if (!w[`${z}|${q}`] || c < w[`${z}|${q}`].c) w[`${z}|${q}`] = { c, d };
  }
  return w;
}

// auto-dostawca (silnik/kuchnia/auto_dostawca.py) – lokal jest na auto-dostawach albo zaopatruje się sam, całość naraz.
// Decyzja "auto_dostawy": {pozycje: [{zasob, jakosc, ilosc}]} wybranego lokalu (decyzja główna – lokal główny); null – wyłączone.
function autoDecyzja(v) {
  const d = v.decyzje, id = idWybranego(v);
  if (!id) return d.auto_dostawy;
  const w = d.w_lokalu?.[id];
  if (w && "auto_dostawy" in w) return w.auto_dostawy;
  return id === glownyLokal(v) ? d.auto_dostawy : undefined;
}
const naAuto = (v) => { const a = autoDecyzja(v); return !!a && typeof a === "object"; };
const cenyAuto = (v) => (v.ceny_dostawcow || {})[v.auto_dostawca?.zasady?.dostawca] || {};
const jakosciAuto = (v, z) => Object.keys(cenyAuto(v)[z] || {}).map(Number);
const domyslnaJakosc = (v, z) => { const j = jakosciAuto(v, z); return j.includes(2) ? 2 : j[0]; };
const zapasLokalu = (v, z) => [1, 2, 3].reduce((s, q) => s + stan(v, z, q), 0);

function sekcjaAuto(v, kat, edycja) {
  const A = v.auto_dostawca, Z = A?.zasady;
  if (!Z) return "";
  const lok = nazwaLokalu(v, idWybranego(v) || glownyLokal(v)), od = v.runda < Z.od_rundy, wl = naAuto(v);
  const dis = edycja && !od ? "" : "disabled";
  let html = `<div class="pasek">Auto-dostawca</div>
    <label class="pole-wyboru"><input type="checkbox" data-zmiana="auto-wl" ${wl ? "checked" : ""} ${dis}> <b>Auto-dostawy w lokalu ${esc(lok)}</b></label>
    <p class="podpowiedz">Auto-dostawca kupuje za Ciebie w ${esc(Z.dostawca)} (drożej niż w hurtowni) i co rano przywozi do lokalu tyle, ile tego dnia zużyjesz –
    nic nie psuje się w lokalu i nie zajmuje chłodni. Płacisz z góry za całą wpisaną ilość + ${Math.round(Z.prowizja * 100)}% prowizji
    i ${zl2(Z.abonament)} abonamentu za tydzień. Co zostanie, czeka u dostawcy na następny tydzień: ${zl2(Z.przechowanie_zl_za_litr_dzien)} za litr dziennie,
    a termin przydatności biegnie. Za mało towaru – dania wypadają z menu. Lokal na auto-dostawach nie przyjmuje Twoich zamówień od innych dostawców.
    ${od ? `<b>Auto-dostawca – od rundy ${Z.od_rundy}.</b>` : ""}${IG_AUTO}</p>`;
  if (!wl) return html;
  const ceny = cenyAuto(v), poz = autoDecyzja(v).pozycje || [], pot = zapotrzebowanie(v, kat);
  const zasoby = [...new Set([...Object.keys(pot), ...poz.map((x) => x.zasob)])].filter((z) => ceny[z]);
  let towar = 0;
  const wiersze = zasoby.map((z) => {
    const p = poz.find((x) => x.zasob === z) || {}, q = +p.jakosc || domyslnaJakosc(v, z);
    const c = ceny[z][q] || 0, ile = +p.ilosc || 0;
    towar += c * ile;
    const k = kat.zasoby[z];
    return [esc(z), `${k.typ_opakowania} (${licz(k.opakowanie)} ${k.jednostka})`, ulamek(pot[z] || 0), ulamek(zapasLokalu(v, z)),
      `<select data-zmiana="auto-jakosc" data-z="${esc(z)}" style="width:auto" ${dis}>${jakosciAuto(v, z).map((j) => `<option value="${j}" ${j === q ? "selected" : ""}>${"★".repeat(j)}</option>`).join("")}</select>`,
      `<input type="number" class="krotkie" min="0" step="1" value="${ile}" data-zmiana="auto-ilosc" data-z="${esc(z)}" ${dis}>`,
      zl2(c), zl2(c * ile * (1 + Z.prowizja))];
  });
  const prow = towar * Z.prowizja;
  html += `<div class="pasek ciemny"><span>Towar: <span class="kwota">${zl(towar)}</span></span><span>Prowizja: <span class="kwota">${zl(prow)}</span></span>
    <span>Abonament: <span class="kwota">${zl(Z.abonament)}</span></span><span>Razem: <span class="kwota">${zl(towar + prow + Z.abonament)}</span></span>
    <span style="display:flex;gap:8px;align-items:center">Wpisz wg prognozy
      <select id="auto-ad-zapas" style="width:auto"><option value="1">bez zapasu</option><option value="1.1" selected>+10% zapasu</option><option value="1.2">+20% zapasu</option></select>
      <button class="btn pom maly" data-akcja="auto-prognoza" ${dis}>Wpisz</button></span></div>
    <p class="podpowiedz">„Wpisz wg prognozy” bierze ilości z prognozy popytu, którą wpisujesz przy daniach w zakładce
    <a data-zakladka-k="lokal_menu">Menu i ceny</a> (pole „Prognozowany popyt”).</p>`;
  if (!Object.values(pot).some((p) => p > 0)) html += `<div class="komunikat">Prognoza popytu jest pusta, więc „Wpisz” nic nie wpisze.
    Najpierw wpisz prognozę przy daniach w zakładce <a data-zakladka-k="lokal_menu">Menu i ceny</a>.</div>`;
  html += tabela(`Zakupy auto-dostawcy na ten tydzień – ${esc(lok)} (opakowania)`, ["Składnik", "Opakowanie", "Potrzeba wg prognoz", "Zapas (lokal i u dostawcy)",
    "Jakość", "Ilość na tydzień", `Cena ${esc(Z.dostawca)}`, "Z prowizją"], wiersze, { klasy: ["l", "l"] });
  const uwagi = A.przyjete?.uwagi || [];
  html += uwagi.map((u) => `<div class="komunikat">${esc(u)}</div>`).join("");
  const zam = mojeZam(v);
  if (zam.length) html += `<div class="komunikat">Masz ${zam.length} ${zam.length === 1 ? "zamówienie" : "zamówień"} do tego lokalu u innych dostawców –
    na auto-dostawach zostaną odrzucone. <button class="btn jasny maly" data-akcja="zam-wyczysc" ${edycja ? "" : "disabled"}>Usuń je</button></div>`;
  return html;
}

// okno samych auto-dostaw (punkt „Zakupy z dowozem” w sklepie): sekcja Auto-dostawca bez reszty ekranu zamówień (podróż 02/sklepy)
let AUTO = null;
export function otworzAuto(c, s) { AUTO = { ...s, zmieniono: false }; oknoAuto(c, AUTO); }
function oknoAuto(c, s, { poZapisie = false } = {}) {
  if (poZapisie) s.zmieniono = true;
  if (poZapisie && !otwarteOkno(s.tytul)) return c.rysuj();
  const tresc = sekcjaAuto(c.v, c.kat, c.edycja) || `<p class="podpowiedz">Auto-dostawy nie są dostępne w tej grze.</p>`;
  okno(s.tytul, tresc, { przyciski: `<button class="btn pom" data-akcja="zamknij-okno">Gotowe</button>`, okruszek: `Lublin › ${esc(s.sklep || "Sklep")}`,
    poZamknieciu: () => { const z = s.zmieniono; AUTO = null; if (z) c.rysuj(); } });
}
const poAuto = (c) => (AUTO ? () => oknoAuto(c, AUTO, { poZapisie: true }) : undefined);

function zapiszPozycje(c, zmiana) {
  const a = autoDecyzja(c.v) || {};
  const poz = zmiana((a.pozycje || []).map((x) => ({ ...x })));
  return c.zmien((d) => { zapiszWLokalu(d, c.v, "auto_dostawy", { ...a, pozycje: poz }); }, poAuto(c));
}
function ustawPozycje(lista, z, zmiany, v) {
  let p = lista.find((x) => x.zasob === z);
  if (!p) lista.push(p = { zasob: z, jakosc: domyslnaJakosc(v, z), ilosc: 0 });
  Object.assign(p, zmiany);
  return lista;
}

function wynikiAuto(v) {
  const A = v.wyniki?.auto_dostawy;
  if (!A?.lokale || !Object.keys(A.lokale).length) return "";
  const w = Object.entries(A.lokale).map(([l, x]) => [esc(nazwaLokalu(v, l)), licz(x.pozycje.length), zl2(x.towar), zl2(x.prowizja), zl2(x.abonament),
    zl2(x.towar + x.prowizja + x.abonament)]);
  return tabela("Auto-dostawca – zakupy tygodnia", ["Lokal", "Pozycje", "Towar", "Prowizja", "Abonament", "Razem"], w, { klasy: ["l"] });
}

export const dostawcy = {
  tytul: "Dostawcy", ikona: "⛟", odblokowanie: "dostawcy",
  info: `Kup składniki potrzebne do wybranych dań. Składniki możesz kupować u jednego lub kilku dostawców. Niezużyte zostają w magazynie.
    Hurtownie dowożą w swoje dni (za darmo od progu), piekarnia codziennie, producent mięsa ma minimalne zamówienie,
    a w dyskoncie kupujesz samodzielnie – taniej przy małych ilościach i z gazetką, ale tracisz czas i nie wyniesiesz więcej niż limit.`,
  decyzje({ v, kat, edycja }) {
    const ceny = v.ceny_dostawcow;
    const auto = sekcjaAuto(v, kat, edycja);
    if (naAuto(v)) return auto;
    const koszt = mojeZam(v).reduce((s, z) => s + (ceny[z.dostawca]?.[z.zasob]?.[z.jakosc] || 0) * z.ilosc, 0);
    const pot = zapotrzebowanie(v, kat), tanie = najtansze(ceny);
    const C = v.czas_wlasciciela;
    const plan = planDostaw(v.dostawy_plan, "Dostawy w tej rundzie") + (C && C.wykorzystane
      ? `<p class="podpowiedz">Czas właściciela: wolne ${licz(C.wolne, 1)} h z ${licz(C.pula, 1)} h w tej rundzie (<a data-zakladka-k="czas_wlasciciela">szczegóły</a>).</p>` : "");
    const wiersze = Object.keys(kat.zasoby).filter((z) => pot[z] || [1, 2, 3].some((q) => stan(v, z, q))).map((z) => {
      const magazyn = [1, 2, 3].reduce((s, q) => s + stan(v, z, q), 0);
      const zam = mojeZam(v).filter((x) => x.zasob === z).reduce((s, x) => s + x.ilosc, 0);
      const brak = Math.max(0, (pot[z] || 0) - magazyn - zam);
      return [esc(z), `${kat.zasoby[z].typ_opakowania} (${licz(kat.zasoby[z].opakowanie)} ${kat.zasoby[z].jednostka})`, ulamek(pot[z] || 0),
        ulamek(magazyn), licz(zam), brak > 0 ? `<span class="minus">${ulamek(brak)}</span>` : '<span class="plus">0</span>',
        [1, 2, 3].map((q) => tanie[`${z}|${q}`] ? `${gw(q)} ${zl2(tanie[`${z}|${q}`].c)} <span class="podpowiedz">${esc(tanie[`${z}|${q}`].d)}</span>` : "").join("<br>")];
    });
    // „Zamów brakujące” – tylko gdy mistrz gry go włączył (domyślnie drużyny liczą zamówienia same)
    const autoZam = v.gra.auto_zamowienia ? `<span style="display:flex;gap:8px;align-items:center">Zamów brakujące u najtańszych w jakości
      <select id="auto-jakosc" style="width:auto"><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select>
      <select id="auto-zapas" style="width:auto"><option value="1">bez zapasu</option><option value="1.05" selected>+5% zapasu</option><option value="1.1">+10% zapasu</option></select>
      <button class="btn pom maly" data-akcja="auto-zamow" ${edycja ? "" : "disabled"}>Zamów</button></span>` : "";
    let html = `<div class="pasek ciemny"><span>Koszt zakupu${idWybranego(v) ? " (ten lokal)" : ""}: <span class="kwota">${zl(koszt)}</span></span>${autoZam}</div>`;
    html += tabela("Zapotrzebowanie na prognozowanych klientów (opakowania)", ["Zasób", "Opakowanie", "Potrzeba wg prognoz", "W magazynie",
      "Zamówione teraz", "Brakuje", "Najtańsze oferty"], wiersze, { klasy: ["l", "l"] });
    html += listaZamowien(v, edycja);
    if (dniDostaw(v)) html += `<p class="podpowiedz">„Zamów” w grze z lokalami pomija dyskonty (odbiór osobisty, limity) – w nich kupujesz ręcznie w bazie składników.</p>`;
    html += plan;
    const wyn = v.swiezosc?.wynajem;
    if (wyn) html += `<p class="podpowiedz">Dostawcy nie przyjmują zwrotów. Co nie zmieści się w chłodni lub zamrażarce lokalu,
      jedzie do wynajętej chłodni (${zl2(wyn.zl_za_litr)} za litr, termin krótszy o ${wyn.skrocenie_dni} dni) – szczegóły w zakładce
      <a data-zakladka-k="swiezosc">Świeżość</a>.</p>`;
    html += auto + `<div class="pasek">Dostawcy</div>`;
    const wartoscU = (d) => mojeZam(v).filter((x) => x.dostawca === d).reduce((s, x) => s + (ceny[d]?.[x.zasob]?.[x.jakosc] || 0) * x.ilosc, 0);
    // dostawcy w rozwijanych kategoriach; otwarte te, w których jest zamówienie
    for (const [nazwa, rodzaje] of KATEGORIE) {
      const lista = Object.keys(ceny).filter((d) => rodzaje.includes(info(v, d).rodzaj));
      if (!lista.length) continue;
      const suma = lista.reduce((s, d) => s + wartoscU(d), 0);
      const tytul = `${nazwa} <span class="kategoria-nazwy">${lista.map(esc).join(" · ")}</span>${suma ? ` <span class="kategoria-suma">zamówienie ${zl2(suma)}</span>` : ""}`;
      html += zwin(tytul, lista.map((d) => kartaDostawcy(v, d, wartoscU(d))).join(""), { otwarte: suma > 0, klucz: `dostawcy-${nazwa}`, licznik: lista.length });
    }
    const reszta = Object.keys(ceny).filter((d) => !KATEGORIE.some(([, r]) => r.includes(info(v, d).rodzaj)));
    return html + reszta.map((d) => kartaDostawcy(v, d, wartoscU(d))).join("");
  },
  wyniki({ v }) {
    const straty = (v.wyniki?.zasoby || []).some((x) => "straty" in x);
    const z = (v.wyniki?.zasoby || []).map((x) => [esc(x.zasob), gw(x.jakosc), ulamek(x.poczatek), ulamek(x.zamowione), ulamek(x.wykorzystane),
      ...(straty ? [x.straty ? `<span class="minus">${ulamek(x.straty)}</span>` : "0"] : []), ulamek(x.koniec), zl2(x.wartosc)]);
    const suma = (v.wyniki?.zasoby || []).reduce((s, x) => s + x.wartosc, 0);
    const firmy = Object.keys(v.rynek?.jakosc_zasobow || {});
    const jak = firmy.map((f) => [esc(nazwaFirmy(v, f)), ...[1, 2, 3].map((q) => ulamek(v.rynek.jakosc_zasobow[f][q]))]);
    const ze = (v.wyniki?.zasoby || []).filter((x) => x.straty), n = (v.wyniki?.zasoby || []).length;
    const lead = !n ? podsumowanie("W tej rundzie nie było składników w magazynie.") : podsumowanie([
      `W magazynie na koniec ${OKRES.dopelniacz} leży <b>${licz(n)}</b> ${n === 1 ? "pozycja" : "pozycji"} składników wartych <b>${zl(suma)}</b>.`,
      ze.length ? `Straty (zepsute lub przeterminowane) dotyczą ${licz(ze.length)} pozycji.` : straty ? "Nic się nie zepsuło." : ""], ze.length ? "uwaga" : "ok");
    const kafle = n ? kafelkiLiczb([{ etykieta: "Pozycje w magazynie", wartosc: licz(n) }, { etykieta: "Wartość magazynu", wartosc: zl(suma) },
      straty && { etykieta: "Pozycje ze stratami", wartosc: licz(ze.length), ton: ze.length ? "minus" : "plus" }]) : "";
    return lead + kafle + wynikiAuto(v) + planDostaw(v.wyniki?.dostawy, "Dostawy, opłaty za dowóz i zakupy w dyskontach") + zwinTabela("Składniki", ["Składnik", "Jakość", `Magazyn na początek ${OKRES.dopelniacz}`, "Zamówione", "Wykorzystane", ...(straty ? ["Straty"] : []),
      `Magazyn na koniec ${OKRES.dopelniacz}`, "Wartość"], z, { klasy: ["l"], stopka: ["Suma", "", "", "", "", ...(straty ? [""] : []), "", zl2(suma)], otwarte: true })
      + `<div class="wykres"><canvas id="w-jakosc"></canvas></div>`
      + zwinTabela("Jakość składników (zamówione opakowania)", ["Firma", "Niska ★", "Średnia ★★", "Wysoka ★★★"], jak, { klasy: ["l"] });
  },
  po({ v }, tryb) {
    if (tryb !== "wyniki") return;
    const f = Object.keys(v.rynek?.jakosc_zasobow || {});
    wykres("w-jakosc", "bar", ["Niska", "Średnia", "Wysoka"], f.map((x) => seriaFirmy(v, x, [1, 2, 3].map((q) => v.rynek.jakosc_zasobow[x][q]), "bar")));
  },
  akcje: {
    baza: (el, c) => oknoBazy(c, el.dataset.d),
    "zam-usun": (el, c) => {
      const x = mojeZam(c.v)[+el.dataset.i];
      if (!x) return;
      const ta = (y) => y.dostawca === x.dostawca && y.zasob === x.zasob && +y.jakosc === +x.jakosc && (+y.dzien || 0) === (+x.dzien || 0)
        && lokalZam(c.v, y) === lokalZam(c.v, x);
      return c.zmien((d) => { d.zamowienia = (d.zamowienia || []).filter((y) => !ta(y)); });
    },
    "zam-wyczysc": (el, c) => c.zmien((d) => { d.zamowienia = (d.zamowienia || []).filter((x) => !tenLokal(c.v, x)); }, poAuto(c)),
    "auto-prognoza": (el, c) => {
      const zapas = +document.getElementById("auto-ad-zapas").value, pot = zapotrzebowanie(c.v, c.kat), ceny = cenyAuto(c.v);
      if (!Object.values(pot).some((p) => p > 0)) return toast("Najpierw wpisz prognozę popytu dań w zakładce Menu i ceny.");
      return zapiszPozycje(c, (lista) => {
        for (const [z, p] of Object.entries(pot)) if (ceny[z]) ustawPozycje(lista, z, { ilosc: Math.ceil(Math.max(0, p * zapas - zapasLokalu(c.v, z)) - 1e-9) }, c.v);
        return lista;
      });
    },
    "auto-zamow": async (el, c) => {
      const q = +document.getElementById("auto-jakosc").value, zapas = +document.getElementById("auto-zapas").value;
      if (!Object.values(menuLokalu(c.v, lokalWybrany(c.v))).some((p) => p > 0)) return toast("Najpierw wpisz prognozę popytu dań w zakładce Menu – zamówienia liczone są na prognozowanych klientów.");
      const nowe = planZamowien(c, q, zapas);
      if (!nowe.length) return toast("Zapas w magazynie wystarcza na prognozowanych klientów.");
      const id = idWybranego(c.v);   // kilka lokali – zastępuje tylko zamówienia wybranego lokalu
      await c.zmien((d) => { d.zamowienia = [...(d.zamowienia || []).filter((x) => !tenLokal(c.v, x)), ...nowe.map((x) => (id ? { ...x, lokal: id } : x))]; });
      toast(dniDostaw(c.v) ? "Zamówienia ustawione – dostawy rozłożone na dni wg terminów przydatności (poprzednie zastąpione)."
        : "Zamówienia ustawione (poprzednie zamówienia zastąpione).");
    },
  },
  zmiany: {
    "auto-wl": (el, c) => c.zmien((d) => { zapiszWLokalu(d, c.v, "auto_dostawy", el.checked ? { pozycje: [] } : null); }, poAuto(c)),
    "auto-ilosc": (el, c) => zapiszPozycje(c, (l) => ustawPozycje(l, el.dataset.z, { ilosc: Math.max(0, Math.round(+el.value || 0)) }, c.v)),
    "auto-jakosc": (el, c) => zapiszPozycje(c, (l) => ustawPozycje(l, el.dataset.z, { jakosc: +el.value }, c.v)),
    // po zapisie odświeża się tylko okno bazy (w miejscu – wspolne.js: okno), karta pod nim – po zamknięciu okna
    ilosc: (el, c) => {
      const { d: dost, z, q, dz } = el.dataset, ilosc = Math.max(0, +el.value || 0);
      const tenDzien = (x) => dz === undefined || (+x.dzien || 0) === +dz, id = idWybranego(c.v);
      return c.zmien((d) => {
        d.zamowienia = (d.zamowienia || []).filter((x) => !(x.dostawca === dost && x.zasob === z && +x.jakosc === +q && tenDzien(x) && tenLokal(c.v, x)));
        if (ilosc > 0) d.zamowienia.push({ dostawca: dost, zasob: z, jakosc: +q, ilosc, ...(dz === undefined ? {} : { dzien: +dz }), ...(id ? { lokal: id } : {}) });
      }, () => (SKLEP && SKLEP.dost === dost ? oknoSklepu(c, SKLEP, { poZapisie: true }) : oknoBazy(c, dost, { poZapisie: true })));
    },
  },
};

// --- okno sklepu: oferta jednego dostawcy, ograniczona do działu, który kliknięto we wnętrzu (podróż 02/sklepy) -------------
// Pokazuje tylko towary tego sklepu z wybranych działów, ich ceny, pola ilości (koszyk) i stan magazynu. Porównania z innymi sklepami
// nie ma (jest w zeszycie wujka). Dane i zapis zamówień są te same co w ekranie „Zamówienia” (decyzja `zamowienia`).
export const DZIALY = {
  Pieczywo: ["Bułka", "Tortilla", "Pita"],
  Mięso: ["Mięso kebab"],
  Mrożonki: ["Pita mrożona", "Mięso kebab mrożone", "Frytki mrożone", "Falafel mrożony"],
  "Falafel i pita": ["Pita mrożona", "Falafel mrożony"],
  Warzywa: ["Warzywa", "Surówki"],
  Surówki: ["Surówki"],
  "Sosy i dodatki": ["Sos", "Hummus", "Ser i dodatki"],
  Napoje: ["Napój"],
  Opakowania: ["Opakowanie", "Box"],
};
/** Nazwa dostawcy w danych gry dla sceny o danym tytule („Zakłady Mięsne „Rożen”” → „Zakłady Mięsne „Rożen” z Łęcznej”). */
export const dostawcaSceny = (v, tytul) => Object.keys(v.ceny_dostawcow || {}).find((d) => d === tytul || d.startsWith(tytul) || tytul.startsWith(d)) || null;
let SKLEP = null;   // sklep, którego okno jest otwarte: { dost, dzialy, widok, tytul }

/** Otwiera okno sklepu. s: { dost, dzialy?: [nazwy działów], widok?: "dzial" | "koszyk" | "dowoz" | "gazetka", tytul?: napis dla okna }. */
export function otworzSklep(c, s) { SKLEP = { ...s, zmieniono: false }; oknoSklepu(c, SKLEP); }

function oknoSklepu(c, s, { poZapisie = false } = {}) {
  const { v, kat, edycja } = c, dost = s.dost;
  if (poZapisie) s.zmieniono = true;
  const ceny = v.ceny_dostawcow?.[dost] || {}, dni = dniDostaw(v), moje = dniDostawcy(v, dost) || [], x = info(v, dost), widok = s.widok || "dzial";
  const dowozone = Object.keys(ceny);
  const wDziale = (z) => !(s.dzialy || []).length || s.dzialy.some((d) => (DZIALY[d] || []).includes(z));
  const wKoszyku = (z) => [1, 2, 3].some((q) => zamowione(v, dost, z, q) > 0);
  const filtr = new Set(dowozone.filter((z) => (widok === "koszyk" || widok === "dowoz" ? wKoszyku(z)
    : widok === "gazetka" ? !!rabat(v, dost, z) : wDziale(z))));
  const zam = mojeZam(v).filter((y) => y.dostawca === dost);
  const wartosc = zam.reduce((a, y) => a + (ceny[y.zasob]?.[y.jakosc] || 0) * y.ilosc, 0);
  const wTymDziale = zam.filter((y) => filtr.has(y.zasob)).length;
  const prog = x.minimalne_zamowienie || x.darmowa_od || 0;
  const koszyk = `<div class="pasek ciemny"><span>W koszyku (${esc(dost)}): <span class="kwota">${zl2(wartosc)}</span> · ${licz(zam.length)} ${zam.length === 1 ? "pozycja" : "pozycji"}${
    widok === "dzial" && zam.length > wTymDziale ? `, w tym dziale ${licz(wTymDziale)}` : ""}</span></div>`
    + (prog ? pasekDo(wartosc, prog, wartosc >= prog ? `próg ${zl(prog)} osiągnięty` : `do ${x.minimalne_zamowienie ? "minimum" : "darmowego dowozu"} brakuje ${zl(prog - wartosc)}`) : "");
  const dniHtml = `<div class="podpis-progow">Dni dostaw</div><div class="progi dni">${DNI.map((n, i) => `<span class="${x.dni_dostaw.includes(i) ? "tu" : ""}">${n}</span>`).join("")}</div>`;
  const dowoz = widok === "dowoz" ? `<div class="komunikat">${x.odbior_osobisty ? `Odbiór osobisty: ${licz(x.godziny_odbioru)} h czasu właściciela za dzień zakupów.`
    : x.koszt_dostawy ? `Dowóz ${zl2(x.koszt_dostawy)} za dostawę${x.darmowa_od ? `, darmowy od ${zl(x.darmowa_od)}` : ""}.` : "Dowóz w cenie."}</div>${dniHtml}` : "";
  const gazetka = widok === "gazetka" && !filtr.size ? `<p class="podpowiedz">W tym tygodniu ${esc(dost)} nie ma gazetki.</p>` : "";
  const pusty = !filtr.size && widok !== "gazetka" ? `<p class="podpowiedz">${widok === "koszyk" || widok === "dowoz" ? "Koszyk w tym sklepie jest pusty. Towary dodasz w działach sklepu."
    : "W tym dziale sklep nie ma dziś towaru."}</p>` : "";
  const pole = (z, q, ile, dz) => `<input type="number" class="krotkie" min="0" step="1" value="${ile}" data-zmiana="ilosc" data-d="${esc(dost)}" data-z="${esc(z)}" data-q="${q}"
    ${dz === undefined ? "" : `data-dz="${dz}"`} ${edycja ? "" : "disabled"}>`;
  const tytul = s.tytul || `${dost}`;
  const przyciski = `<button class="btn pom" data-akcja="zamknij-okno">${widok === "dzial" ? "Gotowe" : "Zamknij"}</button>`;
  const tresc = koszyk + dowoz + (filtr.size ? bazaNowa(v, kat, dost, ceny, dni, moje, pole, filtr) : "") + gazetka + pusty
    + `<p class="podpowiedz">Ilości wpisujesz w opakowaniach. Kolumna „Magazyn” to to, co już masz; „Wartość” to cena z koszyka.${dni && x.minimalne_zamowienie ? ` Dostawa poniżej ${zl(x.minimalne_zamowienie)} nie zostanie zrealizowana.` : ""}</p>`;
  if (poZapisie && !otwarteOkno(tytul)) return c.rysuj();
  okno(tytul, tresc, { przyciski, okruszek: `Lublin › ${esc(dost)}`, poZamknieciu: () => { const z = s.zmieniono; SKLEP = null; if (z) c.rysuj(); } });
}

function oknoBazy(c, dost, { poZapisie = false } = {}) {
  const { v, kat, edycja } = c;
  const ceny = v.ceny_dostawcow[dost] || {}, dni = dniDostaw(v), moje = dniDostawcy(v, dost) || [];
  const pole = (z, q, ile, dz) => `<input type="number" class="krotkie" min="0" step="1" value="${ile}" data-zmiana="ilosc" data-d="${esc(dost)}" data-z="${esc(z)}" data-q="${q}"
    ${dz === undefined ? "" : `data-dz="${dz}"`} ${edycja ? "" : "disabled"}>`;
  const x = info(v, dost);
  const id = idWybranego(v);
  const uwagi = `<p class="podpowiedz">Ceny w tym ${OKRES.miejscownik}. Ilości wpisujesz w opakowaniach (np. napój: opakowanie 24 szt.).
      ${dni ? "Kolumny dni – dostawa rano tego dnia (tylko dni dostaw tego dostawcy); termin przydatności liczy się od dnia dostawy (Hurtownie ▸ Zamówienia)." : ""}
      ${dni && x.limit_opakowan ? ` Najwyżej ${licz(x.limit_opakowan)} opakowań składnika dziennie, każdy dzień zakupów to ${licz(x.godziny_odbioru)} h właściciela.` : ""}
      ${dni && x.minimalne_zamowienie ? ` Dostawa poniżej ${zl(x.minimalne_zamowienie)} nie zostanie zrealizowana.` : ""}
      ${dni && x.koszt_dostawy ? ` Dowóz ${zl2(x.koszt_dostawy)} za dostawę${x.darmowa_od ? `, darmowy od ${zl(x.darmowa_od)}` : ""}.` : ""}</p>`;
  const tytul = `Dostawca „${esc(dost)}”${id ? ` – dostawa do lokalu ${esc(nazwaLokalu(v, id))}` : ""}`;
  const przyciski = `<button class="btn pom" data-akcja="zamknij-okno">Zapisz</button>`;
  if (poZapisie && !otwarteOkno(tytul)) return c.rysuj();   // okno zamknięte przed końcem zapisu – tylko karta
  const opcje = { przyciski, poZamknieciu: poZapisie ? () => c.rysuj() : null };
  okno(tytul, bazaNowa(v, kat, dost, ceny, dni, moje, pole) + uwagi, opcje);
}

// okno „Baza składników”: jedna karta na kategorię (wg miejsca przechowywania, zwijana, w jej kolorze), w środku
// wspólny nagłówek z dniami dostaw i zwarte wiersze – jeden na jakość (kolumny w stałej siatce CSS, pola ilości pod dniami)
const KATEGORIE_SKLADNIKOW = [["suche", "Suche", KOLORY[4]], ["chlodnia", "Chłodnia", KOLORY[1]], ["zamrazarka", "Zamrażarka", KOLORY[6]]];
function bazaNowa(v, kat, dost, ceny, dni, moje, pole, filtr = null) {
  const wartoscZ = (z) => Object.entries(ceny[z]).reduce((s, [q, c]) => s + zamowione(v, dost, z, +q) * c, 0);
  const rodzajZ = (z) => kat.zasoby[z].przechowywanie || "suche";
  const dniDost = dni ? moje : [null];
  const siatka = `style="--dni:${dniDost.length}"`;
  const naglowek = `<div class="baza-wiersz baza-naglowek" ${siatka}><span>Składnik</span><span>Jakość</span><span>Cena</span><span>Magazyn</span>${
    dniDost.map((i) => (i === null ? "<span>opak.</span>" : `<span>${dni[i].dzien}<br>${+dni[i].data.slice(8)}.${dni[i].data.slice(5, 7)}</span>`)).join("")}<span>Wartość</span></div>`;
  let html = "";
  for (const [klucz, nazwa, kolor] of KATEGORIE_SKLADNIKOW) {
    const lista = Object.keys(ceny).filter((z) => rodzajZ(z) === klucz && (!filtr || filtr.has(z)));
    if (!lista.length) continue;
    const suma = lista.reduce((s, z) => s + wartoscZ(z), 0);
    const wiersze = lista.map((z) => {
      const zas = kat.zasoby[z], r = rabat(v, dost, z);
      const miejsce = zas.przechowywanie && zas.przechowywanie !== "suche" ? `, ${licz(zas.miejsce_l)} l` : "";
      const opis = `${zas.typ_opakowania} ${licz(zas.opakowanie)} ${zas.jednostka}${dni && zas.termin_dni ? `, termin ${zas.termin_dni} dni${miejsce}` : ""}`;
      return `<div class="baza-skladnik">${Object.entries(ceny[z]).map(([q, c], k) => {
        const ile = zamowione(v, dost, z, +q);
        const pola = dniDost.map((i) => (i === null ? pole(z, q, ile) : pole(z, q, zamowione(v, dost, z, +q, i), i))).join("");
        return `<div class="baza-wiersz ${ile ? "wybrany" : ""}" ${siatka}><span class="baza-nazwa">${k === 0 ? `<b>${esc(z)}</b><small>${esc(opis)}</small>` : ""}</span>
          <span>${gw(+q)}</span><b class="baza-cena">${zl2(c)}</b>
          <small class="baza-mag">${ulamek(stan(v, z, +q))}${r ? ` <span class="plus">−${Math.round(r * 100)}%</span>` : ""}</small>${pola}
          <span class="baza-wartosc">${ile ? zl2(ile * c) : "–"}</span></div>`;
      }).join("")}</div>`;
    }).join("");
    // jedna zwijana karta na kategorię: nagłówek (summary) = znak, nazwa, liczba składników i suma zamówienia
    html += `<div class="baza-kat" style="--agencja:${kolor}">${zwin(`<span class="agencja-znak" aria-hidden="true">${znakMarki(nazwa)}</span><b>${nazwa}</b>
      <span class="kategoria-nazwy">${lista.length} ${lista.length === 1 ? "składnik" : "składników"}: ${lista.map(esc).join(" · ")}</span>${suma ? ` <span class="kategoria-suma">zamówiono ${zl2(suma)}</span>` : ""}`,
      `<div class="baza-tabela">${naglowek}${wiersze}</div>`, { otwarte: true, klucz: `baza-${klucz}` })}</div>`;
  }
  return html;
}
