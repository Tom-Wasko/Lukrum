// Inwestycje: stanowiska, sprzęt, wyposażenie dla klientów.
import { kosztLokali, miejscaLokali } from "./lokale.js";
import { esc, kartaMarki, KOLORY, naOkres, naRunde, gw, kafelkiLiczb, licz, nazwaFirmy, nazwaUslugi, okno, podsumowanie, proc, tabela, toast, wykres, zamknijOkno, zl, zwinTabela, zl2 } from "./wspolne.js";
import { decyzjaLokalu, idWybranego, listaLokalu, nazwaLokalu, opisLokalu, stanowiskaLokalu } from "./lokal_wybor.js";
import { klienciZKolejki, OPISY_SPRZETU, wykresObciazenia } from "./obciazenie.js";

// miejsca na stanowiska – przy kilku lokalach tylko w wybranym lokalu
function miejscaWybranego(v, typ) {
  const id = idWybranego(v), l = id && opisLokalu(v, id);
  return l ? { wszystkie: l.miejsca[typ], zajete: l.zajete[typ] } : miejscaLokali(v, typ);
}

const TYPY = ["kuchnia", "kasa"];  // nazwy typów: kat.oferty.stanowiska.typy (katalog.yaml)
const suma = (pozycje, start) => pozycje.filter((p) => p.opis.startsWith(start)).reduce((s, p) => s + p.pozostale, 0);

// sprawa 21 (nowy wygląd): pakiety stanowisk jako karta z wierszami ofert; przy każdym pakiecie koszt jednego stanowiska
function kartaStanowisk(v, kat, typ, pakiety, nowe, edycja) {
  const maja = stanowiskaLokalu(v, v.stan_przed.stanowiska).filter((s) => s.typ === typ).length;
  const m = miejscaWybranego(v, typ);
  const naSztuke = Object.entries(pakiety).map(([n, c]) => c / +n), min = Math.min(...naSztuke);
  const wiersze = Object.entries(pakiety).map(([n, c], i) => {
    const jest = +nowe[typ] === +n;
    return `<div class="oferta-wiersz ${jest ? "wybrany" : ""}"><div><b>+${n} ${n === "1" ? "stanowisko" : +n < 5 ? "stanowiska" : "stanowisk"}</b>${naSztuke[i] === min
      ? ` <span class="pigulka inf">najtaniej za sztukę</span>` : ""}<span class="podpowiedz zostaw">${zl(naSztuke[i])} za stanowisko</span></div>
      <b class="cena">${zl(c)}</b>${jest ? `<button class="btn zielony maly" data-akcja="pakiet" data-t="${typ}" data-n="0" ${edycja ? "" : "disabled"}>✓ Wybrano</button>`
        : `<button class="btn czarny maly" data-akcja="pakiet" data-t="${typ}" data-n="${n}" ${edycja ? "" : "disabled"}>Wybierz</button>`}</div>`;
  }).join("");
  return kartaMarki({ kolor: typ === "kuchnia" ? KOLORY[2] : KOLORY[1], nazwa: kat.oferty.stanowiska.typy[typ].nazwa, rodzaj: `masz ${maja}`,
    znak: typ === "kuchnia" ? "K" : "zł",
    suma: m ? `miejsca zajęte <b>${m.zajete} z ${m.wszystkie}</b>${m.wszystkie ? "" : "<br>najpierw wybierz lokal (Stare Miasto, biuro „Klucz”)"}` : "",
    tresc: `<div class="oferty-wiersze">${wiersze}</div>` });
}

export const stanowiska = {
  tytul: "Stanowiska", tytulPelny: "Inwestycje - stanowiska", ikona: "▥", odblokowanie: "inwestycje_stanowiska",
  info: "Uruchom potrzebną liczbę stanowisk w Twojej firmie. Stanowisko działa już w rundzie zakupu. Każdy pracownik potrzebuje swojego stanowiska.",
  decyzje({ v, kat, edycja }) {
    const pakiety = kat.oferty.stanowiska.pakiety;
    const id = idWybranego(v), nowe = decyzjaLokalu(v.decyzje, v, "stanowiska") || {};
    const koszt = suma(v.koszty_decyzji, "Uruchomienie stanowiska");
    const o = id && opisLokalu(v, id);   // przy kilku lokalach pasek pokazuje wybrany lokal (zmiana lokalu ma być widoczna)
    const kLokalu = o ? (o.forma === "najem" ? naRunde(o.czynsz) : 0) + (o.dziala ? naRunde(o.utrzymanie) : 0) : 0;
    let html = `<div class="pasek ciemny">${o ? `<span>Lokal: <span class="kwota">${esc(o.nazwa)}</span></span>
      <span>Czynsz i media tego lokalu: <span class="kwota">${zl(kLokalu)}</span></span>` : `<span>Koszt lokali (czynsz i media): <span class="kwota">${zl(kosztLokali(v))}</span></span>`}
      <span>Nowe stanowiska${o ? " – cała firma" : ""}: <span class="kwota">${zl(koszt)}</span></span></div><div class="banki-siatka" style="margin-top:20px">`;
    for (const typ of TYPY) html += kartaStanowisk(v, kat, typ, pakiety, nowe, edycja);
    return html + `</div><p class="podpowiedz">${id ? `Stanowiska powstaną w lokalu <b>${esc(nazwaLokalu(v, id))}</b>. ` : ""}W jednej rundzie można uruchomić jeden pakiet każdego rodzaju (do 5 stanowisk). Puste stanowiska nie generują kosztów.</p>`;
  },
  wyniki({ v, kat }) {
    const typy = kat.oferty.stanowiska.typy, sprzet = v.wyniki?.sprzet || [];
    let razemSt = 0;
    const own = TYPY.map((typ) => {
      const st = stanowiskaLokalu(v, v.stan.stanowiska).filter((s) => s.typ === typ), m = miejscaWybranego(v, typ);
      razemSt += st.length;
      const ob = sprzet.filter((s) => s.typ === typ).map((s) => s.oblozenie);
      return [esc(typy[typ].nazwa), licz(st.length), m ? `${licz(m.zajete)} z ${licz(m.wszystkie)}` : "–",
        ob.length ? proc(ob.reduce((a, x) => a + x, 0) / ob.length) : "–", ob.length ? proc(Math.max(...ob)) : "–"];
    });
    const rs = v.rynek?.stanowiska || {};
    const firmy = Object.keys(rs).map((f) => [esc(nazwaFirmy(v, f)), ...TYPY.map((t) => licz(rs[f][t] || 0))]);
    const obl = sprzet.map((s) => s.oblozenie), srOb = obl.length ? obl.reduce((a, x) => a + x, 0) / obl.length : null, maxOb = obl.length ? Math.max(...obl) : null;
    const lead = podsumowanie([`Firma ma ${razemSt} ${razemSt === 1 ? "stanowisko" : razemSt >= 2 && razemSt <= 4 ? "stanowiska" : "stanowisk"}.`,
      maxOb == null ? "" : maxOb >= 0.95 ? "Któryś sprzęt pracował niemal na pełnych obrotach – to wąskie gardło." : `Najbardziej obciążony sprzęt pracował na ${proc(maxOb)} swoich możliwości.`], maxOb >= 0.95 ? "uwaga" : "");
    const kafle = kafelkiLiczb([{ etykieta: "Stanowiska", wartosc: licz(razemSt) }, srOb != null && { etykieta: "Średnie obłożenie sprzętu", wartosc: proc(srOb) },
      maxOb != null && { etykieta: "Najwyższe obłożenie", wartosc: proc(maxOb), ton: maxOb >= 0.95 ? "minus" : "" }]);
    return lead + kafle + zwinTabela("Twoje stanowiska", ["Rodzaj", "Liczba", "Miejsca w lokalach (zajęte)", "Średnie obłożenie sprzętu", "Najwyższe obłożenie"], own, { klasy: ["l"], otwarte: true })
      + (firmy.length ? zwinTabela("Stanowiska konkurencji", ["Firma", ...TYPY.map((t) => esc(typy[t].nazwa))], firmy, { klasy: ["l"] }) : "")
      + `<p class="podpowiedz">Obłożenie blisko 100% oznacza, że sprzęt był wąskim gardłem – kolejne stanowisko (i pracownik) przyjmie więcej klientów.</p>`;
  },
  akcje: {
    pakiet: (el, c) => c.zmien((d) => {
      const id = idWybranego(c.v), wpis = { [el.dataset.t]: +el.dataset.n };
      if (!id) { d.stanowiska = { ...(d.stanowiska || {}), ...wpis }; return; }
      d.w_lokalu = d.w_lokalu || {};
      d.w_lokalu[id] = { ...(d.w_lokalu[id] || {}), stanowiska: { ...(d.w_lokalu[id]?.stanowiska || {}), ...wpis } };
    }),
  },
};

function sprzetStanowiska(v, typ, nr) {
  const teraz = v.stan.stanowiska.find((s) => s.typ === typ && s.nr === nr) || { sprzet: {} };
  const przed = v.stan_przed.stanowiska.find((s) => s.typ === typ && s.nr === nr) || { sprzet: {} };
  return { teraz: teraz.sprzet, przed: przed.sprzet, st: teraz };
}

// Poprawki 3 (sprawa 11): obłożenie sprzętu na stanowiskach wybranego lokalu – ten sam wykres co czas pracy w Mój kebab ▸ Zespół
// (obciazenie.js). Szafy i zamrażarki tylko przechowują towar (kat.sprzet[n].przechowywanie) – bez obłożenia; sprzęt kasy
// pracuje razem (to samo obłożenie) – jeden wiersz na stanowisko kasowe.
const godzinySprzetu = (kat) => kat.parametry?.godziny_sprzetu ?? kat.parametry?.godziny ?? 40;
function wykresSprzetu(v, kat) {
  const T = kat.oferty.stanowiska.typy, H = godzinySprzetu(kat), lista = v.wyniki?.sprzet || [];
  const P = [];
  for (const st of stanowiskaLokalu(v, v.stan.stanowiska)) {
    const sp = lista.filter((s) => s.typ === st.typ && s.stanowisko === st.nr && !kat.sprzet[s.nazwa]?.przechowywanie);
    if (!sp.length) continue;
    const osoba = v.stan.pracownicy.find((x) => x.id === st.pracownik)?.imie_nazwisko
      || (v.wyniki?.wlasciciel_stanowisko?.typ === st.typ && v.wyniki.wlasciciel_stanowisko.nr === st.nr ? "właściciel" : "bez pracownika");
    const grupa = `${esc(T[st.typ]?.kto || st.typ)} nr ${st.nr} <span>· ${esc(osoba)}</span>`;
    const wiersze = st.typ === "kasa" ? [{ nazwa: "Zestaw kasy", podpis: sp.map((s) => s.nazwa).join(", "), oblozenie: Math.max(...sp.map((s) => s.oblozenie)) }]
      : sp.map((s) => ({ nazwa: s.nazwa, podpis: `jakość ${"★".repeat(s.jakosc)}`, oblozenie: s.oblozenie }));
    for (const w of wiersze) P.push({ ...w, grupa, x: w.oblozenie, h: w.oblozenie * H, hMax: H });
  }
  const pr = v.progi_czasu_pracy || {}, kolejka = klienciZKolejki(v), id = idWybranego(v);
  const przypis = kolejka ? `<p class="obc-kolejka">▲ Klienci, którzy nie doczekali się obsługi (kolejka): <b>${licz(kolejka)}</b> – w godzinach szczytu brakowało rąk albo sprzętu.</p>` : "";
  return wykresObciazenia({ tytul: `Obłożenie sprzętu w ostatniej rundzie${id ? ` – ${nazwaLokalu(v, id)}` : ""}`, pozycje: P,
    progi: { niski: pr.niski, wysoki: pr.przepracowanie }, opisy: OPISY_SPRZETU, przypis });
}

export const sprzet = {
  tytul: "Sprzęt", tytulPelny: "Inwestycje - sprzęt", ikona: "⚙", odblokowanie: "inwestycje_sprzet",
  info: "Kup sprzęt potrzebny do przygotowania wybranych przez Ciebie dań. Sprzęt kupuje się na konkretne stanowisko.",
  decyzje({ v, kat, edycja }) {
    const koszt = suma(v.koszty_decyzji, "Koszt zakupu: ");
    const utrz = stanowiskaLokalu(v, v.stan.stanowiska).reduce((s, st) => s + Object.entries(st.sprzet).reduce((a, [n, q]) => a + kat.sprzet[n].utrzymanie[q], 0), 0);
    const idL = idWybranego(v), oL = idL && opisLokalu(v, idL);
    let html = `<div class="pasek ciemny">${oL ? `<span>Lokal: <span class="kwota">${esc(oL.nazwa)}</span></span>` : ""}<span>Koszty całkowite zakupu${oL ? " – cała firma" : ""}: <span class="kwota">${zl(koszt)}</span></span>
      <span>Koszt utrzymania sprzętu${oL ? " w lokalu" : ""}: <span class="kwota">${zl(naRunde(utrz))}</span>${naOkres()}</span></div>`;
    for (const typ of TYPY) {
      const st = stanowiskaLokalu(v, v.stan.stanowiska).filter((s) => s.typ === typ);
      html += `<div class="pasek">${esc(kat.oferty.stanowiska.typy[typ].nazwa)}</div>`;
      if (!st.length) { html += `<p class="podpowiedz">Brak stanowisk${idWybranego(v) ? " w tym lokalu" : ""} – uruchom je w części Stanowiska.</p>`; continue; }
      html += `<div class="siatka">${st.map((s) => {
        const { przed } = sprzetStanowiska(v, typ, s.nr);
        const p = v.stan.pracownicy.find((x) => x.id === s.pracownik);
        const lista = Object.entries(s.sprzet).map(([n, q]) => `<div class="wiersz"><span>${esc(n)}</span><span>${gw(q)}${n in przed ? "" : ' <span class="pigulka inf">nowy</span>'}</span></div>`).join("")
          || `<p class="podpowiedz">Brak sprzętu</p>`;
        const uslugi = typ === "kuchnia" ? Object.entries(kat.uslugi).filter(([, u]) => u.sprzet.every((n) => n in s.sprzet)).map(([k]) => nazwaUslugi(kat, k)) : [];
        return `<div class="kafel"><div class="kg">Stanowisko nr ${s.nr}<span class="podpowiedz">${p ? esc(p.imie_nazwisko) : "bez pracownika"}</span></div>
          <div class="kt">${lista}${uslugi.length ? `<p class="podpowiedz">Można przygotować: ${uslugi.map(esc).join(", ")}</p>` : ""}</div>
          <div class="kd"><button class="btn czarny" data-akcja="kup-sprzet" data-t="${typ}" data-n="${s.nr}" ${edycja ? "" : "disabled"}>${Object.keys(przed).length ? "Dokup sprzęt" : "Kup sprzęt"}</button>
          ${Object.keys(przed).length ? `<button class="btn pom" data-akcja="sprzedaj-sprzet" data-t="${typ}" data-n="${s.nr}" ${edycja ? "" : "disabled"}>Sprzedaj sprzęt</button>` : ""}</div></div>`;
      }).join("")}</div>`;
    }
    return html;
  },
  wyniki({ v, kat }) {
    const wykres = wykresSprzetu(v, kat);
    const own = (v.wyniki?.sprzet || []).map((s) => [`${esc(kat.oferty.stanowiska.typy[s.typ]?.kto || s.typ)} nr ${s.stanowisko}`, esc(s.nazwa), gw(s.jakosc), proc(s.oblozenie)]);
    const firmy = Object.keys(v.rynek?.sprzet || {});
    const ile = firmy.map((f) => [esc(nazwaFirmy(v, f)), ...[1, 2, 3].map((q) => licz(v.rynek.sprzet[f][q])),
      licz([1, 2, 3].reduce((a, q) => a + v.rynek.sprzet[f][q], 0))]);
    const sp = v.wyniki?.sprzet || [], top = sp.length ? sp.reduce((a, s) => (s.oblozenie > a.oblozenie ? s : a)) : null;
    const lead = podsumowanie(top ? [`Firma ma ${sp.length} ${sp.length === 1 ? "sprzęt" : "sprzętów"} w użyciu; najbardziej obciążony to ${esc(top.nazwa)} (${proc(top.oblozenie)}).`,
      top.oblozenie >= 0.95 ? "Ten sprzęt nie nadążał z obsługą – warto dołożyć drugi albo lepszy." : "Żaden sprzęt nie był wąskim gardłem."] : "Firma nie ma jeszcze sprzętu, który pracował w tej rundzie.", top && top.oblozenie >= 0.95 ? "uwaga" : "");
    return lead + wykres + zwinTabela("Obłożenie sprzętu (Twoja firma)", ["Stanowisko", "Sprzęt", "Jakość", "Obłożenie"], own, { klasy: ["l", "l"], otwarte: true })
      + zwinTabela("Liczba i jakość sprzętów", ["Firma", "Niska ★", "Średnia ★★", "Wysoka ★★★", "Razem"], ile, { klasy: ["l"] })
      + `<p class="podpowiedz">Obłożenie = godziny pracy sprzętu / ${licz(godzinySprzetu(kat))} h w rundzie. 100% oznacza, że sprzęt nie mógł obsłużyć kolejnych klientów.</p>`;
  },
  akcje: {
    "kup-sprzet": (el, c) => oknoZakupu(c, el.dataset.t, +el.dataset.n),
    "sprzedaj-sprzet": (el, c) => oknoSprzedazy(c, el.dataset.t, +el.dataset.n),
    "kup-poz": async (el, c) => {
      const { t, n, nazwa, q } = el.dataset;
      await c.zmien((d) => {
        d.sprzet_kup = (d.sprzet_kup || []).filter((x) => !(x.typ === t && x.nr === +n && x.nazwa === nazwa));
        if (q !== "0") d.sprzet_kup.push({ typ: t, nr: +n, nazwa, jakosc: +q });
      });
      return SPRZET ? oknoSprzetu(c, SPRZET) : oknoZakupu(c, t, +n);
    },
    "kup-komplet": async (el, c) => {
      const { t, n } = el.dataset;
      const u = document.getElementById("komplet-usluga").value, q = +document.getElementById("komplet-jakosc").value;
      const nazwy = t === "kasa" ? c.kat.sprzet_kasy : c.kat.uslugi[u].sprzet;
      const { teraz } = sprzetStanowiska(c.v, t, +n);
      const brak = nazwy.filter((x) => !(x in teraz));
      if (!brak.length) return toast("Stanowisko ma już cały ten sprzęt.");
      await c.zmien((d) => { d.sprzet_kup = [...(d.sprzet_kup || []), ...brak.map((nazwa) => ({ typ: t, nr: +n, nazwa, jakosc: q }))]; });
      oknoZakupu(c, t, +n);
    },
    "sprzedaj-poz": async (el, c) => {
      const { t, n, nazwa } = el.dataset;
      await c.zmien((d) => {
        const l = d.sprzet_sprzedaj || [];
        const jest = l.some((x) => x.typ === t && x.nr === +n && x.nazwa === nazwa);
        d.sprzet_sprzedaj = jest ? l.filter((x) => !(x.typ === t && x.nr === +n && x.nazwa === nazwa)) : [...l, { typ: t, nr: +n, nazwa }];
      });
      return SPRZET ? oknoSprzetu(c, SPRZET) : oknoSprzedazy(c, t, +n);
    },
  },
};

// --- okno hurtowni sprzętu: tylko wybrana grupa sprzętu (podróż 02/sklepy) ----------------------------------------------------------
// s: { nazwy: [sprzęt z kat.sprzet], tytul, widok?: "kup" | "komis" }. Te same decyzje co na ekranie „Sprzęt” (sprzet_kup, sprzet_sprzedaj),
// ale z listą pozycji tej grupy i z tym, co stanowiska już mają (kupiony sprzęt nie jest oferowany drugi raz).
let SPRZET = null;
export function otworzSprzet(c, s) { SPRZET = s; oknoSprzetu(c, s); }

// Okno hurtowni sprzętu jako paragon kasowy (podróż 03/paragon): pozycje w kolumnie (nazwa, 1 × cena, kwota), suma na dole,
// nazwa hurtowni i data w nagłówku, krój o stałej szerokości. Decyzje bez zmian (sprzet_kup, sprzet_sprzedaj).
function oknoSprzetu(c, s) {
  const { v, kat, edycja } = c, komis = s.widok === "komis";
  const typy = komis ? TYPY : [...new Set(s.nazwy.map((n) => kat.sprzet[n]?.dla).filter(Boolean))];
  const stanowiska_ = stanowiskaLokalu(v, v.stan.stanowiska).filter((x) => typy.includes(x.typ));
  const przyciski = `<button class="btn pom" data-akcja="zamknij-okno">Gotowe</button>`;
  const dni = v.lokale && v.swiezosc?.dni, data = dni?.length ? `${+dni[0].data.slice(8, 10)}.${dni[0].data.slice(5, 7)}.${dni[0].data.slice(0, 4)}` : esc(v.miesiac || `Tydzień ${v.runda}`);
  const kupione = (st, n, q) => (v.decyzje.sprzet_kup || []).some((x) => x.typ === st.typ && x.nr === st.nr && x.nazwa === n && (q === undefined || x.jakosc === q));
  let suma = 0, html = "";
  for (const st of stanowiska_) {
    const { przed, teraz } = sprzetStanowiska(v, st.typ, st.nr), kto = kat.oferty.stanowiska.typy[st.typ].nazwa;
    const poz = [];
    const wiersz = (nazwa, q, cena, opis, przycisk, wybrane) => `<div class="par-poz ${wybrane ? "wybrany" : ""}"><div class="par-wiersz"><span class="par-nazwa">${wybrane ? "✓ " : ""}${esc(nazwa)}${gw(q)}</span></div>
      <div class="par-wiersz par-ile"><span class="par-mnoz">1 × ${cena}</span><b class="par-kwota">${przycisk}</b></div>${opis ? `<small class="par-opis">${opis}</small>` : ""}</div>`;
    if (komis) {
      const sprzedawane = (v.decyzje.sprzet_sprzedaj || []).filter((x) => x.typ === st.typ && x.nr === st.nr).map((x) => x.nazwa);
      for (const [n, q] of Object.entries(przed)) {
        const tak = sprzedawane.includes(n), cena = v.ceny_sprzedazy_sprzetu[n][q];
        if (tak) suma += cena;
        poz.push(wiersz(n, q, zl2(cena), "", `<button class="btn ${tak ? "zielony" : "pom"} maly" data-akcja="sprzedaj-poz" data-t="${st.typ}" data-n="${st.nr}" data-nazwa="${esc(n)}" ${edycja ? "" : "disabled"}>${tak ? "✓ Sprzedane" : "Sprzedaj"}</button>`, tak));
      }
    } else for (const n of s.nazwy.filter((x) => kat.sprzet[x]?.dla === st.typ)) {
      if (n in przed) { poz.push(wiersz(n, przed[n], "–", "już kupione w tym stanowisku", `<span class="pigulka ok">✓ masz już</span>`, true)); continue; }
      for (const q of [1, 2, 3]) {
        const tak = kupione(st, n, q), cena = kat.sprzet[n].ceny[q];
        if (tak) suma += cena;
        poz.push(wiersz(n, q, zl2(cena), `utrzymanie${naOkres()}: ${zl2(naRunde(kat.sprzet[n].utrzymanie[q]))}`,
          tak ? `<button class="btn zielony maly" data-akcja="kup-poz" data-t="${st.typ}" data-n="${st.nr}" data-nazwa="${esc(n)}" data-q="0" ${edycja ? "" : "disabled"}>✓ W koszyku</button>`
            : `<button class="btn pom maly" data-akcja="kup-poz" data-t="${st.typ}" data-n="${st.nr}" data-nazwa="${esc(n)}" data-q="${q}" ${edycja && !(n in teraz) ? "" : "disabled"}>Kup</button>`, tak));
      }
    }
    if (!poz.length) continue;
    html += `<section class="pp-par-grupa"><h3>${esc(kto)}, stanowisko nr ${st.nr}</h3>${poz.join("")}</section>`;
  }
  if (!html) html = `<p class="pp-par-pusty">${komis ? "Żadne stanowisko nie ma jeszcze sprzętu do odsprzedania."
    : stanowiska_.length ? "Wszystkie stanowiska mają już ten sprzęt." : "Najpierw uruchom stanowisko w stolarni. Dopiero potem kupisz do niego sprzęt."}</p>`;
  const tresc = `<div class="pp-paragon par-sklep" role="document"><header class="pp-par-gora"><b class="pp-par-szyld">LUKRUM</b><b class="par-sklep-nazwa">HURTOWNIA SPRZĘTU</b>
    <span>${esc(s.tytul)}</span><span>${data}</span></header>${html}
    <div class="pp-par-suma"><span>${komis ? "SUMA ODSPRZEDAŻY" : "SUMA PLN"}</span><b>${zl2(suma)}</b></div>
    <p class="pp-par-nota">${komis ? "Sprzedaż liczy się przy zamknięciu tygodnia." : "✓ oznacza sprzęt w koszyku. Kliknięcie „✓ W koszyku” go usuwa."}<br>Dziękujemy, prosimy o paragon!</p>
    <div class="pp-par-zab" aria-hidden="true"></div></div>`;
  okno(s.tytul, tresc, { przyciski, klasa: "pp-okno-paragon par-okno", styl: 0, poZamknieciu: () => { SPRZET = null; } });
}

function oknoZakupu(c, typ, nr) {
  const { v, kat } = c;
  const { teraz, przed } = sprzetStanowiska(v, typ, nr);
  const nazwy = Object.keys(kat.sprzet).filter((n) => kat.sprzet[n].dla === typ);
  const wiersze = [];
  for (const n of nazwy) for (const q of [1, 2, 3]) {
    const kupione = (v.decyzje.sprzet_kup || []).some((x) => x.typ === typ && x.nr === nr && x.nazwa === n && x.jakosc === q);
    const posiadany = n in przed;
    const przycisk = posiadany ? `<span class="pigulka ok">w posiadaniu ${gw(przed[n])}</span>`
      : kupione ? `<button class="btn zielony maly" data-akcja="kup-poz" data-t="${typ}" data-n="${nr}" data-nazwa="${esc(n)}" data-q="0">✓ Kupione</button>`
      : `<button class="btn pom maly" data-akcja="kup-poz" data-t="${typ}" data-n="${nr}" data-nazwa="${esc(n)}" data-q="${q}" ${n in teraz ? "disabled" : ""}>Kup</button>`;
    wiersze.push([esc(n), gw(q), esc(kat.oferty.stanowiska.typy[typ].kto), zl2(kat.sprzet[n].ceny[q]), zl2(naRunde(kat.sprzet[n].utrzymanie[q])), przycisk]);
  }
  const uslugi = Object.entries(kat.uslugi).map(([k, u]) => `<option value="${k}">${esc(u.nazwa)}</option>`).join("");
  const komplet = `<div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap;margin-bottom:12px">
    ${typ === "kuchnia" ? `<label class="pole" style="flex:1">Komplet sprzętu dla dania<select id="komplet-usluga">${uslugi}</select></label>` : `<input type="hidden" id="komplet-usluga" value="">`}
    <label class="pole">Jakość<select id="komplet-jakosc"><option value="3">★★★ wysoka</option><option value="2">★★ średnia</option><option value="1">★ niska</option></select></label>
    <button class="btn czarny" data-akcja="kup-komplet" data-t="${typ}" data-n="${nr}">Kup brakujący ${typ === "kasa" ? "komplet kasy" : "komplet"}</button></div>`;
  okno(`Zakup sprzętu na stanowisko „Stanowisko nr ${nr}”`, komplet + tabela(null,
    ["Nazwa sprzętu", "Jakość", "Wykorzystanie sprzętu", "Koszt zakupu", `Koszt utrzymania${naOkres()}`, ""], wiersze, { klasy: ["l"] }),
    { przyciski: `<button class="btn pom" data-akcja="zamknij-okno">OK</button>` });
}

function oknoSprzedazy(c, typ, nr) {
  const { v, kat } = c;
  const { przed } = sprzetStanowiska(v, typ, nr);
  const sprzedawane = (v.decyzje.sprzet_sprzedaj || []).filter((x) => x.typ === typ && x.nr === nr).map((x) => x.nazwa);
  const w = Object.entries(przed).map(([n, q]) => [esc(n), gw(q), zl2(v.ceny_sprzedazy_sprzetu[n][q]), zl2(naRunde(kat.sprzet[n].utrzymanie[q])),
    `<button class="btn ${sprzedawane.includes(n) ? "zielony" : "pom"} maly" data-akcja="sprzedaj-poz" data-t="${typ}" data-n="${nr}" data-nazwa="${esc(n)}">${sprzedawane.includes(n) ? "✓ Sprzedane" : "Sprzedaj"}</button>`]);
  const przychod = Object.entries(przed).filter(([n]) => sprzedawane.includes(n)).reduce((s, [n, q]) => s + v.ceny_sprzedazy_sprzetu[n][q], 0);
  okno(`Sprzedaż sprzętu ze stanowiska „Stanowisko nr ${nr}”`, tabela(null, ["Nazwa", "Jakość", "Przychody ze sprzedaży", `Koszt utrzymania${naOkres()}`, ""], w, { klasy: ["l"] })
    + `<p><b>Przychody ze sprzedaży: ${zl(przychod)}</b></p>`
    + `<p class="podpowiedz">Sprzęt kupiony od progu amortyzacji to środek trwały: przy sprzedaży jego niezamortyzowana wartość idzie w koszty (Biurowiec przy Zana ▸ KPiR).</p>`, { przyciski: `<button class="btn pom" data-akcja="zamknij-okno">OK</button>` });
}

export const wyposazenie = {
  tytul: "Wyposażenie", tytulPelny: "Inwestycje - wyposażenie", ikona: "☕", odblokowanie: "inwestycje_wyposazenie",
  info: "Kup dodatkowe wyposażenie dla klientów Twojej firmy. Wyposażenie podnosi zadowolenie klientów i przyciąga ich do lokalu.",
  decyzje(c) { return kafleUdogodnien(c, "wyposazenie", "klientów"); },
  wyniki({ v }) {
    const w = Object.entries(v.rynek?.wyposazenie || {}).map(([f, n]) => [esc(nazwaFirmy(v, f)), licz(n)]);
    const moje = v.rynek?.wyposazenie?.[v.firma];
    return podsumowanie(moje != null ? `Firma ma ${licz(moje)} ${moje === 1 ? "pozycję" : moje >= 2 && moje <= 4 ? "pozycje" : "pozycji"} wyposażenia dla klientów.` : "Poniżej porównanie wyposażenia firm.")
      + zwinTabela("Posiadane wyposażenie", ["Firma", "Liczba pozycji wyposażenia"], w, { klasy: ["l"], otwarte: true });
  },
  akcje: { "kup-udog": (el, c) => przelaczUdog(el, c), "sprzedaj-udog": (el, c) => przelaczUdog(el, c) },
};

export const RODZAJ_ST = { lokal: "lokal", budynek: "budynek", grunt: "grunt (bez amortyzacji)", sprzet: "sprzęt", wyposazenie: "wyposażenie" };

// ewidencja środków trwałych jest w Biurowiec przy Zana ▸ KPiR (zakładka Środki trwałe usunięta)
export function ewidencja(lista, tytul) {
  const w = (lista || []).map((s) => [esc(s.nazwa), esc(RODZAJ_ST[s.rodzaj] || s.rodzaj), licz(s.od_rundy), proc(s.stawka),
    zl2(s.wartosc), zl2(s.umorzenie), zl2(s.netto)]);
  const suma = (k) => (lista || []).reduce((a, s) => a + s[k], 0);
  if (w.length) w.push(["<b>Razem</b>", "", "", "", `<b>${zl2(suma("wartosc"))}</b>`, `<b>${zl2(suma("umorzenie"))}</b>`, `<b>${zl2(suma("netto"))}</b>`]);
  return tabela(tytul, ["Środek trwały", "Rodzaj", "Od rundy", "Stawka roczna", "Wartość początkowa", "Umorzenie", "Wartość netto"],
    w.length ? w : [["Brak środków trwałych – wynajęty lokal i tańsze zakupy idą od razu w koszty.", "", "", "", "", "", ""]], { klasy: ["l", "l"] });
}

// Z42 (03/ukryte): „kolejna sztuka daje mniej” – liczby z v.wyposazenie_efekt (api/prezentacja.py)
function nasycenieWyposazenia(v, id) {
  const e = v.wyposazenie_efekt?.[id];
  if (!e) return "";
  const p = (x) => `${Math.round(x * 100)}%`;
  return `<p class="podpowiedz skutek-uwaga">▼ Każda kolejna sztuka wyposażenia podnosi liczbę gości słabiej niż poprzednia. ${e.sztuk
    ? `Teraz wyposażenie tego lokalu daje +${p(e.teraz)} gości (bez tego „zmęczenia” byłoby +${p(e.bez_nasycenia)}).` : "Pierwsze sztuki działają pełną siłą."}</p>`;
}

export function kafleUdogodnien({ v, kat, edycja }, rodzaj, kogo) {
  const pozycje = kat.oferty[rodzaj].pozycje.filter((p) => p.od_rundy <= v.runda);
  // przy kilku lokalach – wyposażenie / udogodnienia wybranego lokalu
  const id = idWybranego(v), przed = listaLokalu(v.stan_przed, rodzaj, id), teraz = listaLokalu(v.stan, rodzaj, id);
  const kupno = pozycje.filter((p) => teraz.includes(p.nazwa) && !przed.includes(p.nazwa)).reduce((s, p) => s + p.cena, 0);
  const utrz = pozycje.filter((p) => teraz.includes(p.nazwa)).reduce((s, p) => s + p.utrzymanie, 0);
  const sprzedaz = pozycje.filter((p) => przed.includes(p.nazwa) && !teraz.includes(p.nazwa)).reduce((s, p) => s + p.cena / 2, 0);
  return `${id ? `<div class="komunikat ok">${rodzaj === "wyposazenie" ? "Wyposażenie" : "Udogodnienia"} lokalu <b>${esc(nazwaLokalu(v, id))}</b>.</div>` : ""}
    <div class="pasek ciemny"><span>Koszt zakupu: <span class="kwota">${zl(kupno)}</span></span>
    <span>Koszt utrzymania: <span class="kwota">${zl(naRunde(utrz))}</span>${naOkres()}</span><span>Przychody ze sprzedaży: <span class="kwota">${zl(sprzedaz)}</span></span></div>
    ${rodzaj === "wyposazenie" ? nasycenieWyposazenia(v, id) : ""}
    ${kartyUdogodnien(pozycje, przed, teraz, rodzaj, kogo, edycja)}`;
}

// karta na sklep (wyposażenie; udogodnienia – jedna karta), pozycje jako zwarte wiersze
function kartyUdogodnien(pozycje, przed, teraz, rodzaj, kogo, edycja) {
  const grupy = new Map();
  for (const p of pozycje) {
    const k = p.sklep || "";
    if (!grupy.has(k)) grupy.set(k, []);
    grupy.get(k).push(p);
  }
  let nr = 0;
  const jedna = grupy.size === 1;   // udogodnienia bez sklepów – jedna szeroka karta, wiersze w dwóch kolumnach
  return `<div class="${jedna ? "" : "banki-siatka"}">${[...grupy].map(([sklep, l]) => {
    const wiersze = l.map((p) => {
      const mial = przed.includes(p.nazwa), ma = teraz.includes(p.nazwa);
      const przycisk = mial
        ? `<button class="btn ${ma ? "pom" : "zielony"} maly" data-akcja="sprzedaj-udog" data-r="${rodzaj}" data-nazwa="${esc(p.nazwa)}" ${edycja ? "" : "disabled"}>${ma ? "Sprzedaj" : "✓ Sprzedane"}</button>`
        : `<button class="btn ${ma ? "zielony" : "czarny"} maly" data-akcja="kup-udog" data-r="${rodzaj}" data-nazwa="${esc(p.nazwa)}" ${edycja ? "" : "disabled"}>${ma ? "✓ Wybrano" : "Wybierz"}</button>`;
      return `<div class="oferta-wiersz ${ma ? "wybrany" : ""}"><div><b>${esc(p.nazwa)}</b> <span class="pigulka inf" title="% ${kogo} oczekujących">czeka ${p.procent}%</span>
        ${p.opis ? `<span class="podpowiedz">${esc(p.opis)}</span>` : ""}<span class="podpowiedz">utrzymanie ${zl(naRunde(p.utrzymanie))}${naOkres()}</span></div>
        <b class="cena" title="${mial ? "cena sprzedaży" : "cena zakupu"}">${zl(mial ? p.cena / 2 : p.cena)}</b>${przycisk}</div>`;
    }).join("");
    const ile = l.filter((p) => teraz.includes(p.nazwa)).length;
    return kartaMarki({ kolor: KOLORY[(nr++ + 3) % KOLORY.length], nazwa: sklep || (rodzaj === "wyposazenie" ? "Instalacje i usługi" : "Udogodnienia dla pracowników"),
      rodzaj: sklep ? "sklep" : "", suma: ile ? `w lokalu: <b>${ile}</b>` : "", tresc: `<div class="oferty-wiersze ${jedna ? "dwie-kolumny" : ""}">${wiersze}</div>` });
  }).join("")}</div>`;
}

export async function przelaczUdog(el, c) {
  const r = el.dataset.r, n = el.dataset.nazwa;
  const id = idWybranego(c.v), mial = listaLokalu(c.v.stan_przed, r, id).includes(n);
  await c.zmien((d) => {
    const k = mial ? `${r}_sprzedaj` : `${r}_kup`;
    const cel = id ? ((d.w_lokalu = d.w_lokalu || {})[id] = d.w_lokalu[id] || {}) : d;
    const l = cel[k] || [];
    cel[k] = l.includes(n) ? l.filter((x) => x !== n) : [...l, n];
  });
}

export { zamknijOkno, wykres };
