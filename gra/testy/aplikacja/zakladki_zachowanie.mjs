// Pomocnik testu test_wnetrza_sceny.py (podróż 02/sklepy): ładuje prawdziwe moduły panelu pod Node'em ze stubem DOM
// i sprawdza zachowanie. Użycie: node zakladki_zachowanie.mjs KATALOG_static. Wypisuje JSON { wynik: {...}, bledy: [...] }.
import path from "path";
import { pathToFileURL } from "url";

const ZAPIS = [];   // wszystko, co kod wpisał do innerHTML (treść okien)
globalThis.NodeFilter = { SHOW_TEXT: 4, FILTER_ACCEPT: 1, FILTER_REJECT: 2 };
const el = () => new Proxy(function () {}, {
  set: (t, k, val) => { if (k === "innerHTML") ZAPIS.push(String(val)); t[k] = val; return true; },
  get: (t, k) => (k === Symbol.toPrimitive ? () => "" : k === "length" ? 0 : k === "then" ? undefined : k === "nextNode" ? () => null : k in t ? t[k] : el()), apply: () => el() });
globalThis.document = el(); globalThis.window = el(); globalThis.localStorage = { getItem: () => null, setItem() {} };
const st = path.resolve(process.argv[2]);
const imp = (p) => import(pathToFileURL(path.join(st, p)).href);
const wynik = {}, bledy = [];
const sprawdz = async (nazwa, fn) => { try { wynik[nazwa] = await fn(); } catch (e) { bledy.push(`${nazwa}: ${e.message}`); } };

const Z = (await imp("zakladki/index.js")).default;
await sprawdz("index_laduje_sie", () => ({ agencje: typeof Z.agencje.tytulPelny, hr_rozwoj_bez_lokali: !!Z.hr_rozwoj.bezLokali }));

const D = await imp("zakladki/dostawcy.js");
const W = await imp("swiat/wnetrze.js");
const v0 = (ceny, extra = {}) => ({ runda: 1, ceny_dostawcow: ceny, dostawcy_info: {}, decyzje: { zamowienia: [] }, gra: {}, stan_przed: { magazyn: {} }, ...extra });
const kontekst = (v, ekrany) => ({ v, zakryta: () => false, dostepna: () => true, odRundy: () => 0, rysuj() {}, teczka: (k) => ekrany.push(k) });

await sprawdz("dostawca_sceny", () => ({
  pusta_runda: D.dostawcaSceny(v0({}), "Lidl"), jest: D.dostawcaSceny(v0({ Lidl: {} }), "Lidl"), bez_klucza: D.dostawcaSceny(v0({ Lidl: {} }), undefined),
  po_tytule: D.dostawcaSceny(v0({ "Zakłady Mięsne „Rożen” z Łęcznej": {} }), "Zakłady Mięsne „Rożen” z Łęcznej") }));

// kliknięcie punktu sklepu bez oferty (runda 1 / sklep otwarty później) nie otwiera ogólnego ekranu dostawców
await sprawdz("klik_bez_oferty", () => {
  ZAPIS.length = 0; const ekrany = [];
  const c = kontekst(v0({}, { auto_dostawca: { zasady: { od_rundy: 3 } } }), ekrany);
  const p = { et: "Pieczywo", teczka: { ekran: "zaop_dostawy", dostawca: "auchan", dzialy: ["Pieczywo"], widok: "dzial" } };
  W.kliknijPunkt(0, { c, punkty: [{ p, ekran: "zaop_dostawy" }], def: { id: "auchan", tytul: "Auchan", dostawca: "Auchan" }, wejdz() {}, ustawWidok() {} });
  return { ekrany, tresc: ZAPIS.splice(0).join(" ") };
});

// okno sklepu z cenami: tylko zasoby z działu
await sprawdz("okno_sklepu", () => {
  const ceny = { Lidl: { Bułka: { 1: 100 }, Napój: { 1: 200 }, Sos: { 1: 300 } } };
  ZAPIS.length = 0; const ekrany = [], c = kontekst(v0(ceny), ekrany);
  c.kat = { zasoby: { Bułka: {}, Napój: {}, Sos: {} } };
  const p = { et: "Napoje", teczka: { ekran: "zaop_dostawy", dostawca: "lidl", dzialy: ["Napoje"], widok: "dzial" } };
  W.kliknijPunkt(0, { c, punkty: [{ p, ekran: "zaop_dostawy" }], def: { id: "lidl", tytul: "Lidl", dostawca: "Lidl" }, wejdz() {}, ustawWidok() {} });
  return { ekrany, tresc: ZAPIS.splice(0).join(" ") };
});

console.log(JSON.stringify({ wynik, bledy }));
