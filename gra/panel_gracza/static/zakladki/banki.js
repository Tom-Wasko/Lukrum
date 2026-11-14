// Bank w grze z lokalami (silnik/pieniadze/banki.py, dane/mapa/banki.yaml): sześć banków, konto firmowe z terminalem
// i debetem, lokaty, kredyty (na start, inwestycyjny pod zastaw, obrotowy) i leasing sprzętu – przy tylko_bank_konta
// (sprawa 21, poprawki 2) tylko w banku konta firmowego: po wyborze banku zakładka pokazuje tylko ten bank.
import { esc, inwestorHtml, kafelkiLiczb, kafelOferty, kartaMarki, KOLORY, OKRES, okno, podsumowanie, proc, tabela, znakMarki, toast, zamknijOkno, zl, zl2, zwinTabela } from "./wspolne.js";

const PRODUKTY = { start: "na start", inwestycyjny: "inwestycyjny", obrotowy: "obrotowy" };
const KATEGORIE = { konto: "Najtańsze konto i terminal", lokata: "Najlepsza lokata", kredyt_bez_historii: "Kredyt bez historii firmy",
  kredyt_inwestycyjny: "Najtańszy kredyt pod zastaw", leasing: "Najtańszy leasing", debet: "Największy debet" };
const rundy = (n) => `${n} ${n === 1 ? "runda" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "rundy" : "rund"}`;
const tak = (b) => b ? `<span class="plus">✓</span>` : `<span class="minus">✗</span>`;

let podzakladka = "historia", wyborBanku = false;

const ustawienia = (kat) => kat.mapa.banki;
const bankiLista = (kat) => ustawienia(kat).banki;
const najlepszyW = (v, nazwa) => Object.entries(v.banki.najlepsze).filter(([, b]) => b === nazwa).map(([k]) => KATEGORIE[k]);
const najLokata = (b) => Math.max(...Object.values(b.lokaty));
const tylkoKonto = (kat) => !!ustawienia(kat).tylko_bank_konta;
// banki, w których firma może brać lokaty, kredyty i leasing (silnik/pieniadze/banki.py: dostepne)
const mojeBanki = (v, kat) => bankiLista(kat).filter((b) => !tylkoKonto(kat) || b.nazwa === v.stan.bank);
const oferty = (v, kat) => mojeBanki(v, kat).flatMap((b) => b.kredyty.map((p) => ({ ...p, bank: b.nazwa })));
const ZASADA = "Lokaty, kredyty i leasing bierzesz tylko w banku, w którym firma ma konto firmowe – wybór banku to wybór jego oferty.";

// sprawa 21 (poprawki 2): bank jako karta marki (jak agencja w Ulotkach i radiu) – kafelki: konto, lokaty, kredyty
const kolorBanku = (kat, nazwa) => KOLORY[(bankiLista(kat).findIndex((b) => b.nazwa === nazwa) + 1) % KOLORY.length];
const w = (a, b) => `<div class="wiersz"><span>${a}</span><span>${b}</span></div>`;
// karta zwarta (wybór banku): dwa kafelki – konto i oferta; karty w dwóch kolumnach (.banki-siatka)
function kafelZwarty(v, kat, b, wybrany, edycja) {
  const naj = najlepszyW(v, b.nazwa), moj = b.nazwa === wybrany;
  const konto = kafelOferty({ tytul: "Konto firmowe", pigulka: moj ? "Twoje konto" : "", duza: zl(b.konto + b.terminal.abonament), podpis: "miesięcznie: konto + terminal",
    tresc: w("Prowizja od kart", proc(b.terminal.prowizja, 2)) + w("Debet (za zgodą)", `${zl(b.debet.limit)} · ${proc(b.debet.oprocentowanie, 1)} · ${zl(b.debet.oplata)} / tydz.`),
    stopka: moj ? `<button class="btn zielony">✓ Konto firmowe</button>`
      : `<button class="btn czarny" data-akcja="bk-konto" data-b="${esc(b.nazwa)}" ${edycja ? "" : "disabled"}>Otwórz konto firmowe</button>` });
  const oferta = kafelOferty({ tytul: "Lokaty, kredyty, leasing", duza: proc(najLokata(b), 1), podpis: "najlepsza lokata (rocznie)",
    tresc: w(`Lokaty ${Object.keys(b.lokaty).join(" / ")} r.`, Object.values(b.lokaty).map((o) => proc(o, 1)).join(" / "))
      + b.kredyty.map((x) => w(esc(x.nazwa), proc(x.oprocentowanie, 1))).join("")
      + w("Leasing sprzętu", b.leasing ? proc(b.leasing.oprocentowanie, 1) : "–") });
  return kartaMarki({ kolor: kolorBanku(kat, b.nazwa), nazwa: b.nazwa, rodzaj: b.specjalizacja,
    opis: esc(b.opis) + (naj.length ? `<br><b class="bank-najlepszy">Najlepszy: ${naj.map(esc).join(", ")}</b>` : ""), tresc: `<div class="siatka dwojka">${konto}${oferta}</div>` });
}
// karta banku konta (nad podzakładkami): saldo, lokaty, kredyty i leasing tylko tego banku
function kafel(v, kat, b, edycja) {
  const naj = najlepszyW(v, b.nazwa);
  const konto = kafelOferty({ tytul: "Konto firmowe", duza: zl(v.stan.gotowka), podpis: "dostępne saldo (po decyzjach tej rundy, przed sprzedażą)",
    tresc: w("Wolny limit debetu", zl2(v.banki.wolny_limit)) + w("Debet", debetWlaczony(v) ? "włączony" : "wyłączony") + w("Historia firmy", rundy(v.banki.historia))
      + w("Konto + terminal", `${zl(b.konto + b.terminal.abonament)} / mies. · ${proc(b.terminal.prowizja, 2)} od kart`),
    stopka: `<button class="btn pom" data-akcja="bk-zmien" ${edycja ? "" : "disabled"}>Zmień bank konta</button>` });
  const lokata = kafelOferty({ tytul: "Lokaty", duza: proc(najLokata(b), 1), podpis: "najlepsze oprocentowanie roczne",
    tresc: Object.entries(b.lokaty).map(([r, o]) => w(rundy(+r), proc(o, 1))).join(""),
    stopka: `<button class="btn jasny" data-akcja="bk-zak" data-k="lokaty">Lokaty</button>` });
  const kredyty = kafelOferty({ tytul: "Kredyty i leasing", duza: b.kredyty.length ? proc(Math.min(...b.kredyty.map((x) => x.oprocentowanie)), 1) : "–", podpis: "najniższe oprocentowanie kredytu",
    tresc: b.kredyty.map((x) => w(esc(x.nazwa), proc(x.oprocentowanie, 1))).join("") + w("Leasing sprzętu", b.leasing ? proc(b.leasing.oprocentowanie, 1) : "–"),
    stopka: `<button class="btn jasny" data-akcja="bk-zak" data-k="kredyty">Kredyty</button>` });
  return kartaMarki({ kolor: kolorBanku(kat, b.nazwa), nazwa: `Konto firmowe: ${b.nazwa}`, znak: znakMarki(b.nazwa), rodzaj: b.specjalizacja, opis: esc(b.opis),
    suma: naj.length ? `najlepszy: <b>${naj.map(esc).join(", ")}</b>` : "", tresc: `<div class="siatka trojka">${konto}${lokata}${kredyty}</div>` });
}

// kalkulator kredytu: raty kapitałowe równe + odsetki od reszty długu (silnik/pieniadze/banki.py); klik w wiersz – formularz z tą kwotą
function kalkulatorKredytu(p, i, edycja) {
  const n = Math.min(26, p.maks_rund), r = p.oprocentowanie / OKRES.rund_w_roku;
  const kwoty = [...new Set([10000, 50000, p.maks_kwota])].filter((k) => k <= p.maks_kwota);
  const dane = (k) => (edycja ? `class="klik" data-akcja="bk-nowy-kredyt" data-i="${i}" data-kwota="${k}" data-rund="${n}" title="Weź ${zl(k)} na ${rundy(n)}"` : "");
  return `<div class="podpis-progow">Przy spłacie w ${rundy(n)}</div><table class="kalkulator"><thead><tr><th>Kwota</th><th>1. rata</th><th>Odsetki razem</th><th>Prowizja</th></tr></thead>
    <tbody>${kwoty.map((k) => `<tr ${dane(k)}><td>${zl2(k)}</td><td>${zl2(k / n + k * r)}</td><td>${zl2(k * r * (n + 1) / 2)}</td><td>${zl2(k * p.prowizja)}</td></tr>`).join("")}</tbody></table>`;
}
function ofertyKredytow(v, kat, edycja) {
  const lista = oferty(v, kat);
  return mojeBanki(v, kat).filter((b) => b.kredyty.length).map((b) => kartaMarki({ kolor: kolorBanku(kat, b.nazwa), nazwa: b.nazwa, rodzaj: b.specjalizacja,
    tresc: `<div class="siatka trojka">${b.kredyty.map((p) => {
      const i = lista.findIndex((x) => x.bank === b.nazwa && x.produkt === p.produkt);
      const warunki = [p.historia && `historia firmy od ${rundy(ustawienia(kat).historia_rund)}`, p.od_lokalu && "dla firmy z lokalem", p.zastaw && `pod zastaw (do ${proc(p.zastaw, 0)} wartości)`].filter(Boolean);
      return kafelOferty({ tytul: esc(p.nazwa), pigulka: PRODUKTY[p.produkt] || "", duza: proc(p.oprocentowanie, 1), podpis: `rocznie · prowizja ${proc(p.prowizja, 1)}`,
        tresc: w("Najwyżej", `${zl(p.maks_kwota)} na ${rundy(p.maks_rund)}`) + (warunki.length ? w("Warunki", warunki.join(", ")) : "") + kalkulatorKredytu(p, i, edycja) });
    }).join("")}</div>` })).join("");
}

function porownanie(v, kat) {
  const naj = v.banki.najlepsze;
  const kom = (kategoria, b, tekst) => naj[kategoria] === b.nazwa ? `<b class="akcent">${tekst}</b>` : tekst;
  return tabela("Porównanie ofert", ["Bank", "Konto + terminal / mies.", "Prowizja od kart", "Lokaty", "Kredyt bez historii", "Kredyt pod zastaw", "Leasing", "Debet (limit · oprocentowanie · opłata za tydzień)"],
    bankiLista(kat).map((b) => {
      const bezHist = b.kredyty.find((p) => !p.historia && !p.od_lokalu), zastaw = b.kredyty.find((p) => p.zastaw);
      return [esc(b.nazwa), kom("konto", b, zl2(b.konto + b.terminal.abonament)), proc(b.terminal.prowizja, 2),
        kom("lokata", b, Object.entries(b.lokaty).map(([r, o]) => `${r} r.: ${proc(o, 1)}`).join(" · ")),
        bezHist ? kom("kredyt_bez_historii", b, proc(bezHist.oprocentowanie, 1)) : "–",
        zastaw ? kom("kredyt_inwestycyjny", b, `${proc(zastaw.oprocentowanie, 1)} (do ${proc(zastaw.zastaw, 0)} wartości)`) : "–",
        b.leasing ? kom("leasing", b, proc(b.leasing.oprocentowanie, 1)) : "–",
        kom("debet", b, `${zl2(b.debet.limit)} · ${proc(b.debet.oprocentowanie, 1)} · ${zl2(b.debet.oplata)} / tydz.`)];
    }), { klasy: ["l"] })
    + `<p class="podpowiedz">${tylkoKonto(kat) ? ZASADA : "Konto firmowe może być w jednym banku, a lokaty, kredyty i leasing – w dowolnych."} Oprocentowanie roczne,
      w ${OKRES.miejscownik} naliczana część: 1/${OKRES.rund_w_roku}. Pogrubione – najlepsza oferta w kategorii.</p>`;
}

function lokaty(v, kat, edycja) {
  const zerw = v.decyzje.lokaty_zerwij || [];
  const nowe = v.decyzje.lokaty_zaloz || [];
  return tabela("Lokaty", ["Nazwa", "Bank", "Założona", "Okres", "Oprocentowanie", "Kwota", ""], v.stan_przed.lokaty.map((l) => [`Lokata nr ${l.id}`, esc(l.bank),
    `runda ${l.od_rundy}`, rundy(l.miesiecy), proc(l.oprocentowanie, 1), zl2(l.kwota),
    `<button class="btn ${zerw.includes(l.id) ? "zielony" : "czarny"} maly" data-akcja="bk-zerwij" data-id="${l.id}" ${edycja ? "" : "disabled"}>${zerw.includes(l.id) ? "✓ Zerwana" : "Zerwij"}</button>`]), { klasy: ["l", "l"] })
    + (nowe.length ? `<p>Nowe lokaty: ${nowe.map((l, i) => `${zl(l.kwota)} w ${esc(l.bank)} na ${rundy(l.rund)} <a href="#" data-akcja="bk-usun" data-co="lokaty_zaloz" data-i="${i}">usuń</a>`).join(", ")}</p>` : "")
    + `<p><button class="btn zielony" data-akcja="bk-nowa-lokata" ${edycja ? "" : "disabled"}>Załóż lokatę</button>
      <span class="podpowiedz">Odsetki wypłacane na koniec okresu. Zerwanie – zwrot kwoty bez odsetek.</span></p>`;
}

function kredyty(v, kat, edycja) {
  const u = ustawienia(kat);
  const spl = v.decyzje.kredyty_splac || [];
  const nowe = v.decyzje.kredyty_wez || [];
  const zastawy = Object.fromEntries(v.banki.zastawy.map((z) => [z.id, z.nazwa]));
  return tabela("Kredyty", ["Nazwa", "Bank", "Rodzaj", "Od rundy", "Kwota", "Okres", "Rata kapitałowa", "Do spłaty", "Zaległe", "Zastaw", ""],
    v.stan_przed.kredyty.map((k) => [`Kredyt nr ${k.id}`, esc(k.bank), PRODUKTY[k.produkt] || "–", k.od_rundy, zl2(k.kwota), rundy(k.miesiecy),
      zl2(k.kwota / k.miesiecy), zl2(k.pozostalo), k.zalegle ? `<span class="minus">${rundy(k.zalegle)} (${zl2(k.zaleglosc)})</span>` : "–",
      k.zastaw ? esc(zastawy[k.zastaw] || k.zastaw.split(":").slice(1).join(" ")) : "–",
      `<button class="btn ${spl.includes(k.id) ? "zielony" : "czarny"} maly" data-akcja="bk-splac" data-id="${k.id}" ${edycja ? "" : "disabled"}>${spl.includes(k.id) ? "✓ Spłacony" : "Spłać"}</button>`]),
    { klasy: ["l", "l", "l"] })
    + (nowe.length ? `<p>Nowe kredyty: ${nowe.map((k, i) => `${esc(k.bank)} – ${PRODUKTY[k.produkt]} ${zl(k.kwota)} na ${rundy(k.rund)} <a href="#" data-akcja="bk-usun" data-co="kredyty_wez" data-i="${i}">usuń</a>`).join(", ")}</p>` : "")
    + `<p><button class="btn zielony" data-akcja="bk-nowy-kredyt" ${edycja ? "" : "disabled"}>Weź kredyt</button>
      <span class="podpowiedz">Historia firmy: ${rundy(v.banki.historia)} (kredyty obrotowe wymagają co najmniej ${rundy(u.historia_rund)};
      inwestycyjny – od wzięcia lokalu, a zastawem może być lokal${u.zastaw_przejecia ? " albo budynek z najemcą" : ""} kupowany w tej rundzie).
      Raty kapitałowe równe + odsetki, od następnej rundy; prowizja od razu w koszty. Brak środków na ratę – odsetki karne
      ${proc(u.stopa_karna, 0)}, a gdy zaległość trwa ${rundy(u.przejecie_po)}, bank przejmuje zastaw (wycena ${proc(u.wycena_zastawu, 0)} wartości netto).</span></p>
    <div class="pasek">${tylkoKonto(kat) ? "Kredyty Twojego banku" : "Oferty kredytów"} – kliknij wiersz kalkulatora, żeby wziąć kredyt na tych warunkach</div>${ofertyKredytow(v, kat, edycja)}`;
}

function leasing(v, kat, edycja) {
  const nowe = v.decyzje.leasing_wez || [];
  const brak = !mojeBanki(v, kat).some((b) => b.leasing);
  return tabela("Sprzęt w leasingu", ["Nazwa", "Bank", "Sprzęt", "Stanowisko", "Rata", "Pozostało rat", "Wykup", "Zaległe"],
    (v.stan_przed.leasingi || []).map((l) => [`Leasing nr ${l.id}`, esc(l.bank), `${esc(l.nazwa)} (jakość ${l.jakosc})`, `${l.typ} ${l.nr}`,
      zl2(l.rata), l.pozostalo_rat, zl2(l.wykup), l.zalegle ? `<span class="minus">${rundy(l.zalegle)}</span>` : "–"]), { klasy: ["l", "l", "l", "l"] })
    + (nowe.length ? `<p>Nowy leasing: ${nowe.map((l, i) => `${esc(l.nazwa)} (${l.typ} ${l.nr}) w ${esc(l.bank)} na ${rundy(l.rund)} <a href="#" data-akcja="bk-usun" data-co="leasing_wez" data-i="${i}">usuń</a>`).join(", ")}</p>` : "")
    + (brak ? `<div class="komunikat">${esc(v.stan.bank)} nie prowadzi leasingu sprzętu – leasing wymaga zmiany banku konta (przycisk „Zmień bank konta” wyżej).</div>` : "")
    + `<p><button class="btn zielony" data-akcja="bk-nowy-leasing" ${edycja && !brak ? "" : "disabled"}>Weź sprzęt w leasing</button>
      <span class="podpowiedz">Sprzęt od razu na stanowisku, ale do wykupu należy do banku – nie można go sprzedać. Wpłata własna
      i raty idą w koszty (bez amortyzacji), po ostatniej racie wykup za symboliczną kwotę.</span></p>`;
}

// zgoda na debet: decyzja `debet` (true/false) albo stan z poprzedniej rundy
const debetWlaczony = (v) => (v.decyzje?.debet ?? v.stan_przed?.debet_wlaczony) === true;

function debet(v, kat, b, edycja) {
  const u = ustawienia(kat), wl = debetWlaczony(v);
  return tabela("Debet", ["", "Wartość"], [["Zgoda na debet", wl ? "włączona" : "wyłączona"], ["Limit", zl2(b.debet.limit)],
    ["Obecny debet", zl2(v.stan_przed.debet)], ["Wolny limit", zl2(v.banki.wolny_limit)],
    ["Opłata za tydzień, który kończy się na minusie", zl2(b.debet.oplata)], ["Oprocentowanie debetu w limicie (odsetki maksymalne)", proc(b.debet.oprocentowanie, 1)],
    ["Debet ponad limit albo bez zgody – odsetki karne (maksymalne za opóźnienie)", proc(u.stopa_karna, 0)],
    ["Debet bez zgody banku – dodatkowa stała opłata", zl2(u.oplata_debet_bez_zgody)]], { klasy: ["l", "r"] })
    + `<p><button class="btn ${wl ? "pom" : "zielony"}" data-akcja="bk-debet" ${edycja ? "" : "disabled"}>${wl ? "Wyłącz debet" : "Włącz debet"}</button></p>
    <p class="podpowiedz">Debet nie włącza się sam. Liczy się saldo na koniec ${OKRES.dopelniacz}: chwilowy minus w trakcie nic nie kosztuje. Z włączonym debetem, gdy ${OKRES.mianownik} kończy się
      na minusie, płacisz opłatę i odsetki (w granicach limitu banku), a nadwyżka z kolejnych rund go spłaca. Bez zgody (albo ponad limit)
      to alarm, odsetki karne (bez zgody także stała opłata, więc zawsze drożej niż za zgodą) i blokada inwestycji, kredytów, leasingu i lokat w następnej rundzie.
      Wolny limit liczy się też przy ratach kredytów i leasingu.</p>`;
}

export function decyzjeBanku({ v, kat, edycja }) {
  const wybrany = v.stan.bank;
  const b = bankiLista(kat).find((x) => x.nazwa === wybrany);
  if (!b || wyborBanku) {
    const wstep = b ? `<button class="btn pom" data-akcja="bk-powrot">Powrót do banku</button>`
      : `<div class="komunikat">Wybierz bank, w którym firma otworzy konto firmowe. ${tylkoKonto(kat) ? ZASADA : "Kredyty, lokaty i leasing można potem brać w dowolnym banku."}</div>`;
    return `${wstep}${b && tylkoKonto(kat) ? `<div class="komunikat" style="margin-top:12px">${ZASADA} Lokaty, kredyty i leasing w obecnym banku biegną dalej do końca.</div>` : ""}
      <div class="banki-siatka">${bankiLista(kat).map((x) => kafelZwarty(v, kat, x, wybrany, edycja)).join("")}</div>${porownanie(v, kat)}`;
  }
  // tylko bank konta (porównanie innych banków – po „Zmień bank konta”)
  const zak = { historia: "Historia rachunku", lokaty: "Lokaty", kredyty: "Kredyty", leasing: "Leasing", debet: "Debet" };
  if (!zak[podzakladka]) podzakladka = "historia";
  let html = inwestorHtml(v) + kafel(v, kat, b, edycja)
    + `<div class="przelacznik" style="justify-content:flex-end;margin:16px 0;flex-wrap:wrap">${Object.entries(zak).map(([k, n]) => `<a class="${podzakladka === k ? "aktywny" : ""}" data-akcja="bk-zak" data-k="${k}">${n}</a>`).join("")}</div>`;
  if (podzakladka === "historia") {
    const op = v.wyniki?.rachunek || [];
    html += tabela(null, ["Operacja", "Kwota", "Saldo"], op.map((o) => [esc(o.opis), `<span class="${o.kwota < 0 ? "minus" : "plus"}">${zl2(o.kwota)}</span>`, zl2(o.saldo)]), { klasy: ["l", "r", "r"] })
      + `<p class="podpowiedz">Historia rachunku z poprzedniego ${OKRES.dopelniacz}.</p>`;
  } else if (podzakladka === "lokaty") html += lokaty(v, kat, edycja);
  else if (podzakladka === "kredyty") html += kredyty(v, kat, edycja);
  else if (podzakladka === "leasing") html += leasing(v, kat, edycja);
  else html += debet(v, kat, b, edycja);
  return html;
}

export function wynikiBanku({ v }) {
  const w = v.wyniki?.bank;
  if (!w) return `<p class="podpowiedz">Brak wyników banku z poprzedniego ${OKRES.dopelniacz}.</p>`;
  const k = w.koniec || {}, o = k.oplaty || {};
  const odrzucone = [...(w.poczatek?.odrzucone || []), ...(w.leasing?.odrzucone || [])];
  const oplaty = (o.konto || 0) + (o.terminal || 0) + (o.prowizja || 0);
  const sumaRat = (k.raty || []).reduce((a, r) => a + (r.odsetki || 0) + (r.rata || 0), 0), rataLeas = (k.leasing || []).reduce((a, r) => a + (r.rata || 0), 0);
  const odsLok = (k.lokaty || []).reduce((a, l) => a + (l.odsetki || 0), 0), zalegle = (k.zaleglosci || []).length > 0 || w.debet_ponad_limit > 0;
  const czesci = [oplaty > 0 && `opłaty konta i kart ${zl2(oplaty)}`, sumaRat > 0 && `raty kredytów ${zl2(sumaRat)}`, rataLeas > 0 && `raty leasingu ${zl2(rataLeas)}`];
  let html = podsumowanie([czesci.some(Boolean) ? `Bank pobrał od firmy: ${czesci.filter(Boolean).join(", ")}.` : "W tej rundzie bank niczego nie pobrał.",
    odsLok > 0 ? `Zakończone lokaty przyniosły ${zl2(odsLok)} odsetek.` : "", zalegle ? "Są zaległości lub debet ponad limit – szczegóły niżej." : ""], zalegle ? "uwaga" : "")
    + kafelkiLiczb([{ etykieta: "Opłaty konta i kart", wartosc: zl(oplaty) }, (k.raty || []).length > 0 && { etykieta: "Raty kredytów", wartosc: zl(sumaRat), opis: `${k.raty.length} z kredytów` },
      (k.leasing || []).length > 0 && { etykieta: "Raty leasingu", wartosc: zl(rataLeas) }, odsLok > 0 && { etykieta: "Odsetki z lokat", wartosc: zl(odsLok), ton: "plus" }]);
  html += zwinTabela("Opłaty konta firmowego", ["", "Kwota"], [["Konto", zl2(o.konto)], ["Abonament terminala", zl2(o.terminal)],
    ["Prowizja od płatności kartą", zl2(o.prowizja)]], { klasy: ["l", "r"], stopka: ["Razem", zl2(oplaty)], otwarte: !(k.raty || []).length });
  if ((k.raty || []).length) {
    html += zwinTabela("Raty kredytów", ["Kredyt", "Bank", "Odsetki", "Rata kapitałowa", "Zaległość", "Zapłacona"],
      k.raty.map((r) => [`nr ${r.kredyt}`, esc(r.bank), zl2(r.odsetki), zl2(r.rata), zl2(r.zaleglosc), tak(r.zaplacona)]), { klasy: ["l", "l"], otwarte: true });
  }
  if ((k.leasing || []).length) {
    html += zwinTabela("Raty leasingu", ["Leasing", "Bank", "Sprzęt", "Rata", "Rat", "Zapłacona"],
      k.leasing.map((r) => [`nr ${r.leasing}`, esc(r.bank), esc(r.sprzet), zl2(r.rata), r.rat, tak(r.zaplacona)]), { klasy: ["l", "l", "l"] });
  }
  if ((k.lokaty || []).length) {
    html += zwinTabela("Zakończone lokaty", ["Lokata", "Bank", "Kwota", "Odsetki"], k.lokaty.map((l) => [`nr ${l.lokata}`, esc(l.bank), zl2(l.kwota), zl2(l.odsetki)]), { klasy: ["l", "l"] });
  }
  if ((k.przejecia || []).length) {
    html += zwinTabela("Przejęcia przez bank", ["Bank", "Co", "Wycena", "Dług", "Nadwyżka na konto"],
      k.przejecia.map((p) => [esc(p.bank), esc(p.zastaw), zl2(p.wycena), zl2(p.dlug), zl2(p.nadwyzka)]), { klasy: ["l", "l"] });
  }
  if ((k.wykupy || []).length) html += `<p>Wykupiony z leasingu: ${k.wykupy.map((x) => esc(x.sprzet)).join(", ")}.</p>`;
  const nowe = [...(w.poczatek?.nowe_kredyty || []).map((id) => `kredyt nr ${id}`), ...(w.poczatek?.nowe_lokaty || []).map((id) => `lokata nr ${id}`),
    ...(w.leasing?.nowe || []).map((id) => `leasing nr ${id}`)];
  if (nowe.length) html += `<p>Nowe produkty: ${nowe.join(", ")}.</p>`;
  if (odrzucone.length) html += zwinTabela("Odrzucone przez bank", ["Decyzja", "Powód"], odrzucone.map((x) => [esc(x.co), esc(x.powod)]), { klasy: ["l", "l"] });
  const uwagi = [...(k.zaleglosci || []), ...(w.debet_ponad_limit > 0 ? [`Debet ponad limit w koncie: ${zl2(w.debet_ponad_limit)} – odsetki karne, a w następnej rundzie zablokowane inwestycje, kredyty, leasing i lokaty (spłać debet albo poproś mistrza gry o inwestora).`] : [])];
  if (uwagi.length) html += `<div class="komunikat">${uwagi.map(esc).join("<br>")}</div>`;
  return html + `<p class="podpowiedz">Historia firmy na koniec ${OKRES.dopelniacz}: ${rundy(w.historia)}.</p>`;
}

// lokal kupowany w tej rundzie (zakładka Lokale) – zastaw kredytu inwestycyjnego, wartość = cena z oferty
// (działka – razem z kosztem budowy, silnik/pieniadze/banki.py: nowy_lokal); bez kupna lokalu – budynek z najemcą
// kupowany w tej rundzie (Nowe lokale ▸ Przejęcia, B6; przy wykupie bez sprzętu wynajmującego)
function kupowanyLokal(c) {
  const wyb = c.d.lokal, lok = wyb?.forma === "kupno" ? (c.v.lokale?.oferta || []).find((l) => l.id === wyb.id) : null;
  if (lok?.cena) return [{ id: `lokal:${lok.id}`, nazwa: `${lok.typ === "dzialka" ? "Działka" : "Lokal"}: ${lok.adres} (kupowany w tej rundzie)`, wartosc: (+wyb.oferta || lok.cena) + (lok.koszt_budowy || 0) }];
  const dp = c.d.przejecie, b = dp?.id && wyb?.forma !== "kupno" && ustawienia(c.kat).zastaw_przejecia
    ? (c.v.przejecia?.do_kupienia || []).find((x) => x.id === dp.id) : null;
  return b ? [{ id: `lokal:${b.id}`, nazwa: `Budynek z najemcą: ${b.adres} (kupowany w tej rundzie)`, wartosc: Math.max(0, (+dp.oferta || b.cena) - (b.sprzet_w_cenie || 0)) }] : [];
}

const pole = (id, etykieta, html) => `<label class="pole">${etykieta}${html.replace("<select", `<select id="${id}"`).replace("<input", `<input id="${id}"`)}</label>`;
const wartosc = (id) => document.getElementById(id)?.value;
const przyciski = (akcja, tekst) => `<button class="btn jasny" data-akcja="zamknij-okno">Zamknij</button><button class="btn zielony" data-akcja="${akcja}">${tekst}</button>`;

export const akcjeBanku = {
  "bk-konto": (el, c) => { wyborBanku = false; return c.zmien((d) => { d.bank = el.dataset.b; }); },
  "bk-zmien": (el, c) => { wyborBanku = true; c.idz("bank", "decyzje"); },
  "bk-powrot": (el, c) => { wyborBanku = false; c.idz("bank", "decyzje"); },
  "bk-zak": (el, c) => { podzakladka = el.dataset.k; c.idz("bank", "decyzje"); },
  "bk-zerwij": (el, c) => c.zmien((d) => { const id = +el.dataset.id, l = d.lokaty_zerwij || []; d.lokaty_zerwij = l.includes(id) ? l.filter((x) => x !== id) : [...l, id]; }),
  "bk-splac": (el, c) => c.zmien((d) => { const id = +el.dataset.id, l = d.kredyty_splac || []; d.kredyty_splac = l.includes(id) ? l.filter((x) => x !== id) : [...l, id]; }),
  "bk-usun": (el, c, e) => { e.preventDefault(); return c.zmien((d) => { d[el.dataset.co].splice(+el.dataset.i, 1); }); },
  "bk-nowa-lokata": (el, c) => {
    const opcje = mojeBanki(c.v, c.kat).flatMap((b) => Object.entries(b.lokaty).map(([r, o]) => `<option value="${esc(b.nazwa)}|${r}">${esc(b.nazwa)} – ${rundy(+r)} – ${proc(o, 1)}</option>`));
    okno("Zakładanie lokaty", `<div class="dwie">${pole("bk-l-oferta", "Bank i okres", `<select>${opcje.join("")}</select>`)}
      ${pole("bk-l-kwota", "Kwota", `<input type="number" min="1" step="100" value="${Math.max(0, Math.floor(c.v.stan.gotowka))}">`)}</div>
      <p class="podpowiedz">Dostępne saldo: ${zl(c.v.stan.gotowka)}. Pieniądze na lokacie nie są dostępne na bieżące wydatki.</p>`,
    { male: true, przyciski: przyciski("bk-zaloz", "Załóż") });
  },
  "bk-zaloz": async (el, c) => {
    const [bank, r] = (wartosc("bk-l-oferta") || "|").split("|"), kwota = +wartosc("bk-l-kwota");
    if (!(kwota > 0)) return toast("Podaj kwotę.");
    zamknijOkno();
    await c.zmien((d) => { d.lokaty_zaloz = [...(d.lokaty_zaloz || []), { bank, kwota, rund: +r }]; });
  },
  "bk-debet": (el, c) => c.zmien((d) => { d.debet = !debetWlaczony(c.v); }),
  "bk-nowy-kredyt": (el, c) => {
    const lista = oferty(c.v, c.kat);
    const { i: wybr, kwota = 10000, rund = 26 } = el.dataset;
    const opcje = lista.map((p, i) => `<option value="${i}" ${String(i) === wybr ? "selected" : ""}>${esc(p.bank)} – ${esc(p.nazwa)} – ${proc(p.oprocentowanie, 1)}, prowizja ${proc(p.prowizja, 1)}, do ${zl(p.maks_kwota)} / ${rundy(p.maks_rund)}${p.historia ? " (wymaga historii)" : ""}${p.od_lokalu ? " (dla firmy z lokalem)" : ""}${p.zastaw ? " (pod zastaw)" : ""}</option>`);
    const zastawy = [...c.v.banki.zastawy, ...kupowanyLokal(c)].map((z) => `<option value="${esc(z.id)}">${esc(z.nazwa)} – wartość ${zl(z.wartosc)}</option>`);
    okno("Kredyt", `${pole("bk-k-oferta", "Oferta", `<select>${opcje.join("")}</select>`)}
      <div class="dwie">${pole("bk-k-kwota", "Kwota", `<input type="number" min="100" step="1000" value="${+kwota}">`)}
      ${pole("bk-k-rund", `Okres (${OKRES.mnoga})`, `<input type="number" min="1" value="${+rund}">`)}</div>
      ${pole("bk-k-zastaw", "Zastaw (kredyt inwestycyjny)", `<select><option value="">– bez zastawu –</option>${zastawy.join("")}</select>`)}
      <p class="podpowiedz">Pod zastaw można dać kupiony lokal${ustawienia(c.kat).zastaw_przejecia ? ", budynek z najemcą" : ""} albo kupiony sprzęt (wartość netto po amortyzacji), a także lokal
        kupowany w tej rundzie – kredyt wchodzi przed zakupem, więc pokrywa część ceny (przy działce zastawem jest
        budowany lokal: wartość = cena + koszt budowy).${ustawienia(c.kat).zastaw_przejecia ? ` Tak samo budynek z najemcą
        kupowany w tej rundzie (Nowe lokale ▸ Przejęcia), gdy w tej rundzie nie kupujesz lokalu.` : ""}</p>`,
    { male: true, przyciski: przyciski("bk-wez-kredyt", "Weź kredyt") });
  },
  "bk-wez-kredyt": async (el, c) => {
    const p = oferty(c.v, c.kat)[+wartosc("bk-k-oferta")], kwota = +wartosc("bk-k-kwota"), rund = +wartosc("bk-k-rund");
    if (!(kwota > 0) || !(rund > 0)) return toast("Podaj kwotę i okres.");
    if (p.zastaw && !wartosc("bk-k-zastaw")) return toast("Kredyt inwestycyjny wymaga zastawu.");
    zamknijOkno();
    await c.zmien((d) => {
      d.kredyty_wez = [...(d.kredyty_wez || []), { bank: p.bank, produkt: p.produkt, kwota, rund, ...(p.zastaw ? { zastaw: wartosc("bk-k-zastaw") } : {}) }];
    });
  },
  "bk-nowy-leasing": (el, c) => {
    const banki = mojeBanki(c.v, c.kat).filter((b) => b.leasing);
    if (!banki.length) return toast("Twój bank nie prowadzi leasingu sprzętu.");
    const opcje = banki.flatMap((b) => b.leasing.rund.map((r) => `<option value="${esc(b.nazwa)}|${r}">${esc(b.nazwa)} – ${rundy(r)} – ${proc(b.leasing.oprocentowanie, 1)}, wpłata ${proc(b.leasing.wplata, 0)}, wykup ${proc(b.leasing.wykup, 0)}</option>`));
    const stan = c.v.stan.stanowiska.map((s) => `<option value="${s.typ}|${s.nr}">${s.typ} ${s.nr}</option>`);
    const sprzet = Object.entries(c.kat.sprzet).map(([n, s]) => `<option value="${esc(n)}">${esc(n)} (${s.dla})</option>`);
    okno("Leasing sprzętu", `${pole("bk-s-oferta", "Bank i okres", `<select>${opcje.join("")}</select>`)}
      <div class="dwie">${pole("bk-s-stan", "Stanowisko", `<select>${stan.join("")}</select>`)}
      ${pole("bk-s-sprzet", "Sprzęt", `<select>${sprzet.join("")}</select>`)}</div>
      ${pole("bk-s-jakosc", "Jakość", `<select><option value="1">1</option><option value="2">2</option><option value="3" selected>3</option></select>`)}`,
    { male: true, przyciski: przyciski("bk-wez-leasing", "Weź w leasing") });
  },
  "bk-wez-leasing": async (el, c) => {
    const [bank, r] = wartosc("bk-s-oferta").split("|"), [typ, nr] = (wartosc("bk-s-stan") || "|").split("|");
    if (!typ) return toast("Najpierw potrzebne jest stanowisko.");
    zamknijOkno();
    await c.zmien((d) => { d.leasing_wez = [...(d.leasing_wez || []), { bank, typ, nr: +nr, nazwa: wartosc("bk-s-sprzet"), jakosc: +wartosc("bk-s-jakosc"), rund: +r }]; });
  },
};
