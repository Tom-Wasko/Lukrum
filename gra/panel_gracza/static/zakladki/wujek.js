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

const OSTATNI = ["Ostatni tydzień.", "Po tym tygodniu zamykamy rachunki sezonu. Nie zostawiajcie towaru, który się zepsuje, ani długów, które można spłacić. W tabeli ostatnie tygodnie ważą najwięcej, więc jeszcze wszystko może się zmienić."];

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

// Krok „teraz” na mapie miasta: budynek, do którego trzeba pójść, dostaje obwódkę i plakietkę „teraz”. Mapa (strona
// [mapa]) nie jest zmieniana: wystarcza reguła CSS po atrybucie data-id znacznika, więc działa też po przerysowaniu mapy.
const BUDYNEK_KROKU = { lokale: "agencja_nieruchomosci", bank: "kamienica_bankowa", biuro: "biurowiec_zana", rynek_pracy: "agencja_pracy",
  dostawcy: "makro", sprzet: "sprzet_gastro", wyslij: "poczta" };
// krok → punkt wnętrza (data-k klikalnego miejsca sceny i pozycji listy „Co tu zrobisz”, swiat/miejsca.js: cel)
const PUNKT_KROKU = { lokale: "lokale", bank: "bank", biuro: "biuro", oferta: "lokal_menu", sprzedaz: "lokal_menu", stanowiska: "wnetrze_sprzet",
  sprzet: "wnetrze_sprzet", zatrudnienie: "lokal_przeglad", rynek_pracy: "rynek_pracy", dostawcy: "zaop_dostawy" };
function celNaMapie(v, klucz) {
  const id = klucz ? BUDYNEK_KROKU[klucz] || v.stan.lokale?.[0]?.id : null;
  let styl = document.getElementById("lw-cel-styl");
  if (!id || !/^[\w-]+$/.test(id)) { styl?.remove(); return; }
  if (!styl) { styl = document.createElement("style"); styl.id = "lw-cel-styl"; document.head.appendChild(styl); }
  const z = `.lm-znak[data-id="${id}"]`;
  styl.textContent = `${z} { z-index: 19 !important; } ${z} .lm-kafel { outline: 3px solid var(--akcent); outline-offset: 3px; }
    ${z} .lm-kafel::after { content: "teraz"; position: absolute; left: 50%; bottom: calc(100% + 6px); translate: -50% 0; background: var(--akcent); color: var(--papier);
      font: 400 12px/1.5 var(--font-szyld); letter-spacing: .06em; text-transform: uppercase; padding: 0 6px; border-radius: 3px; white-space: nowrap; }
    @media (prefers-reduced-motion: no-preference) { ${z} .lm-kafel { animation: lw-puls 1.6s ease-in-out infinite; } }
    @keyframes lw-puls { 50% { outline-offset: 8px; } }`;
  const k = PUNKT_KROKU[klucz];   // to samo we wnętrzu: klikalne miejsce sceny i pozycja listy
  if (k) styl.textContent += `.sw-scena .hot[data-k="${k}"] { border: .22em solid var(--akcent); background: color-mix(in srgb, var(--akcent) 14%, transparent); }
    .sw-scena .hot[data-k="${k}"]::before { background: var(--akcent); } .sw-scena .hot[data-k="${k}"] .podpis { opacity: 1; background: var(--akcent); }
    .sw-lista button[data-k="${k}"] { box-shadow: inset 5px 0 0 var(--akcent); border-color: var(--akcent); }
    .sw-lista button[data-k="${k}"] b::after { content: " – teraz"; color: var(--akcent); font-family: var(--font-szyld); letter-spacing: .05em; text-transform: uppercase; font-size: .8em; }`;
}

export function listWujka(v, c) {
  const nr = v.runda - (v.gra.runda_startowa || 1);
  const list = v.runda === v.gra.liczba_rund && nr >= LISTY.length ? OSTATNI : LISTY[nr];
  const K = kroki(v), pierwszy = K.findIndex((k) => !k[3]);
  const wszystko = pierwszy < 0;
  celNaMapie(v, v.wyslane ? null : wszystko ? "wyslij" : K[pierwszy][0]);
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
