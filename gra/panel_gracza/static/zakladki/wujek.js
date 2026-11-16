// List od wujka (fable-wujek, 16.11.2026): prowadzenie za rękę na Planie tygodnia. Zastępuje kafelki „Plan rundy”:
// kroki są po kolei, każdy mówi, DOKĄD iść (miejsce w mieście) i co tam zrobić, a pierwszy niezrobiony jest wyróżniony.
// W pierwszych tygodniach nad krokami jest krótki list wujka (dawnego kierownika baru mlecznego w tym lokalu).
// Stan kroków liczony ze stanu po roboczych decyzjach (v.stan), tak jak dawny plan rundy.
import { esc } from "./wspolne.js";
import { ukryta } from "./funkcje.js";
import { wczytajGrafiki } from "../swiat/swiat.js";

// listy na kolejne tygodnie gry (liczone od pierwszej rundy gry); dalej wujek już nie pisze
const LISTY = [
  ["Klucze są Wasze.", "Zanim przyjdzie pierwszy gość, trzeba mieć gdzie, z kim i z czego gotować. W tym tygodniu jeszcze nic się nie sprzedaje, więc spokojnie: idźcie po kolei, jak na liście. Najważniejszy jest lokal, bo od okolicy zależy, kto do Was przyjdzie."],
  ["Otwieramy!", "Od dziś liczy się każda porcja. Sprawdźcie, czy jest towar w chłodni, czy każde danie ma swoje stanowisko i kogoś, kto przy nim stanie. Na początku przychodzi mniej gości, więc nie zamawiajcie towaru jak na wesele."],
  ["Pierwsze rachunki.", "Zajrzyjcie do kasy i do „Kuriera rankingowego”: tam widać, co zarobiło, a co zjadło pieniądze. Strata na początku to nie wstyd. Wstyd to nie wiedzieć, skąd się wzięła."],
  ["Czas pomyśleć o gościach.", "Lokal już chodzi, teraz niech będzie przyjemny. W Parku handlowym kupicie wyposażenie i wystrój. Wybierzcie taki, jaki lubią ludzie z Waszej okolicy, a nie taki, jaki podoba się Wam."],
];

function kroki(v) {
  const r = v.runda, st = v.stan, braki = Object.values(st.gotowe_uslugi || {}).flat();
  const ile = (typ) => (st.stanowiska || []).filter((s) => s.typ === typ).length;
  const zaw = (tekst) => braki.some((b) => b.includes(tekst));
  const dan = Object.keys(st.oferta || {}).length, ludzi = (st.pracownicy || []).length;
  const K = [];
  if (v.lokale) K.push(["lokale", "Stare Miasto", "Biuro „Klucz”: wybierz lokal", (st.lokale || []).length > 0,
    (st.lokale || []).length ? "lokal jest" : "od okolicy zależy, kto przyjdzie"]);
  K.push(
    ["bank", "Kamienica bankowa", "Załóż konto firmowe", !!st.bank, st.bank || "banki różnią się opłatami i debetem"],
    ["biuro", "Biurowiec przy Zana", "Wybierz, kto prowadzi księgi", !!st.biuro, st.biuro || "biuro rachunkowe albo księgi samodzielnie"],
    ["oferta", "Mój kebab · tablica", "Ułóż menu", dan > 0, dan ? `${dan} dań w menu` : "na start wystarczą trzy dania"],
    ["stanowiska", "Mój kebab · rożen", "Ustaw stanowiska kuchni i kasy", ile("kuchnia") > 0 && ile("kasa") > 0, `${ile("kuchnia")} kuchnia · ${ile("kasa")} kasa`],
    ["rynek_pracy", "Miasteczko akademickie", "Zatrudnij ludzi z tablicy ogłoszeń", ludzi > 0, ludzi ? `w zespole: ${ludzi}` : "ktoś musi stanąć przy rożnie i przy kasie"]);
  if (r >= 2) K.push(
    ["sprzet", "Park handlowy", "Kup albo wynajmij sprzęt", dan > 0 && !zaw("stanowiska z pracownikiem"), zaw("stanowiska z pracownikiem") ? "jakieś danie nie ma sprzętu albo kucharza" : "każde danie ma stanowisko"],
    ["zatrudnienie", "Mój kebab · lada", "Obsadź kasę", !zaw("obsadzonego stanowiska"), zaw("obsadzonego stanowiska") ? "brakuje kasjera z kompletem sprzętu" : "kasa obsadzona"],
    ["dostawcy", "Hurtownie", "Zamów składniki", !zaw("brak składnika"), zaw("brak składnika") ? "w magazynie brakuje składników" : "towar jest"],
    ["sprzedaz", "Mój kebab · tablica", "Ustaw ceny", !zaw("włączone do sprzedaży"), zaw("włączone do sprzedaży") ? "nie każde danie ma cenę" : "ceny ustawione"]);
  return K.filter(([k]) => !ukryta(v, k));
}

// co otwiera się w tym tygodniu, a co za tydzień (harmonogram gry: c.odRundy) – zamiast szukania kłódek w menu
const NOWOSCI = ["sprzet", "dostawcy", "sprzedaz", "raport", "karta_wynikow", "promocje", "udogodnienia", "wyposazenie", "dekor", "ubezpieczenia",
  "przejecia", "agencje", "handel", "internet"];
function nowosci(v, c) {
  if (!c?.odRundy) return "";
  const w = (r) => NOWOSCI.filter((k) => c.jestZakladka(k) && !c.wylaczona(k) && !c.ukryta(k) && c.odRundy(k) === r);
  const teraz = v.runda > (v.gra.runda_startowa || 1) ? w(v.runda) : [], potem = w(v.runda + 1);
  if (!teraz.length && !potem.length) return "";
  const link = (k) => `<a data-zakladka-k="${k}" href="#${k}">${esc(c.tytulZakladki(k))}</a>`;
  return `<div class="lw-nowe">${teraz.length ? `<span><b>Nowe w tym tygodniu:</b> ${teraz.map(link).join(", ")}</span>` : ""}
    ${potem.length ? `<span><b>Za tydzień otworzy się:</b> ${potem.map((k) => esc(c.tytulZakladki(k))).join(", ")}</span>` : ""}</div>`;
}

export function listWujka(v, c) {
  const nr = v.runda - (v.gra.runda_startowa || 1), list = LISTY[nr];
  const K = kroki(v), pierwszy = K.findIndex((k) => !k[3]);
  const wszystko = pierwszy < 0;
  if (list) wczytajGrafiki();   // portret wujka z zestawu grafik (pojawia się sam, gdy zestaw się wczyta)
  const html = K.map(([k, gdzie, co, ok, opis], i) => `<li class="${ok ? "zrobione" : i === pierwszy ? "teraz" : ""}"><a data-zakladka-k="${k}" href="#${k}">
    <span class="lw-nr" aria-hidden="true">${ok ? "✓" : i + 1}</span><span class="lw-co"><small>${esc(gdzie)}</small><b>${esc(co)}</b><span>${esc(opis)}</span></span>
    <span class="lw-stan">${ok ? "zrobione" : i === pierwszy ? "teraz →" : ""}</span></a></li>`).join("");
  const wyslij = `<li class="${v.wyslane ? "zrobione" : wszystko ? "teraz" : ""}"><a data-zakladka-k="wyslij" href="#wyslij">
    <span class="lw-nr" aria-hidden="true">${v.wyslane ? "✓" : K.length + 1}</span><span class="lw-co"><small>Poczta</small><b>Wyślij decyzje</b>
    <span>${v.wyslane ? "wysłane, do zamknięcia tygodnia można jeszcze poprawiać" : wszystko ? "wszystko gotowe" : "gdy lista wyżej jest odhaczona"}</span></span>
    <span class="lw-stan">${v.wyslane ? "zrobione" : wszystko ? "teraz →" : ""}</span></a></li>`;
  const zrobione = K.filter((k) => k[3]).length + (v.wyslane ? 1 : 0);
  return `<section class="lw-list ${list ? "" : "bez-listu"}" aria-label="Plan tygodnia krok po kroku">
    ${list ? `<div class="lw-kartka"><svg class="lw-portret" viewBox="0 0 64 80" aria-hidden="true"><use href="#g-wnetrze-portret-wujka" width="64" height="80"/></svg>
      <div><p class="lw-naglowek">List od wujka · tydzień ${v.runda}</p><h2>${esc(list[0])}</h2><p>${esc(list[1])}</p><p class="lw-podpis">Wasz wujek</p></div></div>` : ""}
    <div class="lw-kroki"><div class="lw-tytul"><span>Do zrobienia w tym tygodniu</span><span>${zrobione} z ${K.length + 1}</span></div><ol>${html}${wyslij}</ol>${nowosci(v, c)}</div></section>`;
}
