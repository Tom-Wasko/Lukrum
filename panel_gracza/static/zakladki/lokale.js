// Lokale: najem albo kupno lokalu / działki na mapie miasta (gra z lokalami, dane/mapa/*.yaml).
import { esc, licz, zamknijOkno, naOkres, naRunde, nazwaFirmy, OKRES, podsumowanie, proc, tabela, zl, zwinTabela, zl2 } from "./wspolne.js";

const TYPY = { gotowy: "gotowy", niewyposazony: "do urządzenia", dzialka: "działka" };
const FORMY = { najem: "najem", kupno: "własność" };

export const nazwaStrefy = (kat, s) => kat.mapa?.strefy[s]?.nazwa ?? s;
const lokalMapy = (kat, id) => kat.mapa.lokale.find((l) => l.id === id);
export const wybranyLokal = (d) => d.lokal?.id ? d.lokal : null;

// koszt lokali w rundzie: czynsz najmu + media działających lokali (w miejsce stałego kosztu utrzymania lokalu)
export const kosztLokali = (v) => (v.lokale?.moje || []).reduce((s, l) =>
  s + (l.forma === "najem" ? naRunde(l.czynsz) : 0) + (l.dziala ? naRunde(l.utrzymanie) : 0), 0);

// miejsca na stanowiska: lokale działające i te w ostatniej rundzie budowy / urządzania (już można je wyposażyć)
export function miejscaLokali(v, typ) {
  const dzialajace = (v.lokale?.moje || []).filter((l) => l.dziala || l.wyposazanie);
  return { wszystkie: dzialajace.reduce((s, l) => s + l.miejsca[typ], 0), zajete: dzialajace.reduce((s, l) => s + l.zajete[typ], 0) };
}

function status(l) {
  if (l.dziala) return `<span class="pigulka ok">działa</span>`;
  return `<span class="pigulka inf">${l.typ === "dzialka" ? "budowa" : "urządzanie"} do rundy ${l.dziala_od}</span>`
    + (l.wyposazanie ? ` <span class="pigulka ok" title="Kup stanowiska i sprzęt (Inwestycje) i zatrudnij ludzi (Kadry) – lokal ruszy od razu gotowy">można wyposażać</span>` : "");
}

// opis lokalu z mapy (kafel w ofercie i okno na mapie)
export function opisLokalu(kat, lok) {
  const zestaw = lok.zestaw ? kat.mapa.zestawy[lok.zestaw] : null;
  const w = (a, b) => `<div class="wiersz"><span>${a}</span><span>${b}</span></div>`;
  return `<p class="podpowiedz">${esc(lok.adres)} · ${esc(nazwaStrefy(kat, lok.strefa))}</p><p>${esc(lok.opis)}</p>`
    + w("Metraż", lok.typ === "dzialka" ? `${licz(lok.dzialka_m2)} m² gruntu, lokal ${licz(lok.metraz)} m²` : `${licz(lok.metraz)} m²`)
    + w("Miejsca na stanowiska", `kuchnia ${lok.miejsca.kuchnia}, kasa ${lok.miejsca.kasa}`)
    + (zestaw ? w("Sprzęt w lokalu", esc(zestaw.nazwa)) : lok.typ === "niewyposazony" ? w("Sprzęt", "brak – trzeba kupić") : "")
    + (lok.czynsz != null ? w("Czynsz", `${zl(naRunde(lok.czynsz))}${naOkres()}`) : "")
    + (lok.cena != null ? w(lok.typ === "dzialka" ? "Cena działki" : "Cena kupna", zl(lok.cena)) : "")
    + (lok.adaptacja ? w("Adaptacja (jednorazowo)", zl(lok.adaptacja)) : "")
    + (lok.koszt_budowy ? w("Budowa", `${zl(lok.koszt_budowy)} w ${lok.budowa_rund} ratach`) : "")
    + w("Media i utrzymanie", `${zl(naRunde(lok.utrzymanie))}${naOkres()}`)
    + jakUruchomic(kat, lok);
}

// lokal bez sprzętu: kiedy i jak go wyposażyć, żeby od pierwszej rundy działania sprzedawał
function jakUruchomic(kat, lok) {
  if (lok.typ === "gotowy") return "";
  const rund = lok.typ === "dzialka" ? lok.budowa_rund : kat.mapa.zasady.urzadzanie_rund;
  const kiedy = rund > 1 ? `w ostatniej rundzie ${lok.typ === "dzialka" ? "budowy" : "urządzania"} (${rund}. po wzięciu)` : "już w rundzie wzięcia";
  return `<p class="podpowiedz"><b>Jak uruchomić:</b> ${lok.typ === "dzialka" ? `budowa trwa ${rund} ${rund === 1 ? "rundę" : "rundy"} – lokal nie sprzedaje i nie płaci mediów, płacisz raty budowy. ` : `urządzanie trwa ${rund === 1 ? "1 rundę" : `${rund} rundy`}. `}`
    + `Lokal jest pusty: ${kiedy} kup stanowiska kuchni i kasy oraz sprzęt na stanowiska (Park handlowy ▸ Stanowiska i sprzęt) i zatrudnij pracowników (Miasteczko akademickie ▸ Rynek pracy) – w pierwszej rundzie działania lokal od razu sprzedaje.</p>`;
}

// przyciski Wynajmij / Kup (okno mapy i kafel oferty)
export function przyciskiLokalu(v, d, lok, edycja) {
  const wyb = wybranyLokal(d);
  const zablokowany = !edycja || v.runda < v.lokale.nowy_od;
  return Object.entries(lok.wejscie || {}).map(([forma, koszt]) => {
    const to = wyb && wyb.id === lok.id && wyb.forma === forma;
    const napis = `${forma === "najem" ? "Wynajmij" : "Kup"} – ${zl(koszt)}`;
    const opis = forma === "najem" ? `Płatne w tej rundzie: kaucja${lok.adaptacja ? " i adaptacja" : ""}` : `Płatne w tej rundzie: cena${lok.adaptacja ? " i adaptacja" : ""}`;
    return to ? `<button class="btn zielony" data-akcja="lokal-wybierz" data-id="" ${edycja ? "" : "disabled"}>✓ Wybrano (${FORMY[forma]}) – anuluj</button>`
      : `<button class="btn ${forma === "najem" ? "czarny" : "jasny"}" data-akcja="lokal-wybierz" data-id="${esc(lok.id)}" data-forma="${forma}" title="${opis}" ${zablokowany ? "disabled" : ""}>${napis}</button>`;
  }).join("");
}

// Licytacja jawna (silnik/nieruchomosci/licytacja_jawna.py): najwyższe oferty innych drużyn z bieżących szkiców
export const jawna = (v, rodzaj, id) => v.licytacja_jawna?.[rodzaj]?.[id] ?? null;
export const minOferty = (v, rodzaj, id, forma) => jawna(v, rodzaj, id)?.min?.[forma];
export function infoLicytacji(v, rodzaj, id) {
  if (!v.licytacja_jawna) return "";
  const j = jawna(v, rodzaj, id), l = j?.lider;
  if (!j) return `<div class="podpowiedz">Brak ofert</div>`;
  const oferta = l ? `${zl(l.kwota)}${l.forma === "najem" ? " (czynsz)" : " (cena)"} – ${esc(l.firma)}` : "";
  const min = Object.entries(j.min).map(([f, k]) => `${f === "najem" ? "czynsz" : "cena"} ${zl(k)}`).join(", ");
  return `<div class="podpowiedz">${j.prowadzisz ? `<b>Prowadzisz</b>${l ? ` – najwyższa oferta innych: ${oferta}` : " – brak innych ofert"}`
    : `Najwyższa oferta: <b>${oferta}</b>`}${l ? `<br>Żeby ${j.prowadzisz ? "nie dać się przebić" : "przebić"} – minimalna kwota przebicia: ${min}.` : ""}</div>`;
}
// oferty, które ktoś przebił między dwoma widokami: komunikaty dla toastu („<drużyna> przebiła Twoją ofertę na <lokal>”)
export function przebiteOferty(przed, po, kat) {
  const wynik = [];
  for (const rodzaj of ["lokal", "przejecie"]) {
    for (const [id, x] of Object.entries(przed?.licytacja_jawna?.[rodzaj] || {})) {
      const t = po?.licytacja_jawna?.[rodzaj]?.[id];
      if (x.prowadzisz && t && !t.prowadzisz && t.lider)
        wynik.push(`${t.lider.firma} przebiła Twoją ofertę na ${kat.mapa.lokale.find((l) => l.id === id)?.nazwa ?? id}.`);
    }
  }
  return wynik;
}

// szacunek klientów nowego lokalu 2★ w strefie (popyt strefowy, zakładka Klienci i strefy)
const potencjal = (v, lok) => v.popyt?.strefy[lok.strefa]
  ? `<div class="wiersz"><span>Klienci – szacunek${naOkres()}</span><span>≈ ${licz(v.popyt.strefy[lok.strefa].potencjal)}</span></div>` : "";

// sortowanie oferty lokali; brak wartości (np. czynsz lokalu na sprzedaż) – na koniec
const _albo = (x) => x ?? Infinity;
const SORT_OFERTY = {
  wejscie: { nazwa: "najtańsze wejście", klucz: (v, l) => _albo(Math.min(...Object.values(l.wejscie || {}))) },
  czynsz: { nazwa: "najniższy czynsz", klucz: (v, l) => _albo(l.czynsz) },
  metraz: { nazwa: "największy metraż", klucz: (v, l) => -l.metraz },
  klienci: { nazwa: "najwięcej klientów", klucz: (v, l) => -(v.popyt?.strefy[l.strefa]?.potencjal ?? 0) },
};

function kafelOferty(v, kat, d, lok, edycja) {
  const wyb = wybranyLokal(d)?.id === lok.id;
  return `<div class="kafel ${wyb ? "wybrany" : ""}"><div class="kg">${esc(lok.nazwa)}<span class="pigulka">${TYPY[lok.typ]}</span></div>
    <div class="kt">${opisLokalu(kat, lok)}${potencjal(v, lok)}${infoLicytacji(v, "lokal", lok.id)}</div><div class="kd">${przyciskiLokalu(v, d, lok, edycja)}</div></div>`;
}

function mojeLokale(kat, moje, zwijane = false) {
  if (!moje.length) return "";
  return (zwijane ? zwinTabela : tabela)("Twoje lokale", ["Lokal", "Strefa", "Forma", "Status", "Kuchnia", "Kasa", `Koszt${naOkres()}`],
    moje.map((l) => [`${esc(l.nazwa)}<div class="podpowiedz">${esc(l.adres)}</div>`, esc(nazwaStrefy(kat, l.strefa)), FORMY[l.forma], status(l),
      `${l.zajete.kuchnia} / ${l.miejsca.kuchnia}`, `${l.zajete.kasa} / ${l.miejsca.kasa}`,
      zl2((l.forma === "najem" ? naRunde(l.czynsz) : 0) + (l.dziala ? naRunde(l.utrzymanie) : 0))]), { klasy: ["l", "l", "l", "l"], ...(zwijane ? { otwarte: true } : {}) });
}

export const lokale = {
  tytul: "Do wynajęcia", tytulPelny: "Biuro „Klucz” – najem i kupno", ikona: "lokale", odblokowanie: (v) => !!v.lokale, ukryta: (v) => !v.lokale,
  info: (c) => `Wybierz lokal na mapie miasta: wynajmij (kaucja ${c.kat.mapa.zasady.kaucja_miesiecy} × czynsz, potem czynsz co ${OKRES.mianownik}) albo kup.
    Lokal gotowy działa od razu, lokal do urządzenia – od następnej rundy, działkę trzeba zabudować. Stanowiska stoją w lokalach – ich liczbę ogranicza liczba miejsc.
    Kolejny lokal można wziąć co ${c.kat.mapa.zasady.nowy_lokal_co_rund} rundy.`,
  decyzje({ v, kat, d, edycja }) {
    const L = v.lokale;
    const wyb = wybranyLokal(d);
    const strefa = lokale.filtr && kat.mapa.strefy[lokale.filtr] ? lokale.filtr : "";
    let html = `<div class="pasek ciemny"><span>Twoje lokale: <span class="kwota">${L.moje.length}</span></span>
      <span>Koszt lokali: <span class="kwota">${zl(kosztLokali(v))}</span>${naOkres()}</span>
      <span>${v.runda < L.nowy_od ? `Kolejny lokal od rundy <span class="kwota">${L.nowy_od}</span>` : "Możesz wziąć lokal w tej rundzie"}</span></div>`
      + (L.odpoczynek ? `<p class="podpowiedz">${esc(L.odpoczynek)}</p>` : "");
    if (L.decyzja && L.decyzja.przyjety === false) html += `<div class="komunikat">${esc(L.decyzja.powod)}</div>`;
    if (wyb) {
      const lok = lokalMapy(kat, wyb.id);
      const P = v.przejecia, wyw = wyb.forma === "najem" ? lok?.czynsz : lok?.cena;
      const licytuj = P && v.runda >= P.licytacje_od_rundy && wyw != null;
      const min = minOferty(v, "lokal", wyb.id, wyb.forma) ?? wyw, moja = wyb.oferta ?? wyw, j = jawna(v, "lokal", wyb.id);
      html += `<div class="komunikat ok">Wybrany lokal: <b>${esc(lok?.nazwa ?? wyb.id)}</b> (${FORMY[wyb.forma] ?? wyb.forma}).
        Licytacja jest jawna: poniżej widać najwyższą ofertę innych drużyn. Nową ofertę trzeba podnieść o co najmniej ${proc(v.licytacja_jawna?.krok ?? 0, 0)},
        a wygrywa najwyższa oferta w chwili zamknięcia rundy (przy remisie – losowanie). Boty składają oferty dopiero przy zamknięciu rundy – ich ofert nie widać.
        ${infoLicytacji(v, "lokal", wyb.id)}
        ${j && !j.prowadzisz && j.lider && moja < min ? `<div class="komunikat">Ta oferta nie wystarczy: ${esc(j.lider.firma)} prowadzi. Podnieś ją do co najmniej ${zl(min)}.</div>` : ""}
        ${licytuj ? `<div style="margin-top:8px"><label>Twoja oferta (${wyb.forma === "najem" ? "czynsz za miesiąc" : "cena"}, wywoławcza ${zl(wyw)}, minimum przebicia ${zl(min)}, najwyżej ${P.oferta_max} ×):
          <input type="number" min="${min}" max="${wyw * P.oferta_max}" step="1" value="${moja}" data-zmiana="lokal-oferta"
            style="width:110px" ${edycja ? "" : "disabled"}></label></div>`
          : P ? `<div class="podpowiedz">Przebijać cenę wywoławczą można od rundy ${P.licytacje_od_rundy}.</div>` : ""}</div>`;
    }
    html += mojeLokale(kat, L.moje);
    const sortuj = SORT_OFERTY[lokale.sort] ? lokale.sort : "";
    const oferta = L.oferta.filter((l) => !strefa || l.strefa === strefa);
    if (sortuj) oferta.sort((a, b) => SORT_OFERTY[sortuj].klucz(v, a) - SORT_OFERTY[sortuj].klucz(v, b));
    const opcje = Object.entries(kat.mapa.strefy).map(([k, s]) =>
      `<option value="${k}" ${k === strefa ? "selected" : ""}>${esc(s.nazwa)} (${L.oferta.filter((l) => l.strefa === k).length})</option>`).join("");
    html += `<div class="pasek">Wolne lokale w mieście</div>
      <div class="wiersz" style="gap:12px;align-items:center;margin-bottom:14px"><label>Strefa:
        <select data-zmiana="lokal-strefa"><option value="">wszystkie (${L.oferta.length})</option>${opcje}</select></label>
        <label>Sortuj:
        <select data-zmiana="lokal-sort"><option value="">domyślnie</option>${Object.entries(SORT_OFERTY).map(([k, o]) =>
          `<option value="${k}" ${k === sortuj ? "selected" : ""}>${o.nazwa}</option>`).join("")}</select></label>
        <a class="btn jasny maly" data-zakladka-k="mapa">Pokaż na mapie</a></div>`;
    if (!oferta.length) return html + `<p class="podpowiedz">Brak wolnych lokali${strefa ? " w tej strefie" : ""}.</p>`;
    // grupy wg dzielnic (kolejność kat.mapa.strefy); sortowanie działa w obrębie grupy (oferta jest już posortowana)
    for (const [k, s] of Object.entries(kat.mapa.strefy)) {
      const w = oferta.filter((l) => l.strefa === k);
      if (!w.length) continue;
      html += `<h3 class="strefa-tytul"><span class="kropka" style="background:${esc(s.kolor)}"></span>${esc(s.nazwa)}
        <span class="podpowiedz">${esc(s.klienci)}</span></h3>
        <div class="siatka kolumny3">${w.map((l) => kafelOferty(v, kat, d, l, edycja)).join("")}</div>`;
    }
    return html;
  },
  wyniki({ v, kat }) {
    const moje = v.wyniki?.lokale || [];
    const zaj = Object.entries(v.rynek?.lokale || {});
    const wiersze = zaj.map(([id, f]) => [lokalMapy(kat, id), f]).filter(([l]) => l)
      .sort(([a], [b]) => a.strefa.localeCompare(b.strefa))
      .map(([l, f]) => [esc(nazwaStrefy(kat, l.strefa)), esc(l.nazwa), TYPY[l.typ], `${f === v.firma ? "<b>" : ""}${esc(nazwaFirmy(v, f))}${f === v.firma ? "</b>" : ""}`]);
    const dec = v.wyniki?.lokal_decyzja;
    const decyzja = dec?.id ? `<div class="komunikat ${dec.przyjety ? "ok" : ""}">${dec.przyjety
      ? `Lokal ${esc(lokalMapy(kat, dec.id)?.nazwa ?? dec.id)} – przydzielony (${FORMY[dec.forma]}), działa od rundy ${dec.dziala_od}.`
      : `Lokal nie został przydzielony: ${esc(dec.powod)}`}</div>` : "";
    const dziala = moje.filter((l) => l.dziala).length, koszt = moje.reduce((a, l) => a + (l.forma === "najem" ? naRunde(l.czynsz) : 0) + (l.dziala ? naRunde(l.utrzymanie) : 0), 0);
    const lead = podsumowanie(moje.length ? [`Firma ma ${moje.length} ${moje.length === 1 ? "lokal" : moje.length < 5 ? "lokale" : "lokali"}, w tym ${dziala} działający${dziala === 1 ? "" : "ch"}.`,
      `Koszt lokali w tej rundzie to ${zl(koszt)}.`] : "Firma nie miała lokalu w tej rundzie.");
    return lead + decyzja + (mojeLokale(kat, moje, true) || "")
      + zwinTabela("Zajęte lokale w mieście", ["Strefa", "Lokal", "Rodzaj", "Firma"], wiersze, { klasy: ["l", "l", "l", "l"] });
  },
  akcje: {
    "lokal-wybierz": (el, c) => {
      zamknijOkno();
      // gdy inna drużyna już prowadzi – od razu minimalne przebicie (inaczej zapis zostałby odrzucony)
      const min = el.dataset.id && jawna(c.v, "lokal", el.dataset.id)?.lider ? minOferty(c.v, "lokal", el.dataset.id, el.dataset.forma) : null;
      return c.zmien((d) => { d.lokal = el.dataset.id ? { id: el.dataset.id, forma: el.dataset.forma, ...(min ? { oferta: min } : {}) } : null; });
    },
  },
  zmiany: {
    "lokal-strefa": (el, c) => { lokale.filtr = el.value; c.rysuj(); },
    "lokal-sort": (el, c) => { lokale.sort = el.value; c.rysuj(); },
    "lokal-oferta": (el, c) => c.zmien((d) => { d.lokal = { ...d.lokal, oferta: Number(el.value) }; }),
  },
};
