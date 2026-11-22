// Oferta: wybór dań (menu), prognoza popytu i cena – wybrane danie jest w sprzedaży (silnik: _ceny_domyslne).
import { danieSpecjalne, esc, gw, licz, miesiacRundy, nazwaRundy, nazwaUslugi, odRundyDania, OKRES, okno, podsumowanie, proc, slupki, tabela, toast, wykres, zl, zl2, zwinTabela, brakWynikow } from "./wspolne.js";
import { kolko } from "./dymki.js";
import { cenyLokalu, lokalWybrany, menuLokalu, nazwaLokalu, strefaWybranego, wieleLokali, zapiszWLokalu } from "./lokal_wybor.js";
import { widelki } from "./sprzedaz.js";

const kategorie = (kat) => [...new Set(Object.values(kat.uslugi).map((u) => u.kategoria))];  // kolejność jak w uslugi.yaml
const JAK = { 1: "Niska", 2: "Średnia", 3: "Wysoka" };

export const prognozaBazowa = (u, miesiac) => Math.round((u.popyt_roczny / OKRES.rund_w_roku) * u.sezonowosc[miesiac]);
// gra z lokalami: bez podpowiedzi – popyt drużyna liczy sama z pul klientów stref (zakładka Klienci i strefy)
const prognozaDania = (v, kat, klucz, m) => v.popyt ? 0 : prognozaBazowa(kat.uslugi[klucz], m);
// miesiąc (sezonowość), w którym sprzedaje się dania wybrane w rundzie r – runda 1 przygotowuje sprzedaż w rundzie 2
const miesiacSprzedazy = (r) => miesiacRundy(Math.max(r, 2));
const popytOkresu = () => `popyt ${OKRES.przymiotnik.toLowerCase()}`;
const MIESIACE = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"];
const sprzedazOtwarta = (v) => v.odblokowane.includes("sprzedaz");

// sezonowość w kafelku dania – miesiąc sprzedaży (ciemny) i 3 kolejne, te same słupki co w Strefach miasta
export function sezonSlupki(u, m) {
  return slupki([0, 1, 2, 3].map((i) => (m + i) % 12).map((x, i) => ({ x: u.sezonowosc[x], ten: !i, etykieta: MIESIACE[x],
    dopisek: i ? "" : "miesiąc sprzedaży" })), "Sezonowość dania: miesiąc sprzedaży i 3 kolejne");
}

// udział lokalu w klientach strefy zmierzony w modelu (silnik/rynek/popyt.py: podzial; równe ceny i jakość, grupy klientów włączone):
// sam w strefie ≈ ½ (zależnie od strefy 0,4–0,6), z 1 rywalem ≈ 0,4, z 2 rywalami ≈ 0,3
const UDZIAL = { sam: 0.5, rywal1: 0.4, rywal2: 0.3 };

// instrukcja liczenia prognozy na tydzień (silnik/rynek/popyt.py: pule i udział lokalu); przykład z lokalem drużyny
function jakPrognoza(v, kat, u, m, nazwaDania = u.nazwa) {
  const tyg = u.popyt_roczny / OKRES.rund_w_roku, sez = u.sezonowosc[m];
  if (!v.popyt) {   // gra bez lokali: popyt jest jeden dla całej firmy
    return `<b>Popyt roczny</b> – tyle porcji dania zjadają w roku klienci. Prognoza na ${OKRES.mianownik} ≈ ${licz(u.popyt_roczny)} ÷ ${OKRES.rund_w_roku} ≈ ${licz(Math.round(tyg))},
      razem z sezonowością dania w miesiącu sprzedaży (${MIESIACE[m]}: × ${licz(sez, 2)}) ≈ ${licz(Math.round(tyg * sez))}.`;
  }
  const A = (t) => `<a data-zakladka-k="${t}">`;
  const lok = lokalWybrany(v), idStrefy = v.lokale?.moje?.find((l) => l.id === lok?.id)?.strefa || Object.keys(v.popyt.strefy)[0];
  const strefa = v.popyt.strefy[idStrefy], rozruch = v.popyt.rozruch;
  const start = rozruch?.start ?? 1, przyrost = rozruch?.przyrost ?? 0;
  const wynik = Math.round(tyg * sez * strefa.wielkosc * UDZIAL.sam * start);
  const nazwa = kat.mapa?.strefy?.[idStrefy]?.nazwa ?? idStrefy;
  return `<b>Prognoza na ${OKRES.mianownik} ≈</b><br>popyt roczny ÷ ${OKRES.rund_w_roku} × sezonowość × wielkość strefy × Twój udział × rozruch
    <br>1. <b>Popyt roczny ÷ ${OKRES.rund_w_roku}</b> – ten kafel: ${licz(u.popyt_roczny)} ÷ ${OKRES.rund_w_roku} ≈ ${licz(Math.round(tyg))}.
    <br>2. <b>Sezonowość</b> – słupki przy daniu (ciemny = miesiąc sprzedaży, ${MIESIACE[m]}: × ${licz(sez, 2)}).
    <br>3. <b>Wielkość strefy</b> – ${A("klienci")}Miasteczko akademickie ▸ Goście w strefach</a> (kolumna „Wielkość strefy”; dochodzą wydarzenia w mieście i upodobania grup klientów).
    <br>4. <b>Twój udział</b> – klienci wybierają między lokalami z tym daniem a „obiadem gdzie indziej” (liczy się jak jeden lokal):
    sam w strefie ≈ ½, 1 rywal ≈ ${licz(UDZIAL.rywal1, 1)}, 2 rywali ≈ ${licz(UDZIAL.rywal2, 1)}. Niższa cena, lepsza jakość i opinie – więcej.
    <details><summary>Więcej o udziale</summary>Udział = atrakcyjność Twojego lokalu ÷ (obiad gdzie indziej + suma atrakcyjności wszystkich lokali z daniem); „obiad gdzie indziej” ma atrakcyjność ${licz(v.popyt.opcja_zewnetrzna, 1)}, lokal o przeciętnej cenie i jakości – około 1.
    Przy równych cenie i jakości wychodzi ½ / ⅓ / ¼, ale model dolicza lokale miasta spoza gry (ich liczba jest różna w strefach: w Centrum
    i na Starym Mieście najwięcej) i zróżnicowane grupy klientów, więc w pomiarach jest to ok. 0,4–0,6 sam, 0,3–0,45 z jednym rywalem, 0,25–0,35 z dwoma.
    Lokal przyciąga też klientów z sąsiednich stref – to dodatkowy plus, którego wzór nie liczy.</details>
    <br>5. <b>Rozruch</b> – nowy lokal: ${licz(Math.round(start * 100))}% w 1. tygodniu sprzedaży, +${licz(Math.round(przyrost * 100))} p.p. co tydzień.
    <br><br><i>Przykład (${esc(nazwaDania)}, ${esc(nazwa)}, 1. tydzień sprzedaży):</i> ${licz(u.popyt_roczny)} ÷ ${OKRES.rund_w_roku} × ${licz(sez, 2)} × ${licz(strefa.wielkosc, 2)} × ½ × ${licz(start, 1)} ≈ <b>${licz(wynik)}</b>.
    <br>Wynik wpisz w pole „Prognozowany popyt”. Z prognozy wychodzą zakupy składników (${A("dostawcy")}hurtownie i dyskonty</a>: „Wpisz wg prognozy”) i potrzebna obsada – za mała to utracona sprzedaż, za duża to zmarnowany towar.`;
}

// cena, rabat i podpowiedzi przy wybranym daniu (dawniej osobna część „Sprzedaż”)
function cenaDania(v, kat, klucz, edycja) {
  const u = kat.uslugi[klucz];
  if (!sprzedazOtwarta(v)) {
    return `<span class="podpowiedz">Cenę ustalisz od rundy, w której zaczyna się sprzedaż – na start danie ma cenę preferowaną ${zl(u.cena_preferowana)}.</span>`;
  }
  const c = cenyLokalu(v, lokalWybrany(v))[klucz] || { cena: u.cena_preferowana, rabat: 0 }, wd = widelki(kat, klucz);
  const inni = Object.entries(v.rynek?.ceny?.[klucz] || {}).filter(([f]) => f !== v.firma).map(([, x]) => x);
  const srednia = inni.length ? zl2(inni.reduce((a, b) => a + b, 0) / inni.length) : null, dla = zl2(c.cena - c.rabat);
  const braki = (v.stan.gotowe_uslugi[klucz] || []).filter((b) => !b.includes("włączona"));
  const dis = edycja ? "" : "disabled";
  return `<div class="pola-dania">
      <label class="pole">Cena (zł)<input type="number" min="${wd ? wd.min : 1}" ${wd ? `max="${wd.max}"` : ""} step="0.5" value="${c.cena}" data-zmiana="cena" data-u="${klucz}" ${dis}></label>
      <label class="pole">Rabat (zł)<input type="number" min="0" step="0.5" value="${c.rabat}" data-zmiana="rabat" data-u="${klucz}" ${dis}></label>
    </div>
    <span class="podpowiedz zostaw">Dla klienta <b>${dla}</b> · konkurencja ${srednia || "–"}
      ${kolko(`Klient płaci cenę minus rabat: <b>${dla}</b>, czyli ${proc((c.cena - c.rabat) / u.cena_preferowana, 0)} ceny preferowanej (${zl2(u.cena_preferowana)}).${wd ? `<br>Dozwolona cena: ${zl2(wd.min)}–${zl2(wd.max)}.` : ""}<br>Konkurencja: ${srednia ? `średnia cena rywali ${srednia}` : "brak danych – nikt inny jeszcze tego nie sprzedaje"}.`)}</span>
    ${braki.length ? `<span class="podpowiedz zostaw" style="color:var(--czerwony)">${braki.map(esc).join("; ")}</span>` : ""}
    ${braki.some((b) => b.startsWith("brak składnika")) ? `<a class="btn jasny maly" data-zakladka-k="dostawcy">Zamów składniki – Dostawy</a>` : ""}`;
}

// podpowiedź liczby: ilu chętnych miało danie w poprzedniej rundzie (tylko przy jednym lokalu – wyniki są dla całej firmy)
const ostatnia = (v, u) => {
  const s = !wieleLokali(v) && v.wyniki?.sprzedaz?.[u];
  return s ? ` W poprzedniej rundzie chętnych na to danie było <b>${licz(s.popyt)}</b>.` : "";
};

const limitNowych = (kat, r) => r === 1 ? kat.oferty.rundy.uslugi_w_rundzie_1
  : r >= kat.oferty.rundy.nowe_uslugi_od_rundy ? kat.oferty.rundy.nowe_uslugi_na_runde : 0;

export const oferta = {
  tytul: "Menu", tytulPelny: "Menu – dania, ceny i prognoza", ikona: "⚑", odblokowanie: "oferta",
  info: ({ v, kat }) => (v.runda === 1
    ? `Wybierz dania do menu i określ ich ${popytOkresu()}. W pierwszej rundzie można wybrać tylko ${kat.oferty.rundy.uslugi_startowe.map((u) => nazwaUslugi(kat, u)).join(", ")}.`
    : v.runda < kat.oferty.rundy.nowe_uslugi_od_rundy ? "W rundzie 2 sprzedajesz dania wybrane w rundzie 1. Nowe dania można dodawać od rundy 3."
    : `Wybierz dania do menu i określ ich ${popytOkresu()}. W każdej rundzie będzie można uruchamiać maksymalnie ${kat.oferty.rundy.nowe_uslugi_na_runde} nowe dania.`)
    + " Danie wybrane do menu jest w sprzedaży – cenę i rabat ustalasz w jego kafelku. Klient płaci cenę pomniejszoną o rabat.",
  decyzje({ v, kat, edycja }) {
    // przy kilku lokalach – menu wybranego lokalu; limit nowych dań liczony dla całej firmy (suma menu lokali)
    const wybrane = menuLokalu(v, lokalWybrany(v)), przed = v.stan_przed.oferta, r = v.runda;
    const m = miesiacSprzedazy(r);
    const limit = limitNowych(kat, r);
    const nowe = Object.keys(v.stan.oferta).filter((u) => !(u in przed)).length;
    const strefa = strefaWybranego(v);   // sprawa 4 (Poprawki 3): dania specjalne – nazwa strefy wybranego lokalu
    const okres = r === 1 ? `prognoza na ${esc(nazwaRundy(2))} – sprzedaż zaczyna się w rundzie 2` : esc(v.miesiac);
    let html = `${wieleLokali(v) ? `<div class="komunikat ok">Menu lokalu <b>${esc(nazwaLokalu(v, lokalWybrany(v).id))}</b> – prognoza popytu tylko dla tego lokalu.</div>` : ""}
      <div class="komunikat">Nowe dania w tej rundzie (cała firma): <b>${nowe} / ${limit}</b>. ${v.popyt
      ? `Prognozę popytu (${okres}) policz samodzielnie – krok po kroku w dymku ⓘ przy „Popyt roczny” w kafelku dania; wielkość stref, konkurencja i dni tygodnia są w zakładce <a data-zakladka-k="klienci">Klienci i strefy</a>.<br>Słupki w rogu kafelka to sezonowość popytu na danie: ciemny słupek – miesiąc sprzedaży, trzy jasne – kolejne miesiące (im wyższy, tym więcej chętnych).`
      : `Prognozowany popyt = popyt roczny / ${OKRES.rund_w_roku} × sezonowość (${okres}).`}</div>`;
    for (const k of kategorie(kat)) {
      const uslugi = Object.entries(kat.uslugi).filter(([, u]) => u.kategoria === k);
      html += `<div class="pasek">${k}</div><div class="siatka kolumny3">`;
      for (const [klucz, u] of uslugi) {
        const jest = klucz in wybrane;
        const odR = odRundyDania(v, kat, klucz), nazwa = nazwaUslugi(kat, klucz, strefa), spec = danieSpecjalne(klucz);
        const dozwolona = (r > 1 || kat.oferty.rundy.uslugi_startowe.includes(klucz)) && (klucz in przed || klucz in v.stan.oferta || nowe < limit || jest)
          && (r >= odR || klucz in przed);
        const baza = prognozaDania(v, kat, klucz, m);
        // czemu „Wybierz” jest wyszarzone – nowe dania dopiero od rundy nowe_uslugi_od_rundy albo limit wyczerpany
        const od = kat.oferty.rundy.nowe_uslugi_od_rundy;
        const czemu = !edycja || dozwolona || jest ? ""
          : r < odR ? `od ${OKRES.dopelniacz} ${odR}`   // sprawa 4: danie specjalne strefy przed odblokowaniem
          : r < od && !(r === 1 && kat.oferty.rundy.uslugi_startowe.includes(klucz)) ? `od ${OKRES.dopelniacz} ${od}` : "limit nowych dań wyczerpany";
        html += `<div class="kafel ${jest ? "wybrany" : ""} ${spec ? "specjalne" : ""}">
          <div class="kg"><span>${esc(nazwa)}${spec ? `<br><span class="danie-specjalne" title="${esc(u.opis || "")}">★ danie specjalne strefy</span> ` : ""}</span>${sezonSlupki(u, m)}</div>
          <div class="kt">
            <div class="wiersz"><span>Popyt roczny ${kolko(jakPrognoza(v, kat, u, m, nazwa))}</span><span>${licz(u.popyt_roczny)} porcji</span></div>
            <div class="wiersz"><span>Preferowana cena</span><span>${zl(u.cena_preferowana)}</span></div>
            <div class="wiersz"><span>Czas przygotowania</span><span>${Math.round(u.godziny_prowadzacego * 600) / 10} min</span></div>
            <div class="wiersz"><span>Czas obsługi przy kasie</span><span>${Math.round(u.godziny_kasy * 600) / 10} min</span></div>
            ${u.grupa > 1 ? `<div class="wiersz"><span>Porcji naraz</span><span>${u.grupa}</span></div>` : ""}
            <div class="wiersz"><span>Przygotowuje</span><span>${esc(u.prowadzacy)}</span></div>
          </div>
          <div class="kd">
            ${jest ? `<button class="btn stan-wybrano" data-akcja="usluga" data-u="${klucz}" ${edycja ? "" : "disabled"} title="Kliknij, żeby usunąć danie z menu">✓ Wybrano</button>`
                   : `<button class="btn czarny" data-akcja="usluga" data-u="${klucz}" ${edycja && dozwolona ? "" : "disabled"}>Wybierz</button>${czemu ? `<span class="podpowiedz">${czemu}</span>` : ""}`}
            <a class="link-szczegoly" role="button" tabindex="0" data-akcja="szczegoly-uslugi" data-u="${klucz}">Więcej szczegółów</a>
            ${jest ? `<label class="pole">Prognozowany popyt (na ${OKRES.mianownik})
              <input type="number" min="0" step="1" value="${wybrane[klucz] || ""}" placeholder="${v.popyt ? "wg wzoru z ⓘ" : baza}" data-zmiana="prognoza" data-u="${klucz}" ${edycja ? "" : "disabled"}>
              <span class="podpowiedz zostaw">Na tej liczbie opierają się plan zakupów składników („Wpisz wg prognozy”), lista błędów i potrzebna obsada.${ostatnia(v, klucz)}
                ${v.popyt ? `Wg wzoru: popyt roczny ÷ ${OKRES.rund_w_roku} × sezonowość × strefa × udział × rozruch (ⓘ przy „Popyt roczny”)` : `Wg wzoru: ${licz(u.popyt_roczny)} / ${OKRES.rund_w_roku} × ${u.sezonowosc[m]} ≈ ${baza}`}</span></label>
              ${cenaDania(v, kat, klucz, edycja)}` : ""}
          </div></div>`;
      }
      html += `</div>`;
    }
    return html;
  },
  wyniki({ v, kat }) {
    const sp = v.wyniki?.sprzedaz || {};
    const w = Object.entries(sp).map(([u, s]) => [esc(nazwaUslugi(kat, u)), licz(s.prognoza), licz(s.popyt),
      s.popyt > s.prognoza ? `<span class="plus">+${licz(s.popyt - s.prognoza)}</span>` : `<span class="minus">${licz(s.popyt - s.prognoza)}</span>`]);
    const S = Object.values(sp), prog = S.reduce((a, s) => a + s.prognoza, 0), pop = S.reduce((a, s) => a + s.popyt, 0);
    const lead = !S.length ? brakWynikow("Porównanie prognozy z popytem pojawi się, gdy lokal zacznie sprzedawać.") : podsumowanie(
      `Prognozowaliście łącznie <b>${licz(prog)}</b> porcji, a chętnych było <b>${licz(pop)}</b> – ${pop >= prog ? "popyt był wyższy lub równy prognozie" : "prognoza była zawyżona"} (różnica ${pop >= prog ? "+" : ""}${licz(pop - prog)}).`,
      pop >= prog * 0.8 ? "ok" : "uwaga");
    return `${lead}<div class="wykres"><canvas id="w-prognoza"></canvas></div>
      ${zwinTabela("Prognozowany popyt vs popyt", ["Danie", `Prognozowany popyt (na ${OKRES.mianownik})`, "Popyt", "Różnica"], w, { klasy: ["l"], otwarte: true })}`;
  },
  po({ v, kat }, tryb) {
    if (tryb !== "wyniki") return;
    const sp = v.wyniki?.sprzedaz || {};
    const u = Object.keys(sp);
    wykres("w-prognoza", "bar", u.map((x) => nazwaUslugi(kat, x)), [{ label: "Prognozowany popyt", data: u.map((x) => sp[x].prognoza) },
      { label: "Popyt", data: u.map((x) => sp[x].popyt) }]);
  },
  akcje: {
    "szczegoly-uslugi": (el, { v, kat }) => {
      const u = kat.uslugi[el.dataset.u], nazwa = nazwaUslugi(kat, el.dataset.u, strefaWybranego(v));
      const sprzet = u.sprzet.map((n) => [esc(n), esc(kat.oferty.stanowiska.typy.kuchnia.kto), "100%", ...[1, 2, 3].map((q) => zl2(kat.sprzet[n].ceny[q]))]);
      const pensje = [[esc(u.prowadzacy), "100%", ...["niska", "srednia", "wysoka"].map((q) => zl2(u.pensje_rynkowe[q]))]];
      const zasoby = Object.entries(u.zasoby).map(([n, ile]) => {
        const z = kat.zasoby[n];
        return [esc(n), `${ile} ${z.jednostka}`, `${z.typ_opakowania} (${licz(z.opakowanie)} ${z.jednostka})`,
          ...[1, 2, 3].map((q) => zl(z.srednie_ceny[q], true))];
      });
      okno(`Wymagania dotyczące dania – ${esc(nazwa)}`,
        tabela("Sprzęt", ["Nazwa", "Dla", "Zapotrzebowanie", "★ Niska", "★★ Średnia", "★★★ Wysoka"], sprzet, { klasy: ["l"] })
        + tabela("Pracownicy", ["Typ", "Zaangażowanie", "Wynagrodzenie ★", "★★", "★★★"], pensje, { klasy: ["l"] })
        + tabela("Składniki na porcję", ["Nazwa", "Zużycie na porcję", "Opakowanie", "Średnia cena ★", "★★", "★★★"], zasoby, { klasy: ["l"] })
        + `<p class="podpowiedz">${esc(kat.oferty.stanowiska.typy.kasa.kto)}: ${u.godziny_kasy} h na klienta, pracownik z kompletem sprzętu
           (${kat.sprzet_kasy.map(esc).join(", ")}). Dokładne ceny składników są w hurtowniach i dyskontach na mapie.</p>`);
    },
    usluga: async (el, c) => {
      const u = el.dataset.u, r = c.v.runda;
      const of = { ...menuLokalu(c.v, lokalWybrany(c.v)) };
      if (u in of) delete of[u];
      else {
        const limit = limitNowych(c.kat, r), odR = odRundyDania(c.v, c.kat, u);
        if (r < odR && !(u in c.v.stan_przed.oferta)) return toast(`${nazwaUslugi(c.kat, u, strefaWybranego(c.v))}: to danie można wprowadzić do menu od ${OKRES.dopelniacz} ${odR}.`);
        // limit dotyczy przyrostu liczby dań firmy (usunięte danie zwalnia miejsce na nowe; danie z innego lokalu – bez limitu)
        const przyrost = Object.keys(c.v.stan.oferta).length - Object.keys(c.v.stan_przed.oferta).length;
        if (!(u in c.v.stan_przed.oferta) && !(u in c.v.stan.oferta) && przyrost >= limit) return toast(`W tej rundzie liczba dań może wzrosnąć najwyżej o ${limit}.`);
        of[u] = prognozaDania(c.v, c.kat, u, miesiacSprzedazy(r));
      }
      // wybrane danie od razu w sprzedaży – po cenie preferowanej, dopóki drużyna jej nie zmieni
      const ceny = { ...cenyLokalu(c.v, lokalWybrany(c.v)) };
      const nowaCena = u in of && !ceny[u] && sprzedazOtwarta(c.v);
      if (nowaCena) ceny[u] = { cena: c.kat.uslugi[u].cena_preferowana, rabat: 0 };
      await c.zmien((d) => {
        zapiszWLokalu(d, c.v, "oferta", of);
        if (nowaCena) zapiszWLokalu(d, c.v, "sprzedaz", ceny);
      });
    },
  },
  zmiany: {
    prognoza: async (el, c) => c.zmien((d) => {
      zapiszWLokalu(d, c.v, "oferta", { ...menuLokalu(c.v, lokalWybrany(c.v)), [el.dataset.u]: Math.max(0, Math.round(+el.value || 0)) });
    }),
  },
};

export { JAK, gw };
