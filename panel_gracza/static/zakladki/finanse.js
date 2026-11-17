// Finanse: raport finansowy, KPiR, bank, biuro rachunkowe.
import { akcjeBanku, decyzjeBanku, wynikiBanku } from "./banki.js";
import { krokiKpir, LEKCJA_BANK, LEKCJA_KPIR, LEKCJA_RAPORT } from "./lekcje.js";
import { esc, kafelOferty, kafelkiLiczb, kartaMarki, KOLORY, OKRES, okno, podsumowanie, proc, strzalka, tabela, toast, wykres, zamknijOkno, zl, zl2, zwin, zwinTabela } from "./wspolne.js";
import { ewidencja, RODZAJ_ST } from "./inwestycje.js";

const GRUPY = [
  ["Zakup składników", (p) => p.towary],
  ["Wynagrodzenia", (p) => p.wynagrodzenia],
  ["Składki ZUS pracodawcy", (p) => p.opis.startsWith("Składki ZUS") ? p.pozostale : 0],
  ["Rekrutacja", (p) => /^Koszt zatrudnienia/.test(p.opis) ? p.pozostale : 0],
  ["Stanowiska", (p) => p.opis.startsWith("Uruchomienie stanowiska") ? p.pozostale : 0],
  ["Sprzęt (zakup)", (p) => p.opis.startsWith("Koszt zakupu: ") ? p.pozostale : 0],
  ["Udogodnienia i wyposażenie (zakup)", (p) => /^Koszt zakupu (udogodnień|wyposażenia)/.test(p.opis) ? p.pozostale : 0],
  ["Utrzymanie sprzętu, udogodnień i wyposażenia", (p) => /^Koszty utrzymania/.test(p.opis) ? p.pozostale : 0],
  ["Marketing", (p) => /reklam/i.test(p.opis) ? p.pozostale : 0],
  ["Szkolenia", (p) => p.opis.startsWith("Szkolenie") ? p.pozostale : 0],
  ["Utrzymanie lokalu i magazynu", (p) => /utrzymania lokalu|magazynowania|^Wynajem chłodni/.test(p.opis) ? p.pozostale : 0],
  ["Bank (opłaty, odsetki)", (p) => /^(Opłata za konto|Odsetki)/.test(p.opis) ? p.pozostale : 0],
  ["Biuro rachunkowe", (p) => /biura rachunkowego|kadrowo/.test(p.opis) ? p.pozostale : 0],
];

// Samodzielna księgowość (silnik/ksiegowosc/biuro.py): wynik podatkowy rundy – dopiero po deklaracjach drużyny.
export const UKRYTE = `<div class="komunikat">Księgujesz samodzielnie: dochód, KPiR, VAT i podatki za tę rundę zobaczysz po złożeniu deklaracji
  (<a data-zakladka-k="biuro">Biurowiec przy Zana ▸ Biuro rachunkowe</a>) i przeliczeniu rundy – albo wybierz tam biuro, które rozliczy rundę od razu.</div>`;

function koszty(k) {
  const wynik = GRUPY.map(([n, f]) => [n, k.pozycje.reduce((s, p) => s + f(p), 0)]);
  const znane = wynik.reduce((s, [, x]) => s + x, 0);
  wynik.push(["Inne", k.koszty - znane]);
  return wynik.filter(([, x]) => Math.abs(x) > 0.004);
}

// Uzgodnienie kasy z KPiR (silnik/ksiegowosc/uzgodnienie.py): skąd wzięła się zmiana salda – metodą pośrednią.
function uzgodnienieHtml(U) {
  if (!U) return "";
  const wiersze = [["Saldo konta na początku rundy", zl2(U.poczatek)],
    ["+ przychody z KPiR", zl2(U.przychody)], ["− koszty z KPiR", zl2(-U.koszty)],
    ...(U.bez_gotowki ? [["+ koszty bez wydatku (amortyzacja, niezamortyzowana wartość)", zl2(U.bez_gotowki)]] : []),
    ...(U.vat_nalezny || U.vat_naliczony ? [["+ VAT należny (w cenach sprzedaży)", zl2(U.vat_nalezny)],
      ["− VAT naliczony (w cenach zakupów)", zl2(-U.vat_naliczony)]] : []),
    ...U.poza.map((p) => [`± ${esc(p.nazwa)}`, zl2(p.kwota)]),
    ["<b>Saldo wyliczone</b>", `<b>${zl2(U.obliczona)}</b>`], ["Saldo konta na koniec rundy", zl2(U.koniec)]];
  const ok = U.roznica === 0 && U.roznica_kpir === 0 && U.roznica_rachunku === 0;
  return `<details><summary>Uzgodnienie kasy z KPiR – ${ok ? "zgodne co do grosza" : `<b>różnica ${zl2(U.roznica)}</b>`}</summary>`
    + tabela(null, ["Skąd zmiana salda", "Kwota"], wiersze, { klasy: ["l", "r"], stopka: ["Różnica", zl2(U.roznica)] })
    + `<p class="podpowiedz">Każda złotówka, która weszła na konto lub z niego wyszła, jest albo w KPiR (z VAT), albo
      w jednej z operacji poza księgą – kredyty, lokaty, kaucje, inwestycje, podatki. Główna księgowa LUKRUM sprawdza to
      co rundę i jeszcze ani razu nie zgubiła grosza. Twierdzi, że raz jeden grosz próbował uciec, ale go dogoniła.</p></details>`;
}

export const raport = {
  tytul: "Raport finansowy", tytulPelny: "Finanse - raport finansowy", ikona: "📊", odblokowanie: (v) => v.runda >= 2,
  info: () => `Podsumowanie wyników finansowych poprzedniego ${OKRES.dopelniacz} i wszystkich dotychczasowych rund.`,
  wyniki({ v }) {
    const k = v.wyniki.kpir;
    if (k.ukryte) return UKRYTE;
    const przych = k.pozycje.filter((p) => p.przychod || p.przychod_pozostaly).map((p) => [esc(p.opis), zl2(p.przychod + p.przychod_pozostaly)]);
    const kos = koszty(k).map(([n, x]) => [n, zl2(x)]);
    const h = v.historia || [];
    const skum = h.reduce((s, x) => s + (x.dochod_netto || 0), 0);
    const netto = k.dochod_netto, przedN = h.length >= 2 ? h[h.length - 2].dochod_netto : null, przedG = h.length >= 2 ? h[h.length - 2].gotowka : null;
    const lead = podsumowanie([
      netto >= 0 ? `W ostatnim ${OKRES.miejscownik} firma zarobiła na czysto <b>${zl(netto)}</b> (przychody ${zl(k.przychody)}, koszty ${zl(k.koszty)}).`
        : `W ostatnim ${OKRES.miejscownik} firma poniosła stratę <b>${zl(-netto)}</b> – koszty (${zl(k.koszty)}) przewyższyły przychody (${zl(k.przychody)}).`,
      `Na koncie jest ${zl(v.wyniki.gotowka)}${v.wyniki.zadluzenie > 0 ? `, a dług z kredytów to ${zl(v.wyniki.zadluzenie)}` : ", bez kredytów do spłaty"}.`], netto >= 0 ? "ok" : "zly");
    const kafle = kafelkiLiczb([
      { etykieta: "Przychody", wartosc: zl(k.przychody) }, { etykieta: "Koszty", wartosc: zl(k.koszty) },
      { etykieta: "Dochód netto", wartosc: zl(netto), delta: strzalka(netto, przedN, { format: zl }), ton: netto >= 0 ? "plus" : "minus" },
      { etykieta: "Saldo konta", wartosc: zl(v.wyniki.gotowka), delta: strzalka(v.wyniki.gotowka, przedG, { format: zl }) },
      v.wyniki.zadluzenie > 0 && { etykieta: "Zadłużenie", wartosc: zl(v.wyniki.zadluzenie), ton: "minus" }]);
    return lead + kafle + `<div class="wykres"><canvas id="w-wynik"></canvas></div>`
      + zwin("Przychody i koszty", `<div class="dwie">
      <div>${tabela("Przychody", ["Pozycja", "Kwota"], przych, { klasy: ["l", "r"], stopka: ["Razem", zl2(k.przychody)] })}</div>
      <div>${tabela("Koszty", ["Pozycja", "Kwota"], kos, { klasy: ["l", "r"], stopka: ["Razem", zl2(k.koszty)] })}</div></div>`)
      + zwinTabela("Wynik", ["", `Ostatni ${OKRES.mianownik}`, "Wszystkie rundy"], [
        ["Dochód do opodatkowania", zl2(k.dochod), ""], ["Podatek dochodowy", zl2(k.podatek), ""],
        ["<b>Dochód netto</b>", `<b>${zl2(k.dochod_netto)}</b>`, `<b>${zl2(skum)}</b>`],
        [`Saldo konta na koniec ${OKRES.dopelniacz}`, zl2(v.wyniki.gotowka), ""], ["Lokaty", zl2(v.wyniki.lokaty), ""],
        ["Zadłużenie (kredyty)", zl2(v.wyniki.zadluzenie), ""]], { klasy: ["l", "r", "r"], otwarte: true })
      + uzgodnienieHtml(v.wyniki.uzgodnienie) + LEKCJA_RAPORT;
  },
  po({ v }) {
    const h = v.historia || [];
    wykres("w-wynik", "bar", h.map((x) => x.skrot || x.miesiac), [{ label: "Dochód netto", data: h.map((x) => x.dochod_netto) },
      { label: "Saldo konta", data: h.map((x) => x.gotowka), type: "line" }]);
  },
};

export const kpir = {
  tytul: "KPiR", tytulPelny: "KPiR – księga przychodów i rozchodów", ikona: "📒", odblokowanie: (v) => v.runda >= 2,
  info: ({ v }) => `Księga przychodów i rozchodów za ${v.runda >= 2 ? (v.historia?.[v.runda - 2]?.miesiac || "") : ""}.`,
  wyniki({ v }) {
    const k = v.wyniki.kpir, R = v.wyniki.rozliczenie;
    if (k.ukryte) return UKRYTE;
    const s = (f) => k.pozycje.reduce((a, p) => a + f(p), 0);
    // kolumny z samymi zerami są ukrywane (Lp., opis i kolumny „Razem” zostają zawsze)
    const KOL = [["Lp.", null, "", (p, i) => i + 1], ["Opis zdarzenia gospodarczego", null, "l", (p) => esc(p.opis)],
      ["Wartość sprzedanych towarów i usług", "przychod", "r"], ["Pozostałe przychody", "przychod_pozostaly", "r"],
      ["Razem przychód", null, "r", (p) => zl2(p.przychod + p.przychod_pozostaly), zl2(k.przychody)],
      ["Zakup towarów i materiałów", "towary", "r"], ["Wynagrodzenia", "wynagrodzenia", "r"], ["Pozostałe wydatki", "pozostale", "r"],
      ["Razem wydatki", null, "r", (p) => zl2(p.wynagrodzenia + p.pozostale), zl2(k.wynagrodzenia + k.pozostale)]]
      .filter(([, pole]) => !pole || k.pozycje.some((p) => p[pole]));
    const w = k.pozycje.map((p, i) => KOL.map(([, pole, , f]) => (f ? f(p, i) : zl2(p[pole]))));
    const stopka = KOL.map(([n, pole, , f, suma], i) => i === 0 ? "" : i === 1 ? "Suma" : suma ?? zl2(s((p) => p[pole])));
    const lead = podsumowanie(`W KPiR zapisano <b>${k.pozycje.length}</b> ${k.pozycje.length === 1 ? "operację" : "operacji"}: przychody ${zl(k.przychody)}, koszty ${zl(k.koszty)}, dochód do opodatkowania <b>${zl(k.dochod)}</b>.`, k.dochod >= 0 ? "" : "uwaga");
    return lead + kafelkiLiczb([{ etykieta: "Przychody", wartosc: zl(k.przychody) }, { etykieta: "Koszty", wartosc: zl(k.koszty) },
      { etykieta: "Dochód", wartosc: zl(k.dochod), ton: k.dochod >= 0 ? "plus" : "minus" }, { etykieta: "Dochód netto", wartosc: zl(k.dochod_netto), opis: "po podatku" }])
      + zwinTabela("Księga przychodów i rozchodów", KOL.map(([n]) => n), w,
      { klasy: KOL.map(([, , kl]) => kl), stopka, otwarte: true })
      + tabela(null, ["", "Kwota"], [["Dochód do opodatkowania", zl2(k.dochod)], ...(R
        ? [["Zaliczka na PIT", zl2(R.zaliczka)], ["Składka zdrowotna", zl2(R.zdrowotna)]]   // JDG – zakładka Podatki
        : [["Podatek", zl2(k.podatek)]]), ["Dochód netto", zl2(k.dochod_netto)]], { klasy: ["l", "r"] })
      + (R ? `<p class="podpowiedz">Kwoty w KPiR są netto – VAT jest w zakładce Urzędy ▸ VAT.</p>` : "")
      + (v.gra.lokale ? amortyzacja(v) : "") + LEKCJA_KPIR;
  },
};

// ewidencja środków trwałych i odpisy amortyzacji (dawniej osobna zakładka Środki trwałe)
function amortyzacja(v) {
  const a = v.amortyzacja || { prog: 0, stawki: {} };
  const stawki = Object.entries(a.stawki).filter(([, s]) => s > 0).map(([r, s]) => `${esc(RODZAJ_ST[r] || r)}: ${proc(s)} rocznie`).join(" · ");
  const odpisy = (v.wyniki?.kpir?.pozycje || []).filter((p) => p.opis.startsWith("Amortyzacja") || p.opis.startsWith("Niezamortyzowana"))
    .map((p) => [esc(p.opis), zl2(p.pozostale)]);
  return `<div class="sekcja-tytul" style="margin-top:24px">Środki trwałe i amortyzacja</div>`
    + ewidencja(v.wyniki?.srodki_trwale, "Ewidencja środków trwałych na koniec rundy")
    + tabela("Odpisy w KPiR", ["Pozycja", "Kwota"], odpisy.length ? odpisy : [["W tej rundzie bez odpisów.", ""]], { klasy: ["l"] })
    + `<p class="podpowiedz">Kupiony lokal, wybudowany budynek i zakupy od ${zl(a.prog)} netto to środki trwałe: płacisz od razu,
       ale w KPiR koszt rozkłada się na lata – odpis liniowo od rundy po zakupie (${stawki}; grunt się nie amortyzuje).
       ${a.niskocenne && v.stan?.amortyzacja_niskocenna === "amortyzacja" ? `Tańsze zakupy też amortyzujesz (${proc(a.niskocenne.stawka, 0)} rocznie) – wybór w Biurowiec przy Zana ▸ Biuro rachunkowe.`
         : `Tańsze zakupy idą od razu w koszty${a.niskocenne ? " (możesz je amortyzować – wybór w Biurowiec przy Zana ▸ Biuro rachunkowe)" : ""}.`} Przy sprzedaży niezamortyzowana wartość idzie w koszty. Amortyzacja zmniejsza dochód
       i podatek, ale nie gotówkę.</p>`;
}

let zakladkaBanku = "historia", wyborBanku = false;
export const bank = {
  tytul: "Bank", tytulPelny: "Finanse - bank", ikona: "🏦", odblokowanie: "finanse_bank",
  info: "Wybierz bank, w którym Twoja firma będzie prowadzić konto firmowe. Zarządzaj lokatami i kredytami.",
  wynikiGdy: (v) => !!v.gra.lokale,   // w grze z lokalami: opłaty, raty, przejęcia (silnik/pieniadze/banki.py)
  wyniki: (c) => wynikiBanku(c),
  decyzje({ v, kat, edycja }) {
    if (v.gra.lokale) return decyzjeBanku({ v, kat, edycja }) + LEKCJA_BANK;
    const banki = kat.oferty.banki.pozycje;
    const wybrany = v.stan.bank;
    const dostepny = (b) => (b.od_rundy || 1) <= v.runda;
    const karta = (b) => `<div class="kafel ${b.nazwa === wybrany ? "wybrany" : ""} ${dostepny(b) ? "" : "niedostepny"}"><div class="kg">${esc(b.nazwa)}
      ${dostepny(b) ? "" : `<span class="pigulka inf">od rundy ${b.od_rundy}</span>`}</div><div class="kt">
      <div class="wiersz"><span>Opłata za konto</span><span>${zl(b.konto)}</span></div><div class="wiersz"><span>Opłata za kartę</span><span>${zl(b.karta)}</span></div>
      <div class="wiersz"><span>Oprocentowanie lokaty</span><span>${proc(b.lokata, 0)}</span></div>
      <div class="wiersz"><span>Oprocentowanie kredytu odnawialnego</span><span>${proc(b.kredyt_odnawialny, 0)}</span></div>
      <div class="wiersz"><span>Oprocentowanie kredytu</span><span>${proc(b.kredyt, 0)}</span></div></div>
      <div class="kd">${b.nazwa === wybrany ? `<button class="btn zielony">✓ Wybrano</button>` : `<button class="btn czarny" data-akcja="bank" data-b="${esc(b.nazwa)}" ${edycja && dostepny(b) ? "" : "disabled"}>${dostepny(b) ? "Wybierz" : `Dostępny od rundy ${b.od_rundy}`}</button>`}</div></div>`;
    if (!wybrany || wyborBanku) return `${wybrany ? `<button class="btn pom" data-akcja="bank-powrot">Powrót do banku</button>` : ""}<div class="siatka trojka" style="margin-top:16px">${banki.map(karta).join("")}</div>`;
    const b = banki.find((x) => x.nazwa === wybrany);
    const zak = { historia: "Historia rachunku", lokaty: "Lokaty", kredyt: "Kredyt", odnawialny: "Kredyt odnawialny" };
    let html = `<div class="kafel"><div class="kt" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;align-items:center">
      <div><h3 style="margin:0 0 6px">${esc(b.nazwa)}</h3>Waluta: złoty (PLN)<br>Dostępne saldo: <b class="akcent">${zl(v.stan.gotowka)}</b>
        <span class="podpowiedz">(po decyzjach tej rundy, przed sprzedażą)</span></div>
      <button class="btn pom" data-akcja="zmien-bank" ${edycja ? "" : "disabled"}>Zmień bank</button></div></div>
      <div class="przelacznik" style="justify-content:flex-end;margin:16px 0">${Object.entries(zak).map(([k, n]) => `<a class="${zakladkaBanku === k ? "aktywny" : ""}" data-akcja="bank-zak" data-k="${k}">${n}</a>`).join("")}</div>`;
    if (zakladkaBanku === "historia") {
      const op = v.wyniki?.rachunek || [];
      html += tabela(null, ["Operacja", "Kwota", "Saldo"], op.map((o) => [esc(o.opis), `<span class="${o.kwota < 0 ? "minus" : "plus"}">${zl2(o.kwota)}</span>`, zl2(o.saldo)]), { klasy: ["l", "r", "r"] })
        + `<p class="podpowiedz">Historia rachunku z poprzedniego ${OKRES.dopelniacz}.</p>`;
    } else if (zakladkaBanku === "lokaty") {
      const doKonca = v.gra.liczba_rund - v.runda;
      const zerw = v.decyzje.lokaty_zerwij || [];
      html += tabela(null, ["Nazwa", "Runda założenia", "Okres", "Oprocentowanie", "Kwota", ""], v.stan_przed.lokaty.map((l) => [`Lokata nr ${l.id}`, `runda ${l.od_rundy}`,
        `${l.miesiecy} ${OKRES.skrot}`, proc(l.oprocentowanie, 2), zl2(l.kwota), `<button class="btn ${zerw.includes(l.id) ? "zielony" : "czarny"} maly" data-akcja="zerwij" data-id="${l.id}" ${edycja ? "" : "disabled"}>${zerw.includes(l.id) ? "✓ Zerwana" : "Zerwij"}</button>`]), { klasy: ["l"] })
        + ((v.decyzje.lokaty_zaloz || []).length ? `<p>Nowe lokaty w tej rundzie: ${(v.decyzje.lokaty_zaloz || []).map((l, i) => `${zl(l.kwota)} na ${l.miesiecy} ${OKRES.skrot} <a href="#" data-akcja="usun-lokate" data-i="${i}">usuń</a>`).join(", ")}</p>` : "")
        + (doKonca >= 1 ? `<p><button class="btn zielony" data-akcja="nowa-lokata" data-max="${doKonca}" ${edycja ? "" : "disabled"}>Załóż lokatę</button>
          <span class="podpowiedz">Odsetki ${proc(b.lokata, 0)} rocznie, wypłacane na koniec okresu (najpóźniej w ostatniej rundzie). Zerwanie = utrata odsetek.</span></p>` : "");
    } else if (zakladkaBanku === "kredyt") {
      const spl = v.decyzje.kredyty_splac || [];
      html += tabela(null, ["Nazwa", "Runda zaciągnięcia", "Kwota", "Okres", "Rata kapitałowa", "Do spłaty", ""], v.stan_przed.kredyty.map((k) => [`Kredyt nr ${k.id}`,
        `runda ${k.od_rundy}`, zl2(k.kwota), `${k.miesiecy} ${OKRES.skrot}`, zl2(k.kwota / k.miesiecy), zl2(k.pozostalo),
        `<button class="btn ${spl.includes(k.id) ? "zielony" : "czarny"} maly" data-akcja="splac" data-id="${k.id}" ${edycja ? "" : "disabled"}>${spl.includes(k.id) ? "✓ Spłacony" : "Spłać"}</button>`]), { klasy: ["l"] })
        + ((v.decyzje.kredyty_wez || []).length ? `<p>Nowe kredyty: ${(v.decyzje.kredyty_wez || []).map((k, i) => `${zl(k.kwota)} na ${k.miesiecy} ${OKRES.skrot} <a href="#" data-akcja="usun-kredyt" data-i="${i}">usuń</a>`).join(", ")}</p>` : "")
        + `<p><button class="btn zielony" data-akcja="nowy-kredyt" ${edycja ? "" : "disabled"}>Weź kredyt</button>
          <span class="podpowiedz">Oprocentowanie ${proc(b.kredyt, 0)} rocznie, raty kapitałowe równe + odsetki od pozostałej kwoty, od następnej rundy.</span></p>`;
    } else {
      html += tabela(null, ["", "Kwota"], [["Aktualny stan zadłużenia", zl2(v.stan_przed.kredyt_odnawialny)], ["Oprocentowanie", proc(b.kredyt_odnawialny, 0)]], { klasy: ["l", "r"] })
        + `<p class="podpowiedz">Kredyt odnawialny uruchamia się sam, gdy zabraknie gotówki, i jest spłacany automatycznie z nadwyżki gotówki.</p>`;
    }
    return html;
  },
  akcje: {
    ...akcjeBanku,
    bank: (el, c) => { wyborBanku = false; return c.zmien((d) => { d.bank = el.dataset.b; }); },
    "zmien-bank": (el, c) => { wyborBanku = true; c.idz("bank", "decyzje"); },
    "bank-powrot": (el, c) => { wyborBanku = false; c.idz("bank", "decyzje"); },
    "bank-zak": (el, c) => { zakladkaBanku = el.dataset.k; c.idz("bank", "decyzje"); },
    zerwij: (el, c) => c.zmien((d) => { const id = +el.dataset.id, l = d.lokaty_zerwij || []; d.lokaty_zerwij = l.includes(id) ? l.filter((x) => x !== id) : [...l, id]; }),
    splac: (el, c) => c.zmien((d) => { const id = +el.dataset.id, l = d.kredyty_splac || []; d.kredyty_splac = l.includes(id) ? l.filter((x) => x !== id) : [...l, id]; }),
    "usun-lokate": (el, c, e) => { e.preventDefault(); return c.zmien((d) => { d.lokaty_zaloz.splice(+el.dataset.i, 1); }); },
    "usun-kredyt": (el, c, e) => { e.preventDefault(); return c.zmien((d) => { d.kredyty_wez.splice(+el.dataset.i, 1); }); },
    "nowa-lokata": (el, c) => okno("Zakładanie lokaty", `<div class="dwie"><label class="pole">Kwota lokaty<input type="number" id="l-kwota" min="1" step="100" value="${Math.max(0, Math.floor(c.v.stan.gotowka))}"></label>
      <label class="pole">Okres (${OKRES.mnoga})<input type="number" id="l-mies" min="1" max="${el.dataset.max}" value="1"></label></div>
      <p class="podpowiedz">Dostępne saldo: ${zl(c.v.stan.gotowka)}. Pieniądze na lokacie nie są dostępne na bieżące wydatki.</p>`,
      { male: true, przyciski: `<button class="btn jasny" data-akcja="zamknij-okno">Zamknij</button><button class="btn zielony" data-akcja="zaloz" data-max="${el.dataset.max}">Załóż</button>` }),
    zaloz: async (el, c) => {
      const kwota = +document.getElementById("l-kwota").value, m = Math.min(+el.dataset.max, Math.max(1, +document.getElementById("l-mies").value));
      if (!(kwota > 0)) return toast("Podaj kwotę.");
      zamknijOkno();
      await c.zmien((d) => { d.lokaty_zaloz = [...(d.lokaty_zaloz || []), { kwota, miesiecy: m }]; });
    },
    "nowy-kredyt": (el, c) => okno("Kredyt", `<div class="dwie"><label class="pole">Kwota kredytu<input type="number" id="k-kwota" min="100" step="1000" value="10000"></label>
      <label class="pole">Okres (${OKRES.mnoga})<input type="number" id="k-mies" min="1" max="${c.kat.oferty.banki.kredyt_maks_miesiecy}" value="6"></label></div>
      <p class="podpowiedz">Kredyt obniża wskaźnik zadłużenia w karcie wyników. Gotówka na koncie i majątek firmy
        łagodzą spadek – najbardziej szkodzi kredyt wydany na bieżące koszty.</p>`,
      { male: true, przyciski: `<button class="btn jasny" data-akcja="zamknij-okno">Zamknij</button><button class="btn zielony" data-akcja="wez-kredyt">Weź kredyt</button>` }),
    "wez-kredyt": async (el, c) => {
      const kwota = +document.getElementById("k-kwota").value, m = Math.max(1, Math.min(c.kat.oferty.banki.kredyt_maks_miesiecy, +document.getElementById("k-mies").value));
      if (!(kwota > 0)) return toast("Podaj kwotę.");
      zamknijOkno();
      await c.zmien((d) => { d.kredyty_wez = [...(d.kredyty_wez || []), { kwota, miesiecy: m }]; });
    },
  },
};

// Gra z lokalami (silnik/ksiegowosc/biuro.py): biura z mapy albo samodzielna księgowość – dokumenty z poprzedniej rundy
// do zaksięgowania (kolumna KPiR, stawka VAT) i trzy deklaracje; podsumowanie liczone na bieżąco z zapisów.
const STAWKI = [0, 0.05, 0.08, 0.23];
const PRZYCHODY = ["przychod", "przychod_pozostaly"];
const r2 = (x) => Math.round(x * 100) / 100;

function czesci(x, z) {   // [{stawka, brutto}] dokumentu wg zapisu drużyny (faktura z kilkoma stawkami – rozbicie)
  if (x.stawki) return x.stawki;
  return z.stawka == null || z.stawka === "" ? [] : [{ stawka: Number(z.stawka), brutto: x.brutto }];
}

// Kwoty deklaracji z zapisów drużyny – ten sam wzór co silnik/ksiegowosc/rozliczenie.py (od stanu przed rundą).
export function podsumowanieDeklaracji(D, zapisy, P) {
  const s = { przychody: 0, koszty: 0, nalezny: 0, naliczony: 0, zaksiegowane: 0 };
  for (const x of D.dokumenty) {
    const z = zapisy[x.id] || {};
    if (!z.kolumna) continue;
    s.zaksiegowane++;
    const vat = czesci(x, z).reduce((a, c) => a + r2(c.brutto * c.stawka / (1 + c.stawka)), 0);
    const netto = x.brutto - vat, znak = x.kierunek === "wplyw" ? 1 : -1;   // dowód wewnętrzny – jak wydatek
    if (PRZYCHODY.includes(z.kolumna)) { s.przychody += znak * netto; s.nalezny += znak * vat; }
    else if (z.kolumna === "poza") s.naliczony -= znak * vat;          // VAT od środka trwałego – do odliczenia
    else { s.koszty -= znak * netto; s.naliczony -= znak * vat; }
  }
  const st = D.stan_przed, dochod = r2(s.przychody - s.koszty);
  const zdrowotna = Math.max(r2(Math.max(0, dochod) * P.zdrowotna), P.zdrowotna_minimum);
  const odl = Math.max(0, Math.min(zdrowotna, P.limit_odliczenia - st.zdrowotna_odliczona));
  const podstawa = Math.round(Math.max(0, st.dochod + dochod - st.zdrowotna_odliczona - odl));
  const pit = Math.max(0, Math.round(podstawa * P.pit) - Math.round(st.zaliczki));
  const saldo = r2(s.nalezny - s.naliczony - st.vat_nadwyzka);
  return { ...s, przychody: r2(s.przychody), koszty: r2(s.koszty), nalezny: r2(s.nalezny), naliczony: r2(s.naliczony),
    dochod, zdrowotna: r2(zdrowotna), podstawa, pit, saldo, vat: saldo > 0 ? Math.round(saldo) : 0 };
}

const wybierz = (id, wybrane, edycja, napis = "Wybierz") => id === wybrane ? `<button class="btn zielony">✓ Wybrano</button>`
  : `<button class="btn czarny" data-akcja="biuro" data-b="${esc(id)}" ${edycja ? "" : "disabled"}>${napis}</button>`;

// zakupy poniżej progu amortyzacji – od razu w koszty (domyślnie) albo do ewidencji z amortyzacją
function wyborNiskocennych(v, d, edycja) {
  const a = v.amortyzacja || {}, N = a.niskocenne;
  if (!N) return "";
  const wyb = d.amortyzacja_niskocenna || v.stan.amortyzacja_niskocenna || "koszty", dis = edycja ? "" : "disabled";
  const opcja = (id, napis) => wyb === id ? `<button class="btn zielony">✓ ${napis}</button>`
    : `<button class="btn czarny" data-akcja="niskocenne" data-n="${id}" ${dis}>${napis}</button>`;
  return `<h3>Zakupy tańsze niż ${zl(a.prog)}</h3>
    <div class="wiersz">${opcja("koszty", "Od razu w koszty")} ${opcja("amortyzacja", `Amortyzuję (${proc(N.stawka, 0)} rocznie)`)}</div>
    <p class="podpowiedz">Sprzęt, wyposażenie i stanowiska tańsze niż próg możesz wpisać od razu w koszty (niższy dochód i podatek
    w rundzie zakupu) albo do ewidencji środków trwałych – wtedy koszt w KPiR rozkłada się na lata, od rundy po zakupie.
    Podatek nie znika, tylko przesuwa się w czasie; majątek firmy w karcie wyników liczy się tak samo. Wybór obowiązuje
    dla zakupów od tej rundy (wcześniejszych nie przeksięgowuje) i trwa do zmiany.</p>`;
}

// biuro jako karta marki w dwóch kolumnach (jak wybór banku): pakiety S / M / L z limitem dokumentów i dopłatą
const wb = (a, b) => `<div class="wiersz"><span>${a}</span><span>${b}</span></div>`;
// opłata za zmianę biura (silnik/ksiegowosc/biuro.py: oplata_zmiany): tydzień pakietu nowego biura, nie dotyczy pierwszego wyboru
// pakiet z decyzji wchodzi od razu tylko w biurze bez opóźnienia zmiany pakietu (i bez zapowiedzianej zmiany)
const oplataZmiany = (K, b, pakiet) => (K.ostatnie_biuro && K.ostatnie_biuro !== b.id
  ? b.oplata_zmiany[pakiet && !b.zmiana_pakietu_po && !K.pakiet_nastepny ? pakiet : K.pakiet] : 0) || 0;
function kartaBiuraMarki(b, i, wybrane, edycja, K, wyr) {
  const moj = b.id === wybrane, dis = edycja ? "" : "disabled";
  const obecny = K.pakiet_nastepny ? K.pakiet_nastepny.pakiet : K.pakiet;
  const pakiety = Object.entries(b.pakiety).map(([p, x]) => {
    const wybrany = moj && obecny === p, sz = b.szacunki[p];
    return wb(`<b>${p}</b>: ${zl(x.cena)} / mies., do ${b.limity_rundy[p]} dok. / rundę, dopłata ${zl2(x.doplata)} za dok.`
      + (b.najlepszy_pakiet === p ? ` <span class="pigulka inf">na Twoje dokumenty</span>` : ""),
    wybrany ? `<button class="btn zielony">✓ ${p}</button>`
      : `<button class="btn czarny maly" data-akcja="biuro-pakiet" data-b="${esc(b.id)}" data-p="${p}" ${dis}>${p} – ${zl2(sz.razem)} / rundę</button>`);
  }).join("");
  const koszt = kafelOferty({ tytul: "Pakiety", pigulka: moj ? "Twoje biuro" : "", duza: zl(b.szacunki[b.najlepszy_pakiet].razem),
    podpis: `najtańszy pakiet (${b.najlepszy_pakiet}) na rundę przy ${K.dokumenty_szacunek} dok.`, tresc: pakiety, stopka: "" });
  const ryzyko = kafelOferty({ tytul: "Kadry i ryzyko", duza: proc(b.ryzyko_bledu, 0), podpis: "ryzyko błędu w deklaracji",
    tresc: wb("Ubezpieczenie OC", b.oc ? "tak – oddaje mandat" : "<b>nie</b> – mandat płacisz Ty")
      + wb("Cecha biura", esc(b.cecha)) + (b.zamkniete_w_swieta ? wb("W tygodniu ze świętem", `zamknięte, dopłata ${zl2(b.zamkniete_w_swieta.doplata)} za dokument`) : "")
      + (b.zmiana_pakietu_po ? wb("Zmiana pakietu trwa", `${b.zmiana_pakietu_po} rundy`) : "")
      + (K.ostatnie_biuro && K.ostatnie_biuro !== b.id ? wb("Opłata za przejście do tego biura", `<span class="znak-uwaga">${zl2(oplataZmiany(K, b))}</span> jednorazowo`) : "")
      + wb("Kadry: etat / zlecenie", `${zl2(b.kadry.etat)} / ${zl2(b.kadry.zlecenie)}`) + (b.kadry.w_cenie ? wb("Kadry w cenie", `${b.kadry.w_cenie} os.`) : "") });
  return kartaMarki({ kolor: KOLORY[(i + 1) % KOLORY.length], nazwa: b.nazwa, rodzaj: b.wlasciciel || "",
    opis: (wyr.length ? `<b class="bank-najlepszy">${wyr.join(" · ")}</b>` : "") + `<details class="opis-marki"><summary>O biurze</summary>${esc(b.opis)}</details>`,
    tresc: `<div class="siatka dwojka">${koszt}${ryzyko}</div>` });
}
function kartySamodzielnie(S, tanie, wybrane, edycja) {
  const kafel = kafelOferty({ tytul: "Samodzielne księgowanie", pigulka: wybrane === "samodzielnie" ? "Twój wybór" : "", duza: zl(0), podpis: "opłata – dokumenty i deklaracje robi drużyna",
    tresc: wb("Mandat za błędną deklarację", zl(S.kara_blad)) + wb("Bez deklaracji – mandat co rundę", `<b>${zl(S.kara_brak)}</b>`)
      + (tanie ? wb(`Najtańsze biuro (${esc(tanie.nazwa)})`, `${zl2(tanie.szacunki[tanie.najlepszy_pakiet].razem)} / rundę`) : ""),
    stopka: wybierz("samodzielnie", wybrane, edycja, "Księguję samodzielnie") });
  return kartaMarki({ kolor: "var(--szary)", nazwa: "Samodzielnie", znak: "✎", rodzaj: "bez biura", opis: `Bez opłaty za biuro – dokumenty księguje i deklaracje składa drużyna.<details class="opis-marki"><summary>Jak to działa</summary>${esc(S.opis)}</details>`, tresc: kafel });
}
function wyroznienia(oferty) {   // „Najtańsze”, „Najmniejsze ryzyko” – jak „Najlepszy” przy bankach
  const min = (f) => oferty.reduce((a, b) => (!a || f(b) < f(a) ? b : a), null);
  const tanie = min((b) => b.szacunki[b.najlepszy_pakiet].razem), pewne = min((b) => b.ryzyko_bledu - (b.oc ? 1e-9 : 0));
  return (b) => [b === tanie ? "Najtańsze" : "", b === pewne ? "Najmniejsze ryzyko błędu" : ""].filter(Boolean);
}

function decyzjeKsiegowosci({ v, edycja }) {
  const K = v.ksiegowosc, d = v.decyzje || {}, wybrane = d.biuro || v.stan.biuro, S = K.samodzielna;
  const tanie = K.oferty.reduce((a, b) => (!a || b.szacunki[b.najlepszy_pakiet].razem < a.szacunki[a.najlepszy_pakiet].razem ? b : a), null);   // obok mandatu
  const wyr = wyroznienia(K.oferty);
  const html = `<div class="banki-siatka">${K.oferty.map((b, i) => kartaBiuraMarki(b, i, wybrane, edycja, K, wyr(b))).join("")}${kartySamodzielnie(S, tanie, wybrane, edycja)}</div>`
    + wyborNiskocennych(v, d, edycja);
  const nowe = K.oferty.find((b) => b.id === wybrane), oplata = nowe ? oplataZmiany(K, nowe, d.pakiet) : 0;
  if (oplata > 0) html += `<div class="komunikat"><p class="znak-uwaga">Zmiana biura na ${esc(nowe.nazwa)}: jednorazowa opłata ${zl2(oplata)} (tydzień pakietu nowego biura), zapłacona razem z fakturą za rundę.</p></div>`;
  const D = K.deklaracja;
  if (!D) return html;
  if (wybrane !== "samodzielnie")
    return html + `<p class="podpowiedz">Deklaracje za rundę ${D.runda} złoży wybrane biuro (bez mandatu) – możesz też wrócić do samodzielnego rozliczenia.</p>`;
  const k = d.ksiegowosc || {}, zapisy = k.zapisy || {}, P = v.podatki.parametry, Z = podsumowanieDeklaracji(D, zapisy, P);
  const dis = edycja ? "" : "disabled";
  const znane = D.dokumenty.filter((x) => K.podpowiedzi[x.opis] && !(zapisy[x.id] || {}).kolumna).length;
  const wiersze = D.dokumenty.map((x, i) => {
    const z = zapisy[x.id] || {};
    const kol = `<select data-zmiana="ks-kolumna" data-id="${x.id}" ${dis}><option value="">– wybierz –</option>${Object.entries(K.kolumny)
      .map(([id, n]) => `<option value="${id}" ${z.kolumna === id ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>`;
    const st = x.stawki ? `<span class="podpowiedz">${x.stawki.map((c) => `${proc(c.stawka, 0)}: ${zl2(c.brutto)}`).join("<br>")}</span>`
      : `<select data-zmiana="ks-stawka" data-id="${x.id}" ${dis}><option value="">–</option>${STAWKI
        .map((s) => `<option value="${s}" ${z.stawka != null && Number(z.stawka) === s ? "selected" : ""}>${proc(s, 0)}</option>`).join("")}</select>`;
    const kw = x.kierunek === "brak" ? `${zl2(x.brutto)} <span class="podpowiedz">(bez zapłaty)</span>` : `${x.kierunek === "wplyw" ? "+" : "−"}${zl2(x.brutto)}`;
    return [i + 1, esc(x.typ), esc(x.opis), kw, kol, st];
  });
  const dk = k.deklaracja || {};
  const pole = (p, n) => `<label class="pole">${n}<input type="number" min="0" step="0.01" value="${dk[p] ?? ""}" data-zmiana="ks-deklaracja" data-p="${p}" ${dis}></label>`;
  return html + `<h3>Deklaracje za rundę ${D.runda} – księgujesz samodzielnie</h3>
    <p class="podpowiedz">Wpisz każdy dokument do kolumny KPiR (albo „poza KPiR”) i wybierz stawkę VAT (0% – bez VAT). Kwoty są brutto;
      netto i VAT liczymy z wybranej stawki. Na początku przeliczenia urząd sprawdzi deklaracje: różnicę dopłacisz albo odzyskasz,
      a za każdą deklarację pomyloną o złotówkę lub więcej zapłacisz ${zl(S.kara_blad)}.</p>
    ${krokiKpir(K, !Z.zaksiegowane)}
    ${znane && edycja ? `<button class="btn" data-akcja="ks-podpowiedzi">Wpisz zapisy znane z poprzednich deklaracji (${znane})</button>` : ""}
    ${tabela(`Dokumenty (${Z.zaksiegowane} z ${D.dokumenty.length} zaksięgowanych)`, ["Lp.", "Dokument", "Opis", "Kwota brutto", "Kolumna KPiR", "VAT"], wiersze,
      { klasy: ["", "l", "l", "r", "l", "l"] })}
    <div class="dwie"><div>${tabela("Z Twoich zapisów", ["", "Kwota"], [
      ["Przychody netto", zl2(Z.przychody)], ["Koszty netto", zl2(Z.koszty)], ["Dochód rundy", zl2(Z.dochod)],
      ["VAT należny", zl2(Z.nalezny)], ["VAT naliczony", zl2(Z.naliczony)], ["Nadwyżka VAT z poprzedniej rundy", zl2(D.stan_przed.vat_nadwyzka)],
      ["<b>VAT do zapłaty</b>", `<b>${zl(Z.vat)}</b>`],
      [`Podstawa PIT narastająco (wcześniej dochód ${zl2(D.stan_przed.dochod)})`, zl(Z.podstawa)],
      [`<b>Zaliczka PIT</b> (${proc(P.pit, 0)} − wpłacone ${zl(D.stan_przed.zaliczki)})`, `<b>${zl(Z.pit)}</b>`],
      [`<b>Składka zdrowotna</b> (${proc(P.zdrowotna, 1)}, min. ${zl2(P.zdrowotna_minimum)})`, `<b>${zl2(Z.zdrowotna)}</b>`]], { klasy: ["l", "r"] })}</div>
    <div><h3>Deklaracje do urzędu</h3>${pole("vat", "VAT do zapłaty (zł)")}${pole("pit", "Zaliczka na PIT (zł)")}${pole("zdrowotna", "Składka zdrowotna (zł)")}
      ${edycja ? `<button class="btn czarny" data-akcja="ks-przepisz">Przepisz kwoty wyliczone z zapisów</button>` : ""}
      ${k.deklaracja ? "" : `<p class="podpowiedz minus">Deklaracje niezłożone – urząd rozliczy z urzędu i wystawi mandat ${zl(S.kara_brak)}.</p>`}</div></div>`;
}

function wynikiKsiegowosci({ v }) {
  const W = v.wyniki || {}, B = W.biuro, K = W.ksiegowosc;
  let html = "";
  if (B) {
    const dok = `${B.dokumenty} (limit pakietu ${B.pakiet}: ${B.limit})`;
    html += zwinTabela(`Faktura biura za rundę: ${esc(B.nazwa)}`, ["Pozycja", "Kwota"], [
      ["Dokumenty w rundzie", dok], [`Pakiet ${B.pakiet} (cena)`, zl2(B.ryczalt)], [`Dokumenty ponad limit (${B.ponad})`, zl2(B.za_dokumenty)],
      ["Księgowanie", zl2(B.ksiegowanie)],
      [`Kadry (płatne osoby: ${B.osoby_platne})`, zl2(B.kadry)], ["<b>Razem (koszt w KPiR)</b>", `<b>${zl2(B.razem)}</b>`]], { klasy: ["l", "r"], otwarte: true });
    html += B.blad ? `<div class="komunikat"><p>${esc(B.blad.tekst)}</p><p><b>Mandat ${zl(B.blad.kara)}</b>${B.blad.oc ? " – biuro oddało go z OC." : " – biuro nie ma OC, płacisz Ty."}</p></div>`
      : `<p class="podpowiedz">Biuro rozliczyło podatki bez błędów.</p>`;
  }
  if (K && K.tryb !== "podglad") {
    const tryb = { deklaracja: "złożone przez Ciebie", biuro: "złożone przez nowe biuro", brak: "niezłożone – rozliczenie z urzędu" }[K.tryb];
    html += zwinTabela(`Deklaracje za rundę ${K.za_runde} (${tryb})`, ["Deklaracja", "Zadeklarowano", "Poprawnie", "Korekta", ""],
      K.pozycje.map((p) => [esc(p.nazwa), zl2(p.zadeklarowano), zl2(p.poprawnie),
        p.korekta ? `${p.korekta > 0 ? "dopłata" : "zwrot"} ${zl2(Math.abs(p.korekta))}` : "–", p.blad ? `<span class="minus">błąd – mandat</span>` : "✓"]),
      { klasy: ["l", "r", "r", "r", "l"], stopka: ["Mandat", "", "", "", zl2(K.kara)], otwarte: true });
    const Z = K.zapisy;
    if (Z) {
      const zle = Z.dokumenty.filter((x) => !x.ok);
      html += `<p>Zapisy w KPiR: <b>${Z.dobre} z ${Z.liczba}</b> poprawnych.${zle.length ? " Błędne zapisy (same nie kosztują – liczą się deklaracje):" : ""}</p>`;
      if (zle.length) html += zwinTabela("Błędne zapisy w KPiR", ["Dokument", "Kwota", "Co poszło nie tak"],
        zle.map((x) => [`${esc(x.typ)}: ${esc(x.opis)}`, zl2(x.brutto), x.bledy.map(esc).join("<br>")]), { klasy: ["l", "r", "l"] });
    }
  }
  if (W.samodzielnie) html += `<p class="podpowiedz">Dokumenty tej rundy czekają na zaksięgowanie – przełącz tę zakładkę na „Decyzje”.</p>`;
  if (!html) return `<p class="podpowiedz">Brak rozliczeń w tej rundzie.</p>`;
  const kara = (B?.blad?.kara || 0) + (K && K.tryb !== "podglad" ? K.kara || 0 : 0);
  const lead = podsumowanie([B ? `Biuro ${esc(B.nazwa)} obsłużyło ${B.dokumenty} ${B.dokumenty === 1 ? "dokument" : "dokumentów"} i wystawiło fakturę na <b>${zl(B.razem)}</b>.` : "",
    kara > 0 ? `Błędy w rozliczeniach kosztowały mandaty na ${zl(kara)}.` : "Rozliczenia przeszły bez mandatów."], kara > 0 ? "uwaga" : "ok");
  return lead + html;
}

const ksiegowosc = (d) => (d.ksiegowosc = d.ksiegowosc || {});
const zapisy = (d) => { const k = ksiegowosc(d); return (k.zapisy = k.zapisy || {}); };

export const biuro = {
  tytul: "Biuro rachunkowe", tytulPelny: "Finanse - biuro rachunkowe", ikona: "🗂", odblokowanie: "finanse_biuro",
  info: ({ v }) => v.gra.lokale
    ? "Wybierz biuro z Kamienicy biur albo księguj samodzielnie: dokumenty z rundy wpisujesz do KPiR i w następnej rundzie składasz deklaracje VAT, PIT i zdrowotnej."
    : "Wybierz biuro rachunkowe, które będzie prowadziło księgowość Twojej firmy. Opłata = księgowanie × liczba pozycji KPiR + opłata kadrowa za każdego pracownika.",
  wynikiGdy: (v) => !!v.gra.lokale,
  wyniki: (c) => wynikiKsiegowosci(c),
  decyzje({ v, kat, edycja }) {
    return decyzjeKsiegowosci({ v, edycja });
  },
  akcje: {
    biuro: (el, c) => c.zmien((d) => { d.biuro = el.dataset.b; }),
    "biuro-pakiet": (el, c) => c.zmien((d) => { d.biuro = el.dataset.b; d.pakiet = el.dataset.p; }),
    niskocenne: (el, c) => c.zmien((d) => { d.amortyzacja_niskocenna = el.dataset.n; }),
    "ks-podpowiedzi": (el, c) => c.zmien((d) => {
      const zap = zapisy(d), K = c.v.ksiegowosc;
      for (const x of K.deklaracja.dokumenty) {
        const p = K.podpowiedzi[x.opis];
        if (p && !(zap[x.id] || {}).kolumna) zap[x.id] = { kolumna: p.kolumna, stawka: x.stawki ? null : p.stawka };
      }
    }),
    "ks-przepisz": (el, c) => c.zmien((d) => {
      const Z = podsumowanieDeklaracji(c.v.ksiegowosc.deklaracja, zapisy(d), c.v.podatki.parametry);
      ksiegowosc(d).deklaracja = { vat: Z.vat, pit: Z.pit, zdrowotna: Z.zdrowotna };
    }),
  },
  zmiany: {
    "ks-kolumna": (el, c) => c.zmien((d) => { const zap = zapisy(d); zap[el.dataset.id] = { ...(zap[el.dataset.id] || {}), kolumna: el.value || null }; }),
    "ks-stawka": (el, c) => c.zmien((d) => {
      const zap = zapisy(d);
      zap[el.dataset.id] = { ...(zap[el.dataset.id] || {}), stawka: el.value === "" ? null : Number(el.value) };
    }),
    "ks-deklaracja": (el, c) => c.zmien((d) => {
      const k = ksiegowosc(d), dk = (k.deklaracja = { vat: 0, pit: 0, zdrowotna: 0, ...(k.deklaracja || {}) });
      dk[el.dataset.p] = Math.max(0, Number(el.value) || 0);
    }),
  },
};
